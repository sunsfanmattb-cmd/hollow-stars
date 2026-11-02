"""Finds (and with --apply removes) CSS declarations that can never take effect: a later rule in the same @media/@supports
context with the identical selector sets the same property (and isn't beaten by !important). Also finds @keyframes that a
later @keyframes of the same name replaces. Files are read in the order index.html links them.

Conservative on purpose: only exact property names (no shorthand/longhand reasoning), only across rules (fallback pairs
inside one rule are kept), and only when the overriding value is supported (checked in Chromium with CSS.supports via
--verify, which writes the candidate list the --apply step uses).

Usage: python3 tools/css_dedupe.py report | verify | apply
"""
import re, sys, json, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = re.findall(r'href="(css/[^"]+\.css)"', (ROOT / 'index.html').read_text())
CAND = ROOT / 'tools' / '.css_dedupe.json'

def parse(text):
    """-> list of nodes: ('rule', ctx, selector, [(prop, value, important, start, end)], start, end) and ('kf', ctx, name, start, end)"""
    out, i, n = [], 0, len(text)
    def skip_ws(i):
        while i < n:
            if text.startswith('/*', i): i = text.index('*/', i) + 2
            elif text[i].isspace(): i += 1
            else: break
        return i
    def block_end(i):  # i at '{' -> index after matching '}'
        d = 0
        while i < n:
            if text.startswith('/*', i): i = text.index('*/', i) + 2; continue
            c = text[i]
            if c in '"\'':
                j = i + 1
                while text[j] != c: j += 2 if text[j] == '\\' else 1
                i = j + 1; continue
            if c == '{': d += 1
            elif c == '}':
                d -= 1
                if d == 0: return i + 1
            i += 1
        raise ValueError('unbalanced')
    def decls(a, b):
        res, i = [], a
        while i < b:
            i = skip_ws(i)
            if i >= b: break
            j, par, q = i, 0, None
            while j < b:
                c = text[j]
                if q:
                    if c == '\\': j += 1
                    elif c == q: q = None
                elif text.startswith('/*', j): j = text.index('*/', j) + 1
                elif c in '"\'': q = c
                elif c == '(': par += 1
                elif c == ')': par -= 1
                elif c == ';' and par == 0: break
                j += 1
            seg = text[i:j]
            if ':' in seg:
                p, v = seg.split(':', 1); v = re.sub(r'/\*.*?\*/', '', v, flags=re.S).strip()
                imp = bool(re.search(r'!\s*important\s*$', v)); v = re.sub(r'!\s*important\s*$', '', v).strip()
                res.append((p.strip().lower(), v, imp, i, min(j + 1, b)))
            i = j + 1
        return res
    def walk(a, b, ctx):
        i = a
        while i < b:
            i = skip_ws(i)
            if i >= b: break
            j = text.index('{', i) if '{' in text[i:b] else b
            semi = text.find(';', i, j)
            if text[i] == '@' and semi != -1:  # @import / @charset
                i = semi + 1; continue
            head = re.sub(r'/\*.*?\*/', '', text[i:j], flags=re.S).strip(); e = block_end(j)
            if head.startswith('@keyframes') or head.startswith('@-webkit-keyframes'):
                out.append(('kf', ctx, head, i, e))
            elif head.startswith('@media') or head.startswith('@supports'):
                walk(j + 1, e - 1, ctx + (re.sub(r'\s+', ' ', head),))
            elif head.startswith('@'):
                pass
            else:
                sel = re.sub(r'\s+', ' ', head)
                out.append(('rule', ctx, sel, decls(j + 1, e - 1), i, e))
            i = e
    walk(0, n, ())
    return out

def split_sel(sel):
    parts, d, cur = [], 0, ''
    for c in sel:
        if c in '([': d += 1
        elif c in ')]': d -= 1
        if c == ',' and d == 0: parts.append(cur.strip()); cur = ''
        else: cur += c
    parts.append(cur.strip())
    return [re.sub(r'\s*([>+~])\s*', r'\1', p) for p in parts]

def analyse():
    nodes = []
    for fi, f in enumerate(FILES):
        t = (ROOT / f).read_text()
        for nd in parse(t): nodes.append((fi, f) + nd)
    # order index = position in list (file order, then source order)
    dead, kfdead = [], []
    for a, A in enumerate(nodes):
        if A[2] == 'kf':
            nm = A[4].split()[1]
            if any(B[2] == 'kf' and B[3] == A[3] and B[4].split()[1] == nm and B[4].split()[0] == A[4].split()[0] for B in nodes[a + 1:]):
                kfdead.append({'file': A[1], 'start': A[5], 'end': A[6], 'what': A[4]})
            continue
        _, f, _, ctx, sel, ds, s0, e0 = A
        sels = split_sel(sel)
        for (p, v, imp, ds0, de0) in ds:
            if p.startswith('--'): continue
            overs = []
            for sx in sels:
                hit = None
                for B in nodes[a + 1:]:
                    if B[2] != 'rule' or B[3] != ctx or sx not in split_sel(B[4]): continue
                    for (p2, v2, imp2, *_r) in B[5]:
                        if p2 == p and (imp2 or not imp): hit = (B[1], B[4], p2, v2)
                if not hit: break
                overs.append(hit)
            if len(overs) == len(sels):
                dead.append({'file': f, 'start': ds0, 'end': de0, 'sel': sel, 'prop': p, 'val': v, 'ctx': list(ctx), 'by': [[o[0], o[1], o[3]] for o in overs]})
    return dead, kfdead

def verify(dead, kfdead):
    """keep only candidates whose every overriding value Chromium supports"""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content('<!doctype html><p>')
        pairs = sorted({(d['prop'], o[2]) for d in dead for o in d['by']})
        ok = pg.evaluate("ps=>ps.map(([p,v])=>CSS.supports(p,v))", [list(x) for x in pairs]); b.close()
    sup = {pr: k for pr, k in zip(pairs, ok)}
    keep = [d for d in dead if all(sup[(d['prop'], o[2])] for o in d['by'])]
    CAND.write_text(json.dumps({'dead': keep, 'kf': kfdead}))
    print(f'{len(keep)} of {len(dead)} dead declarations verified; {len(kfdead)} replaced @keyframes')

def apply():
    c = json.loads(CAND.read_text()); by = {}
    for d in c['dead'] + c['kf']: by.setdefault(d['file'], []).append((d['start'], d['end']))
    for f, spans in by.items():
        t = (ROOT / f).read_text()
        for s, e in sorted(spans, reverse=True):
            t = t[:s] + t[e:]
        # drop rules left empty, tidy stray separators
        prev = None
        while prev != t:
            prev = t
            t = re.sub(r'(^|[}\n;])\s*([^{}@;/]+?)\{\s*\}', r'\1', t)
            t = re.sub(r'@media[^{]+\{\s*\}', '', t)
        t = re.sub(r';\s*}', '}', t); t = re.sub(r'\{\s*;', '{', t); t = re.sub(r'\n{3,}', '\n\n', t)
        (ROOT / f).write_text(t)
        print('cleaned', f, len(spans))

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'report'
    if cmd == 'apply': apply(); sys.exit()
    dead, kf = analyse()
    if cmd == 'verify': verify(dead, kf); sys.exit()
    by = {}
    for d in dead: by[d['file']] = by.get(d['file'], 0) + 1
    print(len(dead), 'dead declarations', by, '|', len(kf), 'replaced @keyframes')
    for d in dead[:40]: print(f"  {d['file']}: {d['sel'][:60]} {{{d['prop']}:{d['val'][:40]}}}  <- {d['by'][0][0]}")
    for k in kf: print('  kf', k['file'], k['what'])

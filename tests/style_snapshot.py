"""Computed-style snapshot: visits every screen and the main overlays with seeded randomness and frozen animations, and records
the computed style of every element and its ::before/::after
(custom properties and the clock-based animation-delay are left out; long values such as data URLs are interned). Compare two snapshots to prove a CSS cleanup changed nothing.

Usage: python3 tests/style_snapshot.py URL out.json      (snapshot; style hashes per element)
       python3 tests/style_snapshot.py --diff a.json b.json [a2.json]   (a2: a second run of a's build, to ignore timing noise)
"""
import sys, json
if sys.argv[1] == '--diff':
    a, b = json.load(open(sys.argv[2])), json.load(open(sys.argv[3])); n = 0
    # optional 4th file: a second snapshot of the same build as a; whatever differs between a and it is timing noise (toasts, clocks)
    noise = set()
    if len(sys.argv) > 4:
        c = json.load(open(sys.argv[4]))
        for st in a:
            for k in set(a[st]) | set(c.get(st, {})):
                if a[st].get(k) != c.get(st, {}).get(k): noise.add((st, k))
    for st in a:
        if st not in b: print('missing state', st); n += 1; continue
        A, B = a[st], b[st]
        for k in sorted(set(A) | set(B)):
            if A.get(k) != B.get(k) and (st, k) not in noise:
                n += 1
                if n <= 60:
                    if isinstance(A.get(k), dict) and isinstance(B.get(k), dict):
                        print(st, k, {p: (A[k].get(p), B[k].get(p)) for p in set(A[k]) | set(B[k]) if A[k].get(p) != B[k].get(p)})
                    else: print(st, k, A.get(k), B.get(k))
    print(f'{n} differences'); sys.exit(1 if n else 0)

from playwright.sync_api import sync_playwright
import os
URL, OUT = sys.argv[1], sys.argv[2]
ONLY = os.environ.get('ONLY')  # e.g. ONLY=phone:title FULL=1 for a detailed look at one state
URL += ('&' if '?' in URL else '?') + 'dev=1'
SEED = "(()=>{let s=12345;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000}})()"
FREEZE = "document.getAnimations().forEach(a=>{try{a.pause();a.currentTime=0}catch(e){}})"
GRAB = r"""()=>{const out={},skip=new Set(['transition','transition-delay','transition-duration','transition-property','transition-timing-function','animation-delay']),seen=new Map();let i=0;
 for(const e of document.querySelectorAll('body *')){if(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')continue;const key=(i++)+':'+e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList.length?'.'+[...e.classList].join('.'):'');
  for(const ps of ['',':before',':after']){const cs=getComputedStyle(e,ps||null);if(ps&&(cs.content==='none'||cs.content==='normal'))continue;let t='';for(let j=0;j<cs.length;j++){const p=cs[j];if(skip.has(p)||p.startsWith('--'))continue;let v=cs.getPropertyValue(p);if(v.length>120){let id=seen.get(v);if(!id){id='#'+seen.size;seen.set(v,id)}v=id}t+=p+':'+v+';'}
   if(window.__full||(window.__fullSel&&e.matches(window.__fullSel))){const o={};for(const kv of t.split(';'))if(kv){const k=kv.indexOf(':');o[kv.slice(0,k)]=kv.slice(k+1)}out[key+ps]=o}else{let h=0x811c9dc5;for(let j=0;j<t.length;j++){h^=t.charCodeAt(j);h=Math.imul(h,16777619)}out[key+ps]=(h>>>0).toString(36)}}}
 return out}"""
states = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw, vh, tag in [(412, 860, 'phone'), (1280, 720, 'land')]:
        ctx = b.new_context(viewport={'width': vw, 'height': vh}, has_touch=vw < 900)
        ctx.add_init_script(SEED); ctx.add_init_script("try{localStorage.setItem('hsQ','high');localStorage.setItem('hs3d','off')}catch(e){}")
        pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(1500)
        pg.evaluate("for(const id of COL)COLL.own[id]=Math.max(COLL.own[id]||0,1);COLL.packs=5;saveColl()")
        if os.environ.get('FULL'): pg.evaluate("window.__full=1")
        if os.environ.get('FULLSEL'): pg.evaluate(f"window.__fullSel={json.dumps(os.environ['FULLSEL'])}")  # full detail for matching elements only
        def snap(name):
            if ONLY and f'{tag}:{name}' not in ONLY.split(','): return
            pg.wait_for_timeout(500); pg.evaluate(FREEZE); states[f'{tag}:{name}'] = pg.evaluate(GRAB)
        for s in ['title', 'pick', 'mydecks', 'packs', 'store', 'coll', 'camp', 'quests', 'gaunt', 'weekly', 'codex', 'ach', 'stats', 'howto']:
            pg.evaluate(f"show('{s}')"); snap(s)
        pg.evaluate("show('title');settingsOpen()"); snap('settings'); pg.evaluate("document.getElementById('settings').classList.remove('on')")
        pg.evaluate("show('packs');showOdds()"); snap('odds'); pg.evaluate("modalClose()")
        pg.evaluate("show('coll');showZoom(document.querySelector('#cgrid .card'),true)"); snap('zoom'); pg.evaluate("hideZoom()")
        pg.evaluate("PO.force=['v1','v2','m1','v14','v9'];show('packs');startOpen()"); snap('pack-sealed')
        pg.evaluate("document.getElementById('pwrap').click()"); pg.wait_for_timeout(1200); pg.evaluate("document.getElementById('pall').click()"); pg.wait_for_timeout(2600); snap('pack-open')
        pg.evaluate("document.getElementById('pdone').click()"); pg.wait_for_timeout(400)
        pg.evaluate("UI.speed=.12;window.__hs.demo()"); pg.wait_for_timeout(1800); snap('match')
        pg.evaluate("document.querySelector('#hand .card') && showZoom(document.querySelector('#hand .card'),true)"); snap('match-zoom'); pg.evaluate("hideZoom()")
        pg.evaluate("G.winner=0;G.over=1;gameOver()"); pg.wait_for_timeout(600); snap('over')
        ctx.close()
    b.close()
json.dump(states, open(OUT, 'w'))
print('states', len(states), 'elements', sum(len(v) for v in states.values()))

"""v2.7 intro + menu warp check: the intro shows on start, ends by itself, can be skipped with a tap, honours reduced motion,
and the warp plays on menu changes but not when a match starts.

Usage: python3 tests/intro_check.py [url-or-path-to-index.html]
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
arg = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
URL = arg if arg.startswith('http') else pathlib.Path(arg).resolve().as_uri()
URL += ('&' if '?' in URL else '?') + 'intro=1'
fails, errs = [], []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{info}]' if info and not ok else ''))
    if not ok: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 860}, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(300)
    check('intro covers the start', pg.evaluate("!!document.getElementById('intro')&&!INTRO.done"))
    pg.wait_for_timeout(2700)
    check('intro ends by itself within ~2.5 s', pg.evaluate("INTRO.done&&!document.getElementById('intro')"))
    pg.goto(URL); pg.wait_for_timeout(600)
    pg.locator('#intro').dispatch_event('pointerdown'); pg.wait_for_timeout(450)
    check('a tap skips the intro', pg.evaluate("INTRO.done&&!document.getElementById('intro')"))
    n0 = pg.evaluate("WARP.n"); pg.evaluate("show('packs')"); pg.wait_for_timeout(80)
    check('menu change plays the warp', pg.evaluate(f"WARP.n==={n0}+1&&document.getElementById('warp').classList.contains('on')"))
    pg.evaluate("show('packs')")
    check('showing the same screen again does not warp', pg.evaluate(f"WARP.n==={n0}+1"))
    pg.evaluate("UI.speed=.12;startMatch(prebuilt('v'),'c',{first:0})"); pg.wait_for_timeout(300)
    check('starting a match does not warp', pg.evaluate(f"WARP.n==={n0}+1"))
    rm = b.new_context(viewport={'width': 412, 'height': 860}, reduced_motion='reduce').new_page()
    rm.on('pageerror', lambda e: errs.append(str(e)))
    rm.goto(URL); rm.wait_for_timeout(200)
    check('reduced motion: short plain fade', rm.evaluate("document.getElementById('intro').classList.contains('rm')"))
    rm.wait_for_timeout(900)
    check('reduced motion: gone quickly', rm.evaluate("INTRO.done"))
    b.close()
for e in errs: print('JS ERROR', e)
print(f'{len(fails)} failed' if fails or errs else 'all intro checks passed')
sys.exit(1 if fails or errs else 0)

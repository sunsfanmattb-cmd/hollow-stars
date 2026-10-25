"""Checks the v1.8 polish features: haptics, stingers, end sequence, Madness spike, low Sanity,
variant effects, legendary landing. Saves screenshots to the given folder.

Usage: python3 tests/polish_check.py [index.html] [shot_dir]
"""
import sys, os, pathlib, json
from playwright.sync_api import sync_playwright

page = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
out = sys.argv[2] if len(sys.argv) > 2 else 'shots'
os.makedirs(out, exist_ok=True)
errs, fails = [], []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name, info)
    if not ok:
        fails.append(name)

STUB = """window.__vib=[];navigator.vibrate=function(p){window.__vib.push(p);return true};"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 860}, has_touch=True)
    pg.add_init_script(STUB)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(page.as_uri()); pg.wait_for_timeout(1200)

    # haptics: a full autopilot match should buzz, with no more than one buzz per batch of events
    pg.evaluate("UI.speed=0.2;UI.auto=true;startMatch(prebuilt('c'),'v',{first:0})")
    for _ in range(140):
        if pg.evaluate("document.getElementById('over').classList.contains('on')"):
            break
        pg.evaluate("if(G&&!G.over&&!UI.aiRun){runAI()}"); pg.wait_for_timeout(200)
    pg.wait_for_timeout(2500)
    vib = pg.evaluate("window.__vib.length"); log = pg.evaluate("window.__hs.HAP.log")
    check('haptics fire during a match', vib >= 5, f'{vib} buzzes, last: {log[-8:]}')
    check('match end shows end screen after sequence', pg.evaluate("document.getElementById('over').classList.contains('on')"))
    check('end overlay cleaned up', pg.evaluate("!document.getElementById('endfx')||!document.getElementById('endfx').classList.contains('on')"))
    pg.evaluate("ovHide();G=null;UI.auto=false;show('title')")

    # vibration toggle off => no buzz
    pg.evaluate("window.__vib=[];window.__hs.HAP.on=false;window.__hs.hap('lose')")
    check('vibration toggle silences buzz', pg.evaluate("window.__vib.length") == 0)
    pg.evaluate("window.__hs.HAP.on=true;window.__hs.HAP.until=0")
    pg.evaluate("settingsOpen()"); pg.wait_for_timeout(200)
    check('settings has vibration switch', pg.evaluate("!!document.getElementById('sHap')"))
    pg.screenshot(path=f'{out}/settings.png')
    pg.evaluate("document.getElementById('settings').classList.remove('on')")

    # end sequences mid-flight
    for who, w in [('win', 0), ('lose', 1)]:
        pg.evaluate("window.__hs.demo()"); pg.wait_for_timeout(500)
        pg.evaluate(f"UI.speed=1;G.winner={w};G.over=true;G.reason='san';G.ovq=1;gameOver()")
        pg.wait_for_timeout(1500); pg.screenshot(path=f'{out}/end-{who}.png')
        pg.wait_for_timeout(2600)
        check(f'{who}: end screen appears', pg.evaluate("document.getElementById('over').classList.contains('on')"))
        pg.screenshot(path=f'{out}/over-{who}.png')
        pg.evaluate("ovHide();G=null;show('title')")

    # effects below are switched off at Low quality, which a slow headless run can drop to
    pg.evaluate("setQuality('high')")
    # Madness spike + low Sanity
    pg.evaluate("window.__hs.demo()"); pg.wait_for_timeout(400)
    pg.evaluate("G.p[0].mad=8;madSet();G.fx.push({k:'mad',pi:0,n:1});G.p[0].san=3;flushFx()"); pg.wait_for_timeout(180)
    check('Madness spike overlay', pg.evaluate("document.getElementById('madk').classList.contains('on')"))
    check('low Sanity state', pg.evaluate("document.getElementById('match').classList.contains('lowsan2')"))
    check('Madness 8 heartbeat runs', pg.evaluate("getComputedStyle(document.getElementById('madv')).animationName") == 'hsCloseIn')
    pg.screenshot(path=f'{out}/madness-spike.png')

    # legendary landing
    pg.evaluate("UI.speed=1;G.p[0].mad=0;G.p[0].san=20;madSet();lowCheck()")
    pg.evaluate("(()=>{const u=mkUnit(G,0,'c22');u.ready=true;G.p[0].board.push(u);renderMatch();window.__lgp=lgCinema('c22',u.uid);window.__lguid=u.uid})()")
    pg.wait_for_timeout(700); pg.screenshot(path=f'{out}/legend-cinema.png')
    pg.wait_for_timeout(900); pg.screenshot(path=f'{out}/legend-land.png')
    check('legendary landing ring added', pg.evaluate("window.__hs.HAP.log.includes('land')"), str(pg.evaluate("window.__hs.HAP.log.slice(-4)")))
    pg.evaluate("G=null;show('title')")

    # variant effects in zoom
    pg.evaluate("window.__hs.sheet(['c22','m23','v23','c9'])")
    for v in ['gild', 'crimson', 'void', 'prism']:
        pg.evaluate(f"(()=>{{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);const zc=document.querySelector('#zoom .card');if(zc)varEl(zc,'{v}')}})()")
        pg.wait_for_timeout(2900)
        an = pg.evaluate("(()=>{const f=document.querySelector('#zoom .vfr');if(!f)return null;return [getComputedStyle(f,'::before').animationName,getComputedStyle(f,'::after').animationName,getComputedStyle(f,'::after').animationPlayState]})()")
        check(f'variant {v} animates in zoom', bool(an) and an[2] == 'running' and (an[0] != 'none' or an[1] != 'none'), str(an))
        pg.screenshot(path=f'{out}/variant-{v}.png')
        pg.evaluate("hideZoom()")
    b.close()

for e in errs:
    print('PAGE ERROR', e)
print('FAILED:', fails, 'ERRORS:', len(errs))
sys.exit(1 if fails or errs else 0)

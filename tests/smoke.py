"""Smoke test: loads the game headless, visits every screen, plays an autopilot match to the end,
opens a pack, zooms/tilts cards and reports any JavaScript errors.

Usage: python3 tests/smoke.py [path/to/index.html] [screenshot_dir]
Exit code 1 if any page error or console error was seen.
"""
import sys, os, pathlib
from playwright.sync_api import sync_playwright

page_path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
shots = sys.argv[2] if len(sys.argv) > 2 else None
if shots:
    os.makedirs(shots, exist_ok=True)

errs = []
def snap(pg, name):
    if shots:
        pg.screenshot(path=f'{shots}/{name}.png')

with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for vw, vh, tag in [(412, 860, 'phone'), (1280, 720, 'land')]:
        pg = b.new_page(viewport={'width': vw, 'height': vh}, device_scale_factor=1, has_touch=(tag == 'phone'))
        pg.on('pageerror', lambda e, t=tag: errs.append(f'[{t}] pageerror: {e}'))
        pg.on('console', lambda m, t=tag: m.type == 'error' and 'net::' not in m.text and 'Failed to load resource' not in m.text and errs.append(f'[{t}] console: {m.text}'))
        pg.goto((sys.argv[1] if sys.argv[1:] and sys.argv[1].startswith('http') else page_path.as_uri()))
        pg.wait_for_timeout(1500)
        snap(pg, f'{tag}-title')
        for s in ['pick', 'mydecks', 'packs', 'coll', 'camp', 'quests', 'stats', 'codex', 'gaunt', 'weekly', 'ach', 'howto', 'title']:
            pg.evaluate(f"document.getElementById('{s}') && show('{s}')")
            pg.wait_for_timeout(250)
        pg.evaluate("settingsOpen()"); pg.wait_for_timeout(200); snap(pg, f'{tag}-settings')
        pg.evaluate("document.getElementById('settings').classList.remove('on')")
        # collection zoom + tilt
        pg.evaluate("show('coll')"); pg.wait_for_timeout(400)
        pg.evaluate("(()=>{const c=document.querySelector('#cgrid .card');if(c)showZoom(c,true)})()"); pg.wait_for_timeout(300)
        for i in range(12):
            pg.evaluate(f"window.__hs.ztFinger({(i%5-2)/2},{(i%3-1)/1})"); pg.wait_for_timeout(30)
        snap(pg, f'{tag}-zoom'); pg.evaluate("hideZoom()")
        # autopilot match to the end
        pg.evaluate("UI.speed=0.2;UI.auto=true;startMatch(prebuilt('v'),'c',{first:0})")
        pg.wait_for_timeout(300)
        pg.evaluate("window.__hs.demo&&window.__hs.demo()"); pg.wait_for_timeout(400); snap(pg, f'{tag}-match')
        pg.evaluate("UI.auto=true;UI.busy=false;startMatch(prebuilt('m'),'v',{first:0})")
        for i in range(120):
            done = pg.evaluate("!!(document.getElementById('over').classList.contains('on'))")
            if done:
                break
            pg.evaluate("if(G&&!G.over&&!UI.aiRun){runAI()}")
            pg.wait_for_timeout(250)
        pg.wait_for_timeout(1200)
        snap(pg, f'{tag}-over')
        print(tag, 'match finished:', pg.evaluate("document.getElementById('over').classList.contains('on')"), pg.evaluate("G&&[G.winner,G.turn,G.reason]"))
        pg.evaluate("ovHide();G=null;UI.auto=false;show('title')")
        # pack opening
        pg.evaluate("COLL.packs=(COLL.packs||0)+1;saveColl();show('packs')"); pg.wait_for_timeout(300)
        pg.evaluate("startOpen()"); pg.wait_for_timeout(2500); snap(pg, f'{tag}-pack')
        pg.close()
    b.close()

for e in errs:
    print(e)
print('ERRORS:', len(errs))
sys.exit(1 if errs else 0)

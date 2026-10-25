"""Renders the 3D table for each faction (portrait + landscape) over a local web server and saves screenshots.
Usage: python3 tests/b3shot.py http://127.0.0.1:8765/index.html outdir"""
import sys, os
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for vw, vh, tag in [(412, 860, 'p'), (1280, 720, 'l')]:
        for f in ['v', 'm', 'c']:
            pg = b.new_page(viewport={'width': vw, 'height': vh}, has_touch=(tag == 'p'), device_scale_factor=2 if tag == 'p' else 1)
            pg.on('pageerror', lambda e: print('ERR', e))
            pg.goto(url); pg.wait_for_timeout(1200)
            pg.evaluate(f"setQuality('high');startMatch(prebuilt('{f}'),'c',{{first:0}});UI.busy=false;G.p[0].board=['{f}5','{f}4'].map(id=>{{const u=mkUnit(G,0,id);u.ready=true;return u}});G.p[1].board=['c6','c2','c7'].map(id=>mkUnit(G,1,id));renderMatch()")
            pg.wait_for_function('window.__hs.B3.on&&window.__hs.B3.frames>3', timeout=20000)
            pg.wait_for_timeout(800)
            st = pg.evaluate("[window.__hs.B3.on,window.__hs.B3.frames,document.hidden,BAT.idle,BAT.hid,Object.keys(window.__hs.B3.tex),window.__hs.B3.ok,cur,!!window.__hs.B3.gl]")
            # a Guard minion must show its Guard frame on the 3D table
            pg.evaluate("(()=>{const u=mkUnit(G,0,'v6');u.k=[...u.k,'guard'];G.p[0].board.push(u);renderMatch()})()");pg.wait_for_timeout(300)
            pg.screenshot(path=f'{out}/{tag}-{f}.png')
            print(tag, f, st)
            pg.close()
    b.close()

"""Chaos test: a human-controlled match where random fast taps hit cards, units, heroes, buttons and empty board,
interleaved with drags, zooms, back-button presses, quitting mid-animation and re-entering. Checks for JS errors and that
the game never ends up stuck (the player can always act or the turn passes).
Usage: python3 tests/chaos.py index.html [seconds=90] [seed=1]"""
import sys, pathlib, random
from playwright.sync_api import sync_playwright
page = pathlib.Path(sys.argv[1]).resolve(); SECS = int(sys.argv[2]) if len(sys.argv) > 2 else 90; random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 1)
errs = []; stalls = 0; restarts = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 860}, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e)+' || '+(e.stack or '').replace(chr(10),' ').replace(str(page.parent.as_uri()),'')[:400]))
    pg.goto(page.as_uri()); pg.wait_for_timeout(1500)
    pg.evaluate("setQuality('high');UI.speed=0.35;startMatch(prebuilt('c'),'v',{first:0})")
    import time; t0 = time.time(); last_turn = None; same = 0
    while time.time() - t0 < SECS:
        r = random.random()
        try:
            if r < .45:
                sel = random.choice(['#hand .card', '#myb .unit', '#opb .unit', '#oph', '#myh', '#endt', '#match', '#hand'])
                els = pg.query_selector_all(sel)
                if els:
                    e = random.choice(els); bb = e.bounding_box()
                    if bb: pg.mouse.click(bb['x'] + bb['width'] * random.random(), bb['y'] + bb['height'] * random.random())
            elif r < .65:
                els = pg.query_selector_all('#hand .card')
                if els:
                    bb = random.choice(els).bounding_box(); tgt = random.choice(pg.query_selector_all('#opb .unit,#oph,#myb') or [None])
                    tb = tgt.bounding_box() if tgt else {'x': 200, 'y': 300, 'width': 10, 'height': 10}
                    if bb and tb:
                        pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); pg.mouse.down()
                        pg.mouse.move(tb['x'] + tb['width'] / 2, tb['y'] + tb['height'] / 2, steps=5); pg.mouse.up()
            elif r < .72:
                pg.evaluate("window.hsBack?hsBack():(document.getElementById('zoom').classList.contains('on')&&hideZoom())")
            elif r < .76:
                pg.evaluate("(()=>{const c=document.querySelector('#hand .card,#myb .unit');if(c)showZoom(c,true)})()")
            elif r < .78:
                pg.evaluate("(()=>{const q=document.getElementById('quit');if(q)q.click()})()"); pg.wait_for_timeout(150)
                pg.evaluate("(()=>{const ok=document.getElementById('dlgOk');if(ok&&document.getElementById('dlg').classList.contains('on'))ok.click()})()")
            elif r < .80:
                pg.evaluate("batHide&&batHide();setTimeout(()=>batShow&&batShow(),200)")
        except Exception as ex:
            errs.append('driver: ' + str(ex)[:120])
        pg.wait_for_timeout(random.choice([20, 40, 80, 150]))
        st = pg.evaluate("({cur,g:!!G,over:G&&G.over,ov:document.getElementById('over').classList.contains('on'),turn:G&&G.turn,me:G&&G.cur===0,busy:UI.busy,ai:UI.aiRun,cin:!!UI.cin})")
        if st['ov'] or not st['g'] or st['cur'] != 'match':
            pg.evaluate("ovHide();G=null;startMatch(prebuilt(['v','m','c','n'][Math.random()*4|0]),['v','m','c','n'][Math.random()*4|0],{first:Math.random()<.5?0:1})"); restarts += 1; same = 0; continue
        key = (st['turn'], st['me'], st['busy'], st['ai'])
        same = same + 1 if key == last_turn else 0; last_turn = key
        if same > 120:   # ~10 s with nothing changing: is the player able to act?
            ok = pg.evaluate("G.cur===0&&!UI.busy&&!UI.aiRun&&!UI.cin")
            if not ok:
                stalls += 1; print('STALL', st)
            pg.evaluate("if(G.cur===0&&!UI.busy)document.getElementById('endt').click()"); same = 0
    b.close()
print('errors:', len(errs)); [print('  ', e) for e in errs[:12]]
print('stalls:', stalls, ' matches started:', restarts + 1)
sys.exit(1 if errs or stalls else 0)

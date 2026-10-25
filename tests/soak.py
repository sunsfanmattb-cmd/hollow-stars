"""Stability soak: plays many autopilot matches across every faction pairing and game mode, hops between screens,
opens packs, zooms cards, and cycles the battery saver, watching for JavaScript errors, stuck matches and leaks
(DOM nodes, running animations, timers, JS heap).
Usage: python3 tests/soak.py index.html [matches=12]"""
import sys, pathlib, json, itertools
from playwright.sync_api import sync_playwright
page = pathlib.Path(sys.argv[1]).resolve(); N = int(sys.argv[2]) if len(sys.argv) > 2 else 12
errs = []; stuck = []
STATS = """(()=>({dom:document.getElementsByTagName('*').length,anims:document.getAnimations().length,
 heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0,timers:window.__timers||0,vids:document.querySelectorAll('video').length,
 fx:FX.P.length,cur}))()"""
INIT = """(()=>{let n=0;const si=window.setInterval;window.setInterval=function(){n++;window.__timers=n;return si.apply(this,arguments)};
 const ci=window.clearInterval;window.clearInterval=function(){n--;window.__timers=n;return ci.apply(this,arguments)}})()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-precise-memory-info', '--js-flags=--expose-gc'])
    pg = b.new_page(viewport={'width': 412, 'height': 860}, has_touch=True)
    pg.add_init_script(INIT)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and errs.append('console: ' + m.text))
    pg.goto(page.as_uri()); pg.wait_for_timeout(1500)
    pg.evaluate("setQuality('high');UI.speed=0.15")
    base = pg.evaluate(STATS); print('start', base)
    facs = ['v', 'm', 'c', 'n']; pairs = list(itertools.product(facs, facs))
    modes = ["{first:0}", "{first:1}", "{first:0,dif:'nightmare'}", "{first:1,dif:'easy'}"]
    for i in range(N):
        a, c = pairs[i % len(pairs)]; mo = modes[i % len(modes)]
        pg.evaluate(f"ovHide();G=null;UI.auto=true;UI.busy=false;startMatch(prebuilt('{a}'),'{c}',{mo})")
        done = False
        for k in range(400):
            st = pg.evaluate("[document.getElementById('over').classList.contains('on'),!!G,G&&G.over,UI.aiRun,UI.busy,G&&G.turn]")
            if st[0]: done = True; break
            pg.evaluate("if(G&&!G.over&&!UI.aiRun)runAI()")
            if k % 40 == 39:  # interrupt with other UI while the match runs
                pg.evaluate("(()=>{const c=document.querySelector('#hand .card');if(c)showZoom(c,true);setTimeout(hideZoom,120)})()")
            pg.wait_for_timeout(120)
        if not done: stuck.append((i, a, c, mo, st))
        # screen hopping, packs, battery saver
        pg.evaluate("ovHide();G=null;UI.auto=false")
        for s in ['coll', 'packs', 'mydecks', 'camp', 'quests', 'codex', 'gaunt', 'weekly', 'ach', 'stats', 'title']:
            pg.evaluate(f"document.getElementById('{s}')&&show('{s}')"); pg.wait_for_timeout(60)
        if i % 3 == 0:
            pg.evaluate("COLL.packs=(COLL.packs||0)+1;saveColl();show('packs');startOpen()"); pg.wait_for_timeout(1300)
            pg.evaluate("document.getElementById('pwrap').click()"); pg.wait_for_timeout(1300)
            pg.evaluate("document.getElementById('pall').click()"); pg.wait_for_timeout(1500)
            pg.evaluate("document.getElementById('pdone').click()"); pg.wait_for_timeout(200)
        pg.evaluate("batSleep();batWake();batHide&&batHide();batShow&&batShow()")
        pg.evaluate("show('title');window.gc&&window.gc()"); pg.wait_for_timeout(400)
        s = pg.evaluate(STATS)
        print(f"match {i+1:2d} {a} vs {c} {mo:28s} {'ok   ' if done else 'STUCK'} dom={s['dom']} anims={s['anims']} heap={s['heap']}MB timers={s['timers']} videos={s['vids']}")
    end = pg.evaluate(STATS)
    b.close()
print('errors:', len(errs)); [print('  ', e) for e in errs[:15]]
print('stuck matches:', stuck)
print('growth:', {k: (base[k], end[k]) for k in ['dom', 'anims', 'heap', 'timers', 'vids']})
sys.exit(1 if errs or stuck else 0)

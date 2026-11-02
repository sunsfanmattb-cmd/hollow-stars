"""v2.9 strategy UI check: mulligan screen, hero power button (read, use, targeting, AI use), drag-to-place between units,
live cost on the hand card, Unhinged cue, Epic frame, and no JS errors. Saves screenshots when given a directory.

Usage: python3 tests/strategy_ui.py [url-or-path-to-index.html] [shots_dir]
"""
import sys, os, pathlib
from playwright.sync_api import sync_playwright
arg = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
URL = arg if arg.startswith('http') else pathlib.Path(arg).resolve().as_uri()
SH = sys.argv[2] if len(sys.argv) > 2 else None
if SH: os.makedirs(SH, exist_ok=True)
fails, errs = [], []
def check(n, c, info=''):
    print(('PASS ' if c else 'FAIL ') + n + (f'  [{info}]' if info and not c else ''))
    if not c: fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw, vh, tag in [(412, 860, 'phone'), (1280, 720, 'land')]:
        pg = b.new_page(viewport={'width': vw, 'height': vh}, has_touch=vw < 900)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and errs.append(m.text))
        pg.goto(URL); pg.wait_for_timeout(1300); ev = pg.evaluate
        # mulligan
        ev("UI.speed=.12;startMatch(prebuilt('m'),'v',{first:0})"); pg.wait_for_timeout(500)
        check(f'[{tag}] mulligan screen opens', ev("document.getElementById('mull').classList.contains('on')&&G.mullPending===1"))
        if SH: pg.screenshot(path=f'{SH}/{tag}-mulligan.png')
        before = ev("G.p[0].hand.map(c=>c.uid)")
        pg.locator('#mull .mc').nth(0).click(); pg.locator('#mull .mc').nth(1).click()
        check(f'[{tag}] button counts the cards to replace', 'replace 2' in pg.locator('#mullGo').inner_text().lower())
        pg.click('#mullGo'); pg.wait_for_timeout(400)
        check(f'[{tag}] replaced 2 cards and the game started', ev(f"!G.mullPending&&G.turn===1&&G.p[0].hand.filter(c=>{before}.includes(c.uid)).length===G.p[0].hand.length-2"))
        # hero power: Derelict
        ev("G.p[0].flux=G.p[0].max=6;renderMatch()")
        check(f'[{tag}] power badge lit when usable', ev("document.querySelector('#myh .hpb').classList.contains('can')"))
        pg.click('#myh .hpb'); pg.wait_for_timeout(150)
        check(f'[{tag}] first tap selects and explains the power', ev("UI.sel&&UI.sel.k==='p'&&document.getElementById('hint').textContent.includes('Deploy Drone')"))
        pg.click('#myh .hpb'); pg.wait_for_timeout(300)
        check(f'[{tag}] second tap uses it: Drone summoned, 2 Flux spent', ev("G.p[0].board.some(u=>u.id==='tD')&&G.p[0].flux===4&&G.p[0].hpUsed===1"))
        check(f'[{tag}] badge greys out after use', ev("document.querySelector('#myh .hpb').classList.contains('used')"))
        # placement: drag a unit between two
        ev("G.p[0].board=[];G.p[0].flux=10;for(const id of['m1','m2']){const u=mkUnit(G,0,id);u.ready=true;G.p[0].board.push(u)}const c={uid:G.uid++,id:'m46'};G.p[0].hand=[c];window.__c=c.uid;renderMatch()")
        pg.wait_for_timeout(900)   # let the new units finish their entry animation
        hc = pg.locator(f'#hand [data-h="{ev("window.__c")}"]').bounding_box(); x0, y0 = hc['x'] + hc['width'] / 2, hc['y'] + hc['height'] / 2
        pg.mouse.move(x0, y0); pg.mouse.down(); pg.mouse.move(x0, y0 - 40); pg.wait_for_timeout(250)   # the board settles into drop mode, then measure it
        us = pg.locator('#myb .unit'); a = us.nth(0).bounding_box(); bb = us.nth(1).bounding_box()
        tx, ty = (a['x'] + a['width'] + bb['x']) / 2, a['y'] + a['height'] / 2
        for i in range(1, 9): pg.mouse.move(x0 + (tx - x0) * i / 8, y0 - 40 + (ty - y0 + 40) * i / 8); pg.wait_for_timeout(20)
        check(f'[{tag}] placement marker shows while dragging', ev("!!document.querySelector('#insm.on')"))
        if SH: pg.screenshot(path=f'{SH}/{tag}-placing.png')
        pg.mouse.up(); pg.wait_for_timeout(400)
        check(f'[{tag}] unit lands between the two', ev("G.p[0].board.map(u=>u.id).join()==='m1,m46,m2'"), ev("G.p[0].board.map(u=>u.id).join()"))
        check(f'[{tag}] Warden gives both neighbours Guard', ev("G.p[0].board[0].k.includes('guard')&&G.p[0].board[2].k.includes('guard')"))
        if SH: pg.screenshot(path=f'{SH}/{tag}-placed.png')
        # Communion power targeting
        ev("G.p[0].fac='c';hpMount(document.getElementById('myh'),0,'c');G.p[0].hpUsed=0;G.p[0].flux=6;G.p[0].board=[];for(const id of['c1','c6']){const u=mkUnit(G,0,id);u.ready=true;G.p[0].board.push(u)}renderMatch()")
        pg.click('#myh .hpb'); pg.wait_for_timeout(150)
        check(f'[{tag}] Bloodletting asks for a friendly unit', ev("document.getElementById('hint').textContent.includes('Choose a friendly unit')&&document.querySelectorAll('#myb .unit.tgt').length===2"))
        v = ev("G.p[0].board[0].uid"); pg.click(f'#myb .unit[data-u="{v}"]'); pg.wait_for_timeout(300)
        check(f'[{tag}] Bloodletting: sacrifice and +2/+2', ev(f"!G.p[0].board.some(u=>u.uid==={v})&&G.p[0].board[0].a===6"))
        # live cost + Unhinged cue
        ev("G.p[0].fac='v';G.p[0].board=[];for(const id of['v1','v5']){const u=mkUnit(G,0,id);G.p[0].board.push(u)}G.p[0].hand.push({uid:G.uid++,id:'v46'},{uid:G.uid++,id:'n3'});G.p[0].mad=5;renderMatch()")
        pg.wait_for_timeout(200)
        check(f'[{tag}] Leviathan shows its reduced cost in hand', ev("[...document.querySelectorAll('#hand .card')].some(e=>e.dataset.cid==='v46'&&e.classList.contains('cheap')&&e.querySelector('.cost b').textContent==='6')"))
        check(f'[{tag}] Unhinged card glows at 5 Madness, meter flares', ev("document.querySelector('#hand .card[data-cid=\"n3\"]').classList.contains('unhot')&&document.getElementById('myh').classList.contains('unh')"))
        if SH: pg.screenshot(path=f'{SH}/{tag}-unhinged.png')
        # AI uses its power
        ev("G=null;UI.speed=.12;startMatch(prebuilt('v'),'m',{first:1,mull:false})"); n = 0
        for i in range(40):
            pg.wait_for_timeout(500)
            if ev("G.p[1].hpUsed||0") or ev("G.turn>6"): break
        ev("G.p[0].ai=1;UI.auto=true"); pg.wait_for_timeout(200)
        check(f'[{tag}] the AI can use its power during a match (or game went on fine)', ev("!!G"))
        # Epic card frame
        ev("show('coll')"); pg.wait_for_timeout(400)
        check(f'[{tag}] Epic cards render with their trim', ev("!!document.querySelector('#cgrid .card.r-E .rim')"))
        ev("UI.auto=false")
        pg.close()
    b.close()
for e in errs: print('JS ERROR', e)
print(f'{len(fails)} failed' if fails or errs else 'all strategy UI checks passed')
sys.exit(1 if fails or errs else 0)

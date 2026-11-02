"""v2.6 economy check: save upgrade + tamper restore, pack sources and log, pity timers, banked quests, first win of the day,
store test purchases (packs, Welcome Bundle + Legendary pick, cosmetics), and backup code round trip.

Usage: python3 tests/economy_check.py [url-or-path-to-index.html]
Exit code 1 if any check fails or a JavaScript error is seen.
"""
import sys, pathlib, json
from playwright.sync_api import sync_playwright

arg = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
URL = arg if arg.startswith('http') else pathlib.Path(arg).resolve().as_uri()
URL += ('&' if '?' in URL else '?') + 'dev=1'  # opens the store's test checkout
fails, errs = [], []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{info}]' if info and not ok else ''))
    if not ok: fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 860})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'net::' not in m.text and 'Failed to load resource' not in m.text and errs.append(m.text))
    pg.goto(URL); pg.wait_for_timeout(400)
    ev = pg.evaluate
    def reload():
        pg.reload(); pg.wait_for_timeout(1200)

    # ---- upgrade a v2.5 save ----
    ev("""localStorage.clear();localStorage.setItem('hsCol',JSON.stringify({v:1,own:{v1:2,m1:1},shards:345,packs:4,opened:2,var:{},show:{}}));
          localStorage.setItem('hsV8',JSON.stringify({v:1,dif:'normal',camp:{},quests:null,login:{last:'',day:0,claimed:''},stats:{games:3}}))""")
    reload()
    s = ev("({from:SAVE.from,meta:JSON.parse(localStorage.getItem('hsMeta')).v,v:COLL.v,own:COLL.own.v1,pk:COLL.packs,src:COLL.src,signed:!!localStorage.getItem('hsCol.sig'),games:V8.stats.games})")
    check('old save upgrades to format 2 and keeps everything', s['from'] == 1 and s['meta'] == 2 and s['v'] == 2 and s['own'] == 2 and s['pk'] == 4 and s['src']['earn'] == 4 and s['signed'] and s['games'] == 3, s)

    # ---- tamper check ----
    sh = ev("COLL.shards")
    ev("const o=JSON.parse(localStorage.getItem('hsCol'));o.shards=99999;localStorage.setItem('hsCol',JSON.stringify(o))")
    reload()
    check('hand-edited save is restored', ev("COLL.shards") == sh and ev("SAVE.fixed.includes('hsCol')"), ev("COLL.shards"))
    ev("const o=JSON.parse(localStorage.getItem('hsCol'));o.shards=88888;localStorage.setItem('hsCol',JSON.stringify(o));localStorage.removeItem('hsMeta')")
    reload()
    check('deleting the version marker does not re-trust an edited save', ev("COLL.shards") == sh)

    # ---- packs: sources, log, pity ----
    ev("COLL.packs=0;COLL.src={earn:0,paid:0,gift:0};COLL.shards=500;saveColl()")
    check('buying with shards logs an earned pack', ev("buyPackShards()&&COLL.src.earn===1&&COLL.log.at(-1)[3]==='earn'&&COLL.log.at(-1)[4]==='shards'"))
    # one pack short of each guarantee: the next pack must have both (repeated, so a lucky natural pull can't hide a failure)
    r = ev("(()=>{const out=[];packAdd(10,'earn','test');for(let i=0;i<5;i++){COLL.pity={L:ECON.pack.legPity-1,H:ECON.pack.holoPity-1};const res=openPack();out.push({L:res.some(o=>C[o.id].r==='L'),H:res.some(o=>o.vr==='holo'),after:COLL.pity})}return out})()")
    check('20th pack without a Legendary has one', all(x['L'] and x['after']['L'] == 0 for x in r), r)
    check('50th pack without a holo has one', all(x['H'] and x['after']['H'] == 0 for x in r), r)
    r = ev("(()=>{packAdd(1,'earn','test');COLL.pity={L:3,H:7};const res=openPack();return{L:res.some(o=>C[o.id].r==='L'),H:res.some(o=>o.vr==='holo'),after:COLL.pity}})()")
    check('counters advance on a normal pack', r['after']['L'] == (0 if r['L'] else 4) and r['after']['H'] == (0 if r['H'] else 8), r)
    ev("COLL.pity={L:0,H:0};saveColl()")
    n = ev("(()=>{let L=0;const N=4000;for(let i=0;i<N;i++){if(rollPack().some(id=>C[id].r==='L'))L++}return L/N})()")
    check('base Legendary rate is about 10%', 0.08 < n < 0.12, n)
    e = ev("(()=>{let E=0;const N=4000;for(let i=0;i<N;i++){if(rollPack().some(id=>C[id].r==='E'))E++}return E/N})()")
    check('Epic rate is about 12%', 0.095 < e < 0.145, e)

    # ---- quests: banked, one per day, max 3 ----
    ev("V8NOW=Date.parse('2026-11-02T12:00:00');V8.quests=null;questsToday()")
    q = ev("V8.quests.list.length")
    check('new player starts with 3 quests', q == 3, q)
    ev("const Q=V8.quests;Q.list[0].p=Q.list[0].n;questClaim(0);V8NOW=Date.parse('2026-11-03T12:00:00');questsToday()")
    check('a claimed quest is replaced by one new quest the next day', ev("V8.quests.list.length") == 3 and ev("V8.quests.list.every(q=>!q.cl)"))
    ev("V8NOW=Date.parse('2026-11-06T12:00:00');questsToday()")
    check('quests never stack past 3', ev("V8.quests.list.length") == 3)
    ev("const Q=V8.quests;for(const i of [0,1,2]){Q.list[i].p=Q.list[i].n;questClaim(i)}V8NOW=Date.parse('2026-11-07T12:00:00');questsToday()")
    check('after a full claim, one quest arrives per day', ev("V8.quests.list.length") == 1)
    ev("V8NOW=Date.parse('2026-11-09T12:00:00');questsToday()")
    check('missed days still add quests (up to the cap)', ev("V8.quests.list.length") == 3)
    ev("V8NOW=null")

    # ---- first win of the day ----
    ev("V8.fw='';saveV8();COLL.shards=0;saveColl();UI.auto=false")
    w = ev("(()=>{G={winner:0,dif:'normal',reason:'san',p:[{fac:'v',name:'a'},{fac:'m',name:'b'}],turn:9,meta:{mode:'quick'},st:{}};gameOver();const a=G.earned;G.ovq=0;$('#over').classList.remove('on');G={winner:0,dif:'normal',reason:'san',p:[{fac:'v',name:'a'},{fac:'m',name:'b'}],turn:9,meta:{mode:'quick'},st:{}};gameOver();const b=G.earned;$('#over').classList.remove('on');G=null;return[a,b]})()")
    check('first win pays the bonus once per day', w == [ev("ECON.match.win+ECON.match.firstWin"), ev("ECON.match.win")], w)

    # ---- store: test purchases ----
    ev("COLL.packs=0;COLL.src={earn:0,paid:0,gift:0};COLL.buys=[];COLL.ent={};saveColl();show('store')"); pg.wait_for_timeout(200)
    pg.click('[data-buy="hs_packs_7"]'); pg.wait_for_timeout(150); pg.click('#dlgOk'); pg.wait_for_timeout(250)
    check('test purchase adds paid packs', ev("COLL.packs===7&&COLL.src.paid===7&&COLL.buys.length===1&&COLL.buys[0].mode==='test'"))
    pg.click('[data-buy="hs_packs_2"]'); pg.wait_for_timeout(150); pg.click('#dlgNo'); pg.wait_for_timeout(200)
    check('cancelled purchase grants nothing', ev("COLL.packs===7&&COLL.buys.length===1"))
    check('a repeated transaction is granted once', ev("(()=>{const tx=COLL.buys[0].tx;fulfil(PROD.hs_packs_7,tx,'test');return COLL.packs===7})()"))
    check('earned packs are opened before paid ones', ev("packAdd(1,'earn','t');packTake()==='earn'&&COLL.src.paid===7"))
    pg.click('[data-buy="hs_welcome"]'); pg.wait_for_timeout(150); pg.click('#dlgOk'); pg.wait_for_timeout(700)
    check('Welcome Bundle: 10 packs and a Legendary choice', ev("COLL.src.paid===17&&COLL.ent.hs_welcome===1&&COLL.ent.pickL===1&&$('#odds').classList.contains('on')"))
    lid = ev("legChoices()[0]")
    pg.click(f'#oddx [data-lp="{lid}"]'); pg.wait_for_timeout(200); pg.click('#lpClaim'); pg.wait_for_timeout(200); pg.click('#dlgOk'); pg.wait_for_timeout(300)
    check('Legendary pick joins the collection', ev(f"owned('{lid}')&&!COLL.ent.pickL&&!$('#odds').classList.contains('on')"))
    check('Welcome Bundle can only be bought once', ev("!document.querySelector('[data-buy=\"hs_welcome\"]')"))
    pg.click('[data-buy="hs_back_pearl"]'); pg.wait_for_timeout(150); pg.click('#dlgOk'); pg.wait_for_timeout(250)
    check('cosmetic purchase unlocks it', ev("cosHas('back','pearl')&&!!document.querySelector('[data-equip=\"back:pearl\"]')"))
    pg.click('[data-equip="back:pearl"]'); pg.wait_for_timeout(150)
    check('purchased card back can be equipped', ev("V9.cos.back==='pearl'"))

    # ---- backup code round trip ----
    code = ev("svExport()")
    before = ev("JSON.stringify({own:COLL.own,sh:COLL.shards,pk:COLL.packs,buys:COLL.buys.length,back:V9.cos.back})")
    check('backup code verifies', ev(f"svImport({json.dumps(code)}).ok===1"))
    check('edited backup code is rejected', ev(f"svImport({json.dumps(code[:-3] + ('aaa' if code[-3:] != 'aaa' else 'bbb'))}).ok===0"))
    ev("COLL.shards=1;COLL.own={};saveColl()")
    ev(f"svApply(svImport({json.dumps(code)}).o)"); reload()
    after = ev("JSON.stringify({own:COLL.own,sh:COLL.shards,pk:COLL.packs,buys:COLL.buys.length,back:V9.cos.back})")
    check('restoring a backup brings everything back', before == after, (before, after))

    # ---- screens render ----
    for s in ['store', 'packs', 'quests', 'gaunt', 'weekly', 'title']:
        ev(f"show('{s}')"); pg.wait_for_timeout(150)
    ev("showOdds()"); pg.wait_for_timeout(100)
    check('odds panel lists the guarantees', 'every 20 packs' in ev("$('#oddx').textContent"))
    b.close()

for e in errs: print('JS ERROR', e)
print(f'{len(fails)} failed' if fails or errs else 'all economy checks passed')
sys.exit(1 if fails or errs else 0)

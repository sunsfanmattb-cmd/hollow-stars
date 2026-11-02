"""Layout sweep: every menu screen (plus settings, odds, the store and a match) at phone, tablet and desktop sizes.
Reports content wider than the screen, dialogs taller than the screen that cannot scroll, text clipped inside buttons or labels, overlapping buttons, broken images and JS errors.

Usage: python3 tests/layout_sweep.py [url-or-path-to-index.html] [shots_dir]
Exit code 1 if anything is found.
"""
import sys, os, pathlib
from playwright.sync_api import sync_playwright

arg = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
URL = arg if arg.startswith('http') else pathlib.Path(arg).resolve().as_uri()
URL += ('&' if '?' in URL else '?') + 'dev=1'
shots = sys.argv[2] if len(sys.argv) > 2 else None
if shots: os.makedirs(shots, exist_ok=True)
SIZES = [(360, 640, 'small'), (412, 860, 'phone'), (844, 390, 'phoneland'), (768, 1024, 'tablet'), (1280, 720, 'laptop'), (1920, 1080, 'desktop')]
SCREENS = ['title', 'pick', 'mydecks', 'packs', 'store', 'coll', 'camp', 'quests', 'gaunt', 'weekly', 'codex', 'ach', 'stats', 'howto']
PROBE = r"""(name)=>{const W=innerWidth,H=innerHeight,out=[];const vis=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const root=name==='settings'?document.querySelector('#settings .sbox'):name==='odds'?document.querySelector('#odds .obox'):document.querySelector('#'+name);if(!root)return['no root'];
 const lbl=e=>(e.id?'#'+e.id:'')+'.'+[...e.classList].slice(0,2).join('.')+' "'+(e.textContent||'').trim().slice(0,24)+'"';
 for(const e of root.querySelectorAll('*')){if(!vis(e)||e.closest('svg,.card,.prays,.pburst,#teye,canvas,.orn'))continue;const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  if(s.position!=='fixed'&&(r.right>W+1||r.left<-1)&&!e.closest('[style*="overflow"],.seg,.cmap,.qcal')){let p=e.parentElement,clip=false;while(p&&p!==document.body){const ps=getComputedStyle(p);if(/(auto|scroll|hidden)/.test(ps.overflowX)){clip=true;break}p=p.parentElement}if(!clip)out.push('wider than screen: '+lbl(e)+' '+Math.round(r.left)+'..'+Math.round(r.right))}
  if(e.matches('button,.btn,label,b,small,h2,h3,em')&&e.children.length===0&&e.scrollWidth>e.clientWidth+2&&s.overflow!=='visible'&&!/ellipsis|clip/.test(s.textOverflow))out.push('text clipped: '+lbl(e)+' '+e.scrollWidth+'>'+e.clientWidth)}
 const bs=[...root.querySelectorAll('button')].filter(vis).map(b=>[b,b.getBoundingClientRect()]);
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i][1],b=bs[j][1];const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left),oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
  if(ox>4&&oy>4&&!bs[i][0].contains(bs[j][0])&&!bs[j][0].contains(bs[i][0]))out.push('buttons overlap: '+lbl(bs[i][0])+' / '+lbl(bs[j][0]))}
 if(name==='settings'||name==='odds'){const r=root.getBoundingClientRect();if((r.top<-1||r.bottom>H+1)&&root.scrollHeight<=root.clientHeight+1)out.push('dialog taller than the screen and not scrollable: '+Math.round(r.top)+'..'+Math.round(r.bottom))}
 for(const im of root.querySelectorAll('img'))if(im.complete&&!im.naturalWidth)out.push('broken image '+im.src);
 return out}"""
issues, errs = [], []
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw, vh, tag in SIZES:
        pg = b.new_page(viewport={'width': vw, 'height': vh}, has_touch=vw < 900)
        pg.on('pageerror', lambda e, t=tag: errs.append(f'[{t}] {e}'))
        pg.on('console', lambda m, t=tag: m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and errs.append(f'[{t}] {m.text}'))
        pg.goto(URL); pg.wait_for_timeout(1400)
        pg.evaluate("COLL.ent.pickL=0;for(const id of COL)COLL.own[id]=Math.max(COLL.own[id]||0,1);saveColl()")
        for s in SCREENS + ['settings', 'odds']:
            if s == 'settings': pg.evaluate("show('title');settingsOpen()")
            elif s == 'odds': pg.evaluate("document.getElementById('settings').classList.remove('on');show('packs');showOdds()")
            else: pg.evaluate(f"show('{s}')")
            pg.wait_for_timeout(420)
            pg.evaluate("document.getAnimations().forEach(a=>{const t=a.effect&&a.effect.target;if(t&&t.classList&&(t.classList.contains('screen')||t.id==='warp'))a.finish()})")
            for i in pg.evaluate(PROBE, s): issues.append(f'[{tag} {s}] {i}')
            if shots: pg.screenshot(path=f'{shots}/{tag}-{s}.png')
        pg.evaluate("modalClose()")
        pg.evaluate("UI.speed=.12;startMatch(prebuilt('v'),'c',{first:0})"); pg.wait_for_timeout(2500)
        for i in pg.evaluate(PROBE, 'match'): issues.append(f'[{tag} match] {i}')
        if shots: pg.screenshot(path=f'{shots}/{tag}-match.png')
        pg.close()
    b.close()
for i in issues: print(i)
for e in errs: print('JS ERROR', e)
print(f'{len(issues)} layout issues, {len(errs)} errors')
sys.exit(1 if issues or errs else 0)

"""Card-tilt smoothness, measured deterministically: a simulated 60 fps clock drives the real orient() and
ztFrame() code with the same noisy phone-tilt signal. Reports, for 'still' (phone held steady) and 'sway'
(phone slowly rocked): jitter = RMS frame-to-frame acceleration of the card angle, and lag behind the clean motion.
Usage: python3 tests/tilt_jitter.py index.html [other_index.html ...]"""
import sys, pathlib
from playwright.sync_api import sync_playwright
JS = r"""(mode)=>{
 setQuality('high');const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);
 const c=document.querySelector('#zoom .card'),H=window.__hs,ZT=H.ZT;if(ZT.c!==c)H.ztOpen(c);
 let now=1e6;performance.now=()=>now;window.requestAnimationFrame=()=>1;ZT.fing=-1e9;ZT.sens=now;ZT.t0=0;ZT.lt=0;ZT.base=null;ZT.lp=null;
 let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const xs=[],clean=[];for(let i=0;i<480;i++){now+=1000/60;const t=i/60,g=mode==='still'?3:12*Math.sin(t*1.6);
  const ev=new Event('deviceorientation');ev.gamma=g+gauss()*1.0;ev.beta=40+gauss()*1.0;window.dispatchEvent(ev);
  ZT.raf=0;ztFrame(now);xs.push(ZT.x);clean.push(g)}
 return {xs,clean}}"""
def rms(v): return (sum(x*x for x in v)/len(v))**.5
def jit(v): return rms([v[i+1]-2*v[i]+v[i-1] for i in range(1, len(v)-1)])
def lag(xs, clean):
    best, bl = -1, 0
    for L in range(0, 40):
        a = xs[60+L:]; b = clean[60:len(clean)-L]
        n = min(len(a), len(b)); ma = sum(a[:n])/n; mb = sum(b[:n])/n
        c = sum((a[i]-ma)*(b[i]-mb) for i in range(n))
        if c > best: best, bl = c, L
    return bl*1000/60
with sync_playwright() as p:
    b = p.chromium.launch()
    for path in sys.argv[1:]:
        out = []
        for mode in ['still', 'sway']:
            pg = b.new_page(viewport={'width': 412, 'height': 860})
            pg.goto(pathlib.Path(path).resolve().as_uri()); pg.wait_for_timeout(1000)
            r = pg.evaluate(JS, mode); pg.close()
            xs = r['xs'][120:]; cl = r['clean'][120:]
            s = f"{mode}: jitter {jit(xs)*13*1000:6.1f} mdeg/frame^2"
            if mode == 'still': s += f", wobble {rms([x-sum(xs)/len(xs) for x in xs])*13:.2f} deg"
            else: s += f", lag {lag(xs, cl):.0f} ms"
            out.append(s)
        print(pathlib.Path(path).parent.name or '.', '|', ' | '.join(out))
    b.close()

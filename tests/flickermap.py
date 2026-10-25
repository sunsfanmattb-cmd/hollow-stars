"""Flicker map: captures consecutive frames of a still screen at phone pixel density and measures pixels that keep
changing direction (brighter, darker, brighter...): that is what shimmer/jitter looks like. Smooth motion changes a
pixel in one direction for a while; shimmer flips it every frame or two.
Saves a heatmap PNG per scenario and prints a shimmer score (lower is better).
Usage: python3 tests/flickermap.py index.html outdir [scenario ...]   scenarios: coll, zoom, zoomtilt
"""
import sys, os, pathlib, io
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

page = pathlib.Path(sys.argv[1]).resolve(); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
only = sys.argv[3:]
SC = {
 'coll': ("show('coll');setTimeout(()=>{const g=document.querySelector('#coll .scroll')||document.querySelector('#cgrid');const L=[...document.querySelectorAll('#cgrid .card.r-L')];if(L[0])L[0].scrollIntoView({block:'center'})},50)", None),
 'zoom': ("show('coll')", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true)})()"),
 'zoomnovid': ("show('coll');VID.bad['c22']=1", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true)})()"),
 'zoomstill': ("show('coll');VID.bad['c22']=1", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);setTimeout(()=>{for(const a of document.querySelector('#zoom').getAnimations({subtree:true}))if(a instanceof CSSAnimation)a.pause()},300)})()"),
 'zoomhold': ("show('coll')", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);let i=0;window.__tt=setInterval(()=>{i++;const ev=new Event('deviceorientation');ev.gamma=(Math.random()-.5)*1.5+Math.sin(i/7)*.3;ev.beta=40+(Math.random()-.5)*1.5;dispatchEvent(ev)},16)})()"),
 'zoommove': ("show('coll')", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);let i=0;window.__tt=setInterval(()=>{i++;const ev=new Event('deviceorientation');ev.gamma=6*Math.sin(i/90);ev.beta=40;dispatchEvent(ev)},16)})()"),
}
def frames(pg, n=20):
    """full device-pixel screenshots, back to back (phone density is where shimmer shows)"""
    out = []
    for i in range(n):
        out.append(np.asarray(Image.open(io.BytesIO(pg.screenshot(scale='device', animations='allow'))).convert('L'), dtype=np.int16))
    return out
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (setup, act) in SC.items():
        if only and name not in only: continue
        pg = b.new_page(viewport={'width': 412, 'height': 860}, device_scale_factor=2.6, has_touch=True, is_mobile=True)
        pg.on('pageerror', lambda e: print('  PAGE ERROR', e))
        pg.goto(page.as_uri()); pg.wait_for_timeout(1200)
        pg.evaluate("setQuality('high');for(const id of COL)COLL.own[id]=Math.max(COLL.own[id]||0,1);saveColl()")
        pg.evaluate(setup); pg.wait_for_timeout(900)
        if act: pg.evaluate(act); pg.wait_for_timeout(1500)
        F = frames(pg)
        if len(F) < 6:
            print(name, 'too few frames', len(F)); continue
        h = min(f.shape[0] for f in F); w = min(f.shape[1] for f in F); F = np.stack([f[:h, :w] for f in F])
        d = np.diff(F, axis=0)                       # frame-to-frame change
        sig = np.sign(np.where(np.abs(d) >= 6, d, 0))  # ignore sub-threshold noise
        flips = np.sum((sig[1:] * sig[:-1]) < 0, axis=0)  # direction reversals
        rate = flips / (len(F) - 2)
        score = float(np.mean(rate > .25) * 100)      # % of screen shimmering
        heat = np.clip(rate * 3, 0, 1)
        base = (F[0] / 255.0) * .35
        rgb = np.stack([np.clip(base + heat, 0, 1), base, base], axis=-1)
        Image.fromarray((rgb * 255).astype(np.uint8)).resize((w // 2, h // 2)).save(f'{out}/{name}.png')
        ch=float(np.mean(np.abs(d)>=6)*100)
        print(f"{name:9s} frames={len(F)} changing={ch:.2f}% shimmer={score:.2f}% of screen  shape={F.shape}")
        pg.close()
    b.close()

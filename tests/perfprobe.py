"""Performance probe: phone-sized viewport, CPU slowed 4x (mid-range phone), Chrome trace per scenario.
Reports per scenario: frames drawn, worst frame gap, main-thread busy %, paint + raster time, image decodes,
style/layout work, and the number of composited layers (GPU memory, a common cause of flicker on phones).

Usage: python3 tests/perfprobe.py index.html [scenario ...]
Scenarios: title, coll, collscroll, zoomL, cinema, match, pack (default: all)
"""
import sys, json, pathlib, tempfile, os
from playwright.sync_api import sync_playwright

page_path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
only = sys.argv[2:]
CATS = 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,blink,cc,viz,benchmark'

def summarize(events, dur_ms):
    main_pid_tid = None
    for e in events:
        if e.get('name') == 'TracingStartedInBrowser' or e.get('name') == 'TracingStartedInPage':
            pass
    # renderer main thread = thread named CrRendererMain
    names = {(e['pid'], e['tid']): e['args']['name'] for e in events if e.get('ph') == 'M' and e.get('name') == 'thread_name'}
    mains = [k for k, v in names.items() if v == 'CrRendererMain']
    rasters = [k for k, v in names.items() if 'Raster' in v or 'Compositor' in v]
    def total(pred, keys):
        return sum(e.get('dur', 0) for e in events if e.get('ph') == 'X' and (e['pid'], e['tid']) in keys and pred(e)) / 1000
    busy = total(lambda e: e['name'] in ('RunTask', 'ThreadControllerImpl::RunTask'), mains)
    paint = total(lambda e: e['name'] == 'Paint', mains)
    style = total(lambda e: e['name'] in ('UpdateLayoutTree', 'RecalculateStyles'), mains)
    layout = total(lambda e: e['name'] == 'Layout', mains)
    raster = sum(e.get('dur', 0) for e in events if e.get('ph') == 'X' and e['name'] in ('RasterTask', 'TileManager::RunTask', 'RasterizerTaskImpl::RunOnWorkerThread')) / 1000
    decode = [e for e in events if e.get('ph') == 'X' and e['name'] in ('Decode Image', 'ImageDecodeTask', 'Decode LazyPixelRef', 'ImageFrameGenerator::decode')]
    frames = sorted(e['ts'] for e in events if e.get('name') in ('DrawFrame',) )
    gaps = [(b - a) / 1000 for a, b in zip(frames, frames[1:])]
    npaint = sum(1 for e in events if e.get('ph') == 'X' and e['name'] == 'Paint' and (e['pid'], e['tid']) in mains)
    return {'frames': len(frames), 'fps': round(len(frames) / (dur_ms / 1000), 1), 'worst_gap_ms': round(max(gaps), 0) if gaps else None,
            'janky_frames(>50ms)': sum(1 for g in gaps if g > 50), 'main_busy_%': round(busy / dur_ms * 100, 1),
            'paints': npaint, 'paint_ms': round(paint, 1), 'raster_ms': round(raster, 1), 'decodes': len(decode),
            'decode_ms': round(sum(e.get('dur', 0) for e in decode) / 1000, 1), 'style_ms': round(style, 1), 'layout_ms': round(layout, 1)}

def layers(cdp):
    try:
        cdp.send('LayerTree.enable')
        return None
    except Exception:
        return None

SCEN = {
 'title': ("show('title')", None, 4000),
 'coll': ("show('coll')", None, 4000),
 'collscroll': ("show('coll')", "(()=>{const g=document.querySelector('#cgrid');let y=0;const iv=setInterval(()=>{y+=40;g.scrollTop=y;(document.scrollingElement||document.body).scrollTop=y;if(y>3000)clearInterval(iv)},50)})()", 4000),
 'zoomL': ("show('coll')", "(()=>{const s=document.createElement('div');s.dataset.cid='c22';showZoom(s,true);let i=0;const iv=setInterval(()=>{i++;window.__hs.ztFinger(Math.sin(i/9),Math.cos(i/13)*.6);if(i>120)clearInterval(iv)},33)})()", 4000),
 'cinema': ("window.__hs.demo()", "(()=>{const u=mkUnit(G,0,'c22');u.ready=true;G.p[0].board.push(u);renderMatch();lgCinema('c22',u.uid)})()", 3500),
 'match': ("window.__hs.demo()", None, 4000),
 'pack': ("COLL.packs=(COLL.packs||0)+1;saveColl();show('packs')", "startOpen()", 5000),
}

def main():
  with sync_playwright() as p:
      b = p.chromium.launch(args=['--enable-gpu-rasterization', '--ignore-gpu-blocklist'])
      for name, (setup, action, dur) in SCEN.items():
          if only and name not in only:
              continue
          ctx = b.new_context(viewport={'width': 412, 'height': 860}, device_scale_factor=2.6, has_touch=True, is_mobile=True,
                              user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36')
          pg = ctx.new_page()
          pg.on('pageerror', lambda e: print('  PAGE ERROR', e))
          pg.goto(page_path.as_uri()); pg.wait_for_timeout(1500)
          pg.evaluate("setQuality('high');COLL.var=COLL.var||{};for(const id of COL)COLL.own[id]=Math.max(COLL.own[id]||0,1);saveColl()")
          pg.evaluate(setup); pg.wait_for_timeout(1200)
          cdp = ctx.new_cdp_session(pg)
          cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
          cdp.send('LayerTree.enable')
          layer_counts = []
          cdp.on('LayerTree.layerTreeDidChange', lambda e: layer_counts.append(len(e.get('layers') or [])))
          tf = tempfile.mktemp(suffix='.json')
          b.start_tracing(page=pg, path=tf, categories=CATS.split(','))
          if action:
              pg.evaluate(action)
          pg.wait_for_timeout(dur)
          b.stop_tracing()
          cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
          ev = json.load(open(tf))
          ev = ev['traceEvents'] if isinstance(ev, dict) else ev
          s = summarize(ev, dur)
          s['layers_max'] = max(layer_counts) if layer_counts else None
          s['videos_playing'] = pg.evaluate("[...document.querySelectorAll('video')].filter(v=>!v.paused).length")
          s['css_anims_running'] = pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")
          print(f"{name:11s}", json.dumps(s))
          os.remove(tf)
          ctx.close()
      b.close()


if __name__ == '__main__':
    main()

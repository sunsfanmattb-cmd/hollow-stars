"""Battery proxy: after settling, how many times per second does the page wake up to run a frame, and how busy is the
main thread? Real-speed CPU (the frame-rate monitor rests, as on a phone that keeps up). Usage: python3 tests/idlewake.py OLD.html NEW.html"""
import sys, json, pathlib, tempfile, os
from playwright.sync_api import sync_playwright
SC = {'title': "show('title')", 'collection': "show('coll')", 'match (idle turn)': "window.__hs.demo()", 'decks': "show('mydecks')"}
def measure(b, path, setup):
    ctx = b.new_context(viewport={'width': 412, 'height': 860}, device_scale_factor=2.6, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.goto(pathlib.Path(path).resolve().as_uri()); pg.wait_for_timeout(1200)
    pg.evaluate("setQuality('high');for(const id of COL)COLL.own[id]=Math.max(COLL.own[id]||0,1);saveColl()")
    pg.evaluate(setup); pg.wait_for_timeout(6000)
    tf = tempfile.mktemp(suffix='.json')
    b.start_tracing(page=pg, path=tf, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'cc', 'blink'])
    pg.wait_for_timeout(5000); b.stop_tracing()
    ev = json.load(open(tf)); ev = ev['traceEvents'] if isinstance(ev, dict) else ev; os.remove(tf)
    names = {(e['pid'], e['tid']): e['args']['name'] for e in ev if e.get('ph') == 'M' and e.get('name') == 'thread_name'}
    mains = {k for k, v in names.items() if v == 'CrRendererMain'}
    bmf = sum(1 for e in ev if e.get('name') == 'ProxyMain::BeginMainFrame' and e.get('ph') == 'X' and (e['pid'], e['tid']) in mains)
    busy = sum(e.get('dur', 0) for e in ev if e.get('ph') == 'X' and e.get('name') == 'RunTask' and (e['pid'], e['tid']) in mains) / 1000
    ctx.close()
    return bmf / 5, busy / 5000 * 100
with sync_playwright() as p:
    b = p.chromium.launch()
    print(f"{'screen':20s} {'wakeups/s before':>17s} {'after':>7s}   {'CPU% before':>12s} {'after':>7s}")
    for name, setup in SC.items():
        a = measure(b, sys.argv[1], setup); c = measure(b, sys.argv[2], setup)
        print(f"{name:20s} {a[0]:17.1f} {c[0]:7.1f}   {a[1]:12.1f} {c[1]:7.1f}")
    b.close()

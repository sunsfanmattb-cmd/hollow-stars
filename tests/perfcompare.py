"""Averages perfprobe scenarios over several runs for two builds. Usage: python3 tests/perfcompare.py OLD.html NEW.html [runs] [scenario ...]"""
import sys, subprocess, json, statistics, re
old, new = sys.argv[1], sys.argv[2]
runs = int(sys.argv[3]) if len(sys.argv) > 3 else 3
scen = sys.argv[4:] or ['coll', 'zoomL', 'cinema', 'match', 'title']
keys = ['fps', 'janky_frames(>50ms)', 'main_busy_%', 'raster_ms', 'style_ms', 'layers_max', 'css_anims_running']
res = {}
for label, path in [('old', old), ('new', new)]:
    for r in range(runs):
        out = subprocess.run([sys.executable, 'tests/perfprobe.py', path] + scen, capture_output=True, text=True).stdout
        for line in out.splitlines():
            m = re.match(r'\s*(\w+)\s+(\{.*\})', line)
            if m:
                res.setdefault((m.group(1), label), []).append(json.loads(m.group(2)))
print(f"{'scenario':10s} {'metric':22s} {'before':>9s} {'after':>9s}")
for s in scen:
    for k in keys:
        a = [x[k] for x in res.get((s, 'old'), []) if x.get(k) is not None]
        b = [x[k] for x in res.get((s, 'new'), []) if x.get(k) is not None]
        if a and b:
            print(f"{s:10s} {k:22s} {statistics.mean(a):9.1f} {statistics.mean(b):9.1f}")
    print()

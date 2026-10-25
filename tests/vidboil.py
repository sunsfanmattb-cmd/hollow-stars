"""Video boil + loop-seam check for art/anim/*.mp4. Boil = % of pixels whose brightness reverses direction on most
frames (crawling detail, not real motion). Seam = how much the last frame differs from the first (a pop at each loop).
Usage: python3 tests/vidboil.py file.mp4 [...]"""
import sys, subprocess, numpy as np
def frames(f):
    w, h = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).decode().strip().split(','))
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
for f in sys.argv[1:]:
    F = frames(f); d = np.diff(F, axis=0); s = np.sign(np.where(np.abs(d) >= 4, d, 0))
    rev = np.mean((s[1:] * s[:-1]) < 0, axis=0)
    seam = float(np.mean(np.abs(F[-1] - F[0]))); step = float(np.mean(np.abs(d)))
    print(f"{f.split('/')[-1]:10s} boil={np.mean(rev > .3) * 100:5.1f}%  seam/avg-step={seam / max(step, .01):4.1f}x  frames={len(F)}")

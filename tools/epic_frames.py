"""Builds the Epic frame animation layers from the still frames (art/epic/frame_<f>_s.webp, 536x416, art window 480x360 at 28,28).
Every layer is a static image; the game only fades them (opacity), so nothing is repainted while they animate (RENDERING_RULES §1, §7).
  art/epic/frame_<f>_g.webp  faction-coloured halo around the ornament (breathes)
  art/epic/shine_<k>.webp    a soft light on the ornament at one of 6 places around the frame; fading them in turn makes the light travel
  art/epic/glint.webp        a small four-point star for the Epic gem
Usage: python3 tools/epic_frames.py  (prints the shine positions for css/v29.css)"""
import numpy as np
from PIL import Image, ImageFilter
D = 'art/epic/'
GLOW = {'v': (80, 255, 190), 'm': (110, 180, 255), 'c': (255, 50, 70), 'n': (255, 190, 100)}
base = np.asarray(Image.open(D + 'frame_v_s.webp').convert('RGBA')).astype(float) / 255
A = base[..., 3]; H, W = A.shape
yy, xx = np.mgrid[0:H, 0:W]
solid = (A > .8).astype(float)
win = np.zeros((H, W)); win[28:388, 28:508] = 1
gem = ((xx > 462) & (yy < 58)).astype(float)
for f, col in GLOW.items():
    g = np.asarray(Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(float) / 255
    inner = np.clip(g * 2.2, 0, 1) * win * .75                      # a thin light along the painting's edge
    outer = np.asarray(Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float) / 255
    edge = np.clip(outer * (1 - solid) * 2, 0, 1) * (1 - win) * .9     # and around the outside of the frame
    g = np.maximum(inner, edge) * (1 - gem)
    out = np.dstack([np.full((H, W), c) for c in col] + [g * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(D + f'frame_{f}_g.webp', quality=82, method=6)
css = []
# 6 places around the ring, clockwise from the top left
P = [(.12, .10), (.50, .04), (.88, .10), (.90, .88), (.50, .96), (.10, .88)]
L = base[..., :3].mean(axis=2)
body = np.clip((L - .18) / .35, 0, 1) * np.clip(A / .12, 0, 1) * (1 - ((xx > 462) & (yy < 58)))   # the light ornament, not the dark ground or the gem
for k, (px, py) in enumerate(P):
    d2 = ((xx - px * W) / (W * .26)) ** 2 + ((yy - py * H) / (H * .30)) ** 2
    m = np.exp(-d2 * 2.2) * body
    out = np.dstack([np.full((H, W), 255), np.full((H, W), 246), np.full((H, W), 225), np.clip(m * 1.5, 0, 1) * 255]).astype(np.uint8)
    ys, xs = np.nonzero(out[..., 3] > 3); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1   # crop: a small layer, not a full-frame one
    Image.fromarray(out[y0:y1, x0:x1], 'RGBA').save(D + f'shine_{k}.webp', quality=82, method=6)
    css.append(f'.efr>.efh:nth-of-type({k + 1}){{background-image:url(../art/epic/shine_{k}.webp);left:{x0 / W * 100:.2f}%;top:{y0 / H * 100:.2f}%;width:{(x1 - x0) / W * 100:.2f}%;height:{(y1 - y0) / H * 100:.2f}%;inset:auto}}')
# gem glint, 64x64
S = 64; y, x = np.mgrid[0:S, 0:S] - S / 2 + .5
r = np.hypot(x, y)
star = np.maximum(np.exp(-(np.abs(x) / 1.4) ** 2 - (np.abs(y) / 20) ** 2), np.exp(-(np.abs(y) / 1.4) ** 2 - (np.abs(x) / 20) ** 2))
core = np.exp(-(r / 5) ** 2)
a = np.clip(np.maximum(star, core) * (1 - np.clip((r - 26) / 6, 0, 1)), 0, 1)
Image.fromarray(np.dstack([np.full((S, S), 255), np.full((S, S), 245), np.full((S, S), 255), a * 255]).astype(np.uint8), 'RGBA').save(D + 'glint.webp', quality=90, method=6)
print('\n'.join(css))

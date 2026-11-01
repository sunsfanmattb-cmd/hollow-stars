"""Paints art/ui/void.webp: the backdrop of the pack opening (v2.3).
Near-black cosmic fog in bruise violet and dirty olive, dark tendrils reaching in from the edges toward a starless rift whose
rim smoulders a dim blood-ochre, a few dying stars, film grain. Same mood as the menu painting (art/ui/menu_bg*.webp).
Square, so background-size:cover crops it for both landscape and portrait. Deterministic (seeded).
Usage: python3 tools/make_void.py [out.webp] [size]"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import map_coordinates, gaussian_filter

out = sys.argv[1] if len(sys.argv) > 1 else 'art/ui/void.webp'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
rng = np.random.default_rng(1729)

def fractal(n, beta, seed):
    """1/f^beta noise via spectral synthesis, normalised to 0..1 (tileable)."""
    r = np.random.default_rng(seed)
    fx = np.fft.fftfreq(n)[:, None]; fy = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx * fx + fy * fy); f[0, 0] = 1
    spec = (r.normal(size=(n, n)) + 1j * r.normal(size=(n, n))) / f ** beta
    spec[0, 0] = 0
    a = np.real(np.fft.ifft2(spec))
    return (a - a.min()) / (a.max() - a.min())

n = N // 2  # paint at half size, upscale with a soft filter at the end (painterly, and fast)
yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
cx = cy = n / 2
dx, dy = (xx - cx) / n, (yy - cy) / n
rad = np.sqrt(dx * dx + dy * dy)            # 0 centre .. ~.7 corners
ang = np.arctan2(dy, dx)

# domain-warped fog: swirls that lean inward, toward the rift
w1, w2 = fractal(n, 1.55, 11), fractal(n, 1.55, 12)
swirl = 0.9 * np.exp(-rad * 3.2)
wx = xx + (w1 - .5) * n * .22 + np.cos(ang + np.pi / 2) * swirl * n * .06
wy = yy + (w2 - .5) * n * .22 + np.sin(ang + np.pi / 2) * swirl * n * .06
fogA = map_coordinates(fractal(n, 1.35, 13), [wy % n, wx % n], order=1, mode='wrap')
fogB = map_coordinates(fractal(n, 1.9, 14), [wy % n, wx % n], order=1, mode='wrap')

# tendrils: a few dark, tapering limbs that curl in from the rim toward the rift (thick outside, thin at the tip)
tn = np.zeros((n, n), np.float32)
wob = fractal(n, 1.7, 22)
for i in range(11):
    a0 = i / 11 * 2 * np.pi + rng.uniform(-.25, .25); tip = rng.uniform(.13, .3); curl = rng.uniform(-.9, .9); ph = rng.uniform(0, 6.3)
    th = a0 + curl * (rad - tip) * 2.2 + .18 * np.sin(rad * 18 + ph) + (wob - .5) * .35
    d = np.angle(np.exp(1j * (ang - th)))                    # angular distance to the limb's centre line
    width = np.clip((rad - tip) / (.7 - tip), 0, 1) ** .62 * rng.uniform(.3, .58) + .006
    tn = np.maximum(tn, np.clip(1 - np.abs(d) / width, 0, 1) ** .55 * (rad > tip))
tn = np.clip(tn * (.75 + .5 * fractal(n, 1.3, 23)), 0, 1)
tendril = np.clip((tn - .25) / .5, 0, 1)

# palette (linear rgb): void, bruise violet, dirty olive, old blood
black = np.array([0., 0., 0.]); violet = np.array([.045, .022, .06]); olive = np.array([.05, .048, .028]); rust = np.array([.13, .03, .018])
fog = np.clip(fogA * 1.3 - .35, 0, 1) ** 1.9
img = black + violet * fog[..., None] * 1.1
oliveMask = np.clip(fogB * 1.5 - .6, 0, 1) ** 1.2 * np.clip(rad * 2.4 - .4, 0, 1)
img = img + olive * oliveMask[..., None]

# the rift: a starless core; its rim smoulders unevenly (broken by noise), a dim corona leaks outward
ripple = fractal(n, 1.6, 31)
rr = rad * (1 + (ripple - .5) * .32)
core = np.clip((rr - .075) / .022, 0, 1)
broken = np.clip(map_coordinates(fractal(n, 1.2, 32), [((ang / np.pi + 1) * n * .5) % n, (rad * n * .3) % n], order=1, mode='wrap') * 2.2 - .7, 0, 1)
rim = np.exp(-((rr - .088) / .012) ** 2) * broken
halo = np.exp(-((rr - .1) / .11) ** 2) * (.35 + .65 * fogA)
img = img + rust * (rim * 1.5 + halo * .55)[..., None]
img = img * core[..., None]

# tendrils swallow the light; their edges catch a little rust only near the rift
img = img * (1 - tendril[..., None] * .95)
edge = np.clip(gaussian_filter(tendril, 1.5) - tendril, 0, 1)
img = img + rust * edge[..., None] * 1.2 * np.exp(-(rad - .1).clip(0) * 6)[..., None]

# vignette: the edges fall into nothing
img = img * (1 - np.clip((rad - .24) / .44, 0, 1) ** 1.3 * .9)[..., None]

# a few dying stars, never near the rift, mostly dim and warm
stars = np.zeros((n, n))
k = int(n * n * .00028)
sx, sy = rng.integers(0, n, k), rng.integers(0, n, k)
ok = rad[sy, sx] > .22
stars[sy[ok], sx[ok]] = rng.random(ok.sum()) ** 4 * .9
stars = gaussian_filter(stars, .7) * 1.6
img = img + np.array([.75, .7, .62]) * stars[..., None] * (1 - tendril[..., None])

img = np.clip(img, 0, 1) ** (1 / 2.0)  # to display gamma
im = Image.fromarray((img * 255).astype(np.uint8)).resize((N, N), Image.LANCZOS).filter(ImageFilter.GaussianBlur(.6))
a = np.asarray(im).astype(np.float32)
a += rng.normal(0, 2.6, a.shape[:2])[..., None]  # film grain
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(out, 'WEBP', quality=80, method=6)
print('wrote', out, N)

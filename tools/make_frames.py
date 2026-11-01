"""Paints the four faction card frames (v2.4): art/ui/cf_v.webp, cf_m.webp, cf_c.webp, cf_n.webp (480x672, with alpha).
  v  The Abyss       wet, barnacled bronze with verdigris; a faint teal glow along the inner edge
  m  The Derelict    riveted, scratched hull plating; hazard stripes; small warning lamps
  c  Red Communion   carved bone border over stitched leather; old blood stains
  n  Wanderers       worn canvas with patched, riveted metal
Every frame gets a light print grain and worn, chipped corners (cut into the alpha, pale card stock showing at the chips).
The card layout (art window, name bar, text box) covers the middle, so detail lives on the border band and the gaps.
Painted at 2x and downsampled. Seeded, so it is reproducible.  Usage: python3 tools/make_frames.py [outdir]"""
import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'art/ui'
W, H = 960, 1344            # 2x; saved at 480x672
B = int(W * .066)           # border band
RAD = int(W * .06)          # corner radius (matches the card's border-radius)

def fractal(shape, beta, seed):
    r = np.random.default_rng(seed); h, w = shape
    fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx * fx + fy * fy); f[0, 0] = 1
    a = np.real(np.fft.ifft2((r.normal(size=shape) + 1j * r.normal(size=shape)) / f ** beta))
    return (a - a.min()) / (a.max() - a.min())

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# distance into the card from its edge (rounded-rect aware), in px
def edge_dist():
    dx = np.minimum(xx, W - 1 - xx); dy = np.minimum(yy, H - 1 - yy)
    d = np.minimum(dx, dy)
    cx = np.where(xx < RAD, RAD - xx, np.where(xx > W - 1 - RAD, xx - (W - 1 - RAD), 0))
    cy = np.where(yy < RAD, RAD - yy, np.where(yy > H - 1 - RAD, yy - (H - 1 - RAD), 0))
    corner = (cx > 0) & (cy > 0)
    d = np.where(corner, RAD - np.sqrt(cx * cx + cy * cy), d)
    return d
ED = edge_dist()
band = np.clip(1 - (ED - B) / 6, 0, 1)          # 1 on the border band, fading at its inner edge
inner_rim = np.exp(-((ED - B) / 3.5) ** 2)       # the line where band meets the panel

def mix(a, b, t):
    return a * (1 - t[..., None]) + b * t[..., None]
def col(*c):
    return np.array(c, np.float32) / 255

def bevel(img, strength=.5):
    """light top-left / dark bottom-right relief along the outer edge and the band's inner edge"""
    sh = np.zeros((H, W), np.float32)
    outer = np.exp(-(ED / 5) ** 2); inn = inner_rim
    lit = ((W - xx) / W * .5 + (H - yy) / H * .5)
    sh += (outer + inn * .8) * (lit - .5) * 2
    return np.clip(img * (1 + sh[..., None] * strength), 0, 1)

def chips(seed, rgba):
    """worn, chipped corners: notches cut into alpha, pale card stock around them, rubbed light edges near corners"""
    r = np.random.default_rng(seed)
    a = Image.fromarray((np.clip(ED + .5, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(a); wear = Image.new('L', (W, H), 0); dw = ImageDraw.Draw(wear)
    corners = [(0, 0, 1, 1), (W, 0, -1, 1), (0, H, 1, -1), (W, H, -1, -1)]
    for (cx, cy, sx, sy) in corners:
        for k in range(r.integers(2, 4)):
            t = r.uniform(.15, 1.1); ang = math.pi / 4 + r.uniform(-.75, .75)
            px = cx + sx * (RAD * (1 - math.cos(ang)) * t + r.uniform(0, 14)); py = cy + sy * (RAD * (1 - math.sin(ang)) * t + r.uniform(0, 14))
            s = r.uniform(6, 15); pts = [(px + sx * s * math.cos(q) * r.uniform(.5, 1.2), py + sy * s * math.sin(q) * r.uniform(.5, 1.2)) for q in np.linspace(-.6, 2.2, 6)]
            d.polygon(pts, fill=0); dw.polygon([(x + sx * 3, y + sy * 3) for x, y in pts], fill=255)
    for k in range(r.integers(3, 6)):   # a few nicks along the edges
        side = r.integers(4); u = r.uniform(.15, .85); s = r.uniform(3, 7)
        x, y = [(u * W, 0), (u * W, H), (0, u * H), (W, u * H)][side]
        pts = [(x + r.uniform(-s, s) * 1.6, y + r.uniform(-s, s)) for _ in range(5)]
        d.polygon(pts, fill=0); dw.polygon(pts, fill=160)
    alpha = np.asarray(a).astype(np.float32) / 255
    wear = gaussian_filter(np.asarray(wear).astype(np.float32) / 255, 4)
    rub = np.exp(-(ED / 9) ** 2) * np.clip(1 - np.minimum(np.minimum(xx, W - xx), 1e9) * 0, 0, 1)
    near_corner = np.exp(-((np.minimum(xx, W - xx) ** 2 + np.minimum(yy, H - yy) ** 2) / (RAD * 2.4) ** 2))
    stock = col(214, 204, 184)
    k = np.clip(wear * 1.4 + rub * near_corner * .55, 0, .85) * (fractal((H, W), 1.1, seed + 5) > .38)
    rgba[..., :3] = mix(rgba[..., :3], stock, k * alpha)
    rgba[..., 3] = alpha
    return rgba

def grain(img, seed, amt=.045):
    r = np.random.default_rng(seed)
    n = r.normal(0, 1, (H, W)).astype(np.float32)
    paper = gaussian_filter(r.normal(0, 1, (H, W)).astype(np.float32), 1.2)   # fibrous print texture
    return np.clip(img + (n * amt * .6 + paper * amt)[..., None], 0, 1)

def panel(base, seed):
    """the dark interior behind the text: subtle, so text stays readable"""
    t = fractal((H, W), 1.6, seed)
    return base * (.8 + .4 * t[..., None])

# ------------------------------------------------------------------ ABYSS
def abyss():
    s = 101; r = np.random.default_rng(s)
    n1, n2 = fractal((H, W), 1.7, s), fractal((H, W), 1.25, s + 1)
    bronze = mix(col(92, 64, 34), col(150, 108, 58), n1)
    verd = col(44, 112, 98)
    pat = np.clip((n2 - .5) * 3.2 + .2, 0, 1) ** 1.4
    metal = mix(bronze, verd, pat * .85)
    wet = np.clip(fractal((H, W), 1.9, s + 2) * 1.8 - 1.1, 0, 1)        # wet sheen streaks
    metal = metal * (.62 + .5 * n1[..., None]) + wet[..., None] * col(120, 160, 150) * .35
    inside = panel(col(8, 14, 18), s + 3)
    img = mix(inside, metal, band)
    img = bevel(img, .6)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # barnacles clustered along the band, densest at the corners
    for i in range(380):
        side = r.integers(4); u = r.uniform(0, 1)
        if r.random() < .55: u = r.choice([r.uniform(0, .16), r.uniform(.84, 1)])
        off = abs(r.normal(0, B * .32))
        x, y = [(u * W, off), (u * W, H - off), (off, u * H), (W - off, u * H)][side]
        if min(x, W - x) < RAD * .6 and min(y, H - y) < RAD * .6: continue
        rr = r.uniform(3, 11) * (1.4 if r.random() < .15 else 1)
        shade = int(r.uniform(85, 140))
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(shade, shade - 12, shade - 30), outline=(40, 34, 26))
        d.ellipse([x - rr * .55, y - rr * .55, x + rr * .55, y + rr * .55], fill=(int(shade * .55), int(shade * .5), int(shade * .42)))
        d.ellipse([x - rr * .22, y - rr * .22, x + rr * .22, y + rr * .22], fill=(14, 12, 10))
        d.arc([x - rr, y - rr, x + rr, y + rr], 210, 290, fill=(int(shade * 1.35), int(shade * 1.3), int(shade * 1.15)), width=1)
    img = np.asarray(im).astype(np.float32) / 255
    # faint teal glow along the band's inner edge
    glow = gaussian_filter(inner_rim, 6) * 1.6 + np.exp(-((ED - B - 4) / 14) ** 2) * .35
    img = img + glow[..., None] * col(40, 200, 180) * .17
    img = grain(img, s + 9)
    rgba = np.dstack([img, np.ones((H, W), np.float32)])
    return chips(s + 7, rgba)

# ------------------------------------------------------------------ DERELICT
def derelict():
    s = 202; r = np.random.default_rng(s)
    n1 = fractal((H, W), 1.6, s)
    steel = mix(col(46, 54, 58), col(84, 96, 100), n1) * (.85 + .3 * fractal((H, W), 1.0, s + 1)[..., None])
    rust = np.clip(fractal((H, W), 1.4, s + 2) * 2.4 - 1.55, 0, 1)
    steel = mix(steel, col(110, 58, 26), rust * .7)
    inside = panel(col(10, 13, 14), s + 3)
    img = mix(inside, steel, band)
    img = bevel(img, .7)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # plate seams across the band
    for x in list(range(int(W * .24), W, int(W * .26))):
        d.line([(x, 0), (x, B)], fill=(14, 16, 18), width=3); d.line([(x + 3, 0), (x + 3, B)], fill=(120, 132, 136), width=1)
        d.line([(x, H - B), (x, H)], fill=(14, 16, 18), width=3)
    for y in list(range(int(H * .2), H, int(H * .2))):
        d.line([(0, y), (B, y)], fill=(14, 16, 18), width=3); d.line([(W - B, y), (W, y)], fill=(14, 16, 18), width=3)
        d.line([(0, y + 3), (B, y + 3)], fill=(120, 132, 136), width=1); d.line([(W - B, y + 3), (W, y + 3)], fill=(120, 132, 136), width=1)
    # scratches
    for i in range(260):
        side = r.integers(4); u = r.uniform(0, 1); o = r.uniform(4, B - 4)
        x, y = [(u * W, o), (u * W, H - o), (o, u * H), (W - o, u * H)][side]; a = r.uniform(0, math.pi); L = r.uniform(6, 26)
        c = int(r.uniform(110, 190)); d.line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], fill=(c, c + 6, c + 8), width=1)
    # rivets along the band
    def rivet(x, y):
        d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(30, 34, 36)); d.ellipse([x - 5, y - 5, x + 4, y + 4], fill=(150, 160, 162)); d.ellipse([x - 2, y - 3, x + 1, y], fill=(220, 226, 228))
    for x in range(int(RAD * 1.4), W - int(RAD * 1.2), 46): rivet(x, B * .5); rivet(x, H - B * .5)
    for y in range(int(RAD * 1.4), H - int(RAD * 1.2), 46): rivet(B * .5, y); rivet(W - B * .5, y)
    # hazard stripes on the bottom band
    hz = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dh = ImageDraw.Draw(hz)
    y0, y1 = H - B + 10, H - 10
    for i in range(-40, W + 40, 44):
        dh.polygon([(i, y1), (i + 22, y1), (i + 22 + (y1 - y0), y0), (i + (y1 - y0), y0)], fill=(206, 160, 30, 235))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle([int(W * .3), y0, int(W * .7), y1], fill=255)
    im.paste(hz, (0, 0), Image.fromarray((np.asarray(m) * (np.asarray(hz)[..., 3] / 255)).astype(np.uint8)))
    d.rectangle([int(W * .3) - 2, y0 - 2, int(W * .7) + 2, y1 + 2], outline=(14, 14, 12), width=3)
    # warning lamps (dim when painted; CSS makes them blink in the zoom / hand)
    for (x, y, c) in [(W * .2, B * .5, (200, 40, 20)), (W * .8, B * .5, (220, 140, 20))]:
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(20, 18, 16)); d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=c); d.ellipse([x - 3, y - 4, x, y - 1], fill=(255, 230, 200))
    img = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    img = img + gaussian_filter(inner_rim, 3)[..., None] * col(120, 200, 210) * .12
    img = grain(img, s + 9, .05)
    rgba = np.dstack([img, np.ones((H, W), np.float32)])
    return chips(s + 7, rgba)

# ------------------------------------------------------------------ RED COMMUNION
def communion():
    s = 303; r = np.random.default_rng(s)
    n1 = fractal((H, W), 1.5, s)
    leather = mix(col(58, 20, 16), col(96, 36, 26), n1) * (.75 + .5 * fractal((H, W), .9, s + 1)[..., None])
    inside = panel(col(16, 6, 6), s + 3)
    inside = mix(inside, leather * .45, np.clip(1 - (ED - B) / (B * 1.4), 0, 1))       # leather shows near the band
    bone_c = mix(col(118, 98, 66), col(196, 178, 138), fractal((H, W), 1.8, s + 4))
    bone = bone_c * .55                                  # the dark gaps between segments
    img = mix(inside, bone, band)
    img = bevel(img, .55)
    # old blood: stains, drips from the top band, darker at the edges
    st = np.clip(fractal((H, W), 1.3, s + 5) * 2.6 - 1.65, 0, 1)
    img = mix(img, col(70, 6, 8), st * .75)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # carved bone: a chain of vertebrae around the band, each a shaded rounded piece with a groove and a knob
    def vert(cx, cy, L, T, horiz):
        sh = int(r.uniform(128, 178)); w, h = (L, T) if horiz else (T, L)
        box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
        d.rounded_rectangle(box, radius=min(w, h) * .45, fill=(int(sh * .55), int(sh * .47), int(sh * .34)))
        ins = 3; d.rounded_rectangle([box[0] + ins, box[1] + ins, box[2] - ins, box[3] - ins], radius=min(w, h) * .4, fill=(sh, int(sh * .9), int(sh * .7)))
        hl = [box[0] + 5, box[1] + 4, box[2] - 5, cy - (0 if horiz else 0)] if horiz else [box[0] + 4, box[1] + 5, cx, box[3] - 5]
        d.rounded_rectangle(hl, radius=4, fill=(min(255, int(sh * 1.12)), min(255, int(sh * 1.04)), int(sh * .84)))
        if horiz: d.line([(box[0] + 8, cy), (box[2] - 8, cy)], fill=(int(sh * .42), int(sh * .34), int(sh * .24)), width=2)
        else: d.line([(cx, box[1] + 8), (cx, box[3] - 8)], fill=(int(sh * .42), int(sh * .34), int(sh * .24)), width=2)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(int(sh * .38), int(sh * .3), int(sh * .2))); d.ellipse([cx - 3, cy - 4, cx + 1, cy], fill=(min(255, int(sh * 1.15)), int(sh * 1.05), int(sh * .85)))
    T = B * .72; L = 52
    for x in np.arange(RAD + L / 2, W - RAD - L / 2 + 1, L + 4): vert(x, B * .5, L, T, True); vert(x, H - B * .5, L, T, True)
    for y in np.arange(RAD + L / 2, H - RAD - L / 2 + 1, L + 4): vert(B * .5, y, L, T, False); vert(W - B * .5, y, L, T, False)
    for (x, y) in [(B * .5, B * .5), (W - B * .5, B * .5), (B * .5, H - B * .5), (W - B * .5, H - B * .5)]:   # skull-knot at each corner
        d.ellipse([x - T * .62, y - T * .62, x + T * .62, y + T * .62], fill=(150, 132, 100)); d.ellipse([x - T * .5, y - T * .5, x + T * .5, y + T * .5], fill=(200, 182, 144))
        d.ellipse([x - T * .3, y - T * .12, x - T * .06, y + T * .14], fill=(30, 18, 12)); d.ellipse([x + T * .06, y - T * .12, x + T * .3, y + T * .14], fill=(30, 18, 12))
    # stains over the bone too
    stn = np.clip(fractal((H, W), 1.3, s + 8) * 2.6 - 1.7, 0, 1) * band
    a_ = np.asarray(im).astype(np.float32) / 255; a_ = mix(a_, col(74, 8, 8), stn * .75)
    im = Image.fromarray((np.clip(a_, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for i in range(18):
        x = r.uniform(RAD, W - RAD); L = r.uniform(10, 70); w = r.uniform(2, 5)
        d.line([(x, B * .7), (x, B * .7 + L)], fill=(80, 6, 10), width=int(w)); d.ellipse([x - w, B * .7 + L - w, x + w, B * .7 + L + w * 1.3], fill=(80, 6, 10))
    # stitching along the inside of the band
    off = B + 9
    for (x0, y0, x1, y1) in [(off, off, W - off, off), (off, H - off, W - off, H - off), (off, off, off, H - off), (W - off, off, W - off, H - off)]:
        L = math.hypot(x1 - x0, y1 - y0); n = int(L / 16)
        for k in range(n):
            t0, t1 = k / n, (k + .55) / n
            d.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0), (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=(170, 140, 100), width=3)
    img = np.asarray(im).astype(np.float32) / 255
    img = grain(img, s + 9, .05)
    rgba = np.dstack([img, np.ones((H, W), np.float32)])
    return chips(s + 7, rgba)

# ------------------------------------------------------------------ WANDERERS
def wanderers():
    s = 404; r = np.random.default_rng(s)
    weave = (np.sin(xx / 3.1) * .5 + .5) * .5 + (np.sin(yy / 3.1) * .5 + .5) * .5
    can_n = fractal((H, W), 1.3, s)
    canvas = mix(col(92, 84, 64), col(150, 138, 108), can_n) * (.82 + .3 * weave[..., None])
    canvas = mix(canvas, col(60, 52, 40), np.clip(fractal((H, W), 1.5, s + 1) * 2 - 1.1, 0, 1) * .6)     # grime
    inside = panel(col(14, 14, 13), s + 3)
    img = mix(inside, canvas, band)
    img = bevel(img, .45)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # patched metal plates at the corners and one on a side, riveted
    def patch(x0, y0, w, h, rot):
        p = Image.new('RGBA', (int(w) + 20, int(h) + 20), (0, 0, 0, 0)); dp = ImageDraw.Draw(p)
        c = int(r.uniform(70, 100)); dp.rectangle([10, 10, 10 + w, 10 + h], fill=(c, c + 4, c + 6, 255), outline=(20, 20, 20, 255), width=3)
        for i in range(30):
            a, b = r.uniform(10, 10 + w), r.uniform(10, 10 + h); cc = int(r.uniform(110, 170)); dp.line([(a, b), (a + r.uniform(-12, 12), b + r.uniform(-4, 4))], fill=(cc, cc, cc, 200))
        for (a, b) in [(18, 18), (w + 2, 18), (18, h + 2), (w + 2, h + 2)]:
            dp.ellipse([a - 4, b - 4, a + 4, b + 4], fill=(40, 40, 40, 255)); dp.ellipse([a - 3, b - 3, a + 2, b + 2], fill=(170, 170, 160, 255))
        p = p.rotate(rot, resample=Image.BICUBIC, expand=True); im.paste(p, (int(x0), int(y0)), p)
    patch(6, 6, 120, 70, r.uniform(-6, 6)); patch(W - 150, H - 96, 132, 78, r.uniform(-6, 6)); patch(W - 64, H * .42, 56, 120, r.uniform(-4, 4)); patch(2, H * .7, 58, 96, r.uniform(-4, 4))
    # running stitch and fraying where canvas meets the panel
    off = B - 6
    for (x0, y0, x1, y1) in [(off, off, W - off, off), (off, H - off, W - off, H - off), (off, off, off, H - off), (W - off, off, W - off, H - off)]:
        L = math.hypot(x1 - x0, y1 - y0); n = int(L / 20)
        for k in range(n):
            t0, t1 = k / n, (k + .5) / n
            d.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0), (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=(196, 182, 140), width=2)
    img = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    img = grain(img, s + 9, .055)
    rgba = np.dstack([img, np.ones((H, W), np.float32)])
    return chips(s + 7, rgba)

for f, fn in [('v', abyss), ('m', derelict), ('c', communion), ('n', wanderers)]:
    a = fn()
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA').resize((W // 2, H // 2), Image.LANCZOS)
    im.save(f'{OUT}/cf_{f}.webp', 'WEBP', quality=84, method=6)
    print('wrote', f'{OUT}/cf_{f}.webp')

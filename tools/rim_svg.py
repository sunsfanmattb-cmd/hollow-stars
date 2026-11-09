"""Prints the CSS for the Uncommon/Rare/Epic rarity trims as SVG images (no mask: RENDERING_RULES §7).
The trim box is the card inset 1.3% (974 x 1364 in card-width thousandths); stroke widths match the old .13em/.16em padding.
Usage: python3 tools/rim_svg.py  (paste the output into css/v24.css / css/v29.css)"""
from urllib.parse import quote
W, H = 974, 1364
def svg(paint_defs, stroke, sw):
    h = sw / 2
    s = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' preserveAspectRatio='none'><defs>{paint_defs}</defs>"
         f"<rect x='{h}' y='{h}' width='{W - sw}' height='{H - sw}' rx='{52 - h:.1f}' fill='none' stroke='{stroke}' stroke-width='{sw}'/></svg>")
    return 'url("data:image/svg+xml,' + quote(s, safe="/:=' ") + '")'
def lin(stops):
    return ("<linearGradient id='g' x1='.18' y1='0' x2='.82' y2='1'>" +
            ''.join(f"<stop offset='{o}' stop-color='{c}'/>" for o, c in stops) + "</linearGradient>")
def hi(cx, cy, col):
    return (f"<radialGradient id='h' cx='{cx}' cy='{cy}' r='.32'><stop offset='0' stop-color='{col}'/>"
            f"<stop offset='.5' stop-color='{col}' stop-opacity='.45'/><stop offset='1' stop-color='{col}' stop-opacity='0'/></radialGradient>")
RIM = {'U': (9.4, [(0, '#e2e6e8'), (.3, '#6e767c'), (.55, '#c4cacd'), (.8, '#5a6064'), (1, '#b8bec2')], None),
       'R': (11.5, [(0, '#fff0c0'), (.28, '#9a7024'), (.52, '#e8c470'), (.78, '#7a5418'), (1, '#f0d898')], '#fff8e0'),
       'E': (11.5, [(0, '#e8d0ff'), (.26, '#5a2a8a'), (.5, '#b08ad8'), (.76, '#2a1040'), (1, '#d8c0f0')], '#f0e0ff')}
for r, (sw, stops, hc) in RIM.items():
    print(f".card.r-{r} .rim{{background:{svg(lin(stops), 'url(#g)', sw)} 0 0/100% 100%}}")
    if hc:
        print(f".card.r-{r} .rim::after{{background-image:{svg(hi(.66, .02, hc), 'url(#h)', sw)}}}")
        print(f".card.r-{r} .rim::before{{background-image:{svg(hi(.3, .98, hc), 'url(#h)', sw)}}}")

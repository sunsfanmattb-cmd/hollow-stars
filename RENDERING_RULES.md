# Hollow Stars rendering rules

Read this before changing card visuals, animations, video, art or menus. Every rule here came from a measured problem
(lag, battery drain, flicker or pop-in on phones). The section numbers are cited in code comments.

## 1. Animate transform and opacity only
Keyframes and transitions move, scale, rotate or fade. They never animate layout (width, top, margin), paint
(colour, box-shadow, background-position) or filters. Those re-paint every frame on the main thread and stutter on phones.

## 2. No blend modes, no animated filters
No `mix-blend-mode`, no `backdrop-filter`, no animated `filter`. A static `filter` (a drop shadow on an image) is fine
when the element never changes size while it is shown.

## 3. Don't fight running animations
Never toggle a class or rebuild the DOM of an element mid-animation. Restart an effect with `restartCls()` (remove,
force a reflow, add). One element is driven by one thing only: either a keyframe animation or a JS-set transform, never both.

## 4. Legendary living art (video and keyframes)
- Legendary motion is CSS keyframes on transform/opacity. No per-frame JS writes styles.
- Loop durations divide `LGP` (240 s). Each card gets a negative `animation-delay` from a global clock plus a per-card
  phase, so a card that is re-created (zoom, re-render, pack reveal) continues mid-motion instead of restarting.
- Animated videos (`art/anim/*.mp4`) are muted and `playsinline`, play only where a card is shown large, and must loop
  seamlessly: run new clips through `tools/loopfix.py` and check them with `tests/vidboil.py`.

## 5. Layer budget
`will-change` and endless animations only where a card is shown large: the zoom, the pack reveal, the hand card you hold
or selected, and the dragged card (`:is(#zoom .card,.pfront .card,#sheet .card,#hand .card.held,#hand .card.sel)`).
Cards more than 160 px off screen, or in a hidden screen, get `.zz`, which removes their animations and layers.

## 6. Images
Card art is WebP, 600x840 full size plus a 360x504 copy in `art/s/` for the hand, board, grids and packs. Big art
is decoded before the zoom shows it (`BIG` cache), so the zoom never pops in.

## 7. Zoom and tilt surfaces (v2.5)
No `perspective()` on the tilting card (it re-rasters the whole card every frame). No masks or rounded clips inside the
composited card. Opening a modal hides the screens behind it (`body.zmod`), so they don't stack GPU layers.

## 8. Quality tiers and motion settings
Every effect honours `body.q-low` / `body.fxlow` (quality setting or automatic downgrade) and
`prefers-reduced-motion`. New effects need a cheap or static fallback for both.

## 9. Text auto-fit
Card names, type lines and deck names carry `data-fit`. CSS multiplies their base font size by `--fit`, which a
ResizeObserver sets once per text and box size. There is no per-frame layout.

## 10. Tilt
One 3D element (the card) rotates, clamped to ±`ZTMAX` degrees; everything inside is flat 2D. The light is a
pre-rendered oversized gradient that only translates, driven by the same rAF value as the tilt.

## 11. Battery saver
After 10 s without input, `body.idle` pauses every CSS loop and the background and quality loops stop requesting
frames. When the page is hidden, the AudioContext is suspended too. Any input wakes everything on the next frame.
Screens use static styling, with transitions on transform/opacity only.

## 12. Checks before shipping visual changes
`tests/smoke.py`, `tests/perfprobe.py` / `tests/perfcompare.py` (frame cost on a slowed phone), `tests/flickermap.py`
(shimmer), `tests/tilt_jitter.py`, `tests/idlewake.py` (battery wake-ups), `tests/layout_sweep.py` (every screen at
six sizes) and `tests/style_snapshot.py` (proves a CSS cleanup changed no computed style).

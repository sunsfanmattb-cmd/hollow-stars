# hollow-stars
Hollow Stars - a card game of cosmic dread

## Layout
- `index.html` – page markup; loads the stylesheets and scripts below in order.
- `css/` – `base.css` (frame, cards, match), `fx.css` (combat effects, foil, living art), `screens.css` (menus and modes), `polish.css` (v1.8 effects + v1.9 performance rules), `packs.css` (v1.9 pack opening), `board3d.css` (v2.0 3D table), `v23.css` (v2.3 turn log, composited-only combat animations, pack opening rework), `v24.css` (v2.4 faction frames, rarity trims, print grain, drifting particles, flavour text, holographic foils), `v25.css` (v2.5 flicker-free zoom, faction stat badges), `v26.css` (v2.6 store, pack odds, save backups).
- `js/` – loaded in numeric order, sharing one global scope:
  `00-econ` v2.6 every reward, price, drop rate and store product (tune the economy here) · `00-save` v2.6 versioned saves, upgrades, tamper check, backup codes · `01-core` data · `02-rules-ai` rules and AI · `03-art` procedural art · `04-badges` v2.5 faction Flux/Attack/Health badges (built once as images) · `04-engine` battery saver, audio, background ·
  `05-ui` screens, decks, match UI, input · `06-fx` effects engine, tilt, foil · `07-progress` campaign, quests, crafting ·
  `08-modes` gauntlet, weekly, codex, achievements · `09-boot` start-up (runs last) · `10-polish` v1.8 haptics, stingers, end sequence, smoother tilt · `11-perf` v1.9 performance and battery · `12-packs` v1.9 pack opening · `13-board3d` v2.0 3D table (WebGL, per-faction lighting and grade), card swing · `14-turnlog` v2.3 turn log (history of plays, attacks and triggered effects; hover/tap a tile for details) · `15-cards` v2.4 particle and grain textures, holographic pull flare. · `16-store` v2.6 store screen, payment provider hook (test mode for now), pack odds, Welcome Legendary picker, save backup/restore
k.py` (v1.8 features), `tilt_jitter.py` (tilt smoothness), `perfprobe.py` / `perfcompare.py` (frame and GPU cost on a simulated phone), `idlewake.py` (idle wake-ups, a battery proxy), `flickermap.py` (shimmer at phone pixel density), `vidboil.py` (video loop seams), `soak.py` (many matches, leaks), `chaos.py` (random taps/quits), `b3shot.py` (3D table screenshots; needs a local web server, e.g. `python3 -m http.server`).
- `tools/loopfix.py` – makes a legendary animation loop seamlessly (use for new `art/anim/*.mp4`).
- `tools/make_void.py` – paints `art/ui/void.webp`, the pack-opening backdrop (seeded, reproducible).
- `tools/make_frames.py` – paints the four faction card frames `art/ui/cf_*.webp` (seeded, reproducible).

Open `index.html` in a browser to play. Tests need Python Playwright: `python3 tests/smoke.py`.

## Economy and store (v2.6)
- All numbers live in `js/00-econ.js`: match rewards (win 15, loss 5, first win of the day +50), daily quests (one new per day, up to 3 waiting),
  login calendar, weekly challenge, Gauntlet, pack odds and pity (a Legendary within 20 packs, a holo within 50), crafting, store products.
- The store runs in **test mode**: purchases are free and only appear when `ECON.storeTest` is true or the game was opened with `?dev=1`.
  Keep `storeTest` false in releases. Real payments plug in as a provider in `js/16-store.js` (`purchase(p)` and `restore()`).
- Saves: format version in `hsMeta`; collection, progress and modes are signed with a backup copy, so hand edits are rolled back.
  Purchases (`COLL.buys`), paid vs earned packs (`COLL.src`) and the pack log (`COLL.log`) are kept apart, ready for cloud saves.

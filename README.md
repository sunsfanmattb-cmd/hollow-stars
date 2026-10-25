# hollow-stars
Hollow Stars - a card game of cosmic dread

## Layout
- `index.html` – page markup; loads the stylesheets and scripts below in order.
- `css/` – `base.css` (frame, cards, match), `fx.css` (combat effects, foil, living art), `screens.css` (menus and modes), `polish.css` (v1.8 effects).
- `js/` – loaded in numeric order, sharing one global scope:
  `01-core` data · `02-rules-ai` rules and AI · `03-art` procedural art · `04-engine` battery saver, audio, background ·
  `05-ui` screens, decks, match UI, input · `06-fx` effects engine, tilt, foil · `07-progress` campaign, quests, crafting ·
  `08-modes` gauntlet, weekly, codex, achievements · `09-boot` start-up (runs last) · `10-polish` v1.8 haptics, stingers, end sequence, smoother tilt.
- `art/` – card paintings, UI art and animated legendaries.
- `android/` – APK wrapper and build script (see `android/README.md`).
- `tests/` – `smoke.py` (every screen + full match, no JS errors), `polish_check.py` (v1.8 features), `tilt_jitter.py` (tilt smoothness).

Open `index.html` in a browser to play. Tests need Python Playwright: `python3 tests/smoke.py`.

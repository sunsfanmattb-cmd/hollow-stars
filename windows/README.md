# Windows build

An Electron app around the same game files as the web and Android builds. The installer and its updates come from this
repo's GitHub releases.

**Release a new version:** bump nothing by hand, just push a tag:

    git tag v2.6.0
    git push origin v2.6.0

`.github/workflows/windows.yml` then builds `HollowStars-2.6.0-Setup.exe` on a Windows runner and publishes it (with the
`latest.yml` update manifest) as the `v2.6.0` release. Installed games check for it at launch and every 4 hours, download it in
the background and offer to restart; otherwise it installs the next time the game is closed.

- `main.js`: the window (remembers size and fullscreen; F11 or Alt+Enter toggles fullscreen), the updater.
- `package.json`: app id `com.sunsfanmattb.hollowstars`, product name `Hollow Stars` (saves stay in `%APPDATA%\Hollow Stars`,
  where the 1.5.x builds kept them), NSIS installer settings, GitHub publishing.
- `build/icon.ico`, `build/icon.png`: the app icon (the pack sigil).

Build locally (Windows, Node 20): copy `index.html css js art` into `windows/game/`, copy `build/icon.png` to `game/icon.png`,
then `npm install` and `npm run dist`. The installer lands in `windows/dist/`.

The installer is not code-signed, so Windows SmartScreen shows "Windows protected your PC" the first time:
**More info → Run anyway**. Signing needs a paid code-signing certificate.

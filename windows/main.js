'use strict';
/* Hollow Stars for Windows: an Electron shell around the same game files as the web and Android builds (copied into ./game at build
   time, see .github/workflows/windows.yml). Saves live in the browser storage of the file:// page, under %APPDATA%\Hollow Stars,
   the same place the 1.5.x Windows builds kept them, so existing progress carries over.
   Updates: electron-updater checks this repo's GitHub releases at launch and every 4 hours, downloads a newer installer in the
   background and offers to restart into it (or installs it the next time the game is closed). */
const { app, BrowserWindow, Menu, dialog, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');

if (!app.requestSingleInstanceLock()) { app.quit(); return; }

let win = null;
const stateFile = () => path.join(app.getPath('userData'), 'window.json');
function loadState() {
  try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch (e) { return {}; }
}
function saveState() {
  if (!win || win.isDestroyed()) return;
  const s = { full: win.isFullScreen(), max: win.isMaximized(), bounds: win.getNormalBounds() };
  try { fs.writeFileSync(stateFile(), JSON.stringify(s)); } catch (e) {}
}
function onScreen(b) {
  return b && screen.getAllDisplays().some(d => { const a = d.workArea; return b.x < a.x + a.width - 80 && b.x + b.width > a.x + 80 && b.y >= a.y - 20 && b.y < a.y + a.height - 80; });
}

function createWindow() {
  const st = loadState(), b = onScreen(st.bounds) ? st.bounds : { width: 1280, height: 800 };
  win = new BrowserWindow({
    ...b, minWidth: 960, minHeight: 600, show: false, backgroundColor: '#000000', title: 'Hollow Stars',
    icon: path.join(__dirname, 'game', 'icon.png'), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, backgroundThrottling: true, autoplayPolicy: 'no-user-gesture-required' }
  });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  if (st.full) win.setFullScreen(true);
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'game', 'index.html'));
  // F11 / Alt+Enter: fullscreen. F5: reload. Ctrl+Shift+I: developer tools (for bug reports).
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11' || (i.alt && i.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (i.key === 'F5') { win.reload(); e.preventDefault(); }
    else if (i.control && i.shift && i.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });
  // links leave the game for the default browser; the game page itself never navigates away
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  for (const ev of ['resize', 'move', 'enter-full-screen', 'leave-full-screen', 'maximize', 'unmaximize']) win.on(ev, () => { clearTimeout(win._st); win._st = setTimeout(saveState, 400); });
  win.on('close', saveState);
}

/* ---- updates ---- */
function setupUpdates() {
  if (!app.isPackaged) return;
  let autoUpdater;
  try { ({ autoUpdater } = require('electron-updater')); } catch (e) { return; }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = null;
  autoUpdater.on('error', () => {}); // offline or GitHub unreachable: try again later, never bother the player
  autoUpdater.on('update-downloaded', async info => {
    if (!win || win.isDestroyed()) return;
    const r = await dialog.showMessageBox(win, {
      type: 'info', buttons: ['Restart now', 'Later'], defaultId: 0, cancelId: 1, title: 'Hollow Stars update',
      message: `Hollow Stars ${info.version} is ready.`,
      detail: 'Restart to play the new version now, or keep playing: it installs the next time you close the game.'
    });
    if (r.response === 0) autoUpdater.quitAndInstall(false, true);
  });
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 4000);
  setInterval(check, 4 * 60 * 60 * 1000);
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => { createWindow(); setupUpdates(); });
app.on('window-all-closed', () => app.quit());

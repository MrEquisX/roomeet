import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const ventana = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    title: 'ROOMEET',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const rutaIndex = path.join(__dirname, 'dist', 'index.html');

  ventana.loadFile(rutaIndex);
}

app.whenReady().then(function onReady() {
  createWindow();

  app.on('activate', function onActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function onAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

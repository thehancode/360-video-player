const { app, BrowserWindow, dialog, ipcMain, net, protocol } = require('electron');
const { randomUUID } = require('node:crypto');
const { createReadStream, existsSync, statSync } = require('node:fs');
const { basename, extname, join, resolve } = require('node:path');
const { Readable } = require('node:stream');
const { pathToFileURL } = require('node:url');

const isDevelopment = Boolean(process.env.ELECTRON_RENDERER_URL);
const rendererURL = process.env.ELECTRON_RENDERER_URL;
const distDirectory = join(__dirname, '..', 'dist');
const selectedVideos = new Map();

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
  {
    scheme: 'media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);

function getMimeType(ext) {
  switch (ext.toLowerCase()) {
    case '.mp4':
    case '.m4v':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
    case '.ogv':
      return 'video/ogg';
    case '.mov':
      return 'video/quicktime';
    case '.mkv':
      return 'video/x-matroska';
    default:
      return 'application/octet-stream';
  }
}

function mediaURL(filePath) {
  const extension = extname(filePath).toLowerCase();
  const id = randomUUID();
  selectedVideos.set(id, filePath);
  if (selectedVideos.size > 20) {
    const oldestKey = selectedVideos.keys().next().value;
    selectedVideos.delete(oldestKey);
  }
  return `media://video/${id}${extension}`;
}

function isTrustedSender(event) {
  const url = event.senderFrame?.url ?? '';
  if (!isDevelopment) {
    return url.startsWith('app://-');
  }
  if (rendererURL && url.startsWith(rendererURL)) return true;
  return url.startsWith('http://127.0.0.1:1420') || url.startsWith('http://localhost:1420');
}

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mkv', '.m4v', '.mov', '.ogv']);

function getVideoArg() {
  const args = process.argv.slice(isDevelopment ? 2 : 1);
  for (const arg of args) {
    if (arg.startsWith('-')) continue;
    const ext = extname(arg).toLowerCase();
    if (VIDEO_EXTENSIONS.has(ext) && existsSync(arg)) {
      return resolve(arg);
    }
  }
  return null;
}

async function chooseVideo(browserWindow) {
  const result = await dialog.showOpenDialog(browserWindow, {
    title: 'Select 360 Video',
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'webm', 'mkv', 'm4v', 'mov', 'ogv'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result.canceled || !result.filePaths || result.filePaths.length === 0
    ? null
    : mediaURL(result.filePaths[0]);
}

function createWindow() {
  const window = new BrowserWindow({
    title: '360 Video Player',
    width: 1280,
    height: 720,
    frame: false,
    backgroundColor: '#3b3b3b',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, 'preload.cjs'),
    },
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.control || input.alt || input.meta) return;

    const key = input.key?.toLowerCase();
    if (key === 'i' || input.code === 'KeyI') {
      event.preventDefault();
      window.minimize();
    } else if (key === 'o' || input.code === 'KeyO') {
      event.preventDefault();
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    } else if (key === 'p' || input.code === 'KeyP') {
      event.preventDefault();
      window.close();
    }
  });

  if (isDevelopment) {
    window.loadURL(rendererURL);
  } else {
    window.loadURL('app://-/index.html');
  }

  return window;
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const relativePath = decodeURIComponent(new URL(request.url).pathname);
    const safePath = !relativePath || relativePath === '/' ? '/index.html' : relativePath;
    const requestedPath = resolve(distDirectory, `.${safePath}`);
    if (!requestedPath.startsWith(distDirectory) || !existsSync(requestedPath)) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(requestedPath).toString());
  });

  protocol.handle('media', (request) => {
    const url = new URL(request.url);
    const id = basename(url.pathname, extname(url.pathname));
    const filePath = selectedVideos.get(id);
    if (url.hostname !== 'video' || !filePath || !existsSync(filePath)) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const stat = statSync(filePath);
      const fileSize = stat.size;
      const rangeHeader = request.headers.get('range');
      const ext = extname(filePath);
      const mimeType = getMimeType(ext);

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
          return new Response('Range Not Satisfiable', {
            status: 416,
            headers: {
              'Content-Range': `bytes */${fileSize}`,
            },
          });
        }

        const chunkSize = end - start + 1;
        const stream = createReadStream(filePath, { start, end });

        return new Response(Readable.toWeb(stream), {
          status: 206,
          statusText: 'Partial Content',
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': mimeType,
          },
        });
      }

      const stream = createReadStream(filePath);
      return new Response(Readable.toWeb(stream), {
        status: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Content-Type': mimeType,
        },
      });
    } catch (err) {
      console.error('Error serving media stream:', err);
      return new Response('Internal error', { status: 500 });
    }
  });

  ipcMain.handle('video:choose', async (event) => {
    if (!isTrustedSender(event)) return null;
    const win = BrowserWindow.fromWebContents(event.sender);
    return chooseVideo(win);
  });

  ipcMain.handle('video:register-drop', (event, filePath) => {
    if (!isTrustedSender(event) || typeof filePath !== 'string' || !existsSync(filePath)) return null;
    return mediaURL(filePath);
  });

  ipcMain.handle('video:get-initial-video', (event) => {
    if (!isTrustedSender(event)) return null;
    const initialPath = getVideoArg();
    return initialPath ? mediaURL(initialPath) : null;
  });

  ipcMain.handle('window:minimize', (event) => {
    if (!isTrustedSender(event)) return;
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    if (!isTrustedSender(event)) return;
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    if (!isTrustedSender(event)) return;
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

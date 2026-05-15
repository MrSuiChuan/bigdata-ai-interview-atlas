import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootArg = process.argv[2];
const port = Number(process.argv[3] || 3000);

if (!rootArg) {
  console.error('Usage: node serve-static.mjs <rootDir> [port]');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..', rootArg);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

async function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  const requested = cleanPath === '/' ? '/index.html' : cleanPath;
  const normalized = path.normalize(requested).replace(/^(\.\.[\\/])+/, '');
  const absolute = path.join(rootDir, normalized);

  if (!absolute.startsWith(rootDir)) {
    return null;
  }

  try {
    const stat = await fs.stat(absolute);
    if (stat.isDirectory()) {
      return path.join(absolute, 'index.html');
    }
    return absolute;
  } catch {
    if (!path.extname(absolute)) {
      return path.join(absolute, 'index.html');
    }
    return absolute;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = await resolvePath(req.url || '/');
    if (!filePath) {
      send(res, 403, 'Forbidden');
      return;
    }

    let content;
    let finalPath = filePath;

    try {
      content = await fs.readFile(finalPath);
    } catch {
      const fallback404 = path.join(rootDir, '404.html');
      const fallbackIndex = path.join(rootDir, 'index.html');

      try {
        content = await fs.readFile(fallback404);
        finalPath = fallback404;
        res.statusCode = 404;
      } catch {
        content = await fs.readFile(fallbackIndex);
        finalPath = fallbackIndex;
        res.statusCode = 200;
      }
    }

    const contentType = mimeTypes.get(path.extname(finalPath).toLowerCase()) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.end(content);
  } catch (error) {
    send(res, 500, `Internal Server Error\n${error.message}`);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static site serving ${rootDir} at http://0.0.0.0:${port}`);
});

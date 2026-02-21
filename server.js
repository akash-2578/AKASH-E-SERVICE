const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '{}', 'utf8');
  }
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function safeKeyFromPath(pathname) {
  const key = pathname.replace(/^\/api\/store\//, '');
  return decodeURIComponent(key || '').trim();
}

function serveStatic(req, res, pathname) {
  let relPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(ROOT, relPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/store' && req.method === 'GET') {
    return sendJson(res, 200, readDb());
  }

  if (pathname.startsWith('/api/store/') && req.method === 'GET') {
    const key = safeKeyFromPath(pathname);
    if (!key) return sendJson(res, 400, { error: 'Missing key' });
    const db = readDb();
    return sendJson(res, 200, { value: Object.prototype.hasOwnProperty.call(db, key) ? db[key] : null });
  }

  if (pathname.startsWith('/api/store/') && req.method === 'PUT') {
    const key = safeKeyFromPath(pathname);
    if (!key) return sendJson(res, 400, { error: 'Missing key' });

    try {
      const body = await parseBody(req);
      if (!Object.prototype.hasOwnProperty.call(body, 'value')) {
        return sendJson(res, 400, { error: 'Body must include value' });
      }

      const db = readDb();
      db[key] = body.value;
      writeDb(db);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 400, { error: err.message || 'Invalid request body' });
    }
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`AKASH E SERVICE running on http://localhost:${PORT}`);
});

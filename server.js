const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const nodemailer = require('nodemailer');

const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'db.json');

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx <= 0) continue;
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const PORT = process.env.PORT || 3000;
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || 'akashonline2578@gmail.com';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'no-reply@akash-e-service.local';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 0);
const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

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

function escapeHtml(val) {
  return String(val ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toRows(obj) {
  return Object.entries(obj || {})
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>${escapeHtml(k)}</strong></td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(v)}</td></tr>`)
    .join('');
}

async function sendLeadEmail(type, payload) {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('Email not configured. Set SMTP_USER and SMTP_PASS.');
  }

  const transporterConfig = SMTP_HOST
    ? {
        host: SMTP_HOST,
        port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
        secure: SMTP_SECURE || (SMTP_PORT === 465),
        requireTLS: !SMTP_SECURE && (SMTP_PORT || 587) === 587,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      }
    : {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  const now = new Date().toLocaleString('en-IN');
  const subject = `[AKASH E SERVICE] New ${type} submission`;
  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2 style="margin:0 0 10px;">New ${escapeHtml(type)} submission</h2>
      <p style="margin:0 0 14px;">Received at: ${escapeHtml(now)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:700px;">
        ${toRows(payload)}
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: ALERT_EMAIL_TO,
    subject,
    html
  });
}

function serveStatic(req, res, pathname) {
  const relPath = pathname === '/' ? '/index.html' : pathname;
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

  if (pathname === '/api/notify' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const type = String(body.type || '').trim();
      const payload = body.payload;

      if (!type || !payload || typeof payload !== 'object') {
        return sendJson(res, 400, { error: 'Body must include type and payload object' });
      }

      await sendLeadEmail(type, payload);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      console.error('[notify] email send failed:', err && err.message ? err.message : err);
      return sendJson(res, 500, { error: err.message || 'Failed to send email' });
    }
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`AKASH E SERVICE running on http://localhost:${PORT}`);
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('Email alerts disabled: set SMTP_USER and SMTP_PASS to enable.');
  } else {
    console.log(`Email alerts enabled. recipient=${ALERT_EMAIL_TO}`);
  }
});

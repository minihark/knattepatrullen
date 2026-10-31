import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sirv from 'sirv';

const PORT = Number(process.env.PORT) || 80;

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'knatte.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS diplomas (
    id TEXT PRIMARY KEY,
    driver_name TEXT NOT NULL,
    stars INTEGER NOT NULL,
    vehicle TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const stmtGetAllDiplomas = db.prepare('SELECT * FROM diplomas ORDER BY created_at DESC LIMIT 20');
const stmtInsertDiploma = db.prepare(`
  INSERT INTO diplomas (id, driver_name, stars, vehicle, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const assets = sirv(path.resolve('dist'), {
  single: true,
  dev: true,
  gzip: true,
  brotli: true,
});

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 512 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', app: 'knattepatrullen', timestamp: new Date().toISOString() }));
    return;
  }

  // API endpoints
  if (url.pathname === '/api/diplomas') {
    if (req.method === 'GET') {
      try {
        const rows = stmtGetAllDiplomas.all();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ diplomas: rows }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const id = 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const name = String(body.driver_name || 'Mästarchauffören').slice(0, 50);
        const stars = Number(body.stars) || 0;
        const vehicle = String(body.vehicle || 'fire').slice(0, 20);
        const now = new Date().toISOString();

        stmtInsertDiploma.run(id, name, stars, vehicle, now);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
  }

  // Serve static assets / SPA
  assets(req, res, () => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Knattepatrullen running on port ${PORT}`);
});

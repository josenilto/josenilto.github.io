/**
 * portfolio-api — API REST minimalista com SQLite
 *
 * Endpoints:
 *   POST /api/visit              → registra uma visita (ip anonimizado)
 *   GET  /api/stats              → total de visitas, hoje, por página
 *   POST /api/metrics            → armazena snapshot de CPU/RAM (entrypoint.sh)
 *   GET  /api/metrics            → últimos 60 snapshots de métricas
 *   POST /api/deployments        → registra um deploy (pipeline CI)
 *   GET  /api/deployments        → últimos 20 deploys
 *   GET  /api/health             → liveness check da API + DB
 */

import express        from 'express';
import Database       from 'better-sqlite3';
import { createHash } from 'crypto';
import { mkdirSync }  from 'fs';

const PORT    = Number(process.env.PORT    ?? 3000);
const DB_PATH = process.env.DB_PATH        ?? '/data/portfolio.db';
const API_KEY = process.env.API_SECRET_KEY ?? '';

mkdirSync('/data', { recursive: true });

// ── Banco de dados ───────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    page     TEXT    NOT NULL DEFAULT '/',
    ip_hash  TEXT,
    referrer TEXT,
    ts       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cpu_pct    INTEGER,
    mem_pct    INTEGER,
    mem_used   INTEGER,
    mem_total  INTEGER,
    ts         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE TABLE IF NOT EXISTS deployments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    branch     TEXT,
    commit_sha TEXT,
    actor      TEXT,
    status     TEXT NOT NULL DEFAULT 'success',
    ts         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );
`);

// ── Prepared statements ─────────────────────────────────────────
const stmts = {
  insertVisit:     db.prepare('INSERT INTO visits (page, ip_hash, referrer) VALUES (?, ?, ?)'),
  countTotal:      db.prepare('SELECT COUNT(*) AS n FROM visits'),
  countToday:      db.prepare("SELECT COUNT(*) AS n FROM visits WHERE ts >= strftime('%Y-%m-%dT00:00:00Z','now')"),
  byPage:          db.prepare('SELECT page, COUNT(*) AS n FROM visits GROUP BY page ORDER BY n DESC LIMIT 10'),

  insertMetrics:   db.prepare('INSERT INTO metrics (cpu_pct, mem_pct, mem_used, mem_total) VALUES (?, ?, ?, ?)'),
  pruneMetrics:    db.prepare('DELETE FROM metrics WHERE id NOT IN (SELECT id FROM metrics ORDER BY id DESC LIMIT 1000)'),
  listMetrics:     db.prepare('SELECT * FROM metrics ORDER BY id DESC LIMIT 60'),

  insertDeploy:    db.prepare('INSERT INTO deployments (branch, commit_sha, actor, status) VALUES (?, ?, ?, ?)'),
  listDeploys:     db.prepare('SELECT * FROM deployments ORDER BY id DESC LIMIT 20'),
};

// ── Middleware ──────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Anonimiza IP: SHA-256 dos primeiros 24 bits (preserva subnet, não identifica pessoa)
function anonIP(req) {
  const raw = req.headers['x-forwarded-for']?.split(',')[0].trim()
    ?? req.socket?.remoteAddress
    ?? '';
  // Mantém apenas os 3 primeiros octetos para IPv4, ou primeiros 48 bits para IPv6
  const masked = raw.includes(':')
    ? raw.split(':').slice(0, 3).join(':')
    : raw.split('.').slice(0, 3).join('.');
  return createHash('sha256').update(masked).digest('hex').slice(0, 16);
}

// Autenticação simples via header para rotas de escrita sensíveis
function requireKey(req, res, next) {
  if (!API_KEY) return next();
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Rotas ───────────────────────────────────────────────────────

// Registrar visita (chamado pelo frontend via fetch)
app.post('/api/visit', (req, res) => {
  const page     = String(req.body?.page     ?? '/').slice(0, 255);
  const referrer = String(req.body?.referrer ?? '').slice(0, 500);
  stmts.insertVisit.run(page, anonIP(req), referrer || null);
  res.json({ ok: true });
});

// Estatísticas de visitas
app.get('/api/stats', (req, res) => {
  const total   = stmts.countTotal.get().n;
  const today   = stmts.countToday.get().n;
  const by_page = stmts.byPage.all();
  res.json({ total, today, by_page });
});

// Armazenar snapshot de métricas (chamado pelo entrypoint.sh)
app.post('/api/metrics', requireKey, (req, res) => {
  const { cpu, mem_pct, mem_used_mb, mem_total_mb } = req.body ?? {};
  stmts.insertMetrics.run(
    Number.isFinite(cpu)          ? cpu          : null,
    Number.isFinite(mem_pct)      ? mem_pct      : null,
    Number.isFinite(mem_used_mb)  ? mem_used_mb  : null,
    Number.isFinite(mem_total_mb) ? mem_total_mb : null
  );
  stmts.pruneMetrics.run();
  res.json({ ok: true });
});

// Histórico de métricas (últimos 60 pontos ≈ 5 min com intervalo de 5s)
app.get('/api/metrics', (req, res) => {
  res.json(stmts.listMetrics.all());
});

// Registrar deploy (chamado pelo pipeline GitHub Actions)
app.post('/api/deployments', requireKey, (req, res) => {
  const { branch, commit_sha, actor, status = 'success' } = req.body ?? {};
  stmts.insertDeploy.run(
    String(branch     ?? '').slice(0, 100),
    String(commit_sha ?? '').slice(0, 40),
    String(actor      ?? '').slice(0, 100),
    ['success','failure','rollback'].includes(status) ? status : 'success'
  );
  res.json({ ok: true });
});

// Histórico de deploys
app.get('/api/deployments', (req, res) => {
  res.json(stmts.listDeploys.all());
});

// Health check da API
app.get('/api/health', (_req, res) => {
  try {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM visits').get();
    res.json({ ok: true, visits: n, db: DB_PATH });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[portfolio-api] ouvindo na porta ${PORT}`);
  console.log(`[portfolio-api] banco: ${DB_PATH}`);
});

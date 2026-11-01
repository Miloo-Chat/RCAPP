/**
 * server/storage.js
 * 
 * Storage abstraction for Miloo moderation reports and user ban statuses.
 * Supports:
 *   1. Hosted SQL Database via DATABASE_URL (PostgreSQL, Supabase, Neon, etc.)
 *   2. File-based JSON fallback for local development (server/data/reports.json, bans.json)
 * 
 * Interface:
 *   - getReports({ status }): Promise<Array<Report>>
 *   - addReport(reportData): Promise<Report>
 *   - setUserStatus(identifier, status, notes): Promise<boolean>
 *   - isBanned(identifier): Promise<boolean>
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

// Local JSON File Fallbacks
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const BANS_FILE = path.join(DATA_DIR, 'bans.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalJson(filePath, defaultVal) {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`[Storage] Failed to read ${filePath}:`, err.message);
  }
  return defaultVal;
}

function saveLocalJson(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Storage] Failed to write ${filePath}:`, err.message);
  }
}

// In-Memory caches for local-dev fallback
let localReports = loadLocalJson(REPORTS_FILE, []);
let localBans = new Map(); // identifier -> { status, notes, timestamp }

// Initialize local bans from file if present
const rawBans = loadLocalJson(BANS_FILE, []);
if (Array.isArray(rawBans)) {
  rawBans.forEach(item => {
    if (typeof item === 'string') {
      localBans.set(item, { status: 'banned', timestamp: Date.now() });
    } else if (item && item.identifier) {
      localBans.set(item.identifier, item);
    }
  });
}

// ---------------------------------------------------------------------------
// Postgres Client Setup (when DATABASE_URL is present)
// ---------------------------------------------------------------------------
let pgPool = null;
let pgInitialized = false;

if (DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))) {
  try {
    const isLocalhost = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    console.log('[Storage] Connecting to hosted database via DATABASE_URL...');
  } catch (err) {
    console.warn('[Storage] Database connection initialization failed, using local file fallback:', err.message);
    pgPool = null;
  }
} else {
  console.log('[Storage] No DATABASE_URL specified. Running with local JSON fallback.');
}

async function initPostgresTables() {
  if (!pgPool || pgInitialized) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT,
        reported_user TEXT NOT NULL,
        reason TEXT NOT NULL,
        context TEXT,
        timestamp BIGINT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_action_timestamp BIGINT,
        admin_notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp DESC);

      CREATE TABLE IF NOT EXISTS user_bans (
        identifier TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        notes TEXT,
        timestamp BIGINT NOT NULL
      );
    `);
    pgInitialized = true;
    console.log('[Storage] Database schema initialized successfully.');
  } catch (err) {
    console.error('[Storage] Error initializing PostgreSQL tables, falling back to local files:', err.message);
    pgPool = null;
  }
}

// ---------------------------------------------------------------------------
// Storage Interface Implementation
// ---------------------------------------------------------------------------

/**
 * Get reports with optional status filter
 * @param {Object} options
 * @param {string} [options.status] - 'all' | 'pending' | 'warned' | 'suspended' | 'banned' | 'dismissed'
 * @returns {Promise<Array>}
 */
async function getReports(options = {}) {
  const { status } = options;

  if (pgPool) {
    try {
      await initPostgresTables();
      let query = 'SELECT * FROM reports';
      const params = [];
      if (status && status !== 'all') {
        query += ' WHERE status = $1';
        params.push(status);
      }
      query += ' ORDER BY timestamp DESC LIMIT 500';
      const res = await pgPool.query(query, params);
      return res.rows.map(row => ({
        id: row.id,
        reporterId: row.reporter_id,
        reportedUser: row.reported_user,
        reason: row.reason,
        context: row.context,
        timestamp: Number(row.timestamp),
        status: row.status,
        adminActionTimestamp: row.admin_action_timestamp ? Number(row.admin_action_timestamp) : null,
        adminNotes: row.admin_notes,
      }));
    } catch (err) {
      console.error('[Storage.getReports] Database error, falling back to memory:', err.message);
    }
  }

  // Local fallback
  if (status && status !== 'all') {
    return localReports.filter(r => r.status === status);
  }
  return [...localReports];
}

/**
 * Add a new user report
 * @param {Object} reportData
 * @returns {Promise<Object>}
 */
async function addReport(reportData) {
  const report = {
    id: reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    reporterId: reportData.reporterId || 'anonymous',
    reportedUser: String(reportData.reportedUser).slice(0, 100),
    reason: String(reportData.reason || 'other').toLowerCase(),
    context: String(reportData.context || '').slice(0, 500),
    timestamp: reportData.timestamp || Date.now(),
    status: 'pending',
    adminActionTimestamp: null,
    adminNotes: null,
  };

  if (pgPool) {
    try {
      await initPostgresTables();
      await pgPool.query(
        `INSERT INTO reports (id, reporter_id, reported_user, reason, context, timestamp, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [report.id, report.reporterId, report.reportedUser, report.reason, report.context, report.timestamp, report.status]
      );
      return report;
    } catch (err) {
      console.error('[Storage.addReport] Database error, saving locally:', err.message);
    }
  }

  // Local fallback
  localReports.unshift(report);
  if (localReports.length > 1000) localReports = localReports.slice(0, 1000);
  saveLocalJson(REPORTS_FILE, localReports);
  return report;
}

/**
 * Set user moderation status ('warn' | 'suspend' | 'ban' | 'dismiss')
 * @param {string} identifier - socket ID, client UUID, or hashed IP
 * @param {string} status - 'banned' | 'suspended' | 'warned' | 'active'
 * @param {string} [notes]
 * @returns {Promise<boolean>}
 */
async function setUserStatus(identifier, status, notes = '') {
  if (!identifier) return false;
  const cleanId = String(identifier).trim();
  const timestamp = Date.now();

  if (pgPool) {
    try {
      await initPostgresTables();
      if (status === 'banned' || status === 'suspended') {
        await pgPool.query(
          `INSERT INTO user_bans (identifier, status, notes, timestamp)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (identifier) DO UPDATE
           SET status = EXCLUDED.status, notes = EXCLUDED.notes, timestamp = EXCLUDED.timestamp`,
          [cleanId, status, notes, timestamp]
        );
      } else {
        await pgPool.query('DELETE FROM user_bans WHERE identifier = $1', [cleanId]);
      }
      return true;
    } catch (err) {
      console.error('[Storage.setUserStatus] Database error, writing locally:', err.message);
    }
  }

  // Local fallback
  if (status === 'banned' || status === 'suspended') {
    localBans.set(cleanId, { status, notes, timestamp });
  } else {
    localBans.delete(cleanId);
  }

  const serialized = [];
  localBans.forEach((val, key) => serialized.push({ identifier: key, ...val }));
  saveLocalJson(BANS_FILE, serialized);
  return true;
}

/**
 * Check if an identifier is banned or suspended
 * @param {string} identifier
 * @returns {Promise<boolean>}
 */
async function isBanned(identifier) {
  if (!identifier) return false;
  const cleanId = String(identifier).trim();

  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query(
        'SELECT status FROM user_bans WHERE identifier = $1 LIMIT 1',
        [cleanId]
      );
      if (res.rows.length > 0) {
        const s = res.rows[0].status;
        return s === 'banned' || s === 'suspended';
      }
      return false;
    } catch (err) {
      console.error('[Storage.isBanned] Database error, checking local memory:', err.message);
    }
  }

  // Local fallback
  const record = localBans.get(cleanId);
  if (!record) return false;
  return record.status === 'banned' || record.status === 'suspended';
}

/**
 * Helper: get count of banned identifiers
 */
async function getBannedCount() {
  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query('SELECT count(*) as count FROM user_bans');
      return parseInt(res.rows[0].count, 10);
    } catch (err) {
      console.error('[Storage.getBannedCount] Database error:', err.message);
    }
  }
  return localBans.size;
}

module.exports = {
  getReports,
  addReport,
  setUserStatus,
  isBanned,
  getBannedCount,
};

/**
 * server/storage.js
 * 
 * Storage abstraction for Miloo moderation reports, user ban statuses, and moderation state.
 * Supports:
 *   1. Hosted SQL Database via DATABASE_URL (PostgreSQL, Supabase, Neon, etc.)
 *   2. File-based JSON fallback for local development ONLY (server/data/reports.json, bans.json, moderation_state.json)
 * 
 * In production mode (NODE_ENV === 'production'), the server strictly refuses to start without DATABASE_URL.
 * 
 * Escalating Ban Schedule:
 *   - Strike 1: 10 minutes (600,000 ms)
 *   - Strike 2: 24 hours (86,400,000 ms)
 *   - Strike 3: 7 days (604,800,000 ms)
 *   - Strike 4+: Permanent
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const IS_PROD = process.env.NODE_ENV === 'production';

// Production safety check: JSON fallback is strictly disallowed in production
if (IS_PROD) {
  if (!DATABASE_URL || (!DATABASE_URL.startsWith('postgres://') && !DATABASE_URL.startsWith('postgresql://'))) {
    console.error('FATAL: Production mode requires DATABASE_URL (PostgreSQL) for persistent bans, reports, and moderation state.');
    if (!process.env.TEST_ALLOW_NO_DB) {
      process.exit(1);
    }
  }
}

// Local JSON File Fallbacks (Allowed ONLY in Development)
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const BANS_FILE = path.join(DATA_DIR, 'bans.json');
const MOD_STATE_FILE = path.join(DATA_DIR, 'moderation_state.json');

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
let localBans = new Map(); // identifier -> { status, notes, timestamp, strikeCount, expiresAt }
let localModState = loadLocalJson(MOD_STATE_FILE, {});

// Initialize local bans from file if present
const rawBans = loadLocalJson(BANS_FILE, []);
if (Array.isArray(rawBans)) {
  rawBans.forEach(item => {
    if (typeof item === 'string') {
      localBans.set(item, { status: 'banned', timestamp: Date.now(), strikeCount: 1, expiresAt: Date.now() + 10 * 60 * 1000 });
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
    if (IS_PROD) {
      console.error('FATAL: Database connection failed in production mode:', err.message);
      process.exit(1);
    }
    console.warn('[Storage] Database connection initialization failed, using local file fallback:', err.message);
    pgPool = null;
  }
} else {
  if (IS_PROD) {
    console.error('FATAL: No DATABASE_URL specified in production mode. Refusing to run.');
    if (!process.env.TEST_ALLOW_NO_DB) {
      process.exit(1);
    }
  } else {
    console.log('[Storage] No DATABASE_URL specified. Running with development JSON fallback.');
  }
}

/**
 * Execute schema migrations from server/migrations/
 */
async function runMigrations(pool) {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
  }
}

async function initPostgresTables() {
  if (!pgPool || pgInitialized) return;
  try {
    await runMigrations(pgPool);
    pgInitialized = true;
    console.log('[Storage] Database schema migrations applied successfully.');
  } catch (err) {
    if (IS_PROD) {
      console.error('FATAL: PostgreSQL migration failed in production mode:', err.message);
      process.exit(1);
    }
    console.error('[Storage] Error running database migrations, falling back to local files:', err.message);
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
        sessionId: row.session_id,
        recentMessages: row.recent_messages || [],
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
    sessionId: String(reportData.sessionId || '').slice(0, 100),
    recentMessages: Array.isArray(reportData.recentMessages) ? reportData.recentMessages.slice(-20) : [],
    timestamp: reportData.timestamp || Date.now(),
    status: 'pending',
    adminActionTimestamp: null,
    adminNotes: null,
  };

  if (pgPool) {
    try {
      await initPostgresTables();
      await pgPool.query(
        `INSERT INTO reports (id, reporter_id, reported_user, reason, context, session_id, recent_messages, timestamp, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [report.id, report.reporterId, report.reportedUser, report.reason, report.context, report.sessionId, JSON.stringify(report.recentMessages), report.timestamp, report.status]
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
 * Compute escalating ban duration in ms:
 *   Strike 1: 10 minutes
 *   Strike 2: 24 hours
 *   Strike 3: 7 days
 *   Strike 4+: Permanent (null)
 */
function getEscalatingBanDurationMs(strikeCount) {
  if (strikeCount === 1) return 10 * 60 * 1000; // 10 min
  if (strikeCount === 2) return 24 * 60 * 60 * 1000; // 24 h
  if (strikeCount === 3) return 7 * 24 * 60 * 60 * 1000; // 7 days
  return null; // permanent
}

/**
 * Set user moderation status ('warn' | 'suspend' | 'ban' | 'dismiss')
 * Supports escalating ban durations (10 min, 24 h, 7 days, permanent)
 * @param {string} identifier - socket ID, client UUID, or hashed IP
 * @param {string} status - 'banned' | 'suspended' | 'warned' | 'active'
 * @param {string} [notes]
 * @returns {Promise<boolean>}
 */
async function setUserStatus(identifier, status, notes = '', options = {}) {
  if (!identifier) return false;
  const cleanId = String(identifier).trim();
  const timestamp = Date.now();

  let strikeCount = 1;
  let expiresAt = null;

  if (status === 'banned' || status === 'suspended') {
    // Determine strike count from previous records or option override
    const previous = localBans.get(cleanId);
    strikeCount = typeof options.strikeCount === 'number' ? options.strikeCount : ((previous?.strikeCount || 0) + 1);
    
    if (options.permanent || strikeCount >= 4) {
      expiresAt = null;
    } else if (options.expiresAt !== undefined) {
      expiresAt = options.expiresAt;
    } else if (typeof options.durationMs === 'number') {
      expiresAt = timestamp + options.durationMs;
    } else {
      const durationMs = getEscalatingBanDurationMs(strikeCount);
      expiresAt = durationMs ? timestamp + durationMs : null;
    }

    console.log(`[Storage] Escalating ban: identifier=${cleanId} strike=${strikeCount} expiresAt=${expiresAt ? new Date(expiresAt).toISOString() : 'PERMANENT'}`);
  }

  if (pgPool) {
    try {
      await initPostgresTables();
      if (status === 'banned' || status === 'suspended') {
        await pgPool.query(
          `INSERT INTO user_bans (identifier, status, notes, timestamp, strike_count, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (identifier) DO UPDATE
           SET status = EXCLUDED.status, notes = EXCLUDED.notes, timestamp = EXCLUDED.timestamp,
               strike_count = EXCLUDED.strike_count, expires_at = EXCLUDED.expires_at`,
          [cleanId, status, notes, timestamp, strikeCount, expiresAt]
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
    localBans.set(cleanId, { status, notes, timestamp, strikeCount, expiresAt });
  } else {
    localBans.delete(cleanId);
  }

  const serialized = [];
  localBans.forEach((val, key) => serialized.push({ identifier: key, ...val }));
  saveLocalJson(BANS_FILE, serialized);
  return true;
}

/**
 * Check if an identifier is banned or suspended, accounting for expiry.
 * Auto-unbans if a temporary ban has expired.
 * @param {string} identifier
 * @returns {Promise<boolean>}
 */
async function isBanned(identifier) {
  if (!identifier) return false;
  const cleanId = String(identifier).trim();
  const now = Date.now();

  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query(
        'SELECT status, expires_at FROM user_bans WHERE identifier = $1 LIMIT 1',
        [cleanId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const s = row.status;
        const exp = row.expires_at ? Number(row.expires_at) : null;
        if (exp && now > exp) {
          // Expired temporary ban
          await pgPool.query('DELETE FROM user_bans WHERE identifier = $1', [cleanId]);
          return false;
        }
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

  // Check if temporary ban has expired
  if (record.expiresAt && now > record.expiresAt) {
    console.log(`[Storage] Temporary ban expired for ${cleanId}. Auto-clearing.`);
    localBans.delete(cleanId);
    const serialized = [];
    localBans.forEach((val, key) => serialized.push({ identifier: key, ...val }));
    saveLocalJson(BANS_FILE, serialized);
    return false;
  }

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

// ---------------------------------------------------------------------------
// Moderation State Key-Value Store
// ---------------------------------------------------------------------------

async function getModerationState(key) {
  if (!key) return null;
  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query('SELECT value FROM moderation_state WHERE key = $1 LIMIT 1', [key]);
      if (res.rows.length > 0) return res.rows[0].value;
      return null;
    } catch (err) {
      console.error('[Storage.getModerationState] Database error:', err.message);
    }
  }
  return localModState[key] || null;
}

async function setModerationState(key, value) {
  if (!key) return false;
  const now = Date.now();
  if (pgPool) {
    try {
      await initPostgresTables();
      await pgPool.query(
        `INSERT INTO moderation_state (key, value, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [key, JSON.stringify(value), now]
      );
      return true;
    } catch (err) {
      console.error('[Storage.setModerationState] Database error:', err.message);
    }
  }
  localModState[key] = value;
  saveLocalJson(MOD_STATE_FILE, localModState);
  return true;
}

// ---------------------------------------------------------------------------
// Purge Jobs: 30-Day Reports Retention & Temporary Ban Expiry
// ---------------------------------------------------------------------------

/**
 * Automatic 30-day purge job for reports
 * Deletes all reports older than maxAgeMs (default: 30 days)
 * @param {number} [maxAgeMs=2592000000] 30 days in ms
 * @param {number} [referenceTime=Date.now()] Reference timestamp
 * @returns {Promise<{ deletedCount: number }>}
 */
async function purgeOldReports(maxAgeMs = 30 * 24 * 60 * 60 * 1000, referenceTime = Date.now()) {
  const cutoff = referenceTime - maxAgeMs;
  let deletedCount = 0;

  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query('DELETE FROM reports WHERE timestamp < $1', [cutoff]);
      deletedCount = res.rowCount || 0;
      console.log(`[Storage.purgeOldReports] Purged ${deletedCount} reports older than ${new Date(cutoff).toISOString()}`);
      return { deletedCount };
    } catch (err) {
      console.error('[Storage.purgeOldReports] Database error:', err.message);
    }
  }

  // Local fallback
  const beforeCount = localReports.length;
  localReports = localReports.filter(r => Number(r.timestamp) >= cutoff);
  deletedCount = beforeCount - localReports.length;
  if (deletedCount > 0) {
    saveLocalJson(REPORTS_FILE, localReports);
  }
  console.log(`[Storage.purgeOldReports] Local purge removed ${deletedCount} reports older than ${new Date(cutoff).toISOString()}`);
  return { deletedCount };
}

/**
 * Expiry job for temporary bans
 * Removes bans where expires_at IS NOT NULL AND expires_at < referenceTime
 * @param {number} [referenceTime=Date.now()] Reference timestamp
 * @returns {Promise<{ deletedCount: number }>}
 */
async function purgeExpiredBans(referenceTime = Date.now()) {
  let deletedCount = 0;

  if (pgPool) {
    try {
      await initPostgresTables();
      const res = await pgPool.query(
        'DELETE FROM user_bans WHERE expires_at IS NOT NULL AND expires_at < $1',
        [referenceTime]
      );
      deletedCount = res.rowCount || 0;
      console.log(`[Storage.purgeExpiredBans] Purged ${deletedCount} expired bans as of ${new Date(referenceTime).toISOString()}`);
      return { deletedCount };
    } catch (err) {
      console.error('[Storage.purgeExpiredBans] Database error:', err.message);
    }
  }

  // Local fallback
  const keysToDelete = [];
  localBans.forEach((val, key) => {
    if (val.expiresAt && val.expiresAt < referenceTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(k => localBans.delete(k));
  deletedCount = keysToDelete.length;

  if (deletedCount > 0) {
    const serialized = [];
    localBans.forEach((val, key) => serialized.push({ identifier: key, ...val }));
    saveLocalJson(BANS_FILE, serialized);
  }
  console.log(`[Storage.purgeExpiredBans] Local purge removed ${deletedCount} expired bans as of ${new Date(referenceTime).toISOString()}`);
  return { deletedCount };
}

/**
 * Periodic purge timer (runs hourly by default)
 */
let purgeTimer = null;
function startPeriodicPurgeJobs(intervalMs = 60 * 60 * 1000) {
  if (purgeTimer) clearInterval(purgeTimer);
  purgeTimer = setInterval(async () => {
    try {
      await purgeOldReports();
      await purgeExpiredBans();
    } catch (err) {
      console.error('[Storage] Periodic purge error:', err.message);
    }
  }, intervalMs);
  if (purgeTimer.unref) purgeTimer.unref(); // Do not block process exit
}

module.exports = {
  getReports,
  addReport,
  setUserStatus,
  isBanned,
  getBannedCount,
  getModerationState,
  setModerationState,
  purgeOldReports,
  purgeExpiredBans,
  startPeriodicPurgeJobs,
  initPostgresTables,
};

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const storage = require('./storage');
const { checkMessageSafety } = require('./moderation');

// ---------------------------------------------------------------------------
// Production Environment Invariants (Refuse to start if insecure)
// ---------------------------------------------------------------------------
const ALWAYS_PASS_SITE_KEY = '1x00000000000000000000AA';
const ALWAYS_PASS_SECRET_KEY = '1x0000000000000000000000000000000AA';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith('postgres://') && !process.env.DATABASE_URL.startsWith('postgresql://'))) {
    console.error('FATAL: Production mode requires DATABASE_URL (PostgreSQL) for persistent bans, reports, and moderation state.');
    process.exit(1);
  }
  if (!process.env.ADMIN_PASSWORD_HASH) {
    console.error('FATAL: Production mode requires ADMIN_PASSWORD_HASH to be defined in environment.');
    process.exit(1);
  }
  if (!process.env.SESSION_SECRET) {
    console.error('FATAL: Production mode requires SESSION_SECRET to be defined in environment.');
    process.exit(1);
  }
  const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey || siteKey === ALWAYS_PASS_SITE_KEY) {
    console.error('FATAL: Production mode requires a valid non-test Cloudflare Turnstile SITE key.');
    process.exit(1);
  }
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey === ALWAYS_PASS_SECRET_KEY) {
    console.error('FATAL: Production mode requires a valid non-test Cloudflare Turnstile SECRET key.');
    process.exit(1);
  }
}

const app = express();

// Trust reverse proxy headers (Vercel, Cloudflare, Railway, Fly.io, etc.)
// Required so that req.ip returns the real client IP, not the proxy IP.
// Set TRUST_PROXY=1 (or the number of proxy hops) in production env.
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || 1 : 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration with Credentials Support
const allowedOrigins = [
  'https://miloo.chat',
  'https://www.miloo.chat',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:3001',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
}));

const SESSION_SECRET = process.env.SESSION_SECRET || 'miloo-session-dev-key';
app.use(cookieParser(SESSION_SECRET));
app.use(express.json({ limit: '100kb' }));

// ---------------------------------------------------------------------------
// Rate Limiters
// ---------------------------------------------------------------------------
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalApiLimiter);

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reports submitted. Please wait before reporting again.' },
});

// ---------------------------------------------------------------------------
// Server-side Admin Session Management (Cryptographically Signed Cookie + In-Memory Fallback)
// ---------------------------------------------------------------------------
const activeAdminSessions = new Map(); // sessionToken -> { createdAt: number, ip: string }
const loginAttempts = new Map(); // ip -> { count: number, lockedUntil: number }

function signAdminToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyAdminToken(signedToken) {
  if (!signedToken || typeof signedToken !== 'string') return null;
  const parts = signedToken.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

app.post('/api/admin/login', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const record = loginAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };
  const now = Date.now();

  if (record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many failed login attempts. Locked out for ${Math.ceil(remainingSec / 60)} more minute(s).`,
      remainingSec,
      lockedUntil: record.lockedUntil,
    });
  }

  const { password } = req.body || {};
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    console.error('[Admin] ADMIN_PASSWORD_HASH is not configured.');
    return res.status(500).json({ error: 'Admin authentication is not configured on this server.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const isMatch = bcrypt.compareSync(password, hash);
  if (!isMatch) {
    record.count = (record.count || 0) + 1;
    if (record.count >= 5) {
      record.lockedUntil = now + 15 * 60 * 1000;
      loginAttempts.set(clientIp, record);
      console.warn(`[Security Lockout] Admin login locked out for IP: ${clientIp} after 5 failed attempts.`);
      return res.status(429).json({
        error: 'Too many failed login attempts. Locked out for 15 minutes.',
        remainingSec: 900,
        lockedUntil: record.lockedUntil,
      });
    }
    loginAttempts.set(clientIp, record);
    return res.status(401).json({
      error: `Invalid credentials. ${5 - record.count} attempt(s) remaining before lockout.`
    });
  }

  // Login successful
  loginAttempts.delete(clientIp);
  const sessionToken = signAdminToken({
    createdAt: now,
    exp: now + 24 * 60 * 60 * 1000,
    ip: clientIp,
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  activeAdminSessions.set(sessionToken, { createdAt: now, ip: clientIp });

  res.cookie('miloo_admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.json({ success: true, message: 'Admin authentication successful.' });
});

app.get('/api/admin/session', (req, res) => {
  const token = req.cookies?.miloo_admin_session;
  const verified = verifyAdminToken(token);
  if (verified) {
    return res.json({ authenticated: true });
  }
  // Fallback to in-memory check for legacy tokens
  if (token && activeAdminSessions.has(token)) {
    const session = activeAdminSessions.get(token);
    if (Date.now() - session.createdAt < 24 * 60 * 60 * 1000) {
      return res.json({ authenticated: true });
    }
    activeAdminSessions.delete(token);
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.miloo_admin_session;
  if (token) {
    activeAdminSessions.delete(token);
  }
  res.clearCookie('miloo_admin_session', { path: '/' });
  return res.json({ success: true });
});

function requireAdminAuth(req, res, next) {
  const token = req.cookies?.miloo_admin_session;
  const verified = verifyAdminToken(token);
  if (verified) {
    req.adminSession = verified;
    return next();
  }
  if (token && activeAdminSessions.has(token)) {
    const session = activeAdminSessions.get(token);
    if (Date.now() - session.createdAt <= 24 * 60 * 60 * 1000) {
      req.adminSession = session;
      return next();
    }
    activeAdminSessions.delete(token);
  }
  res.clearCookie('miloo_admin_session', { path: '/' });
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

// ---------------------------------------------------------------------------
// Cloudflare Turnstile Server Verification (Fail Closed)
// ---------------------------------------------------------------------------
const verifiedTurnstileSignatures = new Map();

app.post('/api/verify-turnstile', async (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ error: 'Turnstile token is required.' });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY || ALWAYS_PASS_SECRET_KEY;
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) formData.append('remoteip', clientIp);

    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    const outcome = await cfRes.json();
    if (!outcome.success) {
      console.warn('[Turnstile] Verification failed:', outcome['error-codes']);
      return res.status(403).json({ error: 'Turnstile verification failed.' });
    }

    const timestamp = Date.now();
    const verificationSecret = process.env.SESSION_SECRET || 'turnstile-verification-salt';
    const sig = crypto.createHmac('sha256', verificationSecret)
      .update(String(timestamp))
      .digest('hex');
    const verificationToken = `${timestamp}:${sig}`;

    verifiedTurnstileSignatures.set(verificationToken, timestamp);

    return res.json({
      verified: true,
      verificationToken
    });
  } catch (err) {
    console.error('[Turnstile] Server verification request error:', err.message);
    // Fail closed
    return res.status(502).json({ error: 'Security verification service unreachable.' });
  }
});

function isTurnstileSessionValid(verificationToken) {
  if (!verificationToken) return false;
  const parts = String(verificationToken).split(':');
  if (parts.length !== 2) return false;
  const [timestampStr, sig] = parts;
  const timestamp = Number(timestampStr);
  if (!timestamp || isNaN(timestamp)) return false;
  // Valid for 2 hours
  if (Date.now() - timestamp > 2 * 60 * 60 * 1000) return false;

  const verificationSecret = process.env.SESSION_SECRET || 'turnstile-verification-salt';
  const expectedSig = crypto.createHmac('sha256', verificationSecret)
    .update(String(timestamp))
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}

const metrics = require('./metrics');

// ---------------------------------------------------------------------------
// State: Matching Queues & Active Sockets (Real Human Strangers Only)
// ---------------------------------------------------------------------------
const waitingQueue = [];
const activePairs = new Map();
const pairStartTimes = new Map(); // socketId -> startTime
const waitTimeoutTimers = new Map(); // socketId -> timer

function clearWaitTimeout(socketId) {
  const timer = waitTimeoutTimers.get(socketId);
  if (timer) {
    clearTimeout(timer);
    waitTimeoutTimers.delete(socketId);
  }
}

function removeFromWaitingQueue(socketId) {
  for (let i = waitingQueue.length - 1; i >= 0; i--) {
    if (waitingQueue[i].id === socketId) {
      waitingQueue.splice(i, 1);
    }
  }
}

function findMatch(socketId, mediaMode) {
  const candidates = waitingQueue.filter(u => u.id !== socketId && u.mediaMode === mediaMode);
  if (candidates.length === 0) return null;
  return candidates[0];
}

// Helper: Extract all tracking identifiers for ban enforcement
function getSocketIdentifiers(socket) {
  const rawIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
                socket.handshake.address ||
                '';
  const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16) : '';

  let clientId = socket.handshake.auth?.clientId || socket.handshake.query?.clientId || '';
  if (!clientId && socket.handshake.headers.cookie) {
    const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)miloo_uid=([^;]+)/);
    if (match) clientId = decodeURIComponent(match[1]);
  }

  return {
    rawIp,
    ipHash,
    clientId,
    socketId: socket.id,
  };
}

async function isClientBanned(ids) {
  if (ids.clientId && (await storage.isBanned(ids.clientId))) return true;
  if (ids.ipHash && (await storage.isBanned(ids.ipHash))) return true;
  if (ids.rawIp && (await storage.isBanned(ids.rawIp))) return true;
  if (ids.socketId && (await storage.isBanned(ids.socketId))) return true;
  return false;
}

const BAN_MESSAGE = 'Your access to Miloo has been suspended due to violations of our Community Guidelines and Safety Policies.';

// ---------------------------------------------------------------------------
// HTTP API Endpoints
// ---------------------------------------------------------------------------

// Health check endpoint (Strictly real connected human users only)
app.get('/api/health', (req, res) => {
  res.json({
    onlineUsers: waitingQueue.length + activePairs.size,
    waitingUsers: waitingQueue.length,
    activePairs: activePairs.size / 2,
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// Root-level /health endpoint alias for load balancers and deployment platforms
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// ICE Servers Configuration Endpoint (WebRTC STUN/TURN)
// Supports configurable STUN_URLS, TURN_URL, TURN_USERNAME, TURN_CREDENTIAL,
// or dynamic short-lived credentials via METERED_API_KEY.
app.get('/api/ice-servers', async (req, res) => {
  try {
    // 1. If METERED_API_KEY is provided, request short-lived credentials from Metered API server-side
    const meteredApiKey = process.env.METERED_API_KEY;
    if (meteredApiKey) {
      try {
        const resp = await fetch(`https://miloo-chat.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`, {
          signal: AbortSignal.timeout(2500)
        });
        if (resp.ok) {
          const meteredServers = await resp.json();
          if (Array.isArray(meteredServers) && meteredServers.length > 0) {
            return res.json({ iceServers: meteredServers });
          }
        }
      } catch (err) {
        console.warn('[ICE] Failed to fetch short-lived Metered credentials:', err.message);
      }
    }

    // 2. Build ICE servers from environment configuration
    const defaultStun = 'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302';
    const stunUrlsEnv = process.env.STUN_URLS || defaultStun;
    const stunServers = stunUrlsEnv.split(',').map(u => u.trim()).filter(Boolean).map(url => ({ urls: url }));

    const iceServers = [...stunServers];

    // Add static/coturn TURN credentials if configured
    if (process.env.TURN_URL) {
      const turnConfig = {
        urls: process.env.TURN_URL.split(',').map(u => u.trim()),
      };
      if (process.env.TURN_USERNAME) {
        turnConfig.username = process.env.TURN_USERNAME;
      }
      if (process.env.TURN_CREDENTIAL) {
        turnConfig.credential = process.env.TURN_CREDENTIAL;
      }
      iceServers.push(turnConfig);
    } else if (process.env.METERED_USERNAME && process.env.METERED_PASSWORD) {
      const meteredUrls = process.env.METERED_TURN_URL
        ? process.env.METERED_TURN_URL.split(',').map(u => u.trim())
        : [
            'turn:a.relay.metered.ca:80',
            'turn:a.relay.metered.ca:443',
            'turns:a.relay.metered.ca:443?transport=tcp'
          ];
      iceServers.push({
        urls: meteredUrls,
        username: process.env.METERED_USERNAME,
        credential: process.env.METERED_PASSWORD
      });
    }

    // In production, the server must refuse public openrelay demo credentials
    const OPENRELAY_DEMO_USERNAMES = ['253641d173a9665c982784fd', 'openrelayproject'];
    if (process.env.NODE_ENV === 'production') {
      const isDemo = OPENRELAY_DEMO_USERNAMES.includes(process.env.METERED_USERNAME) ||
                     OPENRELAY_DEMO_USERNAMES.includes(process.env.TURN_USERNAME);
      if (isDemo && !process.env.METERED_API_KEY) {
        console.error('FATAL: Public OpenRelay demo credentials are strictly forbidden in production. Must use METERED_API_KEY or private coturn.');
        return res.status(500).json({ error: 'Production TURN credentials required. Public demo credentials rejected.' });
      }
    }

    return res.json({ iceServers });
  } catch (err) {
    console.error('[ICE] Error generating ICE servers list:', err.message);
    res.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
  }
});

// Admin Funnel & Matching Metrics Endpoints (Protected)
app.get('/api/admin/metrics', requireAdminAuth, (req, res) => {
  res.json(metrics.getSummary());
});

app.get('/api/admin/metrics/export.csv', requireAdminAuth, (req, res) => {
  const csv = metrics.exportCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="miloo-metrics.csv"');
  res.send(csv);
});

// User Report Submission
app.post('/api/reports', reportLimiter, async (req, res) => {
  try {
    const { reporterId, reportedUser, reason, context, sessionId, recentMessages } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ error: 'reportedUser and reason are required.' });
    }

    const validReasons = ['harassment', 'nudity', 'spam', 'threats', 'scam', 'other'];
    const normalizedReason = validReasons.includes(reason.toLowerCase()) ? reason.toLowerCase() : 'other';

    const report = await storage.addReport({
      reporterId: reporterId || req.ip || 'anonymous',
      reportedUser: String(reportedUser).slice(0, 100),
      reason: normalizedReason,
      context: String(context || '').slice(0, 500),
      sessionId: String(sessionId || '').slice(0, 100),
      recentMessages: Array.isArray(recentMessages) ? recentMessages.slice(-20) : [],
      timestamp: Date.now(),
    });

    console.log(`[Safety Report] Reason: ${normalizedReason} | Target: ${reportedUser} | Session: ${sessionId || 'none'}`);
    metrics.recordReport();
    res.json({ success: true, reportId: report.id });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(500).json({ error: 'Failed to record report.' });
  }
});

// Admin: List Reports (Protected by requireAdminAuth session cookie)
app.get('/api/admin/reports', requireAdminAuth, async (req, res) => {
  try {
    const statusFilter = req.query.status;
    const reportsList = await storage.getReports({ status: statusFilter });
    const bannedCount = await storage.getBannedCount();

    res.json({
      reports: reportsList,
      total: reportsList.length,
      bannedCount,
    });
  } catch (err) {
    console.error('Admin get reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// Admin: Apply Action to Report (Protected by requireAdminAuth session cookie)
app.post('/api/admin/reports/:id/action', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const validActions = ['warn', 'suspend', 'ban', 'dismiss'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be warn, suspend, ban, or dismiss.' });
    }

    const allReports = await storage.getReports();
    const report = allReports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (action === 'ban' || action === 'suspend') {
      await storage.setUserStatus(report.reportedUser, action === 'ban' ? 'banned' : 'suspended', notes || '');

      const targetSocket = io.sockets.sockets.get(report.reportedUser);
      if (targetSocket) {
        targetSocket.emit('banned', { reason: BAN_MESSAGE });
        targetSocket.disconnect(true);
      }
    } else if (action === 'dismiss') {
      await storage.setUserStatus(report.reportedUser, 'active', notes || '');
    }

    report.status = action === 'dismiss' ? 'dismissed' : action === 'ban' ? 'banned' : action === 'suspend' ? 'suspended' : 'warned';
    report.adminActionTimestamp = Date.now();
    if (notes) report.adminNotes = String(notes).slice(0, 300);

    res.json({ success: true, report });
  } catch (err) {
    console.error('Admin action error:', err);
    res.status(500).json({ error: 'Failed to apply moderation action.' });
  }
});

// ---------------------------------------------------------------------------
// Real-time Socket.io Signaling & Abuse Prevention
// ---------------------------------------------------------------------------
const connectionAttemptsByIpHash = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});

io.on('connection', async (socket) => {
  const ids = getSocketIdentifiers(socket);

  // Connection Rate Limiting: max 20 connections per minute per IP hash
  const connectNow = Date.now();
  if (ids.ipHash) {
    if (!connectionAttemptsByIpHash.has(ids.ipHash)) {
      connectionAttemptsByIpHash.set(ids.ipHash, []);
    }
    const attempts = connectionAttemptsByIpHash.get(ids.ipHash);
    while (attempts.length > 0 && connectNow - attempts[0] > 60000) {
      attempts.shift();
    }
    if (attempts.length >= 20) {
      console.log(`[Rate Limit] Rejected connection burst from IP hash: ${ids.ipHash}`);
      socket.emit('slow_down', { message: 'Too many connection attempts. Please wait a moment.' });
      setTimeout(() => {
        try { socket.disconnect(true); } catch (_) {}
      }, 100);
      return;
    }
    attempts.push(connectNow);
  }

  // Connection Ban Check
  const banned = await isClientBanned(ids);
  if (banned) {
    console.log(`[Ban Enforcement] Rejected banned client connection: ${ids.clientId || ids.ipHash || ids.socketId}`);
    socket.emit('banned', { reason: BAN_MESSAGE });
    setTimeout(() => {
      try { socket.disconnect(true); } catch (_) {}
    }, 100);
    return;
  }

  let lastFindMatchTime = 0;
  const messageTimestamps = [];

  socket.on('find_match', async (data) => {
    // 1. Turnstile Verification Enforcement (Fail Closed)
    const turnstileToken = data?.turnstileToken || socket.handshake.auth?.turnstileToken;
    if (!isTurnstileSessionValid(turnstileToken)) {
      console.warn(`[Turnstile] Blocked unverified match request from socket ${socket.id}`);
      return socket.emit('verification_required', {
        error: 'Cloudflare Turnstile verification required before entering matchmaking queue.'
      });
    }

    // 2. Re-verify ban status before entering queue
    const isNowBanned = await isClientBanned(ids);
    if (isNowBanned) {
      console.log(`[Ban Enforcement] Blocked banned client from joining queue: ${ids.clientId || ids.ipHash || ids.socketId}`);
      socket.emit('banned', { reason: BAN_MESSAGE });
      setTimeout(() => {
        try { socket.disconnect(true); } catch (_) {}
      }, 100);
      return;
    }

    const now = Date.now();

    // 3. Signaling Rate Limiting: 1 request per 1000ms
    if (now - lastFindMatchTime < 1000) {
      return socket.emit('slow_down', { message: 'Please wait a moment before searching again.' });
    }
    lastFindMatchTime = now;

    const mood = data?.mood || 'any';
    const mediaMode = data?.mediaMode || 'text';

    socket.emit('stranger_typing', false);

    // Clear existing pair
    const existingPartner = activePairs.get(socket.id);
    if (existingPartner) {
      const startedAt = pairStartTimes.get(socket.id) || Date.now();
      const dur = Math.round((Date.now() - startedAt) / 1000);
      metrics.recordChatEnded(dur, 'skip');
      pairStartTimes.delete(socket.id);
      pairStartTimes.delete(existingPartner);

      io.to(existingPartner).emit('partner_left');
      activePairs.delete(existingPartner);
      activePairs.delete(socket.id);
    }

    // Always clear waitTimeoutTimer and ensure socket is removed from waitingQueue
    clearWaitTimeout(socket.id);
    removeFromWaitingQueue(socket.id);

    // Record session request metric (no IP, no ID)
    metrics.recordSessionRequested(mediaMode);
    metrics.updateConcurrentUsers(waitingQueue.length + activePairs.size);

    // Try real human match first
    const match = findMatch(socket.id, mediaMode);

    if (match) {
      // Clear timers and remove both from waitingQueue
      clearWaitTimeout(socket.id);
      clearWaitTimeout(match.id);
      removeFromWaitingQueue(socket.id);
      removeFromWaitingQueue(match.id);

      activePairs.set(socket.id, match.id);
      activePairs.set(match.id, socket.id);

      const waitTime = Date.now() - (match.joinedAt || Date.now());
      metrics.recordMatch(waitTime);
      pairStartTimes.set(socket.id, Date.now());
      pairStartTimes.set(match.id, Date.now());
      metrics.updateConcurrentUsers(waitingQueue.length + activePairs.size);

      io.to(socket.id).emit('match_found', { partnerId: match.id, initiator: true });
      io.to(match.id).emit('match_found', { partnerId: socket.id, initiator: false });
    } else {
      // Ensure socket cannot be in waitingQueue twice
      removeFromWaitingQueue(socket.id);
      if (!waitingQueue.some(u => u.id === socket.id)) {
        waitingQueue.push({ id: socket.id, mood, mediaMode, joinedAt: Date.now() });
      }
      metrics.updateConcurrentUsers(waitingQueue.length + activePairs.size);

      // Honest waiting: timeout recorded after 60s (pure human matching only)
      clearWaitTimeout(socket.id);
      const timer = setTimeout(() => {
        metrics.recordWaitTimeout();
        waitTimeoutTimers.delete(socket.id);
      }, 60000);
      waitTimeoutTimers.set(socket.id, timer);
    }
  });

  socket.on('leave_chat', () => {
    clearWaitTimeout(socket.id);
    removeFromWaitingQueue(socket.id);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      const startedAt = pairStartTimes.get(socket.id) || Date.now();
      const dur = Math.round((Date.now() - startedAt) / 1000);
      metrics.recordChatEnded(dur, 'user');
      pairStartTimes.delete(socket.id);
      pairStartTimes.delete(partnerId);

      io.to(partnerId).emit('partner_left');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }
    metrics.updateConcurrentUsers(waitingQueue.length + activePairs.size);
  });

  socket.on('send_message', async (data) => {
    const now = Date.now();

    // Message spam protection: max 6 messages in 3 seconds
    while (messageTimestamps.length > 0 && now - messageTimestamps[0] > 3000) {
      messageTimestamps.shift();
    }
    if (messageTimestamps.length >= 6) {
      return socket.emit('rate_limited', { message: 'You are sending messages too fast. Please slow down.' });
    }
    messageTimestamps.push(now);

    const userText = String(data?.text || '').slice(0, 1000);

    // Server-side text moderation check before delivery
    const safety = await checkMessageSafety(userText);

    // FAIL-SAFE: If every moderation backend is unreachable, fail closed
    if (safety.unreachable || safety.failedSafe) {
      console.error(`[INCIDENT FAIL-SAFE] Moderation backend unreachable for socket ${socket.id} (IP hash: ${ids.ipHash}). Message held.`);
      return socket.emit('moderation_error', {
        message: 'message not sent, try again',
        held: true,
      });
    }

    if (safety.flagged) {
      socket.strikeCount = (socket.strikeCount || 0) + 1;
      console.warn(`[Moderation Strike ${socket.strikeCount}] User ${socket.id} (IP hash: ${ids.ipHash}): ${safety.reason}`);

      if (socket.strikeCount === 1) {
        return socket.emit('moderation_warning', {
          strike: 1,
          message: 'Your message violated Miloo Community Guidelines and was not delivered. Continued violations will result in an immediate temporary ban.',
        });
      } else {
        await storage.setUserStatus(ids.ipHash, 'banned', `Repeated chat toxicity: ${safety.reason}`);
        if (ids.clientId) {
          await storage.setUserStatus(ids.clientId, 'banned', `Repeated chat toxicity: ${safety.reason}`);
        }
        socket.emit('banned', {
          reason: 'Your access has been temporarily suspended due to repeated violations of our Community Guidelines.',
        });
        setTimeout(() => {
          try { socket.disconnect(true); } catch (_) {}
        }, 150);
        return;
      }
    }

    const partnerId = activePairs.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit('receive_message', {
        text: userText,
        from: socket.id,
        timestamp: Date.now()
      });
    }
  });

  socket.on('webrtc_signal', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) io.to(partnerId).emit('webrtc_signal', data);
  });

  socket.on('disconnect', () => {
    clearWaitTimeout(socket.id);
    removeFromWaitingQueue(socket.id);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      const startedAt = pairStartTimes.get(socket.id) || Date.now();
      const dur = Math.round((Date.now() - startedAt) / 1000);
      metrics.recordChatEnded(dur, 'user');
      pairStartTimes.delete(socket.id);
      pairStartTimes.delete(partnerId);

      io.to(partnerId).emit('partner_left');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }
    metrics.updateConcurrentUsers(waitingQueue.length + activePairs.size);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  storage.startPeriodicPurgeJobs();
  console.log(`Miloo Server running with safety & moderation on port ${PORT}`);
});

module.exports = { app, server, io, waitingQueue, activePairs, waitTimeoutTimers, clearWaitTimeout, removeFromWaitingQueue, findMatch };

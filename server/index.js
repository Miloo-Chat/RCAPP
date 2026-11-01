require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const Groq = require('groq-sdk');
const storage = require('./storage');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
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

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'miloo-safety-admin-2026';

// ---------------------------------------------------------------------------
// AI Companion System Prompt (Transparent AI Companion)
// ---------------------------------------------------------------------------
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Milo, a warm, thoughtful, and friendly AI conversational companion on Miloo (miloo.chat).

STRICT TRANSPARENCY RULES:
- You are an AI companion. If asked if you are a bot, AI, or human, ALWAYS say honestly: "I'm Milo, an AI companion here on Miloo 😊". NEVER deceive users or pretend to be a real human.
- Keep replies natural, friendly, and brief (under 15 words).
- Never use full stops or formal jargon.
- Use natural emojis 😊✨👀🎵.
- Use casual abbreviations: u, ur, wbu, wyd, haha, lol, fr, ngl.
- Decline requests for personal social media or phone numbers politely: "I'm an AI companion so I don't have personal socials, but I enjoy chatting here!"
- Match user language (English / Hindi / Hinglish).
`;

// ---------------------------------------------------------------------------
// State: Matching Queues & Active Sockets
// ---------------------------------------------------------------------------
const waitingQueue = [];
const activePairs = new Map();
const botSessions = new Map(); // socketId -> { startTime, history }

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

  // Extract client ID from auth, query, or cookie
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

// Health check endpoint
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

// User Report Submission
app.post('/api/reports', reportLimiter, async (req, res) => {
  try {
    const { reporterId, reportedUser, reason, context } = req.body;

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
      timestamp: Date.now(),
    });

    console.log(`[Safety Report] Reason: ${normalizedReason} | Target: ${reportedUser}`);
    res.json({ success: true, reportId: report.id });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(500).json({ error: 'Failed to record report.' });
  }
});

// Admin Authentication Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.query.token;

  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrative token.' });
  }
  next();
}

// Admin: List Reports
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

// Admin: Apply Action to Report (warn, suspend, ban, dismiss)
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

    // Apply ban/suspension in storage
    if (action === 'ban' || action === 'suspend') {
      await storage.setUserStatus(report.reportedUser, action === 'ban' ? 'banned' : 'suspended', notes || '');

      // Terminate matching socket if currently connected
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', async (socket) => {
  const ids = getSocketIdentifiers(socket);

  // Connection Ban Check: IP hash + persistent client ID cookie + socket ID
  const banned = await isClientBanned(ids);
  if (banned) {
    console.log(`[Ban Enforcement] Rejected banned client connection: ${ids.clientId || ids.ipHash || ids.socketId}`);
    socket.emit('banned', { reason: BAN_MESSAGE });
    setTimeout(() => {
      try { socket.disconnect(true); } catch (_) {}
    }, 100);
    return;
  }

  let botTimer = null;
  let lastFindMatchTime = 0;
  const messageTimestamps = [];

  socket.on('find_match', async (data) => {
    // Re-verify ban status before entering queue
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

    // Signaling Rate Limiting: 1 request per 1000ms
    if (now - lastFindMatchTime < 1000) {
      return socket.emit('slow_down', { message: 'Please wait a moment before searching again.' });
    }
    lastFindMatchTime = now;

    const mood = data?.mood || 'any';
    const mediaMode = data?.mediaMode || 'text';

    // Reset typing state on new match search
    socket.emit('stranger_typing', false);

    // Clear existing pair if any
    const existingPartner = activePairs.get(socket.id);
    if (existingPartner) {
      io.to(existingPartner).emit('partner_left');
      activePairs.delete(existingPartner);
      activePairs.delete(socket.id);
    }

    // Remove from queue if already there
    const idx = waitingQueue.findIndex(u => u.id === socket.id);
    if (idx !== -1) waitingQueue.splice(idx, 1);

    // Clear bot session if any
    if (botSessions.has(socket.id)) {
      botSessions.delete(socket.id);
    }
    if (botTimer) clearTimeout(botTimer);

    // Try real match first
    const match = findMatch(socket.id, mediaMode);

    if (match) {
      const matchIdx = waitingQueue.findIndex(u => u.id === match.id);
      if (matchIdx !== -1) waitingQueue.splice(matchIdx, 1);

      activePairs.set(socket.id, match.id);
      activePairs.set(match.id, socket.id);

      io.to(socket.id).emit('match_found', { partnerId: match.id, initiator: true, isAI: false });
      io.to(match.id).emit('match_found', { partnerId: socket.id, initiator: false, isAI: false });
    } else {
      waitingQueue.push({ id: socket.id, mood, mediaMode, joinedAt: Date.now() });

      if (mediaMode === 'text') {
        botTimer = setTimeout(async () => {
          const qIdx = waitingQueue.findIndex(u => u.id === socket.id);
          if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

          botSessions.set(socket.id, { startTime: Date.now(), history: [] });
          socket.emit('match_found', { partnerId: 'bot_' + socket.id, initiator: false, isAI: true });

          setTimeout(async () => {
            socket.emit('stranger_typing', true);
            setTimeout(async () => {
              socket.emit('stranger_typing', false);
              socket.emit('receive_message', { text: 'hii 😊', from: 'bot_' + socket.id, timestamp: Date.now() });

              const session = botSessions.get(socket.id);
              if (session) session.history.push({ role: 'assistant', content: 'hii 😊' });
            }, 1200);
          }, 800);

        }, 5000);
      }
    }
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

    const partnerId = activePairs.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit('receive_message', {
        text: String(data.text || '').slice(0, 1000),
        from: socket.id,
        timestamp: Date.now()
      });
    } else if (botSessions.has(socket.id)) {
      const session = botSessions.get(socket.id);
      const userText = String(data.text || '').slice(0, 1000);
      session.history.push({ role: 'user', content: userText });

      const startTime = session.startTime;
      const sessionMin = Math.floor((Date.now() - startTime) / 60000);
      let timeCtx = `Session: ${sessionMin}min.`;

      socket.emit('stranger_typing', true);

      try {
        const response = await groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n[${timeCtx}]` },
            ...session.history.slice(-10)
          ],
          temperature: 0.9,
          max_tokens: 150,
          reasoning_effort: 'low',
        });

        const reply = response.choices[0]?.message?.content?.trim() || "heyy 😊";
        session.history.push({ role: 'assistant', content: reply });

        const delay = Math.min(800 + Math.random() * 600 + reply.length * 25, 2200);

        setTimeout(() => {
          socket.emit('stranger_typing', false);
          socket.emit('receive_message', {
            text: reply,
            from: 'bot_' + socket.id,
            timestamp: Date.now()
          });
        }, delay);

      } catch (err) {
        console.error('Bot API error:', err.message);
        socket.emit('stranger_typing', false);
      }
    }
  });

  socket.on('webrtc_signal', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) io.to(partnerId).emit('webrtc_signal', data);
  });

  socket.on('disconnect', () => {
    if (botTimer) clearTimeout(botTimer);
    botSessions.delete(socket.id);

    const qIdx = waitingQueue.findIndex(u => u.id === socket.id);
    if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner_left');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Miloo Server running with safety & moderation on port ${PORT}`));

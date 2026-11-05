# Production Deployment Guide: Miloo Platform

This document describes the production deployment architecture for the **Miloo** anonymous video and text chat platform, detailing requirements, security controls, environment variables, reverse proxy setup, and operational runbooks.

---

## 1. Architecture Overview

Miloo consists of two decoupled runtime services:

1. **Frontend (Static Host / CDN)**
   - Deployed on: **Vercel**, Cloudflare Pages, Netlify, or AWS S3 + CloudFront.
   - Built with Vite (`npm run build:client` or `npm run build`).
   - Serves pre-rendered HTML, JavaScript, CSS, and static assets with HTTP security headers (defined in `vercel.json`).
   - Communicates with the backend exclusively via HTTPS and WebSocket (`wss://`).

2. **Backend (Persistent Node.js Host with WebSockets)**
   - Deployed on: **Railway**, **Render**, **Fly.io**, **AWS ECS/EC2**, or a dedicated Linux VPS.
   - Persistent Node.js process running Express 5 + Socket.IO with sticky/long-lived TCP connections.
   - **Crucial requirement**: The host must natively support WebSocket connections (`Upgrade: websocket`) without synthetic connection termination timeouts (e.g. standard serverless lambdas with 15-30s limits are unsuitable for persistent chat signaling).

```
   ┌───────────────────────┐             ┌─────────────────────────┐
   │    Vercel CDN / S3    │             │   Railway / Fly.io VPS   │
   │   (Static Frontend)   │             │    (Persistent Node)    │
   │                       │             │                         │
   │  • React App & Assets │             │  • Express HTTP API     │
   │  • Clean URLs, SEO    │             │  • Socket.IO Signaling  │
   │  • Strict CSP Headers │             │  • Moderation Pipeline  │
   └──────────┬────────────┘             └────────────▲────────────┘
              │                                       │
              │ HTTPS Fetch / REST                    │ WSS / WebSocket
              └───────────────────────────────────────┘
```

---

## 2. Environment Variables Specification

### 2.1. Frontend (`client/.env`)

These variables are baked into the static build during compilation:

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `VITE_SITE_URL` | Yes | Canonical public URL of the frontend | `https://miloo.chat` |
| `VITE_SERVER_URL` | Yes | Public HTTPS URL of the backend server | `https://api.miloo.chat` |
| `VITE_SUPPORT_EMAIL` | No | Operational contact address | `support@miloo.chat` |
| `VITE_TURNSTILE_SITE_KEY`| Yes | Cloudflare Turnstile public site key | `0x4AAAAAA...` |
| `VITE_UMAMI_SCRIPT_URL` | No | Umami analytics script URL | `https://analytics.umami.is/script.js` |
| `VITE_UMAMI_WEBSITE_ID` | No | Umami tracking ID (if placeholder, won't load)| `e4b2...` |
| `VITE_ADS_ENABLED` | No | Flag controlling AdSense scripts (`false` in prod)| `false` |
| `VITE_SHOW_SEO_POSTS` | No | Controls display of SEO articles (`false` in prod)| `false` |

### 2.2. Backend (`server/.env`)

These variables are read at server runtime:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Node environment (`production` enables security invariants)| `production` |
| `PORT` | No | TCP listening port | `5000` |
| `CORS_ORIGIN` | Yes | Whitelist of allowed client origins (comma-separated)| `https://miloo.chat,https://www.miloo.chat` |
| `ADMIN_PASSWORD_HASH` | Yes (in prod) | Bcrypt hash for admin moderation portal login | `$2a$10$...` |
| `SESSION_SECRET` | Yes (in prod) | Cryptographic secret for signing admin session cookies | `<RANDOM_64_CHAR_HEX>` |
| `TURNSTILE_SECRET_KEY` | Yes (in prod) | Cloudflare Turnstile private server secret | `0x4AAAAAA...` |
| `TURNSTILE_SITE_KEY` | Yes (in prod) | Cloudflare Turnstile site key matching secret | `0x4AAAAAA...` |
| `TRUST_PROXY` | No | Reverse proxy hop count (set `1` for Railway/Fly/Cloudflare)| `1` |
| `DATABASE_URL` | No | PostgreSQL connection URI for persistent bans & reports | `postgresql://user:pass@host:5432/miloo` |
| `OPENAI_API_KEY` | No | OpenAI API key for real-time text moderation | `sk-proj-...` |
| `DETOXIFY_URL` | No | Endpoint of local Detoxify python service | `http://127.0.0.1:5001/moderate` |
| `STUN_URLS` | No | Comma-separated public STUN servers | `stun:stun.l.google.com:19302` |
| `TURN_URL` | No | URL of coturn / custom relay | `turn:turn.miloo.chat:3478` |
| `TURN_USERNAME` | No | Username for TURN relay | `miloo-relay` |
| `TURN_CREDENTIAL` | No | Password/token for TURN relay | `secret-turn-pw` |
| `METERED_API_KEY` | No | API Key for hosted Metered TURN short-lived tokens | `...` |

---

## 3. Reverse Proxy & Trust Proxy Configuration

When deploying behind a reverse proxy, load balancer, or CDN (such as Cloudflare, Railway, Fly.io, AWS ALB, or Nginx), incoming requests pass through proxy servers. Without proper trust proxy settings, `req.ip` and rate limiters would mistakenly read the proxy IP instead of the client IP.

In `server/index.js`, trust proxy is configured as:
```javascript
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || 1 : 1);
```

Ensure your reverse proxy forwards standard client IP headers:
- `X-Forwarded-For: <client_ip>`
- `X-Forwarded-Proto: https`

---

## 4. WebSocket & WSS URL Configuration

Socket.IO operates over standard HTTPS port 443 with WebSocket transport upgrades.

- If frontend is `https://miloo.chat`, the backend should be mapped to `https://api.miloo.chat`.
- Client automatically establishes WebSocket handshakes at:
  ```
  wss://api.miloo.chat/socket.io/?EIO=4&transport=websocket
  ```
- **CORS Configuration**: Socket.IO and Express CORS restrict origins according to `CORS_ORIGIN`:
  ```javascript
  const allowedOrigins = [
    'https://miloo.chat',
    'https://www.miloo.chat',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
  ];
  ```

---

## 5. Health Check Endpoints

Miloo exposes two lightweight health check endpoints for container orchestrators, load balancers, and uptime monitors:

1. **`GET /health`**
   - General HTTP 200 health check.
   - Returns `{ status: 'ok', uptimeSec: 1234, timestamp: 1730700000000 }`.
   - Used by Railway, Render, Kubernetes liveness/readiness probes.

2. **`GET /api/health`**
   - Detailed platform status and presence metrics.
   - Returns `{ status: 'ok', onlineUsers: 42, waitingUsers: 8, activePairs: 17, uptimeSec: 1234 }`.
   - Real human participants only; Miloo strictly features zero bots or automated companions.

---

## 6. Admin Authentication & Session Management

Miloo employs cryptographically signed, HTTP-only cookies (`miloo_admin_session`) using HMAC-SHA256 backed by `SESSION_SECRET`:
- Tokens contain payload timestamps and expiration signatures (`exp: 24h`).
- When the backend restarts or scales horizontally, signed cookies remain valid without forcing admin re-login.
- Brute-force protection: Lockout for 15 minutes after 5 consecutive failed attempts per IP address.

To generate a secure bcrypt password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your_secure_password', 10))"
```

---

## 7. Graceful Degradation: Unreachable Backend Handling

If the backend server goes down for maintenance or is unreachable:
- Socket.IO fires `connect_error`.
- The client UI transitions smoothly to the `server_unreachable` state.
- Instead of broken buttons or infinite spins, users see:
  > **"Chat is taking a short break, please try again."**
  with clean "Try Again" and "Return Home" controls.

---

## 8. Step-by-Step Deployment Runbook

### Step 1: Deploy Backend (Railway / VPS)
1. Push repository or connect GitHub repo to Railway / Render.
2. Set root directory to `server`.
3. Set build command: `npm install`
4. Set start command: `node index.js`
5. Configure environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `ADMIN_PASSWORD_HASH=<your_hash>`
   - `SESSION_SECRET=<random_secret>`
   - `TURNSTILE_SITE_KEY=<cloudflare_site_key>`
   - `TURNSTILE_SECRET_KEY=<cloudflare_secret_key>`
   - `CORS_ORIGIN=https://miloo.chat`
   - `TRUST_PROXY=1`
6. Verify deployment by querying:
   ```bash
   curl -I https://api.miloo.chat/health
   # Expected: HTTP/1.1 200 OK
   ```

### Step 2: Deploy Frontend (Vercel)
1. In Vercel, set root directory to `client` or root with `client` output.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables in Vercel:
   - `VITE_SITE_URL=https://miloo.chat`
   - `VITE_SERVER_URL=https://api.miloo.chat`
   - `VITE_TURNSTILE_SITE_KEY=<cloudflare_site_key>`
5. Verify production headers:
   ```bash
   curl -I https://miloo.chat/
   # Verify Content-Security-Policy, Permissions-Policy, X-Content-Type-Options
   ```

### Step 3: Run Post-Deploy Smoke Test
Run the automated verification suite:
```bash
BASE_URL=https://miloo.chat bash scripts/smoke.sh
```


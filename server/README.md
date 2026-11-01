# Miloo Signaling & Moderation Server

This directory contains the Express & Socket.IO signaling server for Miloo.chat, including peer matching, WebRTC signaling, transparent AI companion fallback, safety reporting, and moderation storage.

## Moderation & Ban Persistence Setup

Miloo uses an abstract storage interface defined in `server/storage.js`:
- `getReports({ status })`
- `addReport(reportData)`
- `setUserStatus(identifier, status, notes)`
- `isBanned(identifier)`

### 1. Hosted Database Mode (Production)
For production deployments (Render, Railway, Fly.io, Heroku, etc.), set the `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
```

Supported providers:
- **Supabase** (Connection string from Project Settings > Database)
- **Neon** (Serverless Postgres connection string)
- **Vercel Postgres**
- **Railway / Render Postgres**

When `DATABASE_URL` is configured, the server automatically connects using `pg` and creates the `reports` and `user_bans` tables on startup if they do not exist.

### 2. Local Development Fallback
When `DATABASE_URL` is not provided, the server automatically falls back to local file storage:
- `server/data/reports.json`
- `server/data/bans.json`

## Ban Enforcement & Client Identification
The server enforces bans across multiple identifiers:
1. **Persistent Client UUID** (`miloo_uid` cookie / auth payload stored in client `document.cookie` and `localStorage`).
2. **SHA-256 IP Hash** (computed on connection handshake to identify abusive IP addresses while respecting privacy).
3. **Active Socket IDs**.

If a connecting user matches any banned identifier, they are immediately disconnected with a clear violation message:
`"Your access to Miloo has been suspended due to violations of our Community Guidelines and Safety Policies."`
Banned users cannot enter the waiting queue or match with anyone.

## Administrative Portal
- Accessible at: `https://www.miloo.chat/admin`
- Authenticated via the `ADMIN_SECRET` environment variable:
```env
ADMIN_SECRET=your_secure_admin_token_here
```

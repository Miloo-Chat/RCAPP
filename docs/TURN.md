# WebRTC ICE & TURN Server Configuration Guide

This document explains how Miloo configures and manages Interactive Connectivity Establishment (ICE) servers, including STUN (Session Traversal Utilities for NAT) and TURN (Traversal Using Relays around NAT), ensuring robust video and audio peer-to-peer connectivity across symmetric NATs, mobile carrier networks, university/corporate firewalls, and restrictive network topologies.

---

## 1. Architecture Overview

WebRTC establishes direct peer-to-peer media streams between two browsers whenever possible using STUN:
1. **STUN (Direct P2P)**: Discovers the client's public reflexive IP address and port mapping. Succeeds in ~80-85% of consumer residential network scenarios.
2. **TURN (Relayed Media)**: Relays encrypted SRTP media packets through an intermediary server when direct peer-to-peer paths are blocked by symmetric NATs or enterprise firewalls (~15-20% of sessions).

```
[Browser A] ───────(STUN Binding Discovery)───────> [STUN Server]
     │                                                     │
     │ (Direct WebRTC Media if Open / Full-Cone NAT)        │
     ▼                                                     ▼
[Browser B] <──────────────────────────────────────────────┘
     ▲
     │ (Fallback via Relayed TURN if Symmetric NAT)
     ▼
[TURN Relay Server (coturn / Metered)]
```

---

## 2. Server Configuration & Environment Variables

Miloo serves ICE server credentials dynamically through the backend endpoint:
```http
GET /api/ice-servers
```

Clients query this endpoint before initiating an `RTCPeerConnection`. This architecture protects third-party API credentials, enables dynamic credential rotation, and allows operational flexibility without redeploying the client frontend.

### Supported Environment Variables (Server `.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `STUN_URLS` | Comma-separated list of public STUN servers | `stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302` |
| `TURN_URL` | Comma-separated list of TURN endpoints (UDP/TCP/TLS) | `turn:turn.miloo.chat:3478?transport=udp,turn:turn.miloo.chat:443?transport=tcp,turns:turn.miloo.chat:5349?transport=tcp` |
| `TURN_USERNAME` | Authentication username for static TURN credentials | `miloo-relay` |
| `TURN_CREDENTIAL` | Authentication password or token for static TURN | `<SECURE_TURN_PASSWORD>` |
| `METERED_API_KEY` | Metered.ca live API key for dynamic short-lived credentials | `<YOUR_METERED_API_KEY>` |
| `METERED_USERNAME` | Metered openrelay static username (fallback) | `<CONFIGURED_USERNAME>` |
| `METERED_PASSWORD` | Metered openrelay static credential (fallback) | `<CONFIGURED_PASSWORD>` |

When `METERED_API_KEY` is present, the server fetches ephemeral, time-limited credentials from Metered's credential issuance API. When self-hosting with `coturn`, define `TURN_URL`, `TURN_USERNAME`, and `TURN_CREDENTIAL`.

---

## 3. Option A: Self-Hosting coturn (Production Standard)

coturn is an open-source, high-performance TURN and STUN server suitable for deployment on an Ubuntu/Debian VPS (e.g., DigitalOcean droplet, AWS EC2, Hetzner, Linode).

### 3.1. Installation

```bash
sudo apt update && sudo apt install -y coturn
```

### 3.2. Configuration (`/etc/turnserver.conf`)

Edit `/etc/turnserver.conf`:

```ini
# Network listening ports
listening-port=3478
tls-listening-port=5349

# IP address bindings (set your server's public IP)
listening-ip=0.0.0.0
external-ip=YOUR_SERVER_PUBLIC_IP

# Realm and Server Name
realm=turn.miloo.chat
server-name=miloo-turn

# Dynamic short-lived credentials using HMAC secret
use-auth-secret
static-auth-secret=YOUR_LONG_HEX_SECRET_STRING

# Port range for UDP relay sessions (must be open in firewall)
min-port=49152
max-port=65535

# TLS Certificate configuration (Let's Encrypt)
cert=/etc/letsencrypt/live/turn.miloo.chat/fullchain.pem
pkey=/etc/letsencrypt/live/turn.miloo.chat/privkey.pem

# Security restrictions
no-tcp-relay
no-multicast-peers
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=127.0.0.0-127.255.255.255

# Performance tuning
fingerprint
lt-cred-mech
stale-nonce=600
log-file=/var/log/turnserver.log
verbose
```

### 3.3. Firewall Configuration (UFW)

Open the required ports:
```bash
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 5349/udp
sudo ufw allow 49152:65535/udp
sudo ufw reload
```

### 3.4. Enable and Start coturn

```bash
sudo systemctl enable coturn
sudo systemctl restart coturn
```

---

## 4. Option B: Managed Hosted TURN (Metered.ca / Twilio / Xirsys)

If you prefer managed global infrastructure with geographic edge routing:

1. Sign up at [Metered.ca](https://www.metered.ca/) or an equivalent provider.
2. Create an App and copy your API Key.
3. Configure your server environment variables:
   ```env
   METERED_API_KEY=your_live_metered_api_key_here
   ```
4. Restart the Miloo backend. The server will automatically query Metered's credential endpoint and dispense time-limited tokens to connecting clients.

---

## 5. Testing & Verification: Relay-Only Mode (`iceTransportPolicy: "relay"`)

To verify that TURN relay functionality operates properly and that peers can connect even when direct P2P is blocked:

### 5.1. Using the Built-in Diagnostic Parameter

Miloo's client supports a diagnostic testing URL parameter:
```
https://miloo.chat/chat?forceRelay=1
```
or
```
http://localhost:5173/chat?forceRelay=1
```

When `forceRelay=1` is provided in the query string:
1. `RTCPeerConnection` is initialized with `{ iceTransportPolicy: 'relay' }`.
2. The browser ignores host and server-reflexive (STUN) candidates.
3. The browser accepts **only** `typ relay` candidates.
4. If two clients connect and video/audio flows normally, the TURN server is confirmed operational.

### 5.2. WebRTC Internals Inspection (`chrome://webrtc-internals`)

1. Open `chrome://webrtc-internals` in Google Chrome or Microsoft Edge.
2. Connect two browsers in video chat with `?forceRelay=1`.
3. Locate the active `RTCPeerConnection`.
4. Inspect the **icecandidate** and **selected candidate pair**:
   - `candidateType` must be `relay`.
   - `protocol` will show `udp` or `tcp`.
   - Relay address will show the TURN server IP.

### 5.3. Standalone Verification Script (`test_turn_relay.cjs`)

A standalone Node.js script is included to query the `/api/ice-servers` endpoint and test candidate harvesting:

```bash
node test_turn_relay.cjs
```


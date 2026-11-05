# Miloo Client Analytics Events Specification

This document defines the complete and exclusive list of analytics events permitted in the Miloo client application.

## 1. Principles & Privacy Guarantees

1. **Consent Mode v2 Default Denied:**
   - On initial page load, all Consent Mode v2 signals (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) default to `'denied'`.
   - The Google Analytics tag (`googletagmanager.com/gtag/js`) is loaded **only** after the user explicitly accepts cookies via the cookie banner.
   - If consent is declined ("Essential Only") or revoked, signals remain or revert to `'denied'`, and the GA tag is removed.

2. **Route Boundaries:**
   - Analytics scripts and event collection run **only** on public content pages (`/`, `/about`, `/faq`, `/privacy`, `/terms`, `/how-it-works`, `/safety`, `/contact`, `/community-guidelines`, `/cookie-policy`, and blog posts).
   - Analytics are **strictly forbidden** and never loaded on `/chat`, `/call`, `/admin`, the age gate, or the transparency page (`/transparency`).

3. **Zero Identifiers & Zero Content:**
   - No user IDs, client IDs, IP addresses, fingerprints, or session cookies are tracked.
   - No chat message content, prompts, or WebRTC call events are tracked.

---

## 2. Permitted Events (Strict Whitelist)

Only the following human-flow and public interaction events are permitted:

| Event Name | Trigger | Allowed Parameters | Privacy & Compliance Details |
| :--- | :--- | :--- | :--- |
| `page_view` | User navigates to an approved public page | `page_path` | Public URL path only. Never sent on private routes (`/chat`, `/call`, `/admin`, `/transparency`). |
| `click_text_chat` | User clicks the "Text chat" button on Home | *(none)* | Binary interaction counter. No user identification. |
| `click_video_chat` | User clicks the "Video chat" button on Home | *(none)* | Binary interaction counter. No user identification. |
| `age_gate_result` | User completes the age confirmation modal | `status` (`passed` \| `exited`), `mode` (`text` \| `video`) | Confirms age gate completion. No birthdate or PII. |
| `share_click` | User clicks the "Send a bird" share button | *(none)* | Viral/share intent counter. No recipient data. |
| `chat_requested` | User initiates chat connection | `mode` (`text` \| `video`) | Human connection intent. Zero user identifiers or IP. |
| `waiting_started` | User enters matchmaking queue | `mode` (`text` \| `video`) | Queue entry timestamp. Zero personal identifiers. |
| `human_matched` | Real human-to-human match established | `mode` (`text` \| `video`) | Match outcome only. No partner ID, socket ID, or IP. |
| `wait_timeout` | User waits 60s without matching a peer | `mode` (`text` \| `video`) | Queue timeout marker. Zero personal data. |
| `chat_ended` | Real conversation ended | `mode` (`text` \| `video`), `reason` (`skip` \| `disconnect` \| `exit`) | Session duration bucket / reason. No message text. |
| `report_clicked` | User opens safety report modal | `category` | Safety moderation intent. Never contains chat messages or user ID. |

---

## 3. Strict Prohibitions: Zero Bot Events & Zero Identifiers

- **Zero Bot Events:** No bot events exist or may ever exist. Miloo does not use automated bots or simulated partners. Every chat is with a real person.
- **Zero Content & Identifiers:** No event may ever contain message text, prompts, transcripts, IPs, fingerprints, socket IDs, client IDs, tokens, or personal identifiers. Any parameter matching forbidden keys (`text`, `message`, `content`, `transcript`, `prompt`, `ip`, `clientId`, etc.) is strictly stripped before transmission.
- **Forbidden Legacy Events:** All automated fallback, bot pairing, and legacy telemetry events are permanently deleted.


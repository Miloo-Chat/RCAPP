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

Only the following **5 events** are permitted:

| Event Name | Trigger | Allowed Parameters | Privacy & Compliance Details |
| :--- | :--- | :--- | :--- |
| `page_view` | User navigates to an approved public page | `page_path` | Public URL path only. Never sent on private routes (`/chat`, `/call`, `/admin`, `/transparency`). |
| `click_text_chat` | User clicks the "Text chat" button on Home | *(none)* | Binary interaction counter. No user identification. |
| `click_video_chat` | User clicks the "Video chat" button on Home | *(none)* | Binary interaction counter. No user identification. |
| `age_gate_result` | User completes the age confirmation modal | `status` (`passed` \| `exited`), `mode` (`text` \| `video`) | Confirms age gate completion. No birthdate or PII. |
| `share_click` | User clicks the "Send a bird" share button | *(none)* | Viral/share intent counter. No recipient data. |

---

## 3. Prohibited & Removed Events

The following event types have been removed from the client analytics whitelist:
- **Chat & WebRTC events:** `chat_started`, `chat_ended`, `webrtc_ice_state`, `camera_permission_*`, `send_message_*`, `video_nsfw_detected` (funnel stats stay server-side only).
- **Bot events:** All automated partner and bot events are strictly prohibited and permanently removed. Miloo does not use AI bots or automated partners. Every stranger you meet is a real person.
- **Redundant / unused events:** `button_click`, `go_to_chat`, `mood_selected`, `chat_mode_selected`, `report_clicked`.


# MILOO redesign rules

VISUAL LAYER ONLY. Hard rules:
- Never modify socket.on / socket.emit handlers, WebRTC/peer connection code, matching logic, bot fallback (bot_ partnerId, 5s timer), or any state/effect logic.
- Only touch JSX structure, className, CSS, and new presentational components.
- If a visual change needs a logic change, STOP and ask me.
- Must keep working: text chat, video chat, skip/next, camera permission flow, stranger_typing, receive_message/send_message, partner_left, Google Analytics events, SEO blog pages, useCanonical.
- Do not add UI for features that don't exist.
- No WebGL/shaders/heavy deps unless I approve. Prefer CSS / SVG / Motion.
- After each step run `cd client && npm run build` and fix errors before continuing.
- Commit after each completed step with a clear message.

Full design brief: .redesign/brief.md

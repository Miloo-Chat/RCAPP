# Miloo Internal Incident Response Procedure (docs/INCIDENTS.md)

> **Notice:** This document is an internal operational procedure and operational checklist for Miloo site administrators and trust & safety moderators. It is NOT legal advice. Consult qualified legal counsel for statutory questions.

---

## 1. Scope & Priority Levels

This procedure applies immediately whenever an incident report involves prohibited or illegal content, specifically:
- **Priority 1 (Critical):** Child Sexual Abuse Material (CSAM), Child Sexual Exploitation and Abuse (CSAE), or imminent threats to human life / credible violence.
- **Priority 2 (High):** Sextortion, non-consensual intimate imagery (NCII), cyberstalking, or active financial extortion.
- **Priority 3 (Elevated):** Severe targeted harassment, doxxing of physical residential addresses, or credible threats of property damage.

---

## 2. Immediate Containment Checklist (Within 0–5 Minutes)

- [ ] **Step 1: Sever Active Connections**
  - Locate the reported user identity in the `/admin` portal or server memory.
  - Terminate the active Socket.IO connection immediately.
  - Ensure the matched peer connection is torn down.

- [ ] **Step 2: Enforce Immediate Network & Hardware Quarantine**
  - Place the user's SHA-256 IP hash and client device fingerprint token on the permanent blacklist.
  - Trigger automatic Socket handshake rejection (`status: 'banned'`).

- [ ] **Step 3: Quarantine Telemetry & Evidence**
  - Secure the associated ephemeral incident record:
    - Session ID
    - Timestamp (UTC)
    - IP hash and network provider metadata
    - Reporter reason and submitted message log excerpt
  - **CRITICAL EVIDENCE HANDLING:** Under 18 U.S.C. § 2258A and international child protection law:
    - **NEVER** download, re-encode, screenshot, copy, or redistribute explicit imagery depicting minors.
    - Preserve only server hash metadata, connection timestamps, and network routing logs.

---

## 3. Mandatory External Reporting Checklist (Priority 1: CSAM / CSAE)

When an incident involves suspected child exploitation or CSAM:

- [ ] **Step 1: NCMEC CyberTipline Report (Mandatory for Electronic Service Providers)**
  - Access the National Center for Missing & Exploited Children (NCMEC) CyberTipline:  
    `https://www.cybertipline.org` or ESP portal `https://report.cybertip.org`
  - Complete the online ESP report with:
    - Incident date and timestamp (UTC)
    - Offender's IP address and port (if preserved in signaling handshake)
    - Any user handles, external URLs, or file hashes provided
    - Specific reason code: CSAM / Online Enticement / Child Sex Trafficking
  - Record and preserve the NCMEC Report Confirmation ID.

- [ ] **Step 2: International / Domestic Reporting**
  - **India:** If the offender or victim is located in India, file an incident notice on the National Cyber Crime Reporting Portal (`cybercrime.gov.in`) and notify the designated Grievance Officer pursuant to the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
  - **UK / Europe:** For UK incidents, report to the Internet Watch Foundation (IWF) at `iwf.org.uk` or relevant national cyber police unit.

---

## 4. Sextortion & Credible Threats Response Checklist (Priority 2)

When an adult user reports being blackmailed, extorted, or threatened with non-consensual imagery distribution:

- [ ] **Step 1: Advise the Victim on Containment**
  - Instruct the victim **NEVER** to send money, cryptocurrency, or gift cards to the extortionist.
  - Advise setting all external social accounts (Instagram, LinkedIn, Facebook) to Private immediately.
  - Recommend referring to Take It Down (`takeitdown.ncmec.org`) or StopNCII (`stopncii.org`) to generate cryptographic image hashes to prevent cross-platform sharing.

- [ ] **Step 2: Evidence Preservation**
  - Archive the user's report log and flagged chat text for 30 days in the secure moderation archive.
  - Provide the victim with their incident Reference ID for their own police report.

- [ ] **Step 3: Network Sanctions**
  - Apply permanent device token and IP hash ban to the extortionist.

---

## 5. Post-Incident Review & Data Hygiene Checklist

- [ ] **Step 1: Verify Session Purge**
  - Confirm that no unencrypted text messages remain in server device buffers.
  - Verify WebRTC media relays (TURN servers) have zero cached media frames.

- [ ] **Step 2: Internal Audit Log**
  - Record the action taken in `/admin` (Action: Ban / Dismiss, Administrator Notes, Action Timestamp).
  - Confirm that the report status is updated from `pending` to `banned`.

- [ ] **Step 3: 30-Day Purge Verification**
  - Confirm automated retention policy will purge the report context after 30 days, retaining only the hashed ban signature.


/**
 * server/metrics.js
 * 
 * Server-Side Anonymous Matching & Funnel Metrics.
 * 
 * STRICT PRIVACY & INTEGRITY GUARANTEES:
 * - ZERO message content, transcripts, or prompts.
 * - ZERO IP addresses or hashed IP tracking.
 * - ZERO persistent user identifiers or tracking tokens.
 * - Aggregate counters and statistical buckets only.
 */

class ServerMetrics {
  constructor() {
    this.sessionsRequested = {}; // 'YYYY-MM-DD' -> { text: 0, video: 0 }
    this.waitTimes = []; // array of wait seconds for median & percentiles
    this.matched15s = 0;
    this.matched30s = 0;
    this.matched60s = 0;
    this.totalMatches = 0;
    this.waitTimeouts = 0;

    this.chatLengthBuckets = {
      '<30s': 0,
      '30s-2m': 0,
      '2m-5m': 0,
      '5m-15m': 0,
      '15m+': 0,
    };

    this.endedBy = {
      user: 0,
      peer: 0,
      skip: 0,
      report: 0,
    };

    this.reports = 0;

    this.concurrent = {
      current: 0,
      peak: 0,
      hourly: {}, // 'YYYY-MM-DD-HH' -> peak
    };
  }

  _todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  _hourKey() {
    const d = new Date();
    return `${d.toISOString().slice(0, 10)}-${String(d.getUTCHours()).padStart(2, '0')}:00`;
  }

  recordSessionRequested(mode) {
    const day = this._todayKey();
    if (!this.sessionsRequested[day]) {
      this.sessionsRequested[day] = { text: 0, video: 0 };
    }
    const cleanMode = mode === 'text' ? 'text' : 'video';
    this.sessionsRequested[day][cleanMode] = (this.sessionsRequested[day][cleanMode] || 0) + 1;
  }

  recordMatch(waitMs) {
    const waitSec = Math.max(0, Math.round(waitMs / 1000));
    this.totalMatches += 1;
    this.waitTimes.push(waitSec);
    // Keep bounded array of recent wait times for median calculation
    if (this.waitTimes.length > 5000) {
      this.waitTimes.shift();
    }

    if (waitSec <= 15) this.matched15s += 1;
    if (waitSec <= 30) this.matched30s += 1;
    if (waitSec <= 60) this.matched60s += 1;
  }

  recordWaitTimeout() {
    this.waitTimeouts += 1;
  }

  recordChatEnded(durationSec, endedByReason) {
    const dur = Math.max(0, Number(durationSec) || 0);

    if (dur < 30) {
      this.chatLengthBuckets['<30s'] += 1;
    } else if (dur < 120) {
      this.chatLengthBuckets['30s-2m'] += 1;
    } else if (dur < 300) {
      this.chatLengthBuckets['2m-5m'] += 1;
    } else if (dur < 900) {
      this.chatLengthBuckets['5m-15m'] += 1;
    } else {
      this.chatLengthBuckets['15m+'] += 1;
    }

    const reason = ['user', 'peer', 'skip', 'report'].includes(endedByReason)
      ? endedByReason
      : 'user';
    this.endedBy[reason] = (this.endedBy[reason] || 0) + 1;
  }

  recordReport() {
    this.reports += 1;
  }

  updateConcurrentUsers(count) {
    const cleanCount = Math.max(0, Number(count) || 0);
    this.concurrent.current = cleanCount;
    if (cleanCount > this.concurrent.peak) {
      this.concurrent.peak = cleanCount;
    }

    const hour = this._hourKey();
    if (!this.concurrent.hourly[hour] || cleanCount > this.concurrent.hourly[hour]) {
      this.concurrent.hourly[hour] = cleanCount;
    }
  }

  getMedianWait() {
    if (this.waitTimes.length === 0) return 0;
    const sorted = [...this.waitTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  getSummary() {
    const total = this.totalMatches;
    const pct15 = total > 0 ? Math.round((this.matched15s / total) * 100) : 0;
    const pct30 = total > 0 ? Math.round((this.matched30s / total) * 100) : 0;
    const pct60 = total > 0 ? Math.round((this.matched60s / total) * 100) : 0;

    return {
      sessionsRequested: this.sessionsRequested,
      totalMatches: this.totalMatches,
      matchedWithin15sPct: pct15,
      matchedWithin30sPct: pct30,
      matchedWithin60sPct: pct60,
      medianWaitSeconds: this.getMedianWait(),
      waitTimeouts: this.waitTimeouts,
      chatLengthBuckets: this.chatLengthBuckets,
      endedBy: this.endedBy,
      reports: this.reports,
      concurrentUsers: {
        current: this.concurrent.current,
        peak: this.concurrent.peak,
        hourly: this.concurrent.hourly,
      },
      timestamp: Date.now(),
    };
  }

  exportCSV() {
    const s = this.getSummary();
    const rows = [];

    rows.push(['Metric Category', 'Key / Dimension', 'Value']);

    // Sessions requested per day
    for (const [day, counts] of Object.entries(s.sessionsRequested)) {
      rows.push(['Sessions Requested', `${day} (text)`, counts.text || 0]);
      rows.push(['Sessions Requested', `${day} (video)`, counts.video || 0]);
    }

    // Match funnel
    rows.push(['Match Funnel', 'Total Human Matches', s.totalMatches]);
    rows.push(['Match Funnel', '% Matched <= 15s', `${s.matchedWithin15sPct}%`]);
    rows.push(['Match Funnel', '% Matched <= 30s', `${s.matchedWithin30sPct}%`]);
    rows.push(['Match Funnel', '% Matched <= 60s', `${s.matchedWithin60sPct}%`]);
    rows.push(['Match Funnel', 'Median Wait (seconds)', s.medianWaitSeconds]);
    rows.push(['Match Funnel', 'Wait Timeouts (60s+)', s.waitTimeouts]);

    // Chat length buckets
    for (const [bucket, val] of Object.entries(s.chatLengthBuckets)) {
      rows.push(['Chat Duration', bucket, val]);
    }

    // Ended by
    for (const [reason, val] of Object.entries(s.endedBy)) {
      rows.push(['Session Ended By', reason, val]);
    }

    // Reports
    rows.push(['Moderation', 'Total Reports', s.reports]);

    // Concurrent users
    rows.push(['Concurrent Users', 'Current Active', s.concurrentUsers.current]);
    rows.push(['Concurrent Users', 'Peak All-Time', s.concurrentUsers.peak]);
    for (const [hr, count] of Object.entries(s.concurrentUsers.hourly)) {
      rows.push(['Concurrent Users Hourly Peak', hr, count]);
    }

    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}

const metrics = new ServerMetrics();
module.exports = metrics;


/**
 * server/moderation.js
 * 
 * Server-side text chat moderation service.
 * Follows the strict rule hierarchy:
 * 1. OpenAI Moderation endpoint (if OPENAI_API_KEY is present or mode is 'openai').
 * 2. Local Detoxify microservice (http://127.0.0.1:5001/moderate or DETOXIFY_URL).
 * 3. Built-in regex rule-based toxicity & threat classifier fallback.
 * 
 * FAIL-SAFE:
 * If every moderation backend is unreachable or errors out,
 * returns { unreachable: true, failedSafe: true } to fail closed.
 */

const fs = require('fs');
const path = require('path');

const TOXIC_PATTERNS = [
  // Severe slurs and hate speech
  /\b(nigg[a-z]*|fagg?ot[s]?|kike[s]?|chink[s]?|cunt[s]?)\b/i,
  // Severe threats & violence
  /\b(kill\s+your\s*self|i\s+will\s+(kill|murder|slit|rape)\s+you|bomb\s+threat)\b/i,
  // Commercial spam & phishing links
  /\b(t\.me\/[a-z0-9_]+|bit\.ly\/[a-z0-9_]+|wa\.me\/[0-9]+)\b/i,
  // Credit card number pattern (Luhn candidate)
  /\b(?:\d[ -]*?){13,16}\b/,
];

function logModerationIncident(details) {
  const incidentEntry = `[${new Date().toISOString()}] MODERATION_UNREACHABLE_INCIDENT: ${JSON.stringify(details)}\n`;
  console.error(incidentEntry);
  try {
    const logDir = path.join(__dirname, 'data');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logDir, 'incidents.log'), incidentEntry, 'utf8');
  } catch (err) {
    console.error('Failed to append to incidents.log:', err.message);
  }
}

async function checkOpenAI(cleanText, apiKey) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: cleanText }),
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI HTTP ${response.status}`);
  }

  const data = await response.json();
  const result = data?.results?.[0];
  if (result?.flagged) {
    const matchedCategories = Object.keys(result.categories || {}).filter(
      k => result.categories[k]
    );
    return {
      flagged: true,
      provider: 'openai',
      categories: matchedCategories,
      reason: `Violated safety categories: ${matchedCategories.join(', ')}`,
    };
  }
  return { flagged: false, provider: 'openai' };
}

async function checkDetoxify(cleanText, detoxifyUrl) {
  const detoxifyRes = await fetch(detoxifyUrl || 'http://127.0.0.1:5001/moderate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: cleanText }),
    signal: AbortSignal.timeout(1200),
  });

  if (!detoxifyRes.ok) {
    throw new Error(`Detoxify HTTP ${detoxifyRes.status}`);
  }

  const detoxifyData = await detoxifyRes.json();
  if (detoxifyData?.flagged) {
    return {
      flagged: true,
      provider: 'detoxify',
      toxicity: detoxifyData.toxicity,
      reason: `High toxicity score (${(detoxifyData.toxicity * 100).toFixed(1)}%)`,
    };
  }
  return { flagged: false, provider: 'detoxify' };
}

function checkRegexPatterns(cleanText, patterns = TOXIC_PATTERNS) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error('Regex pattern set is unavailable or empty');
  }
  for (const pattern of patterns) {
    if (pattern.test(cleanText)) {
      return {
        flagged: true,
        provider: 'regex',
        reason: 'Violated platform community guidelines against hate speech, threats, or spam.',
      };
    }
  }
  return { flagged: false, provider: 'regex' };
}

/**
 * Main moderation dispatcher
 * @param {string} text
 * @param {object} options - Optional overrides for testing modes and fail-safe conditions
 */
async function checkMessageSafety(text, options = {}) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return { flagged: false, provider: 'clean' };

  const mode = options.mode || process.env.MODERATION_MODE || 'all';
  const errors = [];

  // Mode: OpenAI Only
  if (mode === 'openai') {
    const key = options.openAiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      logModerationIncident({ mode: 'openai', error: 'Missing OPENAI_API_KEY' });
      return { flagged: false, unreachable: true, failedSafe: true, reason: 'OpenAI moderation key missing' };
    }
    try {
      return await checkOpenAI(cleanText, key);
    } catch (err) {
      logModerationIncident({ mode: 'openai', error: err.message });
      return { flagged: false, unreachable: true, failedSafe: true, reason: `OpenAI unreachable: ${err.message}` };
    }
  }

  // Mode: Detoxify Only
  if (mode === 'detoxify') {
    const url = options.detoxifyUrl || process.env.DETOXIFY_URL || 'http://127.0.0.1:5001/moderate';
    try {
      return await checkDetoxify(cleanText, url);
    } catch (err) {
      logModerationIncident({ mode: 'detoxify', error: err.message });
      return { flagged: false, unreachable: true, failedSafe: true, reason: `Detoxify unreachable: ${err.message}` };
    }
  }

  // Mode: Regex Only
  if (mode === 'regex') {
    try {
      const patterns = options.patterns !== undefined ? options.patterns : TOXIC_PATTERNS;
      return checkRegexPatterns(cleanText, patterns);
    } catch (err) {
      logModerationIncident({ mode: 'regex', error: err.message });
      return { flagged: false, unreachable: true, failedSafe: true, reason: `Regex engine unreachable: ${err.message}` };
    }
  }

  // Mode: Forced Fail-Safe Test Mode
  if (options.forceUnreachable || mode === 'unreachable') {
    logModerationIncident({ mode: 'all', reason: 'Forced unreachable test condition' });
    return {
      flagged: false,
      unreachable: true,
      failedSafe: true,
      reason: 'All moderation backends unreachable',
    };
  }

  // Default Fallback Chain: OpenAI -> Detoxify -> Regex
  // 1. OpenAI (if key provided)
  const openAiKey = options.openAiKey || process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      return await checkOpenAI(cleanText, openAiKey);
    } catch (err) {
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  // 2. Detoxify (if configured or accessible)
  const detoxifyUrl = options.detoxifyUrl || process.env.DETOXIFY_URL;
  if (detoxifyUrl || options.tryDetoxify) {
    try {
      return await checkDetoxify(cleanText, detoxifyUrl);
    } catch (err) {
      errors.push(`Detoxify: ${err.message}`);
    }
  }

  // 3. Regex Heuristics
  try {
    const patterns = options.patterns !== undefined ? options.patterns : TOXIC_PATTERNS;
    return checkRegexPatterns(cleanText, patterns);
  } catch (err) {
    errors.push(`Regex: ${err.message}`);
  }

  // Every backend failed / unreachable -> FAIL CLOSED
  logModerationIncident({ mode: 'all', errors });
  return {
    flagged: false,
    unreachable: true,
    failedSafe: true,
    reason: `All moderation backends unreachable: ${errors.join('; ')}`,
  };
}

module.exports = {
  checkMessageSafety,
  checkOpenAI,
  checkDetoxify,
  checkRegexPatterns,
  TOXIC_PATTERNS,
};

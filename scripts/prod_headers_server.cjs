// scripts/prod_headers_server.cjs
// Static server applying production headers strictly matching vercel.json.
// Reads real origins from environment if provided. Supports gzip compression for performance audits.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT || '8899', 10);
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const VERCEL_JSON_PATH = path.resolve(__dirname, '../client/vercel.json');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.xml']);

function getHeadersForRoute(pathname) {
  const mergedHeaders = {};
  let vercelConfig;
  try {
    vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf8'));
  } catch {
    vercelConfig = { headers: [] };
  }

  for (const entry of vercelConfig.headers || []) {
    let patternStr = entry.source.replace(/\(\.\*\)/g, '.*');
    const regex = new RegExp(`^${patternStr}$`);
    if (regex.test(pathname)) {
      for (const h of entry.headers) {
        let val = h.value;
        if (h.key.toLowerCase() === 'content-security-policy') {
          let apiOrigins = process.env.API_ORIGINS;
          if (!apiOrigins && (process.env.BACKEND_HTTP_ORIGIN || process.env.BACKEND_WSS_ORIGIN)) {
            apiOrigins = `${process.env.BACKEND_HTTP_ORIGIN || ''} ${process.env.BACKEND_WSS_ORIGIN || ''}`.trim();
          }
          if (!apiOrigins) {
            apiOrigins = 'http://localhost:3001 ws://localhost:3001';
          }
          if (!val.includes(apiOrigins)) {
            val = val.replace("connect-src 'self'", `connect-src 'self' ${apiOrigins}`);
          }
        }
        mergedHeaders[h.key.toLowerCase()] = val;
      }
    }
  }

  return mergedHeaders;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Handle /cookie redirect rule
  if (pathname === '/cookie') {
    res.writeHead(301, {
      Location: '/cookie-policy' + (parsedUrl.search || ''),
      'X-Robots-Tag': 'noindex, nofollow',
    });
    return res.end();
  }

  // Determine file path
  let filePath = path.join(DIST_DIR, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(DIST_DIR, pathname, 'index.html'))) {
      filePath = path.join(DIST_DIR, pathname, 'index.html');
    } else {
      filePath = path.join(DIST_DIR, '404.html');
      res.statusCode = 404;
    }
  }

  const routeHeaders = getHeadersForRoute(pathname);
  for (const [key, val] of Object.entries(routeHeaders)) {
    res.setHeader(key, val);
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');

  if (req.method === 'HEAD') {
    return res.end();
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    const gzip = zlib.createGzip();
    fs.createReadStream(filePath).pipe(gzip).pipe(res);
  } else {
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`Production headers server running on port ${PORT}`);
});

// scripts/prod_headers_server.cjs
// Static server applying production headers strictly matching vercel.json.
// Reads real origins from environment if provided.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT || '8899', 10);
const DIST_DIR = path.resolve(__dirname, '../client/dist');

// Read vercel.json to extract route rules
const vercelConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../client/vercel.json'), 'utf8'));

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

function getHeadersForRoute(pathname) {
  const mergedHeaders = {};

  for (const entry of vercelConfig.headers || []) {
    // Vercel source pattern regex matching
    // e.g. "/(.*)", "/chat(.*)", "/admin(.*)", "/blog/omegle-alternative(.*)"
    let patternStr = entry.source.replace(/\(\.\*\)/g, '.*');
    const regex = new RegExp(`^${patternStr}$`);
    if (regex.test(pathname)) {
      for (const h of entry.headers) {
        let val = h.value;
        if (h.key.toLowerCase() === 'content-security-policy') {
          const apiOrigins = process.env.API_ORIGINS || 'http://localhost:3001 ws://localhost:3001';
          val = val.replace("connect-src 'self'", `connect-src 'self' ${apiOrigins}`);
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

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Production headers server running on port ${PORT}`);
});


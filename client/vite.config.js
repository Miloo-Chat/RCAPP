import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function previewVercelSimulation() {
  return {
    name: 'preview-vercel-simulation',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '/'
        const cleanPath = rawUrl.split('?')[0].replace(/\/$/, '') || '/'

        // 1. 301 Redirect /cookie -> /cookie-policy
        if (cleanPath === '/cookie') {
          res.writeHead(301, {
            Location: '/cookie-policy',
            'X-Robots-Tag': 'noindex, nofollow',
            'Content-Type': 'text/plain',
          })
          res.end('Redirecting to /cookie-policy')
          return
        }

        const NOINDEX_ROUTES = [
          '/admin',
          '/chat',
          '/call',
          '/404',
          '/blog/omegle-alternative',
          '/blog/random-video-chat-india',
          '/blog/stranger-chat-india',
          '/blog/video-chat-no-signup',
        ]
        const isNoindex = NOINDEX_ROUTES.some(p => cleanPath === p || cleanPath.startsWith(p + '/'))
        const noindexHeaders = isNoindex ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}

        // 2. Serve static prerendered HTML file for clean URL routes
        const distDir = path.resolve(__dirname, 'dist')
        const directFile = path.join(distDir, cleanPath === '/' ? 'index.html' : cleanPath)
        const htmlFile = directFile + '.html'
        const indexInDir = path.join(directFile, 'index.html')

        if (cleanPath === '/') {
          return next()
        }

        if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
          return next()
        }

        if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...noindexHeaders })
          fs.createReadStream(htmlFile).pipe(res)
          return
        }

        if (fs.existsSync(indexInDir) && fs.statSync(indexInDir).isFile()) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...noindexHeaders })
          fs.createReadStream(indexInDir).pipe(res)
          return
        }

        // 3. Serve branded 404 page with HTTP status 404 for unknown URLs
        const notFoundPath = path.join(distDir, '404.html')
        if (fs.existsSync(notFoundPath)) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' })
          fs.createReadStream(notFoundPath).pipe(res)
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), previewVercelSimulation()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor'
            if (id.includes('react-router-dom')) return 'router'
            if (id.includes('socket.io-client')) return 'socket'
          }
        },
      },
    },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Saat `npm run dev`: layani /api/* memakai berkas di folder api/ (format Vercel Functions),
 * sehingga formulir aspirasi bisa diuji lokal tanpa Vercel CLI.
 */
function devApi(): Plugin {
  return {
    name: 'dev-vercel-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl ?? req.url ?? ''
        const match = url.match(/^\/api\/([a-z0-9-]+)(?:\?.*)?$/i)
        if (!match) return next()
        try {
          const mod = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<string, (r: Request) => Response | Promise<Response>>
          const method = (req.method ?? 'GET').toUpperCase()
          const handler = mod[method]
          if (!handler) {
            res.statusCode = 405
            return res.end('Method Not Allowed')
          }
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const headers: Record<string, string> = {}
          for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : v
          const request = new Request(`http://localhost${url}`, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // variabel server (tanpa awalan VITE_) dari .env.local untuk /api lokal; tidak pernah masuk ke bundel browser
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  }
  return { plugins: [react(), devApi()] }
})

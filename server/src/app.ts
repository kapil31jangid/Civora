import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import chatRouter from './routes/chat.js'
import conversationsRouter from './routes/conversations.js'
import { errorHandler } from './utils/http.js'

export function createApp() {
  const app = express()
  const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim())
  const privateCors = cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowed.includes('*') ||
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }
      callback(null, false)
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
  app.disable('x-powered-by')
  app.use(helmet())
  // /chat is intentionally public for Arena evaluation. Conversation routes
  // remain restricted to configured browser origins; server-to-server calls
  // without an Origin header continue to work.
  app.use(['/chat', '/api/chat'], cors({ origin: true, methods: ['POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }))
  app.use(['/conversations', '/api/conversations'], privateCors)
  app.use(express.json({ limit: '32kb' }))
  app.get(['/health', '/api/health', '/api'], (_req, res) => res.json({ status: 'ok' }))
  app.use(['/chat', '/api/chat'], chatRouter)
  app.use(['/conversations', '/api/conversations'], conversationsRouter)
  app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))
  app.use(errorHandler)
  return app
}

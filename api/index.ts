import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createApp } from '../server/src/app.js'

let appInstance: ReturnType<typeof createApp> | undefined

function getApp() {
  if (!appInstance) {
    appInstance = createApp()
  }
  return appInstance
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const app = getApp()
  return app(req, res)
}

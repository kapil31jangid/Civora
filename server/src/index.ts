import 'dotenv/config'
import { createApp } from './app.js'

const port = Number(process.env.PORT) || 3001
createApp().listen(port, () => {
  process.stdout.write(`Civora API listening on port ${port}\n`)
})

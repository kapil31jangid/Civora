import { Router } from 'express'
import { z } from 'zod'
import { MODES, type Mode } from '../types/index.js'
import { generateResponse } from '../services/gemini.js'
import { getStore } from '../services/store.js'
import { asyncRoute, HttpError } from '../utils/http.js'
import { parseCommand } from '../utils/commands.js'
import { createTitle } from '../utils/title.js'
import { detectMessageDomain, buildModeRedirect } from '../utils/domainGuard.js'

const router = Router()
const schema = z.object({
  message: z.string().trim().min(1).max(6000),
  conversationId: z.string().uuid().optional(),
  clientId: z.string().trim().min(1).max(200).optional(),
  mode: z.enum(MODES).optional(),
}).refine((data) => Boolean(data.conversationId) === Boolean(data.clientId), {
  message: 'conversationId and clientId must be supplied together',
})

router.post('/', asyncRoute(async (req, res) => {
  const input = schema.parse(req.body)

  if (!input.conversationId || !input.clientId) {
    const parsed = parseCommand(input.message, input.mode ?? 'auto')
    if (!parsed.message) throw new HttpError(400, 'Please include a city problem after the mode command.')

    // Domain guard — only enforce in specific (non-auto) modes
    if (parsed.mode !== 'auto') {
      const detected = detectMessageDomain(parsed.message)
      const redirect = detected ? buildModeRedirect(detected, parsed.mode) : null
      if (redirect) {
        res.json({ response: redirect, mode: parsed.mode, modeRedirect: detected })
        return
      }
    }

    const response = await generateResponse({ message: parsed.message, mode: parsed.mode, action: parsed.action })
    res.json({ response, mode: parsed.mode })
    return
  }

  const store = getStore()
  const conversation = await store.getConversation(input.conversationId, input.clientId)
  const requestedMode: Mode = input.mode ?? conversation.mode
  const parsed = parseCommand(input.message, requestedMode)
  if (parsed.mode !== conversation.mode) {
    await store.updateConversation(conversation.id, input.clientId, { mode: parsed.mode })
  }
  if (!parsed.message) {
    res.json({ response: `${modeName(parsed.mode)} specialist activated. Describe the urban issue you want to work on.`, mode: parsed.mode, modeChanged: true })
    return
  }

  // Domain guard for stateful conversations — only enforce in specific (non-auto) modes
  if (parsed.mode !== 'auto') {
    const detected = detectMessageDomain(parsed.message)
    const redirect = detected ? buildModeRedirect(detected, parsed.mode) : null
    if (redirect) {
      // Still persist the user message so history is coherent, but return the redirect
      await store.addMessage(conversation.id, input.clientId, 'user', input.message)
      await store.addMessage(conversation.id, input.clientId, 'assistant', redirect)
      res.json({ response: redirect, mode: parsed.mode, modeRedirect: detected })
      return
    }
  }

  let history = await store.listMessages(conversation.id, input.clientId, 10)
  let summary = conversation.summary
  if (history.length === 10) {
    summary = extendSummary(summary, history.slice(0, 2))
    await store.updateConversation(conversation.id, input.clientId, { summary })
    history = history.slice(2)
  }
  await store.addMessage(conversation.id, input.clientId, 'user', input.message)
  if (conversation.title === 'New Chat') {
    await store.updateConversation(conversation.id, input.clientId, { title: createTitle(parsed.message) })
  }
  const response = await generateResponse({
    message: parsed.message,
    mode: parsed.mode,
    action: parsed.action,
    summary,
    history: history.map(({ role, content }) => ({ role, content })),
  })
  await store.addMessage(conversation.id, input.clientId, 'assistant', response)
  res.json({ response, mode: parsed.mode, modeChanged: parsed.modeChanged ?? false })
}))

function modeName(mode: Mode) {
  return ({ auto: 'Smart Auto', mobility: 'Mobility', waste: 'Waste', pollution: 'Pollution', spaces: 'Public Spaces', water: 'Urban Water' })[mode]
}

function extendSummary(existing: string | null, messages: Array<{ role: string; content: string }>) {
  const additions = messages.map((item) => `${item.role === 'user' ? 'User context' : 'Earlier Civora guidance'}: ${item.content.replace(/\s+/g, ' ').slice(0, 500)}`)
  return [existing, ...additions].filter(Boolean).join('\n').slice(-2500)
}

export default router


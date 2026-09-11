import { Router } from 'express'
import { z } from 'zod'
import { MODES } from '../types/index.js'
import { asyncRoute } from '../utils/http.js'
import { getStore } from '../services/store.js'

const router = Router()
const clientId = z.string().trim().min(1).max(200)
const uuid = z.string().uuid()

router.post('/', asyncRoute(async (req, res) => {
  const input = z.object({ clientId, mode: z.enum(MODES).optional() }).parse(req.body)
  res.status(201).json({ conversation: await getStore().createConversation(input.clientId, input.mode) })
}))

router.get('/', asyncRoute(async (req, res) => {
  const id = clientId.parse(req.query.clientId)
  res.json({ conversations: await getStore().listConversations(id) })
}))

router.get('/:id', asyncRoute(async (req, res) => {
  const id = uuid.parse(req.params.id)
  const owner = clientId.parse(req.query.clientId)
  res.json({ conversation: await getStore().getConversation(id, owner) })
}))

router.patch('/:id', asyncRoute(async (req, res) => {
  const id = uuid.parse(req.params.id)
  const input = z.object({ clientId, title: z.string().trim().min(1).max(80).optional(), mode: z.enum(MODES).optional() }).refine((v) => v.title !== undefined || v.mode !== undefined).parse(req.body)
  res.json({ conversation: await getStore().updateConversation(id, input.clientId, { title: input.title, mode: input.mode }) })
}))

router.delete('/:id', asyncRoute(async (req, res) => {
  const id = uuid.parse(req.params.id)
  const owner = clientId.parse(req.query.clientId)
  await getStore().deleteConversation(id, owner)
  res.status(204).send()
}))

router.get('/:id/messages', asyncRoute(async (req, res) => {
  const id = uuid.parse(req.params.id)
  const owner = clientId.parse(req.query.clientId)
  res.json({ messages: await getStore().listMessages(id, owner) })
}))

export default router

import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'

describe('Civora API', () => {
  it('reports health', async () => {
    const response = await request(createApp()).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('validates the Arena request', async () => {
    const response = await request(createApp()).post('/chat').send({ message: '   ' })
    expect(response.status).toBe(400)
  })

  it('accepts a stateless message without conversation metadata', async () => {
    const response = await request(createApp()).post('/chat').send({ message: 'Traffic is bad near our school.' })
    expect(response.status).toBe(503)
    expect(response.body.error).not.toMatch(/clientId|conversationId|auth/i)
  })

  it('returns a safe error for malformed JSON', async () => {
    const response = await request(createApp()).post('/chat').set('Content-Type', 'application/json').send('{')
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('The request body must be valid JSON.')
  })

  it('allows browser-based Arena calls to the public chat route', async () => {
    const response = await request(createApp()).post('/chat').set('Origin', 'https://arena.example').send({ message: '' })
    expect(response.headers['access-control-allow-origin']).toBe('https://arena.example')
  })

  it('supports conversation ownership', async () => {
    const created = await request(createApp()).post('/conversations').send({ clientId: 'browser-a' })
    expect(created.status).toBe(201)
    const id = created.body.conversation.id
    const denied = await request(createApp()).get(`/conversations/${id}?clientId=browser-b`)
    expect(denied.status).toBe(404)
  })
})

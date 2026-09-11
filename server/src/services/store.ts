import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Conversation, Message, Mode, Role } from '../types/index.js'
import { HttpError } from '../utils/http.js'

export interface Store {
  createConversation(clientId: string, mode?: Mode): Promise<Conversation>
  listConversations(clientId: string): Promise<Conversation[]>
  getConversation(id: string, clientId: string): Promise<Conversation>
  updateConversation(id: string, clientId: string, changes: { title?: string; mode?: Mode; summary?: string | null }): Promise<Conversation>
  deleteConversation(id: string, clientId: string): Promise<void>
  listMessages(id: string, clientId: string, limit?: number): Promise<Message[]>
  addMessage(id: string, clientId: string, role: Role, content: string): Promise<Message>
}

function now() { return new Date().toISOString() }

class MemoryStore implements Store {
  private conversations = new Map<string, Conversation>()
  private messages = new Map<string, Message[]>()

  async createConversation(clientId: string, mode: Mode = 'auto') {
    const timestamp = now()
    const conversation: Conversation = { id: crypto.randomUUID(), client_id: clientId, title: 'New Chat', mode, summary: null, created_at: timestamp, updated_at: timestamp }
    this.conversations.set(conversation.id, conversation)
    this.messages.set(conversation.id, [])
    return conversation
  }
  async listConversations(clientId: string) {
    return [...this.conversations.values()].filter((item) => item.client_id === clientId).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  }
  async getConversation(id: string, clientId: string) {
    const item = this.conversations.get(id)
    if (!item || item.client_id !== clientId) throw new HttpError(404, 'Conversation not found.')
    return item
  }
  async updateConversation(id: string, clientId: string, changes: { title?: string; mode?: Mode; summary?: string | null }) {
    const item = await this.getConversation(id, clientId)
    const updated = { ...item, ...changes, updated_at: now() }
    this.conversations.set(id, updated)
    return updated
  }
  async deleteConversation(id: string, clientId: string) {
    await this.getConversation(id, clientId)
    this.conversations.delete(id)
    this.messages.delete(id)
  }
  async listMessages(id: string, clientId: string, limit?: number) {
    await this.getConversation(id, clientId)
    const items = this.messages.get(id) ?? []
    return limit ? items.slice(-limit) : items
  }
  async addMessage(id: string, clientId: string, role: Role, content: string) {
    await this.getConversation(id, clientId)
    const message: Message = { id: crypto.randomUUID(), conversation_id: id, role, content, created_at: now() }
    this.messages.set(id, [...(this.messages.get(id) ?? []), message])
    const conversation = this.conversations.get(id)!
    this.conversations.set(id, { ...conversation, updated_at: now() })
    return message
  }
}

class SupabaseStore implements Store {
  constructor(private db: SupabaseClient) {}

  private fail(error: { message: string } | null): never { throw new Error(error?.message || 'Database operation failed') }
  async createConversation(clientId: string, mode: Mode = 'auto') {
    const { data, error } = await this.db.from('conversations').insert({ client_id: clientId, mode }).select().single()
    if (error) this.fail(error)
    return data as Conversation
  }
  async listConversations(clientId: string) {
    const { data, error } = await this.db.from('conversations').select('*').eq('client_id', clientId).order('updated_at', { ascending: false })
    if (error) this.fail(error)
    return data as Conversation[]
  }
  async getConversation(id: string, clientId: string) {
    const { data, error } = await this.db.from('conversations').select('*').eq('id', id).eq('client_id', clientId).maybeSingle()
    if (error) this.fail(error)
    if (!data) throw new HttpError(404, 'Conversation not found.')
    return data as Conversation
  }
  async updateConversation(id: string, clientId: string, changes: { title?: string; mode?: Mode; summary?: string | null }) {
    await this.getConversation(id, clientId)
    const { data, error } = await this.db.from('conversations').update({ ...changes, updated_at: now() }).eq('id', id).eq('client_id', clientId).select().single()
    if (error) this.fail(error)
    return data as Conversation
  }
  async deleteConversation(id: string, clientId: string) {
    await this.getConversation(id, clientId)
    const { error } = await this.db.from('conversations').delete().eq('id', id).eq('client_id', clientId)
    if (error) this.fail(error)
  }
  async listMessages(id: string, clientId: string, limit?: number) {
    await this.getConversation(id, clientId)
    let query = this.db.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) this.fail(error)
    return (data as Message[]).reverse()
  }
  async addMessage(id: string, clientId: string, role: Role, content: string) {
    await this.getConversation(id, clientId)
    const { data, error } = await this.db.from('messages').insert({ conversation_id: id, role, content }).select().single()
    if (error) this.fail(error)
    await this.db.from('conversations').update({ updated_at: now() }).eq('id', id).eq('client_id', clientId)
    return data as Message
  }
}

let singleton: Store | undefined

export function getStore(): Store {
  if (singleton) return singleton
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  singleton = url && key
    ? new SupabaseStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
    : new MemoryStore()
  return singleton
}

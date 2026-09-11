import type { Conversation, Message, Mode } from '../types'

const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
  } catch {
    throw new Error('Civora cannot reach the server. Check your connection and try again.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  listConversations: (clientId: string) => request<{ conversations: Conversation[] }>(`/conversations?clientId=${encodeURIComponent(clientId)}`),
  createConversation: (clientId: string) => request<{ conversation: Conversation }>('/conversations', { method: 'POST', body: JSON.stringify({ clientId }) }),
  updateConversation: (id: string, clientId: string, changes: { title?: string; mode?: Mode }) => request<{ conversation: Conversation }>(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ clientId, ...changes }) }),
  deleteConversation: (id: string, clientId: string) => request<void>(`/conversations/${id}?clientId=${encodeURIComponent(clientId)}`, { method: 'DELETE' }),
  getMessages: (id: string, clientId: string) => request<{ messages: Message[] }>(`/conversations/${id}/messages?clientId=${encodeURIComponent(clientId)}`),
  chat: (payload: { message: string; conversationId: string; clientId: string; mode: Mode }) => request<{ response: string; mode: Mode; modeChanged?: boolean }>('/chat', { method: 'POST', body: JSON.stringify(payload) }),
}

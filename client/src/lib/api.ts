import type { Conversation, Message, Mode } from '../types'

// ---------------------------------------------------------------------------
// Base URL resolution
// In development, fall back to localhost. In production a missing VITE_API_URL
// is a real configuration error — surface it so the team knows immediately.
// ---------------------------------------------------------------------------
function resolveBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured) return configured.replace(/\/$/, '')
  if (import.meta.env.PROD) {
    // In production on unified deployment (e.g. Vercel), use relative paths to the same domain
    return ''
  }
  return 'http://localhost:3001'
}

export const baseUrl = resolveBaseUrl()
export const isProdMisconfigured = false


async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (isProdMisconfigured) {
    throw new Error('Civora API is not configured for this deployment. Set VITE_API_URL and redeploy.')
  }
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

// Chat payload — all fields except message are optional for stateless/Arena use
type ChatPayload = {
  message: string
  conversationId?: string
  clientId?: string
  mode?: Mode
}

export const api = {
  healthCheck: () => request<{ status: string }>('/health'),
  listConversations: (clientId: string) => request<{ conversations: Conversation[] }>(`/conversations?clientId=${encodeURIComponent(clientId)}`),
  createConversation: (clientId: string) => request<{ conversation: Conversation }>('/conversations', { method: 'POST', body: JSON.stringify({ clientId }) }),
  updateConversation: (id: string, clientId: string, changes: { title?: string; mode?: Mode }) => request<{ conversation: Conversation }>(`/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ clientId, ...changes }) }),
  deleteConversation: (id: string, clientId: string) => request<void>(`/conversations/${id}?clientId=${encodeURIComponent(clientId)}`, { method: 'DELETE' }),
  getMessages: (id: string, clientId: string) => request<{ messages: Message[] }>(`/conversations/${id}/messages?clientId=${encodeURIComponent(clientId)}`),
  chat: (payload: ChatPayload) => request<{ response: string; mode: Mode; modeChanged?: boolean }>('/chat', { method: 'POST', body: JSON.stringify(payload) }),
}

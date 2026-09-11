export const MODES = ['auto', 'mobility', 'waste', 'pollution', 'spaces', 'water'] as const
export type Mode = (typeof MODES)[number]
export type Role = 'user' | 'assistant'

export interface Conversation {
  id: string
  client_id: string
  title: string
  mode: Mode
  summary: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: Role
  content: string
  created_at: string
}

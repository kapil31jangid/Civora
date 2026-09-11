import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Message, Mode } from '../types'

export function useChat(conversationId: string | null, clientId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!conversationId) return setMessages([])
    try {
      const result = await api.getMessages(conversationId, clientId)
      setMessages(result.messages)
      setError('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load messages.') }
  }, [conversationId, clientId])

  useEffect(() => {
    let current = true
    setMessages([])
    setError('')
    if (conversationId) {
      void api.getMessages(conversationId, clientId).then((result) => {
        if (current) setMessages(result.messages)
      }).catch((reason) => {
        if (current) setError(reason instanceof Error ? reason.message : 'Unable to load messages.')
      })
    }
    return () => { current = false }
  }, [conversationId, clientId])

  const send = async (content: string, mode: Mode) => {
    if (!conversationId || sending) return
    const optimistic: Message = { id: crypto.randomUUID(), conversation_id: conversationId, role: 'user', content, created_at: new Date().toISOString() }
    setMessages((current) => [...current, optimistic])
    setSending(true)
    setError('')
    try {
      const result = await api.chat({ message: content, conversationId, clientId, mode })
      setMessages((current) => [...current, { id: crypto.randomUUID(), conversation_id: conversationId, role: 'assistant', content: result.response, created_at: new Date().toISOString() }])
      return result
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send your message.')
      throw reason
    } finally { setSending(false) }
  }

  return { messages, sending, error, setError, send, reload: load }
}

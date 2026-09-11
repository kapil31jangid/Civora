import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { LOCAL_SESSION_ID } from './useConversations'
import type { Message, Mode } from '../types'

export function useChat(conversationId: string | null, clientId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // True when operating in stateless/local-fallback mode (no server persistence)
  const isStateless = !conversationId || conversationId === LOCAL_SESSION_ID

  const load = useCallback(async () => {
    if (isStateless) return setMessages([])
    try {
      const result = await api.getMessages(conversationId!, clientId)
      setMessages(result.messages)
      setError('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load messages.') }
  }, [conversationId, clientId, isStateless])

  useEffect(() => {
    let current = true
    setMessages([])
    setError('')
    if (!isStateless) {
      void api.getMessages(conversationId!, clientId).then((result) => {
        if (current) setMessages(result.messages)
      }).catch((reason) => {
        if (current) setError(reason instanceof Error ? reason.message : 'Unable to load messages.')
      })
    }
    return () => { current = false }
  }, [conversationId, clientId, isStateless])

  const send = async (content: string, mode: Mode) => {
    if (sending) return
    // Build an optimistic user message. conversation_id is empty for stateless mode.
    const tempId = crypto.randomUUID()
    const convId = conversationId ?? ''
    const optimistic: Message = { id: tempId, conversation_id: convId, role: 'user', content, created_at: new Date().toISOString() }
    setMessages((current) => [...current, optimistic])
    setSending(true)
    setError('')
    try {
      // Stateless mode: omit conversationId and clientId
      const payload = isStateless
        ? { message: content, mode }
        : { message: content, conversationId: conversationId!, clientId, mode }
      const result = await api.chat(payload)
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), conversation_id: convId, role: 'assistant', content: result.response, created_at: new Date().toISOString() },
      ])
      return result
    } catch (reason) {
      // Remove the optimistic user message so the user knows the send failed
      setMessages((current) => current.filter((m) => m.id !== tempId))
      const message = reason instanceof Error ? reason.message : 'Unable to send your message. Please try again.'
      setError(message)
      throw reason
    } finally {
      setSending(false)
    }
  }

  return { messages, sending, error, setError, send, reload: load }
}

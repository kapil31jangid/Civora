import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { Conversation, Mode } from '../types'

export function useConversations(clientId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initialized = useRef(false)

  const refresh = useCallback(async (preferredId?: string) => {
    const result = await api.listConversations(clientId)
    setConversations(result.conversations)
    setActiveId((current) => preferredId || (current && result.conversations.some((c) => c.id === current) ? current : result.conversations[0]?.id ?? null))
  }, [clientId])

  const create = useCallback(async () => {
    const { conversation } = await api.createConversation(clientId)
    setConversations((current) => [conversation, ...current])
    setActiveId(conversation.id)
    return conversation
  }, [clientId])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    void (async () => {
      try {
        const result = await api.listConversations(clientId)
        if (result.conversations.length) {
          setConversations(result.conversations)
          setActiveId(result.conversations[0]!.id)
        } else await create()
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load conversations.') }
      finally { setLoading(false) }
    })()
  }, [clientId, create])

  const update = async (id: string, changes: { title?: string; mode?: Mode }) => {
    const { conversation } = await api.updateConversation(id, clientId, changes)
    setConversations((current) => current.map((item) => item.id === id ? conversation : item).sort((a, b) => b.updated_at.localeCompare(a.updated_at)))
    return conversation
  }
  const remove = async (id: string) => {
    await api.deleteConversation(id, clientId)
    const remaining = conversations.filter((item) => item.id !== id)
    setConversations(remaining)
    if (activeId === id) {
      if (remaining[0]) setActiveId(remaining[0].id)
      else await create()
    }
  }

  return { conversations, activeId, setActiveId, loading, error, setError, create, update, remove, refresh }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { Conversation, Mode } from '../types'

// Sentinel ID used when persistence is unavailable. The rest of the app treats
// this like a real conversation but never attempts to persist it to the server.
export const LOCAL_SESSION_ID = 'local-session'

function makeLocalFallback(): Conversation {
  const now = new Date().toISOString()
  return { id: LOCAL_SESSION_ID, client_id: '', title: 'New Chat', mode: 'auto', summary: null, created_at: now, updated_at: now }
}

export function useConversations(clientId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  // Local fallback conversation used when persistence is unavailable
  const [localFallback, setLocalFallback] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [persistenceAvailable, setPersistenceAvailable] = useState(true)
  const [persistenceWarning, setPersistenceWarning] = useState('')
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

  // Switch to a fully local session when persistence is unavailable
  const activateLocalFallback = useCallback((reason: string) => {
    const fallback = makeLocalFallback()
    setLocalFallback(fallback)
    setActiveId(LOCAL_SESSION_ID)
    setPersistenceAvailable(false)
    setPersistenceWarning(reason)
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    void (async () => {
      try {
        const result = await api.listConversations(clientId)
        if (result.conversations.length) {
          setConversations(result.conversations)
          setActiveId(result.conversations[0]!.id)
        } else {
          await create()
        }
        setPersistenceAvailable(true)
        setPersistenceWarning('')
      } catch {
        // Persistence is down — switch to local fallback, never block the UI
        activateLocalFallback('Chat history is temporarily unavailable. You can still use Civora.')
      } finally {
        setLoading(false)
      }
    })()
  }, [clientId, create, activateLocalFallback])

  const update = async (id: string, changes: { title?: string; mode?: Mode }) => {
    // If operating in local fallback mode, update the local state only
    if (id === LOCAL_SESSION_ID) {
      setLocalFallback((prev) => prev ? { ...prev, ...changes, updated_at: new Date().toISOString() } : prev)
      return localFallback ? { ...localFallback, ...changes } as Conversation : makeLocalFallback()
    }
    const { conversation } = await api.updateConversation(id, clientId, changes)
    setConversations((current) => current.map((item) => item.id === id ? conversation : item).sort((a, b) => b.updated_at.localeCompare(a.updated_at)))
    return conversation
  }

  const remove = async (id: string) => {
    if (id === LOCAL_SESSION_ID) return // nothing to delete from server
    await api.deleteConversation(id, clientId)
    const remaining = conversations.filter((item) => item.id !== id)
    setConversations(remaining)
    if (activeId === id) {
      if (remaining[0]) setActiveId(remaining[0].id)
      else await create()
    }
  }

  // Retry persistence recovery — useful after a transient outage
  const retryPersistence = useCallback(async () => {
    try {
      const result = await api.listConversations(clientId)
      if (result.conversations.length) {
        setConversations(result.conversations)
        setActiveId(result.conversations[0]!.id)
      } else {
        await create()
      }
      setLocalFallback(null)
      setPersistenceAvailable(true)
      setPersistenceWarning('')
    } catch {
      setPersistenceWarning('Still unable to reach history. You can keep chatting in stateless mode.')
    }
  }, [clientId, create])

  return {
    conversations,
    activeId,
    setActiveId,
    loading,
    error,
    setError,
    create,
    update,
    remove,
    refresh,
    localFallback,
    persistenceAvailable,
    persistenceWarning,
    retryPersistence,
  }
}

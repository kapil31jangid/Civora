import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { AlertTriangle, Menu, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react'
import { getClientId } from './lib/clientId'
import { useConversations, LOCAL_SESSION_ID } from './hooks/useConversations'
import { useChat } from './hooks/useChat'
import { modeMeta } from './lib/commands'
import type { Conversation, Mode } from './types'
import { Sidebar } from './components/sidebar/Sidebar'
import { EmptyState } from './components/chat/EmptyState'
import { Composer } from './components/chat/Composer'
import { ConversationDialogs } from './components/sidebar/ConversationDialogs'
import { Button } from './components/ui/Button'
import { api, isProdMisconfigured } from './lib/api'
import { cn } from './lib/utils'

const modeCommand = /^\/(auto|mobility|waste|pollution|spaces|water)\s*$/i
const MessageList = lazy(() => import('./components/chat/MessageList').then((module) => ({ default: module.MessageList })))

export default function App() {
  const clientId = useMemo(getClientId, [])
  const conversationsState = useConversations(clientId)
  const { conversations, activeId, localFallback, persistenceWarning, retryPersistence } = conversationsState
  // Resolve the active conversation — may be persisted or local fallback
  const persistedActive = conversations.find((item) => item.id === activeId) ?? null
  const active: Conversation | null = persistedActive ?? (activeId === LOCAL_SESSION_ID ? localFallback : null)
  const chat = useChat(activeId, clientId)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null)
  const [toast, setToast] = useState('')
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [serverDown, setServerDown] = useState(false)
  const [serverChecked, setServerChecked] = useState(false)
  // Local mode overrides for mode switching when in fallback (not persisted)
  const [localMode, setLocalMode] = useState<Mode>('auto')

  // Run a lightweight health check on startup for UX feedback
  useEffect(() => {
    if (isProdMisconfigured) { setServerChecked(true); return }
    void api.healthCheck()
      .then(() => { setServerDown(false); setServerChecked(true) })
      .catch(() => { setServerDown(true); setServerChecked(true) })
  }, [])

  const notify = (message: string) => { setToast(''); requestAnimationFrame(() => setToast(message)) }

  const createChat = async () => {
    try { const conversation = await conversationsState.create(); setFocusKey(conversation.id); setMobileOpen(false) }
    catch (reason) { conversationsState.setError(reason instanceof Error ? reason.message : 'Unable to create a chat.') }
  }

  // Effective mode: from persisted conversation or local state when in fallback
  const effectiveMode: Mode = active?.mode ?? localMode

  const send = async (text: string) => {
    const modeMatch = text.match(modeCommand)
    if (modeMatch) {
      const mode = modeMatch[1]!.toLowerCase() as Mode
      if (activeId === LOCAL_SESSION_ID) {
        setLocalMode(mode)
        notify(`${modeMeta[mode].label} specialist activated`)
      } else if (active) {
        try { await conversationsState.update(active.id, { mode }); notify(`${modeMeta[mode].label} specialist activated`) }
        catch (reason) { chat.setError(reason instanceof Error ? reason.message : 'Unable to change mode.') }
      }
      return
    }
    try {
      const result = await chat.send(text, effectiveMode)
      if (result?.modeChanged) notify(`${modeMeta[result.mode].label} specialist activated`)
      // Refresh persisted conversation metadata (title, updated_at) after send
      if (active && activeId !== LOCAL_SESSION_ID) {
        await conversationsState.refresh(active.id)
      }
    } catch { /* error is set inside useChat and displayed below */ }
  }

  if (conversationsState.loading) return (
    <div className="grid min-h-screen place-items-center bg-[#fbfcfd]" role="status">
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy-900 text-xl font-black text-white">C</span>
        <p className="mt-3 text-sm font-medium text-slate-500">Opening Civora…</p>
      </div>
    </div>
  )

  // Production misconfiguration — show a clear banner instead of a broken UI
  if (isProdMisconfigured) return (
    <div className="grid min-h-screen place-items-center bg-[#fbfcfd] p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy-900 text-xl font-black text-white">C</span>
        <h1 className="mt-4 text-lg font-bold text-navy-900">Civora API not configured</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">VITE_API_URL</code> environment variable is missing.<br />
          Set it to your backend URL and redeploy the frontend.
        </p>
      </div>
    </div>
  )

  const meta = modeMeta[effectiveMode]
  const ModeIcon = meta.icon
  const error = chat.error || conversationsState.error
  // Composer is disabled only while actively sending — never because history failed
  const composerDisabled = chat.sending

  return <Toast.Provider swipeDirection="right">
    <div className="flex h-dvh overflow-hidden bg-[#fbfcfd] text-slate-900">
      <Sidebar conversations={conversations} activeId={activeId} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onSelect={conversationsState.setActiveId} onCreate={() => void createChat()} onRename={setRenameTarget} onDelete={setDeleteTarget} />
      <main id="main-content" className="relative flex min-w-0 flex-1 flex-col" tabIndex={-1}>
        <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Button className="md:hidden" variant="ghost" size="icon" aria-label="Open conversation sidebar" onClick={() => setMobileOpen(true)}><Menu aria-hidden className="h-5 w-5" /></Button>
            <div className="min-w-0"><h1 className="truncate text-sm font-bold text-navy-900 sm:text-base">{active?.title || 'Civora'}</h1><p className="hidden items-center gap-1 text-xs text-slate-500 sm:flex"><ShieldCheck aria-hidden className="h-3.5 w-3.5 text-civic-600" /> Practical, safe, sustainable guidance</p></div>
          </div>
          <div className={cn('ml-3 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold sm:px-3', meta.color)} title={`Active specialist: ${meta.label}`}><ModeIcon aria-hidden className="h-4 w-4" /><span className="hidden sm:inline">{meta.label}</span><span className="sm:hidden">{meta.short}</span></div>
        </header>

        {/* Persistence warning banner */}
        {persistenceWarning && (
          <div role="status" className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            <span className="flex items-center gap-2"><AlertTriangle aria-hidden className="h-3.5 w-3.5 shrink-0" />{persistenceWarning}</span>
            <button
              onClick={() => void retryPersistence()}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 font-semibold hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Retry loading chat history"
            ><RefreshCw aria-hidden className="h-3 w-3" />Retry</button>
          </div>
        )}

        {/* Server down banner — only shown after health check completes */}
        {serverChecked && serverDown && !persistenceWarning && (
          <div role="alert" className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">
            <WifiOff aria-hidden className="h-3.5 w-3.5 shrink-0" />
            Civora cannot reach the server right now. Check the API deployment and try again.
          </div>
        )}

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {!chat.messages.length && !chat.sending ? <EmptyState onPrompt={(prompt) => void send(prompt)} /> : <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500" role="status">Loading conversation…</div>}><MessageList messages={chat.messages} sending={chat.sending} /></Suspense>}
          {error && <div role="alert" className="fixed bottom-36 left-1/2 z-20 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-soft">{error}<button className="float-right ml-3 font-bold underline" onClick={() => { chat.setError(''); conversationsState.setError('') }}>Dismiss</button></div>}
          <Composer mode={effectiveMode} disabled={composerDisabled} onSend={(message) => void send(message)} focusKey={focusKey ?? activeId} />
        </div>
      </main>
    </div>
    <ConversationDialogs renameTarget={renameTarget} deleteTarget={deleteTarget} onCloseRename={() => setRenameTarget(null)} onCloseDelete={() => setDeleteTarget(null)} onRename={async (title) => { if (!renameTarget) return; await conversationsState.update(renameTarget.id, { title }); setRenameTarget(null); notify('Conversation renamed') }} onDelete={async () => { if (!deleteTarget) return; await conversationsState.remove(deleteTarget.id); setDeleteTarget(null); notify('Conversation deleted') }} />
    <Toast.Root open={Boolean(toast)} onOpenChange={(open) => !open && setToast('')} duration={3000} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy-900 shadow-soft"><Toast.Title>{toast}</Toast.Title></Toast.Root>
    <Toast.Viewport className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm" />
  </Toast.Provider>
}

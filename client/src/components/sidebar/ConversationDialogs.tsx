import { useEffect, useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { Conversation } from '../../types'
import { Button } from '../ui/Button'

interface Props {
  renameTarget: Conversation | null
  deleteTarget: Conversation | null
  onCloseRename: () => void
  onCloseDelete: () => void
  onRename: (title: string) => Promise<void>
  onDelete: () => Promise<void>
}

export function ConversationDialogs({ renameTarget, deleteTarget, onCloseRename, onCloseDelete, onRename, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setTitle(renameTarget?.title ?? ''), [renameTarget])
  return <>
    <AlertDialog.Root open={Boolean(renameTarget)} onOpenChange={(open) => !open && onCloseRename()}>
      <AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy-900/40" /><AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-soft">
        <AlertDialog.Title className="text-lg font-bold text-navy-900">Rename conversation</AlertDialog.Title>
        <AlertDialog.Description className="mt-1 text-sm text-slate-600">Use a short title that will be easy to find later.</AlertDialog.Description>
        <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="conversation-title">Title</label>
        <input autoFocus id="conversation-title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        <div className="mt-5 flex justify-end gap-2"><AlertDialog.Cancel asChild><Button variant="secondary">Cancel</Button></AlertDialog.Cancel><Button disabled={!title.trim() || busy} onClick={async () => { setBusy(true); try { await onRename(title.trim()) } finally { setBusy(false) } }}>Save</Button></div>
      </AlertDialog.Content></AlertDialog.Portal>
    </AlertDialog.Root>
    <AlertDialog.Root open={Boolean(deleteTarget)} onOpenChange={(open) => !open && onCloseDelete()}>
      <AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy-900/40" /><AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-soft">
        <AlertDialog.Title className="text-lg font-bold text-navy-900">Delete this conversation?</AlertDialog.Title>
        <AlertDialog.Description className="mt-2 text-sm text-slate-600">This action cannot be undone.</AlertDialog.Description>
        <div className="mt-6 flex justify-end gap-2"><AlertDialog.Cancel asChild><Button variant="secondary">Cancel</Button></AlertDialog.Cancel><Button variant="danger" disabled={busy} onClick={async () => { setBusy(true); try { await onDelete() } finally { setBusy(false) } }}>Delete</Button></div>
      </AlertDialog.Content></AlertDialog.Portal>
    </AlertDialog.Root>
  </>
}

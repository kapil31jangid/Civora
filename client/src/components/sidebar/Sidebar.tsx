import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react'
import { modeMeta } from '../../lib/commands'
import type { Conversation } from '../../types'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  mobileOpen: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onCreate: () => void
  onRename: (conversation: Conversation) => void
  onDelete: (conversation: Conversation) => void
}

export function Sidebar({ conversations, activeId, mobileOpen, onClose, onSelect, onCreate, onRename, onDelete }: Props) {
  return <>
    {mobileOpen && <button aria-label="Close conversation drawer" className="fixed inset-0 z-30 bg-navy-900/35 backdrop-blur-[2px] md:hidden" onClick={onClose} />}
    <aside aria-label="Conversation history" className={cn(
      'fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r border-slate-200 bg-[#f7f9fb] p-3 transition-transform duration-200 md:static md:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>
      <div className="flex min-h-14 items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-sm font-black text-white">C</span>
          <div><p className="font-bold tracking-tight text-navy-900">Civora</p><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Smart City AI</p></div>
        </div>
        <Button className="md:hidden" size="icon" variant="ghost" aria-label="Close sidebar" onClick={onClose}><X aria-hidden className="h-5 w-5" /></Button>
      </div>
      <Button className="mt-3 w-full justify-start bg-white text-navy-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={onCreate}>
        <Plus aria-hidden className="h-4 w-4" /> New chat
      </Button>
      <p className="mb-2 mt-7 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">Recent</p>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Recent conversations">
        {conversations.map((conversation) => {
          const meta = modeMeta[conversation.mode]
          const Icon = meta.icon
          const active = activeId === conversation.id
          return <div key={conversation.id} className={cn('group flex items-center rounded-xl', active ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/80')}>
            <button className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" onClick={() => { onSelect(conversation.id); onClose() }} aria-current={active ? 'page' : undefined} title={conversation.title}>
              <Icon aria-hidden className={cn('h-4 w-4 shrink-0', active ? 'text-civic-600' : 'text-slate-500')} />
              <span className={cn('truncate text-sm', active ? 'font-semibold text-navy-900' : 'text-slate-650')}>{conversation.title}</span>
            </button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild><Button variant="ghost" size="icon" className="mr-1 h-9 min-h-9 w-9 min-w-9 opacity-70 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100" aria-label={`Options for ${conversation.title}`}><MoreHorizontal aria-hidden className="h-4 w-4" /></Button></DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content sideOffset={4} align="end" className="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
                  <DropdownMenu.Item onSelect={() => onRename(conversation)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none focus:bg-slate-100"><Pencil aria-hidden className="h-4 w-4" /> Rename</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => onDelete(conversation)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-red-700 outline-none focus:bg-red-50"><Trash2 aria-hidden className="h-4 w-4" /> Delete</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        })}
      </nav>
      <div className="m-1 rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-700">Aligned with UN SDG 11</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Sustainable Cities & Communities</p>
      </div>
    </aside>
  </>
}

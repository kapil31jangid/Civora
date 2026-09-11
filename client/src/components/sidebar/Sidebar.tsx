import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal, Pencil, Plus, Trash2, X, Sparkles } from 'lucide-react'
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

export function Sidebar({
  conversations,
  activeId,
  mobileOpen,
  onClose,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  return (
    <>
      {mobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-[3px] transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Conversation history"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] sm:w-[300px] flex-col border-r border-slate-200/80 bg-[#f7f9fb] p-3 transition-transform duration-200 ease-out md:static md:translate-x-0 shadow-xl md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex min-h-12 items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-sm font-black text-white shadow-sm">
              C
            </span>
            <div>
              <p className="font-bold tracking-tight text-navy-900">Civora</p>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Smart City AI</p>
            </div>
          </div>
          <Button
            className="md:hidden"
            size="icon-sm"
            variant="ghost"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={onCreate}
          className="mt-3.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-navy-800 hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <Plus aria-hidden className="h-4 w-4 stroke-[2.5]" />
          <span>New chat</span>
        </button>

        {/* Section Label */}
        <div className="mb-1.5 mt-5 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Conversations</span>
          <span className="text-[10px] text-slate-400 font-medium">({conversations.length})</span>
        </div>

        {/* Conversation List */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5" aria-label="Recent conversations">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            conversations.map((conversation) => {
              const meta = modeMeta[conversation.mode]
              const Icon = meta.icon
              const active = activeId === conversation.id
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'group relative flex items-center rounded-xl transition-colors duration-150',
                    active
                      ? 'bg-white shadow-sm ring-1 ring-slate-200'
                      : 'hover:bg-white/80'
                  )}
                >
                  <button
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    onClick={() => {
                      onSelect(conversation.id)
                      onClose()
                    }}
                    aria-current={active ? 'page' : undefined}
                    title={conversation.title}
                  >
                    <Icon
                      aria-hidden
                      className={cn(
                        'h-4 w-4 shrink-0',
                        active ? 'text-civic-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    <span
                      className={cn(
                        'truncate text-xs sm:text-sm',
                        active ? 'font-bold text-navy-900' : 'font-medium text-slate-700'
                      )}
                    >
                      {conversation.title}
                    </span>
                  </button>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="mr-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        aria-label={`Options for ${conversation.title}`}
                      >
                        <MoreHorizontal aria-hidden className="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        sideOffset={4}
                        align="end"
                        className="z-50 min-w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-soft"
                      >
                        <DropdownMenu.Item
                          onSelect={() => onRename(conversation)}
                          className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium outline-none hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <Pencil aria-hidden className="h-3.5 w-3.5 text-slate-500" />
                          <span>Rename</span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => onDelete(conversation)}
                          className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
                        >
                          <Trash2 aria-hidden className="h-3.5 w-3.5 text-red-500" />
                          <span>Delete</span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              )
            })
          )}
        </nav>

        {/* SDG Footer Badge */}
        <div className="mt-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles aria-hidden className="h-3.5 w-3.5 text-emerald-600" />
            <span>Aligned with UN SDG 11</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">Sustainable Cities & Communities</p>
        </div>
      </aside>
    </>
  )
}

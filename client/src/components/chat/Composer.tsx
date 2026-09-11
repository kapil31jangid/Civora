import { useEffect, useRef, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ArrowUp, ChevronDown, Command as CommandIcon, Sparkles } from 'lucide-react'
import { CommandMenu } from '../commands/CommandMenu'
import type { Command } from '../../lib/commands'
import type { Mode } from '../../types'
import { filteredCommands, modeMeta } from '../../lib/commands'
import { cn } from '../../lib/utils'

interface Props {
  mode: Mode
  disabled: boolean
  onSend: (message: string) => void
  onModeChange?: (mode: Mode) => void
  focusKey: string | null
}

const allModes: Mode[] = ['auto', 'mobility', 'waste', 'pollution', 'spaces', 'water']

export function Composer({ mode, disabled, onSend, onModeChange, focusKey }: Props) {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState(0)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const showMenu = /^\/[^\s]*$/.test(value)
  const filtered = filteredCommands(value)
  const meta = modeMeta[mode]
  const Icon = meta.icon

  useEffect(() => {
    textarea.current?.focus()
  }, [focusKey])

  useEffect(() => {
    setSelected(0)
  }, [value])

  const choose = (command: Command) => {
    setValue(`${command.name} `)
    textarea.current?.focus()
  }

  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue('')
    if (textarea.current) {
      textarea.current.style.height = 'auto'
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-[#fbfcfd] via-[#fbfcfd]/90 to-transparent px-3 pb-3 pt-8 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto relative w-full max-w-3xl">
        {showMenu && <CommandMenu query={value} selected={selected} onSelect={choose} />}

        <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-[0_12px_36px_rgba(11,31,58,.1)] transition-shadow duration-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
          <textarea
            ref={textarea}
            rows={1}
            value={value}
            disabled={disabled}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showMenu}
            aria-label="Message Civora"
            aria-controls={showMenu ? 'slash-command-menu' : undefined}
            aria-activedescendant={showMenu && filtered[selected] ? `command-${selected}` : undefined}
            placeholder="Describe a city problem or type / for commands..."
            className="max-h-36 min-h-12 w-full resize-none bg-transparent px-3 py-2.5 text-sm sm:text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
            onChange={(event) => {
              setValue(event.target.value)
              event.target.style.height = 'auto'
              event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`
            }}
            onKeyDown={(event) => {
              if (showMenu && event.key === 'ArrowDown') {
                event.preventDefault()
                setSelected((index) => (index + 1) % Math.max(filtered.length, 1))
                return
              }
              if (showMenu && event.key === 'ArrowUp') {
                event.preventDefault()
                setSelected((index) => (index - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
                return
              }
              if (showMenu && event.key === 'Escape') {
                event.preventDefault()
                setValue('')
                return
              }
              if (showMenu && event.key === 'Enter' && filtered[selected]) {
                event.preventDefault()
                choose(filtered[selected])
                return
              }
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 pl-1">
            {/* Interactive Mode Dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                      meta.color
                    )}
                    aria-label={`Current specialist: ${meta.label}. Click to change.`}
                  >
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                    <span>{meta.label}</span>
                    <ChevronDown aria-hidden className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="start"
                    className="z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-soft animate-in fade-in-50 zoom-in-95"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Specialist
                    </div>
                    {allModes.map((m) => {
                      const itemMeta = modeMeta[m]
                      const ItemIcon = itemMeta.icon
                      const isCurrent = mode === m
                      return (
                        <DropdownMenu.Item
                          key={m}
                          onSelect={() => onModeChange?.(m)}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors outline-none focus:bg-slate-100',
                            isCurrent && 'bg-slate-50 font-bold text-navy-900'
                          )}
                        >
                          <span className={cn('grid h-6 w-6 place-items-center rounded-md border', itemMeta.color)}>
                            <ItemIcon aria-hidden className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1">{itemMeta.label}</span>
                          {isCurrent && <span className="text-[10px] text-sky-600 font-bold">Active</span>}
                        </DropdownMenu.Item>
                      )
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                <CommandIcon aria-hidden className="h-3 w-3" /> Type / for tools
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={submit}
              disabled={disabled || !value.trim()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-sm transition-all duration-150 hover:bg-navy-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-300 disabled:scale-100"
              aria-label="Send message"
            >
              <ArrowUp aria-hidden className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <p className="mt-1.5 text-center text-[10px] sm:text-[11px] text-slate-400">
          Civora AI can make mistakes. Verify location-specific guidance with local city authorities.
        </p>
      </div>
    </div>
  )
}

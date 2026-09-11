import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Command as CommandIcon } from 'lucide-react'
import { CommandMenu } from '../commands/CommandMenu'
import type { Command } from '../../lib/commands'
import type { Mode } from '../../types'
import { filteredCommands, modeMeta } from '../../lib/commands'
import { cn } from '../../lib/utils'

interface Props { mode: Mode; disabled: boolean; onSend: (message: string) => void; focusKey: string | null }

export function Composer({ mode, disabled, onSend, focusKey }: Props) {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState(0)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const showMenu = /^\/[^\s]*$/.test(value)
  const filtered = filteredCommands(value)
  const meta = modeMeta[mode]
  const Icon = meta.icon

  useEffect(() => { textarea.current?.focus() }, [focusKey])
  useEffect(() => { setSelected(0) }, [value])

  const choose = (command: Command) => {
    setValue(`${command.name} `)
    textarea.current?.focus()
  }
  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue('')
  }
  return <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#fbfcfd] via-[#fbfcfd] to-transparent px-3 pb-4 pt-10 sm:px-6">
    <div className="relative mx-auto max-w-3xl">
      {showMenu && <CommandMenu query={value} selected={selected} onSelect={choose} />}
      <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_14px_40px_rgba(11,31,58,.12)] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
        <textarea ref={textarea} rows={1} value={value} disabled={disabled} role="combobox" aria-autocomplete="list" aria-expanded={showMenu} aria-label="Message Civora" aria-controls={showMenu ? 'slash-command-menu' : undefined} aria-activedescendant={showMenu && filtered[selected] ? `command-${selected}` : undefined} placeholder="Describe a city problem or type / for commands" className="max-h-36 min-h-12 w-full resize-none bg-transparent px-3 py-3 text-[15px] text-slate-800 outline-none placeholder:text-slate-400" onChange={(event) => {
          setValue(event.target.value)
          event.target.style.height = 'auto'
          event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`
        }} onKeyDown={(event) => {
          if (showMenu && event.key === 'ArrowDown') { event.preventDefault(); setSelected((index) => (index + 1) % Math.max(filtered.length, 1)); return }
          if (showMenu && event.key === 'ArrowUp') { event.preventDefault(); setSelected((index) => (index - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); return }
          if (showMenu && event.key === 'Escape') { event.preventDefault(); setValue(''); return }
          if (showMenu && event.key === 'Enter' && filtered[selected]) { event.preventDefault(); choose(filtered[selected]); return }
          if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() }
        }} />
        <div className="flex items-center justify-between gap-3 pl-2">
          <div className="flex items-center gap-2 text-xs text-slate-500"><span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-semibold', meta.color)}><Icon aria-hidden className="h-3.5 w-3.5" />{meta.label}</span><span className="hidden items-center gap-1 sm:flex"><CommandIcon aria-hidden className="h-3.5 w-3.5" /> Type / for tools</span></div>
          <button onClick={submit} disabled={disabled || !value.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white transition hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><ArrowUp aria-hidden className="h-5 w-5" /></button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">Civora can make mistakes. Verify location-specific guidance with official sources.</p>
    </div>
  </div>
}

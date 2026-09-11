import { filteredCommands, type Command } from '../../lib/commands'
import { cn } from '../../lib/utils'

interface Props { query: string; selected: number; onSelect: (command: Command) => void }

export function CommandMenu({ query, selected, onSelect }: Props) {
  const filtered = filteredCommands(query)
  if (!filtered.length) return <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-soft">No matching Civora command</div>
  return <div id="slash-command-menu" role="listbox" aria-label="Civora commands" className="absolute bottom-[calc(100%+8px)] left-0 right-0 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
    {(['Modes', 'Actions'] as const).map((group) => {
      const items = filtered.filter((item) => item.group === group)
      if (!items.length) return null
      return <div key={group}><p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{group}</p>{items.map((item) => {
        const globalIndex = filtered.indexOf(item)
        const Icon = item.icon
        return <button id={`command-${globalIndex}`} role="option" aria-selected={globalIndex === selected} key={item.name} onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(item)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none', globalIndex === selected && 'bg-navy-50')}>
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-navy-700"><Icon aria-hidden className="h-4 w-4" /></span>
          <span><span className="block text-sm font-semibold text-navy-900"><span className="font-mono text-civic-600">{item.name}</span> · {item.label}</span><span className="block text-xs text-slate-500">{item.description}</span></span>
        </button>
      })}</div>
    })}
  </div>
}

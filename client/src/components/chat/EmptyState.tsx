import { ArrowUpRight, Bike, Droplets, Leaf, Sparkles, Trash2, Wind } from 'lucide-react'
import type { Mode } from '../../types'
import { modeMeta } from '../../lib/commands'
import { cn } from '../../lib/utils'

const promptCards = [
  { mode: 'mobility' as Mode, icon: Bike, label: 'Traffic & mobility', text: 'Traffic gets very bad outside my university every evening.' },
  { mode: 'waste' as Mode, icon: Trash2, label: 'Waste management', text: 'Garbage bins in my neighborhood overflow regularly.' },
  { mode: 'pollution' as Mode, icon: Wind, label: 'Urban pollution', text: 'Vehicle pollution and noise are high near a busy road.' },
  { mode: 'spaces' as Mode, icon: Leaf, label: 'Public spaces', text: 'Our neighborhood has almost no usable green space.' },
  { mode: 'water' as Mode, icon: Droplets, label: 'Urban drainage', text: 'Our street experiences waterlogging after heavy rainfall.' },
]

const allModes: Mode[] = ['auto', 'mobility', 'waste', 'pollution', 'spaces', 'water']

interface Props {
  currentMode: Mode
  onSelectMode: (mode: Mode) => void
  onPrompt: (prompt: string) => void
}

export function EmptyState({ currentMode, onSelectMode, onPrompt }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-6 pb-48 sm:px-6 sm:pt-10" aria-labelledby="welcome-title">
      {/* Header section */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
          <Sparkles aria-hidden className="h-3.5 w-3.5 text-emerald-600" />
          <span>UN SDG 11 Action Platform</span>
        </div>
        
        <h1 id="welcome-title" className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl md:text-5xl">
          Turn city problems into <span className="bg-gradient-to-r from-civic-600 to-emerald-600 bg-clip-text text-transparent">smarter actions.</span>
        </h1>
        
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
          Describe any civic issue in your neighborhood or city. Civora analyzes the root causes, prioritizes impact, and builds a sustainable action plan.
        </p>
      </div>

      {/* Mode Quick Switcher Pills */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Specialist Modes</p>
        <div className="flex flex-wrap gap-2">
          {allModes.map((m) => {
            const meta = modeMeta[m]
            const Icon = meta.icon
            const isSelected = currentMode === m
            return (
              <button
                key={m}
                onClick={() => onSelectMode(m)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95',
                  isSelected
                    ? cn(meta.color, 'ring-2 ring-sky-400/30 font-bold shadow-sm')
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
                aria-pressed={isSelected}
              >
                <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Suggested prompts cards */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Start Scenarios</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {promptCards.map(({ mode, icon: Icon, label, text }, index) => {
            const meta = modeMeta[mode]
            return (
              <button
                key={text}
                onClick={() => onPrompt(text)}
                className={cn(
                  'group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  index === 4 ? 'sm:col-span-2' : ''
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl border', meta.color)}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-navy-900">{label}</span>
                      <ArrowUpRight aria-hidden className="h-4 w-4 text-slate-300 transition-colors group-hover:text-civic-600" />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">{text}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

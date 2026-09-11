import { Bike, CheckCircle2, ChevronRight, Droplets, Gauge, Layers, Leaf, Shield, Sparkles, Target, Trash2, Users, Wind, Zap } from 'lucide-react'
import type { Mode } from '../../types'
import { modeMeta } from '../../lib/commands'
import { cn } from '../../lib/utils'

interface Props {
  currentMode: Mode
  onSelectMode: (mode: Mode) => void
  onPrompt?: (prompt: string) => void
}

const capabilities = [
  {
    mode: 'mobility' as Mode,
    icon: Bike,
    title: 'Smart Mobility & Transit',
    description: 'Traffic decongestion, active cycling infrastructure, pedestrian zones, and multi-modal transit connectivity.',
    features: ['Congestion bottlenecks', 'Pedestrian & cycling routes', 'Micro-mobility hubs'],
  },
  {
    mode: 'waste' as Mode,
    icon: Trash2,
    title: 'Circular Waste Management',
    description: 'Decentralized source segregation, organic composting networks, overflow reduction, and e-waste disposal.',
    features: ['Source segregation', 'Composting networks', 'Collection optimization'],
  },
  {
    mode: 'pollution' as Mode,
    icon: Wind,
    title: 'Air Quality & Emissions',
    description: 'Low-emission zone planning, ambient air & noise mitigation, green buffer corridors, and emissions monitoring.',
    features: ['Low-emission zones', 'Dust & noise reduction', 'Buffer corridors'],
  },
  {
    mode: 'spaces' as Mode,
    icon: Leaf,
    title: 'Public Spaces & Greening',
    description: 'Pocket park revitalization, urban heat island mitigation, tree canopy expansion, and inclusive public squares.',
    features: ['Pocket parks & plazas', 'Heat island reduction', 'Inclusive accessibility'],
  },
  {
    mode: 'water' as Mode,
    icon: Droplets,
    title: 'Urban Water Resilience',
    description: 'Sustainable drainage systems (SUDS), stormwater harvest, urban flood risk mitigation, and leak detection audits.',
    features: ['SUDS & drainage', 'Flood mitigation', 'Water conservation'],
  },
]

const commandFrameworks = [
  { cmd: '/analyze', label: 'Root Cause Diagnosis', desc: 'Identifies systemic factors, safety risks, and missing data points.' },
  { cmd: '/quickfix', label: 'Rapid Interventions', desc: 'Produces 3–5 realistic, high-feasibility actions starting immediately.' },
  { cmd: '/plan', label: '30-Day Tactical Roadmap', desc: 'Generates structured milestone plans with practical phasing.' },
  { cmd: '/stakeholders', label: 'Ownership Matrix', desc: 'Maps exact roles for citizens, RWAs, and municipal authorities.' },
  { cmd: '/impact', label: 'Measurable KPIs', desc: 'Defines quantifiable metrics to evaluate real-world civic progress.' },
]

export function EmptyState({ currentMode, onSelectMode }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-6 pb-48 sm:px-6 sm:pt-8" aria-labelledby="welcome-title">
      {/* Hero / Theme Introduction */}
      <div className="mb-8">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <Sparkles aria-hidden className="h-3.5 w-3.5 text-emerald-600" />
          <span>Aligned with UN Sustainable Development Goal 11</span>
        </div>

        <h1 id="welcome-title" className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl md:text-5xl">
          Civora <span className="bg-gradient-to-r from-civic-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">Smart City AI</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
          Civora is an intelligent civic copilot designed to empower citizens, community organizers, and urban planners. It transforms complex civic challenges into structured, safe, and measurable sustainability solutions.
        </p>

        {/* 3 Core Value Pillars */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <Shield aria-hidden className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Safety & Municipal Compliance</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <Zap aria-hidden className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Rapid 3–5 Day Actionable Fixes</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <Gauge aria-hidden className="h-4 w-4 text-sky-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Quantifiable Progress Metrics</span>
          </div>
        </div>
      </div>

      {/* Specialist Domains & Capabilities Grid */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Urban Specialist Capabilities</h2>
            <p className="text-xs text-slate-400">Select any domain below to activate its dedicated specialist mode</p>
          </div>
          <span className="hidden text-xs font-semibold text-civic-600 sm:inline">Interactive Mode Selector</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map(({ mode, icon: Icon, title, description, features }) => {
            const meta = modeMeta[mode]
            const isSelected = currentMode === mode

            return (
              <button
                key={mode}
                onClick={() => onSelectMode(mode)}
                className={cn(
                  'group flex flex-col justify-between rounded-2xl border bg-white p-4 text-left transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  isSelected
                    ? 'border-sky-500 bg-sky-50/20 shadow-md ring-2 ring-sky-200'
                    : 'border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl border', meta.color)}>
                        <Icon aria-hidden className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-bold text-navy-900">{title}</span>
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-tight',
                      isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}>
                      {isSelected ? 'Active' : 'Select'}
                      <ChevronRight aria-hidden="true" className="h-3 w-3" />
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
                  {features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      <CheckCircle2 aria-hidden="true" className="h-3 w-3 text-civic-600" />
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Structured Action Commands Framework */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="mb-3.5 flex items-center gap-2">
          <Layers aria-hidden="true" className="h-4 w-4 text-civic-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Built-in Strategic Frameworks</h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-slate-600">
          Prefix your questions with any command or type <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-civic-700">/</code> in the chat bar to trigger specialized structured frameworks:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {commandFrameworks.map(({ cmd, label, desc }) => (
            <div key={cmd} className="rounded-xl border border-slate-100 bg-[#f9fbfe] p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-civic-700 bg-sky-100/80 px-1.5 py-0.5 rounded-md">{cmd}</span>
                <span className="text-xs font-bold text-navy-900">{label}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

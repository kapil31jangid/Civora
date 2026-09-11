import { ArrowUpRight, Bike, Droplets, Leaf, Trash2, Wind } from 'lucide-react'

const prompts = [
  { icon: Bike, label: 'Traffic & mobility', text: 'Traffic gets very bad outside my university every evening.' },
  { icon: Trash2, label: 'Waste management', text: 'Garbage bins in my neighborhood overflow regularly.' },
  { icon: Wind, label: 'Urban pollution', text: 'Vehicle pollution and noise are high near a busy road.' },
  { icon: Leaf, label: 'Public spaces', text: 'Our neighborhood has almost no usable green space.' },
  { icon: Droplets, label: 'Urban drainage', text: 'Our street experiences waterlogging after heavy rainfall.' },
]

export function EmptyState({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 pb-44 pt-10" aria-labelledby="welcome-title">
    <div className="mb-8 max-w-2xl">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
        <span aria-hidden>●</span> UN SDG 11 action assistant
      </div>
      <h1 id="welcome-title" className="text-4xl font-bold tracking-[-.04em] text-navy-900 sm:text-5xl">Turn city problems into <span className="text-civic-600">smarter actions.</span></h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Describe an urban problem. Civora will help you understand it, prioritize what matters, and build a practical plan.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {prompts.map(({ icon: Icon, label, text }, index) => <button key={text} onClick={() => onPrompt(text)} className={`group flex min-h-28 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${index === 4 ? 'sm:col-span-2' : ''}`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700"><Icon aria-hidden className="h-5 w-5" /></span>
        <span className="min-w-0"><span className="flex items-center justify-between gap-3 text-sm font-bold text-navy-900">{label}<ArrowUpRight aria-hidden className="h-4 w-4 text-slate-400 transition group-hover:text-civic-600" /></span><span className="mt-1.5 block text-sm leading-5 text-slate-600">{text}</span></span>
      </button>)}
    </div>
  </section>
}

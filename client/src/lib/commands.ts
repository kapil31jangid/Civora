import { BarChart3, Bike, Bot, CalendarDays, Droplets, HelpCircle, Leaf, Search, Sparkles, Trash2, Users, Wind, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Mode } from '../types'

export interface Command {
  name: string
  label: string
  description: string
  group: 'Modes' | 'Actions'
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

export const commands: Command[] = [
  { name: '/auto', label: 'Smart Auto', description: 'Automatic multi-domain analysis', group: 'Modes', icon: Bot },
  { name: '/mobility', label: 'Mobility', description: 'Traffic & sustainable transport', group: 'Modes', icon: Bike },
  { name: '/waste', label: 'Waste', description: 'Waste management & recycling', group: 'Modes', icon: Trash2 },
  { name: '/pollution', label: 'Pollution', description: 'Air, noise & urban pollution', group: 'Modes', icon: Wind },
  { name: '/spaces', label: 'Public Spaces', description: 'Public spaces & greenery', group: 'Modes', icon: Leaf },
  { name: '/water', label: 'Urban Water', description: 'Urban water & drainage', group: 'Modes', icon: Droplets },
  { name: '/analyze', label: 'Analyze', description: 'Analyze the current urban issue', group: 'Actions', icon: Search },
  { name: '/quickfix', label: 'Quick Fix', description: 'Suggest immediate practical actions', group: 'Actions', icon: Zap },
  { name: '/plan', label: 'Plan', description: 'Create an implementation plan', group: 'Actions', icon: CalendarDays },
  { name: '/stakeholders', label: 'Stakeholders', description: 'Identify stakeholders and roles', group: 'Actions', icon: Users },
  { name: '/impact', label: 'Impact', description: 'Suggest success metrics', group: 'Actions', icon: BarChart3 },
  { name: '/help', label: 'Help', description: 'Show all available commands', group: 'Actions', icon: HelpCircle },
]

export function filteredCommands(query: string) {
  const needle = query.replace(/^\//, '').toLowerCase()
  return commands.filter((item) => item.name.slice(1).includes(needle) || item.label.toLowerCase().includes(needle))
}

export const modeMeta: Record<Mode, { label: string; short: string; icon: typeof Sparkles; color: string }> = {
  auto: { label: 'Smart Auto', short: 'Auto', icon: Sparkles, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  mobility: { label: 'Mobility', short: 'Mobility', icon: Bike, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  waste: { label: 'Waste', short: 'Waste', icon: Trash2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  pollution: { label: 'Pollution', short: 'Pollution', icon: Wind, color: 'text-violet-700 bg-violet-50 border-violet-200' },
  spaces: { label: 'Public Spaces', short: 'Spaces', icon: Leaf, color: 'text-green-700 bg-green-50 border-green-200' },
  water: { label: 'Urban Water', short: 'Water', icon: Droplets, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
}

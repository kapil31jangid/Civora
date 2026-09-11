import type { Mode } from '../types/index.js'

const modeCommands = new Set<Mode>(['auto', 'mobility', 'waste', 'pollution', 'spaces', 'water'])
const actionCommands = new Set(['analyze', 'quickfix', 'plan', 'stakeholders', 'impact', 'help'])

export function parseCommand(raw: string, currentMode: Mode) {
  const trimmed = raw.trim()
  const match = trimmed.match(/^\/(\w+)(?:\s+([\s\S]*))?$/)
  if (!match) return { mode: currentMode, message: trimmed }
  const command = match[1]?.toLowerCase() ?? ''
  const remainder = match[2]?.trim() ?? ''
  if (modeCommands.has(command as Mode)) return { mode: command as Mode, message: remainder, modeChanged: true }
  if (actionCommands.has(command)) {
    const prompts: Record<string, string> = {
      analyze: 'Analyze the current urban issue: detected issues, possible contributing factors, priority, missing information, and relevant domains.',
      quickfix: 'Suggest 3–5 realistic, safe actions that can begin quickly.',
      plan: 'Create a practical 30-day action plan, adapting the timeline if necessary.',
      stakeholders: 'Identify stakeholder groups, their roles, responsibilities, and realistic contributions.',
      impact: 'Suggest measurable success indicators without inventing baselines.',
      help: 'Briefly explain Civora’s specialist modes and action commands.',
    }
    return { mode: currentMode, message: remainder || prompts[command], action: command }
  }
  return { mode: currentMode, message: trimmed }
}

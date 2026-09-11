import type { Mode } from '../types/index.js'
import { BASE_PROMPT } from './base.js'
import { AUTO_PROMPT } from './auto.js'
import { MOBILITY_PROMPT } from './mobility.js'
import { WASTE_PROMPT } from './waste.js'
import { POLLUTION_PROMPT } from './pollution.js'
import { SPACES_PROMPT } from './spaces.js'
import { WATER_PROMPT } from './water.js'

const prompts: Record<Mode, string> = {
  auto: AUTO_PROMPT,
  mobility: MOBILITY_PROMPT,
  waste: WASTE_PROMPT,
  pollution: POLLUTION_PROMPT,
  spaces: SPACES_PROMPT,
  water: WATER_PROMPT,
}

export function getSystemPrompt(mode: Mode, action?: string) {
  const actionPrompt = action ? `\nCurrent action command: ${action}. Follow this command precisely while remaining within the active specialist domain.` : ''
  return `${BASE_PROMPT}\n\n${prompts[mode]}${actionPrompt}`
}

import type { Mode } from '../types/index.js'

// Keyword signals for each non-auto mode.
// Order matters: more specific patterns are listed first.
const DOMAIN_SIGNALS: Record<Exclude<Mode, 'auto'>, RegExp> = {
  water: /\b(water\s*wast(e|age)|waterlog|flood(ing)?|drain(age|pipe)?|rain(water)?(\s*harvest)?|sewage|leak(ing)?|pipe\s*burst|SUDS|stormwater|tank\s*overflow|groundwater|well|borewell|water\s*supply|water\s*conserv|water\s*monitor|water\s*scarcity|runoff|water\s*body|pond|lake\s*clean)\b/i,
  waste: /\b(garbage|trash|rubbish|litter(ing)?|waste\s*(manag|segreg|collect|disposal|dump|bin|heap|overflow)|compost(ing)?|landfill|e\s*-?\s*waste|plastic\s*waste|solid\s*waste|recycl|municipal\s*waste|open\s*dump(ing)?|overflowing\s*bin)\b/i,
  mobility: /\b(traffic\s*(jam|congestion|signal|light|flow|problem)?|road\s*(block|condition|repair|maintainance|encroach)?|parking|pothole|pedestrian|sidewalk|footpath|crosswalk|zebra\s*crossing|cycle\s*(lane|track|path)|cycling|bike\s*lane|scooter|e-?vehicle|transit|bus(es)?|metro|commut|auto\s*-?rickshaw|cab|ride\s*-?shar)\b/i,
  pollution: /\b(air\s*quality|AQI|PM\s*2\.?5|PM\s*10|smog|haze|particulate|vehicle\s*emiss|diesel\s*fume|exhaust\s*gas|open\s*burn(ing)?|construction\s*dust|noise\s*pollut|decibel|industrial\s*emiss|factory\s*smoke|stubble\s*burn|air\s*pollut)\b/i,
  spaces: /\b(park(ing\s*lot)?|green\s*space|garden|playground|public\s*square|plaza|footpath\s*encroach|tree\s*plant(ing)?|urban\s*tree|canopy|beautif|open\s*space|community\s*hall|public\s*bench|street\s*vend|pavement|footpath\s*block|urban\s*heat|shade)\b/i,
}

const MODE_DISPLAY: Record<Exclude<Mode, 'auto'>, string> = {
  water: 'Urban Water',
  waste: 'Waste Management',
  mobility: 'Mobility',
  pollution: 'Pollution',
  spaces: 'Public Spaces',
}

const MODE_SLASH: Record<Exclude<Mode, 'auto'>, string> = {
  water: '/water',
  waste: '/waste',
  mobility: '/mobility',
  pollution: '/pollution',
  spaces: '/spaces',
}

/**
 * Returns the best-matching mode for the message content, or null if no
 * strong signal is found (suitable for auto-mode or uncertain queries).
 */
export function detectMessageDomain(message: string): Exclude<Mode, 'auto'> | null {
  for (const [mode, pattern] of Object.entries(DOMAIN_SIGNALS) as [Exclude<Mode, 'auto'>, RegExp][]) {
    if (pattern.test(message)) return mode
  }
  return null
}

/**
 * Returns a redirect suggestion string when the detected domain doesn't match
 * the active specialist mode. Returns null if no redirect is needed.
 */
export function buildModeRedirect(
  detectedDomain: Exclude<Mode, 'auto'>,
  activeMode: Mode,
): string | null {
  if (activeMode === 'auto') return null
  if (detectedDomain === activeMode) return null

  const activeName = MODE_DISPLAY[activeMode as Exclude<Mode, 'auto'>] ?? activeMode
  const targetName = MODE_DISPLAY[detectedDomain]
  const slash = MODE_SLASH[detectedDomain]

  return [
    `⚠️ **Mode Mismatch Detected**`,
    ``,
    `You're currently in **${activeName}** mode, but your question appears to be related to **${targetName}**.`,
    ``,
    `The ${activeName} specialist focuses only on its own domain and cannot give you the best guidance here.`,
    ``,
    `**To get a proper, expert response, please switch modes:**`,
    `- Type \`${slash}\` in the chat to activate the ${targetName} specialist, then ask your question.`,
    `- Or select **${targetName}** from the mode dropdown in the top-right corner.`,
    ``,
    `_Once you're in the right mode, Civora will provide a structured analysis, quick fixes, and a full action plan for your issue._`,
  ].join('\n')
}

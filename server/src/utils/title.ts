const filler = new Set(['the', 'a', 'an', 'is', 'are', 'our', 'my', 'very', 'every', 'becomes', 'gets', 'there', 'near', 'outside'])

export function createTitle(message: string) {
  const words = message.replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean)
  const meaningful = words.filter((word) => !filler.has(word.toLowerCase()))
  const selected = (meaningful.length >= 3 ? meaningful : words).slice(0, 5)
  return selected.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').slice(0, 80) || 'New Chat'
}

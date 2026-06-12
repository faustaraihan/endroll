/**
 * Format date string into a readable format
 * e.g., "March 12, 2026"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Get just the month and year
 * e.g., "March 2026"
 */
export function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Get the first two initials of a string, word-aware
 * e.g., "The Godfather" -> "TG", "Parasite" -> "PA"
 */
export function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter(w => /[a-zA-Z0-9]/.test(w))
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Deterministic hue from a string, for curated-looking poster placeholders.
 * Same title always yields the same color.
 */
export function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  // Muted saturation/lightness to stay within the dark cinematic palette
  return `hsl(${hue}, 35%, 24%)`
}

/**
 * Get greeting based on current local hour
 */
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Still awake,'
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  if (h < 21) return 'Good evening,'
  return 'Good night,'
}

/**
 * Format runtime minutes into readable format
 * e.g., 132 -> "2h 12m", 47 -> "47m"
 */
export function formatRuntime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

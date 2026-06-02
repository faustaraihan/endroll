/**
 * Format date string into Indonesian readable format
 * e.g., "12 Maret 2026"
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
 * e.g., "Maret 2026"
 */
export function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Get the first two initials of a string
 * e.g., "John Doe" -> "JO"
 */
export function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
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

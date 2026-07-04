import { describe, it, expect } from 'vitest'
import { formatRuntime, getInitials, getGreeting, getColorFromString, formatDate } from '../utils/formatters'

describe('formatRuntime', () => {
  it('returns minutes only for < 60 min', () => {
    expect(formatRuntime(47)).toBe('47m')
  })

  it('returns hours only for exact hours', () => {
    expect(formatRuntime(120)).toBe('2h')
  })

  it('returns hours and minutes for mixed', () => {
    expect(formatRuntime(132)).toBe('2h 12m')
  })

  it('handles 0 minutes', () => {
    expect(formatRuntime(0)).toBe('0m')
  })
})

describe('getInitials', () => {
  it('returns first letters of two words', () => {
    expect(getInitials('The Godfather')).toBe('TG')
  })

  it('returns first two chars for single word', () => {
    expect(getInitials('Parasite')).toBe('PA')
  })

  it('handles lowercase input', () => {
    expect(getInitials('the matrix')).toBe('TM')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })
})

describe('getGreeting', () => {
  it('returns a string ending with comma', () => {
    const greeting = getGreeting()
    expect(greeting).toMatch(/,$/)
  })
})

describe('getColorFromString', () => {
  it('returns a valid HSL string', () => {
    const color = getColorFromString('Interstellar')
    expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/)
  })

  it('is deterministic — same input always same output', () => {
    const a = getColorFromString('Parasite')
    const b = getColorFromString('Parasite')
    expect(a).toBe(b)
  })
})

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2026-05-28')
    expect(result).toContain('May')
    expect(result).toContain('28')
    expect(result).toContain('2026')
  })
})

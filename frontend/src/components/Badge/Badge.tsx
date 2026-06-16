import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type BadgeVariant = 'gold' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

/**
 * Small meta pill used for rewatch counts, season tags, and similar
 * inline metadata. Shared between the diary and dashboard so the look
 * stays consistent.
 */
export function Badge({ children, variant = 'gold', className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className ?? ''}`}>
      {children}
    </span>
  )
}

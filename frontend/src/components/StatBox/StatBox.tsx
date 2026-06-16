import type { ReactNode } from 'react'
import styles from './StatBox.module.css'

interface StatBoxProps {
  icon?: ReactNode
  value: string | number
  label: string
  unit?: string
  valueColor?: string
}

export function StatBox({ icon, value, label, unit, valueColor }: StatBoxProps) {
  return (
    <div className={styles.statBox}>
      {icon && (
        <div className={styles.statIcon} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={styles.statValueWrap}>
        <span className={styles.statValue} style={valueColor ? { color: valueColor } : undefined}>{value}</span>
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </div>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

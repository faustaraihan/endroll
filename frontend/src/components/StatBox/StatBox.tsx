import type { ReactNode } from 'react'
import styles from './StatBox.module.css'

interface StatBoxProps {
  icon: ReactNode
  value: string | number
  label: string
  unit?: string
}

export function StatBox({ icon, value, label, unit }: StatBoxProps) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statIcon} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.statValueWrap}>
        <span className={styles.statValue}>{value}</span>
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </div>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

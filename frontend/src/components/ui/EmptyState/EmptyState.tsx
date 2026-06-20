import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon: ReactNode
  title: string | ReactNode
  description?: string | ReactNode
  actionLabel?: string
  actionLink?: string
  actionIcon?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  actionIcon
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrap} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.textWrap}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionIcon} {actionLabel}
        </Link>
      )}
    </div>
  )
}

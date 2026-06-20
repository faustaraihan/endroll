import { getInitials, getColorFromString } from '../../../../utils'
import styles from './PosterPlaceholder.module.css'

interface PosterPlaceholderProps {
  /** Movie/series title — source of the initials and color */
  title: string
  /** Initials font size */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Poster placeholder per the PRD: title initials + color derived from the
 * title hash. Looks curated, not broken.
 */
export function PosterPlaceholder({ title, size = 'md', className = '' }: PosterPlaceholderProps) {
  const bg = getColorFromString(title)
  return (
    <div
      className={`${styles.placeholder} ${styles[size]} ${className}`}
      style={{ background: `linear-gradient(160deg, ${bg} 0%, rgba(9,9,11,0.85) 100%)` }}
      role="img"
      aria-label={`Poster for ${title} unavailable`}
    >
      <span className={styles.initials} aria-hidden="true">
        {getInitials(title)}
      </span>
    </div>
  )
}

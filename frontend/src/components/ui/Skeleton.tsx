import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  /**
   * Variant:
   * - `text` — single line of text height
   * - `title` — heading height
   * - `avatar` — circle
   * - `poster` — poster aspect ratio (2:3)
   * - `card` — card shape with rounded corners
   * - `custom` — use your own width/height
   */
  variant?: 'text' | 'title' | 'avatar' | 'poster' | 'card' | 'custom'
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'text',
}: SkeletonProps) {
  const style: React.CSSProperties = {}

  if (variant === 'text') {
    style.height = '0.875rem'
    style.width = width ?? '100%'
    style.borderRadius = '4px'
  } else if (variant === 'title') {
    style.height = '1.25rem'
    style.width = width ?? '60%'
    style.borderRadius = '4px'
  } else if (variant === 'avatar') {
    style.width = style.height = typeof width === 'number' ? width : 36
    style.borderRadius = '50%'
  } else if (variant === 'poster') {
    style.width = width ?? '100%'
    // Poster aspect ratio ~2:3
    style.paddingBottom = '150%'
    style.borderRadius = 'var(--radius-md, 10px)'
  } else if (variant === 'card') {
    style.width = width ?? '100%'
    style.height = height ?? 120
    style.borderRadius = 'var(--radius-lg, 16px)'
  } else if (variant === 'custom') {
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height
    if (borderRadius) style.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  }

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/**
 * A row of Skeleton items useful for list loading states.
 */
export function SkeletonRow({
  count = 1,
  variant = 'text',
  className = '',
}: {
  count?: number
  variant?: SkeletonProps['variant']
  className?: string
}) {
  return (
    <div className={`${styles.row} ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  )
}

/**
 * A poster grid skeleton — useful for Explore/Watchlist/Collections loading state.
 */
export function SkeletonPosterGrid({
  count = 8,
  className = '',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`${styles.posterGrid} ${className}`} aria-label="Loading" role="status">
      <div className={styles.srOnly}>Loading content…</div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.posterCell}>
          <Skeleton variant="poster" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
        </div>
      ))}
    </div>
  )
}

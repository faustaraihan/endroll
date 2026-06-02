import { Link } from 'react-router-dom'
import { Film, Plus, X, CheckCircle2, FolderHeart } from 'lucide-react'
import type { Title } from '../../types'
import styles from './TitleCard.module.css'

/** Stop click from reaching the parent Link */
const stopNav = (e: React.MouseEvent) => e.stopPropagation()

export interface TitleCardProps {
  title: Title
  index?: number
  watched?: boolean
  showLogAction?: boolean
  showMetaType?: boolean
  onCollect?: () => void
  onRemove?: () => void
  removeTooltip?: string
}

export function TitleCard({
  title,
  index = 0,
  watched = false,
  showLogAction = false,
  showMetaType = false,
  onCollect,
  onRemove,
  removeTooltip = 'Remove'
}: TitleCardProps) {
  return (
    <article
      className={`${styles.posterCard} ${watched ? styles.posterCardWatched : ''}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      <Link to={`/title/${title.id}`} className={styles.cardLink}>
        {/* Poster */}
        <div className={styles.posterWrap}>
          {title.poster_path ? (
            <img
              src={title.poster_path}
              alt={`Poster ${title.title} (${title.release_year})`}
              className={styles.poster}
              loading="lazy"
            />
          ) : (
            <div className={styles.posterFallback}>
              <Film size={28} />
            </div>
          )}

          {/* Hover overlay */}
          <div className={styles.overlay}>
            {watched ? (
              <div className={styles.watchedBadge}>
                <CheckCircle2 size={16} />
                <span>Watched</span>
              </div>
            ) : (
              showLogAction && (
                <Link to="/log" className="btn btn-primary btn-sm" aria-label={`Log ${title.title}`} onClick={stopNav}>
                  <Plus size={14} />
                  Log now
                </Link>
              )
            )}

            {onCollect && (
              <button
                className={styles.collectBtn}
                onClick={(e) => { stopNav(e); onCollect() }}
                aria-label={`Collect ${title.title}`}
                title="Add to Collection"
              >
                <FolderHeart size={14} />
              </button>
            )}

            {onRemove && (
              <button
                className={styles.removeBtn}
                onClick={(e) => { stopNav(e); onRemove() }}
                aria-label={`${removeTooltip} ${title.title}`}
                title={removeTooltip}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Info below poster */}
        <div className={styles.cardInfo}>
          <h2 className={styles.cardTitle} title={title.title}>{title.title}</h2>
          <div className={styles.cardMeta}>
            {title.release_year && (
              <span className={styles.metaYear}>{title.release_year}</span>
            )}
            {showMetaType && (
              <span className={styles.metaType}>
                {title.type === 'film' ? 'Film' : 'Series'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

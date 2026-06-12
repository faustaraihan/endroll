import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, X, CheckCircle2, FolderHeart, Bookmark } from 'lucide-react'
import { PosterPlaceholder } from '../PosterPlaceholder/PosterPlaceholder'
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
  onToggleWatchlist?: () => void
  inWatchlist?: boolean
}

export function TitleCard({
  title,
  index = 0,
  watched = false,
  showLogAction = false,
  showMetaType = false,
  onCollect,
  onRemove,
  removeTooltip = 'Remove',
  onToggleWatchlist,
  inWatchlist = false
}: TitleCardProps) {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()

  return (
    <article
      className={`${styles.posterCard} ${watched ? styles.posterCardWatched : ''}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      <Link to={`/title/${title.id}`} className={styles.cardLink}>
        {/* Poster */}
        <div className={styles.posterWrap}>
          {title.poster_path && !imgError ? (
            <img
              src={title.poster_path}
              alt={`Poster ${title.title} (${title.release_year})`}
              className={styles.poster}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <PosterPlaceholder title={title.title} size="md" />
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
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  aria-label={`Log ${title.title}`}
                  onClick={(e) => { stopNav(e); navigate('/log', { state: { title } }) }}
                >
                  <Plus size={14} />
                  Log now
                </button>
              )
            )}

            {onCollect && (
              <button
                className={styles.collectBtn}
                onClick={(e) => { stopNav(e); onCollect() }}
                aria-label={`Add ${title.title} to collection`}
                title="Add to collection"
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

            {onToggleWatchlist && (
              <button
                className={`${styles.watchlistBtn} ${inWatchlist ? styles.watchlistBtnActive : ''}`}
                onClick={(e) => { stopNav(e); onToggleWatchlist() }}
                aria-label={inWatchlist ? `Remove ${title.title} from watchlist` : `Add ${title.title} to watchlist`}
                aria-pressed={inWatchlist}
                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Bookmark size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
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

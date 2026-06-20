import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Badge } from '../../../../../components'
import { Poster } from '../../../../titles/components/Poster/Poster'
import styles from '../DiaryView.module.css'
import type { WatchLog } from '../../../../../types'

interface DiaryEntryProps {
  log: WatchLog
  index: number
  personalRating?: number
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({ log, index, personalRating }) => {
  const date = log.watched_at ? new Date(log.watched_at) : null
  const day = date?.getDate()
  const month = date?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()

  const ratingToShow = log.title.type === 'movie'
    ? (log.rating ?? personalRating)
    : personalRating

  return (
    <Link
      to={`/title/${log.title.id}`}
      className={styles.entry}
      style={{ '--i': index, textDecoration: 'none', color: 'inherit' } as React.CSSProperties}
    >
      {/* Date column */}
      <div className={styles.entryDate}>
        {day && <span className={styles.entryDateDay}>{day}</span>}
        {month && <span className={styles.entryDateMonth}>{month}</span>}
      </div>

      {/* Poster thumb */}
      <div className={styles.entryPosterLink}>
        <Poster
          title={log.title.title}
          src={log.title.poster_path}
          alt={`Poster ${log.title.type === 'movie' ? 'movie' : 'series'} ${log.title.title} (${log.title.release_year})`}
          className={styles.posterImg}
          size="sm"
        />
        {/* Rating overlay for grid view only */}
        {ratingToShow != null && (
          <div className={`${styles.ratingBig} ${styles.gridRatingOverlay}`}>
            <Star size={11} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" />
            {ratingToShow.toFixed(1)}
            <span className={styles.ratingMax}>/10</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.entryBody}>
        <div className={styles.entryRow}>
          <div className={styles.entryTitleLink}>
            <h2 className={styles.entryTitle}>{log.title.title}</h2>
          </div>
          <div className={styles.entryRight}>
            {ratingToShow != null && (
              <span className={styles.ratingBig}>
                <Star size={11} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" />
                {ratingToShow.toFixed(1)}
                <span className={styles.ratingMax}>/10</span>
              </span>
            )}
          </div>
        </div>
        <div className={styles.entryMeta}>
          {log.title.release_year && (
            <span className={styles.metaYear}>{log.title.release_year}</span>
          )}
          <span className={styles.metaType}>
            {log.title.type === 'movie' ? 'Movie' : 'Series'}
          </span>
          {log.rewatch_count > 0 && (
            <Badge variant="neutral">Rewatch ×{log.rewatch_count}</Badge>
          )}
        </div>
        {log.notes && (
          <blockquote className={styles.notes}>"{log.notes}"</blockquote>
        )}
      </div>
    </Link>
  )
}

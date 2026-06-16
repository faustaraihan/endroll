import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Poster, Badge } from '../../../components'
import styles from '../Diary.module.css'
import type { WatchLog } from '../../../types'

interface DiaryEntryProps {
  log: WatchLog
  index: number
  personalRating?: number
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({ log, index, personalRating }) => {
  const date = log.watched_at ? new Date(log.watched_at) : null
  const day = date?.getDate()
  const month = date?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()

  const ratingToShow = log.title.type === 'film'
    ? (log.rating ?? personalRating)
    : personalRating

  return (
    <article
      className={styles.entry}
      style={{ '--i': index } as React.CSSProperties}
    >
      {/* Date column */}
      <div className={styles.entryDate}>
        {day && <span className={styles.entryDateDay}>{day}</span>}
        {month && <span className={styles.entryDateMonth}>{month}</span>}
      </div>

      {/* Poster thumb */}
      <Link to={`/title/${log.title.id}`} className={styles.entryPosterLink}>
        <Poster
          title={log.title.title}
          src={log.title.poster_path}
          alt={`Poster ${log.title.type === 'film' ? 'film' : 'series'} ${log.title.title} (${log.title.release_year})`}
          className={styles.posterImg}
          size="sm"
        />
      </Link>

      {/* Info */}
      <div className={styles.entryBody}>
        <Link to={`/title/${log.title.id}`} className={styles.entryTitleLink}>
          <h2 className={styles.entryTitle}>{log.title.title}</h2>
        </Link>
        <div className={styles.entryMeta}>
          {log.title.release_year && (
            <span className={styles.metaYear}>{log.title.release_year}</span>
          )}
          <span className={styles.metaType}>
            {log.title.type === 'film' ? 'Film' : 'Series'}
          </span>
          {log.rewatch_count > 0 && (
            <Badge variant="gold">Rewatch ×{log.rewatch_count}</Badge>
          )}
        </div>
        {log.notes && (
          <blockquote className={styles.notes}>"{log.notes}"</blockquote>
        )}
      </div>

      {/* Rating */}
      <div className={styles.entryRight}>
        {ratingToShow != null && (
          <span className={styles.ratingBig}>
            <Star size={11} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" />
            {ratingToShow.toFixed(1)}
            <span className={styles.ratingMax}>/10</span>
          </span>
        )}
      </div>
    </article>
  )
}

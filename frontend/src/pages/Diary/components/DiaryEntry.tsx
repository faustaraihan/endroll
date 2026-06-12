import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { formatDate } from '../../../utils'
import { Poster } from '../../../components'
import styles from '../Diary.module.css'
import type { WatchLog } from '../../../types'

interface DiaryEntryProps {
  log: WatchLog
  index: number
  personalRating?: number
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({
  log,
  index,
  personalRating
}) => {
  return (
    <article
      className={styles.entry}
      style={{ '--i': index } as React.CSSProperties}
    >
      {/* Poster */}
      <Link to={`/title/${log.title.id}`} className={styles.entryPosterLink}>
        <Poster
          title={log.title.title}
          src={log.title.poster_path}
          alt={`Poster ${log.title.type === 'film' ? 'film' : 'series'} ${log.title.title} (${log.title.release_year})`}
          className={styles.posterImg}
          size="sm"
        />
      </Link>

      {/* Body */}
      <div className={styles.entryBody}>
        <div className={styles.entryRow}>
          <div className={styles.entryLeft}>
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
              {log.title.type === 'film' && log.rewatch_count > 0 && (
                <span className={`${styles.metaBadge} ${styles.metaBadgeViolet}`}>
                  Rewatch #{log.rewatch_count}
                </span>
              )}
            </div>
          </div>

          <div className={styles.entryRight}>
            {log.title.type === 'film' && log.rating !== undefined && log.rating !== null ? (
              <div className={styles.ratingBig}>
                <Star size={14} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                <span>{log.rating.toFixed(1)}</span>
                <span className={styles.ratingMax}>/10</span>
              </div>
            ) : personalRating !== undefined ? (
              <div className={styles.ratingBig}>
                <Star size={14} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                <span>{personalRating.toFixed(1)}</span>
                <span className={styles.ratingMax}>/10</span>
              </div>
            ) : null}
          </div>
        </div>

        {log.notes && (
          <blockquote className={styles.notes}>
            "{log.notes}"
          </blockquote>
        )}

        <div className={styles.entryFooter}>
          <time className={styles.date} dateTime={log.watched_at}>
            {formatDate(log.watched_at)}
          </time>
        </div>
      </div>
    </article>
  )
}

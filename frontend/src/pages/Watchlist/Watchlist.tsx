import { useState } from 'react'
import { Film, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp, useToast } from '../../contexts'
import { EmptyState, CollectModal, TitleCard } from '../../components'
import type { Title } from '../../types'
import styles from './Watchlist.module.css'

export default function Watchlist() {
  const { watchlist, setWatchlist, watchLogs } = useApp()
  const { addToast } = useToast()
  const [collectTitle, setCollectTitle] = useState<Title | null>(null)

  function handleRemove(id: string, titleName: string) {
    setWatchlist(prev => prev.filter(item => item.id !== id))
    addToast(`"${titleName}" removed from watchlist.`, 'info')
  }

  function isWatched(titleId: string) {
    return watchLogs.some(log => log.title_id === titleId)
  }

  return (
    <div className={styles.page}>
      {/* ── Header strip ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>Watchlist</h1>
          <span className={styles.count}>{watchlist.length} titles</span>
        </div>
        <Link to="/explore" className="btn btn-secondary btn-sm">
          <Compass size={14} /> Explore films
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <EmptyState
          icon={<Film size={40} strokeWidth={1.5} />}
          title="Your watchlist is empty."
          description="Add films you want to watch later from the search page."
          actionLabel="Find films"
          actionLink="/explore"
          actionIcon={<Compass size={16} />}
        />
      ) : (
        <div className={styles.content}>
          <ul className={styles.posterGrid} role="list">
            {watchlist.map((item, i) => {
              const watched = isWatched(item.title_id)
              return (
                <li key={item.id}>
                  <TitleCard
                    title={item.title}
                    index={i}
                    watched={watched}
                    showLogAction={true}
                    showMetaType={true}
                    onCollect={() => setCollectTitle(item.title)}
                    onRemove={() => handleRemove(item.id, item.title.title)}
                    removeTooltip="Remove from watchlist"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <CollectModal
        title={collectTitle}
        onClose={() => setCollectTitle(null)}
      />
    </div>
  )
}

import { useState } from 'react'
import { Film, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts'
import { useStore } from '../../store/useStore'
import { EmptyState, CollectModal, TitleCard } from '../../components'
import type { Title } from '../../types'
import styles from './Watchlist.module.css'

export default function Watchlist() {
  const watchlist = useStore(state => state.watchlist)
  const setWatchlist = useStore(state => state.setWatchlist)
  const watchLogs = useStore(state => state.watchLogs)
  const { addToast } = useToast()
  const [collectTitle, setCollectTitle] = useState<Title | null>(null)

  function handleRemove(id: string, titleName: string) {
    const removed = watchlist.find(item => item.id === id)
    setWatchlist(prev => prev.filter(item => item.id !== id))
    addToast(`"${titleName}" removed from watchlist.`, 'info', {
      action: removed
        ? {
            label: 'Undo',
            onClick: () => setWatchlist(prev => [removed, ...prev]),
          }
        : undefined,
    })
  }

  function isWatched(titleId: string) {
    return watchLogs.some(log => log.title_id === titleId)
  }

  return (
    <div className={styles.page}>
      {/* ── Header strip ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 5 }}>To watch · {watchlist.length}</p>
            <h1 className={styles.pageTitle}>Watchlist</h1>
          </div>
        </div>
        <div className={styles.topRight}>
          <Link to="/explore" className="btn btn-secondary btn-sm">
            <Compass size={14} /> Explore
          </Link>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <EmptyState
          icon={<Film size={40} strokeWidth={1.5} />}
          title="Your watchlist is empty."
          description="Add films you want to watch later from the Explore page."
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

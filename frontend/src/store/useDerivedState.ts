import { useMemo, useCallback } from 'react'
import { useStore } from './useStore'
import type { Title } from '../types'
import { mockStreak, mockTitles } from '../data/mockData'

export function useAllKnownTitles() {
  const watchLogs = useStore(state => state.watchLogs)
  const watchlist = useStore(state => state.watchlist)
  const exploreData = useStore(state => state.exploreData)

  const allKnownTitles = useMemo(() => {
    const map = new Map<string, Title>()
    
    // Add explicitly mocked titles
    mockTitles.forEach(t => {
      map.set(t.id, t)
      if (t.tmdb_id) map.set(String(t.tmdb_id), t)
    })

    // Add titles from explore lists
    const exploreLists = [
      ...exploreData.trending,
      ...exploreData.nowPlaying,
      ...exploreData.classics,
      ...exploreData.upcoming,
      ...exploreData.searchResults
    ]
    exploreLists.forEach(r => {
      const idStr = String(r.tmdb_id)
      if (!map.has(idStr)) {
        map.set(idStr, {
          id: idStr,
          tmdb_id: r.tmdb_id,
          title: r.title,
          type: r.type,
          poster_path: r.poster_path,
          release_year: r.release_year,
          genres: r.genres,
          cast: [],
          overview: r.overview,
        })
      }
    })

    // Add from watchLogs
    watchLogs.forEach(l => {
      map.set(l.title.id, l.title)
      if (l.title.tmdb_id) map.set(String(l.title.tmdb_id), l.title)
    })
    
    // Add from watchlist
    watchlist.forEach(w => {
      map.set(w.title.id, w.title)
      if (w.title.tmdb_id) map.set(String(w.title.tmdb_id), w.title)
    })

    return map
  }, [watchLogs, watchlist, exploreData])

  const getTitleById = useCallback((id: string) => {
    return allKnownTitles.get(id)
  }, [allKnownTitles])

  return { allKnownTitles, getTitleById }
}

export function useDynamicStreak() {
  const watchLogs = useStore(state => state.watchLogs)
  const user = useStore(state => state.user)

  return useMemo(() => {
    if (watchLogs.length === 0) {
      return {
        id: mockStreak.id,
        user_id: user.id,
        current_streak_weeks: 0,
        longest_streak_weeks: 0,
        last_log_week: '',
      }
    }

    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
    const getMondayTime = (dateStr: string) => {
      const d = new Date(dateStr)
      const day = d.getDay()
      const diff = day === 0 ? 6 : day - 1
      d.setDate(d.getDate() - diff)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    }

    const loggedWeeks = Array.from(new Set(watchLogs.map(l => getMondayTime(l.watched_at))))
      .sort((a, b) => a - b)

    let longest = 0
    let current = 0
    let previousWeek = -1

    for (const week of loggedWeeks) {
      if (previousWeek === -1) {
        current = 1
      } else {
        const diff = Math.round((week - previousWeek) / MS_PER_WEEK)
        if (diff === 1) {
          current++
        } else if (diff > 1) {
          current = 1
        }
      }
      if (current > longest) longest = current
      previousWeek = week
    }

    const today = new Date('2026-06-16') // Using the static date from previous implementation
    const thisWeek = getMondayTime(today.toISOString())
    const lastLoggedWeek = loggedWeeks[loggedWeeks.length - 1]
    const diffFromNow = Math.round((thisWeek - lastLoggedWeek) / MS_PER_WEEK)

    let activeCurrentStreak = current
    if (diffFromNow > 1) {
      if (diffFromNow === 2 && today.getDay() === 1) {
        // Still in grace period
      } else {
        activeCurrentStreak = 0
      }
    }

    return {
      id: mockStreak.id,
      user_id: user.id,
      current_streak_weeks: activeCurrentStreak,
      longest_streak_weeks: longest,
      last_log_week: new Date(lastLoggedWeek).toISOString().split('T')[0],
    }
  }, [watchLogs, user.id])
}

export function useDailyActivity() {
  const watchLogs = useStore(state => state.watchLogs)

  return useMemo(() => {
    const activity: Record<string, number> = {}
    watchLogs.forEach(log => {
      const dateKey = log.watched_at.split('T')[0]
      activity[dateKey] = (activity[dateKey] || 0) + 1 + log.rewatch_count
    })
    return activity
  }, [watchLogs])
}

export function useDynamicStats() {
  const watchLogs = useStore(state => state.watchLogs)
  const personalRatings = useStore(state => state.personalRatings)
  const { allKnownTitles } = useAllKnownTitles()

  const dynamicAverageRating = useMemo(() => {
    const ratingsArray = Object.values(personalRatings)
    return ratingsArray.length > 0
      ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
      : undefined
  }, [personalRatings])

  return useMemo(() => {
    let totalFilms = 0
    let totalSeries = 0
    let watchMinutes = 0
    
    const genreCounts: Record<string, number> = {}
    const directorCounts: Record<string, number> = {}
    const actorCounts: Record<string, number> = {}
    const eraCounts: Record<string, number> = {}
    const monthlyCounts: Record<string, number> = {}
    let watchesThisYear = 0
    let watchesThisMonth = 0

    const today = new Date('2026-06-16')
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const uniqueTitleIds = new Set<string>()

    watchLogs.forEach(log => {
      const title = allKnownTitles.get(log.title_id)
      const watches = 1 + log.rewatch_count
      
      if (!uniqueTitleIds.has(log.title_id)) {
        uniqueTitleIds.add(log.title_id)
        if (title) {
          if (title.type === 'film') totalFilms++
          if (title.type === 'series') totalSeries++
        }
      }

      if (title) {
        if (title.runtime_minutes) {
          watchMinutes += (title.runtime_minutes * watches)
        }

        title.genres.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + watches
        })

        if (title.director) {
          directorCounts[title.director] = (directorCounts[title.director] || 0) + watches
        }

        title.cast.forEach(actor => {
          actorCounts[actor] = (actorCounts[actor] || 0) + watches
        })

        if (title.release_year) {
          const decade = Math.floor(title.release_year / 10) * 10
          const eraStr = `${decade.toString().slice(-2)}s`
          eraCounts[eraStr] = (eraCounts[eraStr] || 0) + watches
        }
      }

      const d = new Date(log.watched_at)
      if (d.getFullYear() === currentYear) {
        watchesThisYear += watches
        if (d.getMonth() === currentMonth) {
          watchesThisMonth += watches
        }
      }

      const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + watches
    })

    const favorite_genres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const favorite_directors = Object.entries(directorCounts)
      .map(([director, count]) => ({ director, count, avatar_url: undefined }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const favorite_actors = Object.entries(actorCounts)
      .map(([name, count]) => ({ name, count, avatar_url: undefined }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const era_distribution = Object.entries(eraCounts)
      .map(([era, count]) => ({ era, count }))
      .sort((a, b) => a.era.localeCompare(b.era))

    const monthly_activity = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthly_activity.push({ month: monthKey, count: monthlyCounts[monthKey] || 0 })
    }

    return {
      total_films: totalFilms,
      total_series: totalSeries,
      total_watch_hours: Math.floor(watchMinutes / 60),
      average_rating: dynamicAverageRating,
      favorite_genres,
      favorite_directors,
      favorite_actors,
      era_distribution,
      monthly_activity,
      watches_this_year: watchesThisYear,
      watches_this_month: watchesThisMonth,
    }
  }, [watchLogs, allKnownTitles, dynamicAverageRating])
}

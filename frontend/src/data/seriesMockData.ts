export interface EpisodeMetadata {
  episode_number: number
  title: string
  runtime_minutes: number
}

export interface SeasonMetadata {
  season_number: number
  title: string
  episodes: EpisodeMetadata[]
}

export interface SeriesMetadata {
  title_id: string
  seasons: SeasonMetadata[]
}

export const seriesMockData: Record<string, SeriesMetadata> = {
  t4: {
    title_id: 't4',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          { episode_number: 1, title: 'Pilot', runtime_minutes: 58 },
          { episode_number: 2, title: "Cat's in the Bag...", runtime_minutes: 48 },
          { episode_number: 3, title: "...And the Bag's in the River", runtime_minutes: 48 },
          { episode_number: 4, title: 'Cancer Man', runtime_minutes: 48 },
          { episode_number: 5, title: 'Gray Matter', runtime_minutes: 48 },
          { episode_number: 6, title: "Crazy Handful of Nothin'", runtime_minutes: 48 },
          { episode_number: 7, title: 'A No-Rough-Stuff-Type Deal', runtime_minutes: 47 },
        ],
      },
      {
        season_number: 2,
        title: 'Season 2',
        episodes: [
          { episode_number: 1, title: 'Seven Thirty-Seven', runtime_minutes: 47 },
          { episode_number: 2, title: 'Grilled', runtime_minutes: 48 },
          { episode_number: 3, title: 'Bit by a Dead Bee', runtime_minutes: 47 },
          { episode_number: 4, title: 'Down', runtime_minutes: 47 },
          { episode_number: 5, title: 'Breakage', runtime_minutes: 47 },
          { episode_number: 6, title: 'Peekaboo', runtime_minutes: 47 },
          { episode_number: 7, title: 'Negro y Azul', runtime_minutes: 47 },
          { episode_number: 8, title: 'Better Call Saul', runtime_minutes: 47 },
          { episode_number: 9, title: '4 Days Out', runtime_minutes: 47 },
          { episode_number: 10, title: 'Over', runtime_minutes: 47 },
          { episode_number: 11, title: 'Mandala', runtime_minutes: 47 },
          { episode_number: 12, title: 'Phoenix', runtime_minutes: 47 },
          { episode_number: 13, title: 'ABQ', runtime_minutes: 47 },
        ],
      },
    ],
  },
  t8: {
    title_id: 't8',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          { episode_number: 1, title: 'Winter Is Coming', runtime_minutes: 62 },
          { episode_number: 2, title: 'The Kingsroad', runtime_minutes: 56 },
          { episode_number: 3, title: 'Lord Snow', runtime_minutes: 58 },
          { episode_number: 4, title: 'Cripples, Bastards, and Broken Things', runtime_minutes: 56 },
          { episode_number: 5, title: 'The Wolf and the Lion', runtime_minutes: 54 },
          { episode_number: 6, title: 'A Golden Crown', runtime_minutes: 53 },
          { episode_number: 7, title: 'You Win or You Die', runtime_minutes: 58 },
          { episode_number: 8, title: 'The Pointy End', runtime_minutes: 59 },
          { episode_number: 9, title: 'Baelor', runtime_minutes: 57 },
          { episode_number: 10, title: 'Fire and Blood', runtime_minutes: 53 },
        ],
      },
      {
        season_number: 2,
        title: 'Season 2',
        episodes: [
          { episode_number: 1, title: 'The North Remembers', runtime_minutes: 53 },
          { episode_number: 2, title: 'The Night Lands', runtime_minutes: 54 },
          { episode_number: 3, title: 'What Is Dead May Never Die', runtime_minutes: 53 },
          { episode_number: 4, title: 'Garden of Bones', runtime_minutes: 51 },
          { episode_number: 5, title: 'The Ghost of Harrenhal', runtime_minutes: 54 },
          { episode_number: 6, title: 'The Old Gods and the New', runtime_minutes: 54 },
          { episode_number: 7, title: 'A Man Without Honor', runtime_minutes: 56 },
          { episode_number: 8, title: 'The Prince of Winterfell', runtime_minutes: 54 },
          { episode_number: 9, title: 'Blackwater', runtime_minutes: 55 },
          { episode_number: 10, title: 'Valar Morghulis', runtime_minutes: 64 },
        ],
      },
    ],
  },
}

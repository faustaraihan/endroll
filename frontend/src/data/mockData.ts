import type { Title, WatchLog, WatchlistItem, UserProfile, UserStats, Streak, Collection, CollectionItem } from '../types'

// ---------------------------------------------------------------------------
// Mock Titles
// ---------------------------------------------------------------------------
export const mockTitles: Title[] = [
  {
    id: 't1',
    tmdb_id: 496243,
    title: 'Parasite',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    release_year: 2019,
    runtime_minutes: 132,
    genres: ['Thriller', 'Drama', 'Comedy'],
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    overview:
      'The impoverished Kim family devises a scheme to become employed by the wealthy Park family and infiltrate their lives.',
  },
  {
    id: 't2',
    tmdb_id: 238,
    title: 'The Godfather',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    release_year: 1972,
    runtime_minutes: 175,
    genres: ['Drama', 'Crime'],
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    overview:
      'Don Vito Corleone, head of a fictional criminal dynasty, transfers control to his reluctant son Michael as powerful enemies close in.',
  },
  {
    id: 't3',
    tmdb_id: 603,
    title: 'The Matrix',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    release_year: 1999,
    runtime_minutes: 136,
    genres: ['Action', 'Sci-Fi'],
    director: 'The Wachowskis',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    overview:
      'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  },
  {
    id: 't4',
    tmdb_id: 1396,
    title: 'Breaking Bad',
    type: 'series',
    poster_path: 'https://image.tmdb.org/t/p/w500/zzWGRw277MNoCs3zhyG3YmYQsXv.jpg',
    release_year: 2008,
    runtime_minutes: 47,
    genres: ['Drama', 'Crime', 'Thriller'],
    director: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    overview:
      'A high school chemistry teacher diagnosed with lung cancer turns to manufacturing methamphetamine with a former student.',
  },
  {
    id: 't5',
    tmdb_id: 299536,
    title: 'Avengers: Infinity War',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    release_year: 2018,
    runtime_minutes: 149,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    director: 'Anthony Russo, Joe Russo',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
    overview:
      'The Avengers join forces to stop Thanos from collecting all six Infinity Stones and wiping out half of all life in the universe.',
  },
  {
    id: 't6',
    tmdb_id: 550,
    title: 'Fight Club',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    release_year: 1999,
    runtime_minutes: 139,
    genres: ['Drama', 'Thriller'],
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    overview:
      'An insomniac office worker and a charismatic soap salesman form an underground fight club that evolves into something far more dangerous.',
  },
  {
    id: 't7',
    tmdb_id: 157336,
    title: 'Interstellar',
    type: 'film',
    poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    release_year: 2014,
    runtime_minutes: 169,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    overview:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
  },
  {
    id: 't8',
    tmdb_id: 1399,
    title: 'Game of Thrones',
    type: 'series',
    poster_path: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    release_year: 2011,
    runtime_minutes: 60,
    genres: ['Drama', 'Fantasy', 'Adventure'],
    director: 'David Benioff, D.B. Weiss',
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage'],
    overview:
      'Nine noble families fight for control of the mythical land of Westeros, while an ancient enemy awakens in the frozen north.',
  },
]

// ---------------------------------------------------------------------------
// Mock User
// ---------------------------------------------------------------------------
export const mockUser: UserProfile = {
  id: 'u1',
  email: 'fausta@example.com',
  username: 'Fausta',
  bio: 'Obsessed with 90s neo-noir and slow cinema.',
  avatar_url: undefined,
  created_at: '2026-01-15T10:00:00Z',
  preferences: {
    favorite_genres: ['Drama', 'Thriller', 'Sci-Fi'],
    theme: 'dark',
    notifications_enabled: true,
    rating_step: 0.5,
    start_of_week: 'Monday',
    favorites_board: ['t1', 't6', 't7'],
  },
}

// ---------------------------------------------------------------------------
// Mock Personal Ratings (Title ID -> Rating)
// ---------------------------------------------------------------------------
export const mockPersonalRatings: Record<string, number> = {
  t1: 9.5, // Parasite
  t7: 9.0, // Interstellar
  t6: 8.5, // Fight Club
  t4: 10.0, // Breaking Bad
  t3: 8.0, // The Matrix
  t2: 9.5, // The Godfather
}

// ---------------------------------------------------------------------------
// Mock Watch Logs
// ---------------------------------------------------------------------------
export const mockWatchLogs: WatchLog[] = [
  {
    id: 'wl1',
    user_id: 'u1',
    title_id: 't1',
    title: mockTitles[0],
    watched_at: '2026-05-28',
    notes:
      'An extraordinary film. Bong Joon-ho is a genius at delivering social critique through a gripping thriller.',
    rewatch_count: 1,
  },
  {
    id: 'wl2',
    user_id: 'u1',
    title_id: 't7',
    title: mockTitles[6],
    watched_at: '2026-05-20',
    notes: 'Nolan at his creative peak. Stunning visuals and an epic Hans Zimmer score.',
    rewatch_count: 0,
  },
  {
    id: 'wl3',
    user_id: 'u1',
    title_id: 't6',
    title: mockTitles[5],
    watched_at: '2026-05-10',
    notes: 'The twist ending still catches me off guard even on the second rewatch.',
    rewatch_count: 1,
  },
  {
    id: 'wl4',
    user_id: 'u1',
    title_id: 't4',
    title: mockTitles[3],
    watched_at: '2026-04-25',
    notes:
      'The best series I\'ve ever watched. Walter White\'s character development is an absolute masterpiece.',
    rewatch_count: 0,
    season_number: 1,
  },
  {
    id: 'wl5',
    user_id: 'u1',
    title_id: 't3',
    title: mockTitles[2],
    watched_at: '2026-04-15',
    notes: 'Still incredibly relevant today. The bullet-time sequence is iconic.',
    rewatch_count: 2,
  },
  {
    id: 'wl6',
    user_id: 'u1',
    title_id: 't2',
    title: mockTitles[1],
    watched_at: '2026-03-20',
    notes: 'A classic you have to watch. Marlon Brando is perfect in every frame.',
    rewatch_count: 0,
  },
]

// ---------------------------------------------------------------------------
// Mock Watchlist
// ---------------------------------------------------------------------------
export const mockWatchlist: WatchlistItem[] = [
  {
    id: 'wi1',
    user_id: 'u1',
    title_id: 't5',
    title: mockTitles[4],
    added_at: '2026-05-01',
    priority: 1,
  },
  {
    id: 'wi2',
    user_id: 'u1',
    title_id: 't8',
    title: mockTitles[7],
    added_at: '2026-04-10',
    priority: 2,
  },
]

// ---------------------------------------------------------------------------
// Mock Streak
// ---------------------------------------------------------------------------
export const mockStreak: Streak = {
  id: 's1',
  user_id: 'u1',
  current_streak_weeks: 8,
  longest_streak_weeks: 12,
  last_log_week: '2026-W22',
}

// ---------------------------------------------------------------------------
// Mock Daily Activity (for GitHub-style heatmap)
// Generate 90 days of activity data ending today
// ---------------------------------------------------------------------------
function generateDailyActivity(): Record<string, number> {
  const activity: Record<string, number> = {}
  const today = new Date('2026-06-16')
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    // Simulate realistic watch activity: ~35% days have watches
    const rand = Math.random()
    if (rand < 0.05) activity[key] = 3       // watched 3+
    else if (rand < 0.12) activity[key] = 2  // watched 2
    else if (rand < 0.35) activity[key] = 1  // watched 1
    // else 0 (no activity)
  }
  // Force some recent activity to match the streak and recent logs
  activity['2026-06-16'] = 2
  activity['2026-06-15'] = 1
  activity['2026-06-12'] = 1
  activity['2026-06-08'] = 1
  activity['2026-06-02'] = 1
  activity['2026-05-28'] = 2
  activity['2026-05-25'] = 1
  activity['2026-05-20'] = 3
  activity['2026-05-10'] = 1
  activity['2026-04-25'] = 2
  activity['2026-04-15'] = 1
  activity['2026-03-20'] = 1
  return activity
}
export const mockDailyActivity = generateDailyActivity()

// ---------------------------------------------------------------------------
// Mock Stats
// ---------------------------------------------------------------------------
export const mockStats: UserStats = {
  total_films: 142,
  total_series: 18,
  total_watch_hours: 384,
  average_rating: 4.2,
  favorite_genres: [
    { genre: 'Thriller', count: 42 },
    { genre: 'Drama', count: 38 },
    { genre: 'Sci-Fi', count: 24 },
    { genre: 'Horror', count: 12 },
  ],
  favorite_directors: [
    { director: 'Denis Villeneuve', count: 8, avatar_url: 'https://image.tmdb.org/t/p/w185/8xtLh9TL4v1DZuGHFoKRCjYJMlH.jpg' },
    { director: 'David Fincher', count: 7, avatar_url: 'https://image.tmdb.org/t/p/w185/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg' },
    { director: 'Céline Sciamma', count: 5, avatar_url: undefined },
  ],
  watches_this_year: 38,
  watches_this_month: 5,
  era_distribution: [
    { era: '70s', count: 8 },
    { era: '80s', count: 12 },
    { era: '90s', count: 31 },
    { era: '00s', count: 45 },
    { era: '10s', count: 46 },
  ],
  favorite_actors: [
    { name: 'Timothée Chalamet', count: 12, avatar_url: 'https://image.tmdb.org/t/p/w185/oq657rL4v8eY56Y645K53846664d.jpg' },
    { name: 'Florence Pugh', count: 9, avatar_url: 'https://image.tmdb.org/t/p/w185/k4Z82pS8s4fR6y0e9gY97k4l1n2.jpg' },
    { name: 'Saoirse Ronan', count: 7, avatar_url: undefined },
  ],
  monthly_activity: [
    { month: 'Jun 25', count: 12 },
    { month: 'Jul 25', count: 15 },
    { month: 'Aug 25', count: 8 },
    { month: 'Sep 25', count: 18 },
    { month: 'Oct 25', count: 14 },
    { month: 'Nov 25', count: 20 },
    { month: 'Dec 25', count: 25 },
    { month: 'Jan 26', count: 10 },
    { month: 'Feb 26', count: 16 },
    { month: 'Mar 26', count: 22 },
    { month: 'Apr 26', count: 18 },
    { month: 'May 26', count: 28 },
  ],
}

// ---------------------------------------------------------------------------
// Mock TMDb Search Results
// ---------------------------------------------------------------------------
export const mockSearchResults = [
  {
    tmdb_id: 496243,
    title: 'Parasite',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    release_year: 2019,
    overview: 'The impoverished Kim family devises a scheme to infiltrate the wealthy Park family.',
    genres: ['Thriller', 'Drama'],
  },
  {
    tmdb_id: 27205,
    title: 'Inception',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    release_year: 2010,
    overview: 'A thief who steals secrets through dream-sharing technology.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
  },
  {
    tmdb_id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    release_year: 2001,
    overview: 'Young Hobbit Frodo Baggins must carry the One Ring across Middle-earth to the fires of Mount Doom.',
    genres: ['Adventure', 'Fantasy'],
  },
  {
    tmdb_id: 19404,
    title: 'Dilwale Dulhania Le Jayenge',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
    release_year: 1995,
    overview: 'A classic Bollywood film about love, family, and belonging.',
    genres: ['Romance', 'Drama'],
  },
  {
    tmdb_id: 1399,
    title: 'Game of Thrones',
    type: 'series' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    release_year: 2011,
    overview: 'Nine noble families fight for control of the mythical land of Westeros.',
    genres: ['Drama', 'Fantasy'],
  },
  {
    tmdb_id: 1396,
    title: 'Breaking Bad',
    type: 'series' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/zzWGRw277MNoCs3zhyG3YmYQsXv.jpg',
    release_year: 2008,
    overview: 'A high school chemistry teacher turns to manufacturing methamphetamine.',
    genres: ['Drama', 'Crime'],
  },
]

// ---------------------------------------------------------------------------
// Mock Explore Lists
// ---------------------------------------------------------------------------
export const mockTrendingThisWeek = [
  {
    tmdb_id: 823464,
    title: 'Godzilla x Kong: The New Empire',
    type: 'film' as const,
    poster_path: 'https://wsrv.nl/?url=image.tmdb.org/t/p/w500/bxi2geLM6Hj5RwBNxl58A406zoB.jpg',
    release_year: 2024,
    overview: 'Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
  },
  {
    tmdb_id: 653346,
    title: 'Kingdom of the Planet of the Apes',
    type: 'film' as const,
    poster_path: 'https://wsrv.nl/?url=image.tmdb.org/t/p/w500/gKkl37Ep4Jk7yQ36SSrK7J6VCrj.jpg',
    release_year: 2024,
    overview: 'Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything.',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
  },
  {
    tmdb_id: 937278,
    title: 'A Quiet Place: Day One',
    type: 'film' as const,
    poster_path: 'https://wsrv.nl/?url=image.tmdb.org/t/p/w500/yrp107n1j145tWqcxFzwn4gvG8v.jpg',
    release_year: 2024,
    overview: 'Experience the day the world went quiet.',
    genres: ['Horror', 'Sci-Fi', 'Thriller'],
  },
  {
    tmdb_id: 1022789,
    title: 'Inside Out 2',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmFJj4j4t4efcl4Hj.jpg',
    release_year: 2024,
    overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!",
    genres: ['Animation', 'Comedy', 'Family'],
  },
  {
    tmdb_id: 762441,
    title: 'A Quiet Place Part II',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/4q2hz2m8hub4D50Hz4R6Jd2J85r.jpg',
    release_year: 2020,
    overview: 'Following the events at home, the Abbott family must now face the terrors of the outside world.',
    genres: ['Horror', 'Sci-Fi', 'Thriller'],
  },
  {
    tmdb_id: 573435,
    title: 'Spider-Man: Beyond the Spider-Verse',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/8tK53T71pE1Hk4Gle80yD770T0g.jpg',
    release_year: 2025,
    overview: "The spectacular conclusion to Miles Morales' multiversal journey.",
    genres: ['Animation', 'Action', 'Sci-Fi'],
  }
]

export const mockNowPlaying = [
  {
    tmdb_id: 693134,
    title: 'Dune: Part Two',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/czembw72Gj4y7VwnRUXRz5C61wI.jpg',
    release_year: 2024,
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.',
    genres: ['Sci-Fi', 'Adventure'],
  },
  {
    tmdb_id: 1022796,
    title: 'Challengers',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/872k44nZ2n4CY6tJ4v9v4v7m1n.jpg',
    release_year: 2024,
    overview: 'Three players who knew each other when they were teenagers compete in a tennis tournament.',
    genres: ['Drama', 'Romance'],
  },
  {
    tmdb_id: 786892,
    title: 'Furiosa: A Mad Max Saga',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/iADOOC62nwjoPLY6Fr271ZhTJD6.jpg',
    release_year: 2024,
    overview: 'The origin story of renegade warrior Furiosa before her encounter and team-up with Mad Max.',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
  },
  {
    tmdb_id: 967847,
    title: 'Ghostbusters: Frozen Empire',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/5v5a19clV0H51g71t6Wc9ZqV5sK.jpg',
    release_year: 2024,
    overview: 'The Spengler family returns to where it all started – the iconic New York City firehouse.',
    genres: ['Adventure', 'Fantasy', 'Comedy'],
  },
  {
    tmdb_id: 872585,
    title: 'Oppenheimer',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/8Gxv2wSbsysmtJd7zvcglRTee1q.jpg',
    release_year: 2023,
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.",
    genres: ['Drama', 'History'],
  }
]

export const mockTopRatedClassics = [
  {
    tmdb_id: 278,
    title: 'The Shawshank Redemption',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/9cqN02USHw21bsnmwV1kclTIJbY.jpg',
    release_year: 1994,
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, Andy Dufresne begins a new life.',
    genres: ['Drama', 'Crime'],
  },
  {
    tmdb_id: 238,
    title: 'The Godfather',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    release_year: 1972,
    overview: 'Don Vito Corleone transfers control to his reluctant son Michael.',
    genres: ['Drama', 'Crime'],
  },
  {
    tmdb_id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOo2asL6r09j4lWLOj2K.jpg',
    release_year: 2003,
    overview: 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor.',
    genres: ['Adventure', 'Fantasy', 'Action'],
  },
  {
    tmdb_id: 680,
    title: 'Pulp Fiction',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/d5iIlvfjmjeO02xyR0ee4zbeOI1.jpg',
    release_year: 1994,
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge.",
    genres: ['Thriller', 'Crime'],
  },
  {
    tmdb_id: 424,
    title: "Schindler's List",
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/sF1U4EUgIXTv3hcgz1gr0QR60zM.jpg',
    release_year: 1993,
    overview: 'The true story of Oskar Schindler who saved over 1,100 Jews during the Holocaust.',
    genres: ['Drama', 'History'],
  }
]

export const mockUpcomingClassics = [
  {
    tmdb_id: 615656,
    title: 'Gladiator II',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/h43TfJ7sL0Ld87tD7XFpB7T5R.jpg',
    release_year: 2024,
    overview: 'Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum.',
    genres: ['Action', 'Drama', 'Adventure'],
  },
  {
    tmdb_id: 533535,
    title: 'Deadpool & Wolverine',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/8cdWv6G3hSTFjclvSCkG54w4asS.jpg',
    release_year: 2024,
    overview: 'A listless Wade Wilson toils in civilian life. Deadpool must team up with Wolverine.',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
  },
  {
    tmdb_id: 698687,
    title: 'Nosferatu',
    type: 'film' as const,
    poster_path: 'https://image.tmdb.org/t/p/w500/NosferatuPosterPlaceholder.jpg',
    release_year: 2024,
    overview: 'A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her.',
    genres: ['Horror', 'Fantasy', 'Drama'],
  }
]

// ---------------------------------------------------------------------------
// Genres for Onboarding Taste Profiling
// ---------------------------------------------------------------------------

export const allGenres = [
  'Drama',
  'Thriller',
  'Comedy',
  'Action',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Documentary',
  'Animation',
  'Fantasy',
  'Crime',
  'Adventure',
  'Mystery',
  'Historical',
  'Musical',
]

// ---------------------------------------------------------------------------
// Mock Collections and Collection Items
// ---------------------------------------------------------------------------
export const mockCollections: Collection[] = [
  {
    id: 'col-favorites',
    user_id: 'u1',
    name: 'Favorites',
    description: 'All-time favorite movies and series.',
    is_private: false,
    created_at: '2026-05-01T10:00:00Z',
    items_count: 4,
    cover_title_id: 't1',
    cover_title: mockTitles[0], // Parasite
  },
  {
    id: 'col-scifi',
    user_id: 'u1',
    name: 'Sci-Fi Essentials',
    description: 'Mind-bending sci-fi masterpieces.',
    is_private: false,
    created_at: '2026-05-15T12:00:00Z',
    items_count: 3,
    cover_title_id: 't7',
    cover_title: mockTitles[6], // Interstellar
  },
]

export const mockCollectionItems: CollectionItem[] = [
  {
    id: 'ci1',
    collection_id: 'col-favorites',
    title_id: 't1',
    title: mockTitles[0],
    sort_order: 0,
    added_at: '2026-05-28T15:00:00Z',
  },
  {
    id: 'ci2',
    collection_id: 'col-favorites',
    title_id: 't2',
    title: mockTitles[1],
    sort_order: 1,
    added_at: '2026-05-28T15:02:00Z',
  },
  {
    id: 'ci3',
    collection_id: 'col-favorites',
    title_id: 't6',
    title: mockTitles[5],
    sort_order: 2,
    added_at: '2026-05-28T15:04:00Z',
  },
  {
    id: 'ci4',
    collection_id: 'col-favorites',
    title_id: 't4',
    title: mockTitles[3],
    sort_order: 3,
    added_at: '2026-05-28T15:05:00Z',
  },
  {
    id: 'ci5',
    collection_id: 'col-scifi',
    title_id: 't7',
    title: mockTitles[6],
    sort_order: 0,
    added_at: '2026-05-20T11:00:00Z',
  },
  {
    id: 'ci6',
    collection_id: 'col-scifi',
    title_id: 't3',
    title: mockTitles[2],
    sort_order: 1,
    added_at: '2026-05-20T11:10:00Z',
  },
  {
    id: 'ci7',
    collection_id: 'col-scifi',
    title_id: 't5',
    title: mockTitles[4],
    sort_order: 2,
    added_at: '2026-05-20T11:12:00Z',
  },
]

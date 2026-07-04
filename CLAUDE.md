# CLAUDE.md

## Project Identity

**Endroll** is a personal film & series journal.

Tagline: **Your personal film & series journal**

Endroll is a private-first, personal, calm, cinematic journaling product. It helps users log what they watch, write personal notes, give nuanced ratings, organize watch history, and rediscover viewing memories through stats and reflective features.

This project is based on `endroll_PRD_v1.1.md`.

## Non-Negotiable Product Direction

Endroll is:

- A diary
- A personal archive
- A film & series journal
- Mobile-first web app
- Privacy-first by default
- Calm, cinematic, nostalgic

Endroll is not:

- A social network
- A Letterboxd clone with feed/likes/followers
- A public review platform
- A viral engagement product
- A daily habit tracker
- A generic media tracker for books, music, podcasts, or games

Do not add social-pressure features unless explicitly requested.

## Current Product Version

PRD version: **v1.1 — Juni 2026**

Important v1.1 changes:

- Supports both films and series.
- Main content table is `titles`, not `movies`.
- `titles.type` supports `film` and `series`.
- Rating is decimal `0.0–10.0`.
- Streak is weekly, not daily.
- Accessibility is part of core requirements.
- Error handling and onboarding are explicitly defined.

## Product Priorities

### P0 — MVP Core

Prioritize these features first:

1. Auth via email and Google OAuth
2. User account and personal profile
3. TMDb search and add
4. Manual film/series entry fallback
5. Diary/watch log
6. Decimal rating and private notes
7. Watchlist
8. Basic profile stats
9. Mobile-first responsive UI
10. Error handling
11. Accessibility basics

### P1 — Launch Important

Build after P0 is stable:

1. Weekly streak
2. Collections
3. Personal statistics dashboard
4. Mood/context tags
5. Rewatch tracking
6. Director and actor tracking

### P2 — Polish

Build after core engagement is working:

1. Wrapped tahunan
2. On This Day
3. Watchlist expiry
4. Custom list sorting
5. Letterboxd CSV import
6. Visual themes
7. Milestones and badges

### P3 — Long-Term Roadmap

Do not build early unless explicitly requested:

1. Shared collections
2. AI recommendations
3. Export data
4. Native mobile app
5. Smart notifications

## Tech Stack

Recommended default stack:

```txt
Frontend      : Vite + React
Styling       : Tailwind CSS + Framer Motion
Backend       : Express.js
Database      : PostgreSQL via Supabase
ORM           : Prisma
Auth          : NextAuth.js or Supabase Auth
File Storage  : Supabase Storage or Cloudflare R2
Film Data API : TMDb API
Hosting       : Vercel, Railway, Render
Monitoring    : Sentry + Vercel Analytics
```

Use alternatives only when there is a clear reason.

## Naming Conventions

Use product-aligned naming:

- `Title`, not only `Movie`
- `WatchLog`
- `WatchlistItem`
- `Collection`
- `CollectionItem`
- `Streak`
- `MoodTag`
- `UserProfile`

Database naming:

- `titles`, not `movies`
- `title_id`, not `movie_id`
- `cover_title_id`, not `cover_movie_id`
- `current_streak_weeks`, not `current_streak_days`
- `last_log_week`, not `last_watch_date` for weekly streak state

## Database Requirements

Core tables:

```txt
users
  id
  email
  username
  avatar_url
  created_at
  preferences JSONB

titles
  id
  tmdb_id
  title
  type film|series
  poster_path
  release_year
  runtime_minutes
  genres array
  director
  cast array

watch_logs
  id
  user_id
  title_id
  watched_at
  rating DECIMAL(3,1) nullable
  notes nullable
  rewatch_count
  mood_tags array

watchlist
  id
  user_id
  title_id
  added_at
  priority

collections
  id
  user_id
  name
  description
  cover_title_id
  is_private
  created_at

collection_items
  id
  collection_id
  title_id
  sort_order
  added_at

streaks
  id
  user_id
  current_streak_weeks
  longest_streak_weeks
  last_log_week
```

## Rating System

Use decimal rating, not only stars.

Rules:

- Range: `0.0` to `10.0`
- Precision: one decimal
- UI snap: nearest `0.5`
- Storage: `DECIMAL(3,1)`
- Rating is optional
- Average rating excludes unrated entries
- Display large number, e.g. `8.7`, with decimal visually smaller if desired

## Weekly Streak System

Endroll uses weekly streak because it is a film journal, not a daily habit tracker.

Rules:

- Week is Monday–Sunday.
- User needs at least one valid log per calendar week.
- Grace period lasts until end of Monday in the following week.
- Rewatch is valid.
- Retroactive logging cannot revive a broken streak.

Avoid daily streak mechanics.

## Onboarding Flow

Build onboarding around one goal: user logs at least 1 film before leaving.

Steps:

1. Splash screen with one CTA: `Mulai`
2. Register/login via email or Google OAuth
3. Username setup
4. Taste profiling with genre multi-select, skippable
5. First film search via TMDb or manual add
6. Quick log: rating and optional note
7. First dashboard with immediate stats and streak started

Avoid long forms and unnecessary setup before the first log.

## Error Handling Rules

### TMDb title not found

Show:

> Tidak ada hasil untuk [query].

Offer manual add.

### TMDb timeout or API down

- Timeout threshold: more than 5 seconds.
- Try local database cache first.
- Show degraded notice:

> Pencarian film sedang lambat.

Logging should still be possible.

### Duplicate diary entry

If user logs a title already in diary, show:

> Kamu sudah mencatat [Film] pada [tanggal]. Ini rewatch baru, atau ingin mengedit catatan lama?

Actions:

- Catat sebagai rewatch baru
- Edit catatan lama
- Batal

### Watchlist item logged

- Remove from watchlist automatically.
- Show toast:

> [Film] dipindahkan dari watchlist ke diary.

### Session expired while writing notes

- Save draft to `localStorage`.
- Redirect to login.
- Restore draft after login.
- Show toast:

> Catatan kamu tersimpan sementara.

### Poster failed to load

Show placeholder:

- Initials from title
- Color generated from title hash
- Should look curated, not broken

## Accessibility Requirements

Target: WCAG 2.1 AA.

Always check:

- Minimum text contrast 4.5:1
- Touch target minimum 44x44px
- Semantic HTML
- One `<h1>` per page
- Proper heading hierarchy
- Descriptive alt text for posters
- Visible focus indicator
- No color-only state communication
- Toast uses `role="status"` and `aria-live="polite"`
- Support `prefers-reduced-motion`

Example poster alt:

```html
<img src="..." alt="Poster film Parasite (2019)" />
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```

## UI / Visual Direction

Use:

- Warm-neutral near-black background (`--bg`), warm-grey text ramp
- A single refined gold accent (`--accent` ≈ `#d9a441`) — used sparingly
- Poster-first layout
- Serif typography for film titles/editorial moments
- Sans-serif typography for UI and body text
- Soft motion, never excessive
- Warm empty states

Avoid:

- Overly bright colors
- Generic dashboard look
- Social-media visual language
- Aggressive gamification
- Noisy animations
- Purple/violet and bright amber accents (legacy direction — superseded)

> **Palette note (decided Juni 2026):** The product owner chose a single
> warm-neutral + gold palette over the PRD's original purple/violet + amber.
> This is a deliberate deviation from `endroll_PRD_v1.1.md`. Tokens live in
> `frontend/src/index.css`; legacy `--color-violet-*` / `--color-amber-*`
> names are kept only as aliases pointing at the gold accent. Use `--accent`
> and the warm-neutral text/surface tokens for any new UI.

## Copywriting Tone

Tone should be:

- Calm
- Personal
- Slightly nostalgic
- Warm
- Clear
- Encouraging without pressure

Avoid:

- Hype language
- Growth-hacking copy
- Shame-based streak reminders
- Robotic empty states

Good empty state:

> Belum ada film di sini. Film apa yang terakhir kamu tonton?

Bad empty state:

> No data available.

## Engineering Practices

When implementing or editing code:

1. Read the relevant product requirement before coding.
2. Keep components small and composable.
3. Prefer explicit readable code over clever abstractions.
4. Add loading, empty, error, and success states.
5. Validate user input both client-side and server-side.
6. Keep privacy defaults conservative.
7. Do not introduce new major dependencies without justification.
8. Cache TMDb title data locally after first fetch.
9. Keep manual title fallback available.
10. Write code that is easy to continue by a solo developer.

## AI Assistant Behavior

When Claude is asked to help in this repo:

- Converse with the user in Indonesian by default unless asked otherwise.
- **Product UI copy is written in English** (deliberate owner decision, Juni
  2026). Write all in-app strings, labels, and toasts in English — even though
  some PRD examples are in Indonesian. PRD Indonesian copy is illustrative of
  tone, not the literal target language.
- Prioritize PRD alignment over speculative features.
- Mention tradeoffs when suggesting architecture changes.
- Ask for clarification only when the ambiguity blocks implementation.
- Do not silently change product direction.
- For code generation, provide complete file-level examples when possible.
- For UI generation, preserve Endroll’s calm, personal, cinematic brand.

## Important Product Constraints

Do not implement these in v1.0 unless explicitly requested:

- Public social feed
- Like counts
- Followers
- Public review ranking
- AI recommendation engine
- Native mobile app
- Offline-first PWA
- Podcast/book/music tracking
- Monetization/paywall

## Source of Truth

Use this priority order when resolving ambiguity:

1. `endroll_PRD_v1.1.md`
2. This `CLAUDE.md`
3. Existing codebase conventions
4. User’s latest explicit instruction

If there is a conflict, explain it before changing direction.

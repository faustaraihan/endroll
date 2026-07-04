# GEMINI.md

## Project Context

You are working on **Endroll**, a privacy-first personal film & series journal.

Endroll is not a social platform. It is a calm, personal, nostalgic journaling app for people who want to log what they watch, remember how they felt, organize their watch history, and see meaningful personal stats without social pressure.

Primary product reference: `endroll_PRD_v1.1.md`.

## Product Principles

### 1. Personal over social

- Do not introduce feeds, likes, follower counts, public pressure, or engagement-bait mechanics.
- Public sharing should not be assumed.
- User data is private by default.

### 2. Low friction, high reward

- Logging a film or series should feel fast and satisfying.
- Target logging time: under 30 seconds for a basic entry.
- Reward users with useful stats, beautiful visuals, and gentle memory-based features.

### 3. Calm, cinematic, nostalgic

- Avoid loud, hyperactive, gamified, or noisy UX.
- Copy should feel warm, personal, and reflective.
- Visual direction: dark cinematic background, deep purple/violet, warm amber accent, poster-first layout.

### 4. Data belongs to the user

- Do not lock user data inside the platform.
- Design with eventual export support in mind.
- Treat privacy and ownership as core values, not optional features.

## Product Scope

### MVP / P0

Build these first:

- Authentication via email and Google OAuth
- User account and personal profile
- Search film/series via TMDb
- Manual title entry fallback
- Diary logging with watched date, optional notes, and optional rating
- Decimal rating system from 0.0 to 10.0
- Watchlist: add, remove, mark as watched
- Basic profile stats
- Responsive web app, mobile-first
- Error handling for TMDb, auth, duplicate logs, network issues
- Accessibility basics: semantic HTML, alt text, visible focus, contrast, touch target

### P1

Build after MVP foundation is stable:

- Weekly streak
- Collections
- Personal statistics dashboard
- Mood/context tags
- Rewatch tracking
- Director and actor tracking from TMDb data
- Series Level 2 support: season-level logging

### P2 / P3

Do not prioritize unless explicitly requested:

- Wrapped tahunan
- On This Day
- Watchlist expiry
- Letterboxd CSV import
- Visual themes
- Milestones and badges
- Shared collections
- AI recommendations
- Native mobile app
- Smart notifications
- Full episode-level tracking UI

## Rating Rules

Endroll uses a decimal rating system:

- Range: `0.0` to `10.0`
- Stored as: `DECIMAL(3,1)`
- Rating is optional
- UI can use a horizontal slider or mobile tap-to-set
- Slider snaps to the nearest `0.5`
- Average rating excludes entries without ratings

Do not replace this with a 1–5 star-only rating system.

## Streak Rules

Endroll uses **weekly streak**, not daily streak.

Rules:

- One week = Monday to Sunday
- Streak increases if user logs at least one entry in a calendar week
- Grace period lasts until end of Monday in the next week
- Rewatch counts as valid streak entry
- Series episode counts as valid streak entry
- Retroactive logging does not revive a broken streak

Do not design streaks in a way that creates daily pressure.

## Series Tracking Rules

Endroll supports film and series through a shared `titles` model.

Series tracking levels:

- Level 1: show-level logging, default
- Level 2: season-level logging
- Level 3: episode-level logging, roadmap UI only

Database should be ready for Level 3 even if UI is not implemented yet.

Use:

- `titles.type` = `film` or `series`
- `watch_logs.season_number` optional
- `watch_logs.episode_number` optional

## Recommended Tech Stack

Follow this stack unless the user explicitly asks to change it:

- Frontend: Vite + React
- Styling: Tailwind CSS + Framer Motion
- Backend: Express.js
- Database: PostgreSQL via Supabase
- ORM: Prisma
- Auth: NextAuth.js or Supabase Auth
- Storage: Supabase Storage or Cloudflare R2
- Film Data API: TMDb API
- Hosting: Vercel for frontend, Railway/Render for backend if needed
- Monitoring: Sentry + Vercel Analytics

## Database Model Guidance

Core tables:

- `users`
- `titles`
- `watch_logs`
- `watchlist`
- `collections`
- `collection_items`
- `streaks`

Important naming:

- Use `titles`, not `movies`, because Endroll supports both film and series.
- Use `title_id`, not `movie_id`, in relations.
- Use `cover_title_id`, not `cover_movie_id`.

Suggested fields:

```txt
users:
  id, email, username, avatar_url, created_at, preferences JSONB

titles:
  id, tmdb_id, title, type, poster_path, release_year, runtime_minutes, genres, director, cast

watch_logs:
  id, user_id, title_id, watched_at, rating DECIMAL(3,1), notes, rewatch_count, mood_tags, season_number, episode_number

watchlist:
  id, user_id, title_id, added_at, priority

collections:
  id, user_id, name, description, cover_title_id, is_private, created_at

collection_items:
  id, collection_id, title_id, sort_order, added_at

streaks:
  id, user_id, current_streak_weeks, longest_streak_weeks, last_log_week
```

## UX and Copy Rules

### Empty states

Every empty state should be warm and encouraging.

Good:

> Belum ada film di sini. Film apa yang terakhir kamu tonton?

Avoid:

> No data found.

### Error messages

Error messages should be clear, calm, and actionable.

Examples:

- `Tidak ada hasil untuk [query].`
- `Pencarian film sedang lambat.`
- `Catatan kamu tersimpan sementara.`
- `[Film] dipindahkan dari watchlist ke diary.`

### Duplicate log flow

If a user logs a title already in diary, ask:

> Kamu sudah mencatat [Film] pada [tanggal]. Ini rewatch baru, atau ingin mengedit catatan lama?

Options:

- Catat sebagai rewatch baru
- Edit catatan lama
- Batal

## Accessibility Requirements

Target WCAG 2.1 AA.

Always implement:

- Semantic HTML
- One `<h1>` per page
- No heading level skip
- Descriptive poster alt text, e.g. `Poster film Parasite (2019)`
- Visible focus indicator
- Minimum touch target `44x44px`
- Contrast minimum 4.5:1
- Toast with `role="status"` and `aria-live="polite"`
- Do not rely on color alone for rating, streak, or badges
- Respect `prefers-reduced-motion`

## Engineering Rules

- Keep components small and focused.
- Prefer readable code over clever abstractions.
- Use clear naming based on product language: `Title`, `WatchLog`, `Watchlist`, `Collection`, `Streak`.
- Do not introduce social features unless explicitly requested.
- Do not change product scope without mentioning the tradeoff.
- Implement fallback states for loading, error, empty, and offline/network failure.
- Cache TMDb-fetched title data locally after first fetch.
- Allow manual title entry if TMDb fails or title is not found.

## Response Style for AI Assistance

When helping with this project:

- Answer in Indonesian unless the user asks otherwise.
- Be practical and implementation-oriented.
- Explain tradeoffs clearly.
- When giving code, prefer complete, copy-pasteable examples.
- When suggesting UX, keep Endroll’s calm and personal tone.
- When uncertain, refer back to `endroll_PRD_v1.1.md` as the source of truth.

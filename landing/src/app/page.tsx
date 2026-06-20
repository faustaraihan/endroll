"use client";
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Star,
  ArrowRight,
  Menu,
  X,
  Flame,
  Lock,
  LineChart,
  Feather,
  Clapperboard,
} from 'lucide-react'
import styles from './Landing.module.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'

const posters = [
  { t: 'Parasite', y: '2019', tone: 1 },
  { t: 'La Haine', y: '1995', tone: 2 },
  { t: 'In the Mood for Love', y: '2000', tone: 3 },
  { t: 'Stalker', y: '1979', tone: 4 },
  { t: 'Past Lives', y: '2023', tone: 5 },
  { t: 'There Will Be Blood', y: '2007', tone: 6 },
  { t: 'Perfect Days', y: '2023', tone: 7 },
  { t: 'Paris, Texas', y: '1984', tone: 8 },
]

const features = [
  {
    numeral: 'I',
    icon: Lock,
    title: 'Private by design',
    desc: 'No public feed, no performance, no audience. A quiet room for your cinematic memories — and only yours.',
  },
  {
    numeral: 'II',
    icon: LineChart,
    title: 'Watch your taste evolve',
    desc: 'Ratings, moods, and favourite genres drift over the years. Endroll keeps the receipts so you can look back.',
  },
  {
    numeral: 'III',
    icon: Feather,
    title: 'No social pressure',
    desc: 'No likes, no hot takes, no leaderboard. Write for yourself, in your own words, at your own pace.',
  },
]

const numbers = [
  { value: '142', label: 'Films logged' },
  { value: '38', label: 'Collections' },
  { value: '1.2k', label: 'Hours in the dark' },
  { value: '8.4', label: 'Average rating' },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll-reveal — additive, so content stays visible without JS or under
  // reduced-motion. We only opt-in to the hidden→shown animation here.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = pageRef.current
    if (prefersReduced || !root) return

    root.classList.add(styles.jsReveal)
    const targets = root.querySelectorAll(`[data-reveal]`)
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach(t => io.observe(t))
    return () => io.disconnect()
  }, [])

  return (
    <div className={styles.page} ref={pageRef}>
      {/* Cinematic overlays */}
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.glowTop} aria-hidden="true" />

      {/* Masthead dateline */}
      <div className={styles.dateline} aria-hidden="true">
        <span>A personal film journal</span>
        <span className={styles.datelineMid}>✦</span>
        <span>Est. MMXXVI</span>
      </div>

      {/* ── Header ── */}
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Endroll home">
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandName}>endroll</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          <a href="#archive" className={styles.navLink}>The journal</a>
          <a href="#features" className={styles.navLink}>Why Endroll</a>
          <a href="#preview" className={styles.navLink}>A look inside</a>
        </nav>

        <div className={styles.navActions}>
          <Link href={`${APP_URL}/home`} className="btn btn-ghost btn-sm">Login</Link>
          <Link href={`${APP_URL}/home`} className="btn btn-primary btn-sm">Start journaling</Link>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#archive" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>The journal</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>Why Endroll</a>
          <a href="#preview" onClick={() => setMobileMenuOpen(false)} className={styles.mobileMenuLink}>A look inside</a>
          <div className={styles.mobileMenuActions}>
            <Link href={`${APP_URL}/home`} className="btn btn-secondary text-center">Login</Link>
            <Link href={`${APP_URL}/home`} className="btn btn-primary text-center">Start journaling</Link>
          </div>
        </div>
      )}

      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroGlow1} aria-hidden="true" />
          <div className={styles.heroGlow2} aria-hidden="true" />
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.heroEyebrow}>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.heroStar} aria-hidden="true">✦</span>
              When the credits roll, the reflection begins.
            </p>
            <h1 className={styles.heroTitle}>
              Give every film<br />
              <span className={styles.heroAccent}>its endroll.</span>
            </h1>
            <p className={styles.heroSub}>
              Endroll is a calm, private place to log every film you watch,
              remember how it made you feel, and watch your taste reveal
              itself — reel by reel.
            </p>
            <div className={styles.heroActions}>
              <Link href={`${APP_URL}/home`} className="btn btn-primary btn-lg">
                Start journaling <ArrowRight size={18} />
              </Link>
              <Link href={`${APP_URL}/diary`} className={styles.heroGhost}>
                <Clapperboard size={17} /> See a demo
              </Link>
            </div>
            <p className={styles.heroNote}>No social feed. No followers. Just your films.</p>
          </div>

          {/* Hero visual — layered film cell + diary card */}
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualDeco}>
              <span className={styles.decoWatermark}>ARCHIVE</span>
              <span className={styles.decoLine} />
              <span className={styles.decoText}>MMXXVI</span>
            </div>
            <span className={styles.heroSprockets} />
            <div className={styles.posterFrame}>
              <span className={styles.posterRec}><i className={styles.recDot} /> REC</span>
              <div className={styles.posterArt}>
                <span className={styles.posterArtTitle}>PARASITE</span>
                <span className={styles.posterArtYear}>2019</span>
              </div>
              <span className={styles.posterTC}>00:142:07</span>
            </div>

            <article className={styles.frameCard}>
              <div className={styles.frameHead}>
                <div>
                  <span className={styles.frameKicker}>Diary · 142</span>
                  <h3 className={styles.frameTitle}>Interstellar</h3>
                  <span className={styles.frameMeta}>Nolan · 2014</span>
                </div>
                <span className={styles.ratingChip}>
                  <Star size={11} fill="currentColor" /> 9.4
                </span>
              </div>
              <p className={styles.frameQuote}>
                "No time for caution. The docking scene still makes my heart
                race, every single time."
              </p>
              <div className={styles.frameStars}>
                {[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} fill="currentColor" />)}
              </div>
            </article>
          </div>
        </section>

        {/* ── Poster wall ── */}
        <div className={styles.posterWall} aria-hidden="true">
          <div className={styles.posterTrack}>
            {[...posters, ...posters].map((p, i) => (
              <div key={i} className={`${styles.posterTile} ${styles[`tone${p.tone}`]}`}>
                <span className={styles.posterTileTitle}>{p.t}</span>
                <span className={styles.posterTileYear}>{p.y}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── From the archives ── */}
        <section id="archive" className={styles.archive}>
          <article className={styles.entry} data-reveal>
            <div className={styles.entryHead}>
              <span className={styles.entryFolio}>Diary entry · 142</span>
              <span className={styles.ratingChip}>
                <Star size={11} fill="currentColor" /> 9.5
              </span>
            </div>
            <h3 className={styles.entryTitle}>The silence of the final scene</h3>
            <p className={styles.entryBody}>
              <span className={styles.dropcap}>T</span>here's a specific kind of
              space that only classic cinema fills. The slow pacing lets you
              think, to dwell, to feel — not the absence of sound, but a heavy,
              reflective silence that lingers long after the lights come up.
            </p>
            <div className={styles.entryFoot}>
              <span className={styles.entrySign}>— logged on a quiet Tuesday</span>
              <Link href={`${APP_URL}/diary`} className={styles.entryLink}>
                Read entry <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          <div className={styles.archiveText} data-reveal>
            <p className={styles.kicker}><span className={styles.rule} aria-hidden="true" /> The point of it all</p>
            <h2 className={styles.archiveHeading}>Capture the intangible.</h2>
            <p className={styles.archiveDesc}>
              Some films leave a mark a star rating can't hold. Endroll's
              editorial journal gives those feelings the room they deserve.
            </p>
            <ol className={styles.archiveList}>
              <li><span className={styles.idx}>01</span><span>Room to write the way you actually remember it</span></li>
              <li><span className={styles.idx}>02</span><span>Typography made for expressive, unhurried entries</span></li>
              <li><span className={styles.idx}>03</span><span>A private dashboard and gentle, honest statistics</span></li>
            </ol>
          </div>
        </section>

        {/* ── Pull quote ── */}
        <section className={styles.pullquote} data-reveal>
          <span className={styles.pullBar} aria-hidden="true" />
          <blockquote className={styles.pullText}>
            The films we love aren't the ones we watch once — they're the ones
            we keep returning to, a little different each time.
          </blockquote>
          <span className={styles.pullAttr}>The Endroll philosophy</span>
        </section>

        {/* ── By the numbers ── */}
        <section className={styles.numbers} data-reveal>
          {numbers.map(({ value, label }, i) => (
            <div key={label} className={styles.numCell}>
              <span className={styles.numValue}>{value}</span>
              <span className={styles.numLabel}>{label}</span>
              {i < numbers.length - 1 && <span className={styles.numRule} aria-hidden="true" />}
            </div>
          ))}
        </section>

        {/* ── Features ── */}
        <section id="features" className={styles.features}>
          <header className={styles.sectionHead} data-reveal>
            <p className={styles.kicker}><span className={styles.rule} aria-hidden="true" /> Why Endroll</p>
            <h2 className={styles.sectionTitle}>A journal, not a network.</h2>
          </header>
          <div className={styles.featureGrid}>
            {features.map(({ numeral, icon: Icon, title, desc }, i) => (
              <article key={numeral} className={styles.featureCol} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <span className={styles.featureNum} aria-hidden="true">{numeral}</span>
                <span className={styles.featureRule} aria-hidden="true" />
                <div className={styles.featureIcon}><Icon size={18} /></div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── A look inside ── */}
        <section id="preview" className={styles.preview}>
          <header className={styles.sectionHead} data-reveal>
            <p className={styles.kicker}><span className={styles.rule} aria-hidden="true" /> A look inside</p>
            <h2 className={styles.sectionTitle}>Your week, quietly kept.</h2>
          </header>

          <div className={styles.previewFilm} data-reveal>
            <span className={styles.filmRail} aria-hidden="true" />
            <span className={styles.filmRailRight} aria-hidden="true" />
            <div className={styles.previewTab}>Now playing</div>
            <span className={styles.previewTC}>REEL 12 · 00:38:12</span>

            <div className={styles.previewPanel}>
              {/* Streak card */}
              <div className={styles.previewCard}>
                <div className={styles.profileRow}>
                  <span className={styles.profileAvatar} aria-hidden="true">A</span>
                  <div>
                    <p className={styles.profileName}>@alex_cinema</p>
                    <p className={styles.profileEst}>EST. 2026</p>
                  </div>
                </div>
                <div className={styles.profileStats}>
                  <div><strong>142</strong><span>Titles</span></div>
                  <div><strong>18</strong><span>Lists</span></div>
                  <div><strong>8.4</strong><span>Avg</span></div>
                </div>
                <div className={styles.streakBlock}>
                  <div className={styles.streakTop}>
                    <span className={styles.streakLabel}>
                      <Flame size={14} fill="currentColor" /> 12-week streak
                    </span>
                    <span className={styles.streakPct}>secured</span>
                  </div>
                  <div className={styles.streakDots}>
                    {[...Array(12)].map((_, i) => <span key={i} className={styles.streakDot} />)}
                  </div>
                </div>
              </div>

              {/* Logged title card */}
              <div className={`${styles.previewCard} ${styles.previewCardWide}`}>
                <div className={styles.logPoster}>
                  <span className={styles.logPosterText}>PARASITE</span>
                  <span className={styles.logPosterYear}>2019</span>
                </div>
                <div className={styles.logBody}>
                  <div className={styles.frameHead}>
                    <div>
                      <h3 className={styles.frameTitle}>Parasite</h3>
                      <span className={styles.frameMeta}>Bong Joon-ho · 2019</span>
                    </div>
                    <span className={styles.ratingChip}>
                      <Star size={11} fill="currentColor" /> 9.5
                    </span>
                  </div>
                  <p className={styles.logQuote}>
                    "A masterpiece of suspense and social commentary. The tonal
                    shift midway is spectacular."
                  </p>
                  <div className={styles.logTags}>
                    <span className={styles.tag}>Drama</span>
                    <span className={styles.tag}>Thriller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className={styles.cta} data-reveal>
          <div className={styles.leader} aria-hidden="true">
            <span className={styles.leaderNum}>3</span>
          </div>
          <h2 className={styles.ctaTitle}>
            Ready to document your<br />
            <span className={styles.heroAccent}>cinematic life?</span>
          </h2>
          <p className={styles.ctaSub}>
            Build your private sanctuary for films. Unhurried, uncompromising,
            and entirely yours.
          </p>
          <Link href={`${APP_URL}/home`} className="btn btn-primary btn-lg">
            Start your journey <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandName}>endroll</span>
        </Link>
        <nav className={styles.footerLinks} aria-label="Footer">
          <Link href={`${APP_URL}/diary`} className={styles.footerLink}>Privacy</Link>
          <Link href={`${APP_URL}/diary`} className={styles.footerLink}>Terms</Link>
          <Link href={`${APP_URL}/diary`} className={styles.footerLink}>Your data</Link>
          <Link href={`${APP_URL}/diary`} className={styles.footerLink}>Methodology</Link>
        </nav>
        <p className={styles.footerCopy}>© 2026 Endroll · Private by design.</p>
      </footer>
    </div>
  )
}

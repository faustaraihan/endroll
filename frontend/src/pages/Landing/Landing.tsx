import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Film, 
  Star, 
  ArrowRight, 
  Menu, 
  X,
  Bookmark,
  Calendar,
  Flame,
  User
} from 'lucide-react'
import styles from './Landing.module.css'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={styles.page}>
      {/* Background gradients */}
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.bgGlowFooter} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Film className={styles.logoIcon} size={24} />
          <span>Endroll</span>
        </div>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <a href="#features" className={styles.navLink}>Features</a>
          <Link to="/diary" className={styles.navLink}>The Journal</Link>
          <a href="#features" className={styles.navLink}>Pricing</a>
        </nav>

        <div className={styles.navActions}>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/dashboard" className="btn btn-primary btn-sm">Start journaling</Link>
          <button 
            className={styles.menuBtn} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-40 flex flex-col justify-center items-center gap-8">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-zinc-300 hover:text-white">Features</a>
          <Link to="/diary" className="text-xl font-medium text-zinc-300 hover:text-white">The Journal</Link>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-zinc-300 hover:text-white">Pricing</a>
          <div className="flex flex-col gap-4 w-64 mt-4">
            <Link to="/dashboard" className="btn btn-secondary text-center">Sign in</Link>
            <Link to="/dashboard" className="btn btn-primary text-center">Start journaling</Link>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroTagline}>
              <span className={styles.taglineSymbol}>✦</span>
              <span>When the credits roll, the reflection begins.</span>
            </div>
            <h1 className={styles.heroTitle}>
              Remember<br />
              every <span className={`${styles.italicSerif} ${styles.textAccent}`}>film</span><br />
              <span className={`${styles.italicSerif} ${styles.textAccent}`}>you've felt.</span>
            </h1>
            <p className={styles.heroSub}>
              Endroll is a calm, private place to log what you watch, remember how it made you feel, and see your taste evolve over time.
            </p>
            <div className={styles.heroActions}>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Start journaling <ArrowRight size={18} />
              </Link>
              <Link to="/diary" className="btn btn-ghost btn-lg">
                See a demo
              </Link>
            </div>
            <p className={styles.heroNote}>No social feed. No followers. Just your films.</p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.glowOrbViolet} />
            <div className={styles.glowOrbAmber} />
            {/* Mockup Preview Card 1 (La Haine - Noir Theme) */}
            <div className={`${styles.previewCard1} ${styles.cardNoir}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>La Haine</span>
                <span className={styles.cardDate}>1995 // Noir</span>
              </div>
              <div className={styles.cardLine} />
              <div className={styles.cardLineShort} />
              <div className={styles.cardStars}>
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
            </div>
            {/* Mockup Preview Card 2 (Interstellar - Space Theme) */}
            <div className={`${styles.previewCard2} ${styles.cardCosmic}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>Interstellar</span>
                <span className={`${styles.cardDate} ${styles.textAmber}`}>10.0 / 10</span>
              </div>
              <div className={styles.cardLine} />
              <div className={styles.cardLineShort} />
              <p className="text-xs text-violet-200/80 italic font-serif">
                "No time for caution. The docking scene still makes my heart race every single time."
              </p>
            </div>
          </div>
        </section>

        {/* Section: From the Archives */}
        <section className={styles.archivesSection}>
          <div>
            <h2 className={styles.archivesLabel}>From the Archives</h2>
            <span className={styles.archivesSubtitle}>FEATURED ENTRIES</span>

            {/* Mock Diary Card */}
            <div className={styles.archiveDiaryCard}>
              <div className={styles.archiveCardMeta}>
                <div>
                  <span className="text-xs text-amber-500/80 font-mono tracking-widest block mb-1">[ DIARY ENTRY // 142 ]</span>
                  <h3 className="font-serif text-lg font-bold text-white">The Silence of the Final Scene</h3>
                </div>
                <div className="text-zinc-500">
                  <Bookmark size={18} />
                </div>
              </div>
              <p className={styles.archiveDiaryText}>
                "There's a specific kind of space that only classic cinema fills. The slow pacing allows you to think, to dwell, to feel. It's not just the absence of sound, but a heavy, reflective silence that makes you feel the movie..."
              </p>
              <div className="flex justify-between items-center mt-6">
                <Link to="/diary" className={styles.archiveReadLink}>
                  Read Entry <ArrowRight size={14} />
                </Link>
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="font-mono font-bold text-xs">9.5</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.archiveContentRight}>
            <h2 className={styles.archiveRightTitle}>Capture the intangible.</h2>
            <p className={styles.archiveRightDesc}>
              Some films leave a mark that a simple star rating can't capture. Endroll's editorial journal layout gives you the breathing room they deserve.
            </p>
            <div className={styles.archiveBulletList}>
              <div className={styles.archiveBulletItem}>
                <div className={styles.editorialIndex}>[01]</div>
                <span>Rich context for writing reviews</span>
              </div>
              <div className={styles.archiveBulletItem}>
                <div className={styles.editorialIndex} style={{ color: 'var(--color-amber-400)' }}>[02]</div>
                <span>Sleek typography for expressive entries</span>
              </div>
              <div className={styles.archiveBulletItem}>
                <div className={styles.editorialIndex} style={{ color: 'var(--color-success)' }}>[03]</div>
                <span>Private dashboard and analytics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section (Staggered Layout) */}
        <section id="features" className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {/* Feature 1: Top Left */}
            <div className={`${styles.featureCard} ${styles.featureCard1}`}>
              <div className={styles.cardWatermark}>I</div>
              <h3 className={styles.featureTitle}>Private by Design</h3>
              <p className={styles.featureDesc}>
                Your thoughts are yours alone. No public feeds, no performance reviews. Just a quiet space for your cinematic memories.
              </p>
            </div>

            {/* Feature 2: Middle Right (Shifted Down) */}
            <div className={`${styles.featureCard} ${styles.featureCard2}`}>
              <div className={styles.cardWatermark}>II</div>
              <h3 className={styles.featureTitle}>Personal Evolution</h3>
              <p className={styles.featureDesc}>
                Track your viewing habits. See how your taste and feelings about cinema change as you log more reviews over time.
              </p>
            </div>

            {/* Feature 3: Bottom Left */}
            <div className={`${styles.featureCard} ${styles.featureCard3}`}>
              <div className={styles.cardWatermark}>III</div>
              <h3 className={styles.featureTitle}>No Social Pressure</h3>
              <p className={styles.featureDesc}>
                Free yourself from the anxiety of public opinions. Focus on your own journal, write reviews, and build your own index of cinema.
              </p>
            </div>
          </div>
        </section>

        {/* Mockup UI Section (Cinematic Storyboard / Film Strip) */}
        <section className={styles.mockupSection}>
          <div className={styles.mockupContainer}>
            {/* Left Mock Card (User Profile & Streak) */}
            <div className={styles.mockCardLeft}>
              <div className={styles.mockProfileHead}>
                <div className={styles.mockAvatar}>
                  <User size={16} className="text-violet-200" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">@alex_cinema</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">EST. 2026</span>
                </div>
              </div>
              
              <div className={styles.mockStatsRow}>
                <div className={styles.mockStatItem}>
                  <span className="text-xs font-bold text-white">142</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Titles</span>
                </div>
                <div className={styles.mockStatItem}>
                  <span className="text-xs font-bold text-white">18</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Lists</span>
                </div>
              </div>

              <div className={styles.mockStreakContainer}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-amber-500 animate-pulse" fill="currentColor" />
                    <span className="text-xs font-bold text-amber-400 font-sans">12 Weeks Streak</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">100% active</span>
                </div>
                <div className={styles.mockStreakTrack}>
                  <div className={styles.mockStreakFill} />
                </div>
                <div className={styles.streakGrid}>
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className={`${styles.streakDot} ${styles.activeDot}`} title={`Week ${i + 1}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Mock Card (Watchlog Entry Detail) */}
            <div className={styles.mockCardRight}>
              <div className={styles.mockPosterWrapper}>
                <div className={styles.parasitePoster}>
                  <div className={styles.parasiteHouseBg}>
                    <div className={styles.parasiteEyesSensor} />
                    <div className={styles.parasiteStairsLine} />
                  </div>
                  <span className={styles.parasiteTitleText}>PARASITE</span>
                  <span className={styles.parasiteYearText}>2019</span>
                </div>
              </div>
              <div className={styles.mockContent}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">Parasite</h4>
                    <span className="text-xs text-zinc-500 font-mono">Bong Joon-ho // 2019</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-sm bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    <Star size={12} fill="currentColor" />
                    <span>9.5</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 font-serif italic line-clamp-3 leading-relaxed border-l-2 border-violet-500/30 pl-3 mt-1">
                  "A masterpiece of social commentary and suspense. The shift in tone midway through is spectacular, turning a comedy into a thriller."
                </p>
                <div className={styles.mockPills}>
                  <div className={`${styles.mockBadge} ${styles.mockBadgeViolet}`}>Drama</div>
                  <div className={`${styles.mockBadge} ${styles.mockBadgeGreen}`}>Thriller</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="flex justify-center mb-6" aria-hidden="true">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Calendar size={28} />
            </div>
          </div>
          <h2 className={styles.ctaTitle}>
            Ready to document your<br />
            <span className={`${styles.italicSerif} ${styles.textAccent}`}>cinematic life?</span>
          </h2>
          <p className={styles.ctaSub}>
            Join Endroll today and build your private sanctuary for films.<br />
            Unhurried, uncompromising, and entirely yours.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Start your journey <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span>Endroll</span>
        </div>
        <div className={styles.footerLinks}>
          <Link to="/diary" className={styles.footerLink}>PRIVACY POLICY</Link>
          <Link to="/diary" className={styles.footerLink}>TERMS OF SERVICE</Link>
          <Link to="/diary" className={styles.footerLink}>PERSONAL USE DATA</Link>
          <Link to="/diary" className={styles.footerLink}>METHODOLOGY</Link>
        </div>
        <div className={styles.footerCopy}>
          <p>© 2026 Endroll. Private by design.</p>
        </div>
      </footer>
    </div>
  )
}

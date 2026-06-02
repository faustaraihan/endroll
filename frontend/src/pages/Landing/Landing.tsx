import { Film, Star, BookOpen, BarChart2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Background gradient */}
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Film size={22} color="var(--color-violet-400)" />
          <span>endroll</span>
        </div>
        <nav className={styles.nav} aria-label="Sign in navigation">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/dashboard" className="btn btn-primary btn-sm">Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Star size={12} fill="currentColor" />
            Your personal film journal
          </div>
          <h1 className={styles.heroTitle}>
            Remember every<br />
            <span className={styles.heroAccent}>film you've felt.</span>
          </h1>
          <p className={styles.heroSub}>
            Endroll is a calm, private place to log what you watch,
            remember how it made you feel, and see your taste evolve over time.
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
        </section>

        {/* Features */}
        <section className={styles.features} aria-label="Features">
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BookOpen size={24} />
            </div>
            <h2 className={styles.featureTitle}>Personal Diary</h2>
            <p className={styles.featureDesc}>
              Log films in under 30 seconds. Add your rating, notes, and context — or just mark it as watched.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Star size={24} />
            </div>
            <h2 className={styles.featureTitle}>Decimal Ratings</h2>
            <p className={styles.featureDesc}>
              Rate from 0.0 to 10.0. Because sometimes a film deserves 8.5, not just 4 stars.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BarChart2 size={24} />
            </div>
            <h2 className={styles.featureTitle}>Personal Stats</h2>
            <p className={styles.featureDesc}>
              See your watching habits, favorite genres, and directors — all in a beautiful, private dashboard.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Start your film journal</h2>
          <p className={styles.ctaSub}>Free forever. Private by design.</p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Get started — it's free
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Endroll · Private by design</p>
      </footer>
    </div>
  )
}

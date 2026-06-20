import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'
import styles from '../auth.module.css'

interface AuthLayoutProps {
  children: ReactNode
  quote: { text: string; author: string }
}

export function AuthLayout({ children, quote }: AuthLayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandDot} aria-hidden="true" />
            endroll
          </Link>

          <div className={styles.heroDecoration} aria-hidden="true">
            <Film size={260} strokeWidth={0.4} />
          </div>

          <blockquote className={styles.quote}>
            <div className={styles.quoteAccent} aria-hidden="true" />
            <p className={styles.quoteText}>{quote.text}</p>
            <footer className={styles.quoteAuthor}>{quote.author}</footer>
          </blockquote>
        </div>
      </div>

      <main className={styles.formSide}>
        <div className={styles.formWrapper}>
          <Link to="/" className={`${styles.brand} ${styles.brandMobile}`}>
            <span className={styles.brandDot} aria-hidden="true" />
            endroll
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}

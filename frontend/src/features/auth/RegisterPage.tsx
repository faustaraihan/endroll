import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { AuthLayout } from './AuthLayout'
import styles from '@/features/auth/auth.module.css'

const QUOTE = {
  text: '"The cinema is a mirror by which we often discover ourselves."',
  author: '— Martin Scorsese',
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const register = useStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register(email, password, name)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout quote={QUOTE}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <Check size={32} />
          </div>
          <h1 className={styles.formTitle} style={{ textAlign: 'center' }}>
            Check your email
          </h1>
          <p className={styles.formSubtitle} style={{ textAlign: 'center' }}>
            We've sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link to="/login" className={styles.footerLink} style={{ justifyContent: 'center', marginTop: 24 }}>
            Go to Login <ArrowRight size={13} />
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout quote={QUOTE}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Register</h1>
        <p className={styles.formSubtitle}>Create your account to start journaling.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.inputGroup}>
          <label htmlFor="reg-name" className={styles.label}>Name</label>
          <input
            id="reg-name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="reg-email" className={styles.label}>Email address</label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            className={styles.input}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="reg-password" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email || !password || !name}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {isSubmitting
            ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            : 'Register'
          }
        </button>
      </form>

      <div className={styles.divider}><span>or register with</span></div>

      <button type="button" className={`btn btn-secondary ${styles.socialBtn}`}>
        <GoogleIcon />
        Continue with Google
      </button>

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.footerLink}>
          Login <ArrowRight size={13} />
        </Link>
      </p>
    </AuthLayout>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Film, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/home'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--bg, #0b0b0c)',
            color: 'var(--text-2, #a4a19b)',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <Film size={48} strokeWidth={1.2} style={{ opacity: 0.4 }} />
          <h1 style={{ color: 'var(--text, #f4f3f1)', fontSize: '1.25rem', fontWeight: 600 }}>
            Something flickered
          </h1>
          <p style={{ maxWidth: 400, lineHeight: 1.6, fontSize: '0.875rem' }}>
            This page ran into an unexpected glitch. It&apos;s probably temporary — try refreshing.
          </p>
          {this.state.error && (
            <details style={{ fontSize: '0.75rem', opacity: 0.5, maxWidth: 400, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer' }}>Error details</summary>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={this.handleRetry}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={15} /> Try again
            </button>
            <button
              onClick={this.handleGoHome}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Home size={15} /> Go home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

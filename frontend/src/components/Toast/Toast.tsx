import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast } from '../../contexts'
import type { ToastType } from '../../types'
import styles from './Toast.module.css'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  info:    <Info size={16} />,
}

export function Toast() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="toast-container"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} animate-slide-up`}
        >
          <span className={styles[`icon-${toast.type}`]}>
            {icons[toast.type]}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            className="btn btn-icon btn-ghost"
            style={{ minHeight: 28, minWidth: 28, padding: 4 }}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

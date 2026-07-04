import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className={styles.header}>
          <div className={`${styles.iconWrap} ${variant === 'danger' ? styles.iconDanger : ''}`}>
            <AlertTriangle size={18} />
          </div>
          <h2 id="confirm-title" className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Cancel">
            <X size={16} />
          </button>
        </div>

        <p id="confirm-message" className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

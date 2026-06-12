import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import type { ToastMessage, ToastType, ToastAction } from '../types'

interface AddToastOptions {
  /** Aksi opsional, mis. "Urungkan" untuk aksi destruktif */
  action?: ToastAction
  /** Durasi tampil dalam ms. Default 4000, atau 7000 jika ada aksi */
  duration?: number
}

interface ToastContextValue {
  toasts: ToastMessage[]
  addToast: (message: string, type?: ToastType, options?: AddToastOptions) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', options?: AddToastOptions) => {
      const id = crypto.randomUUID()
      // Toast dengan aksi (mis. Urungkan) tampil lebih lama agar sempat diklik
      const duration = options?.duration ?? (options?.action ? 7000 : 4000)
      setToasts(prev => [...prev, { id, message, type, action: options?.action }])
      const timer = setTimeout(() => {
        timersRef.current.delete(id)
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
      timersRef.current.set(id, timer)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { ToastType, ToastAction } from '@/types'

interface AddToastOptions {
  action?: ToastAction
  duration?: number
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, options?: AddToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const addToast = useCallback(
    (message: string, type: ToastType = 'info', options?: AddToastOptions) => {
      const duration = options?.duration ?? (options?.action ? 7000 : 4000)
      const sonnerOptions = {
        duration,
        ...(options?.action && {
          action: {
            label: options.action.label,
            onClick: options.action.onClick,
          },
        }),
      }

      if (type === 'success') toast.success(message, sonnerOptions)
      else if (type === 'error') toast.error(message, sonnerOptions)
      else toast.info(message, sonnerOptions)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
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

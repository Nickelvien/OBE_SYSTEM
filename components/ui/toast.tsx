// components/ui/toast.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
} as const

const STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info:    'border-primary/30 bg-primary/10',
}

const ICON_COLORS = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-primary',
}

export interface Toast {
  id:          string
  title:       string
  description?: string
  type:        'success' | 'error' | 'warning' | 'info'
  duration?:   number
}

interface ToastContextValue {
  addToast:    (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration ?? 5000)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismiss = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const Icon = ICONS[toast.type]

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 bg-card',
        STYLES[toast.type],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', ICON_COLORS[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button onClick={handleDismiss} className="flex-shrink-0 p-0.5 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
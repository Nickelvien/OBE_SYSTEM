// components/ui/toaster.tsx — convenience hooks for common toast patterns
'use client'

import { useToast } from '@/components/ui/toast'

export function useNotify() {
  const { addToast } = useToast()

  return {
    success: (title: string, description?: string) =>
      addToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      addToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) =>
      addToast({ title, description, type: 'info' }),
  }
}
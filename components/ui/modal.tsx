// components/ui/modal.tsx
'use client'

import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ModalProps {
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ title, description, onClose, children, maxWidth = 'md' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <Card className={cn('w-full shadow-2xl animate-slide-up', maxWidthMap[maxWidth])}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-foreground font-semibold text-lg">{title}</h3>
            {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
          </div>
          <Button id="modal-close" variant="ghost" size="icon-sm" onClick={onClose} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </Card>
    </div>
  )
}
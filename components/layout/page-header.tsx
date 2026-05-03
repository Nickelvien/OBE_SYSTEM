// components/layout/page-header.tsx
import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
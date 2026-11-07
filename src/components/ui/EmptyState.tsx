import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className ?? ''}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mb-5">
          <Icon size={28} className="text-charcoal-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-charcoal-900 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-charcoal-500 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button
            variant={action.variant ?? 'primary'}
            size="md"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

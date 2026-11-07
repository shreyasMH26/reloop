import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

type SpinnerSize = 'sm' | 'md' | 'lg' | 'fullpage'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const ringSize: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  fullpage: 'w-14 h-14 border-[3px]',
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  if (size === 'fullpage') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-50/80 backdrop-blur-sm">
        <div
          className={cn(
            ringSize.fullpage,
            'rounded-full border-sage-200 border-t-sage-500 animate-spin',
            className
          )}
          role="status"
          aria-label={label ?? 'Loading…'}
        />
        {label && (
          <p className="mt-4 text-sm text-charcoal-500 font-medium animate-pulse">{label}</p>
        )}
      </div>
    )
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full border-sage-200 border-t-sage-500 animate-spin',
        ringSize[size],
        className
      )}
      role="status"
      aria-label={label ?? 'Loading…'}
    />
  )
}

/** Convenience: centred full-width block spinner (for page sections) */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <LoadingSpinner size="lg" />
      {label && <p className="text-sm text-charcoal-400 font-medium">{label}</p>}
    </div>
  )
}

export default LoadingSpinner

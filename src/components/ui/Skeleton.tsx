import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface SkeletonProps {
  className?: string
}

export function SkeletonText({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'h-4 bg-cream-200 rounded-lg animate-pulse',
        className
      )}
    />
  )
}

export function SkeletonImage({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-cream-200 rounded-xl animate-pulse',
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card overflow-hidden',
        className
      )}
    >
      <SkeletonImage className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonText className="h-5 w-16 rounded-full" />
          <SkeletonText className="h-5 w-12 rounded-full" />
        </div>
        <SkeletonText className="h-5 w-3/4" />
        <SkeletonText className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <SkeletonText className="h-6 w-20" />
          <SkeletonText className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProductGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

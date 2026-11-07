import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

type StarSize = 'sm' | 'md' | 'lg'

interface StarRatingProps {
  rating: number
  size?: StarSize
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

const starDimensions: Record<StarSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
}

function StarIcon({
  fill,
  size,
  className,
}: {
  fill: 'full' | 'half' | 'empty'
  size: number
  className?: string
}) {
  if (fill === 'full') {
    return (
      <Star
        size={size}
        className={cn('text-amber-400 fill-amber-400', className)}
      />
    )
  }
  if (fill === 'half') {
    return (
      <span className="relative inline-block" style={{ width: size, height: size }}>
        {/* Full star clipped to 50% */}
        <Star size={size} className="text-cream-300 fill-cream-200 absolute inset-0" />
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: '50%' }}
        >
          <Star size={size} className="text-amber-400 fill-amber-400" />
        </span>
      </span>
    )
  }
  return (
    <Star
      size={size}
      className={cn('text-cream-300 fill-cream-200', className)}
    />
  )
}

export function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const dim = starDimensions[size]
  const displayRating = interactive && hover !== null ? hover : rating

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        let fill: 'full' | 'half' | 'empty'
        if (displayRating >= star) {
          fill = 'full'
        } else if (displayRating >= star - 0.5) {
          fill = 'half'
        } else {
          fill = 'empty'
        }

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={cn(
                'transition-transform focus-visible:outline-none focus-visible:scale-110',
                hover !== null && hover >= star ? 'scale-110' : ''
              )}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange?.(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              role="radio"
              aria-checked={Math.round(rating) === star}
            >
              <Star
                size={dim}
                className={cn(
                  'transition-colors',
                  (hover !== null ? hover >= star : rating >= star)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-cream-300 fill-cream-200'
                )}
              />
            </button>
          )
        }

        return <StarIcon key={star} fill={fill} size={dim} />
      })}
    </div>
  )
}

export default StarRating

import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  as?: 'button' | 'a'
  href?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 focus-visible:ring-sage-500',
  secondary:
    'bg-charcoal-900 text-white hover:bg-charcoal-800 active:bg-charcoal-700 focus-visible:ring-charcoal-900',
  outline:
    'border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white active:bg-charcoal-800 focus-visible:ring-charcoal-900',
  ghost:
    'text-charcoal-900 hover:bg-cream-100 active:bg-cream-200 focus-visible:ring-charcoal-400',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-500',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      rightIcon,
      as: Tag = 'button',
      href,
      children,
      className,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classes = cn(
      'inline-flex items-center justify-center font-medium rounded-xl',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    )

    if (Tag === 'a' && href) {
      return (
        <a href={href} className={classes}>
          {loading ? (
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          ) : (
            icon
          )}
          {children}
          {!loading && rightIcon}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...rest}
      >
        {loading ? (
          <Loader2
            className="animate-spin"
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          />
        ) : (
          icon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

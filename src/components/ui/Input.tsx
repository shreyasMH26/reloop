import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  as?: 'input' | 'textarea'
  rows?: number
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      rightElement,
      as: Tag = 'input',
      className,
      id,
      required,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const inputClasses = cn(
      'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900',
      'placeholder:text-charcoal-400',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-0 focus:border-sage-500',
      'disabled:bg-cream-100 disabled:cursor-not-allowed disabled:text-charcoal-500',
      icon ? 'pl-10' : undefined,
      rightElement ? 'pr-10' : undefined,
      error
        ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
        : 'border-cream-300 hover:border-charcoal-400',
      className
    )

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal-900"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none">
              {icon}
            </div>
          )}
          {Tag === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              rows={rows}
              className={cn(inputClasses, 'resize-none py-3')}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={inputClasses}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              {...rest}
            />
          )}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-rose-500 flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-charcoal-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

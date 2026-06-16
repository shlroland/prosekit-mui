import { Button as BaseButton } from '@base-ui/react/button'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '../utils/cn'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'icon' | 'sm'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        ref={ref}
        type={type}
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-medium outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-[var(--editor-ring)] focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-45',
          variant === 'default'
            && 'bg-[var(--editor-primary)] text-white hover:bg-[var(--editor-primary-hover)]',
          variant === 'ghost'
            && 'bg-transparent text-[var(--editor-foreground)] hover:bg-[var(--editor-muted)]',
          variant === 'outline'
            && 'border border-[var(--editor-border)] bg-[var(--editor-surface)] text-[var(--editor-foreground)] hover:bg-[var(--editor-muted)]',
          size === 'default' && 'min-h-9 px-3 py-2',
          size === 'sm' && 'min-h-8 px-2.5 py-1.5 text-xs',
          size === 'icon' && 'h-9 w-9 p-0',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

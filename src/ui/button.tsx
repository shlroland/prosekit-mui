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
          'pk:inline-flex pk:shrink-0 pk:items-center pk:justify-center pk:gap-1.5 pk:rounded-lg pk:text-sm pk:font-medium pk:outline-none pk:transition-colors',
          'pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)] pk:focus-visible:ring-offset-1',
          'pk:disabled:pointer-events-none pk:disabled:opacity-45',
          variant === 'default'
            && 'pk:bg-[var(--editor-primary)] pk:text-white pk:hover:bg-[var(--editor-primary-hover)]',
          variant === 'ghost'
            && 'pk:bg-transparent pk:text-[var(--editor-foreground)] pk:hover:bg-[var(--editor-muted)]',
          variant === 'outline'
            && 'pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:text-[var(--editor-foreground)] pk:hover:bg-[var(--editor-muted)]',
          size === 'default' && 'pk:min-h-9 pk:px-3 pk:py-2',
          size === 'sm' && 'pk:min-h-8 pk:px-2.5 pk:py-1.5 pk:text-xs',
          size === 'icon' && 'pk:h-9 pk:w-9 pk:p-0',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn } from '../utils/cn'

export type SeparatorProps = ComponentPropsWithoutRef<typeof BaseSeparator>

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-[var(--editor-border)]',
          orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
          className,
        )}
        {...props}
      />
    )
  },
)

Separator.displayName = 'Separator'

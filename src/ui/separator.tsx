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
          'pk:shrink-0 pk:bg-[var(--editor-border)]',
          orientation === 'vertical' ? 'pk:h-full pk:w-px' : 'pk:h-px pk:w-full',
          className,
        )}
        {...props}
      />
    )
  },
)

Separator.displayName = 'Separator'

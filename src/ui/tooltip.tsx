import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement, type ReactNode } from 'react'

import { cn } from '../utils/cn'

export type TooltipProps = {
  children: ReactElement
  content?: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
  className?: string
  disabled?: boolean
}

export function Tooltip({
  children,
  content,
  side = 'top',
  className,
  disabled,
}: TooltipProps) {
  if (!content) {
    return children
  }

  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8}>
          <BaseTooltip.Popup
            className={cn(
              'pk:z-[1400] pk:rounded-md pk:bg-neutral-950 pk:px-2.5 pk:py-1.5 pk:text-xs pk:font-medium pk:leading-5 pk:text-white pk:shadow-[0_8px_24px_rgba(15,23,42,0.2)]',
              className,
            )}
          >
            {content}
            <BaseTooltip.Arrow className="pk:fill-neutral-950" />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}

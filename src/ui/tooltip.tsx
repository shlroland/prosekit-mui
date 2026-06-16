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
              'z-[1400] rounded-md bg-neutral-950 px-2.5 py-1.5 text-xs font-medium leading-5 text-white shadow-[0_8px_24px_rgba(15,23,42,0.2)]',
              className,
            )}
          >
            {content}
            <BaseTooltip.Arrow className="fill-neutral-950" />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}

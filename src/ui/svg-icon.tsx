import { forwardRef, type CSSProperties, type SVGProps } from 'react'

import { cn } from '../utils/cn'

type SxValue = CSSProperties & {
  fontSize?: CSSProperties['fontSize']
}

export type SvgIconProps = Omit<SVGProps<SVGSVGElement>, 'fontSize'> & {
  fontSize?: CSSProperties['fontSize']
  sx?: SxValue
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ className, children, fill = 'currentColor', fontSize, style, sx, ...props }, ref) => {
    const { fontSize: sxFontSize, ...sxStyle } = sx ?? {}
    const resolvedFontSize = fontSize ?? sxFontSize

    return (
      <svg
        ref={ref}
        aria-hidden={props['aria-label'] ? undefined : true}
        focusable="false"
        fill={fill}
        className={cn('pk:inline-block pk:h-[1em] pk:w-[1em] pk:shrink-0 pk:select-none pk:text-[1.25rem]', className)}
        style={{
          ...sxStyle,
          ...style,
          ...(resolvedFontSize ? { fontSize: resolvedFontSize } : undefined),
        }}
        {...props}
      >
        {children}
      </svg>
    )
  },
)

SvgIcon.displayName = 'SvgIcon'

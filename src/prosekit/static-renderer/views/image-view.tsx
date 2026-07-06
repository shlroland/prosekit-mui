import type { CSSProperties } from 'react'

import type { StaticNodeViewProps } from './types'
import { normalizeNumber, normalizeText } from './utils'
import { resolveAssetUrl } from '../url'

function normalizeImageAlign(value: unknown) {
  return value === 'center' || value === 'right' ? value : 'left'
}

function getImageShellStyle(align: string): CSSProperties {
  if (align === 'center') {
    return { marginLeft: 'auto', marginRight: 'auto' }
  }

  if (align === 'right') {
    return { marginLeft: 'auto', marginRight: 0 }
  }

  return { marginLeft: 0, marginRight: 'auto' }
}

export function StaticImageView({ attrs, baseUrl }: StaticNodeViewProps) {
  const src = resolveAssetUrl(attrs.src, baseUrl)
  const title = normalizeText(attrs.title)
  const width = normalizeNumber(attrs.width)
  const height = normalizeNumber(attrs.height)
  const align = normalizeImageAlign(attrs.align)

  return (
    <figure
      className="pk:my-4 pk:max-w-full"
      data-image-align={align}
      style={{
        ...getImageShellStyle(align),
        width: width ? Math.min(width, 1200) : undefined,
        maxWidth: '100%',
      }}
    >
      {src ? (
        <img
          className="pk:block pk:h-auto pk:max-w-full pk:cursor-zoom-in pk:rounded-[var(--radius)]"
          src={src}
          alt={title}
          title={title || undefined}
          data-image-viewer-item=""
          data-src={src}
          width={width || undefined}
          height={height || undefined}
        />
      ) : null}
      {title ? <figcaption className="pk:mt-2 pk:text-center pk:text-sm pk:text-[var(--editor-muted-foreground)]">{title}</figcaption> : null}
    </figure>
  )
}

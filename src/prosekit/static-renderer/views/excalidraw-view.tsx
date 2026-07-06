import type { StaticNodeViewProps } from './types'
import { normalizeNumber, normalizeText } from './utils'
import { resolveAssetUrl } from '../url'

export function StaticExcalidrawView({ attrs, baseUrl }: StaticNodeViewProps) {
  const src = resolveAssetUrl(attrs.src || attrs.url, baseUrl)
  const title = normalizeText(attrs.title)
  const width = normalizeNumber(attrs.width)
  const height = normalizeNumber(attrs.height)

  if (!src) {
    return null
  }

  return (
    <figure
      className="pk:my-4 pk:max-w-full"
      data-type="excalidraw"
      data-static-renderer="true"
    >
      <img
        className="pk:block pk:h-auto pk:max-w-full pk:rounded-[var(--radius)]"
        src={src}
        alt={title}
        title={title || undefined}
        width={width || undefined}
        height={height || undefined}
      />
    </figure>
  )
}

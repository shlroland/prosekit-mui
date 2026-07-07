import { ChromeIcon } from '../../../icons'
import { cn } from '../../../utils/cn'
import type { StaticNodeViewProps } from './types'
import { normalizeText } from './utils'

export const staticLinkFaviconWrapperClassName = 'pk:inline-flex pk:shrink-0 pk:items-center pk:justify-center pk:self-center pk:overflow-hidden pk:rounded-full pk:bg-white'
export const staticLinkFaviconObjectClassName = 'pk:pointer-events-none pk:block pk:h-full pk:w-full'
export const staticLinkFaviconFallbackClassName = 'pk:text-[var(--editor-primary)]'

function getLinkTitle(href: string) {
  try {
    const url = new URL(href)
    return url.hostname.replace(/^www\./, '') || href
  } catch {
    return href
  }
}

function getLinkRel(target: string | null, rel: string | null) {
  if (rel) {
    return rel
  }

  return target === '_blank' ? 'noopener noreferrer' : undefined
}

export function getStaticLinkFavicon(href: string) {
  try {
    return href ? `${new URL(href).origin}/favicon.ico` : ''
  } catch {
    return ''
  }
}

export function StaticLinkFavicon({
  src,
  isBlock,
}: {
  src: string
  isBlock: boolean
}) {
  return (
    <span
      className={cn(staticLinkFaviconWrapperClassName, isBlock ? 'pk:h-8 pk:w-8' : 'pk:h-4 pk:w-4')}
      data-static-link-favicon="true"
    >
      {src ? (
        <object
          className={staticLinkFaviconObjectClassName}
          data={src}
          tabIndex={-1}
          aria-hidden="true"
        >
          <ChromeIcon
            className={staticLinkFaviconFallbackClassName}
            data-static-link-favicon-fallback="true"
            style={{ fontSize: isBlock ? '2rem' : '1rem' }}
          />
        </object>
      ) : (
        <ChromeIcon
          className={staticLinkFaviconFallbackClassName}
          data-static-link-favicon-fallback="true"
          style={{ fontSize: isBlock ? '2rem' : '1rem' }}
        />
      )}
    </span>
  )
}

export function StaticLinkView({ attrs }: StaticNodeViewProps) {
  const href = normalizeText(attrs.href)
  const target = normalizeText(attrs.target) || '_blank'
  const rel = getLinkRel(target, normalizeText(attrs.rel) || null)
  const title = normalizeText(attrs.title) || getLinkTitle(href)
  const isBlock = attrs.type === 'block'

  if (isBlock) {
    const favicon = getStaticLinkFavicon(href)

    return (
      <a
        className="pk:my-4 pk:flex pk:w-full pk:items-center pk:gap-4 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:p-4 pk:text-left pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)]"
        href={href || undefined}
        target={target}
        rel={rel}
        title={title || undefined}
        type="block"
      >
        <StaticLinkFavicon src={favicon} isBlock />
        <span className="pk:min-w-0 pk:flex-1">
          <span className="pk:block pk:truncate pk:font-medium">{title}</span>
          {href ? <span className="pk:block pk:truncate pk:text-sm pk:text-[var(--editor-muted-foreground)]">{href}</span> : null}
        </span>
      </a>
    )
  }

  return (
    <a
      className="pk:inline-flex pk:max-w-full pk:items-baseline pk:gap-1 pk:rounded-[var(--radius-md)] pk:text-[var(--editor-primary)] pk:no-underline pk:hover:underline"
      href={href || undefined}
      target={target}
      rel={rel}
      title={title || undefined}
      type={normalizeText(attrs.type) || 'icon'}
    >
      {normalizeText(attrs.type) !== 'text' ? <StaticLinkFavicon src={getStaticLinkFavicon(href)} isBlock={false} /> : null}
      <span className="pk:min-w-0 pk:truncate">{title}</span>
    </a>
  )
}

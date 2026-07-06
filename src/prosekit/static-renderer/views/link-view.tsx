import { ChromeIcon } from '../../../icons'
import type { StaticNodeViewProps } from './types'
import { normalizeText } from './utils'

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

export function StaticLinkView({ attrs }: StaticNodeViewProps) {
  const href = normalizeText(attrs.href)
  const target = normalizeText(attrs.target) || '_blank'
  const rel = getLinkRel(target, normalizeText(attrs.rel) || null)
  const title = normalizeText(attrs.title) || getLinkTitle(href)
  const isBlock = attrs.type === 'block'

  if (isBlock) {
    let favicon = ''
    try {
      favicon = href ? `${new URL(href).origin}/favicon.ico` : ''
    } catch {
      favicon = ''
    }

    return (
      <a
        className="pk:my-4 pk:flex pk:w-full pk:items-center pk:gap-4 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:p-4 pk:text-left pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)]"
        href={href || undefined}
        target={target}
        rel={rel}
        title={title || undefined}
        type="block"
      >
        <span className="pk:inline-flex pk:h-8 pk:w-8 pk:shrink-0 pk:items-center pk:justify-center pk:self-center pk:overflow-hidden pk:rounded-full pk:bg-white">
          {favicon ? <img className="pk:h-full pk:w-full pk:object-cover" src={favicon} alt="" /> : <ChromeIcon className="pk:text-[var(--editor-primary)]" style={{ fontSize: '2rem' }} />}
        </span>
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
      <span className="pk:min-w-0 pk:truncate">{title}</span>
    </a>
  )
}

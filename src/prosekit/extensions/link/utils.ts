import type { InlineLinkDisplayType, LinkAttrs, LinkDisplayType, LinkTarget } from './types'
import { LINK_MARK_RE } from './link-regex'

const ALLOWED_PROTOCOLS = new Set([
  'http:',
  'https:',
  'ftp:',
  'ftps:',
  'mailto:',
  'tel:',
  'callto:',
  'sms:',
  'cid:',
  'xmpp:',
])

const TARGET = '_blank'
const TYPE = 'icon'

function normalizeCandidateHref(href: string, defaultProtocol = 'http'): string {
  const trimmed = href.trim()
  if (!trimmed) {
    return ''
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('//')) {
    return `${defaultProtocol}:${trimmed}`
  }

  return `${defaultProtocol}://${trimmed}`
}

export function isAllowedUri(href: string | null | undefined): boolean {
  if (!href) {
    return false
  }

  try {
    const parsed = new URL(normalizeCandidateHref(href))
    return ALLOWED_PROTOCOLS.has(parsed.protocol)
  } catch {
    return false
  }
}

export function normalizeLinkTarget(value: unknown): LinkTarget {
  return value === '_self' ? '_self' : TARGET
}

export function normalizeInlineLinkType(value: unknown): InlineLinkDisplayType {
  return value === 'text' ? 'text' : 'icon'
}

export function normalizeLinkType(value: unknown): LinkDisplayType {
  if (value === 'block') {
    return 'block'
  }

  return normalizeInlineLinkType(value)
}

export function getLinkRel(target: LinkTarget, rel: string | null | undefined) {
  return rel ?? (target === '_blank' ? 'noopener noreferrer' : null)
}

export function toLinkAttrs(rawHref: string, attrs: Partial<LinkAttrs> = {}): LinkAttrs | null {
  const href = normalizeCandidateHref(rawHref)
  if (!isAllowedUri(href)) {
    return null
  }

  const target = normalizeLinkTarget(attrs.target)
  const type = normalizeLinkType(attrs.type ?? TYPE)

  return {
    href,
    target,
    rel: getLinkRel(target, attrs.rel),
    class: attrs.class ?? null,
    title: attrs.title ?? null,
    type,
    download: attrs.download ?? null,
  }
}

export function getLinkMatch(text: string): RegExpExecArray | null {
  const value = text.trim()
  if (!value) {
    return null
  }

  const regex = new RegExp(`^${LINK_MARK_RE.source}$`, 'i')
  return regex.exec(value)
}

export function getSafeHref(rawHref: string | null | undefined): string {
  if (!rawHref) {
    return ''
  }

  const attrs = toLinkAttrs(rawHref)
  return attrs?.href ?? ''
}

export function getLinkTitle(rawHref: string | null | undefined): string {
  const href = rawHref?.trim() ?? ''
  if (!href) {
    return ''
  }

  try {
    const normalized = /^[a-z][a-z0-9+.-]*:/i.test(href) ? href : normalizeCandidateHref(href)
    const url = new URL(normalized)
    const host = url.hostname.replace(/^www\./i, '')
    const path = url.pathname === '/' ? '' : url.pathname
    return `${host}${path}` || href
  } catch {
    return href
  }
}

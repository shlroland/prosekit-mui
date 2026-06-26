import type { CSSProperties, ReactNode } from 'react'
import katex from 'katex'

import {
  Attachment2Icon,
  CheckboxCircleFillIcon,
  ChromeIcon,
  CloseCircleFillIcon,
  ErrorWarningFillIcon,
  FileIcon,
  Information2FillIcon,
  UserSmileFillIcon,
} from '../../../icons'
import { cn } from '../../../utils/cn'
import type { AlertType, AlertVariant } from '../../extensions/alert'
import { getEmojiNativeById } from '../../extensions/emoji/data'
import type { StaticRendererAssetOptions } from '../url'
import { resolveAssetUrl } from '../url'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeAlertVariant(value: unknown): AlertVariant {
  return value === 'info' || value === 'success' || value === 'warning' || value === 'error' || value === 'default'
    ? value
    : 'default'
}

function normalizeAlertType(value: unknown): AlertType {
  return value === 'text' ? 'text' : 'icon'
}

const alertViewState = {
  info: {
    icon: Information2FillIcon,
    color: 'var(--primary)',
    borderColor: 'var(--primary)',
    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
  },
  warning: {
    icon: ErrorWarningFillIcon,
    color: '#ed6c02',
    borderColor: '#ed6c02',
    background: 'color-mix(in srgb, #ed6c02 10%, transparent)',
  },
  error: {
    icon: CloseCircleFillIcon,
    color: 'var(--destructive)',
    borderColor: 'var(--destructive)',
    background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
  },
  success: {
    icon: CheckboxCircleFillIcon,
    color: '#2e7d32',
    borderColor: '#2e7d32',
    background: 'color-mix(in srgb, #2e7d32 10%, transparent)',
  },
  default: {
    icon: UserSmileFillIcon,
    color: 'var(--editor-muted-foreground)',
    borderColor: 'var(--editor-border)',
    background: 'var(--editor-surface-muted)',
  },
} satisfies Record<AlertVariant, {
  icon: typeof Information2FillIcon
  color: string
  borderColor: string
  background: string
}>

export type StaticNodeViewProps = StaticRendererAssetOptions & {
  attrs: Record<string, unknown>
  children?: ReactNode
}

export function StaticDocView({ children }: { children?: ReactNode }) {
  return (
    <div className="ProseMirror prosekit-static-renderer" data-static-renderer="true">
      {children}
    </div>
  )
}

export function StaticAlertView({ attrs, children }: StaticNodeViewProps) {
  const variant = normalizeAlertVariant(attrs.variant)
  const type = normalizeAlertType(attrs.type)
  const state = alertViewState[variant]
  const Icon = state.icon
  const indent = normalizeNumber(attrs.indent)
  const style = {
    marginLeft: indent && indent > 0 ? `${indent * 32}px` : undefined,
    borderColor: state.borderColor,
    background: state.background,
  } satisfies CSSProperties

  return (
    <div
      className="alert-wrapper pk:my-4 pk:flex pk:items-start pk:gap-4 pk:rounded-[var(--radius)] pk:border pk:px-4 pk:py-3"
      data-node="alert"
      data-id={normalizeText(attrs.id) || undefined}
      data-variant={variant}
      data-type={type}
      data-static-renderer="true"
      style={style}
    >
      {type !== 'text' ? (
        <div
          className="pk:flex pk:h-5 pk:w-5 pk:shrink-0 pk:self-center pk:items-center pk:justify-center pk:leading-none"
          aria-hidden="true"
          style={{ color: state.color }}
        >
          <Icon className="pk:h-5 pk:w-5" />
        </div>
      ) : null}
      <div
        className={cn(
          'pk:min-w-0 pk:w-0 pk:flex-1 pk:[&_>_:first-child]:mt-0 pk:[&_>_:last-child]:mb-0',
          variant !== 'default' && 'pk:[&_code]:border-[color-mix(in_srgb,var(--pk-alert-color)_30%,transparent)] pk:[&_code]:bg-[color-mix(in_srgb,var(--pk-alert-color)_10%,transparent)]',
        )}
        style={{ '--pk-alert-color': state.color } as CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

export function StaticDetailsView({ attrs, children }: StaticNodeViewProps) {
  const open = attrs.open !== false

  return (
    <details className={open ? 'cq-details is-open' : 'cq-details'} open={open}>
      {children}
    </details>
  )
}

export function StaticDetailsSummaryView({ children }: { children?: ReactNode }) {
  return (
    <summary className="cq-details-summary pk:relative pk:list-none pk:font-semibold pk:outline-none pk:marker:hidden">
      {children}
    </summary>
  )
}

export function StaticDetailsContentView({ children }: { children?: ReactNode }) {
  return (
    <div className="cq-details-content" data-type="detailsContent">
      {children}
    </div>
  )
}

function formatFileSize(value: unknown): string {
  const text = normalizeText(value).trim()

  if (/[a-z]/i.test(text)) {
    return text
  }

  const bytes = Number.parseInt(text || '0', 10)

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return ''
  }

  const unit = 1024
  const labels = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(unit)), labels.length - 1)

  return `${Number.parseFloat((bytes / unit ** index).toFixed(2))} ${labels[index]}`
}

function isPdfAttachment(attrs: Record<string, unknown>) {
  const title = normalizeText(attrs.title).toLowerCase()
  const type = normalizeText(attrs.type).toLowerCase()
  const url = normalizeText(attrs.url).toLowerCase()

  return title.endsWith('.pdf') || type.includes('pdf') || url.includes('.pdf')
}

export function StaticInlineAttachmentView({ attrs, baseUrl }: StaticNodeViewProps) {
  const href = resolveAssetUrl(attrs.url, baseUrl)
  const title = normalizeText(attrs.title) || '附件'
  const size = formatFileSize(attrs.size)

  return (
    <a
      className="pk:inline-flex pk:max-w-full pk:items-center pk:gap-1.5 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:px-2 pk:py-1 pk:text-[var(--editor-primary)] pk:no-underline"
      data-tag="attachment"
      data-type="icon"
      data-title={title}
      data-size={normalizeText(attrs.size) || '0'}
      href={href || undefined}
      download={title || undefined}
    >
      <Attachment2Icon className="pk:shrink-0 pk:text-base" />
      <span className="pk:min-w-0 pk:truncate">{title}</span>
      {size ? <span className="pk:shrink-0 pk:text-xs pk:text-[var(--editor-muted-foreground)]">{size}</span> : null}
    </a>
  )
}

export function StaticBlockAttachmentView({ attrs, baseUrl }: StaticNodeViewProps) {
  const href = resolveAssetUrl(attrs.url, baseUrl)
  const title = normalizeText(attrs.title) || '附件'
  const size = formatFileSize(attrs.size)
  const view = attrs.view === '1'
  const isPdf = isPdfAttachment(attrs)
  const height = normalizeNumber(attrs.height) ?? 300

  if (view && isPdf && href) {
    return (
      <div
        className="pk:my-4 pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]"
        data-tag="attachment"
        data-type="block"
        data-view="1"
        data-title={title}
        data-size={normalizeText(attrs.size) || '0'}
        data-height={height}
      >
        <div className="pk:flex pk:items-center pk:gap-2 pk:border-b pk:border-[var(--editor-border)] pk:px-4 pk:py-2 pk:text-sm">
          <FileIcon className="pk:text-base pk:text-[var(--editor-primary)]" />
          <a className="pk:min-w-0 pk:truncate pk:text-[var(--editor-primary)] pk:no-underline pk:hover:underline" href={href} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
          {size ? <span className="pk:ml-auto pk:shrink-0 pk:text-xs pk:text-[var(--editor-muted-foreground)]">{size}</span> : null}
        </div>
        <iframe className="pk:block pk:w-full pk:border-0" src={href} title={title} style={{ height }} />
      </div>
    )
  }

  return (
    <a
      className="pk:my-4 pk:flex pk:w-full pk:items-center pk:gap-3 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)]"
      data-tag="attachment"
      data-type="block"
      data-view={view ? '1' : '0'}
      data-title={title}
      data-size={normalizeText(attrs.size) || '0'}
      href={href || undefined}
      download={title || undefined}
    >
      <FileIcon className="pk:shrink-0 pk:text-2xl pk:text-[var(--editor-primary)]" />
      <span className="pk:min-w-0 pk:flex-1">
        <span className="pk:block pk:truncate pk:font-medium">{title}</span>
        {size ? <span className="pk:block pk:text-xs pk:text-[var(--editor-muted-foreground)]">{size}</span> : null}
      </span>
    </a>
  )
}

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
          className="pk:block pk:h-auto pk:max-w-full pk:rounded-[var(--radius)]"
          src={src}
          alt={title}
          title={title || undefined}
          width={width || undefined}
          height={height || undefined}
        />
      ) : null}
      {title ? <figcaption className="pk:mt-2 pk:text-center pk:text-sm pk:text-[var(--editor-muted-foreground)]">{title}</figcaption> : null}
    </figure>
  )
}

function renderKatexMarkup(latex: string, displayMode: boolean) {
  if (!latex.trim()) {
    return ''
  }

  try {
    return katex.renderToString(latex, {
      displayMode,
      errorColor: '#b91c1c',
      output: 'htmlAndMathml',
      strict: 'ignore',
      throwOnError: false,
    })
  } catch {
    return ''
  }
}

export function StaticMathInlineView({ children }: StaticNodeViewProps) {
  const latex = typeof children === 'string' ? children : ''
  const markup = renderKatexMarkup(latex, false)

  return (
    <span className="prosemirror-math-inline" data-static-renderer="true" data-math-empty={latex.trim() ? 'false' : 'true'}>
      <span
        className="prosemirror-math-display"
        dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      >
        {markup ? undefined : latex}
      </span>
    </span>
  )
}

export function StaticMathBlockView({ attrs, children }: StaticNodeViewProps) {
  const latex = typeof children === 'string' ? children : ''
  const language = normalizeText(attrs.language) || 'tex'
  const markup = renderKatexMarkup(latex, true)

  return (
    <div
      className="prosemirror-math-block"
      data-static-renderer="true"
      data-language={language}
      data-math-empty={latex.trim() ? 'false' : 'true'}
    >
      <div
        className="prosemirror-math-display"
        dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
      >
        {markup ? undefined : latex}
      </div>
    </div>
  )
}

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

export function StaticTooltipView({ attrs, children }: StaticNodeViewProps) {
  const text = normalizeText(attrs.text) || normalizeText(attrs.tooltip)
  const id = normalizeText(attrs.id)

  return (
    <span
      data-tooltip-id={id || undefined}
      data-tooltip-text={text}
      data-tooltip={text}
      title={text || undefined}
    >
      {children}
    </span>
  )
}

export function StaticFlipGridView({
  attrs,
  children,
  columnWidths,
}: StaticNodeViewProps & {
  columnWidths?: number[]
}) {
  const gap = normalizeText(attrs.gap) || '1rem'

  return (
    <div
      className="node-flipGrid flip-grid pk:relative pk:my-4 pk:grid pk:w-full"
      data-type="flip-grid"
      data-gap={gap}
      style={{
        gap,
        gridTemplateColumns: columnWidths?.length
          ? columnWidths.map((width) => `minmax(0, ${width}fr)`).join(' ')
          : undefined,
      }}
    >
      {children}
    </div>
  )
}

export function StaticFlipGridColumnView({ attrs, children }: StaticNodeViewProps) {
  const width = normalizeNumber(attrs.width) ?? 50

  return (
    <div
      className="flip-grid-column pk:min-w-0"
      data-type="flip-grid-column"
      data-width={width}
      style={{ width: `${width}%`, flex: `0 0 ${width}%`, minWidth: 0 }}
    >
      {children}
    </div>
  )
}

export function renderEmojiText(attrs: Record<string, unknown>) {
  return normalizeText(attrs.native) || getEmojiNativeById(normalizeText(attrs.name))
}

export function StaticExcalidrawView() {
  return (
    <figure
      className="pk:my-4 pk:flex pk:min-h-12 pk:w-full pk:min-w-[200px] pk:items-center pk:gap-3 pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-4 pk:py-3 pk:text-sm pk:text-[var(--editor-muted-foreground)]"
      data-type="excalidraw"
      data-static-renderer="true"
    >
      <span>Excalidraw 绘图</span>
    </figure>
  )
}

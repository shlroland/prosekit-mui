import { Attachment2Icon, FileIcon } from '../../../icons'
import type { StaticNodeViewProps } from './types'
import { normalizeNumber, normalizeText } from './utils'
import { resolveAssetUrl } from '../url'

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

import type { MarkMapping, NodeMapping } from 'prosekit-static-renderer'
import katex from 'katex'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { getEmojiNativeById } from '../extensions/emoji/data'
import { resolveAssetUrl, type StaticRendererAssetOptions } from './url'
import { attribute, escapeHTML, joinHTML, styleAttribute } from './html-utils'
import { getStaticLinkFavicon, StaticLinkFavicon } from './views/link-view'
import { renderStaticMermaid } from './views/react-static-views'
import { renderHighlightedCodeBlockHTML } from './views/shiki-highlight'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeAlertVariant(value: unknown) {
  return value === 'info' || value === 'success' || value === 'warning' || value === 'error' || value === 'default'
    ? value
    : 'default'
}

function normalizeAlertType(value: unknown) {
  return value === 'text' ? 'text' : 'icon'
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

function renderStaticLinkFaviconHTML(src: string, isBlock: boolean) {
  return renderToStaticMarkup(createElement(StaticLinkFavicon, { src, isBlock }))
}

function renderKatexHTML(value: unknown, displayMode: boolean) {
  const latex = normalizeText(value)

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
    return escapeHTML(latex)
  }
}

export function createBuiltinHTMLNodeMapping(options: StaticRendererAssetOptions = {}): NodeMapping<string> {
  return {
    doc: ({ children }) => `<div class="ProseMirror prosekit-static-renderer" data-static-renderer="true">${joinHTML(children)}</div>`,
    alert: ({ node, children }) => {
      const attrs = node.attrs
      const variant = normalizeAlertVariant(attrs.variant)
      const type = normalizeAlertType(attrs.type)
      const color = variant === 'warning'
        ? '#ed6c02'
        : variant === 'success'
          ? '#2e7d32'
          : variant === 'error'
            ? 'var(--destructive)'
            : variant === 'info'
              ? 'var(--primary)'
              : 'var(--editor-muted-foreground)'
      const style = styleAttribute({
        'border-color': color,
        background: variant === 'default'
          ? 'var(--editor-surface-muted)'
          : `color-mix(in srgb, ${color} 10%, transparent)`,
      })
      const icon = type === 'text'
        ? ''
        : `<div class="pk:flex pk:h-5 pk:w-5 pk:shrink-0 pk:self-center pk:items-center pk:justify-center pk:leading-none" aria-hidden="true" style="color: ${escapeHTML(color)};">●</div>`

      return `<div class="alert-wrapper pk:my-4 pk:flex pk:items-start pk:gap-4 pk:rounded-[var(--radius)] pk:border pk:px-4 pk:py-3" data-node="alert"${attribute('data-id', normalizeText(attrs.id))}${attribute('data-variant', variant)}${attribute('data-type', type)} data-static-renderer="true"${style}>${icon}<div class="pk:min-w-0 pk:w-0 pk:flex-1">${joinHTML(children)}</div></div>`
    },
    details: ({ node, children }) => {
      const open = node.attrs.open !== false
      return `<details class="${open ? 'cq-details is-open' : 'cq-details'}"${open ? ' open=""' : ''}>${joinHTML(children)}</details>`
    },
    detailsSummary: ({ children }) => `<summary class="cq-details-summary pk:relative pk:flex pk:cursor-pointer pk:list-none pk:items-start pk:gap-1 pk:px-4 pk:py-3 pk:font-semibold pk:outline-none pk:marker:hidden"><span class="cq-details-toggle pk:mt-[0.1rem] pk:inline-flex pk:h-6 pk:w-5 pk:shrink-0 pk:items-center pk:justify-center pk:rounded pk:text-[0.625rem] pk:text-[var(--editor-foreground)] pk:before:flex pk:before:h-full pk:before:w-full pk:before:items-center pk:before:justify-center pk:before:content-['▶'] pk:before:transition-transform pk:before:duration-200 pk:before:ease-in-out pk:[details[open]_&]:before:rotate-90" aria-hidden="true"></span><span class="pk:min-h-6 pk:min-w-0 pk:flex-1">${joinHTML(children)}</span></summary>`,
    detailsContent: ({ children }) => `<div class="cq-details-content pk:min-h-6 pk:px-4 pk:pb-4" data-type="detailsContent">${joinHTML(children)}</div>`,
    inlineAttachment: ({ node }) => {
      const attrs = node.attrs
      const href = resolveAssetUrl(attrs.url, options.baseUrl)
      const title = normalizeText(attrs.title) || '附件'
      const size = formatFileSize(attrs.size)

      return `<a class="pk:inline-flex pk:max-w-full pk:items-center pk:gap-1.5 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:px-2 pk:py-1 pk:text-[var(--editor-primary)] pk:no-underline" data-tag="attachment" data-type="icon"${attribute('data-title', title)}${attribute('data-size', normalizeText(attrs.size) || '0')}${attribute('href', href)}${attribute('download', title)}><span class="pk:min-w-0 pk:truncate">${escapeHTML(title)}</span>${size ? `<span class="pk:shrink-0 pk:text-xs pk:text-[var(--editor-muted-foreground)]">${escapeHTML(size)}</span>` : ''}</a>`
    },
    blockAttachment: ({ node }) => {
      const attrs = node.attrs
      const href = resolveAssetUrl(attrs.url, options.baseUrl)
      const title = normalizeText(attrs.title) || '附件'
      const size = formatFileSize(attrs.size)
      const view = attrs.view === '1'
      const height = normalizeNumber(attrs.height) ?? 300

      if (view && isPdfAttachment(attrs) && href) {
        return `<div class="pk:my-4 pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]" data-tag="attachment" data-type="block" data-view="1"${attribute('data-title', title)}${attribute('data-size', normalizeText(attrs.size) || '0')}${attribute('data-height', height)}><div class="pk:flex pk:items-center pk:gap-2 pk:border-b pk:border-[var(--editor-border)] pk:px-4 pk:py-2 pk:text-sm"><a class="pk:min-w-0 pk:truncate pk:text-[var(--editor-primary)] pk:no-underline pk:hover:underline"${attribute('href', href)} target="_blank" rel="noopener noreferrer">${escapeHTML(title)}</a>${size ? `<span class="pk:ml-auto pk:shrink-0 pk:text-xs pk:text-[var(--editor-muted-foreground)]">${escapeHTML(size)}</span>` : ''}</div><iframe class="pk:block pk:w-full pk:border-0"${attribute('src', href)}${attribute('title', title)} style="height: ${height}px;"></iframe></div>`
      }

      return `<a class="pk:my-4 pk:flex pk:w-full pk:items-center pk:gap-3 pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)]" data-tag="attachment" data-type="block"${attribute('data-view', view ? '1' : '0')}${attribute('data-title', title)}${attribute('data-size', normalizeText(attrs.size) || '0')}${attribute('href', href)}${attribute('download', title)}><span class="pk:min-w-0 pk:flex-1"><span class="pk:block pk:truncate pk:font-medium">${escapeHTML(title)}</span>${size ? `<span class="pk:block pk:text-xs pk:text-[var(--editor-muted-foreground)]">${escapeHTML(size)}</span>` : ''}</span></a>`
    },
    image: ({ node }) => {
      const attrs = node.attrs
      const src = resolveAssetUrl(attrs.src, options.baseUrl)
      const title = normalizeText(attrs.title)
      const width = normalizeNumber(attrs.width)
      const height = normalizeNumber(attrs.height)
      const align = attrs.align === 'center' || attrs.align === 'right' ? attrs.align : 'left'
      const figureStyle = styleAttribute({
        'margin-left': align === 'center' || align === 'right' ? 'auto' : '0',
        'margin-right': align === 'center' ? 'auto' : align === 'right' ? '0' : 'auto',
        width: width ? `${Math.min(width, 1200)}px` : null,
        'max-width': '100%',
      })
      const image = src
        ? `<img class="pk:block pk:h-auto pk:max-w-full pk:cursor-zoom-in pk:rounded-[var(--radius)]" data-image-viewer-item${attribute('data-src', src)}${attribute('src', src)}${attribute('alt', title)}${attribute('title', title)}${attribute('width', width)}${attribute('height', height)}>`
        : ''
      const caption = title ? `<figcaption class="pk:mt-2 pk:text-center pk:text-sm pk:text-[var(--editor-muted-foreground)]">${escapeHTML(title)}</figcaption>` : ''

      return `<figure class="pk:my-4 pk:max-w-full"${attribute('data-image-align', align)}${figureStyle}>${image}${caption}</figure>`
    },
    codeBlock: ({ node }) => {
      const source = node.textContent
      const language = normalizeText(node.attrs.language) || 'text'

      if (language === 'mermaid') {
        const preview = renderStaticMermaid(source)
        const previewHTML = preview.error
          ? `<div class="pk:rounded-lg pk:border pk:border-[color:rgb(220_38_38_/_0.18)] pk:bg-[color:rgb(220_38_38_/_0.08)] pk:p-3 pk:text-sm pk:text-[color:rgb(153_27_27)]"><div class="pk:mb-1 pk:font-medium">Mermaid 语法错误</div><pre class="pk:m-0 pk:whitespace-pre-wrap pk:bg-transparent pk:p-0 pk:text-[13px] pk:leading-6 pk:text-inherit">${escapeHTML(preview.error)}</pre></div>`
          : preview.svg
            ? `<div class="pk:overflow-auto pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4">${preview.svg}</div>`
            : '<div class="pk:flex pk:min-h-[144px] pk:items-center pk:justify-center pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-6 pk:text-sm pk:text-[var(--editor-muted-foreground)]">空 Mermaid 图表</div>'

        return `<figure class="prosekit-static-mermaid pk:my-4 pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]" data-language="mermaid" data-static-renderer="true"><div class="pk:border-b pk:border-[var(--editor-border)] pk:px-4 pk:py-2 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">Mermaid</div><div class="pk:bg-[var(--editor-surface-muted)] pk:p-4">${previewHTML}</div><details class="prosekit-static-mermaid-source pk:border-t pk:border-[var(--editor-border)]" data-static-mermaid-source="true"><summary class="pk:cursor-pointer pk:px-4 pk:py-2 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">Mermaid 源码</summary>${renderHighlightedCodeBlockHTML(source, 'mermaid')}</details></figure>`
      }

      return renderHighlightedCodeBlockHTML(source, language)
    },
    mathInline: ({ node }) => {
      const latex = node.textContent
      const html = renderKatexHTML(latex, false)

      return `<span class="prosemirror-math-inline" data-static-renderer="true" data-math-empty="${latex.trim() ? 'false' : 'true'}"><span class="prosemirror-math-display">${html}</span></span>`
    },
    mathBlock: ({ node }) => {
      const latex = node.textContent
      const language = normalizeText(node.attrs.language) || 'tex'
      const html = renderKatexHTML(latex, true)

      return `<div class="prosemirror-math-block" data-static-renderer="true"${attribute('data-language', language)} data-math-empty="${latex.trim() ? 'false' : 'true'}"><div class="prosemirror-math-display">${html}</div></div>`
    },
    inlineLink: ({ node }) => {
      const attrs = node.attrs
      const href = normalizeText(attrs.href)
      const target = normalizeText(attrs.target) || '_blank'
      const rel = getLinkRel(target, normalizeText(attrs.rel) || null)
      const title = normalizeText(attrs.title) || getLinkTitle(href)
      const type = normalizeText(attrs.type) || 'icon'
      const favicon = type === 'text' ? '' : renderStaticLinkFaviconHTML(getStaticLinkFavicon(href), false)

      return `<a class="pk:inline-flex pk:max-w-full pk:items-baseline pk:gap-1 pk:rounded-[var(--radius-md)] pk:text-[var(--editor-primary)] pk:no-underline pk:hover:underline"${attribute('href', href)}${attribute('target', target)}${attribute('rel', rel)}${attribute('title', title)}${attribute('type', type)}>${favicon}<span class="pk:min-w-0 pk:truncate">${escapeHTML(title)}</span></a>`
    },
    blockLink: ({ node }) => {
      const attrs = node.attrs
      const href = normalizeText(attrs.href)
      const target = normalizeText(attrs.target) || '_blank'
      const rel = getLinkRel(target, normalizeText(attrs.rel) || null)
      const title = normalizeText(attrs.title) || getLinkTitle(href)
      const favicon = getStaticLinkFavicon(href)

      return `<a class="pk:my-4 pk:flex pk:w-full pk:items-center pk:gap-4 pk:rounded-[var(--radius-md)] pk:border pk:border-[var(--editor-border)] pk:p-4 pk:text-left pk:text-[inherit] pk:no-underline pk:hover:border-[var(--editor-primary)]"${attribute('href', href)}${attribute('target', target)}${attribute('rel', rel)}${attribute('title', title)} type="block">${renderStaticLinkFaviconHTML(favicon, true)}<span class="pk:min-w-0 pk:flex-1"><span class="pk:block pk:truncate pk:font-medium">${escapeHTML(title)}</span>${href ? `<span class="pk:block pk:truncate pk:text-sm pk:text-[var(--editor-muted-foreground)]">${escapeHTML(href)}</span>` : ''}</span></a>`
    },
    flipGrid: ({ node, children }) => {
      const gap = normalizeText(node.attrs.gap) || '1rem'
      const widths: number[] = []
      node.forEach((child) => {
        widths.push(normalizeNumber(child.attrs.width) ?? 50)
      })
      const style = styleAttribute({
        gap,
        'grid-template-columns': widths.length ? widths.map((width) => `minmax(0, ${width}fr)`).join(' ') : null,
      })

      return `<div class="node-flipGrid flip-grid pk:relative pk:my-4 pk:grid pk:w-full" data-type="flip-grid"${attribute('data-gap', gap)}${style}>${joinHTML(children)}</div>`
    },
    flipGridColumn: ({ node, children }) => {
      const width = normalizeNumber(node.attrs.width) ?? 50
      const style = styleAttribute({
        width: `${width}%`,
        flex: `0 0 ${width}%`,
        'min-width': 0,
      })

      return `<div class="flip-grid-column pk:min-w-0" data-type="flip-grid-column"${attribute('data-width', width)}${style}>${joinHTML(children)}</div>`
    },
    emoji: ({ node }) => {
      return escapeHTML(normalizeText(node.attrs.native) || getEmojiNativeById(normalizeText(node.attrs.name)))
    },
    excalidraw: ({ node }) => {
      const attrs = node.attrs
      const src = resolveAssetUrl(attrs.src || attrs.url, options.baseUrl)
      const title = normalizeText(attrs.title)
      const width = normalizeNumber(attrs.width)
      const height = normalizeNumber(attrs.height)

      if (!src) {
        return ''
      }

      return `<figure class="pk:my-4 pk:max-w-full" data-type="excalidraw" data-static-renderer="true"><img class="pk:block pk:h-auto pk:max-w-full pk:rounded-[var(--radius)]"${attribute('src', src)}${attribute('alt', title)}${attribute('title', title)}${attribute('width', width)}${attribute('height', height)}></figure>`
    },
  }
}

export function createBuiltinHTMLMarkMapping(): MarkMapping<string> {
  return {
    tooltip: ({ mark, children }) => {
      const text = normalizeText(mark.attrs.text) || normalizeText(mark.attrs.tooltip)
      const id = normalizeText(mark.attrs.id)

      return `<span${attribute('data-tooltip-id', id)}${attribute('data-tooltip-text', text)}${attribute('data-tooltip', text)}${attribute('title', text)}>${children}</span>`
    },
    fontSize: ({ mark, children }) => {
      const size = normalizeText(mark.attrs.size)
      return `<span${attribute('data-font-size', size)}${styleAttribute({ 'font-size': size || null })}>${children}</span>`
    },
    fontFamily: ({ mark, children }) => {
      const family = normalizeText(mark.attrs.family)
      return `<span${attribute('data-font-family', family)}${styleAttribute({ 'font-family': family || null })}>${children}</span>`
    },
  }
}

import type { NodeJSON } from 'prosekit/core'
import { type ReactElement } from 'react'

import {
  editorDiff,
  type EditorDiffInput,
  type EditorDiffOptions,
  type EditorDiffResult,
} from '../editor-diff'
import {
  getDeletedNodePreviewText,
  type DiffItem,
} from '../extensions/diff'
import { attribute, escapeHTML, joinHTML, styleAttribute } from './html-utils'
import { renderProseKitHTML, type ProseKitHTMLRendererOptions } from './html-renderer'

type MarkJSON = {
  type: string
  attrs?: Record<string, unknown>
}

type TextChar = {
  value: string
  marks: MarkJSON[]
}

type TextSegment = {
  text: string
  className: string
  marksKey: string
  marks: MarkJSON[]
}

type DiffIndex = {
  byPath: Map<string, DiffItem[]>
  descendantPaths: Set<string>
}

export type StaticEditorDiffOptions =
  & EditorDiffOptions
  & ProseKitHTMLRendererOptions
  & {
    className?: string
  }

export type StaticEditorDiffViewProps = {
  oldContent: EditorDiffInput
  newContent: EditorDiffInput
  options?: StaticEditorDiffOptions
  className?: string
}

function pathKey(path: number[]): string {
  return path.join('.')
}

function createDiffIndex(diffs: DiffItem[]): DiffIndex {
  const byPath = new Map<string, DiffItem[]>()
  const descendantPaths = new Set<string>()

  for (const diff of diffs) {
    const key = pathKey(diff.path)
    byPath.set(key, [...(byPath.get(key) || []), diff])

    for (let i = 0; i < diff.path.length; i += 1) {
      descendantPaths.add(pathKey(diff.path.slice(0, i)))
    }
  }

  return { byPath, descendantPaths }
}

function getDiffsAt(index: DiffIndex, path: number[]): DiffItem[] {
  return index.byPath.get(pathKey(path)) || []
}

function hasDiffInDescendant(index: DiffIndex, path: number[]): boolean {
  return index.descendantPaths.has(pathKey(path))
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function renderStaticNodeHTML(node: NodeJSON, options: StaticEditorDiffOptions): string {
  const html = renderProseKitHTML({ type: 'doc', content: [node] }, options)
  const wrapper = '<div class="ProseMirror prosekit-static-renderer" data-static-renderer="true">'

  let result = html

  while (result.startsWith(wrapper) && result.endsWith('</div>')) {
    result = result.slice(wrapper.length, -'</div>'.length)
  }

  return result
}

function addClassToFirstTag(html: string, className: string): string {
  if (!html || !className) {
    return html
  }

  return html.replace(/^<([a-zA-Z0-9:-]+)([^>]*)>/, (match, tag: string, attrs: string) => {
    const classMatch = attrs.match(/\sclass="([^"]*)"/)

    if (classMatch) {
      const nextClass = `${classMatch[1]} ${className}`.trim()
      return `<${tag}${attrs.replace(classMatch[0], ` class="${escapeHTML(nextClass)}"`)}>`
    }

    return `<${tag} class="${className}"${attrs}>`
  })
}

function renderDeletePreviewHTML(diff: DiffItem, options: StaticEditorDiffOptions): string {
  const deletedText = diff.textDiff?.text
    || (diff.node ? getDeletedNodePreviewText(diff.node, options) : '')
    || '[已删除]'

  return `<span class="prosekit-diff-delete" title="${escapeHTML(`删除的内容: ${deletedText}`)}">${escapeHTML(deletedText)}</span>`
}

function renderMarksHTML(text: string, marks: MarkJSON[]): string {
  return marks.reduce((children, mark) => {
    const attrs = mark.attrs || {}

    switch (mark.type) {
      case 'bold':
        return `<strong>${children}</strong>`
      case 'italic':
        return `<em>${children}</em>`
      case 'underline':
        return `<u>${children}</u>`
      case 'strike':
        return `<s>${children}</s>`
      case 'code':
        return `<code>${children}</code>`
      case 'subscript':
        return `<sub>${children}</sub>`
      case 'superscript':
        return `<sup>${children}</sup>`
      case 'fontSize':
        return `<span${attribute('data-font-size', normalizeText(attrs.size))}${styleAttribute({ 'font-size': normalizeText(attrs.size) || null })}>${children}</span>`
      case 'fontFamily':
        return `<span${attribute('data-font-family', normalizeText(attrs.family))}${styleAttribute({ 'font-family': normalizeText(attrs.family) || null })}>${children}</span>`
      case 'textColor':
        return `<span${styleAttribute({ color: normalizeText(attrs.color) || null })}>${children}</span>`
      case 'backgroundColor':
      case 'highlight':
        return `<span${styleAttribute({ 'background-color': normalizeText(attrs.color) || null })}>${children}</span>`
      case 'tooltip': {
        const tooltipText = normalizeText(attrs.text) || normalizeText(attrs.tooltip)
        const id = normalizeText(attrs.id)
        return `<span${attribute('data-tooltip-id', id)}${attribute('data-tooltip-text', tooltipText)}${attribute('data-tooltip', tooltipText)}${attribute('title', tooltipText)}>${children}</span>`
      }
      default:
        return children
    }
  }, escapeHTML(text))
}

function getMarkKey(marks: MarkJSON[]): string {
  return JSON.stringify(marks.map((mark) => ({ type: mark.type, attrs: mark.attrs || {} })))
}

function collectInlineChars(node: NodeJSON): Array<TextChar | NodeJSON> {
  const result: Array<TextChar | NodeJSON> = []

  for (const child of node.content || []) {
    if (child.type !== 'text') {
      result.push(child)
      continue
    }

    const marks = [...((child.marks || []) as MarkJSON[])]

    for (const value of child.text || '') {
      result.push({ value, marks })
    }
  }

  return result
}

function getInlineClassAt(offset: number, diffs: DiffItem[]): string {
  const classes: string[] = []

  for (const diff of diffs) {
    if (diff.type === 'insert' && diff.textDiff) {
      const start = diff.textDiff.offset
      const end = start + diff.textDiff.length

      if (offset >= start && offset < end) {
        classes.push('prosekit-diff-insert')
      }
    }

    if (
      diff.type === 'modify'
      && diff.attrChange?.key === 'marks'
      && typeof diff.attrChange.fromOffset === 'number'
      && typeof diff.attrChange.toOffset === 'number'
      && offset >= diff.attrChange.fromOffset
      && offset < diff.attrChange.toOffset
    ) {
      classes.push('prosekit-diff-modify')
    }
  }

  return Array.from(new Set(classes)).join(' ')
}

function renderTextSegments(chars: TextChar[], diffs: DiffItem[], offsetStart: number): string {
  const segments: TextSegment[] = []

  chars.forEach((char, index) => {
    const className = getInlineClassAt(offsetStart + index, diffs)
    const marksKey = getMarkKey(char.marks)
    const previous = segments[segments.length - 1]

    if (previous?.className === className && previous.marksKey === marksKey) {
      previous.text += char.value
      return
    }

    segments.push({
      text: char.value,
      className,
      marksKey,
      marks: char.marks,
    })
  })

  return segments.map((segment) => {
    const content = renderMarksHTML(segment.text, segment.marks)
    return segment.className
      ? `<span class="${segment.className}">${content}</span>`
      : content
  }).join('')
}

function renderInlineContentHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
): string {
  const diffs = getDiffsAt(index, path)
  const children = collectInlineChars(node)
  const html: string[] = []
  let textOffset = 0
  let textBuffer: TextChar[] = []

  const flushText = () => {
    if (!textBuffer.length) {
      return
    }

    const start = textOffset
    html.push(renderTextSegments(textBuffer, diffs, start))
    textOffset += textBuffer.length
    textBuffer = []
  }

  const renderTextDeletesAt = (offset: number) => {
    diffs
      .filter((diff) => diff.type === 'delete' && diff.textDiff?.offset === offset)
      .forEach((diff) => html.push(renderDeletePreviewHTML(diff, options)))
  }

  renderTextDeletesAt(0)

  children.forEach((child, childIndex) => {
    if ('value' in child) {
      textBuffer.push(child)

      const nextOffset = textOffset + textBuffer.length
      const hasDeleteAfterChar = diffs.some((diff) => diff.type === 'delete' && diff.textDiff?.offset === nextOffset)

      if (hasDeleteAfterChar) {
        flushText()
        renderTextDeletesAt(nextOffset)
      }

      return
    }

    flushText()
    renderDeletedChildrenAt(path, childIndex, index, options).forEach((item) => html.push(item))
    html.push(renderNodeHTML(child, [...path, childIndex], index, options))
  })

  flushText()
  renderTextDeletesAt(textOffset)

  return html.join('')
}

function renderDeletedChildrenAt(
  parentPath: number[],
  index: number,
  diffIndex: DiffIndex,
  options: StaticEditorDiffOptions,
): string[] {
  return getDiffsAt(diffIndex, [...parentPath, index])
    .filter((diff) => diff.type === 'delete' && diff.node && !diff.textDiff)
    .map((diff) => renderDeletePreviewHTML(diff, options))
}

function renderChildrenHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
): string {
  const children = node.content || []
  const html: string[] = []

  children.forEach((child, childIndex) => {
    renderDeletedChildrenAt(path, childIndex, index, options).forEach((item) => html.push(item))
    html.push(renderNodeHTML(child, [...path, childIndex], index, options))
  })

  renderDeletedChildrenAt(path, children.length, index, options).forEach((item) => html.push(item))

  return html.join('')
}

function renderListHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
): string {
  const kind = normalizeText(node.attrs?.kind)
  const tag = kind === 'ordered' ? 'ol' : 'ul'
  const children = renderChildrenHTML(node, path, index, options)

  return `<${tag}><li>${children}</li></${tag}>`
}

function renderTableCellHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
  tag: 'td' | 'th',
): string {
  const attrs = node.attrs || {}
  const colspan = normalizeNumber(attrs.colspan)
  const rowspan = normalizeNumber(attrs.rowspan)

  return `<${tag}${attribute('colspan', colspan && colspan > 1 ? colspan : null)}${attribute('rowspan', rowspan && rowspan > 1 ? rowspan : null)}>${renderChildrenHTML(node, path, index, options)}</${tag}>`
}

function renderNodeBodyHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
): string {
  switch (node.type) {
    case 'doc':
      return renderChildrenHTML(node, path, index, options)
    case 'text':
      return renderMarksHTML(node.text || '', (node.marks || []) as MarkJSON[])
    case 'paragraph': {
      const textAlign = normalizeText(node.attrs?.textAlign)
      const style = styleAttribute({ 'text-align': textAlign || null })
      const content = node.content?.length
        ? renderInlineContentHTML(node, path, index, options)
        : '<br class="ProseMirror-trailingBreak">'

      return `<p${style}>${content}</p>`
    }
    case 'heading': {
      const level = Math.min(Math.max(normalizeNumber(node.attrs?.level) || 1, 1), 6)
      const textAlign = normalizeText(node.attrs?.textAlign)
      const style = styleAttribute({ 'text-align': textAlign || null })

      return `<h${level}${style}>${renderInlineContentHTML(node, path, index, options)}</h${level}>`
    }
    case 'hardBreak':
      return '<br>'
    case 'horizontalRule':
      return '<hr>'
    case 'blockquote':
      return `<blockquote>${renderChildrenHTML(node, path, index, options)}</blockquote>`
    case 'bulletList':
      return `<ul>${renderChildrenHTML(node, path, index, options)}</ul>`
    case 'orderedList':
      return `<ol>${renderChildrenHTML(node, path, index, options)}</ol>`
    case 'listItem':
    case 'taskItem':
      return `<li>${renderChildrenHTML(node, path, index, options)}</li>`
    case 'list':
      return renderListHTML(node, path, index, options)
    case 'details': {
      const open = node.attrs?.open !== false
      return `<details class="${open ? 'cq-details is-open' : 'cq-details'}"${open ? ' open=""' : ''}>${renderChildrenHTML(node, path, index, options)}</details>`
    }
    case 'detailsSummary':
      return `<summary class="cq-details-summary pk:relative pk:flex pk:cursor-pointer pk:list-none pk:items-start pk:gap-1 pk:px-4 pk:py-3 pk:font-semibold pk:outline-none pk:marker:hidden"><span class="cq-details-toggle pk:mt-[0.1rem] pk:inline-flex pk:h-6 pk:w-5 pk:shrink-0 pk:items-center pk:justify-center pk:rounded pk:text-[0.625rem] pk:text-[var(--editor-foreground)] pk:before:flex pk:before:h-full pk:before:w-full pk:before:items-center pk:before:justify-center pk:before:content-['▶'] pk:before:transition-transform pk:before:duration-200 pk:before:ease-in-out pk:[details[open]_&]:before:rotate-90" aria-hidden="true"></span><span class="pk:min-h-6 pk:min-w-0 pk:flex-1">${renderInlineContentHTML(node, path, index, options)}</span></summary>`
    case 'detailsContent':
      return `<div class="cq-details-content pk:min-h-6 pk:px-4 pk:pb-4" data-type="detailsContent">${renderChildrenHTML(node, path, index, options)}</div>`
    case 'table':
      return `<table><tbody>${renderChildrenHTML(node, path, index, options)}</tbody></table>`
    case 'tableRow':
      return `<tr>${renderChildrenHTML(node, path, index, options)}</tr>`
    case 'tableCell':
      return renderTableCellHTML(node, path, index, options, 'td')
    case 'tableHeader':
      return renderTableCellHTML(node, path, index, options, 'th')
    default:
      if (hasDiffInDescendant(index, path)) {
        return addClassToFirstTag(renderStaticNodeHTML(node, options), 'prosekit-diff-modify-node')
      }

      return renderStaticNodeHTML(node, options)
  }
}

function renderNodeHTML(
  node: NodeJSON,
  path: number[],
  index: DiffIndex,
  options: StaticEditorDiffOptions,
): string {
  const exactDiffs = getDiffsAt(index, path)
  let html = renderNodeBodyHTML(node, path, index, options)

  if (node.type === 'doc') {
    return html
  }

  if (exactDiffs.some((diff) => diff.type === 'insert' && !diff.textDiff)) {
    html = addClassToFirstTag(html, 'prosekit-diff-insert-node')
  }

  if (exactDiffs.some((diff) => diff.type === 'modify' && diff.attrChange?.key !== 'marks')) {
    html = addClassToFirstTag(html, 'prosekit-diff-modify-node')
  }

  return html
}

export function renderEditorDiffHTML(
  oldContent: EditorDiffInput,
  newContent: EditorDiffInput,
  options: StaticEditorDiffOptions = {},
): string {
  const comparison = editorDiff(oldContent, newContent, options)
  return renderEditorDiffResultHTML(comparison, options)
}

export function renderEditorDiffResultHTML(
  comparison: EditorDiffResult,
  options: StaticEditorDiffOptions = {},
): string {
  const index = createDiffIndex(comparison.diffs)
  const content = renderNodeHTML(comparison.current, [], index, options)
  const classes = [
    'ProseMirror',
    'prosekit-static-renderer',
    'prosekit-static-diff-renderer',
    options.className,
  ].filter(Boolean).join(' ')

  return `<div class="${escapeHTML(classes)}" data-static-renderer="true" data-static-diff-renderer="true">${joinHTML(content)}</div>`
}

export function StaticEditorDiffView({
  oldContent,
  newContent,
  options,
  className,
}: StaticEditorDiffViewProps): ReactElement {
  const html = renderEditorDiffHTML(oldContent, newContent, {
    ...options,
    className: [options?.className, className].filter(Boolean).join(' ') || undefined,
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

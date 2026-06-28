import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import { Fragment, Slice, type Node as ProseMirrorNode } from 'prosekit/pm/model'
import { NodeSelection, TextSelection } from 'prosekit/pm/state'
import type { EditorView } from 'prosekit/pm/view'
import { useEditor } from 'prosekit/react'
import {
  BlockHandlePopup,
  BlockHandlePositioner,
  BlockHandleRoot,
} from 'prosekit/react/block-handle'
import type { BlockHandleStateChangeEvent } from 'prosekit/web/block-handle'

import {
  AddLineIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownSLineIcon,
  AttachmentLineIcon,
  BrushLineIcon,
  CodeBoxLineIcon,
  CollapseIcon,
  DeleteLineIcon,
  DownloadLineIcon,
  DraggableIcon,
  EraserLineIcon,
  ErrorWarningFillIcon,
  FileCopyLineIcon,
  FlipGridIcon,
  FlowChartIcon,
  FontSizeIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  ImageAddLineIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
  Information2LineIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MindMapIcon,
  QuoteTextIcon,
  Repeat2LineIcon,
  ScissorsCutLineIcon,
  SeparatorIcon,
  Table2Icon,
  TextIcon,
  TextWrapIcon,
} from '../../icons'
import { cn } from '../../utils/cn'
import { EditorFloatingPopover, EditorHoverPopover } from '../../ui'
import { defaultMermaidTemplate } from '../extensions/mermaid'

import './block-handle.css'

type BlockHandleState = {
  node: ProseMirrorNode
  pos: number
} | null

type ActiveBlockHandleState = Exclude<BlockHandleState, null>

type FrozenAnchor = {
  getBoundingClientRect: () => DOMRect
}

type BlockMenuAction = {
  key: string
  label: string
  icon: ReactNode
  shortcut?: string
  extra?: ReactNode
  selected?: boolean
  disabled?: boolean
  onSelect: () => void
}

type DownloadResource = {
  key: string
  type: 'image' | 'attachment'
  url: string
  filename: string
}

type LinewiseTarget =
  | { type: 'paragraph' }
  | { type: 'heading', level: 1 | 2 | 3 }
  | { type: 'list', kind: 'bullet' | 'ordered' | 'task' }
  | { type: 'blockquote' }
  | { type: 'codeBlock' }
  | { type: 'alert', attrs: { variant: 'info' | 'warning', type: 'icon' } }

type ColorPreset = {
  key: string
  label: string
  value: string | null
}

type FontSizePreset = {
  key: string
  label: string
  value: string | null
}

const popupClassName = cn(
  'prosekit-block-handle-popup',
  'pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:border pk:border-[var(--editor-border)]',
  'pk:bg-[var(--editor-surface)] pk:p-1 pk:text-[var(--editor-muted-foreground)]',
  'pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)] pk:outline-none',
)

const handleButtonClassName = cn(
  'prosekit-block-handle-button',
  'pk:flex pk:h-7 pk:w-7 pk:cursor-pointer pk:items-center pk:justify-center',
  'pk:rounded-md pk:border-0 pk:bg-transparent pk:p-0 pk:text-[var(--editor-muted-foreground)]',
  'pk:outline-none pk:transition-colors hover:pk:bg-[var(--editor-muted)] hover:pk:text-[var(--editor-foreground)]',
  'pk:focus-visible:bg-[var(--editor-muted)] pk:focus-visible:text-[var(--editor-foreground)]',
)

const menuPopupClassName = cn(
  'prosekit-block-handle-menu-popup',
  'pk:z-[1500] pk:min-w-[216px] pk:rounded-xl pk:border pk:border-[var(--editor-border)]',
  'pk:bg-[var(--editor-surface)] pk:p-1 pk:text-[var(--editor-foreground)]',
  'pk:max-h-[min(620px,var(--available-height))] pk:overflow-y-auto',
  'pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)] pk:outline-none',
)

const menuItemClassName = cn(
  'pk:grid pk:min-h-8 pk:w-full pk:grid-cols-[1rem_minmax(0,1fr)_auto] pk:items-center pk:gap-2',
  'pk:rounded-lg pk:px-2.5 pk:py-1.5 pk:text-left pk:text-[13px] pk:leading-none pk:outline-none',
  'pk:text-[var(--editor-foreground)] pk:hover:bg-[var(--editor-muted)] pk:focus-visible:bg-[var(--editor-muted)]',
  'data-[highlighted]:pk:bg-[var(--editor-muted)] data-[disabled]:pk:pointer-events-none data-[disabled]:pk:opacity-40',
)

const menuIconClassName = 'pk:h-4 pk:w-4'
const quickButtonClassName = cn(
  'pk:flex pk:h-8 pk:w-8 pk:items-center pk:justify-center pk:rounded-lg pk:border-0 pk:bg-transparent pk:p-0',
  'pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors',
  'hover:pk:bg-[var(--editor-muted)] hover:pk:text-[var(--editor-foreground)]',
  'focus-visible:pk:bg-[var(--editor-muted)] focus-visible:pk:text-[var(--editor-foreground)]',
  'disabled:pk:pointer-events-none disabled:pk:opacity-40',
)
const submenuTriggerClassName = cn(
  menuItemClassName,
  'pk:grid-cols-[1rem_minmax(0,1fr)_1rem]',
)

const textColorPresets: ColorPreset[] = [
  { key: 'foreground', label: '默认文字', value: null },
  { key: 'blue', label: '蓝色', value: '#2563eb' },
  { key: 'green', label: '绿色', value: '#16a34a' },
  { key: 'amber', label: '琥珀色', value: '#d97706' },
  { key: 'red', label: '红色', value: '#dc2626' },
  { key: 'purple', label: '紫色', value: '#7c3aed' },
]

const backgroundColorPresets: ColorPreset[] = [
  { key: 'transparent', label: '透明背景', value: null },
  { key: 'blue-tint', label: '浅蓝', value: '#dbeafe' },
  { key: 'green-tint', label: '浅绿', value: '#dcfce7' },
  { key: 'amber-tint', label: '浅黄', value: '#fef3c7' },
  { key: 'red-tint', label: '浅红', value: '#fee2e2' },
  { key: 'purple-tint', label: '浅紫', value: '#ede9fe' },
]

const fontSizePresets: FontSizePreset[] = [
  { key: 'default', label: '默认字号', value: null },
  ...[10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64].map((size) => ({
    key: `${size}px`,
    label: `${size}px`,
    value: `${size}px`,
  })),
]

function isSameBlockState(a: BlockHandleState, b: BlockHandleState) {
  if (!a || !b) {
    return a === b
  }

  return a.pos === b.pos && a.node.eq(b.node)
}

function setViewDragging(view: EditorView, state: ActiveBlockHandleState) {
  ;(view as EditorView & {
    dragging?: {
      slice: Slice
      move: boolean
    }
  }).dragging = {
    slice: new Slice(Fragment.from(state.node), 0, 0),
    move: true,
  }
}

function getNodeLabel(node: ProseMirrorNode | null) {
  if (!node) {
    return '块'
  }

  if (node.type.name === 'heading') {
    return `标题 ${node.attrs.level ?? 1}`
  }

  if (node.type.name === 'list') {
    if (node.attrs.kind === 'ordered') {
      return '有序列表'
    }

    if (node.attrs.kind === 'task') {
      return '任务列表'
    }

    return '无序列表'
  }

  const labels: Record<string, string> = {
    paragraph: '正文',
    blockquote: '引用',
    codeBlock: '代码块',
    alert: '警告块',
    details: '折叠面板',
    image: '图片',
    table: '表格',
    horizontalRule: '分割线',
    flipGrid: '分栏',
    excalidraw: 'Excalidraw 绘图',
  }

  return labels[node.type.name] ?? node.type.name
}

function normalizeDownloadName(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  return fallback
}

function getDownloadResources(node: ProseMirrorNode | null) {
  const resources: DownloadResource[] = []

  function collect(child: ProseMirrorNode, path: string) {
    if (child.type.name === 'image' && typeof child.attrs.src === 'string' && child.attrs.src) {
      resources.push({
        key: `${path}-image`,
        type: 'image',
        url: child.attrs.src,
        filename: normalizeDownloadName(child.attrs.title, child.attrs.src.split('/').pop() || 'image'),
      })
    }

    if (
      (child.type.name === 'blockAttachment' || child.type.name === 'inlineAttachment')
      && typeof child.attrs.url === 'string'
      && child.attrs.url
    ) {
      resources.push({
        key: `${path}-attachment`,
        type: 'attachment',
        url: child.attrs.url,
        filename: normalizeDownloadName(child.attrs.title, child.attrs.url.split('/').pop() || 'attachment'),
      })
    }
  }

  if (!node) {
    return resources
  }

  collect(node, 'self')
  node.descendants((child, pos) => {
    collect(child, String(pos))
  })

  return resources
}

function triggerDownload(resource: DownloadResource) {
  const link = document.createElement('a')
  link.href = resource.url
  link.download = resource.filename
  link.rel = 'noopener noreferrer'
  document.body.append(link)
  link.click()
  link.remove()
}

function triggerResourceDownloads(resources: DownloadResource[]) {
  for (const resource of resources) {
    triggerDownload(resource)
  }
}

function splitTextLines(text: string) {
  return text.split('\n')
}

function extractLinesFromNode(node: ProseMirrorNode) {
  if (node.type.name === 'blockquote') {
    const lines: string[] = []
    node.forEach((child) => {
      lines.push(...splitTextLines(child.textContent))
    })
    return lines.length ? lines : ['']
  }

  if (node.type.name === 'list') {
    return splitTextLines(node.textContent)
  }

  return splitTextLines(node.textContent)
}

function createTextNode(view: EditorView, text: string) {
  return text ? view.state.schema.text(text) : undefined
}

function createParagraphFromLine(view: EditorView, text: string) {
  return view.state.schema.nodes.paragraph?.create(undefined, createTextNode(view, text)) ?? null
}

function createNodesFromLines(view: EditorView, lines: string[], target: LinewiseTarget) {
  const { schema } = view.state
  const paragraphType = schema.nodes.paragraph

  if (!paragraphType) {
    return null
  }

  if (target.type === 'paragraph') {
    return lines.map((line) => createParagraphFromLine(view, line)).filter((node): node is ProseMirrorNode => Boolean(node))
  }

  if (target.type === 'heading') {
    const headingType = schema.nodes.heading
    if (!headingType) {
      return null
    }

    return lines.map((line) => headingType.create({ level: target.level }, createTextNode(view, line)))
  }

  if (target.type === 'list') {
    const listType = schema.nodes.list
    if (!listType) {
      return null
    }

    return lines.map((line) => {
      const paragraph = createParagraphFromLine(view, line)
      return listType.create({ kind: target.kind, checked: false }, paragraph ? [paragraph] : undefined)
    })
  }

  if (target.type === 'blockquote') {
    const blockquoteType = schema.nodes.blockquote
    if (!blockquoteType) {
      return null
    }

    const paragraphs = lines.map((line) => createParagraphFromLine(view, line)).filter((node): node is ProseMirrorNode => Boolean(node))
    return [blockquoteType.create(undefined, paragraphs.length ? paragraphs : undefined)]
  }

  if (target.type === 'codeBlock') {
    const codeBlockType = schema.nodes.codeBlock
    if (!codeBlockType) {
      return null
    }

    const text = lines.join('\n')
    return [codeBlockType.create({ language: 'text' }, createTextNode(view, text))]
  }

  const alertType = schema.nodes.alert
  if (!alertType) {
    return null
  }

  const paragraphs = lines.map((line) => createParagraphFromLine(view, line)).filter((node): node is ProseMirrorNode => Boolean(node))
  return [alertType.create(target.attrs, paragraphs.length ? paragraphs : undefined)]
}

function dispatchConvertBlock(view: EditorView, state: ActiveBlockHandleState, target: LinewiseTarget) {
  const lines = extractLinesFromNode(state.node)
  const nodes = createNodesFromLines(view, lines, target)
  if (!nodes?.length) {
    return false
  }

  const from = state.pos
  const to = state.pos + state.node.nodeSize
  const tr = view.state.tr.replaceWith(from, to, nodes).scrollIntoView()
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(tr.doc.content.size, from + 1))))
  view.dispatch(tr)
  focusView(view)
  return true
}

function focusView(view: EditorView) {
  requestAnimationFrame(() => {
    view.focus()
  })
}

function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  return Promise.reject(new Error('Clipboard API unavailable'))
}

function getEditorView(editor: any): EditorView | undefined {
  try {
    return editor?.view as EditorView | undefined
  } catch {
    return undefined
  }
}

function createFrozenAnchor(element: HTMLElement): FrozenAnchor {
  const rect = element.getBoundingClientRect()
  return {
    getBoundingClientRect: () => rect,
  }
}

async function copyNodeToClipboard(view: EditorView, node: ProseMirrorNode) {
  const slice = new Slice(Fragment.from(node), 0, 0)
  const textContent = node.textContent
  const serializeForClipboard = (view as EditorView & {
    serializeForClipboard?: (slice: Slice) => { dom: HTMLElement }
  }).serializeForClipboard
  const htmlContent = serializeForClipboard?.call(view, slice).dom.innerHTML

  if (htmlContent && navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' })
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
      return
    } catch {
      // Fall back to plain text below.
    }
  }

  await writeClipboardText(textContent)
}

function dispatchInsertSlashParagraph(view: EditorView, state: ActiveBlockHandleState, side: 'before' | 'after') {
  const paragraphType = view.state.schema.nodes.paragraph
  if (!paragraphType) {
    return
  }

  const insertPos = side === 'before' ? state.pos : state.pos + state.node.nodeSize
  const slash = view.state.schema.text('/')
  const paragraph = paragraphType.create(null, slash)
  const tr = view.state.tr.insert(insertPos, paragraph)
  tr.setSelection(TextSelection.create(tr.doc, insertPos + 2))
  view.dispatch(tr.scrollIntoView())
  view.focus()
}

function dispatchSelectBlock(view: EditorView, state: ActiveBlockHandleState) {
  view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, state.pos)))
  focusView(view)
}

function dispatchDeleteBlock(view: EditorView, state: ActiveBlockHandleState) {
  const tr = view.state.tr.delete(state.pos, state.pos + state.node.nodeSize)
  view.dispatch(tr.scrollIntoView())
  focusView(view)
}

function dispatchDuplicateBlock(view: EditorView, state: ActiveBlockHandleState) {
  const insertPos = state.pos + state.node.nodeSize
  const tr = view.state.tr.insert(insertPos, state.node.copy(state.node.content))
  tr.setSelection(NodeSelection.create(tr.doc, insertPos))
  view.dispatch(tr.scrollIntoView())
  focusView(view)
}

function dispatchClearMarks(view: EditorView, state: ActiveBlockHandleState) {
  let tr = view.state.tr
  state.node.descendants((child, childPos) => {
    if (!child.isText || !child.marks.length) {
      return
    }

    const from = state.pos + childPos + 1
    const to = from + child.nodeSize
    for (const mark of child.marks) {
      tr = tr.removeMark(from, to, mark.type)
    }
  })

  if ('textAlign' in (state.node.type.spec.attrs ?? {})) {
    tr = tr.setNodeAttribute(state.pos, 'textAlign', null)
  }

  view.dispatch(tr.scrollIntoView())
  focusView(view)
}

function dispatchBlockMark(
  view: EditorView,
  state: ActiveBlockHandleState,
  markName: 'textColor' | 'backgroundColor' | 'fontSize',
  attrs: Record<string, string> | null,
) {
  const markType = view.state.schema.marks[markName]
  if (!markType) {
    return false
  }

  let tr = view.state.tr
  let changed = false

  state.node.descendants((child, childPos) => {
    if (!child.isText) {
      return
    }

    const from = state.pos + childPos + 1
    const to = from + child.nodeSize
    tr = tr.removeMark(from, to, markType)
    if (attrs) {
      tr = tr.addMark(from, to, markType.create(attrs))
    }
    changed = true
  })

  if (!changed) {
    return false
  }

  view.dispatch(tr.scrollIntoView())
  focusView(view)
  return true
}

function hasMarksInNode(node: ProseMirrorNode | null) {
  if (!node) {
    return false
  }

  let hasMarks = false
  node.descendants((child) => {
    if (child.isText && child.marks.length) {
      hasMarks = true
      return false
    }

    return !hasMarks
  })
  return hasMarks
}

function setBlockTextAlign(view: EditorView, state: ActiveBlockHandleState, value: string | null) {
  const node = state.node
  if (!('textAlign' in (node.type.spec.attrs ?? {}))) {
    return
  }

  const tr = view.state.tr.setNodeAttribute(state.pos, 'textAlign', value).scrollIntoView()
  view.dispatch(tr)
  focusView(view)
}

function useBlockActions(editor: any, blockState: BlockHandleState, closeMenu: () => void) {
  return useMemo(() => {
    const view = getEditorView(editor)
    const node = blockState?.node ?? null

    function run(action: () => void) {
      action()
      closeMenu()
    }

    function selectThen(command: () => void) {
      if (!view || !blockState) {
        return
      }

      dispatchSelectBlock(view, blockState)
      command()
      closeMenu()
    }

    const hasMarks = hasMarksInNode(node)
    const canTextAlign = !!node && 'textAlign' in (node.type.spec.attrs ?? {})
    const isList = node?.type.name === 'list'
    const resources = getDownloadResources(node)
    const imageResources = resources.filter((resource) => resource.type === 'image')
    const attachmentResources = resources.filter((resource) => resource.type === 'attachment')

    const quickActions: BlockMenuAction[] = [
      {
        key: 'dedent-list',
        label: '减少缩进',
        icon: <IndentDecreaseIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !isList,
        onSelect: () => selectThen(() => editor.commands.dedentList?.()),
      },
      {
        key: 'indent-list',
        label: '增加缩进',
        icon: <IndentIncreaseIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !isList,
        onSelect: () => selectThen(() => editor.commands.indentList?.()),
      },
      {
        key: 'clear-format',
        label: '清除格式',
        icon: <EraserLineIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !hasMarks,
        onSelect: () => run(() => view && blockState && dispatchClearMarks(view, blockState)),
      },
      {
        key: 'copy',
        label: `复制${getNodeLabel(node)}`,
        icon: <FileCopyLineIcon className={menuIconClassName} />,
        disabled: !view || !blockState,
        onSelect: () => run(() => {
          if (view && blockState) {
            void copyNodeToClipboard(view, blockState.node)
          }
        }),
      },
      {
        key: 'cut',
        label: `剪切${getNodeLabel(node)}`,
        icon: <ScissorsCutLineIcon className={menuIconClassName} />,
        disabled: !view || !blockState,
        onSelect: () => run(() => {
          if (view && blockState) {
            void copyNodeToClipboard(view, blockState.node)
            dispatchDeleteBlock(view, blockState)
          }
        }),
      },
      {
        key: 'delete',
        label: `删除${getNodeLabel(node)}`,
        icon: <DeleteLineIcon className={menuIconClassName} />,
        disabled: !view || !blockState,
        onSelect: () => run(() => view && blockState && dispatchDeleteBlock(view, blockState)),
      },
    ]

    const mainActions: BlockMenuAction[] = [
      {
        key: 'duplicate',
        label: `复制${getNodeLabel(node)}`,
        icon: <FileCopyLineIcon className={menuIconClassName} />,
        disabled: !view || !blockState,
        onSelect: () => run(() => view && blockState && dispatchDuplicateBlock(view, blockState)),
      },
    ]

    const downloadActions: BlockMenuAction[] = [
      ...(imageResources.length
        ? [{
            key: 'download-images',
            label: imageResources.length > 1 ? '下载图片' : `下载${getNodeLabel(node)}`,
            icon: <ImageAddLineIcon className={menuIconClassName} />,
            extra: <CountBadge count={imageResources.length} />,
            onSelect: () => run(() => triggerResourceDownloads(imageResources)),
          }]
        : []),
      ...(attachmentResources.length
        ? [{
            key: 'download-attachments',
            label: attachmentResources.length > 1 ? '下载附件' : `下载${getNodeLabel(node)}`,
            icon: <AttachmentLineIcon className={menuIconClassName} />,
            extra: <CountBadge count={attachmentResources.length} />,
            onSelect: () => run(() => triggerResourceDownloads(attachmentResources)),
          }]
        : []),
      ...(resources.length > 1 && imageResources.length && attachmentResources.length
        ? [{
            key: 'download-all-resources',
            label: '下载全部资源',
            icon: <DownloadLineIcon className={menuIconClassName} />,
            extra: <CountBadge count={resources.length} />,
            onSelect: () => run(() => triggerResourceDownloads(resources)),
          }]
        : []),
    ] satisfies BlockMenuAction[]

    const alignActions: BlockMenuAction[] = [
      {
        key: 'align-left',
        label: '左侧对齐',
        shortcut: '⌘ L',
        icon: <AlignLeftIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !canTextAlign,
        selected: node?.attrs.textAlign === 'left',
        onSelect: () => run(() => view && blockState && setBlockTextAlign(view, blockState, 'left')),
      },
      {
        key: 'align-center',
        label: '居中对齐',
        shortcut: '⌘ E',
        icon: <AlignCenterIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !canTextAlign,
        selected: node?.attrs.textAlign === 'center',
        onSelect: () => run(() => view && blockState && setBlockTextAlign(view, blockState, 'center')),
      },
      {
        key: 'align-right',
        label: '右侧对齐',
        shortcut: '⌘ R',
        icon: <AlignRightIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !canTextAlign,
        selected: node?.attrs.textAlign === 'right',
        onSelect: () => run(() => view && blockState && setBlockTextAlign(view, blockState, 'right')),
      },
      {
        key: 'align-justify',
        label: '两端对齐',
        shortcut: '⌘ J',
        icon: <AlignJustifyIcon className={menuIconClassName} />,
        disabled: !view || !blockState || !canTextAlign,
        selected: node?.attrs.textAlign === 'justify',
        onSelect: () => run(() => view && blockState && setBlockTextAlign(view, blockState, 'justify')),
      },
    ]

    const convertActions: BlockMenuAction[] = [
      {
        key: 'paragraph',
        label: '文本',
        icon: <TextIcon className={menuIconClassName} />,
        selected: node?.type.name === 'paragraph',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'paragraph' })),
      },
      {
        key: 'heading-1',
        label: '标题 1',
        icon: <H1Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 1,
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'heading', level: 1 })),
      },
      {
        key: 'heading-2',
        label: '标题 2',
        icon: <H2Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 2,
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'heading', level: 2 })),
      },
      {
        key: 'heading-3',
        label: '标题 3',
        icon: <H3Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 3,
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'heading', level: 3 })),
      },
      {
        key: 'bullet-list',
        label: '无序列表',
        icon: <ListUnorderedIcon className={menuIconClassName} />,
        selected: node?.type.name === 'list' && node.attrs.kind === 'bullet',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'list', kind: 'bullet' })),
      },
      {
        key: 'ordered-list',
        label: '有序列表',
        icon: <ListOrdered2Icon className={menuIconClassName} />,
        selected: node?.type.name === 'list' && node.attrs.kind === 'ordered',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'list', kind: 'ordered' })),
      },
      {
        key: 'task-list',
        label: '任务列表',
        icon: <ListCheck3Icon className={menuIconClassName} />,
        selected: node?.type.name === 'list' && node.attrs.kind === 'task',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'list', kind: 'task' })),
      },
      {
        key: 'blockquote',
        label: '引用',
        icon: <QuoteTextIcon className={menuIconClassName} />,
        selected: node?.type.name === 'blockquote',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'blockquote' })),
      },
      {
        key: 'code-block',
        label: '代码块',
        icon: <CodeBoxLineIcon className={menuIconClassName} />,
        selected: node?.type.name === 'codeBlock',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'codeBlock' })),
      },
      {
        key: 'alert-info',
        label: '提示块',
        icon: <Information2LineIcon className={menuIconClassName} />,
        selected: node?.type.name === 'alert' && node.attrs.variant === 'info',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'alert', attrs: { variant: 'info', type: 'icon' } })),
      },
      {
        key: 'alert-warning',
        label: '警告块',
        icon: <ErrorWarningFillIcon className={menuIconClassName} />,
        selected: node?.type.name === 'alert' && node.attrs.variant === 'warning',
        onSelect: () => selectThen(() => view && blockState && dispatchConvertBlock(view, blockState, { type: 'alert', attrs: { variant: 'warning', type: 'icon' } })),
      },
      {
        key: 'details',
        label: '折叠面板',
        icon: <CollapseIcon className={menuIconClassName} />,
        selected: node?.type.name === 'details',
        onSelect: () => selectThen(() => editor.commands.setDetails?.()),
      },
    ]

    const insertActions: BlockMenuAction[] = [
      {
        key: 'horizontal-rule',
        label: '分割线',
        icon: <SeparatorIcon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.insertHorizontalRule?.()),
      },
      {
        key: 'image',
        label: '图片',
        icon: <ImageAddLineIcon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.insertImage?.({ src: '', width: 760, align: 'center' })),
      },
      {
        key: 'table',
        label: '表格',
        icon: <Table2Icon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.insertTable?.({ row: 3, col: 3 })),
      },
      {
        key: 'flip-grid',
        label: '分栏',
        icon: <FlipGridIcon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.insertFlipGrid?.(2)),
      },
      {
        key: 'mermaid',
        label: 'Mermaid 图表',
        icon: <FlowChartIcon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.insertMermaidCodeBlock?.(defaultMermaidTemplate)),
      },
      {
        key: 'excalidraw',
        label: 'Excalidraw 绘图',
        icon: <MindMapIcon className={menuIconClassName} />,
        onSelect: () => selectThen(() => editor.commands.setExcalidraw?.()),
      },
    ]

    const colorActions = {
      applyTextColor: (color: string | null) => run(() => view && blockState && dispatchBlockMark(view, blockState, 'textColor', color ? { color } : null)),
      applyBackgroundColor: (color: string | null) => run(() => view && blockState && dispatchBlockMark(view, blockState, 'backgroundColor', color ? { color } : null)),
    }

    const fontSizeActions = {
      applyFontSize: (size: string | null) => run(() => view && blockState && dispatchBlockMark(view, blockState, 'fontSize', size ? { size } : null)),
    }

    return { quickActions, mainActions, downloadActions, alignActions, convertActions, insertActions, colorActions, fontSizeActions }
  }, [blockState, closeMenu, editor])
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="pk:flex pk:min-w-5 pk:items-center pk:justify-center pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:px-1 pk:text-[11px] pk:leading-4 pk:text-[var(--editor-muted-foreground)]">
      {count}
    </span>
  )
}

function BlockQuickAction({ action }: { action: BlockMenuAction }) {
  return (
    <button
      type="button"
      aria-label={action.label}
      title={action.label}
      disabled={action.disabled}
      className={quickButtonClassName}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action.onSelect}
    >
      {action.icon}
    </button>
  )
}

function BlockMenuItem({ action }: { action: BlockMenuAction }) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      data-selected={action.selected ? '' : undefined}
      className={menuItemClassName}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        action.onSelect()
      }}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
        {action.icon}
      </span>
      <span className="pk:min-w-0 pk:truncate">{action.label}</span>
      <span className="pk:flex pk:min-w-4 pk:items-center pk:justify-end pk:text-[11px] pk:text-[var(--editor-muted-foreground)]">
        {action.extra ?? action.shortcut ?? null}
        {!action.extra && !action.shortcut && action.selected ? <span className="pk:h-1.5 pk:w-1.5 pk:rounded-full pk:bg-[var(--editor-primary)]" /> : null}
      </span>
    </button>
  )
}

function BlockMenuSubmenu({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <EditorHoverPopover
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen && eventDetails.reason === 'trigger-press') {
          return
        }

        setOpen(nextOpen)
      }}
      nativeButton
      hoverDelay={60}
      closeDelay={220}
      side="right"
      align="start"
      sideOffset={8}
      popupClassName={menuPopupClassName}
      content={children}
    >
      <button
        type="button"
        className={submenuTriggerClassName}
        onPointerDown={(event) => {
          event.preventDefault()
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center pk:text-[var(--editor-muted-foreground)]">
          {icon}
        </span>
        <span className="pk:min-w-0 pk:truncate">{label}</span>
        <ArrowDownSLineIcon className="pk:h-4 pk:w-4 pk:-rotate-90 pk:text-[var(--editor-muted-foreground)]" />
      </button>
    </EditorHoverPopover>
  )
}

function ColorSwatch({ color }: { color: string | null }) {
  return (
    <span
      className="pk:inline-block pk:h-3.5 pk:w-3.5 pk:rounded-full pk:border pk:border-black/10"
      style={{ backgroundColor: color ?? 'transparent' }}
    />
  )
}

function BlockColorSubmenu({
  onApplyTextColor,
  onApplyBackgroundColor,
}: {
  onApplyTextColor: (color: string | null) => void
  onApplyBackgroundColor: (color: string | null) => void
}) {
  return (
    <BlockMenuSubmenu
      icon={<BrushLineIcon className="pk:h-4 pk:w-4" />}
      label="颜色"
    >
      <BlockMenuSectionLabel>文字颜色</BlockMenuSectionLabel>
      {textColorPresets.map((preset) => (
        <BlockMenuItem
          key={preset.key}
          action={{
            key: `text-color-${preset.key}`,
            label: preset.label,
            icon: <ColorSwatch color={preset.value ?? 'var(--editor-foreground)'} />,
            onSelect: () => onApplyTextColor(preset.value),
          }}
        />
      ))}
      <BlockMenuDivider />
      <BlockMenuSectionLabel>背景颜色</BlockMenuSectionLabel>
      {backgroundColorPresets.map((preset) => (
        <BlockMenuItem
          key={preset.key}
          action={{
            key: `background-color-${preset.key}`,
            label: preset.label,
            icon: <ColorSwatch color={preset.value} />,
            onSelect: () => onApplyBackgroundColor(preset.value),
          }}
        />
      ))}
    </BlockMenuSubmenu>
  )
}

function BlockFontSizeSubmenu({
  onApplyFontSize,
}: {
  onApplyFontSize: (size: string | null) => void
}) {
  return (
    <BlockMenuSubmenu
      icon={<FontSizeIcon className="pk:h-4 pk:w-4" />}
      label="字号"
    >
      {fontSizePresets.map((preset) => (
        <BlockMenuItem
          key={preset.key}
          action={{
            key: `font-size-${preset.key}`,
            label: preset.label,
            icon: <span className="pk:text-xs pk:font-medium">A</span>,
            onSelect: () => onApplyFontSize(preset.value),
          }}
        />
      ))}
    </BlockMenuSubmenu>
  )
}

function BlockMenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="pk:px-2.5 pk:py-1.5 pk:text-[11px] pk:font-medium pk:leading-none pk:text-[var(--editor-muted-foreground)]">
      {children}
    </div>
  )
}

function BlockMenuDivider() {
  return <div className="pk:my-1 pk:h-px pk:bg-[var(--editor-border)]" />
}

function AddBlockMenu({
  editor,
  blockState,
  onOpenChange,
}: {
  editor: any
  blockState: BlockHandleState
  onOpenChange: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [anchor, setAnchor] = useState<FrozenAnchor | null>(null)

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange(nextOpen)
  }

  function insert(side: 'before' | 'after') {
    const view = getEditorView(editor)
    if (!view || !blockState) {
      return
    }

    dispatchInsertSlashParagraph(view, blockState, side)
    updateOpen(false)
  }

  return (
    <EditorFloatingPopover
      open={open}
      onOpenChange={updateOpen}
      nativeButton
      anchor={anchor ?? triggerRef.current}
      side="right"
      align="start"
      sideOffset={8}
      popupClassName={cn(menuPopupClassName, 'pk:min-w-[180px]')}
      content={(
        <>
          <BlockMenuItem
            action={{
              key: 'insert-before',
              label: '上方插入行',
              icon: <TextWrapIcon className="pk:h-4 pk:w-4 pk:rotate-180" />,
              onSelect: () => insert('before'),
            }}
          />
          <BlockMenuItem
            action={{
              key: 'insert-after',
              label: '下方插入行',
              icon: <TextWrapIcon className="pk:h-4 pk:w-4" />,
              onSelect: () => insert('after'),
            }}
          />
        </>
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Add block"
        title="Add block"
        className={handleButtonClassName}
        contentEditable={false}
        disabled={!blockState}
        onMouseDown={(event) => {
          event.preventDefault()
          setAnchor(createFrozenAnchor(event.currentTarget))
        }}
      >
        <AddLineIcon className="pk:h-4 pk:w-4" />
      </button>
    </EditorFloatingPopover>
  )
}

function DragBlockMenu({
  editor,
  blockState,
  onOpenChange,
}: {
  editor: any
  blockState: BlockHandleState
  onOpenChange: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [anchor, setAnchor] = useState<FrozenAnchor | null>(null)

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange(nextOpen)
  }

  const { quickActions, mainActions, downloadActions, alignActions, convertActions, insertActions, colorActions, fontSizeActions } = useBlockActions(
    editor,
    blockState,
    () => updateOpen(false),
  )

  function selectBlock() {
    const view = getEditorView(editor)
    if (!view || !blockState) {
      return
    }

    dispatchSelectBlock(view, blockState)
  }

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>) {
    const view = getEditorView(editor)
    if (!view || !blockState || !event.dataTransfer) {
      return
    }

    const element = view.nodeDOM(blockState.pos)
    if (!(element instanceof HTMLElement)) {
      return
    }

    dispatchSelectBlock(view, blockState)
    view.dom.classList.add('prosekit-dragging')
    event.dataTransfer.clearData()
    event.dataTransfer.setData('text/html', element.outerHTML)
    event.dataTransfer.effectAllowed = 'copyMove'
    setViewDragging(view, blockState)
  }

  function handleDragEnd() {
    const view = getEditorView(editor)
    view?.dom.classList.remove('prosekit-dragging')
  }

  return (
    <EditorFloatingPopover
      open={open}
      onOpenChange={updateOpen}
      nativeButton
      anchor={anchor ?? triggerRef.current}
      side="right"
      align="start"
      sideOffset={8}
      popupClassName={menuPopupClassName}
      content={(
        <>
          <BlockMenuSectionLabel>{getNodeLabel(blockState?.node ?? null)}</BlockMenuSectionLabel>
          <div className="pk:flex pk:items-center pk:gap-0.5 pk:px-0.5">
            {quickActions.map((action) => (
              <BlockQuickAction key={action.key} action={action} />
            ))}
          </div>
          <BlockMenuDivider />
          {mainActions.map((action) => (
            <BlockMenuItem key={action.key} action={action} />
          ))}
          {downloadActions.length ? (
            <>
              <BlockMenuDivider />
              {downloadActions.map((action) => (
                <BlockMenuItem key={action.key} action={action} />
              ))}
            </>
          ) : null}
          <BlockMenuDivider />
          <BlockColorSubmenu
            onApplyTextColor={colorActions.applyTextColor}
            onApplyBackgroundColor={colorActions.applyBackgroundColor}
          />
          <BlockFontSizeSubmenu
            onApplyFontSize={fontSizeActions.applyFontSize}
          />
          <BlockMenuDivider />
          <BlockMenuSectionLabel>对齐方式</BlockMenuSectionLabel>
          {alignActions.map((action) => (
            <BlockMenuItem key={action.key} action={action} />
          ))}
          <BlockMenuDivider />
          <BlockMenuSubmenu
            icon={<Repeat2LineIcon className="pk:h-4 pk:w-4" />}
            label="转换"
          >
            {convertActions.map((action) => (
              <BlockMenuItem key={action.key} action={action} />
            ))}
          </BlockMenuSubmenu>
          <BlockMenuDivider />
          <BlockMenuSectionLabel>插入</BlockMenuSectionLabel>
          {insertActions.map((action) => (
            <BlockMenuItem key={action.key} action={action} />
          ))}
        </>
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Drag block"
        title="Drag block"
        className={cn(handleButtonClassName, 'prosekit-block-handle-drag pk:cursor-grab')}
        contentEditable={false}
        disabled={!blockState}
        draggable={!!blockState}
        onClick={(event) => {
          event.preventDefault()
          setAnchor(createFrozenAnchor(event.currentTarget))
          updateOpen(!open)
        }}
        onPointerDown={(event) => {
          setAnchor(createFrozenAnchor(event.currentTarget))
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <DraggableIcon className="pk:h-4 pk:w-4" />
      </button>
    </EditorFloatingPopover>
  )
}

export function BlockHandle() {
  const editor = useEditor<any>()
  const [blockState, setBlockState] = useState<BlockHandleState>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleStateChange(event: BlockHandleStateChangeEvent) {
    const nextState = event.detail
    if (!isSameBlockState(blockState, nextState)) {
      setMenuOpen(false)
    }
    setBlockState(nextState)
  }

  return (
    <BlockHandleRoot editor={editor} onStateChange={handleStateChange}>
      <BlockHandlePositioner
        className="prosekit-block-handle-positioner"
        placement="left-start"
        offset={8}
        overflowPadding={12}
        hide={!menuOpen}
      >
        <BlockHandlePopup className={popupClassName} contentEditable={false}>
          <AddBlockMenu editor={editor} blockState={blockState} onOpenChange={setMenuOpen} />
          <DragBlockMenu editor={editor} blockState={blockState} onOpenChange={setMenuOpen} />
        </BlockHandlePopup>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  )
}

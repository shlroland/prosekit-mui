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
  CodeBoxLineIcon,
  CollapseIcon,
  DeleteLineIcon,
  DraggableIcon,
  EraserLineIcon,
  ErrorWarningFillIcon,
  FileCopyLineIcon,
  FlipGridIcon,
  FlowChartIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  ImageAddLineIcon,
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
import { EditorFloatingPopover } from '../../ui'
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
  selected?: boolean
  disabled?: boolean
  onSelect: () => void
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

  const labels: Record<string, string> = {
    paragraph: '正文',
    bulletList: '无序列表',
    orderedList: '有序列表',
    taskList: '任务列表',
    listItem: '列表项',
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
  view.dispatch(tr.scrollIntoView())
  focusView(view)
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

    const quickActions: BlockMenuAction[] = [
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
        onSelect: () => selectThen(() => editor.commands.setParagraph?.()),
      },
      {
        key: 'heading-1',
        label: '标题 1',
        icon: <H1Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 1,
        onSelect: () => selectThen(() => editor.commands.setHeading?.({ level: 1 })),
      },
      {
        key: 'heading-2',
        label: '标题 2',
        icon: <H2Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 2,
        onSelect: () => selectThen(() => editor.commands.setHeading?.({ level: 2 })),
      },
      {
        key: 'heading-3',
        label: '标题 3',
        icon: <H3Icon className={menuIconClassName} />,
        selected: node?.type.name === 'heading' && node.attrs.level === 3,
        onSelect: () => selectThen(() => editor.commands.setHeading?.({ level: 3 })),
      },
      {
        key: 'bullet-list',
        label: '无序列表',
        icon: <ListUnorderedIcon className={menuIconClassName} />,
        selected: node?.type.name === 'bulletList',
        onSelect: () => selectThen(() => editor.commands.toggleList?.({ kind: 'bullet' })),
      },
      {
        key: 'ordered-list',
        label: '有序列表',
        icon: <ListOrdered2Icon className={menuIconClassName} />,
        selected: node?.type.name === 'orderedList',
        onSelect: () => selectThen(() => editor.commands.toggleList?.({ kind: 'ordered' })),
      },
      {
        key: 'task-list',
        label: '任务列表',
        icon: <ListCheck3Icon className={menuIconClassName} />,
        selected: node?.type.name === 'taskList',
        onSelect: () => selectThen(() => editor.commands.toggleList?.({ kind: 'task' })),
      },
      {
        key: 'blockquote',
        label: '引用',
        icon: <QuoteTextIcon className={menuIconClassName} />,
        selected: node?.type.name === 'blockquote',
        onSelect: () => selectThen(() => editor.commands.toggleBlockquote?.()),
      },
      {
        key: 'code-block',
        label: '代码块',
        icon: <CodeBoxLineIcon className={menuIconClassName} />,
        selected: node?.type.name === 'codeBlock',
        onSelect: () => selectThen(() => editor.commands.toggleCodeBlock?.({ language: 'text' })),
      },
      {
        key: 'alert-info',
        label: '提示块',
        icon: <Information2LineIcon className={menuIconClassName} />,
        selected: node?.type.name === 'alert' && node.attrs.variant === 'info',
        onSelect: () => selectThen(() => editor.commands.setAlert?.({ variant: 'info', type: 'icon' })),
      },
      {
        key: 'alert-warning',
        label: '警告块',
        icon: <ErrorWarningFillIcon className={menuIconClassName} />,
        selected: node?.type.name === 'alert' && node.attrs.variant === 'warning',
        onSelect: () => selectThen(() => editor.commands.setAlert?.({ variant: 'warning', type: 'icon' })),
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

    return { quickActions, mainActions, alignActions, convertActions, insertActions }
  }, [blockState, closeMenu, editor])
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
        {action.shortcut ? action.shortcut : null}
        {!action.shortcut && action.selected ? <span className="pk:h-1.5 pk:w-1.5 pk:rounded-full pk:bg-[var(--editor-primary)]" /> : null}
      </span>
    </button>
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

  const { quickActions, mainActions, alignActions, convertActions, insertActions } = useBlockActions(
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
          <BlockMenuDivider />
          <BlockMenuSectionLabel>对齐方式</BlockMenuSectionLabel>
          {alignActions.map((action) => (
            <BlockMenuItem key={action.key} action={action} />
          ))}
          <BlockMenuDivider />
          <BlockMenuSectionLabel>
            <span className="pk:inline-flex pk:items-center pk:gap-1.5">
              <Repeat2LineIcon className="pk:h-3.5 pk:w-3.5" />
              转换
            </span>
          </BlockMenuSectionLabel>
          {convertActions.map((action) => (
            <BlockMenuItem key={action.key} action={action} />
          ))}
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

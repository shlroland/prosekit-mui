import { NodeSelection } from 'prosekit/pm/state'
import type { ReactNodeViewProps } from 'prosekit/react'
import { PopoverPopup, PopoverPositioner, PopoverRoot, PopoverTrigger } from 'prosekit/react/popover'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type MouseEvent,
} from 'react'

import {
  Attachment2Icon,
  CarouselViewIcon,
  DeleteLineIcon,
  Download2LineIcon,
  DownloadLineIcon,
  EditLineIcon,
  EyeLineIcon,
  FileIcon,
  ScrollToBottomLineIcon,
} from '../../../icons'
import { Button, Separator, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import type {
  AttachmentAttrs,
  AttachmentDisplayType,
  AttachmentExtensionOptions,
} from './types'

type AttachmentNodeName = 'inlineAttachment' | 'blockAttachment'
type AttachmentRenderType = AttachmentDisplayType | 'view'
type AttachmentViewProps = ReactNodeViewProps & {
  options?: AttachmentExtensionOptions
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeHeight(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(200, Math.min(1000, value))
  }

  return 300
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const unit = 1024
  const labels = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(unit)), labels.length - 1)
  return `${Number.parseFloat((bytes / unit ** index).toFixed(2))} ${labels[index]}`
}

function isPdfFile(attrs: AttachmentAttrs) {
  const title = attrs.title.toLowerCase()
  const type = normalizeText(attrs.type).toLowerCase()
  const url = attrs.url.toLowerCase()

  return title.endsWith('.pdf')
    || type.includes('pdf')
    || type === 'application/pdf'
    || url.includes('.pdf')
}

function getNodeAttrs(node: ReactNodeViewProps['node']): AttachmentAttrs {
  return {
    url: normalizeText(node.attrs.url),
    title: normalizeText(node.attrs.title),
    size: normalizeText(node.attrs.size) || '0',
    type: node.type.name === 'blockAttachment' ? 'block' : 'icon',
    view: node.attrs.view === '1' ? '1' : '0',
    height: normalizeHeight(node.attrs.height),
  }
}

function getDisplayType(nodeName: string, attrs: AttachmentAttrs): AttachmentRenderType {
  if (nodeName === 'inlineAttachment') {
    return 'icon'
  }

  return attrs.view === '1' ? 'view' : 'block'
}

function createAttachmentNode(
  view: ReactNodeViewProps['view'],
  type: AttachmentNodeName,
  attrs: AttachmentAttrs,
) {
  const nodeType = view.state.schema.nodes[type]
  if (!nodeType) {
    return null
  }

  if (type === 'inlineAttachment') {
    return nodeType.create({
      url: attrs.url || '',
      title: attrs.title || '',
      size: attrs.size || '0',
      type: 'icon',
    })
  }

  return nodeType.create({
    url: attrs.url || '',
    title: attrs.title || '',
    size: attrs.size || '0',
    type: 'block',
    view: attrs.view === '1' ? '1' : '0',
    height: normalizeHeight(attrs.height),
  })
}

async function downloadAttachment(url: string, title: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = title
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(objectUrl)
    link.remove()
  } catch {
    window.open(url, '_blank')
  }
}

function openPreview(url: string) {
  try {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch {
    window.open(url, '_blank')
  }
}

function AttachmentActionButton({
  active = false,
  children,
  label,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  label: string
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <Tooltip content={label}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'pk:h-8 pk:w-8 pk:rounded-lg',
          active
            ? 'pk:bg-[var(--editor-primary)] pk:text-white pk:hover:bg-[var(--editor-primary-hover)]'
            : 'pk:text-[var(--editor-muted-foreground)] pk:hover:text-[var(--editor-foreground)]',
        )}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  )
}

function AttachmentActionBar({
  attrs,
  displayType,
  isPdf,
  onChangeDisplay,
  onDelete,
  onDownload,
  onEdit,
}: {
  attrs: AttachmentAttrs
  displayType: AttachmentRenderType
  isPdf: boolean
  onChangeDisplay: (type: AttachmentRenderType, event: MouseEvent<HTMLButtonElement>) => void
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void
  onDownload: (event: MouseEvent<HTMLButtonElement>) => void
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div
      className="pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:bg-[var(--editor-surface)] pk:p-1.5"
      data-editor-floating
    >
      <span className="pk:w-[180px] pk:overflow-hidden pk:truncate pk:whitespace-nowrap pk:px-2 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
        {attrs.title || attrs.url}
      </span>
      <AttachmentActionButton label="编辑" onClick={onEdit}>
        <EditLineIcon className="pk:text-base" />
      </AttachmentActionButton>
      <AttachmentActionButton label="下载" onClick={onDownload}>
        <DownloadLineIcon className="pk:text-base" />
      </AttachmentActionButton>
      <Separator orientation="vertical" className="pk:mx-1 pk:h-4" />
      <AttachmentActionButton
        label="图标文字"
        active={displayType === 'icon'}
        onClick={(event) => onChangeDisplay('icon', event)}
      >
        <ScrollToBottomLineIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />
      </AttachmentActionButton>
      <AttachmentActionButton
        label="文字卡片"
        active={displayType === 'block'}
        onClick={(event) => onChangeDisplay('block', event)}
      >
        <CarouselViewIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />
      </AttachmentActionButton>
      {isPdf ? (
        <AttachmentActionButton
          label="预览卡片"
          active={displayType === 'view'}
          onClick={(event) => onChangeDisplay('view', event)}
        >
          <CarouselViewIcon className="pk:text-base" />
        </AttachmentActionButton>
      ) : null}
      <Separator orientation="vertical" className="pk:mx-1 pk:h-4" />
      <AttachmentActionButton label="删除" onClick={onDelete}>
        <DeleteLineIcon className="pk:text-base" />
      </AttachmentActionButton>
    </div>
  )
}

function AttachmentTitlePanel({
  initialTitle,
  onCancel,
  onSave,
}: {
  initialTitle: string
  onCancel: () => void
  onSave: (title: string) => void
}) {
  const [name, setName] = useState('')
  const [extension, setExtension] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const parts = initialTitle.split('.')
    setExtension(parts.length > 1 ? parts.pop() || '' : '')
    setName(parts.join('.'))
  }, [initialTitle])

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function handleSave() {
    const title = `${name.trim()}${extension ? `.${extension}` : ''}`
    if (title.trim()) {
      onSave(title)
    }
  }

  return (
    <div
      className="pk:grid pk:w-[320px] pk:gap-3 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-white pk:p-4 pk:shadow-[0_12px_32px_rgba(23,23,23,0.14)]"
      data-editor-floating
    >
      <label className="pk:flex pk:items-center pk:gap-3">
        <span className="pk:w-10 pk:shrink-0 pk:text-sm pk:text-[var(--editor-muted-foreground)]">标题</span>
        <input
          ref={inputRef}
          value={name}
          placeholder="附件标题"
          className="pk:h-9 pk:min-w-0 pk:flex-1 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-white pk:px-2.5 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancel()
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              handleSave()
            }
          }}
        />
      </label>
      <div className="pk:flex pk:items-center pk:justify-end pk:gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={handleSave}>修改附件</Button>
      </div>
    </div>
  )
}

function AttachmentUploadPlaceholder({
  onUploadFiles,
  selected,
}: {
  onUploadFiles: (
    files: File[],
    onProgress: (progress: number, current: number) => void,
  ) => Promise<void>
  selected: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) {
      return
    }

    setUploading(true)
    setProgress(0)
    setCurrent(1)
    setTotal(files.length)
    await onUploadFiles(files, (nextProgress, nextCurrent) => {
      setProgress(nextProgress)
      setCurrent(nextCurrent)
    })
    setUploading(false)
  }

  return (
    <span className="pk:my-2 pk:inline-flex pk:max-w-full">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="*/*"
        className="pk:hidden"
        data-attachment-upload-control
        onChange={handleChange}
      />
      <button
        type="button"
        className={cn(
          'pk:relative pk:inline-flex pk:min-h-11 pk:max-w-full pk:items-center pk:gap-4 pk:overflow-hidden pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-4 pk:py-3 pk:text-sm pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors',
          !uploading && 'pk:cursor-pointer pk:hover:bg-[var(--editor-muted)]',
          selected && 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_6%,var(--editor-surface))]',
        )}
        style={uploading ? { '--attachment-upload-progress': `${progress}%` } as CSSProperties : undefined}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <span
            className="pk:pointer-events-none pk:absolute pk:inset-y-0 pk:left-0 pk:bg-[var(--editor-primary)] pk:opacity-10 pk:transition-[width] pk:duration-300"
            style={{ width: 'var(--attachment-upload-progress)' }}
          />
        ) : null}
        {uploading ? (
          <span className="pk:relative pk:z-[1] pk:h-4 pk:w-4 pk:shrink-0 pk:animate-spin pk:rounded-full pk:border-2 pk:border-[var(--editor-border)] pk:border-t-[var(--editor-primary)]" />
        ) : (
          <Attachment2Icon className="pk:relative pk:z-[1] pk:shrink-0 pk:text-base" />
        )}
        {uploading ? (
          <span className="pk:relative pk:z-[1]">
            正在上传第 <strong>{current}</strong> / {total} 个附件
            <span className="pk:ml-2 pk:inline-block pk:w-10 pk:text-right pk:text-xs">{progress}%</span>
          </span>
        ) : (
          <span className="pk:relative pk:z-[1]">添加附件</span>
        )}
      </button>
    </span>
  )
}

function AttachmentContent({
  attrs,
  editable,
  isPdf,
  onDownload,
  onPreview,
  onResizeHeight,
  selected,
  type,
}: {
  attrs: AttachmentAttrs
  editable: boolean
  isPdf: boolean
  onDownload: (event: MouseEvent) => void
  onPreview: (event: MouseEvent) => void
  onResizeHeight: (height: number) => void
  selected: boolean
  type: AttachmentRenderType
}) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragStartYRef = useRef(0)
  const dragStartHeightRef = useRef(0)
  const height = normalizeHeight(attrs.height)
  const isError = attrs.url === 'error'

  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    if (!dragging) {
      return
    }

    const delta = event.clientY - dragStartYRef.current
    onResizeHeight(normalizeHeight(dragStartHeightRef.current + delta))
  }, [dragging, onResizeHeight])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  useEffect(() => {
    if (!dragging) {
      return
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  function startResize(event: MouseEvent<HTMLSpanElement>) {
    event.preventDefault()
    event.stopPropagation()
    dragStartYRef.current = event.clientY
    dragStartHeightRef.current = height
    setDragging(true)
  }

  if (type === 'icon') {
    return (
      <button
        type="button"
        className={cn(
          'pk:inline-flex pk:max-w-full pk:cursor-pointer pk:items-center pk:gap-1 pk:rounded-md pk:border-0 pk:bg-transparent pk:p-0 pk:text-sm pk:text-[var(--editor-primary)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)]',
          isError && 'pk:text-red-600',
        )}
        onClick={onDownload}
      >
        <Download2LineIcon className="pk:cursor-grab pk:text-sm pk:active:cursor-grabbing" />
        <span>{attrs.title}</span>
      </button>
    )
  }

  if (type === 'view' && isPdf && attrs.url && !isError) {
    return (
      <span
        className="pk:relative pk:block pk:w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className={cn(
            'pk:block pk:w-full pk:overflow-hidden pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]',
            editable && 'pk:hover:border-[var(--editor-primary)]',
            selected && 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_6%,var(--editor-surface))]',
          )}
          style={{ height }}
        >
          <iframe
            src={`${attrs.url}#navpanes=0&toolbar=0&view=FitH`}
            width="100%"
            height="100%"
            allowFullScreen
            title={attrs.title}
            className="pk:block pk:border-0"
            style={{ pointerEvents: dragging ? 'none' : 'auto' }}
          />
        </span>
        {editable && (hovered || dragging) ? (
          <>
            <span
              className="pk:absolute pk:-left-1 pk:-top-1 pk:z-[2] pk:h-3 pk:w-3 pk:cursor-ns-resize pk:rounded-full pk:border-2 pk:border-[color-mix(in_srgb,var(--editor-primary)_35%,transparent)] pk:bg-[var(--editor-background)] pk:transition-colors pk:hover:border-[var(--editor-primary)]"
              data-attachment-resize-handle
              onMouseDown={startResize}
            />
            <span
              className="pk:absolute pk:-right-1 pk:-top-1 pk:z-[2] pk:h-3 pk:w-3 pk:cursor-ns-resize pk:rounded-full pk:border-2 pk:border-[color-mix(in_srgb,var(--editor-primary)_35%,transparent)] pk:bg-[var(--editor-background)] pk:transition-colors pk:hover:border-[var(--editor-primary)]"
              data-attachment-resize-handle
              onMouseDown={startResize}
            />
            <span
              className="pk:absolute pk:-bottom-1 pk:-left-1 pk:z-[2] pk:h-3 pk:w-3 pk:cursor-ns-resize pk:rounded-full pk:border-2 pk:border-[color-mix(in_srgb,var(--editor-primary)_35%,transparent)] pk:bg-[var(--editor-background)] pk:transition-colors pk:hover:border-[var(--editor-primary)]"
              data-attachment-resize-handle
              onMouseDown={startResize}
            />
            <span
              className="pk:absolute pk:-bottom-1 pk:-right-1 pk:z-[2] pk:h-3 pk:w-3 pk:cursor-ns-resize pk:rounded-full pk:border-2 pk:border-[color-mix(in_srgb,var(--editor-primary)_35%,transparent)] pk:bg-[var(--editor-background)] pk:transition-colors pk:hover:border-[var(--editor-primary)]"
              data-attachment-resize-handle
              onMouseDown={startResize}
            />
          </>
        ) : null}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'pk:block pk:w-full pk:cursor-pointer pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:text-[var(--editor-foreground)] pk:transition-colors',
        editable && 'pk:hover:border-[var(--editor-primary)]',
        selected && 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_6%,var(--editor-surface))]',
        isError && 'pk:border-red-500 pk:text-red-600',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="pk:flex pk:w-full pk:items-center pk:gap-4 pk:rounded-md">
        <FileIcon className={cn('pk:h-7 pk:w-7 pk:shrink-0 pk:text-[var(--editor-primary)]', isError && 'pk:text-red-600')} />
        <span className="pk:grid pk:min-w-0 pk:flex-1 pk:gap-1">
          <span className="pk:truncate pk:text-sm pk:font-bold">{attrs.title}</span>
          {attrs.size && attrs.size !== '0' ? (
            <span className="pk:text-xs pk:text-[var(--editor-muted-foreground)]">{attrs.size}</span>
          ) : null}
        </span>
        {hovered ? (
          <span className="pk:flex pk:shrink-0 pk:items-center pk:gap-1">
            {isPdf ? (
              <button
                type="button"
                className="pk:inline-flex pk:h-8 pk:w-8 pk:items-center pk:justify-center pk:rounded-md pk:border-0 pk:bg-transparent pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]"
                onClick={onPreview}
              >
                <EyeLineIcon className="pk:text-base" />
              </button>
            ) : null}
            <button
              type="button"
              className="pk:inline-flex pk:h-8 pk:w-8 pk:items-center pk:justify-center pk:rounded-md pk:border-0 pk:bg-transparent pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]"
              onClick={onDownload}
            >
              <Download2LineIcon className="pk:text-base" />
            </button>
          </span>
        ) : null}
      </span>
    </span>
  )
}

export function AttachmentView({
  node,
  selected,
  view,
  getPos,
  options = {},
}: AttachmentViewProps) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const actionsCloseTimerRef = useRef<number | null>(null)
  const attrs = useMemo(() => getNodeAttrs(node), [node])
  const isEditable = view.editable
  const isPdf = isPdfFile(attrs)
  const displayType = getDisplayType(node.type.name, attrs)

  useEffect(() => {
    return () => {
      if (actionsCloseTimerRef.current !== null) {
        window.clearTimeout(actionsCloseTimerRef.current)
      }
    }
  }, [])

  function getPosition() {
    const pos = getPos()
    return typeof pos === 'number' ? pos : null
  }

  function updateAttrs(nextAttrs: Partial<AttachmentAttrs>) {
    const pos = getPosition()
    if (pos === null) {
      return
    }

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...attrs,
      ...nextAttrs,
      type: node.type.name === 'blockAttachment' ? 'block' : 'icon',
    })
    tr.setSelection(NodeSelection.create(tr.doc, pos))
    view.dispatch(tr)
    view.focus()
  }

  function replaceNode(type: AttachmentNodeName, nextAttrs: AttachmentAttrs) {
    const pos = getPosition()
    if (pos === null) {
      return
    }

    const nextNode = createAttachmentNode(view, type, nextAttrs)
    if (!nextNode) {
      return
    }

    const tr = view.state.tr
    if (type === 'inlineAttachment' && node.type.name === 'blockAttachment') {
      const paragraphType = view.state.schema.nodes.paragraph
      const paragraph = paragraphType?.createAndFill(null, nextNode)
      if (!paragraph) {
        return
      }
      tr.replaceWith(pos, pos + node.nodeSize, paragraph)
      tr.setSelection(NodeSelection.create(tr.doc, pos + 1))
    } else if (type === 'blockAttachment' && node.type.name === 'inlineAttachment') {
      tr.replaceRangeWith(pos, pos + node.nodeSize, nextNode)
      tr.setSelection(NodeSelection.create(tr.doc, pos))
    } else {
      tr.replaceWith(pos, pos + node.nodeSize, nextNode)
      tr.setSelection(NodeSelection.create(tr.doc, pos))
    }
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  async function uploadFile(file: File, onProgress: (progress: number) => void) {
    if (options.onUpload) {
      return await options.onUpload(file, ({ progress }) => {
        onProgress(Math.round(progress * 100))
      })
    }

    onProgress(100)
    return URL.createObjectURL(file)
  }

  async function uploadFiles(
    files: File[],
    onProgress: (progress: number, current: number) => void,
  ) {
    const pos = getPosition()
    if (pos === null) {
      return
    }

    let insertPos = pos + node.nodeSize
    let successCount = 0
    let errorCount = 0

    for (const [index, file] of files.entries()) {
      const size = formatFileSize(file.size)
      onProgress(0, index + 1)
      try {
        const url = await uploadFile(file, (progress) => {
          onProgress(progress, index + 1)
        })
        const nextNode = createAttachmentNode(view, 'blockAttachment', {
          url: url || '',
          title: file.name,
          size,
          type: 'block',
          view: '0',
          height: 300,
        })
        if (nextNode) {
          const tr = view.state.tr.insert(insertPos, nextNode)
          view.dispatch(tr)
          insertPos += nextNode.nodeSize
        }
        successCount += 1
      } catch (error) {
        const nextNode = createAttachmentNode(view, 'blockAttachment', {
          url: 'error',
          title: error instanceof Error ? error.message : '上传失败',
          size,
          type: 'block',
          view: '0',
          height: 300,
        })
        if (nextNode) {
          const tr = view.state.tr.insert(insertPos, nextNode)
          view.dispatch(tr)
          insertPos += nextNode.nodeSize
        }
        errorCount += 1
        options.onError?.(error instanceof Error ? error : new Error('上传失败'))
      }
      onProgress(100, index + 1)
    }

    if (successCount + errorCount === files.length) {
      const currentPos = getPosition()
      if (currentPos !== null) {
        const tr = view.state.tr.delete(currentPos, currentPos + node.nodeSize)
        view.dispatch(tr.scrollIntoView())
      }
    }
    view.focus()
  }

  function deleteAttachment(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()
    const pos = getPosition()
    if (pos === null) {
      return
    }

    const tr = view.state.tr.delete(pos, pos + node.nodeSize)
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  function handleChangeDisplay(nextType: AttachmentRenderType, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (nextType === 'icon') {
      replaceNode('inlineAttachment', {
        ...attrs,
        type: 'icon',
        view: '0',
      })
      setActionsOpen(false)
      return
    }

    replaceNode('blockAttachment', {
      ...attrs,
      type: 'block',
      view: nextType === 'view' ? '1' : '0',
      height: attrs.height || 300,
    })
    setActionsOpen(false)
  }

  function handleDownload(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (attrs.url && attrs.url !== 'error') {
      void downloadAttachment(attrs.url, attrs.title)
    }
  }

  function handlePreview(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (attrs.url && attrs.url !== 'error') {
      openPreview(attrs.url)
    }
  }

  function openEdit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setActionsOpen(false)
    setEditOpen(true)
  }

  function keepActionsOpen() {
    if (!isEditable || !attrs.title) {
      return
    }

    if (actionsCloseTimerRef.current !== null) {
      window.clearTimeout(actionsCloseTimerRef.current)
      actionsCloseTimerRef.current = null
    }
    setActionsOpen(true)
  }

  function scheduleActionsClose() {
    if (actionsCloseTimerRef.current !== null) {
      window.clearTimeout(actionsCloseTimerRef.current)
    }
    actionsCloseTimerRef.current = window.setTimeout(() => {
      setActionsOpen(false)
      actionsCloseTimerRef.current = null
    }, 500)
  }

  if ((!attrs.url || attrs.url === 'error') && !isEditable) {
    return null
  }

  if (isEditable && !attrs.title) {
    return (
      <AttachmentUploadPlaceholder
        selected={selected}
        onUploadFiles={uploadFiles}
      />
    )
  }

  const actionBar = (
    <AttachmentActionBar
      attrs={attrs}
      displayType={displayType}
      isPdf={isPdf}
      onChangeDisplay={handleChangeDisplay}
      onDelete={deleteAttachment}
      onDownload={handleDownload}
      onEdit={openEdit}
    />
  )

  const content = (
    <span
      className={cn(
        'pk:inline-flex pk:max-w-full pk:align-baseline pk:leading-none',
        node.type.name === 'blockAttachment' && 'pk:my-4 pk:block pk:w-full pk:leading-normal',
      )}
      data-drag-handle={node.type.name === 'blockAttachment' ? 'true' : undefined}
      onMouseEnter={keepActionsOpen}
      onMouseLeave={scheduleActionsClose}
      onPointerEnter={keepActionsOpen}
      onPointerLeave={scheduleActionsClose}
    >
      <AttachmentContent
        attrs={attrs}
        editable={isEditable}
        isPdf={isPdf}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onResizeHeight={(height) => updateAttrs({ height })}
        selected={selected}
        type={displayType}
      />
    </span>
  )

  if (!isEditable) {
    return content
  }

  const isBlock = node.type.name === 'blockAttachment'

  if (isBlock) {
    return (
      <span
        className="pk:relative pk:my-4 pk:block pk:w-full"
        onMouseEnter={keepActionsOpen}
        onMouseLeave={scheduleActionsClose}
        onPointerEnter={keepActionsOpen}
        onPointerLeave={scheduleActionsClose}
      >
        {content}
        {actionsOpen && !editOpen ? (
          <span
            className="pk:absolute pk:left-0 pk:top-[-0.5rem] pk:z-[1305] pk:-translate-y-full pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
            contentEditable={false}
            onMouseEnter={keepActionsOpen}
            onMouseLeave={scheduleActionsClose}
            onPointerEnter={keepActionsOpen}
            onPointerLeave={scheduleActionsClose}
          >
            {actionBar}
          </span>
        ) : null}
        {editOpen ? (
          <span
            className="pk:absolute pk:left-0 pk:top-[calc(100%+0.5rem)] pk:z-[1310]"
            contentEditable={false}
            onMouseEnter={keepActionsOpen}
            onMouseLeave={scheduleActionsClose}
          >
            <AttachmentTitlePanel
              initialTitle={attrs.title}
              onCancel={() => setEditOpen(false)}
              onSave={(title) => {
                updateAttrs({ title })
                setEditOpen(false)
              }}
            />
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <PopoverRoot style={{ display: 'contents' }} open={editOpen || actionsOpen}>
      <PopoverTrigger
        style={{ display: 'inline-flex', maxWidth: '100%' }}
        onMouseEnter={keepActionsOpen}
        onMouseLeave={scheduleActionsClose}
      >
        {content}
      </PopoverTrigger>
      <PopoverPositioner
        placement={editOpen ? 'bottom' : 'top'}
        offset={6}
        hoist
        strategy="fixed"
      >
        <PopoverPopup
          className="pk:z-[1400] pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
          onMouseEnter={keepActionsOpen}
          onMouseLeave={scheduleActionsClose}
        >
          {editOpen ? (
            <AttachmentTitlePanel
              initialTitle={attrs.title}
              onCancel={() => setEditOpen(false)}
              onSave={(title) => {
                updateAttrs({ title })
                setEditOpen(false)
              }}
            />
          ) : (
            actionBar
          )}
        </PopoverPopup>
      </PopoverPositioner>
    </PopoverRoot>
  )
}

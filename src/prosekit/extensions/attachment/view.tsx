import { Menu } from '@base-ui/react/menu'
import { Tabs } from '@base-ui/react/tabs'
import { ChevronDown } from 'lucide-react'
import { NodeSelection } from 'prosekit/pm/state'
import type { ReactNodeViewProps } from 'prosekit/react'
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
  LinkIcon,
  ScrollToBottomLineIcon,
  UploadCloud2LineIcon,
} from '../../../icons'
import { Button, EditorFloatingPopover, EditorHoverPopover, Separator, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import type {
  AttachmentAttrs,
  AttachmentDisplayType,
  AttachmentExtensionOptions,
} from './types'

type AttachmentNodeName = 'inlineAttachment' | 'blockAttachment'
type AttachmentRenderType = AttachmentDisplayType | 'view'
type AttachmentInsertMode = 'upload' | 'link'
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

function getAttachmentTitleFromUrl(url: string) {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.split('/').filter(Boolean)
    const lastSegment = pathname.at(-1)

    if (lastSegment) {
      return decodeURIComponent(lastSegment)
    }
  } catch {
    // Ignore URL parsing failures and fallback to raw text handling.
  }

  const normalized = url.trim().split('/').filter(Boolean).at(-1)
  return normalized || '附件'
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

type AttachmentDisplayOption = {
  value: AttachmentRenderType
  label: string
  icon: React.ReactNode
}

function AttachmentDisplayMenu({
  displayType,
  isPdf,
  onChangeDisplay,
}: {
  displayType: AttachmentRenderType
  isPdf: boolean
  onChangeDisplay: (type: AttachmentRenderType) => void
}) {
  const options: AttachmentDisplayOption[] = [
    {
      value: 'icon',
      label: '图标文字',
      icon: <ScrollToBottomLineIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />,
    },
    {
      value: 'block',
      label: '文字卡片',
      icon: <CarouselViewIcon className="pk:text-base" style={{ transform: 'rotate(90deg)' }} />,
    },
  ]

  if (isPdf) {
    options.push({
      value: 'view',
      label: '预览卡片',
      icon: <CarouselViewIcon className="pk:text-base" />,
    })
  }

  const selectedOption = options.find((option) => option.value === displayType) ?? options[0]

  if (!selectedOption) {
    return null
  }

  return (
    <Menu.Root modal={false}>
      <Tooltip content="切换展示方式">
        <Menu.Trigger
          render={(
            <Button
              variant="ghost"
              size="default"
              className={cn(
                'pk:h-8 pk:min-w-[92px] pk:justify-start pk:gap-1.5 pk:rounded-lg pk:px-2',
                'pk:bg-[var(--editor-primary)] pk:text-white pk:hover:bg-[var(--editor-primary-hover)]',
              )}
            >
              <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center">
                {selectedOption.icon}
              </span>
              <span className="pk:min-w-0 pk:flex-1 pk:truncate pk:text-left pk:text-xs pk:font-bold">
                {selectedOption.label}
              </span>
              <ChevronDown className="pk:h-3.5 pk:w-3.5 pk:shrink-0" strokeWidth={1.85} />
            </Button>
          )}
        />
      </Tooltip>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={6}>
          <Menu.Popup className="pk:z-[1400] pk:min-w-[160px] pk:rounded-xl pk:border pk:border-black/6 pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgba(23,23,23,0.08)] pk:outline-none">
            {options.map((option) => {
              const selected = option.value === displayType

              return (
                <Menu.Item
                  key={option.value}
                  className={cn(
                    'pk:flex pk:min-h-8 pk:w-full pk:items-center pk:gap-2 pk:rounded-md pk:px-2 pk:text-left pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none',
                    'pk:hover:bg-[var(--editor-muted)]',
                    selected && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]',
                  )}
                  onClick={() => onChangeDisplay(option.value)}
                >
                  <span className="pk:inline-flex pk:h-4 pk:w-4 pk:shrink-0 pk:items-center pk:justify-center">
                    {option.icon}
                  </span>
                  <span className="pk:min-w-0 pk:flex-1 pk:truncate">
                    {option.label}
                  </span>
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
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
  onChangeDisplay: (type: AttachmentRenderType) => void
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void
  onDownload: (event: MouseEvent<HTMLButtonElement>) => void
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div
      className="pk:flex pk:items-center pk:gap-1 pk:p-1.5"
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
      <AttachmentDisplayMenu
        displayType={displayType}
        isPdf={isPdf}
        onChangeDisplay={onChangeDisplay}
      />
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
      className="pk:grid pk:w-[320px] pk:gap-3 pk:p-4"
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
  onInsertLink,
  selected,
}: {
  onUploadFiles: (
    files: File[],
    onProgress: (progress: number, current: number) => void,
  ) => Promise<void>
  onInsertLink: (url: string) => void
  selected: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const [linkValue, setLinkValue] = useState('')
  const [insertMode, setInsertMode] = useState<AttachmentInsertMode>('upload')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) {
      return
    }

    setPanelOpen(false)
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

  function handleOpenPanel() {
    if (uploading) {
      return
    }

    setPanelOpen(true)
  }

  function handleChangeInsertMode(value: unknown) {
    if (value === 'upload' || value === 'link') {
      setInsertMode(value)
    }
  }

  function handleClosePanel() {
    setPanelOpen(false)
  }

  function handleOpenFileDialog() {
    inputRef.current?.click()
  }

  function handleInsertLink() {
    const url = linkValue.trim()
    if (!url) {
      return
    }

    onInsertLink(url)
    setLinkValue('')
    setPanelOpen(false)
  }

  return (
    <>
      <span ref={anchorRef} className="pk:my-2 pk:inline-flex pk:max-w-full">
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
          onClick={handleOpenPanel}
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
      <EditorFloatingPopover
        anchor={anchorRef}
        open={panelOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleClosePanel()
          }
        }}
        side="bottom"
        align="start"
        sideOffset={8}
        popupClassName="pk:z-[1310] pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_20%)]"
        content={(
          <div className="pk:w-[min(350px,calc(100vw-2rem))] pk:overflow-hidden pk:rounded-lg pk:bg-[var(--editor-surface)]">
            <Tabs.Root
              value={insertMode}
              onValueChange={handleChangeInsertMode}
              className="pk:flex pk:flex-col"
            >
              <div className="pk:flex pk:h-12 pk:items-center pk:justify-center pk:border-b pk:border-[var(--editor-border)]">
                <Tabs.List className="pk:inline-flex pk:h-12 pk:items-center pk:justify-center">
                  <Tabs.Tab
                    value="upload"
                    className={cn(
                      'pk:flex pk:h-12 pk:min-w-20 pk:items-center pk:justify-center pk:border-b-2 pk:border-transparent pk:px-4 pk:text-sm pk:font-medium pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:text-[var(--editor-foreground)] pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)]',
                      insertMode === 'upload' && 'pk:border-[var(--editor-primary)] pk:text-[var(--editor-primary)]',
                    )}
                  >
                    上传
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="link"
                    className={cn(
                      'pk:flex pk:h-12 pk:min-w-24 pk:items-center pk:justify-center pk:border-b-2 pk:border-transparent pk:px-4 pk:text-sm pk:font-medium pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:text-[var(--editor-foreground)] pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)]',
                      insertMode === 'link' && 'pk:border-[var(--editor-primary)] pk:text-[var(--editor-primary)]',
                    )}
                  >
                    嵌入链接
                  </Tabs.Tab>
                </Tabs.List>
              </div>

              <Tabs.Panel value="upload" className="pk:p-4 pk:outline-none">
                <Button
                  type="button"
                  className="pk:h-10 pk:w-full pk:justify-center pk:gap-2"
                  disabled={uploading}
                  onClick={handleOpenFileDialog}
                >
                  {uploading ? (
                    <span className="pk:h-4 pk:w-4 pk:shrink-0 pk:animate-spin pk:rounded-full pk:border-2 pk:border-white/45 pk:border-t-white" />
                  ) : (
                    <UploadCloud2LineIcon className="pk:text-lg" />
                  )}
                  {uploading ? '附件上传中...' : '选择附件文件'}
                </Button>
              </Tabs.Panel>

              <Tabs.Panel value="link" className="pk:flex pk:flex-col pk:gap-4 pk:p-4 pk:outline-none">
                <input
                  type="url"
                  value={linkValue}
                  placeholder="输入附件的 URL"
                  aria-label="附件链接"
                  className="pk:h-10 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:transition-colors pk:placeholder:text-[var(--editor-muted-foreground)] pk:focus:border-[var(--editor-primary)] pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
                  onChange={(event) => setLinkValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      handleClosePanel()
                    }

                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleInsertLink()
                    }
                  }}
                />
                <Button
                  type="button"
                  className="pk:h-10 pk:w-full pk:justify-center pk:gap-2"
                  onClick={handleInsertLink}
                  disabled={!linkValue.trim()}
                >
                  <LinkIcon className="pk:text-base" />
                  嵌入附件
                </Button>
              </Tabs.Panel>
            </Tabs.Root>
          </div>
        )}
      />
    </>
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
  const [editOpen, setEditOpen] = useState(false)
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const attrs = useMemo(() => getNodeAttrs(node), [node])
  const isEditable = view.editable
  const isPdf = isPdfFile(attrs)
  const displayType = getDisplayType(node.type.name, attrs)

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

  function insertAttachmentFromUrl(url: string) {
    const pos = getPosition()
    if (pos === null) {
      return
    }

    const nextNode = createAttachmentNode(view, 'blockAttachment', {
      url,
      title: getAttachmentTitleFromUrl(url),
      size: '0',
      type: 'block',
      view: '0',
      height: 300,
    })

    if (!nextNode) {
      return
    }

    const tr = view.state.tr
      .insert(pos + node.nodeSize, nextNode)
      .delete(pos, pos + node.nodeSize)

    view.dispatch(tr.scrollIntoView())
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

  function handleChangeDisplay(nextType: AttachmentRenderType) {
    if (nextType === 'icon') {
      replaceNode('inlineAttachment', {
        ...attrs,
        type: 'icon',
        view: '0',
      })
      return
    }

    replaceNode('blockAttachment', {
      ...attrs,
      type: 'block',
      view: nextType === 'view' ? '1' : '0',
      height: attrs.height || 300,
    })
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
    setEditOpen(true)
  }

  if ((!attrs.url || attrs.url === 'error') && !isEditable) {
    return null
  }

  if (isEditable && !attrs.title) {
    return (
      <AttachmentUploadPlaceholder
        onInsertLink={insertAttachmentFromUrl}
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
      ref={anchorRef}
      className={cn(
        'pk:inline-flex pk:max-w-full pk:align-baseline pk:leading-none',
        node.type.name === 'blockAttachment' && 'pk:my-4 pk:block pk:w-full pk:leading-normal',
      )}
      data-drag-handle={node.type.name === 'blockAttachment' ? 'true' : undefined}
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

  return (
    <>
      <EditorHoverPopover
        disabled={!attrs.title || editOpen}
        hoverDelay={500}
        closeDelay={300}
        side="top"
        align="start"
        sideOffset={8}
        popupClassName="pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
        content={actionBar}
      >
        {content}
      </EditorHoverPopover>
      <EditorFloatingPopover
        anchor={anchorRef}
        open={editOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditOpen(false)
          }
        }}
        side="bottom"
        align={node.type.name === 'blockAttachment' ? 'start' : 'center'}
        sideOffset={8}
        popupClassName="pk:z-[1310] pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
        content={(
          <AttachmentTitlePanel
            initialTitle={attrs.title}
            onCancel={() => setEditOpen(false)}
            onSave={(title) => {
              updateAttrs({ title })
              setEditOpen(false)
            }}
          />
        )}
      />
    </>
  )
}

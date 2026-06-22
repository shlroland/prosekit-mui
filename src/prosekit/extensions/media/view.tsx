import { Tabs } from '@base-ui/react/tabs'
import type { ReactNodeViewProps } from 'prosekit/react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react'

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CopyIcon,
  DeleteLineIcon,
  EditLineIcon,
  ExportLineIcon,
  ImageLineIcon,
  LinkIcon,
  UploadCloud2LineIcon,
} from '../../../icons'
import { Button, EditorFloatingPopover, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import type { ImageAttrs, ImageOptions } from './types'

import './view.css'

type MediaKind = 'image' | 'video' | 'audio'
type MediaInsertMode = 'upload' | 'link'
type ImageAlign = NonNullable<ImageAttrs['align']>
type ImageResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type ImageViewProps = ReactNodeViewProps & {
  options?: ImageOptions
}

const imageDimensionsCache = new Map<string, { width: number; height: number }>()

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getMediaKindLabel(kind: MediaKind) {
  switch (kind) {
    case 'image':
      return '图片'
    case 'video':
      return '视频'
    case 'audio':
      return '音频'
  }
}

function getAccept(kind: MediaKind) {
  switch (kind) {
    case 'image':
      return 'image/*'
    case 'video':
      return 'video/*'
    case 'audio':
      return 'audio/*'
  }
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  return null
}

function normalizeImageAlign(value: unknown): ImageAlign {
  return value === 'center' || value === 'right' ? value : 'left'
}

function getImageShellStyle(align: ImageAlign): CSSProperties {
  if (align === 'center') {
    return { marginLeft: 'auto', marginRight: 'auto' }
  }

  if (align === 'right') {
    return { marginLeft: 'auto', marginRight: 0 }
  }

  return { marginLeft: 0, marginRight: 'auto' }
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  const cached = imageDimensionsCache.get(src)
  if (cached) {
    return Promise.resolve(cached)
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      }
      imageDimensionsCache.set(src, dimensions)
      resolve(dimensions)
    }
    image.onerror = () => reject(new Error('无法加载图片'))
    image.src = src
  })
}

function getImageDimensionsFromFile(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        })
      }
      image.onerror = () => reject(new Error('无法读取图片文件'))
      image.src = String(event.target?.result || '')
    }
    reader.onerror = () => reject(new Error('无法读取文件'))
    reader.readAsDataURL(file)
  })
}

function UploadProgress({ value }: { value: number }) {
  return (
    <span className="prosekit-upload-progress-track">
      <span className="prosekit-upload-progress-bar" style={{ width: `${value}%` }} />
    </span>
  )
}

function MediaUploadPlaceholder({
  kind,
  progress,
  onClick,
}: {
  kind: MediaKind
  progress: number | null
  onClick: () => void
}) {
  return (
    <div
      className="prosekit-media-placeholder"
      contentEditable={false}
      onClick={onClick}
    >
      <div className="prosekit-media-placeholder-title">
        {progress === null ? `点击上传${getMediaKindLabel(kind)}` : `正在上传${getMediaKindLabel(kind)}`}
      </div>
      {progress !== null ? (
        <div className="prosekit-media-upload-progress">
          <UploadProgress value={progress} />
        </div>
      ) : null}
    </div>
  )
}

function MediaInsertPanel({
  kind,
  linkValue,
  progress,
  onCancel,
  onLinkChange,
  onLinkSubmit,
  onUploadClick,
}: {
  kind: MediaKind
  linkValue: string
  progress: number | null
  onCancel: () => void
  onLinkChange: (value: string) => void
  onLinkSubmit: () => void
  onUploadClick: () => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onLinkSubmit()
  }

  return (
    <form
      className="prosekit-media-insert-panel"
      contentEditable={false}
      onSubmit={handleSubmit}
    >
      <div className="prosekit-media-insert-panel-title">
        插入{getMediaKindLabel(kind)}
      </div>
      <div className="prosekit-media-insert-panel-actions">
        <Button
          type="button"
          size="sm"
          className="prosekit-media-insert-panel-upload"
          onClick={onUploadClick}
        >
          <UploadCloud2LineIcon className="prosekit-media-button-icon" />
          上传文件
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="prosekit-media-insert-panel-cancel"
          onClick={onCancel}
        >
          取消
        </Button>
      </div>
      <div className="prosekit-media-insert-panel-link">
        <input
          type="url"
          value={linkValue}
          placeholder={`粘贴${getMediaKindLabel(kind)}链接`}
          className="prosekit-media-insert-panel-input"
          onChange={(event) => onLinkChange(event.target.value)}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="prosekit-media-insert-panel-submit"
        >
          <LinkIcon className="prosekit-media-button-icon" />
          插入链接
        </Button>
      </div>
      {progress !== null ? (
        <div className="prosekit-media-upload-progress">
          <UploadProgress value={progress} />
        </div>
      ) : null}
    </form>
  )
}

function MediaToolbar({
  kind,
  src,
  onEdit,
  onDelete,
}: {
  kind: MediaKind
  src: string
  onEdit: () => void
  onDelete: () => void
}) {
  async function copySource() {
    try {
      await navigator.clipboard.writeText(src)
    } catch {
      // Ignore unsupported clipboard environments.
    }
  }

  return (
    <div className="prosekit-media-toolbar" contentEditable={false}>
      <Tooltip content="修改地址">
        <Button variant="ghost" size="icon" aria-label="修改地址" className="prosekit-media-toolbar-button" onClick={onEdit}>
          <EditLineIcon className="prosekit-media-toolbar-icon" />
        </Button>
      </Tooltip>
      <Tooltip content="复制地址">
        <Button variant="ghost" size="icon" aria-label="复制地址" className="prosekit-media-toolbar-button" onClick={copySource}>
          <CopyIcon className="prosekit-media-toolbar-icon" />
        </Button>
      </Tooltip>
      {src ? (
        <Tooltip content={kind === 'image' ? '打开图片' : '打开媒体'}>
          <a
            aria-label={kind === 'image' ? '打开图片' : '打开媒体'}
            className="prosekit-media-toolbar-button"
            href={src}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExportLineIcon className="prosekit-media-toolbar-icon" />
          </a>
        </Tooltip>
      ) : null}
      <Tooltip content="删除">
        <Button variant="ghost" size="icon" aria-label="删除" className="prosekit-media-toolbar-button" onClick={onDelete}>
          <DeleteLineIcon className="prosekit-media-toolbar-icon" />
        </Button>
      </Tooltip>
    </div>
  )
}

function useMediaNodeActions({
  node,
  view,
  getPos,
}: ReactNodeViewProps) {
  function updateAttrs(nextAttrs: Record<string, unknown>) {
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...nextAttrs,
    })
    view.dispatch(tr)
    view.focus()
  }

  function deleteNode() {
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.delete(pos, pos + node.nodeSize)
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  return { updateAttrs, deleteNode }
}

export function ImageView(props: ImageViewProps) {
  const { node, options = {}, selected } = props
  const [hovered, setHovered] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [insertMode, setInsertMode] = useState<MediaInsertMode>(options.onUpload ? 'upload' : 'link')
  const [progress, setProgress] = useState<number | null>(null)
  const [dragCorner, setDragCorner] = useState<ImageResizeCorner | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)
  const src = normalizeText(node.attrs.src)
  const title = normalizeText(node.attrs.title)
  const width = normalizeNumber(node.attrs.width)
  const height = normalizeNumber(node.attrs.height)
  const align = normalizeImageAlign(node.attrs.align)
  const { updateAttrs, deleteNode } = useMediaNodeActions(props)

  function getCurrentDisplayWidth() {
    if (!imageRef.current) {
      return width || 400
    }

    return imageRef.current.offsetWidth || width || 400
  }

  function handleResizeStart(event: ReactMouseEvent<HTMLSpanElement>, corner: ImageResizeCorner) {
    event.preventDefault()
    event.stopPropagation()
    setIsResizing(true)
    setDragCorner(corner)
    dragStartXRef.current = event.clientX
    dragStartWidthRef.current = getCurrentDisplayWidth()
  }

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!isResizing || !dragCorner) {
      return
    }

    const deltaX = event.clientX - dragStartXRef.current
    const nextWidth = dragCorner === 'top-left' || dragCorner === 'bottom-left'
      ? dragStartWidthRef.current - deltaX
      : dragStartWidthRef.current + deltaX

    updateAttrs({
      width: Math.max(100, Math.min(1200, Math.round(nextWidth))),
      height: null,
    })
  }, [dragCorner, isResizing, updateAttrs])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    setDragCorner(null)
  }, [])

  useEffect(() => {
    if (!isResizing) {
      return
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [handleResizeEnd, handleResizeMove, isResizing])

  async function updateImageAttrs(nextSrc: string, nextTitle?: string) {
    const attrs: ImageAttrs = {
      src: nextSrc,
      title: nextTitle?.trim() || null,
    }

    try {
      const dimensions = await getImageDimensions(nextSrc)
      attrs.width = dimensions.width
      attrs.height = dimensions.height
    } catch {
      attrs.width = width || 400
      attrs.height = height
    }

    updateAttrs(attrs as Record<string, unknown>)
  }

  async function uploadFile(file: File) {
    setProgress(0)
    setPanelOpen(false)

    try {
      const dimensions = await getImageDimensionsFromFile(file)
      const uploadedUrl = options.onUpload
        ? await options.onUpload(file, ({ progress: nextProgress }) => {
            setProgress(Math.round(nextProgress * 100))
          })
        : URL.createObjectURL(file)

      updateAttrs({
        src: uploadedUrl,
        title: titleValue.trim() || null,
        width: dimensions.width,
        height: dimensions.height,
      })
      setProgress(100)
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('图片上传失败'))
    } finally {
      window.setTimeout(() => setProgress(null), 500)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      uploadFile(file)
    }
  }

  function openPanel() {
    setLinkValue(src)
    setTitleValue(title)
    setInsertMode(src ? 'link' : options.onUpload ? 'upload' : 'link')
    setPanelOpen(true)
  }

  function handleChangeInsertMode(value: unknown) {
    if (value === 'upload' || value === 'link') {
      setInsertMode(value)
    }
  }

  async function submitLink() {
    let nextSrc = linkValue.trim()
    if (!nextSrc || progress !== null) {
      return
    }

    try {
      if (options.onValidateUrl) {
        nextSrc = await options.onValidateUrl(nextSrc, 'image')
      }

      if (
        options.onUploadUrl
        && (nextSrc.startsWith('http://') || nextSrc.startsWith('https://') || nextSrc.startsWith('//'))
      ) {
        setProgress(8)
        const abortController = new AbortController()
        nextSrc = await options.onUploadUrl(nextSrc, abortController.signal)
      }

      await updateImageAttrs(nextSrc, titleValue)
      setPanelOpen(false)
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('图片链接处理失败'))
    } finally {
      setProgress(null)
    }
  }

  async function copyImageSource() {
    try {
      await navigator.clipboard.writeText(src)
    } catch {
      // Ignore unsupported clipboard environments.
    }
  }

  function changeAlign(nextAlign: ImageAlign) {
    updateAttrs({ align: nextAlign })
  }

  return (
    <div
      ref={anchorRef}
      className={cn(
        'prosekit-media-shell prosekit-image-shell',
        selected && 'ProseMirror-selectednode',
      )}
      style={src ? getImageShellStyle(align) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAccept('image')}
        hidden
        className="prosekit-media-upload-control"
        onChange={handleFileChange}
      />
      {hovered && src ? (
        <div className="prosekit-media-toolbar" contentEditable={false}>
          <Tooltip content="修改地址">
            <Button variant="ghost" size="icon" aria-label="修改地址" className="prosekit-media-toolbar-button" onClick={openPanel}>
              <EditLineIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="复制地址">
            <Button variant="ghost" size="icon" aria-label="复制地址" className="prosekit-media-toolbar-button" onClick={copyImageSource}>
              <CopyIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="左侧对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="左侧对齐"
              className={cn('prosekit-media-toolbar-button', align === 'left' && 'prosekit-media-toolbar-button-active')}
              onClick={() => changeAlign('left')}
            >
              <AlignLeftIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="居中对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="居中对齐"
              className={cn('prosekit-media-toolbar-button', align === 'center' && 'prosekit-media-toolbar-button-active')}
              onClick={() => changeAlign('center')}
            >
              <AlignCenterIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="右侧对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="右侧对齐"
              className={cn('prosekit-media-toolbar-button', align === 'right' && 'prosekit-media-toolbar-button-active')}
              onClick={() => changeAlign('right')}
            >
              <AlignRightIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="打开图片">
            <a
              aria-label="打开图片"
              className="prosekit-media-toolbar-button"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExportLineIcon className="prosekit-media-toolbar-icon" />
            </a>
          </Tooltip>
          <Tooltip content="删除">
            <Button variant="ghost" size="icon" aria-label="删除" className="prosekit-media-toolbar-button" onClick={deleteNode}>
              <DeleteLineIcon className="prosekit-media-toolbar-icon" />
            </Button>
          </Tooltip>
        </div>
      ) : null}
      {src ? (
        <>
          <span className="prosekit-media-image-frame" contentEditable={false}>
            <img
              ref={imageRef}
              className="prosekit-media-image"
              src={src}
              alt={title || ''}
              title={title || undefined}
              style={{
                width: width ? `${width}px` : undefined,
                height: width ? 'auto' : height ? `${height}px` : undefined,
              }}
              onError={(event) => {
                options.onError?.(event instanceof Error ? event : new Error('图片加载失败'))
              }}
            />
            {hovered || isResizing ? (
              <>
                <span
                  className="prosekit-media-image-resize-handle prosekit-media-image-resize-handle-top-left"
                  data-media-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'top-left')}
                />
                <span
                  className="prosekit-media-image-resize-handle prosekit-media-image-resize-handle-top-right"
                  data-media-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'top-right')}
                />
                <span
                  className="prosekit-media-image-resize-handle prosekit-media-image-resize-handle-bottom-left"
                  data-media-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'bottom-left')}
                />
                <span
                  className="prosekit-media-image-resize-handle prosekit-media-image-resize-handle-bottom-right"
                  data-media-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'bottom-right')}
                />
              </>
            ) : null}
          </span>
          {title ? (
            <span className="pk:mt-1 pk:block pk:w-full pk:text-center pk:text-xs pk:leading-5 pk:text-[var(--editor-muted-foreground)]">
              {title}
            </span>
          ) : null}
        </>
      ) : (
        <div
          className={cn(
            'pk:relative pk:flex pk:min-h-12 pk:min-w-[200px] pk:cursor-pointer pk:items-center pk:gap-3 pk:overflow-hidden pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-4 pk:py-3 pk:text-sm pk:text-[var(--editor-muted-foreground)] pk:transition-colors',
            progress === null && 'pk:hover:bg-[var(--editor-muted)]',
          )}
          style={progress !== null ? { '--media-upload-progress': `${progress}%` } as CSSProperties : undefined}
          contentEditable={false}
          onClick={progress === null ? openPanel : undefined}
        >
          {progress !== null ? (
            <span
              className="pk:pointer-events-none pk:absolute pk:inset-y-0 pk:left-0 pk:bg-[var(--editor-primary)] pk:opacity-10 pk:transition-[width] pk:duration-300"
              style={{ width: 'var(--media-upload-progress)' }}
            />
          ) : null}
          <ImageLineIcon className="pk:relative pk:z-[1] pk:shrink-0 pk:text-base" />
          <span className="pk:relative pk:z-[1] pk:min-w-0 pk:flex-1 pk:text-left">
            {progress === null ? '点击此处嵌入或粘贴图片链接' : '图片上传中...'}
          </span>
          {progress !== null ? (
            <span className="pk:relative pk:z-[1] pk:shrink-0 pk:text-xs pk:font-bold pk:text-[var(--editor-primary)]">
              {progress}%
            </span>
          ) : null}
        </div>
      )}
      <EditorFloatingPopover
        anchor={anchorRef}
        open={panelOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPanelOpen(false)
          }
        }}
        side="bottom"
        align="start"
        sideOffset={8}
        popupClassName="pk:z-[1310] pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_20%)]"
        content={(
          <div className="pk:w-[min(350px,calc(100vw-2rem))] pk:overflow-hidden pk:rounded-lg pk:bg-[var(--editor-surface)]" contentEditable={false}>
            <Tabs.Root value={insertMode} onValueChange={handleChangeInsertMode} className="pk:flex pk:flex-col">
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
                  disabled={!options.onUpload || progress !== null}
                  onClick={() => inputRef.current?.click()}
                >
                  {progress !== null ? (
                    <span className="pk:h-4 pk:w-4 pk:shrink-0 pk:animate-spin pk:rounded-full pk:border-2 pk:border-white/45 pk:border-t-white" />
                  ) : (
                    <ImageLineIcon className="pk:text-lg" />
                  )}
                  {progress !== null ? '图片上传中...' : '选择图片文件'}
                </Button>
              </Tabs.Panel>

              <Tabs.Panel value="link" className="pk:flex pk:flex-col pk:gap-4 pk:p-4 pk:outline-none">
                <input
                  type="url"
                  value={linkValue}
                  placeholder="输入图片的 URL"
                  aria-label="图片链接"
                  className="pk:h-10 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:transition-colors pk:placeholder:text-[var(--editor-muted-foreground)] pk:focus:border-[var(--editor-primary)] pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
                  onChange={(event) => setLinkValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      setPanelOpen(false)
                    }

                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void submitLink()
                    }
                  }}
                />
                <input
                  type="text"
                  value={titleValue}
                  placeholder="输入图片描述（可选）"
                  aria-label="图片描述"
                  className="pk:h-10 pk:w-full pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-3 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none pk:transition-colors pk:placeholder:text-[var(--editor-muted-foreground)] pk:focus:border-[var(--editor-primary)] pk:focus:ring-2 pk:focus:ring-[var(--editor-ring)]"
                  onChange={(event) => setTitleValue(event.target.value)}
                />
                <Button
                  type="button"
                  className="pk:h-10 pk:w-full pk:justify-center pk:gap-2"
                  onClick={() => void submitLink()}
                  disabled={!linkValue.trim() || progress !== null}
                >
                  <LinkIcon className="pk:text-base" />
                  嵌入图片
                </Button>
              </Tabs.Panel>
            </Tabs.Root>
          </div>
        )}
      />
    </div>
  )
}

export function VideoView(props: ReactNodeViewProps) {
  const { node, selected } = props
  const [hovered, setHovered] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const src = normalizeText(node.attrs.src)
  const width = normalizeText(node.attrs.width) || '100%'
  const { updateAttrs, deleteNode } = useMediaNodeActions(props)

  function uploadFile(file: File) {
    setProgress(8)
    let nextProgress = 8
    const timer = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 18, 92)
      setProgress(nextProgress)
    }, 140)

    window.setTimeout(() => {
      window.clearInterval(timer)
      updateAttrs({ src: URL.createObjectURL(file), width })
      setPanelOpen(false)
      setProgress(100)
      window.setTimeout(() => setProgress(null), 700)
    }, 900)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      uploadFile(file)
    }
  }

  function openPanel() {
    setLinkValue(src)
    setPanelOpen(true)
  }

  function submitLink() {
    const nextSrc = linkValue.trim()
    if (!nextSrc) {
      return
    }

    updateAttrs({ src: nextSrc, width })
    setPanelOpen(false)
  }

  return (
    <div
      className={`prosekit-media-shell prosekit-video-shell ${selected ? 'ProseMirror-selectednode' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAccept('video')}
        hidden
        className="prosekit-media-upload-control"
        onChange={handleFileChange}
      />
      {hovered ? (
        <MediaToolbar kind="video" src={src} onEdit={openPanel} onDelete={deleteNode} />
      ) : null}
      {src ? (
        <video className="prosekit-media-video" src={src} controls width={width} />
      ) : (
        <MediaUploadPlaceholder
          kind="video"
          progress={progress}
          onClick={openPanel}
        />
      )}
      {panelOpen ? (
        <MediaInsertPanel
          kind="video"
          linkValue={linkValue}
          progress={progress}
          onCancel={() => setPanelOpen(false)}
          onLinkChange={setLinkValue}
          onLinkSubmit={submitLink}
          onUploadClick={() => inputRef.current?.click()}
        />
      ) : null}
    </div>
  )
}

export function AudioView(props: ReactNodeViewProps) {
  const { node, selected } = props
  const [hovered, setHovered] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const src = normalizeText(node.attrs.src)
  const { updateAttrs, deleteNode } = useMediaNodeActions(props)

  function uploadFile(file: File) {
    setProgress(8)
    let nextProgress = 8
    const timer = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 18, 92)
      setProgress(nextProgress)
    }, 140)

    window.setTimeout(() => {
      window.clearInterval(timer)
      updateAttrs({ src: URL.createObjectURL(file) })
      setPanelOpen(false)
      setProgress(100)
      window.setTimeout(() => setProgress(null), 700)
    }, 900)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      uploadFile(file)
    }
  }

  function openPanel() {
    setLinkValue(src)
    setPanelOpen(true)
  }

  function submitLink() {
    const nextSrc = linkValue.trim()
    if (!nextSrc) {
      return
    }

    updateAttrs({ src: nextSrc })
    setPanelOpen(false)
  }

  return (
    <div
      className={`prosekit-media-shell prosekit-audio-shell ${selected ? 'ProseMirror-selectednode' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAccept('audio')}
        hidden
        className="prosekit-media-upload-control"
        onChange={handleFileChange}
      />
      {hovered ? (
        <MediaToolbar kind="audio" src={src} onEdit={openPanel} onDelete={deleteNode} />
      ) : null}
      {src ? (
        <audio className="prosekit-media-audio" src={src} controls />
      ) : (
        <MediaUploadPlaceholder
          kind="audio"
          progress={progress}
          onClick={openPanel}
        />
      )}
      {panelOpen ? (
        <MediaInsertPanel
          kind="audio"
          linkValue={linkValue}
          progress={progress}
          onCancel={() => setPanelOpen(false)}
          onLinkChange={setLinkValue}
          onLinkSubmit={submitLink}
          onUploadClick={() => inputRef.current?.click()}
        />
      ) : null}
    </div>
  )
}

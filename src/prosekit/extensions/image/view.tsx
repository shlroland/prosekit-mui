import { Tabs } from '@base-ui/react/tabs'
import type { ReactNodeViewProps } from 'prosekit/react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'

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
} from '../../../icons'
import { Button, EditorFloatingPopover, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import type { ImageAttrs, ImageOptions } from './types'

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

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  return null
}

function normalizeImageAlign(value: unknown): ImageAlign {
  return value === 'center' || value === 'right' ? value : 'left'
}

function getSelectedShellClassName(selected: boolean) {
  return selected
    ? 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_5%,transparent)]'
    : 'pk:border-[var(--editor-border)]'
}

const toolbarButtonClassName = 'pk:inline-flex pk:h-7 pk:w-7 pk:items-center pk:justify-center pk:rounded-md pk:text-[var(--editor-muted-foreground)] pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]'
const activeToolbarButtonClassName = 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]'
const toolbarIconClassName = 'pk:text-base'
const resizeHandleClassName = 'pk:absolute pk:z-[2] pk:h-3 pk:w-3 pk:rounded-full pk:border-2 pk:border-[color-mix(in_srgb,var(--editor-primary)_35%,transparent)] pk:bg-[var(--editor-background)] pk:transition-colors pk:hover:border-[var(--editor-primary)]'

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

function useImageNodeActions({
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
  const { updateAttrs, deleteNode } = useImageNodeActions(props)

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
        nextSrc = await options.onValidateUrl(nextSrc)
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
        'pk:relative pk:my-3 pk:block pk:w-fit pk:max-w-full pk:rounded-[10px] pk:border pk:p-1',
        getSelectedShellClassName(selected),
      )}
      data-image-shell
      style={src ? getImageShellStyle(align) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        data-image-upload-control
        onChange={handleFileChange}
      />
      {hovered && src ? (
        <div
          className="pk:absolute pk:left-2 pk:top-2 pk:z-[1305] pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgb(15_23_42_/_18%)]"
          contentEditable={false}
          data-image-toolbar
        >
          <Tooltip content="修改地址">
            <Button variant="ghost" size="icon" aria-label="修改地址" className={toolbarButtonClassName} onClick={openPanel}>
              <EditLineIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
          <Tooltip content="复制地址">
            <Button variant="ghost" size="icon" aria-label="复制地址" className={toolbarButtonClassName} onClick={copyImageSource}>
              <CopyIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
          <Tooltip content="左侧对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="左侧对齐"
              className={cn(toolbarButtonClassName, align === 'left' && activeToolbarButtonClassName)}
              onClick={() => changeAlign('left')}
            >
              <AlignLeftIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
          <Tooltip content="居中对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="居中对齐"
              className={cn(toolbarButtonClassName, align === 'center' && activeToolbarButtonClassName)}
              onClick={() => changeAlign('center')}
            >
              <AlignCenterIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
          <Tooltip content="右侧对齐">
            <Button
              variant="ghost"
              size="icon"
              aria-label="右侧对齐"
              className={cn(toolbarButtonClassName, align === 'right' && activeToolbarButtonClassName)}
              onClick={() => changeAlign('right')}
            >
              <AlignRightIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
          <Tooltip content="打开图片">
            <a
              aria-label="打开图片"
              className={toolbarButtonClassName}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExportLineIcon className={toolbarIconClassName} />
            </a>
          </Tooltip>
          <Tooltip content="删除">
            <Button variant="ghost" size="icon" aria-label="删除" className={toolbarButtonClassName} onClick={deleteNode}>
              <DeleteLineIcon className={toolbarIconClassName} />
            </Button>
          </Tooltip>
        </div>
      ) : null}
      {src ? (
        <>
          <span className="pk:relative pk:block pk:max-w-full" contentEditable={false}>
            <img
              ref={imageRef}
              className="pk:block pk:max-h-[480px] pk:max-w-full pk:rounded-[10px] pk:object-contain"
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
                  className={cn(resizeHandleClassName, 'pk:-left-1 pk:-top-1 pk:cursor-nwse-resize')}
                  data-image-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'top-left')}
                />
                <span
                  className={cn(resizeHandleClassName, 'pk:-right-1 pk:-top-1 pk:cursor-nesw-resize')}
                  data-image-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'top-right')}
                />
                <span
                  className={cn(resizeHandleClassName, 'pk:-bottom-1 pk:-left-1 pk:cursor-nesw-resize')}
                  data-image-resize-handle
                  onMouseDown={(event) => handleResizeStart(event, 'bottom-left')}
                />
                <span
                  className={cn(resizeHandleClassName, 'pk:-bottom-1 pk:-right-1 pk:cursor-nwse-resize')}
                  data-image-resize-handle
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

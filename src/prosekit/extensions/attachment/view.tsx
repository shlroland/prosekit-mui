import type { ReactNodeViewProps } from 'prosekit/react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

import {
  CopyIcon,
  DeleteLineIcon,
  DownloadLineIcon,
  EditLineIcon,
  FileIcon,
  LinkIcon,
  UploadCloud2LineIcon,
} from '../../../icons'
import { Button, Tooltip } from '../../../ui'

import './view.css'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function UploadProgress({ value }: { value: number }) {
  return (
    <span className="prosekit-upload-progress-track">
      <span className="prosekit-upload-progress-bar" style={{ width: `${value}%` }} />
    </span>
  )
}

function AttachmentInsertPanel({
  titleValue,
  urlValue,
  sizeValue,
  progress,
  onCancel,
  onSizeChange,
  onSubmit,
  onTitleChange,
  onUploadClick,
  onUrlChange,
}: {
  titleValue: string
  urlValue: string
  sizeValue: string
  progress: number | null
  onCancel: () => void
  onSizeChange: (value: string) => void
  onSubmit: () => void
  onTitleChange: (value: string) => void
  onUploadClick: () => void
  onUrlChange: (value: string) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      className="prosekit-attachment-insert-panel"
      contentEditable={false}
      onSubmit={handleSubmit}
    >
      <div className="prosekit-attachment-insert-panel-title">插入附件</div>
      <div className="prosekit-attachment-insert-panel-actions">
        <Button
          type="button"
          size="sm"
          className="prosekit-attachment-insert-panel-upload"
          onClick={onUploadClick}
        >
          <UploadCloud2LineIcon className="prosekit-attachment-button-icon" />
          上传文件
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="prosekit-attachment-insert-panel-cancel"
          onClick={onCancel}
        >
          取消
        </Button>
      </div>
      <div className="prosekit-attachment-insert-panel-fields">
        <input
          type="url"
          value={urlValue}
          placeholder="粘贴附件链接"
          className="prosekit-attachment-insert-panel-input"
          onChange={(event) => onUrlChange(event.target.value)}
        />
        <input
          type="text"
          value={titleValue}
          placeholder="附件标题"
          className="prosekit-attachment-insert-panel-input"
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <input
          type="text"
          value={sizeValue}
          placeholder="文件大小，可选"
          className="prosekit-attachment-insert-panel-input"
          onChange={(event) => onSizeChange(event.target.value)}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="prosekit-attachment-insert-panel-submit"
        >
          <LinkIcon className="prosekit-attachment-button-icon" />
          插入链接
        </Button>
      </div>
      {progress !== null ? (
        <span className="prosekit-attachment-upload-progress">
          <UploadProgress value={progress} />
        </span>
      ) : null}
    </form>
  )
}

export function AttachmentView({
  node,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const [hovered, setHovered] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [titleValue, setTitleValue] = useState('')
  const [sizeValue, setSizeValue] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const url = normalizeText(node.attrs.url)
  const title = normalizeText(node.attrs.title) || '未命名附件'
  const size = normalizeText(node.attrs.size)

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

  function uploadFile(file: File) {
    setProgress(8)
    let nextProgress = 8
    const timer = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 18, 92)
      setProgress(nextProgress)
    }, 140)

    window.setTimeout(() => {
      window.clearInterval(timer)
      updateAttrs({
        url: URL.createObjectURL(file),
        title: file.name,
        size: formatFileSize(file.size),
      })
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
    setUrlValue(url)
    setTitleValue(title === '未命名附件' ? '' : title)
    setSizeValue(size)
    setPanelOpen(true)
  }

  function submitLink() {
    const nextUrl = urlValue.trim()
    if (!nextUrl) {
      return
    }

    updateAttrs({
      url: nextUrl,
      title: titleValue.trim() || nextUrl,
      size: sizeValue.trim(),
    })
    setPanelOpen(false)
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Ignore unsupported clipboard environments.
    }
  }

  function deleteAttachment() {
    const pos = getPos()
    if (typeof pos !== 'number') {
      return
    }

    const tr = view.state.tr.delete(pos, pos + node.nodeSize)
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  const CardTag = url ? 'a' : 'div'

  return (
    <div
      className={`prosekit-attachment-shell ${selected ? 'ProseMirror-selectednode' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        className="prosekit-attachment-upload-control"
        onChange={handleFileChange}
      />
      {hovered ? (
        <div className="prosekit-attachment-toolbar" contentEditable={false}>
          <Tooltip content="修改附件">
            <Button variant="ghost" size="icon" aria-label="修改附件" className="prosekit-attachment-toolbar-button" onClick={openPanel}>
              <EditLineIcon className="prosekit-attachment-toolbar-icon" />
            </Button>
          </Tooltip>
          <Tooltip content="复制地址">
            <Button variant="ghost" size="icon" aria-label="复制地址" className="prosekit-attachment-toolbar-button" onClick={copyUrl}>
              <CopyIcon className="prosekit-attachment-toolbar-icon" />
            </Button>
          </Tooltip>
          {url ? (
            <Tooltip content="下载附件">
              <a
                aria-label="下载附件"
                className="prosekit-attachment-toolbar-button"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadLineIcon className="prosekit-attachment-toolbar-icon" />
              </a>
            </Tooltip>
          ) : null}
          <Tooltip content="删除附件">
            <Button variant="ghost" size="icon" aria-label="删除附件" className="prosekit-attachment-toolbar-button" onClick={deleteAttachment}>
              <DeleteLineIcon className="prosekit-attachment-toolbar-icon" />
            </Button>
          </Tooltip>
        </div>
      ) : null}
      <CardTag
        className="prosekit-attachment-card"
        href={url || undefined}
        target={url ? '_blank' : undefined}
        rel={url ? 'noopener noreferrer' : undefined}
        data-attachment="true"
        contentEditable={false}
        onClick={!url ? openPanel : undefined}
      >
        <FileIcon className="prosekit-attachment-card-icon" />
        <span className="prosekit-attachment-card-text">
          <span className="prosekit-attachment-card-title">{title}</span>
          {progress !== null ? (
            <span className="prosekit-attachment-upload-progress">
              <UploadProgress value={progress} />
            </span>
          ) : size ? (
            <span className="prosekit-attachment-card-size">{size}</span>
          ) : (
            <span className="prosekit-attachment-card-size">点击上传附件</span>
          )}
        </span>
      </CardTag>
      {panelOpen ? (
        <AttachmentInsertPanel
          titleValue={titleValue}
          urlValue={urlValue}
          sizeValue={sizeValue}
          progress={progress}
          onCancel={() => setPanelOpen(false)}
          onSizeChange={setSizeValue}
          onSubmit={submitLink}
          onTitleChange={setTitleValue}
          onUploadClick={() => inputRef.current?.click()}
          onUrlChange={setUrlValue}
        />
      ) : null}
    </div>
  )
}

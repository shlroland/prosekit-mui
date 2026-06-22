import type { ReactNodeViewProps } from 'prosekit/react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

import {
  CopyIcon,
  DeleteLineIcon,
  EditLineIcon,
  ExportLineIcon,
  LinkIcon,
  UploadCloud2LineIcon,
} from '../../../icons'
import { Button, Tooltip } from '../../../ui'

import './view.css'

type MediaKind = 'video' | 'audio'

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getMediaKindLabel(kind: MediaKind) {
  switch (kind) {
    case 'video':
      return '视频'
    case 'audio':
      return '音频'
  }
}

function getAccept(kind: MediaKind) {
  switch (kind) {
    case 'video':
      return 'video/*'
    case 'audio':
      return 'audio/*'
  }
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
        <Tooltip content="打开媒体">
          <a
            aria-label="打开媒体"
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

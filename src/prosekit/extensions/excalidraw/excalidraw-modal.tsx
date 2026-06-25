import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { ExcalidrawEditor } from './excalidraw-editor'

export type ExcalidrawModalProps = {
  open: boolean
  onClose: () => void
  onSave: (file: File) => void | Promise<void>
}

export function ExcalidrawModal({
  open,
  onClose,
  onSave,
}: ExcalidrawModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      data-excalidraw-modal
      className="pk:fixed pk:inset-0 pk:z-[1600] pk:flex pk:items-center pk:justify-center pk:bg-black/50 pk:p-4 pk:backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="pk:h-[min(90vh,860px)] pk:w-[min(1200px,calc(100vw-2rem))] pk:overflow-hidden pk:rounded-2xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_28px_96px_rgba(15,23,42,0.34)]"
        onMouseDown={(event) => {
          event.stopPropagation()
        }}
      >
        <ExcalidrawEditor onClose={onClose} onSave={onSave} />
      </div>
    </div>,
    document.body,
  )
}

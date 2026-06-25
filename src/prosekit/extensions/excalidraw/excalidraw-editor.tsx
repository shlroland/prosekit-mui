import '@excalidraw/excalidraw/index.css'

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { Button } from '../../../ui'

const LazyExcalidraw = lazy(async () => {
  const module = await import('@excalidraw/excalidraw')

  return {
    default: module.Excalidraw,
  }
})

export type ExcalidrawEditorProps = {
  onClose: () => void
  onSave: (file: File) => void | Promise<void>
}

export function ExcalidrawEditor({
  onClose,
  onSave,
}: ExcalidrawEditorProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [hasElements, setHasElements] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      body > .excalidraw.excalidraw-modal-container {
        position: fixed;
        z-index: 1700;
        top: auto;
        height: 100vh;
        width: 100vw;
      }

      .excalidraw button.scroll-back-to-content {
        bottom: 60px;
      }
    `
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  async function handleSave() {
    if (!apiRef.current || saving) {
      return
    }

    const elements = apiRef.current.getSceneElements()
    if (elements.length < 1) {
      return
    }

    setSaving(true)

    try {
      const appState = apiRef.current.getAppState()
      const files = apiRef.current.getFiles()
      const { exportToSvg } = await import('@excalidraw/excalidraw')
      const svgElement = await exportToSvg({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          exportScale: 2,
        },
        files,
      })

      const svgString = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const file = new File([blob], `excalidraw-${Date.now()}.svg`, {
        type: 'image/svg+xml',
      })

      await onSave(file)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Suspense
      fallback={(
        <div className="pk:flex pk:h-full pk:items-center pk:justify-center pk:text-sm pk:text-[var(--editor-muted-foreground)]">
          加载 Excalidraw...
        </div>
      )}
    >
      <div className="pk:relative pk:h-full pk:w-full">
        <LazyExcalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api
            setLoaded(true)
            setHasElements(api.getSceneElements().length > 0)
          }}
          onChange={(elements) => {
            setHasElements(elements.length > 0)
          }}
        />
        <div className="pk:pointer-events-none pk:absolute pk:inset-x-0 pk:bottom-4 pk:z-20 pk:flex pk:justify-center">
          <div className="pk:pointer-events-auto pk:relative pk:z-20 pk:flex pk:items-center pk:gap-2 pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_88%,white)] pk:p-2 pk:shadow-[0_20px_48px_rgba(15,23,42,0.18)] pk:backdrop-blur-md">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button disabled={!loaded || !hasElements || saving} onClick={handleSave}>
              {saving ? '导入中...' : '保存为图片导入'}
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

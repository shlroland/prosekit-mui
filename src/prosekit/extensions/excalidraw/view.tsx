import type { ReactNodeViewProps } from 'prosekit/react'
import { useState } from 'react'

import { MindMapIcon } from '../../../icons'
import { cn } from '../../../utils/cn'
import type { ExcalidrawExtensionOptions } from './types'
import { ExcalidrawModal } from './excalidraw-modal'

type ExcalidrawViewProps = ReactNodeViewProps & {
  options?: ExcalidrawExtensionOptions
}

function getImageDimensionsFromFile(file: File): Promise<{ width: number, height: number }> {
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
      image.onerror = () => reject(new Error('无法读取 Excalidraw 导出尺寸'))
      image.src = String(event.target?.result || '')
    }
    reader.onerror = () => reject(new Error('无法读取 Excalidraw 文件'))
    reader.readAsDataURL(file)
  })
}

export function ExcalidrawView({
  node,
  selected,
  view,
  getPos,
  options = {},
}: ExcalidrawViewProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!view.editable) {
    return null
  }

  async function handleSave(file: File) {
    try {
      const uploadedUrl = options.onUpload
        ? await options.onUpload(file, () => {})
        : URL.createObjectURL(file)

      if (!uploadedUrl) {
        return
      }

      const dimensions = await getImageDimensionsFromFile(file).catch(() => null)
      const pos = getPos()

      const imageType = view.state.schema.nodes.image
      if (!imageType) {
        throw new Error('image 节点未注册，无法插入 Excalidraw 导出结果')
      }

      const imageWidth = Math.min(dimensions?.width ?? options.maxWidth ?? 760, options.maxWidth ?? 760)
      const imageNode = imageType.create({
        src: uploadedUrl,
        width: imageWidth,
        height: null,
        title: null,
        align: 'center',
      })

      if (typeof pos === 'number') {
        view.dispatch(
          view.state.tr.replaceWith(pos, pos + node.nodeSize, imageNode).scrollIntoView(),
        )
      } else {
        view.dispatch(
          view.state.tr.replaceSelectionWith(imageNode).scrollIntoView(),
        )
      }

      view.focus()
      setModalOpen(false)
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Excalidraw 导入失败'))
    }
  }

  return (
    <>
      <div data-excalidraw-controls="true" className="pk:my-2">
        <button
          type="button"
          data-drag-handle
          className={cn(
            'pk:flex pk:min-h-12 pk:w-full pk:min-w-[200px] pk:items-center pk:gap-3 pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-4 pk:py-3 pk:text-left pk:text-sm pk:text-[var(--editor-muted-foreground)] pk:transition-colors pk:hover:bg-[var(--editor-muted)]',
            selected && 'pk:border-[var(--editor-primary)] pk:bg-[color-mix(in_srgb,var(--editor-primary)_6%,var(--editor-surface))]',
          )}
          onClick={() => {
            setModalOpen(true)
          }}
        >
          <MindMapIcon className="pk:h-4 pk:w-4 pk:shrink-0" />
          <span className="pk:min-w-0 pk:flex-1">点击此处嵌入 Excalidraw 绘图</span>
        </button>
      </div>
      <ExcalidrawModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
        }}
        onSave={handleSave}
      />
    </>
  )
}

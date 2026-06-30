import type { ComponentProps, MouseEvent as ReactMouseEvent, PropsWithChildren, ReactElement } from 'react'
import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PhotoSlider } from 'react-photo-view'
import { MinusIcon, ZoomInIcon } from 'lucide-react'

import {
  AnticlockwiseLineIcon,
  ClockwiseLineIcon,
  CloseCircleFillIcon,
  Download2LineIcon,
  FullscreenExitLineIcon,
  FullscreenLineIcon,
  ResetLeftFillIcon,
  SkipLeftIcon,
  SkipRightIcon,
} from '../../icons'
import { cn } from '../../utils/cn'

type PhotoSliderProps = ComponentProps<typeof PhotoSlider>
type PhotoSliderImage = PhotoSliderProps['images'][number]
type PhotoSliderOverlayProps = Parameters<NonNullable<PhotoSliderProps['overlayRender']>>[0]

type ImageViewerItemData = PhotoSliderImage & {
  element: HTMLElement
  src: string
}

export type ImageViewerProviderProps = PropsWithChildren<{
  className?: string
  loop?: PhotoSliderProps['loop']
  maskOpacity?: PhotoSliderProps['maskOpacity']
  maskClosable?: PhotoSliderProps['maskClosable']
  photoClosable?: PhotoSliderProps['photoClosable']
  pullClosable?: PhotoSliderProps['pullClosable']
  portalContainer?: PhotoSliderProps['portalContainer']
  onVisibleChange?: (visible: boolean, index: number) => void
  onIndexChange?: (index: number) => void
}>

export type ImageViewerItemProps = PropsWithChildren<{
  src: string
  disabled?: boolean
}>

type ImageViewerContextValue = {
  open: (src: string) => void
}

const ImageViewerContext = createContext<ImageViewerContextValue | null>(null)

const viewerItemSelector = '[data-image-viewer-item][data-src]'

function collectImageViewerItems(container: HTMLElement | null): ImageViewerItemData[] {
  if (!container) {
    return []
  }

  const items: ImageViewerItemData[] = []

  container.querySelectorAll<HTMLElement>(viewerItemSelector).forEach((element, index) => {
    const src = element.dataset.src || ''

    if (!src) {
      return
    }

    items.push({
      key: `${index}:${src}`,
      src,
      element,
      originRef: { current: element },
    })
  })

  return items
}

function triggerDownload(src: string) {
  const anchor = document.createElement('a')
  anchor.href = src
  anchor.download = decodeURIComponent(src.split('/').pop() || 'image')
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function ImageViewerToolbar({
  images,
  index,
  scale,
  rotate,
  onScale,
  onRotate,
  onIndexChange,
  onClose,
}: PhotoSliderOverlayProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const currentSrc = images[index]?.src || ''
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  function changeIndex(delta: number) {
    if (!hasMultipleImages) {
      return
    }

    const nextIndex = (index + delta + images.length) % images.length
    onIndexChange(nextIndex)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
      return
    }

    document.documentElement.requestFullscreen?.()
  }

  const buttonClassName = 'pk:inline-flex pk:h-8 pk:w-8 pk:items-center pk:justify-center pk:rounded-md pk:text-white/90 pk:transition pk:hover:bg-white/15 pk:hover:text-white pk:focus-visible:outline-none pk:focus-visible:ring-2 pk:focus-visible:ring-white/70 pk:disabled:pointer-events-none pk:disabled:opacity-35'
  const iconClassName = 'pk:h-5 pk:w-5'

  return (
    <div className="pk:fixed pk:inset-x-0 pk:bottom-0 pk:z-[10000] pk:flex pk:justify-center pk:px-4 pk:pb-5 pk:pt-8 pk:[pointer-events:none]">
      <div className="pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:bg-black/60 pk:p-1.5 pk:text-white pk:shadow-[0_18px_45px_rgb(0_0_0_/_38%)] pk:backdrop-blur-md pk:[pointer-events:auto]">
        <button type="button" className={buttonClassName} aria-label="上一张图片" disabled={!hasMultipleImages} onClick={() => changeIndex(-1)}>
          <SkipLeftIcon className={iconClassName} />
        </button>
        <button type="button" className={buttonClassName} aria-label="下一张图片" disabled={!hasMultipleImages} onClick={() => changeIndex(1)}>
          <SkipRightIcon className={iconClassName} />
        </button>
        <span className="pk:mx-1 pk:h-5 pk:w-px pk:bg-white/25" />
        <button type="button" className={buttonClassName} aria-label="放大图片" onClick={() => onScale(Math.min(5, scale + 0.5))}>
          <ZoomInIcon className={iconClassName} />
        </button>
        <button type="button" className={buttonClassName} aria-label="缩小图片" onClick={() => onScale(Math.max(0.5, scale - 0.5))}>
          <MinusIcon className={iconClassName} />
        </button>
        <button type="button" className={buttonClassName} aria-label="逆时针旋转" onClick={() => onRotate(rotate - 90)}>
          <AnticlockwiseLineIcon className={iconClassName} />
        </button>
        <button type="button" className={buttonClassName} aria-label="顺时针旋转" onClick={() => onRotate(rotate + 90)}>
          <ClockwiseLineIcon className={iconClassName} />
        </button>
        <button
          type="button"
          className={buttonClassName}
          aria-label="重置图片"
          onClick={() => {
            onScale(1)
            onRotate(0)
          }}
        >
          <ResetLeftFillIcon className={iconClassName} />
        </button>
        <span className="pk:mx-1 pk:h-5 pk:w-px pk:bg-white/25" />
        <button type="button" className={buttonClassName} aria-label="全屏预览" onClick={toggleFullscreen}>
          {fullscreen ? <FullscreenExitLineIcon className={iconClassName} /> : <FullscreenLineIcon className={iconClassName} />}
        </button>
        <button type="button" className={buttonClassName} aria-label="下载图片" disabled={!currentSrc} onClick={() => triggerDownload(currentSrc)}>
          <Download2LineIcon className={iconClassName} />
        </button>
        <button type="button" className={buttonClassName} aria-label="关闭预览" onClick={() => onClose()}>
          <CloseCircleFillIcon className={iconClassName} />
        </button>
      </div>
    </div>
  )
}

export function ImageViewerProvider({
  children,
  className,
  loop = 3,
  maskOpacity = 0.72,
  maskClosable = true,
  photoClosable,
  pullClosable = true,
  portalContainer,
  onVisibleChange,
  onIndexChange,
}: ImageViewerProviderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [images, setImages] = useState<PhotoSliderImage[]>([])

  const openByElement = useCallback((element: HTMLElement) => {
    const nextItems = collectImageViewerItems(containerRef.current)
    const nextIndex = Math.max(0, nextItems.findIndex((item) => item.element === element))

    setImages(nextItems)
    setIndex(nextIndex)
    setVisible(true)
    onVisibleChange?.(true, nextIndex)
  }, [onVisibleChange])

  const open = useCallback((src: string) => {
    const nextItems = collectImageViewerItems(containerRef.current)
    const nextIndex = Math.max(0, nextItems.findIndex((item) => item.src === src))

    setImages(nextItems)
    setIndex(nextIndex)
    setVisible(true)
    onVisibleChange?.(true, nextIndex)
  }, [onVisibleChange])

  const handleClickCapture = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return
    }

    const target = event.target instanceof Element ? event.target : null
    const element = target?.closest<HTMLElement>(viewerItemSelector)

    if (!element || element.dataset.imagePreviewDisabled === 'true') {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    openByElement(element)
  }, [openByElement])

  const contextValue = useMemo(() => ({ open }), [open])

  return (
    <ImageViewerContext.Provider value={contextValue}>
      <div ref={containerRef} className={className} onClickCapture={handleClickCapture}>
        {children}
      </div>
      <PhotoSlider
        images={images}
        visible={visible}
        index={index}
        onClose={() => {
          setVisible(false)
          onVisibleChange?.(false, index)
        }}
        onIndexChange={(nextIndex) => {
          setIndex(nextIndex)
          onIndexChange?.(nextIndex)
        }}
        bannerVisible={false}
        loop={loop}
        maskOpacity={maskOpacity}
        maskClosable={maskClosable}
        photoClosable={photoClosable}
        pullClosable={pullClosable}
        portalContainer={portalContainer}
        overlayRender={(props) => <ImageViewerToolbar {...props} />}
      />
    </ImageViewerContext.Provider>
  )
}

export function ImageViewerItem({ src, disabled = false, children }: ImageViewerItemProps) {
  const context = useContext(ImageViewerContext)
  const child = Children.only(children)

  if (!isValidElement(child)) {
    return <>{children}</>
  }

  const element = child as ReactElement<Record<string, unknown>>
  const className = typeof element.props.className === 'string' ? element.props.className : undefined

  return cloneElement(element, {
    'data-image-viewer-item': '',
    'data-image-preview-disabled': disabled ? 'true' : undefined,
    'data-src': src,
    className: cn(className, !disabled && 'pk:cursor-zoom-in'),
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      const originalOnClick = element.props.onClick

      if (typeof originalOnClick === 'function') {
        originalOnClick(event)
      }

      if (event.defaultPrevented || disabled) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      context?.open(src)
    },
  })
}

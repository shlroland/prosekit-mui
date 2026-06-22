import type { ReactNodeViewProps } from 'prosekit/react'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { DeleteLineIcon, FlipLeftLineIcon, FlipRightLineIcon } from '../../../icons'
import { Button, Separator, Tooltip } from '../../../ui'
import { cn } from '../../../utils/cn'
import {
  applyFlipGridWidths,
  collectWidths,
  findChildIndex,
  findFlipGridAncestor,
  normalizeWithMin,
} from './utils'
import { DEFAULT_GAP, MAX_COLUMNS, MIN_WIDTH } from './types'

function clampPair(left: number, right: number, delta: number) {
  const nextLeft = Math.min(Math.max(left + delta, MIN_WIDTH), left + right - MIN_WIDTH)
  const nextRight = left + right - nextLeft

  return [nextLeft, nextRight]
}

function resolveNodePos(doc: ProseMirrorNode, target: ProseMirrorNode, preferredPos: number) {
  const preferredNode = doc.nodeAt(preferredPos)

  if (preferredNode?.type === target.type) {
    return preferredPos
  }

  let foundPos: number | null = null
  doc.descendants((node, pos) => {
    if (foundPos !== null) {
      return false
    }

    if (node.type === target.type) {
      foundPos = pos
      return false
    }

    return true
  })

  return foundPos
}

export function FlipGridView({
  node,
  contentRef,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const gap = typeof node.attrs.gap === 'string' ? node.attrs.gap : DEFAULT_GAP
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [hovering, setHovering] = useState(false)
  const [hoverGapIndex, setHoverGapIndex] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [showPercents, setShowPercents] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1)
  const [contentOffsetX, setContentOffsetX] = useState(0)
  const [gapPx, setGapPx] = useState(() => {
    const parsed = Number.parseFloat(gap)

    return Number.isFinite(parsed) ? parsed : 0
  })
  const isEditable = view.editable
  const widths = useMemo(() => collectWidths(node), [node])
  const safeWidths = useMemo(() => normalizeWithMin(widths, MIN_WIDTH), [widths])

  useEffect(() => {
    const root = wrapperRef.current
    const content = root?.querySelector<HTMLElement>('[data-node-view-content="true"]')

    if (!content) {
      return
    }

    content.style.display = 'flex'
    content.style.width = '100%'
    content.style.gap = gap
    content.style.alignItems = 'stretch'
    content.style.justifyContent = 'stretch'
    content.style.position = 'relative'
  }, [gap, node])

  useLayoutEffect(() => {
    const root = wrapperRef.current

    if (!root) {
      return
    }

    const updateMetrics = () => {
      const content = root.querySelector<HTMLElement>('[data-node-view-content="true"]')
      const rootRect = root.getBoundingClientRect()
      const rect = content?.getBoundingClientRect() ?? rootRect
      const computedGap = content ? getComputedStyle(content).gap : gap
      const parsedGap = Number.parseFloat(computedGap || '0')
      const nextGap = Number.isFinite(parsedGap) ? parsedGap : 0
      const nextWidth = Math.max(1, rect.width || 1)
      const nextOffsetX = Math.max(0, rect.left - rootRect.left)

      setContainerWidth((current) => (current === nextWidth ? current : nextWidth))
      setContentOffsetX((current) => (current === nextOffsetX ? current : nextOffsetX))
      setGapPx((current) => (current === nextGap ? current : nextGap))
    }

    updateMetrics()

    const observer = new ResizeObserver(updateMetrics)
    observer.observe(root)

    return () => {
      observer.disconnect()
    }
  }, [gap])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const layout = useMemo(() => {
    const handlePercents: number[] = []
    const labelPercents: number[] = []
    let accPx = 0

    safeWidths.forEach((width, index) => {
      const widthPx = (width / 100) * containerWidth
      const labelPx = accPx + widthPx
      labelPercents.push((labelPx / containerWidth) * 100)
      accPx += widthPx

      if (index < safeWidths.length - 1) {
        const centerPx = accPx + gapPx / 2
        handlePercents.push((centerPx / containerWidth) * 100)
        accPx += gapPx
      }
    })

    return { handlePercents, labelPercents }
  }, [containerWidth, gapPx, safeWidths])

  function applyWidths(nextWidths: number[]) {
    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    const parentPos = resolveNodePos(view.state.doc, node, pos)

    if (parentPos === null) {
      return
    }

    const tr = view.state.tr
    const { changed } = applyFlipGridWidths({
      tr,
      parentNode: node,
      parentPos,
      nextWidths,
    })

    if (changed) {
      view.dispatch(tr)
    }
  }

  function handleResizeStart(index: number, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!isEditable) {
      return
    }

    const startX = event.clientX
    const startWidths = [...safeWidths]
    const width = wrapperRef.current?.getBoundingClientRect().width || containerWidth || 1
    setDragIndex(index)
    setShowPercents(true)

    let rafId: number | null = null

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (rafId !== null) {
        return
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null
        const deltaPx = moveEvent.clientX - startX
        const deltaPercent = (deltaPx / width) * 100
        const [nextLeft, nextRight] = clampPair(
          startWidths[index] ?? 0,
          startWidths[index + 1] ?? 0,
          deltaPercent,
        )
        const nextWidths = [...startWidths]
        nextWidths[index] = nextLeft
        nextWidths[index + 1] = nextRight
        applyWidths(nextWidths)
      })
    }

    const handleMouseUp = () => {
      setDragIndex(null)
      setShowPercents(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }

      cleanupRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    cleanupRef.current = handleMouseUp
  }

  const showHandles = isEditable && (hovering || dragIndex !== null || hoverGapIndex !== null)

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'node-flipGrid pk:my-2.5 pk:block pk:w-full pk:rounded-md pk:border pk:px-3 pk:py-3',
        selected
          ? 'pk:border-[color:var(--editor-primary)]'
          : 'pk:border-[color:var(--editor-border)]',
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        if (dragIndex === null) {
          setHovering(false)
        }
      }}
      style={{
        position: 'relative',
        background:
          'linear-gradient(180deg, rgba(252,250,245,0.98) 0%, rgba(248,245,238,0.96) 100%)',
        boxShadow: selected
          ? '0 0 0 1px rgba(25,118,210,0.18), 0 14px 30px rgba(23,23,23,0.05)'
          : '0 10px 24px rgba(23,23,23,0.04)',
      }}
    >
      <div ref={contentRef} />
      {isEditable ? (
        <>
          {layout.handlePercents.map((percent, index) => {
            const active = dragIndex === index || hoverGapIndex === index

            return (
              <div
                key={index}
                data-flip-grid-controls="true"
                style={{
                  position: 'absolute',
                  left: `${contentOffsetX + (percent / 100) * containerWidth}px`,
                  width: Math.max(gapPx, 8),
                  top: 12,
                  bottom: 12,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  zIndex: 2,
                }}
                onMouseEnter={() => setHoverGapIndex(index)}
                onMouseLeave={() => setHoverGapIndex(null)}
                onMouseDown={(event) => handleResizeStart(index, event)}
              >
                <div
                  style={{
                    height: '100%',
                    minHeight: 16,
                    width: 2,
                    borderRadius: '4px',
                    backgroundColor: active
                      ? 'rgba(25, 118, 210, 0.72)'
                      : 'rgba(25, 118, 210, 0.34)',
                    cursor: 'ew-resize',
                    opacity: showHandles || active ? 1 : 0,
                    transition: 'opacity 0.18s ease, background-color 0.18s ease',
                    pointerEvents: 'auto',
                  }}
                />
              </div>
            )
          })}
          {showPercents
            ? layout.labelPercents.map((offset, index) => (
              <div
                key={`percent-${index}`}
                style={{
                  position: 'absolute',
                  top: 4,
                  left: `${contentOffsetX + (offset / 100) * containerWidth - 4}px`,
                  transform: 'translateX(-100%)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.56)',
                  color: '#fff',
                  fontSize: 10,
                  lineHeight: 1.2,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 3,
                }}
              >
                {`${Math.round(safeWidths[index] ?? 0)}%`}
              </div>
            ))
            : null}
        </>
      ) : null}
    </div>
  )
}

export function FlipGridColumnView({
  node,
  contentRef,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const width = Math.max(MIN_WIDTH, Number(node.attrs.width) || 50)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const toolbarCloseTimerRef = useRef<number | null>(null)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const isEditable = view.editable

  const widths = useMemo(() => {
    const pos = getPos()

    if (typeof pos !== 'number') {
      return []
    }

    const $pos = view.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)

    if (!found) {
      return []
    }

    const list = collectWidths(found.node)
    const total = list.reduce((sum, current) => sum + current, 0)

    if (!Number.isFinite(total) || total <= 0 || total > 100000) {
      const fallback = found.node.childCount > 0 ? 100 / found.node.childCount : 0
      return normalizeWithMin(new Array(found.node.childCount).fill(fallback), MIN_WIDTH)
    }

    return normalizeWithMin(list, MIN_WIDTH)
  }, [getPos, node, view.state.doc])

  useEffect(() => {
    return () => {
      if (toolbarCloseTimerRef.current !== null) {
        window.clearTimeout(toolbarCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!wrapper) {
      return
    }

    wrapper.style.width = `${width}%`
    wrapper.style.flex = `0 0 ${width}%`
    wrapper.style.minWidth = '0'
  }, [width])

  function applyWidths(
    nextWidths: number[],
    insertAt?: number,
    removeIndex?: number,
    focusIndex?: number,
  ) {
    const pos = getPos()

    if (typeof pos !== 'number') {
      return false
    }

    const { state } = view
    const $pos = state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)

    if (!found) {
      return false
    }

    const parentPos = $pos.before(found.depth)
    const tr = state.tr
    const { changed } = applyFlipGridWidths({
      tr,
      parentNode: found.node,
      parentPos,
      nextWidths,
      insertAt,
      removeIndex,
      focusIndex,
    })

    if (changed) {
      view.dispatch(tr.scrollIntoView())
      view.focus()
    }

    return changed
  }

  function handleInsert(direction: 'left' | 'right') {
    if (!isEditable) {
      return
    }

    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    const $pos = view.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)

    if (!found) {
      return
    }

    const colIndex = findChildIndex(found.node, node)

    if (colIndex < 0 || found.node.childCount >= MAX_COLUMNS) {
      return
    }

    const insertIndex = direction === 'left' ? colIndex : colIndex + 1
    const currentWidths = collectWidths(found.node)
    const newWidth = Math.max(MIN_WIDTH, Number((100 / (found.node.childCount + 1)).toFixed(2)))
    const shrinkFactor = (100 - newWidth) / 100
    const nextWidths = currentWidths.map((currentWidth) => currentWidth * shrinkFactor)

    nextWidths.splice(insertIndex, 0, newWidth)
    applyWidths(nextWidths, insertIndex, undefined, insertIndex)
  }

  function handleDelete() {
    if (!isEditable) {
      return
    }

    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    const $pos = view.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)

    if (!found) {
      return
    }

    const colIndex = findChildIndex(found.node, node)

    if (colIndex < 0) {
      return
    }

    const currentWidths = collectWidths(found.node)
    const nextWidths = currentWidths.filter((_, index) => index !== colIndex)
    const targetFocus = Math.max(0, Math.min(colIndex - 1, nextWidths.length - 1))

    applyWidths(nextWidths, undefined, colIndex, targetFocus)
  }

  function keepToolbarOpen() {
    if (!isEditable) {
      return
    }

    if (toolbarCloseTimerRef.current !== null) {
      window.clearTimeout(toolbarCloseTimerRef.current)
      toolbarCloseTimerRef.current = null
    }

    setToolbarOpen(true)
  }

  function scheduleToolbarClose() {
    if (!isEditable) {
      return
    }

    if (toolbarCloseTimerRef.current !== null) {
      window.clearTimeout(toolbarCloseTimerRef.current)
    }

    toolbarCloseTimerRef.current = window.setTimeout(() => {
      setToolbarOpen(false)
      toolbarCloseTimerRef.current = null
    }, 300)
  }

  const toolbar = (
    <div
      data-flip-grid-controls="true"
      onMouseEnter={keepToolbarOpen}
      onMouseLeave={scheduleToolbarClose}
      className="pk:absolute pk:right-2 pk:top-2 pk:z-[4] pk:flex pk:w-max pk:min-w-max pk:items-center pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1 pk:shadow-[0_12px_32px_rgba(15,23,42,0.18),0_3px_10px_rgba(15,23,42,0.12)]"
    >
      <Tooltip content="左侧插入">
        <Button
          variant="ghost"
          size="icon"
          aria-label="左侧插入"
          onClick={() => handleInsert('left')}
          className="pk:h-7 pk:w-7 pk:rounded-sm"
        >
          <FlipLeftLineIcon className="pk:text-base" />
        </Button>
      </Tooltip>
      <Tooltip content="右侧插入">
        <Button
          variant="ghost"
          size="icon"
          aria-label="右侧插入"
          onClick={() => handleInsert('right')}
          className="pk:h-7 pk:w-7 pk:rounded-sm"
        >
          <FlipRightLineIcon className="pk:text-base" />
        </Button>
      </Tooltip>
      {widths.length > 2 ? (
        <>
          <Separator
            orientation="vertical"
            className="pk:mx-1 pk:my-1 pk:h-5"
          />
          <Tooltip content="删除当前栏">
            <Button
              variant="ghost"
              size="icon"
              aria-label="删除当前栏"
              onClick={() => handleDelete()}
              className="pk:h-7 pk:w-7 pk:rounded-sm"
            >
              <DeleteLineIcon className="pk:text-base" />
            </Button>
          </Tooltip>
        </>
      ) : null}
    </div>
  )

  const column = (
    <div
      ref={wrapperRef}
      className={cn(
        'flip-grid-column relative h-full w-full min-w-0 rounded-sm border px-4 py-4',
        selected
          ? 'pk:border-[color:var(--editor-primary)]'
          : 'pk:border-[rgba(23,23,23,0.12)]',
      )}
      onMouseEnter={keepToolbarOpen}
      onMouseLeave={scheduleToolbarClose}
      style={{
        width: isEditable ? '100%' : `${width}%`,
        flex: isEditable ? '1 1 auto' : `0 0 ${width}%`,
        minWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.94)',
        boxShadow: selected
          ? '0 0 0 1px rgba(25,118,210,0.18)'
          : 'inset 0 1px 0 rgba(255,255,255,0.65)',
      }}
    >
      {isEditable && (toolbarOpen || selected) ? toolbar : null}
      <div ref={contentRef} className="pk:min-h-6 pk:w-full" />
    </div>
  )

  return column
}

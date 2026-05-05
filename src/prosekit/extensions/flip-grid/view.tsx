import { Box, Divider, IconButton, Paper, Stack, Tooltip } from '@mui/material'
import {
  PanelLeftOpen,
  PanelRightOpen,
  Trash2,
} from 'lucide-react'
import type { ReactNodeViewProps } from 'prosekit/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../../utils/cn'
import {
  applyFlipGridWidths,
  collectWidths,
  findChildIndex,
  findFlipGridAncestor,
  normalizeWithMin,
} from './utils'
import { DEFAULT_GAP, MAX_COLUMNS, MIN_WIDTH } from './types'

export function FlipGridView({ node, contentRef, selected }: ReactNodeViewProps) {
  const gap = typeof node.attrs.gap === 'string' ? node.attrs.gap : DEFAULT_GAP
  const wrapperRef = useRef<HTMLDivElement | null>(null)

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
  }, [gap, node])

  return (
    <Box
      ref={wrapperRef}
      className={cn(
        'my-2.5 block w-full rounded-md border px-3 py-3',
        selected
          ? 'border-[color:var(--mui-palette-primary-main)]'
          : 'border-[color:var(--mui-palette-divider)]',
      )}
      style={{
        background:
          'linear-gradient(180deg, rgba(252,250,245,0.98) 0%, rgba(248,245,238,0.96) 100%)',
        boxShadow: selected
          ? '0 0 0 1px rgba(25,118,210,0.18), 0 14px 30px rgba(23,23,23,0.05)'
          : '0 10px 24px rgba(23,23,23,0.04)',
      }}
    >
      <Box ref={contentRef} />
    </Box>
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
  const [hovered, setHovered] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
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
    if (!wrapperRef.current) {
      return
    }

    const root = wrapperRef.current.parentElement

    if (!root) {
      return
    }

    root.style.width = `${width}%`
    root.style.flex = `0 0 ${width}%`
    root.style.minWidth = '0'
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

  return (
    <Box
      ref={wrapperRef}
      className={cn(
        'flip-grid-column relative h-full w-full min-w-0 rounded-sm border px-4 py-4',
        selected
          ? 'border-[color:var(--mui-palette-primary-main)]'
          : 'border-[rgba(23,23,23,0.12)]',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'rgba(255,255,255,0.94)',
        boxShadow: selected
          ? '0 0 0 1px rgba(25,118,210,0.18)'
          : 'inset 0 1px 0 rgba(255,255,255,0.65)',
      }}
    >
      {isEditable && (hovered || selected) ? (
        <Paper
          data-flip-grid-controls="true"
          elevation={0}
          className="absolute left-1/2 top-[-14px] z-[2] flex -translate-x-1/2 rounded-md border border-[color:var(--mui-palette-divider)] bg-[rgba(255,255,255,0.98)] px-1 py-1 shadow-[0_10px_24px_rgba(23,23,23,0.08)]"
        >
          <Stack direction="row" alignItems="center">
            <Tooltip title="左侧插入" arrow>
              <IconButton
                size="small"
                onClick={() => handleInsert('left')}
                className="h-7 w-7 rounded-sm"
              >
                <PanelLeftOpen size={15} strokeWidth={1.9} />
              </IconButton>
            </Tooltip>
            <Tooltip title="右侧插入" arrow>
              <IconButton
                size="small"
                onClick={() => handleInsert('right')}
                className="h-7 w-7 rounded-sm"
              >
                <PanelRightOpen size={15} strokeWidth={1.9} />
              </IconButton>
            </Tooltip>
            <Divider
              orientation="vertical"
              flexItem
              className="mx-1 my-1 border-[color:var(--mui-palette-divider)]"
            />
            <Tooltip title={widths.length > 2 ? '删除当前栏' : '移除分栏'} arrow>
              <IconButton
                size="small"
                onClick={() => handleDelete()}
                className="h-7 w-7 rounded-sm"
              >
                <Trash2 size={15} strokeWidth={1.9} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      ) : null}
      <Box ref={contentRef} className="min-h-6 w-full" />
    </Box>
  )
}

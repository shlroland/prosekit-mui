import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import './toolbar.css'

export type TableSize = {
  rows: number
  columns: number
}

export type TableSizePickerProps = {
  anchorEl: HTMLElement | null
  open: boolean
  maxRows?: number
  maxColumns?: number
  defaultRows?: number
  defaultColumns?: number
  onClose: () => void
  onSelect: (size: TableSize) => void
}

export function TableSizePicker({
  anchorEl,
  open,
  maxRows = 10,
  maxColumns = 10,
  defaultRows = 3,
  defaultColumns = 4,
  onClose,
  onSelect,
}: TableSizePickerProps) {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [hoveredSize, setHoveredSize] = useState<TableSize>({
    rows: defaultRows,
    columns: defaultColumns,
  })

  const rows = Math.max(1, maxRows)
  const columns = Math.max(1, maxColumns)
  const activeRows = Math.min(hoveredSize.rows, rows)
  const activeColumns = Math.min(hoveredSize.columns, columns)

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      return
    }

    const rect = anchorEl.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 6,
      left: rect.left,
    })
  }, [anchorEl, open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (popupRef.current?.contains(target) || anchorEl?.contains(target)) {
        return
      }

      onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [anchorEl, onClose, open])

  function handleSelect(size: TableSize) {
    onSelect(size)
    onClose()
  }

  if (!open || !anchorEl) {
    return null
  }

  return (
    <div
      ref={popupRef}
      className="table-size-picker-popper"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="table-size-picker-surface">
        <div className="grid gap-2">
          <span className="table-size-picker-label">
            {activeRows} x {activeColumns}
          </span>
          <div
            className="table-size-picker-grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 18px)`,
            }}
          >
            {Array.from({ length: rows * columns }, (_, index) => {
              const row = Math.floor(index / columns) + 1
              const column = (index % columns) + 1
              const active = row <= activeRows && column <= activeColumns

              return (
                <button
                  key={`${row}-${column}`}
                  type="button"
                  aria-label={`Insert ${row} by ${column} table`}
                  onMouseEnter={() => setHoveredSize({ rows: row, columns: column })}
                  onFocus={() => setHoveredSize({ rows: row, columns: column })}
                  onClick={() => handleSelect({ rows: row, columns: column })}
                  className="table-size-picker-cell"
                  data-active={active ? 'true' : undefined}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

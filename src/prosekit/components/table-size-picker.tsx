import { useEffect, useState } from 'react'

import { EditorFloatingPopover } from '../../ui'
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
  const [hoveredSize, setHoveredSize] = useState<TableSize>({
    rows: defaultRows,
    columns: defaultColumns,
  })

  const rows = Math.max(1, maxRows)
  const columns = Math.max(1, maxColumns)
  const activeRows = Math.min(hoveredSize.rows, rows)
  const activeColumns = Math.min(hoveredSize.columns, columns)

  useEffect(() => {
    if (!open) {
      return
    }

    setHoveredSize({
      rows: defaultRows,
      columns: defaultColumns,
    })
  }, [defaultColumns, defaultRows, open])

  function handleSelect(size: TableSize) {
    onSelect(size)
    onClose()
  }

  if (!anchorEl) {
    return null
  }

  return (
    <EditorFloatingPopover
      anchor={anchorEl}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      side="bottom"
      align="start"
      sideOffset={6}
      popupClassName="table-size-picker-popper table-size-picker-surface"
      content={(
        <div className="pk:grid pk:gap-2">
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
      )}
    />
  )
}

import { useEffect, useState } from 'react'

import { EditorFloatingPopover } from '../../ui'

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
      popupClassName="pk:fixed pk:z-[1300] pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-2.5 pk:shadow-[0_12px_32px_rgba(23,23,23,0.12)]"
      content={(
        <div className="pk:grid pk:gap-2">
          <span className="pk:text-center pk:text-xs pk:font-semibold pk:text-[var(--editor-muted-foreground)]">
            {activeRows} x {activeColumns}
          </span>
          <div
            className="pk:grid pk:gap-1"
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
                  className="pk:h-[18px] pk:w-[18px] pk:cursor-pointer pk:rounded-sm pk:border pk:p-0 pk:outline-none pk:transition-colors focus:pk:shadow-[0_0_0_2px_var(--editor-ring)]"
                  data-active={active ? 'true' : undefined}
                  style={{
                    backgroundColor: active ? 'var(--editor-primary-soft)' : 'var(--editor-background)',
                    borderColor: active ? 'var(--editor-primary)' : 'var(--editor-border)',
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    />
  )
}

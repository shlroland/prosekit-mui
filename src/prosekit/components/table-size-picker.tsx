import {
  Box,
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'

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

  function handleSelect(size: TableSize) {
    onSelect(size)
    onClose()
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      className="table-size-picker-popper"
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          className="table-size-picker-surface"
        >
          <Stack spacing={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              className="table-size-picker-label"
            >
              {activeRows} x {activeColumns}
            </Typography>
            <Box
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
                  <Box
                    key={`${row}-${column}`}
                    component="button"
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
            </Box>
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Popper>
  )
}

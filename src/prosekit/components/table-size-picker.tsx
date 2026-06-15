import {
  Box,
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'

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
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            mt: 0.75,
            p: 1.25,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {activeRows} x {activeColumns}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 18px)`,
                gap: 0.5,
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
                    sx={{
                      width: 18,
                      height: 18,
                      p: 0,
                      border: '1px solid',
                      borderColor: active ? 'primary.main' : 'divider',
                      borderRadius: 0.5,
                      bgcolor: active ? 'primary.light' : 'background.default',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'background-color 120ms ease, border-color 120ms ease',
                      '&:focus-visible': {
                        boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
                      },
                    }}
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

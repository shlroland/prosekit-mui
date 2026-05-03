import {
  Box,
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, type ChangeEvent, type ReactNode } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

import { cn } from '../../utils/cn'
import './color-picker.css'

export type ColorPickerPreset = {
  key: string
  color: string
  label?: string
}

export type ColorPickerProps = {
  anchorEl: HTMLElement | null
  open: boolean
  value: string
  defaultColor: string
  presets?: ColorPickerPreset[]
  onClose: () => void
  onChange: (color: string) => void
  onSubmit: (color: string) => void
  onReset?: () => void
  resetLabel?: ReactNode
  className?: string
}

function isValidHexColor(value: string) {
  if (!value.startsWith('#')) {
    return false
  }

  const colorValue = value.slice(1)
  return (
    /^[0-9A-Fa-f]{3}$/.test(colorValue) ||
    /^[0-9A-Fa-f]{6}$/.test(colorValue) ||
    /^[0-9A-Fa-f]{8}$/.test(colorValue)
  )
}

export function ColorPicker({
  anchorEl,
  open,
  value,
  defaultColor,
  presets = [],
  onClose,
  onChange,
  onSubmit,
  onReset,
  resetLabel = '默认',
  className,
}: ColorPickerProps) {
  const canSubmit = useMemo(() => isValidHexColor(value), [value])

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  function handleSubmit() {
    if (!canSubmit) {
      return
    }

    onSubmit(value)
    onClose()
  }

  function handleReset() {
    onReset?.()
    onClose()
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      className={cn('prosekit-color-picker-popper', className)}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper className="prosekit-color-picker-paper">
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              className="prosekit-color-picker-header"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  className="prosekit-color-picker-swatch prosekit-color-picker-swatch-default"
                  sx={{ backgroundColor: defaultColor }}
                  onClick={handleReset}
                />
                <Typography className="prosekit-color-picker-reset-label">
                  {resetLabel}
                </Typography>
              </Stack>
              <Typography className="prosekit-color-picker-caption">
                Text color
              </Typography>
            </Stack>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              className="prosekit-color-picker-grid"
            >
              {presets.map((preset) => (
                <Box
                  key={preset.key}
                  className="prosekit-color-picker-swatch"
                  sx={{ backgroundColor: preset.color }}
                  title={preset.label ?? preset.color}
                  onClick={() => {
                    onChange(preset.color)
                    onSubmit(preset.color)
                    onClose()
                  }}
                />
              ))}
            </Stack>

            <Box className="prosekit-color-picker-panel">
              <HexAlphaColorPicker color={value} onChange={onChange} />
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              className="prosekit-color-picker-footer"
            >
              <Stack spacing={0.5} className="prosekit-color-picker-value-block">
                <Typography className="prosekit-color-picker-value-label">
                  Hex
                </Typography>
                <TextField
                  value={value}
                  size="small"
                  onChange={handleInputChange}
                  slotProps={{
                    input: {
                      className: 'prosekit-color-picker-input',
                    },
                  }}
                />
              </Stack>

              <Button
                size="small"
                variant="contained"
                disabled={!canSubmit}
                className="prosekit-color-picker-submit"
                onClick={handleSubmit}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Popper>
  )
}

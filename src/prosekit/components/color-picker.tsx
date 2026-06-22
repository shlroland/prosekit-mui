import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

import { Button } from '../../ui'
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
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const canSubmit = useMemo(() => isValidHexColor(value), [value])

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      return
    }

    const rect = anchorEl.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
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

  if (!open || !anchorEl) {
    return null
  }

  return (
    <div
      ref={popupRef}
      className={cn('prosekit-color-picker-popper', className)}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="prosekit-color-picker-paper">
        <div className="pk:grid pk:gap-3">
          <div className="prosekit-color-picker-header">
            <button
              type="button"
              className="pk:inline-flex pk:items-center pk:gap-2"
              onClick={handleReset}
            >
              <span
                className="prosekit-color-picker-swatch prosekit-color-picker-swatch-default"
                style={{ backgroundColor: defaultColor }}
              />
              <span className="prosekit-color-picker-reset-label">
                {resetLabel}
              </span>
            </button>
            <span className="prosekit-color-picker-caption">
              Text color
            </span>
          </div>

          <div className="prosekit-color-picker-grid">
            {presets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="prosekit-color-picker-swatch"
                style={{ backgroundColor: preset.color }}
                title={preset.label ?? preset.color}
                onClick={() => {
                  onChange(preset.color)
                  onSubmit(preset.color)
                  onClose()
                }}
              />
            ))}
          </div>

          <div className="prosekit-color-picker-panel">
            <HexAlphaColorPicker color={value} onChange={onChange} />
          </div>

          <div className="prosekit-color-picker-footer">
            <label className="prosekit-color-picker-value-block">
              <span className="prosekit-color-picker-value-label">
                Hex
              </span>
              <input
                value={value}
                onChange={handleInputChange}
                className="prosekit-color-picker-input"
              />
            </label>

            <Button
              size="sm"
              disabled={!canSubmit}
              className="prosekit-color-picker-submit"
              onClick={handleSubmit}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

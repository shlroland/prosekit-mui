import {
  useMemo,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { HexAlphaColorPicker } from 'react-colorful'

import { Button, EditorFloatingPopover } from '../../ui'
import { cn } from '../../utils/cn'
import type { EditorColorPresetGroup } from './color-presets'
import './color-picker.css'

export type ColorPickerPreset = {
  key: string
  color?: string
  value?: string | null
  label?: string
}

export type ColorPickerProps = {
  anchorEl: HTMLElement | null
  open: boolean
  value: string
  defaultColor: string
  presets?: ColorPickerPreset[]
  presetGroups?: EditorColorPresetGroup[]
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
  presetGroups,
  onClose,
  onChange,
  onSubmit,
  onReset,
  resetLabel = '默认',
  className,
}: ColorPickerProps) {
  const canSubmit = useMemo(() => isValidHexColor(value), [value])
  const groups = useMemo(() => {
    if (presetGroups) {
      return presetGroups
    }

    return [
      {
        key: 'presets',
        label: '常用',
        presets: presets.map((preset) => ({
          key: preset.key,
          label: preset.label ?? preset.color ?? preset.value ?? '默认',
          value: preset.value ?? preset.color ?? null,
        })),
      },
    ]
  }, [presetGroups, presets])

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
      sideOffset={8}
      popupClassName={cn('prosekit-color-picker-popper prosekit-color-picker-paper', className)}
      content={
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

          <div className="prosekit-color-picker-groups">
            {groups.map((group) => (
              <div key={group.key} className="prosekit-color-picker-group">
                <span className="prosekit-color-picker-group-label">
                  {group.label}
                </span>
                <div className="prosekit-color-picker-grid">
                  {group.presets.map((preset) => {
                    const color = preset.value ?? defaultColor

                    return (
                      <button
                        key={preset.key}
                        type="button"
                        className={cn(
                          'prosekit-color-picker-swatch',
                          preset.value === null && 'prosekit-color-picker-swatch-default',
                        )}
                        style={{ backgroundColor: color }}
                        title={preset.label ?? color}
                        onClick={() => {
                          if (preset.value === null) {
                            handleReset()
                            return
                          }

                          onChange(preset.value)
                          onSubmit(preset.value)
                          onClose()
                        }}
                      />
                    )
                  })}
                </div>
              </div>
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
      }
    />
  )
}

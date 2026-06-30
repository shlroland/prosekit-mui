import { useMemo, useState, type ReactNode } from 'react'

import { FontFamilyIcon } from '../../icons'
import { EditorComboboxMenu, type EditorMenuOption } from '../../ui'
import { cn } from '../../utils/cn'
import {
  getAvailableFontFamilyOptions,
  getFallbackFontFamilyOptions,
  type FontFamilyOption,
} from '../extensions/font-family'

export type FontFamilySelectProps = {
  value?: string | null
  className?: string
  triggerClassName?: string
  children?: ReactNode
  onChange: (family: string | null) => void
}

function toMenuOption(option: FontFamilyOption): EditorMenuOption {
  return {
    id: option.id,
    label: option.label,
    keywords: option.keywords,
    meta: option.source === 'system' ? '本机' : option.value ? '预设' : '',
  }
}

function getOptionValue(option: EditorMenuOption, fontOptions: FontFamilyOption[]) {
  return fontOptions.find((item) => item.id === option.id)?.value ?? null
}

export function FontFamilySelect({
  value,
  className,
  triggerClassName,
  children,
  onChange,
}: FontFamilySelectProps) {
  const [fontOptions, setFontOptions] = useState<FontFamilyOption[]>(() => getFallbackFontFamilyOptions())
  const [loadedSystemFonts, setLoadedSystemFonts] = useState(false)
  const selectedValue = value || 'default'

  const menuOptions = useMemo(() => {
    return fontOptions.map(toMenuOption)
  }, [fontOptions])

  async function loadSystemFonts() {
    if (loadedSystemFonts) {
      return
    }

    setLoadedSystemFonts(true)
    setFontOptions(await getAvailableFontFamilyOptions())
  }

  return (
    <EditorComboboxMenu
      options={menuOptions}
      value={selectedValue}
      searchable
      searchLabel="搜索字体"
      searchPlaceholder="搜索字体..."
      emptyText="没有匹配的字体"
      side="bottom"
      align="start"
      sideOffset={6}
      popupClassName="pk:!w-[260px] pk:!min-w-[260px]"
      listClassName="pk:max-h-[320px]"
      onOpenChange={(open) => {
        if (open) {
          void loadSystemFonts()
        }
      }}
      onSelect={(option) => {
        onChange(getOptionValue(option, fontOptions))
      }}
      getOptionIcon={() => <FontFamilyIcon className="pk:h-4 pk:w-4" />}
      renderOptionLabel={(option) => {
        const family = getOptionValue(option, fontOptions)

        return (
          <span
            className="pk:block pk:min-w-0 pk:truncate"
            style={family ? { fontFamily: family } : undefined}
          >
            {option.label}
          </span>
        )
      }}
    >
      <button
        type="button"
        className={cn(
          'toolbar-select-trigger pk:min-w-[132px] pk:max-w-[180px] pk:justify-start pk:gap-1.5',
          triggerClassName,
          className,
        )}
      >
        {children ?? (
          <>
            <FontFamilyIcon className="pk:h-4 pk:w-4 pk:shrink-0" />
            <span className="pk:truncate">
              {fontOptions.find((option) => option.value === value)?.label ?? '默认字体'}
            </span>
          </>
        )}
      </button>
    </EditorComboboxMenu>
  )
}

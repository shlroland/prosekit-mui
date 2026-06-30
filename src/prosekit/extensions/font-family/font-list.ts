import type { FontFamilyOption } from './types'

type LocalFontData = {
  family: string
  fullName: string
  postscriptName: string
  style: string
}

type QueryLocalFontsOptions = {
  postscriptNames?: string[]
}

declare global {
  interface Window {
    queryLocalFonts?: (options?: QueryLocalFontsOptions) => Promise<LocalFontData[]>
  }

  interface Navigator {
    userAgentData?: {
      platform?: string
    }
  }
}

const commonFontFamilies = [
  'Inter',
  'Geist',
  'Roboto',
  'Arial',
  'Helvetica',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
]

const macFontFamilies = [
  'SF Pro Text',
  'SF Pro Display',
  'Helvetica Neue',
  'Avenir Next',
  'Menlo',
  'Monaco',
  'PingFang SC',
  'Hiragino Sans',
  'Songti SC',
  'Kaiti SC',
]

const windowsFontFamilies = [
  'Segoe UI',
  'Calibri',
  'Cambria',
  'Candara',
  'Consolas',
  'Microsoft YaHei',
  'Microsoft JhengHei',
  'SimSun',
  'SimHei',
  'KaiTi',
]

export const defaultFontFamilyOption: FontFamilyOption = {
  id: 'default',
  label: '默认字体',
  value: null,
  source: 'fallback',
  keywords: ['default', 'inherit', 'system'],
}

export const systemFontFamilyOption: FontFamilyOption = {
  id: 'system',
  label: '系统默认',
  value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  source: 'fallback',
  keywords: ['system-ui', 'apple-system', 'segoe'],
}

function getPlatform() {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase()
}

function createFontFamilyOption(family: string, source: FontFamilyOption['source']): FontFamilyOption {
  return {
    id: family,
    label: family,
    value: family,
    source,
    keywords: [family],
  }
}

function uniqueOptions(options: FontFamilyOption[]) {
  const seen = new Set<string>()
  const result: FontFamilyOption[] = []

  for (const option of options) {
    const key = (option.value ?? option.id).toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(option)
  }

  return result
}

export function getFallbackFontFamilyOptions(platform = getPlatform()): FontFamilyOption[] {
  const platformFonts = platform.includes('mac')
    ? macFontFamilies
    : platform.includes('win')
      ? windowsFontFamilies
      : []

  return uniqueOptions([
    defaultFontFamilyOption,
    systemFontFamilyOption,
    ...commonFontFamilies.map((family) => createFontFamilyOption(family, 'fallback')),
    ...platformFonts.map((family) => createFontFamilyOption(family, 'fallback')),
  ])
}

export async function querySystemFontFamilyOptions(): Promise<FontFamilyOption[]> {
  if (typeof window === 'undefined' || typeof window.queryLocalFonts !== 'function') {
    return []
  }

  const fonts = await window.queryLocalFonts()
  const familyNames = Array.from(new Set(fonts.map((font) => font.family).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))

  return familyNames.map((family) => createFontFamilyOption(family, 'system'))
}

export async function getAvailableFontFamilyOptions(): Promise<FontFamilyOption[]> {
  try {
    const systemOptions = await querySystemFontFamilyOptions()

    if (systemOptions.length > 0) {
      return uniqueOptions([
        defaultFontFamilyOption,
        systemFontFamilyOption,
        ...systemOptions,
      ])
    }
  } catch {
    // The Local Font Access API is permission-gated and not available in every browser.
  }

  return getFallbackFontFamilyOptions()
}

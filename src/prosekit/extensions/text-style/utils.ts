import type { TextStyleAttrKey, TextStyleAttrs } from './types'
import { getActiveMarkAttrs } from '../shared/mark-attrs'

export const textStyleAttrKeys: TextStyleAttrKey[] = [
  'color',
  'backgroundColor',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'verticalAlign',
]

export const verticalAlignValues = ['top', 'middle', 'bottom'] as const

export type VerticalAlignValue = (typeof verticalAlignValues)[number]

export function isVerticalAlignValue(value: string): value is VerticalAlignValue {
  return verticalAlignValues.includes(value as VerticalAlignValue)
}

export function normalizeTextStyleAttrs(
  attrs: Partial<TextStyleAttrs>,
): TextStyleAttrs {
  const nextAttrs = Object.fromEntries(
    textStyleAttrKeys.flatMap((key) => {
      const value = attrs[key]

      if (typeof value !== 'string' || value.length === 0) {
        return []
      }

      if (key === 'verticalAlign' && !isVerticalAlignValue(value)) {
        return []
      }

      return [[key, value]]
    }),
  )

  return nextAttrs as TextStyleAttrs
}

export function createTextStyleDeclaration(attrs: TextStyleAttrs) {
  const entries = [
    attrs.color ? `color:${attrs.color}` : null,
    attrs.backgroundColor ? `background-color:${attrs.backgroundColor}` : null,
    attrs.fontSize ? `font-size:${attrs.fontSize}` : null,
    attrs.fontFamily ? `font-family:${attrs.fontFamily}` : null,
    attrs.lineHeight ? `line-height:${attrs.lineHeight}` : null,
    attrs.verticalAlign ? `vertical-align:${attrs.verticalAlign}` : null,
  ]

  return entries.filter(Boolean).join(';')
}

export function getActiveTextStyleAttrs(state: import('prosekit/pm/state').EditorState): TextStyleAttrs {
  return getActiveMarkAttrs<TextStyleAttrs>(state, 'textStyle')
}

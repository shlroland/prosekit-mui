import type { TextStyleAttrKey, TextStyleAttrs } from './types'
import { getActiveMarkAttrs } from '../shared/mark-attrs'

export const textStyleAttrKeys: TextStyleAttrKey[] = [
  'color',
  'backgroundColor',
  'fontSize',
  'fontFamily',
  'lineHeight',
]

export function normalizeTextStyleAttrs(
  attrs: Partial<TextStyleAttrs>,
): TextStyleAttrs {
  const nextAttrs = Object.fromEntries(
    textStyleAttrKeys.flatMap((key) => {
      const value = attrs[key]

      if (typeof value !== 'string' || value.length === 0) {
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
  ]

  return entries.filter(Boolean).join(';')
}

export function getActiveTextStyleAttrs(state: import('prosekit/pm/state').EditorState): TextStyleAttrs {
  return getActiveMarkAttrs<TextStyleAttrs>(state, 'textStyle')
}

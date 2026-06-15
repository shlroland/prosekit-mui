import { defineNodeAttr } from 'prosekit/core'

import type { TableCellVerticalAlign } from './types'

function normalizeVerticalAlign(value: string | null | undefined): TableCellVerticalAlign | null {
  if (value === 'top' || value === 'middle' || value === 'bottom') {
    return value
  }

  return null
}

function defineTableCellVerticalAlignAttr(type: 'tableCell' | 'tableHeaderCell') {
  return defineNodeAttr<typeof type, 'verticalAlign', TableCellVerticalAlign | null>({
    type,
    attr: 'verticalAlign',
    default: null,
    parseDOM: (element) => {
      return normalizeVerticalAlign(
        element.style.verticalAlign || element.getAttribute('data-vertical-align'),
      )
    },
    toDOM: (value) => {
      const align = normalizeVerticalAlign(value)
      return align ? ['style', `vertical-align: ${align};`] : null
    },
  })
}

export function defineTableCellVerticalAlignAttrs() {
  return [
    defineTableCellVerticalAlignAttr('tableCell'),
    defineTableCellVerticalAlignAttr('tableHeaderCell'),
  ] as const
}

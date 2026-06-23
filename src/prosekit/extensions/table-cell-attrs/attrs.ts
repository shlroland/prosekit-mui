import { defineNodeAttr } from 'prosekit/core'

import type { TableCellTextAlign } from './types'

function normalizeTextAlign(value: string | null | undefined): TableCellTextAlign | null {
  if (value === 'left' || value === 'center' || value === 'right' || value === 'justify') {
    return value
  }

  return null
}

function normalizeBackgroundColor(value: string | null | undefined) {
  return typeof value === 'string' && value.trim() ? value : null
}

function defineTableCellBackgroundColorAttr(type: 'tableCell' | 'tableHeaderCell') {
  return defineNodeAttr<typeof type, 'bgcolor', string | null>({
    type,
    attr: 'bgcolor',
    default: null,
    parseDOM: (element) => {
      return normalizeBackgroundColor(
        element.style.backgroundColor || element.getAttribute('data-background-color'),
      )
    },
    toDOM: (value) => {
      const color = normalizeBackgroundColor(value)
      return color ? ['style', `background-color: ${color};`] : null
    },
  })
}

function defineTableCellTextAlignAttr(type: 'tableCell' | 'tableHeaderCell') {
  return defineNodeAttr<typeof type, 'textAlign', TableCellTextAlign | null>({
    type,
    attr: 'textAlign',
    default: null,
    parseDOM: (element) => {
      return normalizeTextAlign(
        element.style.textAlign || element.getAttribute('data-text-align'),
      )
    },
    toDOM: (value) => {
      const align = normalizeTextAlign(value)
      return align ? ['style', `text-align: ${align};`] : null
    },
  })
}

export function defineTableCellAttrs() {
  return [
    defineTableCellBackgroundColorAttr('tableCell'),
    defineTableCellBackgroundColorAttr('tableHeaderCell'),
    defineTableCellTextAlignAttr('tableCell'),
    defineTableCellTextAlignAttr('tableHeaderCell'),
  ] as const
}

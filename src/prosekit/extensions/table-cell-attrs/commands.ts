import { defineCommands } from 'prosekit/core'

import type { TableCellTextAlign } from './types'

const tableCellNames = new Set(['tableCell', 'tableHeaderCell'])

function normalizeTextAlign(value: unknown): TableCellTextAlign | null {
  if (value === 'left' || value === 'center' || value === 'right' || value === 'justify') {
    return value
  }

  return null
}

function normalizeBackgroundColor(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function getCurrentCellPos(state: any): number | null {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if (tableCellNames.has($from.node(depth).type.name)) {
      return $from.before(depth)
    }
  }

  return null
}

function getSelectedCellPositions(state: any): number[] {
  const positions = new Set<number>()
  const { from, to } = state.selection

  state.doc.nodesBetween(from, to, (node: any, pos: number) => {
    if (tableCellNames.has(node.type.name)) {
      positions.add(pos)
      return false
    }

    return true
  })

  if (!positions.size) {
    const currentCellPos = getCurrentCellPos(state)
    if (currentCellPos !== null) {
      positions.add(currentCellPos)
    }
  }

  return Array.from(positions)
}

export function defineTableCellAttrsCommands() {
  return defineCommands({
    setTableCellTextAlign: (textAlign: TableCellTextAlign | null) => {
      return (state, dispatch) => {
        const positions = getSelectedCellPositions(state)

        if (!positions.length) {
          return false
        }

        if (dispatch) {
          const tr = state.tr
          const value = normalizeTextAlign(textAlign)

          for (const pos of positions) {
            tr.setNodeAttribute(pos, 'textAlign', value)
          }

          dispatch(tr.scrollIntoView())
        }

        return true
      }
    },
    setTableCellBackgroundColor: (bgcolor: string | null) => {
      return (state, dispatch) => {
        const positions = getSelectedCellPositions(state)

        if (!positions.length) {
          return false
        }

        if (dispatch) {
          const tr = state.tr
          const value = normalizeBackgroundColor(bgcolor)

          for (const pos of positions) {
            tr.setNodeAttribute(pos, 'bgcolor', value)
          }

          dispatch(tr.scrollIntoView())
        }

        return true
      }
    },
  })
}

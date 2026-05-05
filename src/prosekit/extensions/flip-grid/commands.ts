import { defineCommands } from 'prosekit/core'
import { TextSelection } from 'prosekit/pm/state'

import { MAX_COLUMNS, type FlipGridCommandsExtension } from './types'

function normalizeWidths(widths: number[]) {
  const total = widths.reduce((sum, current) => sum + current, 0) || 1
  return widths.map((width) => (width / total) * 100)
}

export function defineFlipGridCommands(): FlipGridCommandsExtension {
  return defineCommands({
    setFlipGrid: (columns = 2) => {
      return (state, dispatch) => {
        const columnCount = Math.max(2, Math.min(MAX_COLUMNS, Math.floor(columns)))
        const widths = normalizeWidths(new Array(columnCount).fill(1))
        const { schema } = state
        const gridType = schema.nodes.flipGrid
        const columnType = schema.nodes.flipGridColumn
        const paragraphType = schema.nodes.paragraph

        if (!gridType || !columnType || !paragraphType) {
          return false
        }

        const gridNode = gridType.create(
          {},
          widths.map((width) =>
            columnType.create(
              { width },
              paragraphType.createAndFill(),
            ),
          ),
        )

        let tr = state.tr.replaceSelectionWith(gridNode, false)
        const { $from } = tr.selection

        const after = $from.nodeAfter
        const before = $from.nodeBefore

        let gridStart: number | null = null

        if (after?.type === gridType) {
          gridStart = $from.pos
        } else if (before?.type === gridType) {
          gridStart = $from.pos - before.nodeSize
        } else {
          const $prev = tr.doc.resolve(Math.max(0, $from.pos - 1))

          if ($prev.nodeAfter?.type === gridType) {
            gridStart = $prev.pos
          } else if ($prev.nodeBefore?.type === gridType) {
            gridStart = $prev.pos - ($prev.nodeBefore.nodeSize || 0)
          }
        }

        if (gridStart !== null) {
          const textPos = Math.min(tr.doc.content.size, gridStart + 3)
          tr = tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
        }

        dispatch?.(tr.scrollIntoView())
        return true
      }
    },
  }) as FlipGridCommandsExtension
}

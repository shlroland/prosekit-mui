import { addMark, defineCommands, removeMark, toggleMark } from 'prosekit/core'
import type { Command } from 'prosekit/pm/state'

import type { TooltipCommandsExtension } from './types'
import { createTooltipId, findTooltipRange } from './utils'

export function defineTooltipCommands(): TooltipCommandsExtension {
  return defineCommands({
    addTooltip: ({ id, text }) =>
      addMark({
        type: 'tooltip',
        attrs: { id, text, tooltip: text },
      }),
    updateTooltip: ({ id, text }) => {
      return ((state, dispatch) => {
        const markType = state.schema.marks.tooltip
        const range = markType ? findTooltipRange(state.doc, id) : null
        if (!markType || !range) {
          return false
        }

        if (dispatch) {
          const tr = state.tr
          tr.removeMark(range.from, range.to, markType)
          tr.addMark(range.from, range.to, markType.create({ id, text, tooltip: text }))
          dispatch(tr)
        }
        return true
      }) as Command
    },
    removeTooltip: (id) => {
      return ((state, dispatch) => {
        const markType = state.schema.marks.tooltip
        const range = markType ? findTooltipRange(state.doc, id) : null
        if (!markType || !range) {
          return false
        }

        if (dispatch) {
          dispatch(state.tr.removeMark(range.from, range.to, markType))
        }
        return true
      }) as Command
    },
    setTooltip: (tooltip: string) =>
      addMark({
        type: 'tooltip',
        attrs: { id: createTooltipId(), text: tooltip, tooltip },
      }),
    toggleTooltip: (tooltip?: string) =>
      toggleMark({
        type: 'tooltip',
        attrs: {
          id: createTooltipId(),
          text: tooltip ?? '',
          tooltip: tooltip ?? '',
        },
      }),
    unsetTooltip: () =>
      removeMark({
        type: 'tooltip',
      }),
  }) as TooltipCommandsExtension
}

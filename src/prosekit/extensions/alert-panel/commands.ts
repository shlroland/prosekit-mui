import { defineCommands } from 'prosekit/core'
import { TextSelection, type Transaction } from 'prosekit/pm/state'

import type {
  AlertBoxKind,
  AlertPanelCommandsExtension,
  CollapsiblePanelAttrs,
} from './types'

function focusInsertedBlock(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 2)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

export function defineAlertPanelCommands(): AlertPanelCommandsExtension {
  return defineCommands({
    insertAlertBox: (kind: AlertBoxKind = 'info') => {
      return (state, dispatch) => {
        const alertType = state.schema.nodes.alertBox
        const paragraphType = state.schema.nodes.paragraph

        if (!alertType || !paragraphType) {
          return false
        }

        const alertNode = alertType.create(
          { variant: kind },
          paragraphType.createAndFill(),
        )
        let tr = state.tr.replaceSelectionWith(alertNode, false)
        const startPos = tr.selection.$from.pos - alertNode.nodeSize

        tr = focusInsertedBlock(tr, Math.max(0, startPos))
        dispatch?.(tr.scrollIntoView())
        return true
      }
    },
    insertCollapsiblePanel: (title = '折叠面板') => {
      return (state, dispatch) => {
        const panelType = state.schema.nodes.collapsiblePanel
        const paragraphType = state.schema.nodes.paragraph

        if (!panelType || !paragraphType) {
          return false
        }

        const attrs: CollapsiblePanelAttrs = {
          open: true,
          title,
        }
        const panelNode = panelType.create(
          attrs,
          paragraphType.createAndFill(),
        )
        let tr = state.tr.replaceSelectionWith(panelNode, false)
        const startPos = tr.selection.$from.pos - panelNode.nodeSize

        tr = focusInsertedBlock(tr, Math.max(0, startPos))
        dispatch?.(tr.scrollIntoView())
        return true
      }
    },
  }) as AlertPanelCommandsExtension
}

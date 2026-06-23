import { defineCommands } from 'prosekit/core'
import { wrapIn } from 'prosekit/pm/commands'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import type { Command, EditorState } from 'prosekit/pm/state'
import { liftTarget } from 'prosekit/pm/transform'

import type {
  AlertAttrs,
  AlertCommandsExtension,
  AlertType,
  AlertVariant,
} from './types'

function normalizeAlertVariant(value: unknown): AlertVariant {
  return value === 'info' || value === 'success' || value === 'warning' || value === 'error'
    ? value
    : 'default'
}

function normalizeAlertType(value: unknown): AlertType {
  return value === 'text' ? 'text' : 'icon'
}

function createAlertId() {
  return `alert_${Math.random().toString(36).slice(2, 12)}`
}

function normalizeAlertAttrs(attrs: Partial<AlertAttrs> = {}): AlertAttrs {
  return {
    id: typeof attrs.id === 'string' && attrs.id ? attrs.id : createAlertId(),
    variant: normalizeAlertVariant(attrs.variant),
    type: normalizeAlertType(attrs.type),
  }
}

function findAncestorNode(state: EditorState, predicate: (node: ProseMirrorNode) => boolean) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (predicate(node)) {
      return {
        node,
        pos: $from.before(depth),
        depth,
      }
    }
  }

  return null
}

function getActiveAlert(state: EditorState) {
  return findAncestorNode(state, (node) => node.type.name === 'alert')
}

function updateAlertAttrs(nextAttrs: Partial<AlertAttrs>): Command {
  return (state, dispatch) => {
    const activeAlert = getActiveAlert(state)
    if (!activeAlert) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.setNodeMarkup(activeAlert.pos, undefined, {
      ...activeAlert.node.attrs,
      ...nextAttrs,
    })
    dispatch(tr.scrollIntoView())
    return true
  }
}

function liftAlert(): Command {
  return (state, dispatch) => {
    const activeAlert = getActiveAlert(state)
    if (!activeAlert) {
      return false
    }

    const $from = state.doc.resolve(activeAlert.pos + 1)
    const $to = state.doc.resolve(activeAlert.pos + activeAlert.node.nodeSize - 1)
    const range = $from.blockRange($to)

    if (!range) {
      return false
    }

    const target = liftTarget(range)
    if (target == null) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.lift(range, target).scrollIntoView()
    dispatch(tr)
    return true
  }
}

export function defineAlertCommands(): AlertCommandsExtension {
  return defineCommands({
    setAlert: (attrs?: Partial<AlertAttrs>) => {
      return (state, dispatch) => {
        const activeAlert = getActiveAlert(state)
        if (activeAlert) {
          return updateAlertAttrs(normalizeAlertAttrs({
            ...activeAlert.node.attrs,
            ...attrs,
            id: activeAlert.node.attrs.id,
          }))(state, dispatch)
        }

        const alertType = state.schema.nodes.alert
        if (!alertType) {
          return false
        }

        return wrapIn(alertType, normalizeAlertAttrs(attrs))(state, dispatch)
      }
    },
    setAlertVariant: (variant: AlertVariant) => {
      return updateAlertAttrs({ variant: normalizeAlertVariant(variant) })
    },
    setAlertType: (type: AlertType) => {
      return updateAlertAttrs({ type: normalizeAlertType(type) })
    },
    toggleAlert: (attrs?: Partial<AlertAttrs>) => {
      return (state, dispatch) => {
        if (getActiveAlert(state)) {
          return liftAlert()(state, dispatch)
        }

        const alertType = state.schema.nodes.alert
        if (!alertType) {
          return false
        }

        return wrapIn(alertType, normalizeAlertAttrs(attrs))(state, dispatch)
      }
    },
    insertAlertBox: (variant: AlertVariant = 'info') => {
      return (state, dispatch) => {
        const alertType = state.schema.nodes.alert
        if (!alertType) {
          return false
        }

        return wrapIn(alertType, normalizeAlertAttrs({ variant, type: 'icon' }))(state, dispatch)
      }
    },
  }) as AlertCommandsExtension
}

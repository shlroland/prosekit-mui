import { defineCommands } from 'prosekit/core'
import { wrapIn } from 'prosekit/pm/commands'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { TextSelection, type Command, type EditorState, type Transaction } from 'prosekit/pm/state'
import { liftTarget } from 'prosekit/pm/transform'

import type {
  AlertAttrs,
  AlertPanelCommandsExtension,
  AlertType,
  AlertVariant,
} from './types'

function focusInsertedBlock(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 2)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

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

function getActiveDetails(state: EditorState) {
  return findAncestorNode(state, (node) => node.type.name === 'details')
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

function createDetailsNode(
  state: EditorState,
  title = '',
  content?: readonly ProseMirrorNode[],
) {
  const detailsType = state.schema.nodes.details
  const summaryType = state.schema.nodes.detailsSummary
  const contentType = state.schema.nodes.detailsContent
  const paragraphType = state.schema.nodes.paragraph

  if (!detailsType || !summaryType || !contentType || !paragraphType) {
    return null
  }

  const summaryText = title.trim() ? state.schema.text(title) : null
  const summaryNode = summaryType.create(
    null,
    summaryText ?? undefined,
  )
  const contentNodes = content?.length
    ? content
    : [paragraphType.createAndFill()].filter((node): node is ProseMirrorNode => Boolean(node))
  const contentNode = contentType.create(
    null,
    contentNodes.length ? contentNodes : undefined,
  )

  return detailsType.create({ open: true }, [summaryNode, contentNode])
}

export function insertCollapsiblePanel(title = ''): Command {
  return (state, dispatch) => {
    const detailsNode = createDetailsNode(state, title)
    if (!detailsNode) {
      return false
    }

    let tr = state.tr.replaceSelectionWith(detailsNode, false)
    const startPos = tr.selection.$from.pos - detailsNode.nodeSize
    tr = focusInsertedBlock(tr, Math.max(0, startPos))
    dispatch?.(tr.scrollIntoView())
    return true
  }
}

export function setDetails(title = ''): Command {
  return (state, dispatch) => {
    const contentType = state.schema.nodes.detailsContent

    if (!contentType) {
      return false
    }

    const { $from, $to } = state.selection
    const range = $from.blockRange($to)
    if (!range) {
      return false
    }

    const slice = state.doc.slice(range.start, range.end)
    const match = contentType.contentMatch.matchFragment(slice.content)
    if (!match) {
      return false
    }

    const contentNodes: ProseMirrorNode[] = []
    slice.content.forEach((child) => {
      contentNodes.push(child)
    })

    const detailsNode = createDetailsNode(state, title, contentNodes)
    if (!detailsNode) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.replaceWith(range.start, range.end, detailsNode)
    tr.setSelection(TextSelection.create(tr.doc, range.start + 2))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function unsetDetails(): Command {
  return (state, dispatch) => {
    const activeDetails = getActiveDetails(state)
    if (!activeDetails) {
      return false
    }

    if (activeDetails.node.childCount < 2) {
      return false
    }

    const detailsSummary = activeDetails.node.child(0)
    const detailsContent = activeDetails.node.child(1)
    const $detailsPos = state.doc.resolve(activeDetails.pos)
    const defaultTypeForSummary = $detailsPos.parent.type.contentMatch.defaultType
    const paragraphType = state.schema.nodes.paragraph
    const summaryType = defaultTypeForSummary ?? paragraphType

    if (!summaryType) {
      return false
    }

    const contentNodes: ProseMirrorNode[] = [
      summaryType.create(null, detailsSummary.content),
    ]
    detailsContent.content.forEach((child) => {
      contentNodes.push(child)
    })

    if (!dispatch) {
      return true
    }

    const tr = state.tr.replaceWith(
      activeDetails.pos,
      activeDetails.pos + activeDetails.node.nodeSize,
      contentNodes,
    )
    tr.setSelection(TextSelection.near(tr.doc.resolve(activeDetails.pos + 1)))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineAlertPanelCommands(): AlertPanelCommandsExtension {
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
    setDetails: (title = '') => {
      return setDetails(title)
    },
    unsetDetails: () => {
      return unsetDetails()
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
    insertCollapsiblePanel: (title = '') => {
      return insertCollapsiblePanel(title)
    },
  }) as AlertPanelCommandsExtension
}

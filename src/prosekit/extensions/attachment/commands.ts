import { defineCommands } from 'prosekit/core'
import type { Command } from 'prosekit/pm/state'
import { NodeSelection } from 'prosekit/pm/state'

import type { AttachmentAttrs, AttachmentCommandsExtension } from './types'

function normalizeInlineAttrs(attrs: Partial<AttachmentAttrs> = {}): AttachmentAttrs {
  return {
    url: attrs.url || '',
    title: attrs.title || '',
    size: attrs.size || '0',
    type: 'icon',
  }
}

function normalizeBlockAttrs(attrs: Partial<AttachmentAttrs> = {}): AttachmentAttrs {
  return {
    url: attrs.url || '',
    title: attrs.title || '',
    size: attrs.size || '0',
    type: 'block',
    view: attrs.view === '1' ? '1' : '0',
    height: typeof attrs.height === 'number' ? attrs.height : 300,
  }
}

export function insertAttachmentNode(type: 'inlineAttachment' | 'blockAttachment', attrs: AttachmentAttrs): Command {
  return (state, dispatch) => {
    const nodeType = state.schema.nodes[type]
    if (!nodeType) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const node = nodeType.create(attrs)
    const tr = state.tr.replaceSelectionWith(node, false)
    const pos = type === 'inlineAttachment'
      ? Math.max(0, tr.selection.from - node.nodeSize)
      : Math.max(0, tr.selection.from - 1)
    tr.setSelection(NodeSelection.create(tr.doc, pos))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineAttachmentCommands(): AttachmentCommandsExtension {
  return defineCommands({
    setInlineAttachment: (attrs?: Partial<AttachmentAttrs>) => {
      return insertAttachmentNode('inlineAttachment', normalizeInlineAttrs(attrs))
    },
    setBlockAttachment: (attrs?: Partial<AttachmentAttrs>) => {
      return insertAttachmentNode('blockAttachment', normalizeBlockAttrs(attrs))
    },
    insertAttachment: (attrs?: Partial<AttachmentAttrs>) => {
      return insertAttachmentNode('inlineAttachment', normalizeInlineAttrs(attrs))
    },
  }) as AttachmentCommandsExtension
}

import { defineCommands, insertNode } from 'prosekit/core'
import { NodeSelection } from 'prosekit/pm/state'
import type { Command } from 'prosekit/pm/state'

import type { ImageAttrs, ImageCommandsExtension } from './types'

function setImage(attrs: ImageAttrs = {}): Command {
  return insertNode({
    type: 'image',
    attrs: {
      src: attrs.src ?? '',
      width: attrs.width ?? 760,
      height: attrs.height ?? null,
      title: attrs.title ?? null,
      align: attrs.align ?? null,
    },
  })
}

function updateImage(attrs: Partial<ImageAttrs>): Command {
  return (state, dispatch) => {
    const { selection } = state
    const selectedNode = selection instanceof NodeSelection ? selection.node : null

    if (!selectedNode || selectedNode.type.name !== 'image') {
      return false
    }

    if (!dispatch) {
      return true
    }

    dispatch(state.tr.setNodeMarkup(selection.from, undefined, {
      ...selectedNode.attrs,
      ...attrs,
    }).scrollIntoView())
    return true
  }
}

function removeImage(): Command {
  return (state, dispatch) => {
    const { selection } = state
    const selectedNode = selection instanceof NodeSelection ? selection.node : null

    if (!selectedNode || selectedNode.type.name !== 'image') {
      return false
    }

    if (!dispatch) {
      return true
    }

    dispatch(state.tr.delete(selection.from, selection.to).scrollIntoView())
    return true
  }
}

export function defineImageCommands(): ImageCommandsExtension {
  return defineCommands({
    setImage,
    updateImage,
    removeImage,
  }) as ImageCommandsExtension
}

import { definePlugin } from 'prosekit/core'
import type { NodeType, ProseMirrorNode, Schema } from 'prosekit/pm/model'
import { PluginKey, ProseMirrorPlugin } from 'prosekit/pm/state'

import type { TrailingNodeExtension, TrailingNodeOptions } from './types'

const trailingNodePluginKey = new PluginKey('prosekit-trailing-node')

const defaultTrailingNodeOptions: Required<Omit<TrailingNodeOptions, 'node'>> = {
  notAfter: ['paragraph'],
}

function getTrailingNodeType(schema: Schema, node?: string): NodeType | null {
  if (node) {
    return schema.nodes[node] ?? null
  }

  return schema.topNodeType.contentMatch.defaultType ?? null
}

function shouldInsertTrailingNode(
  doc: ProseMirrorNode,
  trailingNodeType: NodeType | null,
  notAfter: Set<string>,
): boolean {
  if (!trailingNodeType) {
    return false
  }

  const lastNode = doc.lastChild

  if (!lastNode) {
    return false
  }

  return !notAfter.has(lastNode.type.name)
}

function createTrailingNodePlugin(options: TrailingNodeOptions) {
  return ({ schema }: { schema: Schema }) => {
    const trailingNodeType = getTrailingNodeType(schema, options.node)
    const notAfter = new Set([
      ...defaultTrailingNodeOptions.notAfter,
      ...(options.notAfter ?? []),
    ])

    if (trailingNodeType) {
      notAfter.add(trailingNodeType.name)
    }

    function createTrailingNode(stateDoc: ProseMirrorNode) {
      if (!shouldInsertTrailingNode(stateDoc, trailingNodeType, notAfter)) {
        return null
      }

      return trailingNodeType?.createAndFill() ?? null
    }

    return new ProseMirrorPlugin({
      key: trailingNodePluginKey,
      view: (view) => {
        const trailingNode = createTrailingNode(view.state.doc)

        if (trailingNode) {
          view.dispatch(
            view.state.tr.insert(view.state.doc.content.size, trailingNode),
          )
        }

        return {}
      },
      appendTransaction: (transactions, _oldState, newState) => {
        if (!transactions.some((transaction) => transaction.docChanged)) {
          return null
        }

        const trailingNode = createTrailingNode(newState.doc)

        if (!trailingNode) {
          return null
        }

        return newState.tr.insert(newState.doc.content.size, trailingNode)
      },
    })
  }
}

export function defineTrailingNode(
  options: TrailingNodeOptions = {},
): TrailingNodeExtension {
  return definePlugin(createTrailingNodePlugin(options))
}

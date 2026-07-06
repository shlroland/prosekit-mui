import {
  defineCommands,
  nodeFromJSON,
  type Extension,
  type NodeJSON,
} from 'prosekit/core'
import { Fragment, type ProseMirrorNode, type Schema } from 'prosekit/pm/model'
import { Selection, type Command } from 'prosekit/pm/state'

export type InsertContentValue = string | NodeJSON | NodeJSON[]

export type InsertContentRange = {
  pos?: number
  from?: number
  to?: number
}

export type InsertContentOptions = InsertContentRange & {
  content: InsertContentValue
}

export type InsertContentCommands = {
  insertContent: [
    contentOrOptions: InsertContentValue | InsertContentOptions,
    range?: InsertContentRange,
  ]
}

export type InsertContentCommandsExtension = Extension<{
  Commands: InsertContentCommands
}>

function hasContent(value: unknown): value is InsertContentOptions {
  return typeof value === 'object'
    && value !== null
    && 'content' in value
    && !('type' in value)
}

function normalizeOptions(
  contentOrOptions: InsertContentValue | InsertContentOptions,
  range: InsertContentRange = {},
): InsertContentOptions {
  if (hasContent(contentOrOptions)) {
    return contentOrOptions
  }

  return {
    ...range,
    content: contentOrOptions,
  }
}

function getReplaceRange(
  options: InsertContentOptions,
  selection: Selection,
): { from: number; to: number } {
  if (typeof options.pos === 'number') {
    return { from: options.pos, to: options.pos }
  }

  if (typeof options.from === 'number' && typeof options.to === 'number') {
    return { from: options.from, to: options.to }
  }

  return { from: selection.from, to: selection.to }
}

function fragmentFromNode(node: ProseMirrorNode): Fragment {
  return node.type === node.type.schema.topNodeType
    ? node.content
    : Fragment.from(node)
}

function parseContent(content: NodeJSON | NodeJSON[], schema: Schema): Fragment {
  if (Array.isArray(content)) {
    return content
      .map((nodeJson) => fragmentFromNode(nodeFromJSON(nodeJson, { schema })))
      .reduce((fragment, next) => fragment.append(next), Fragment.empty)
  }

  return fragmentFromNode(nodeFromJSON(content, { schema }))
}

export function insertContent(
  contentOrOptions: InsertContentValue | InsertContentOptions,
  range?: InsertContentRange,
): Command {
  return (state, dispatch) => {
    const options = normalizeOptions(contentOrOptions, range)
    const { from, to } = getReplaceRange(options, state.selection)

    try {
      if (typeof options.content === 'string') {
        if (dispatch) {
          dispatch(state.tr.insertText(options.content, from, to).scrollIntoView())
        }
        return true
      }

      const content = parseContent(options.content, state.schema)

      if (dispatch) {
        const tr = state.tr.replaceWith(from, to, content)
        const selectionPos = Math.min(from + content.size, tr.doc.content.size)
        tr.setSelection(Selection.near(tr.doc.resolve(selectionPos)))
        dispatch(tr.scrollIntoView())
      }

      return true
    } catch {
      return false
    }
  }
}

export function defineInsertContentCommands(): InsertContentCommandsExtension {
  return defineCommands({
    insertContent,
  }) as InsertContentCommandsExtension
}

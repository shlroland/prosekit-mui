import { defineCommands } from 'prosekit/core'
import type { Node as ProseMirrorNode, NodeType } from 'prosekit/pm/model'
import { TextSelection, type Command, type EditorState, type Transaction } from 'prosekit/pm/state'

import type { MermaidCommandsExtension } from './types'

export const defaultMermaidTemplate = [
  'graph TD',
  '  Start([Start]) --> Draft[Write proposal]',
  '  Draft --> Review{Review?}',
  '  Review -->|Revise| Draft',
  '  Review -->|Approve| Ship[Ship release]',
].join('\n')

function createMermaidCodeBlockNode(codeBlockType: NodeType, textNode: ProseMirrorNode) {
  return codeBlockType.create(
    { language: 'mermaid' },
    textNode,
  )
}

function getSelectedMermaidSource(state: EditorState, fallbackSource: string) {
  const { selection } = state
  const selectedText = state.doc.textBetween(selection.from, selection.to, '\n\n').trim()

  if (selectedText) {
    return selectedText
  }

  const range = selection.$from.blockRange(selection.$to)
  if (!range) {
    return fallbackSource
  }

  const blockText = state.doc.textBetween(range.start, range.end, '\n\n').trim()
  return blockText || fallbackSource
}

function resolveInsertedCodeBlockStart(tr: Transaction, codeBlockType: NodeType) {
  const { $from } = tr.selection
  const after = $from.nodeAfter
  const before = $from.nodeBefore

  if (after?.type === codeBlockType) {
    return $from.pos
  }

  if (before?.type === codeBlockType) {
    return $from.pos - before.nodeSize
  }

  const $prev = tr.doc.resolve(Math.max(0, $from.pos - 1))

  if ($prev.nodeAfter?.type === codeBlockType) {
    return $prev.pos
  }

  if ($prev.nodeBefore?.type === codeBlockType) {
    return $prev.pos - ($prev.nodeBefore.nodeSize || 0)
  }

  return null
}

function focusInsertedCodeBlock(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 2)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

export function insertMermaidCodeBlock(source = defaultMermaidTemplate): Command {
  return (state, dispatch) => {
    const codeBlockType = state.schema.nodes.codeBlock

    if (!codeBlockType) {
      return false
    }

    const textNode = state.schema.text(source)
    const codeBlockNode = createMermaidCodeBlockNode(codeBlockType, textNode)
    let tr = state.tr.replaceSelectionWith(codeBlockNode, false)
    const codeBlockStart = resolveInsertedCodeBlockStart(tr, codeBlockType)

    if (codeBlockStart !== null) {
      tr = focusInsertedCodeBlock(tr, codeBlockStart)
    }

    dispatch?.(tr.scrollIntoView())
    return true
  }
}

export function setMermaidCodeBlock(source?: string, fallbackSource = defaultMermaidTemplate): Command {
  return (state, dispatch) => {
    const codeBlockType = state.schema.nodes.codeBlock

    if (!codeBlockType) {
      return false
    }

    const { selection } = state

    if (selection.$from.parent.type === codeBlockType) {
      if (!dispatch) {
        return true
      }

      const blockSource = source?.trim() ? source : selection.$from.parent.textContent || fallbackSource
      const codeBlockNode = createMermaidCodeBlockNode(codeBlockType, state.schema.text(blockSource))
      const startPos = selection.$from.before()
      const endPos = startPos + selection.$from.parent.nodeSize
      const tr = focusInsertedCodeBlock(
        state.tr.replaceWith(startPos, endPos, codeBlockNode),
        startPos,
      )

      dispatch(tr.scrollIntoView())
      return true
    }

    const range = selection.$from.blockRange(selection.$to)
    if (!range || !range.parent.canReplaceWith(range.startIndex, range.endIndex, codeBlockType)) {
      return false
    }

    const blockSource = source?.trim() ? source : getSelectedMermaidSource(state, fallbackSource)
    const codeBlockNode = createMermaidCodeBlockNode(codeBlockType, state.schema.text(blockSource))

    if (!dispatch) {
      return true
    }

    const tr = focusInsertedCodeBlock(
      state.tr.replaceWith(range.start, range.end, codeBlockNode),
      range.start,
    )
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function defineMermaidCommands(defaultSource = defaultMermaidTemplate): MermaidCommandsExtension {
  return defineCommands({
    insertMermaidCodeBlock: (source) => {
      return insertMermaidCodeBlock(source ?? defaultSource)
    },
    setMermaidCodeBlock: (source) => {
      return setMermaidCodeBlock(source, defaultSource)
    },
  }) as MermaidCommandsExtension
}

import { defineCommands } from 'prosekit/core'
import type { Node as ProseMirrorNode, NodeType } from 'prosekit/pm/model'
import { TextSelection, type Command, type EditorState, type Transaction } from 'prosekit/pm/state'

import type { MathCommandsExtension } from './types'

export const defaultInlineMathTemplate = 'E = mc^2'
export const defaultBlockMathTemplate = String.raw`\int_0^1 x^2 \, dx`

type ActiveMathNode = {
  node: ProseMirrorNode
  pos: number
}

function focusMathNode(tr: Transaction, startPos: number) {
  const textPos = Math.min(tr.doc.content.size, startPos + 1)
  return tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
}

function findAncestorMathNode(state: EditorState, typeName: 'mathInline' | 'mathBlock'): ActiveMathNode | null {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name !== typeName) {
      continue
    }

    return {
      node,
      pos: $from.before(depth),
    }
  }

  return null
}

function getSelectionText(state: EditorState) {
  return state.doc.textBetween(state.selection.from, state.selection.to, '\n').trim()
}

function createMathNode(
  state: EditorState,
  type: NodeType,
  latex: string,
  attrs?: Record<string, unknown>,
) {
  return type.create(
    attrs ?? null,
    latex ? state.schema.text(latex) : undefined,
  )
}

function resolveInsertedNodeStart(tr: Transaction, nodeType: NodeType) {
  const { $from } = tr.selection
  const after = $from.nodeAfter
  const before = $from.nodeBefore

  if (after?.type === nodeType) {
    return $from.pos
  }

  if (before?.type === nodeType) {
    return $from.pos - before.nodeSize
  }

  const $prev = tr.doc.resolve(Math.max(0, $from.pos - 1))

  if ($prev.nodeAfter?.type === nodeType) {
    return $prev.pos
  }

  if ($prev.nodeBefore?.type === nodeType) {
    return $prev.pos - ($prev.nodeBefore.nodeSize || 0)
  }

  return null
}

function findInsertAfterTextblockPos(state: EditorState) {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).isTextblock) {
      return $from.after(depth)
    }
  }

  return $from.pos
}

function insertMathNode(
  typeName: 'mathInline' | 'mathBlock',
  latex: string,
  attrs?: Record<string, unknown>,
): Command {
  return (state, dispatch) => {
    const nodeType = state.schema.nodes[typeName]
    if (!nodeType) {
      return false
    }

    const node = createMathNode(state, nodeType, latex, attrs)
    let tr = state.tr.replaceSelectionWith(node, false)
    const startPos = resolveInsertedNodeStart(tr, nodeType)

    if (startPos !== null) {
      tr = focusMathNode(tr, startPos)
    }

    dispatch?.(tr.scrollIntoView())
    return true
  }
}

function updateActiveMathNode(
  typeName: 'mathInline' | 'mathBlock',
  latex: string,
): Command {
  return (state, dispatch) => {
    const active = findAncestorMathNode(state, typeName)
    if (!active) {
      return false
    }

    const nodeType = state.schema.nodes[typeName]
    if (!nodeType) {
      return false
    }

    const nextNode = createMathNode(state, nodeType, latex, active.node.attrs)

    if (!dispatch) {
      return true
    }

    const tr = focusMathNode(
      state.tr.replaceWith(active.pos, active.pos + active.node.nodeSize, nextNode),
      active.pos,
    )
    dispatch(tr.scrollIntoView())
    return true
  }
}

function deleteActiveMathNode(typeName: 'mathInline' | 'mathBlock'): Command {
  return (state, dispatch) => {
    const active = findAncestorMathNode(state, typeName)
    if (!active) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr.delete(active.pos, active.pos + active.node.nodeSize)
    tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(active.pos, tr.doc.content.size))))
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function insertMathInline(latex = ''): Command {
  return insertMathNode('mathInline', latex)
}

export function setMathInline(latex?: string): Command {
  return (state, dispatch) => {
    const active = findAncestorMathNode(state, 'mathInline')
    const nextLatex = latex?.trim() || getSelectionText(state) || active?.node.textContent || ''

    if (active) {
      return updateActiveMathNode('mathInline', nextLatex)(state, dispatch)
    }

    return insertMathInline(nextLatex)(state, dispatch)
  }
}

export function updateMathInline(latex: string): Command {
  return updateActiveMathNode('mathInline', latex)
}

export function deleteMathInline(): Command {
  return deleteActiveMathNode('mathInline')
}

export function insertMathBlock(latex = ''): Command {
  return insertMathNode('mathBlock', latex, { language: 'tex' })
}

export function setMathBlock(latex?: string): Command {
  return (state, dispatch) => {
    const active = findAncestorMathNode(state, 'mathBlock')
    const nextLatex = latex?.trim() || getSelectionText(state) || active?.node.textContent || ''

    if (active) {
      return updateActiveMathNode('mathBlock', nextLatex)(state, dispatch)
    }

    const nodeType = state.schema.nodes.mathBlock
    if (!nodeType) {
      return false
    }

    const { $from, $to } = state.selection
    const range = $from.blockRange($to)
    if (!range || !range.parent.canReplaceWith(range.startIndex, range.endIndex, nodeType)) {
      const insertPos = findInsertAfterTextblockPos(state)
      const mathNode = createMathNode(state, nodeType, nextLatex, { language: 'tex' })

      if (!dispatch) {
        return true
      }

      const tr = focusMathNode(
        state.tr.insert(insertPos, mathNode),
        insertPos,
      )
      dispatch(tr.scrollIntoView())
      return true
    }

    const mathNode = createMathNode(state, nodeType, nextLatex, { language: 'tex' })

    if (!dispatch) {
      return true
    }

    const tr = focusMathNode(
      state.tr.replaceWith(range.start, range.end, mathNode),
      range.start,
    )
    dispatch(tr.scrollIntoView())
    return true
  }
}

export function updateMathBlock(latex: string): Command {
  return updateActiveMathNode('mathBlock', latex)
}

export function deleteMathBlock(): Command {
  return deleteActiveMathNode('mathBlock')
}

export function defineMathCommands(options?: {
  inlineTemplate?: string
  blockTemplate?: string
}): MathCommandsExtension {
  const inlineTemplate = options?.inlineTemplate ?? defaultInlineMathTemplate
  const blockTemplate = options?.blockTemplate ?? defaultBlockMathTemplate

  return defineCommands({
    insertMathInline: (latex) => {
      return insertMathInline(latex ?? inlineTemplate)
    },
    setMathInline: (latex) => {
      return setMathInline(latex)
    },
    updateMathInline: (latex) => {
      return updateMathInline(latex)
    },
    deleteMathInline: () => {
      return deleteMathInline()
    },
    insertMathBlock: (latex) => {
      return insertMathBlock(latex ?? blockTemplate)
    },
    setMathBlock: (latex) => {
      return setMathBlock(latex)
    },
    updateMathBlock: (latex) => {
      return updateMathBlock(latex)
    },
    deleteMathBlock: () => {
      return deleteMathBlock()
    },
  }) as MathCommandsExtension
}

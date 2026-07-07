import type { NodeJSON } from 'prosekit/core'

import {
  getDeletedNodePreviewText,
  type DiffItem,
} from '../../extensions/diff'
import {
  editorDiff,
  type EditorDiffInput,
  type EditorDiffOptions,
  type EditorDiffResult,
} from './editor-diff'
import type { StaticDiffKind } from './diff-extension'

type MarkJSON = {
  type: string
  attrs?: Record<string, unknown>
}

type DiffIndex = {
  byPath: Map<string, DiffItem[]>
}

type TransformContext = {
  index: DiffIndex
  options: EditorDiffOptions
}

const inlineContainerTypes = new Set(['paragraph', 'heading', 'detailsSummary'])

const inlineNodeTypes = new Set([
  'text',
  'hardBreak',
  'emoji',
  'inlineAttachment',
  'inlineLink',
  'mathInline',
  'diffInline',
  'diffDeleteInline',
])

const blockWrapperParentTypes = new Set([
  'doc',
  'blockquote',
  'listItem',
  'taskItem',
  'tableCell',
  'tableHeader',
  'detailsContent',
  'alert',
  'flipGridColumn',
  'diffBlock',
])

function pathKey(path: number[]): string {
  return path.join('.')
}

function createDiffIndex(diffs: DiffItem[]): DiffIndex {
  const byPath = new Map<string, DiffItem[]>()

  for (const diff of diffs) {
    const key = pathKey(diff.path)
    byPath.set(key, [...(byPath.get(key) || []), diff])
  }

  return { byPath }
}

function getDiffsAt(index: DiffIndex, path: number[]): DiffItem[] {
  return index.byPath.get(pathKey(path)) || []
}

function isInlineLikeNode(node: NodeJSON): boolean {
  if (inlineNodeTypes.has(node.type)) {
    return true
  }

  return node.type.startsWith('inline')
}

function isInlineContainer(node: NodeJSON): boolean {
  if (inlineContainerTypes.has(node.type)) {
    return true
  }

  const content = node.content || []
  return content.length > 0 && content.every(isInlineLikeNode)
}

function isInlineParent(parentType: string | null): boolean {
  return parentType === 'paragraph' || parentType === 'heading' || parentType === 'detailsSummary' || parentType === 'diffInline'
}

function canWrapBlock(parentType: string | null): boolean {
  return !!parentType && blockWrapperParentTypes.has(parentType)
}

function addDiffMark(node: NodeJSON, kind: StaticDiffKind): NodeJSON {
  if (node.type !== 'text') {
    return node
  }

  const type = kind === 'modify' ? 'diffModify' : 'diffInsert'
  const marks = ((node.marks || []) as MarkJSON[]).filter((mark) => mark.type !== type)

  return {
    ...node,
    marks: [...marks, { type }],
  }
}

function createDeleteInline(text: string): NodeJSON {
  return {
    type: 'diffDeleteInline',
    attrs: { text },
  }
}

function createDeleteBlock(text: string): NodeJSON {
  return {
    type: 'diffDeleteBlock',
    attrs: { text },
  }
}

function createDeleteFallbackNode(parentType: string | null, text: string): NodeJSON {
  if (parentType === 'bulletList' || parentType === 'orderedList' || parentType === 'taskList') {
    return {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [createDeleteInline(text)],
        },
      ],
    }
  }

  if (parentType === 'tableRow') {
    return {
      type: 'tableCell',
      content: [
        {
          type: 'paragraph',
          content: [createDeleteInline(text)],
        },
      ],
    }
  }

  return createDeleteBlock(text)
}

function wrapInline(node: NodeJSON, kind: StaticDiffKind): NodeJSON {
  return {
    type: 'diffInline',
    attrs: { kind },
    content: [node],
  }
}

function wrapBlock(node: NodeJSON, kind: StaticDiffKind): NodeJSON {
  return {
    type: 'diffBlock',
    attrs: { kind },
    content: [node],
  }
}

function renderDeletedChildrenAt(
  parentPath: number[],
  childIndex: number,
  parentType: string | null,
  context: TransformContext,
): NodeJSON[] {
  return getDiffsAt(context.index, [...parentPath, childIndex])
    .filter((diff) => diff.type === 'delete' && diff.node && !diff.textDiff)
    .map((diff) => {
      const text = diff.node ? getDeletedNodePreviewText(diff.node, context.options) : '[已删除]'

      return isInlineParent(parentType)
        ? createDeleteInline(text)
        : createDeleteFallbackNode(parentType, text)
    })
}

function splitTextWithDiffs(
  node: NodeJSON,
  startOffset: number,
  diffs: DiffItem[],
  forcedKind?: StaticDiffKind,
): NodeJSON[] {
  const text = node.text || ''
  const boundaries = new Set([0, text.length])
  const result: NodeJSON[] = []

  for (const diff of diffs) {
    if (diff.type === 'insert' && diff.textDiff) {
      boundaries.add(Math.max(0, diff.textDiff.offset - startOffset))
      boundaries.add(Math.min(text.length, diff.textDiff.offset + diff.textDiff.length - startOffset))
    }

    if (
      diff.type === 'modify'
      && diff.attrChange?.key === 'marks'
      && typeof diff.attrChange.fromOffset === 'number'
      && typeof diff.attrChange.toOffset === 'number'
    ) {
      boundaries.add(Math.max(0, diff.attrChange.fromOffset - startOffset))
      boundaries.add(Math.min(text.length, diff.attrChange.toOffset - startOffset))
    }
  }

  const sorted = Array.from(boundaries)
    .filter((value) => value >= 0 && value <= text.length)
    .sort((a, b) => a - b)

  const pushDeletesAt = (offset: number) => {
    diffs
      .filter((diff) => diff.type === 'delete' && diff.textDiff?.offset === startOffset + offset)
      .forEach((diff) => result.push(createDeleteInline(diff.textDiff?.text || '[已删除]')))
  }

  pushDeletesAt(0)

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const from = sorted[i]
    const to = sorted[i + 1]

    if (to > from) {
      const absoluteFrom = startOffset + from
      const segment: NodeJSON = {
        ...node,
        text: text.slice(from, to),
      }
      const isInserted = diffs.some((diff) => {
        if (diff.type !== 'insert' || !diff.textDiff) {
          return false
        }

        const start = diff.textDiff.offset
        const end = start + diff.textDiff.length
        return absoluteFrom >= start && absoluteFrom < end
      })
      const isModified = diffs.some((diff) => {
        if (
          diff.type !== 'modify'
          || diff.attrChange?.key !== 'marks'
          || typeof diff.attrChange.fromOffset !== 'number'
          || typeof diff.attrChange.toOffset !== 'number'
        ) {
          return false
        }

        return absoluteFrom >= diff.attrChange.fromOffset && absoluteFrom < diff.attrChange.toOffset
      })
      let nextSegment = segment

      if (forcedKind) {
        nextSegment = addDiffMark(nextSegment, forcedKind)
      }

      if (isInserted) {
        nextSegment = addDiffMark(nextSegment, 'insert')
      }

      if (isModified) {
        nextSegment = addDiffMark(nextSegment, 'modify')
      }

      result.push(nextSegment)
    }

    pushDeletesAt(to)
  }

  return result
}

function transformInlineContainer(
  node: NodeJSON,
  path: number[],
  context: TransformContext,
  forcedKind?: StaticDiffKind,
): NodeJSON {
  const diffs = getDiffsAt(context.index, path)
  const content = node.content || []
  const nextContent: NodeJSON[] = []
  let textOffset = 0

  content.forEach((child, childIndex) => {
    nextContent.push(...renderDeletedChildrenAt(path, childIndex, node.type, context))

    if (child.type === 'text') {
      const parts = splitTextWithDiffs(child, textOffset, diffs, forcedKind)
      nextContent.push(...parts)
      textOffset += child.text?.length || 0
      return
    }

    nextContent.push(...transformNode(child, [...path, childIndex], node.type, context, forcedKind))
  })

  nextContent.push(...renderDeletedChildrenAt(path, content.length, node.type, context))

  const nextNode = {
    ...node,
    content: nextContent.length ? nextContent : undefined,
  }

  return nextNode
}

function transformNode(
  node: NodeJSON,
  path: number[],
  parentType: string | null,
  context: TransformContext,
  forcedKind?: StaticDiffKind,
): NodeJSON[] {
  const exactDiffs = getDiffsAt(context.index, path)
  const hasInsertedNode = exactDiffs.some((diff) => diff.type === 'insert' && !diff.textDiff)
  const hasModifiedNode = exactDiffs.some((diff) => diff.type === 'modify' && diff.attrChange?.key !== 'marks')
  const exactKind: StaticDiffKind | undefined = hasInsertedNode ? 'insert' : hasModifiedNode ? 'modify' : undefined
  const canWrapHere = !!exactKind && (
    (isInlineLikeNode(node) && isInlineParent(parentType))
    || (!isInlineLikeNode(node) && canWrapBlock(parentType))
  )
  const nextForcedKind = forcedKind || (canWrapHere ? undefined : exactKind)
  let nextNode: NodeJSON

  if (node.type === 'text') {
    nextNode = forcedKind ? addDiffMark(node, forcedKind) : node
  } else if (isInlineContainer(node)) {
    nextNode = transformInlineContainer(node, path, context, nextForcedKind)
  } else {
    const content = node.content || []
    const nextContent: NodeJSON[] = []

    content.forEach((child, childIndex) => {
      nextContent.push(...renderDeletedChildrenAt(path, childIndex, node.type, context))
      nextContent.push(...transformNode(child, [...path, childIndex], node.type, context, nextForcedKind))
    })

    nextContent.push(...renderDeletedChildrenAt(path, content.length, node.type, context))

    nextNode = {
      ...node,
      content: nextContent.length ? nextContent : undefined,
    }
  }

  if (!exactKind || forcedKind) {
    return [nextNode]
  }

  if (isInlineLikeNode(nextNode) && isInlineParent(parentType)) {
    return [wrapInline(nextNode, exactKind)]
  }

  if (!isInlineLikeNode(nextNode) && canWrapBlock(parentType)) {
    return [wrapBlock(nextNode, exactKind)]
  }

  return [nextNode]
}

export function createStaticDiffDocumentFromResult(comparison: EditorDiffResult, options: EditorDiffOptions = {}): NodeJSON {
  const context: TransformContext = {
    index: createDiffIndex(comparison.diffs),
    options,
  }

  const content = comparison.current.content || []

  return {
    ...comparison.current,
    content: [
      ...content.flatMap((child, index) => [
        ...renderDeletedChildrenAt([], index, comparison.current.type, context),
        ...transformNode(child, [index], comparison.current.type, context),
      ]),
      ...renderDeletedChildrenAt([], content.length, comparison.current.type, context),
    ],
  }
}

export function createStaticDiffDocument(
  oldContent: EditorDiffInput,
  newContent: EditorDiffInput,
  options: EditorDiffOptions = {},
): NodeJSON {
  return createStaticDiffDocumentFromResult(editorDiff(oldContent, newContent, options), options)
}

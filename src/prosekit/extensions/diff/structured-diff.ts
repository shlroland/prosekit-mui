import DiffMatchPatch from 'diff-match-patch'
import type { NodeJSON } from 'prosekit/core'

import type { DiffComparison, DiffItem, DiffOptions } from './types'

const dmp = new DiffMatchPatch()

const inlineContainerTypes = new Set(['paragraph', 'heading'])

const blockishTypes = new Set([
  'doc',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'details',
  'detailsSummary',
  'detailsContent',
  'alert',
  'codeBlock',
  'mathBlock',
  'blockAttachment',
  'blockLink',
  'image',
  'excalidraw',
  'flipGrid',
  'flipGridColumn',
])

type MarkJSON = {
  type: string
  attrs?: Record<string, unknown>
}

function isIgnoredAttr(key: string, options?: DiffOptions): boolean {
  return !!options?.ignoreAttrs?.includes(key)
}

function getFilteredAttrs(attrs: Record<string, unknown> | undefined, options?: DiffOptions): Record<string, unknown> {
  const source = attrs || {}

  if (!options?.ignoreAttrs?.length) {
    return source
  }

  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !isIgnoredAttr(key, options)),
  )
}

function serializeMark(mark: MarkJSON, options?: DiffOptions): string {
  return JSON.stringify({
    type: mark.type,
    attrs: getFilteredAttrs(mark.attrs, options),
  })
}

function haveSameMarks(a?: MarkJSON[], b?: MarkJSON[], options?: DiffOptions): boolean {
  const arrA = a || []
  const arrB = b || []

  if (arrA.length !== arrB.length) {
    return false
  }

  const setA = new Set(arrA.map((mark) => serializeMark(mark, options)))
  return arrB.every((mark) => setA.has(serializeMark(mark, options)))
}

function areAttrsEqual(
  attrsA: Record<string, unknown> | undefined,
  attrsB: Record<string, unknown> | undefined,
  options?: DiffOptions,
): boolean {
  return JSON.stringify(getFilteredAttrs(attrsA, options)) === JSON.stringify(getFilteredAttrs(attrsB, options))
}

function getNodeSignature(node: NodeJSON | undefined, options?: DiffOptions): string {
  if (!node) {
    return ''
  }

  if (node.type === 'text') {
    return JSON.stringify({
      type: node.type,
      text: node.text || '',
      marks: ((node.marks || []) as MarkJSON[]).map((mark) => serializeMark(mark, options)),
    })
  }

  return JSON.stringify({
    type: node.type,
    attrs: getFilteredAttrs(node.attrs as Record<string, unknown> | undefined, options),
    content: (node.content || []).map((child) => getNodeSignature(child, options)),
  })
}

function nodesEqualForAlign(a?: NodeJSON, b?: NodeJSON, options?: DiffOptions): boolean {
  if (!a || !b || a.type !== b.type) {
    return false
  }

  if (a.type === 'heading') {
    return isIgnoredAttr('level', options) || a.attrs?.level === b.attrs?.level
  }

  if (a.type === 'codeBlock') {
    return isIgnoredAttr('language', options) || a.attrs?.language === b.attrs?.language
  }

  return true
}

function createAlignPredicate<T>(
  a: T[],
  b: T[],
  getNode: (item: T) => NodeJSON | undefined,
  options?: DiffOptions,
): (x: T, y: T) => boolean {
  const countSignatures = (items: T[]) => {
    const counts = new Map<string, number>()

    items.forEach((item) => {
      const signature = getNodeSignature(getNode(item), options)

      if (signature) {
        counts.set(signature, (counts.get(signature) || 0) + 1)
      }
    })

    return counts
  }

  const countsA = countSignatures(a)
  const countsB = countSignatures(b)
  const uniqueSharedSignatures = new Set(
    Array.from(countsA.keys()).filter((signature) => countsA.get(signature) === 1 && countsB.get(signature) === 1),
  )

  return (x, y) => {
    const nodeX = getNode(x)
    const nodeY = getNode(y)
    const signatureX = getNodeSignature(nodeX, options)
    const signatureY = getNodeSignature(nodeY, options)
    const isXUnique = uniqueSharedSignatures.has(signatureX)
    const isYUnique = uniqueSharedSignatures.has(signatureY)

    if (isXUnique || isYUnique) {
      return isXUnique && isYUnique && signatureX === signatureY
    }

    return nodesEqualForAlign(nodeX, nodeY, options)
  }
}

function lcsAlign<T>(a: T[], b: T[], equals: (x: T, y: T) => boolean): Array<[number, number]> {
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0))

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = equals(a[i], b[j])
        ? 1 + dp[i + 1][j + 1]
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const pairs: Array<[number, number]> = []
  let i = 0
  let j = 0

  while (i < n && j < m) {
    if (equals(a[i], b[j])) {
      pairs.push([i, j])
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i += 1
    } else {
      j += 1
    }
  }

  return pairs
}

function isInlineLikeChildNode(node: NodeJSON): boolean {
  if (node.type === 'text') {
    return true
  }

  if (blockishTypes.has(node.type)) {
    return false
  }

  return !node.content?.length
}

function isInlineContainer(node: NodeJSON): boolean {
  if (inlineContainerTypes.has(node.type)) {
    return true
  }

  const content = node.content || []
  return content.length > 0 && content.every(isInlineLikeChildNode)
}

function extractInlineTextAndMarks(node: NodeJSON): {
  text: string
  marksMap: MarkJSON[][]
} {
  const resultChars: string[] = []
  const marksMap: MarkJSON[][] = []

  for (const child of node.content || []) {
    if (child.type === 'text') {
      const text = child.text || ''

      for (let i = 0; i < text.length; i += 1) {
        resultChars.push(text[i])
        marksMap.push([...(child.marks || [])] as MarkJSON[])
      }
    }
  }

  return { text: resultChars.join(''), marksMap }
}

function compareInlineContainer(nodeA: NodeJSON, nodeB: NodeJSON, path: number[], options?: DiffOptions): DiffItem[] {
  const diffs: DiffItem[] = []
  const { text: oldText, marksMap: oldMarks } = extractInlineTextAndMarks(nodeA)
  const { text: newText, marksMap: newMarks } = extractInlineTextAndMarks(nodeB)
  const blocks = dmp.diff_main(oldText, newText)
  dmp.diff_cleanupSemantic(blocks)

  let oldOffset = 0
  let newOffset = 0

  for (const [operation, text] of blocks) {
    const len = text.length

    if (operation === -1) {
      diffs.push({
        type: 'delete',
        path: [...path],
        textDiff: { offset: newOffset, length: len, text, operation },
      })
      oldOffset += len
      continue
    }

    if (operation === 1) {
      diffs.push({
        type: 'insert',
        path: [...path],
        textDiff: { offset: newOffset, length: len, text, operation },
      })
      newOffset += len
      continue
    }

    let runStart: number | null = null

    for (let i = 0; i < len; i += 1) {
      const oldIndex = oldOffset + i
      const newIndex = newOffset + i
      const same = haveSameMarks(oldMarks[oldIndex] || [], newMarks[newIndex] || [], options)

      if (!same && runStart === null) {
        runStart = i
      } else if (same && runStart !== null) {
        diffs.push({
          type: 'modify',
          path: [...path],
          attrChange: {
            key: 'marks',
            oldValue: oldMarks.slice(oldOffset + runStart, oldOffset + i),
            newValue: newMarks.slice(newOffset + runStart, newOffset + i),
            fromOffset: newOffset + runStart,
            toOffset: newOffset + i,
          },
        })
        runStart = null
      }
    }

    if (runStart !== null) {
      diffs.push({
        type: 'modify',
        path: [...path],
        attrChange: {
          key: 'marks',
          oldValue: oldMarks.slice(oldOffset + runStart, oldOffset + len),
          newValue: newMarks.slice(newOffset + runStart, newOffset + len),
          fromOffset: newOffset + runStart,
          toOffset: newOffset + len,
        },
      })
    }

    oldOffset += len
    newOffset += len
  }

  return diffs
}

function compareInlineContainerChildren(nodeA: NodeJSON, nodeB: NodeJSON, path: number[], options?: DiffOptions): DiffItem[] {
  const diffs: DiffItem[] = []
  const aList = (nodeA.content || []).map((node, index) => ({ node, index })).filter((item) => item.node.type !== 'text')
  const bList = (nodeB.content || []).map((node, index) => ({ node, index })).filter((item) => item.node.type !== 'text')
  const pairs = lcsAlign(aList, bList, createAlignPredicate(aList, bList, (item) => item.node, options))
  let ai = 0
  let bi = 0

  for (const [i, j] of pairs) {
    while (ai < i) {
      const deleted = aList[ai]
      const anchorIndex = bi < bList.length ? bList[bi].index : (nodeB.content?.length ?? 0)
      diffs.push({ type: 'delete', path: [...path, anchorIndex], node: deleted.node })
      ai += 1
    }

    while (bi < j) {
      const inserted = bList[bi]
      diffs.push({ type: 'insert', path: [...path, inserted.index], node: inserted.node })
      bi += 1
    }

    const aItem = aList[i]
    const bItem = bList[j]

    if (aItem && bItem && !areAttrsEqual(
      aItem.node.attrs as Record<string, unknown> | undefined,
      bItem.node.attrs as Record<string, unknown> | undefined,
      options,
    )) {
      diffs.push({
        type: 'modify',
        path: [...path, bItem.index],
        attrChange: {
          key: 'attrs',
          oldValue: getFilteredAttrs(aItem.node.attrs as Record<string, unknown> | undefined, options),
          newValue: getFilteredAttrs(bItem.node.attrs as Record<string, unknown> | undefined, options),
        },
      })
    }

    ai = i + 1
    bi = j + 1
  }

  while (ai < aList.length) {
    const deleted = aList[ai]
    const anchorIndex = bi < bList.length ? bList[bi].index : (nodeB.content?.length ?? 0)
    diffs.push({ type: 'delete', path: [...path, anchorIndex], node: deleted.node })
    ai += 1
  }

  while (bi < bList.length) {
    const inserted = bList[bi]
    diffs.push({ type: 'insert', path: [...path, inserted.index], node: inserted.node })
    bi += 1
  }

  return diffs
}

function compareNodes(nodeA: NodeJSON | undefined, nodeB: NodeJSON | undefined, path: number[] = [], options?: DiffOptions): DiffItem[] {
  const diffs: DiffItem[] = []

  if (nodeA?.type !== nodeB?.type) {
    if (nodeA) {
      diffs.push({ type: 'delete', path: [...path], node: nodeA })
    }

    if (nodeB) {
      diffs.push({ type: 'insert', path: [...path], node: nodeB })
    }

    return diffs
  }

  if (!nodeA || !nodeB) {
    return diffs
  }

  if (nodeA.type === 'text' && nodeB.type === 'text') {
    if (nodeA.text !== nodeB.text) {
      const textDiffs = dmp.diff_main(nodeA.text || '', nodeB.text || '')
      dmp.diff_cleanupSemantic(textDiffs)
      let textOffset = 0

      textDiffs.forEach(([operation, text]) => {
        if (operation === -1) {
          diffs.push({
            type: 'delete',
            path: [...path],
            textDiff: { offset: textOffset, length: text.length, text, operation },
          })
        } else if (operation === 1) {
          diffs.push({
            type: 'insert',
            path: [...path],
            textDiff: { offset: textOffset, length: text.length, text, operation },
          })
          textOffset += text.length
        } else {
          textOffset += text.length
        }
      })
    }

    if (!haveSameMarks(nodeA.marks as MarkJSON[] | undefined, nodeB.marks as MarkJSON[] | undefined, options)) {
      diffs.push({
        type: 'modify',
        path: [...path],
        attrChange: {
          key: 'marks',
          oldValue: nodeA.marks || [],
          newValue: nodeB.marks || [],
        },
      })
    }

    return diffs
  }

  const attrsA = nodeA.attrs as Record<string, unknown> | undefined
  const attrsB = nodeB.attrs as Record<string, unknown> | undefined
  const allAttrKeys = new Set([...Object.keys(attrsA || {}), ...Object.keys(attrsB || {})])

  for (const key of allAttrKeys) {
    if (!isIgnoredAttr(key, options) && attrsA?.[key] !== attrsB?.[key]) {
      diffs.push({
        type: 'modify',
        path: [...path],
        attrChange: {
          key,
          oldValue: attrsA?.[key],
          newValue: attrsB?.[key],
        },
      })
    }
  }

  if (isInlineContainer(nodeA) && isInlineContainer(nodeB)) {
    diffs.push(...compareInlineContainer(nodeA, nodeB, path, options))
    diffs.push(...compareInlineContainerChildren(nodeA, nodeB, path, options))
    return diffs
  }

  const contentA = nodeA.content || []
  const contentB = nodeB.content || []
  const pairs = lcsAlign(contentA, contentB, createAlignPredicate(contentA, contentB, (node) => node, options))
  let ai = 0
  let bi = 0

  for (const [i, j] of pairs) {
    while (ai < i) {
      diffs.push({ type: 'delete', path: [...path, bi], node: contentA[ai] })
      ai += 1
    }

    while (bi < j) {
      diffs.push({ type: 'insert', path: [...path, bi], node: contentB[bi] })
      bi += 1
    }

    diffs.push(...compareNodes(contentA[i], contentB[j], [...path, j], options))
    ai = i + 1
    bi = j + 1
  }

  while (ai < contentA.length) {
    diffs.push({ type: 'delete', path: [...path, bi], node: contentA[ai] })
    ai += 1
  }

  while (bi < contentB.length) {
    diffs.push({ type: 'insert', path: [...path, bi], node: contentB[bi] })
    bi += 1
  }

  return diffs
}

export function compareDocuments(oldDoc: NodeJSON, newDoc: NodeJSON, options?: DiffOptions): DiffComparison {
  const diffs = compareNodes(oldDoc, newDoc, [], options)

  return {
    oldDoc,
    newDoc,
    diffs,
    hasChanges: diffs.length > 0,
  }
}

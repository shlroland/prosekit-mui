import type { NodeJSON } from 'prosekit/core'

import {
  compareDocuments,
  type DiffComparison,
  type DiffOptions,
} from '../../extensions/diff'
import { normalizeNodeJSON } from '../../normalize-node-json'
import {
  parseProseKitHTMLToNodeJSON,
  type ProseKitHTMLAdapterOptions,
} from '../html-adapter'

export type EditorDiffInput = NodeJSON | string

export type EditorDiffOptions =
  & DiffOptions
  & ProseKitHTMLAdapterOptions

export type EditorDiffResult = DiffComparison & {
  baseline: NodeJSON
  current: NodeJSON
}

export function normalizeEditorDiffInput(
  content: EditorDiffInput,
  options: ProseKitHTMLAdapterOptions = {},
): NodeJSON {
  return typeof content === 'string'
    ? parseProseKitHTMLToNodeJSON(content, options)
    : normalizeNodeJSON(content)
}

export function editorDiff(
  oldContent: EditorDiffInput,
  newContent: EditorDiffInput,
  options: EditorDiffOptions = {},
): EditorDiffResult {
  const baseline = normalizeEditorDiffInput(oldContent, options)
  const current = normalizeEditorDiffInput(newContent, options)
  const comparison = compareDocuments(baseline, current, options)

  return {
    ...comparison,
    baseline,
    current,
  }
}

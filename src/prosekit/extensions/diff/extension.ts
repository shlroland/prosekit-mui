import './view.css'

import {
  defineCommands,
  definePlugin,
  jsonFromNode,
  union,
  type NodeJSON,
} from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { PluginKey, ProseMirrorPlugin, type Transaction } from 'prosekit/pm/state'
import { DecorationSet } from 'prosekit/pm/view'

import { createDecorationsFromDiffs } from './decorations'
import { compareDocuments } from './structured-diff'
import type { DiffCommandsExtension, DiffExtension, DiffItem, DiffOptions } from './types'

type DiffPluginState = {
  baseline: NodeJSON | null
  decorations: DecorationSet
  diffs: DiffItem[]
  isActive: boolean
}

type DiffMeta =
  | { type: 'setBaseline'; baseline: NodeJSON }
  | { type: 'showDiff'; baseline?: NodeJSON }
  | { type: 'hideDiff' }

export const diffPluginKey = new PluginKey<DiffPluginState>('prosekit-diff')

function createEmptyState(doc: ProseMirrorNode): DiffPluginState {
  return {
    baseline: null,
    decorations: DecorationSet.create(doc, []),
    diffs: [],
    isActive: false,
  }
}

function createActiveState(doc: ProseMirrorNode, baseline: NodeJSON, options?: DiffOptions): DiffPluginState {
  const currentDoc = jsonFromNode(doc)
  const comparison = compareDocuments(baseline, currentDoc, options)

  if (!comparison.hasChanges) {
    return {
      baseline,
      decorations: DecorationSet.create(doc, []),
      diffs: [],
      isActive: false,
    }
  }

  return {
    baseline,
    decorations: createDecorationsFromDiffs(comparison.diffs, doc, options),
    diffs: comparison.diffs,
    isActive: true,
  }
}

function defineDiffPlugin(options: DiffOptions = {}) {
  return definePlugin(
    () =>
      new ProseMirrorPlugin<DiffPluginState>({
        key: diffPluginKey,
        state: {
          init: (_, state) => createEmptyState(state.doc),
          apply: (tr, value, _oldState, newState) => {
            const meta = tr.getMeta(diffPluginKey) as DiffMeta | undefined

            if (meta?.type === 'setBaseline') {
              return {
                baseline: meta.baseline,
                decorations: DecorationSet.create(newState.doc, []),
                diffs: [],
                isActive: false,
              }
            }

            if (meta?.type === 'showDiff') {
              return createActiveState(newState.doc, meta.baseline ?? value.baseline ?? jsonFromNode(newState.doc), options)
            }

            if (meta?.type === 'hideDiff') {
              return {
                baseline: value.baseline,
                decorations: DecorationSet.create(newState.doc, []),
                diffs: [],
                isActive: false,
              }
            }

            if (tr.docChanged && value.isActive && value.baseline) {
              return createActiveState(newState.doc, value.baseline, options)
            }

            return value
          },
        },
        props: {
          decorations(state) {
            return diffPluginKey.getState(state)?.decorations ?? null
          },
        },
      }),
  )
}

function setDiffMeta(tr: Transaction, meta: DiffMeta): Transaction {
  return tr.setMeta(diffPluginKey, meta)
}

function defineDiffCommands(): DiffCommandsExtension {
  return defineCommands({
    setDiffBaseline: (baseline?: NodeJSON) => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      dispatch(setDiffMeta(state.tr, {
        type: 'setBaseline',
        baseline: baseline ?? jsonFromNode(state.doc),
      }))
      return true
    },
    showDiff: (baseline?: NodeJSON) => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      dispatch(setDiffMeta(state.tr, { type: 'showDiff', baseline }))
      return true
    },
    hideDiff: () => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      dispatch(setDiffMeta(state.tr, { type: 'hideDiff' }))
      return true
    },
    toggleDiff: (baseline?: NodeJSON) => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      const pluginState = diffPluginKey.getState(state)
      dispatch(setDiffMeta(state.tr, pluginState?.isActive ? { type: 'hideDiff' } : { type: 'showDiff', baseline }))
      return true
    },
  }) as DiffCommandsExtension
}

export function getDiffState(state: Parameters<typeof diffPluginKey.getState>[0]) {
  const pluginState = diffPluginKey.getState(state)

  if (!pluginState) {
    return {
      isActive: false,
      diffs: [],
      diffCount: 0,
      baseline: null,
    }
  }

  return {
    isActive: pluginState.isActive,
    diffs: pluginState.diffs,
    diffCount: pluginState.diffs.length,
    baseline: pluginState.baseline,
  }
}

export function defineDiffExtension(options: DiffOptions = {}): DiffExtension {
  return union(
    defineDiffPlugin(options),
    defineDiffCommands(),
  ) as DiffExtension
}

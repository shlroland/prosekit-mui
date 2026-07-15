import { definePlugin, type PlainExtension } from 'prosekit/core'
import { Plugin, PluginKey, type EditorState, type Transaction } from 'prosekit/pm/state'
import { Decoration, DecorationSet, type EditorView } from 'prosekit/pm/view'

export type VirtualSelectionExtension = PlainExtension

type PluginState = boolean

const key = new PluginKey<PluginState>('prosekit-virtual-selection')

function getFocusMeta(tr: Transaction): PluginState | undefined {
  return tr.getMeta(key) as PluginState | undefined
}

function setFocusMeta(tr: Transaction, value: PluginState) {
  return tr.setMeta(key, value)
}

function getFocusState(state: EditorState): PluginState | undefined {
  return key.getState(state)
}

function updateFocusState(view: EditorView, value: PluginState) {
  if (getFocusState(view.state) !== value) {
    view.dispatch(setFocusMeta(view.state.tr, value))
  }
}

export function defineVirtualSelectionExtension(): VirtualSelectionExtension {
  return definePlugin(
    new Plugin<PluginState>({
      key,
      state: {
        init: () => false,
        apply: (tr, value) => getFocusMeta(tr) ?? value,
      },
      props: {
        handleDOMEvents: {
          pointerdown: (view) => {
            // Remove the decoration before focus can restore the stale DOM selection.
            updateFocusState(view, false)
            return false
          },
          focus: (view) => {
            updateFocusState(view, false)
            return false
          },
          blur: (view) => {
            if (view.root.activeElement !== view.dom) {
              updateFocusState(view, true)
            }
            return false
          },
        },
        decorations: (state) => {
          const { selection, doc } = state

          if (selection.empty || !selection.visible || !getFocusState(state)) {
            return null
          }

          return DecorationSet.create(doc, [
            Decoration.inline(selection.from, selection.to, {
              class: 'prosekit-virtual-selection',
            }),
          ])
        },
      },
    }),
  )
}

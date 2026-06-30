import './view.css'

import { defineCommands, definePlugin, union } from 'prosekit/core'
import type { Command } from 'prosekit/pm/state'
import { PluginKey, ProseMirrorPlugin } from 'prosekit/pm/state'
import { Decoration, DecorationSet, type EditorView } from 'prosekit/pm/view'

import type {
  AiWritingCommandsExtension,
  AiWritingExtension,
  AiWritingOptions,
  AiWritingTransformRequest,
} from './types'

type AiWritingPluginState = {
  enabled: boolean
  pos: number | null
  text: string
  decorations: DecorationSet
  lastDocText: string
  lastTriggerPos: number | null
  requestId: number
}

type AiWritingMeta =
  | { type: 'setEnabled'; enabled: boolean }
  | { type: 'setSuggestion'; text: string; pos: number | null; lastDocText: string; lastTriggerPos: number | null; requestId: number }
  | { type: 'clearSuggestion' }

export const aiWritingPluginKey = new PluginKey<AiWritingPluginState>('prosekit-ai-writing')

const aiWritingOptionsByView = new WeakMap<EditorView, AiWritingOptions>()

function debounce<F extends (...args: any[]) => void>(fn: F, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => fn(...args), wait)
  }
}

function getFullText(view: EditorView) {
  const { doc } = view.state
  return doc.textBetween(0, doc.content.size, '\n', '\n')
}

function isAtEndWithNoContentAfter(view: EditorView): boolean {
  const { state } = view
  const { selection, doc } = state

  if (!selection.empty) {
    return false
  }

  const suffixFromCursor = doc.textBetween(selection.from, doc.content.size, '\n', '\n')
  const nextNewlineIndex = suffixFromCursor.indexOf('\n')
  const currentLineAfterCursor = nextNewlineIndex >= 0
    ? suffixFromCursor.slice(0, nextNewlineIndex)
    : suffixFromCursor

  return currentLineAfterCursor.trim().length === 0
}

function createSuggestionDecoration(pos: number, text: string) {
  return Decoration.widget(
    pos,
    (view) => {
      const dom = view.dom.ownerDocument.createElement('span')
      dom.className = 'prosekit-ai-writing-suggestion'
      dom.textContent = text
      return dom
    },
    {
      ignoreSelection: true,
      side: 1,
    },
  )
}

function clearSuggestionState(state: AiWritingPluginState, doc: Parameters<typeof DecorationSet.create>[0]): AiWritingPluginState {
  return {
    ...state,
    text: '',
    pos: null,
    decorations: DecorationSet.create(doc, []),
    lastTriggerPos: null,
  }
}

function acceptAiWritingCommand(): Command {
  return (state, dispatch) => {
    const pluginState = aiWritingPluginKey.getState(state)

    if (!pluginState?.enabled || !pluginState.text || pluginState.pos == null) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const tr = state.tr
    const segments = pluginState.text.split('\n')
    let pos = state.selection.from

    segments.forEach((segment, index) => {
      if (segment) {
        tr.insertText(segment, pos)
        pos += segment.length
      }

      if (index < segments.length - 1) {
        const hardBreak = state.schema.nodes.hardBreak

        if (hardBreak) {
          tr.insert(pos, hardBreak.create())
          pos += 1
        } else {
          tr.insertText('\n', pos)
          pos += 1
        }
      }
    })

    dispatch(tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' } satisfies AiWritingMeta).scrollIntoView())
    return true
  }
}

function defineAiWritingPlugin(options: AiWritingOptions = {}) {
  const minChars = options.minChars ?? 1
  const debounceMs = options.debounceMs ?? 1000
  let requestId = 0

  async function requestSuggestion(view: EditorView) {
    const pluginState = aiWritingPluginKey.getState(view.state)

    if (!pluginState?.enabled || !options.onGetSuggestion || !isAtEndWithNoContentAfter(view)) {
      return
    }

    const text = getFullText(view)

    if (!text.trim() || text.length < minChars) {
      return
    }

    const from = view.state.selection.from

    if (pluginState.lastDocText === text && pluginState.lastTriggerPos === from) {
      return
    }

    const currentRequestId = requestId + 1
    requestId = currentRequestId

    try {
      const { doc } = view.state
      const prefix = doc.textBetween(0, from, '\n', '\n')
      const suffix = doc.textBetween(from, doc.content.size, '\n', '\n')
      const suggestion = await options.onGetSuggestion({ prefix, suffix })

      if (requestId !== currentRequestId) {
        return
      }

      view.dispatch(view.state.tr.setMeta(aiWritingPluginKey, {
        type: 'setSuggestion',
        text: suggestion || '',
        pos: view.state.selection.from,
        lastDocText: text,
        lastTriggerPos: from,
        requestId: currentRequestId,
      } satisfies AiWritingMeta))
    } catch (error) {
      console.error('AI writing suggestion failed:', error)
    }
  }

  const debouncedRequest = debounce(requestSuggestion, debounceMs)

  return definePlugin(
    () =>
      new ProseMirrorPlugin<AiWritingPluginState>({
        key: aiWritingPluginKey,
        state: {
          init: (_, state) => ({
            enabled: false,
            pos: null,
            text: '',
            decorations: DecorationSet.create(state.doc, []),
            lastDocText: '',
            lastTriggerPos: null,
            requestId: 0,
          }),
          apply: (tr, pluginState, _oldState, newState) => {
            let next = pluginState

            if (tr.docChanged) {
              next = {
                ...next,
                decorations: pluginState.decorations.map(tr.mapping, tr.doc),
              }

              if (!tr.getMeta(aiWritingPluginKey)) {
                next = clearSuggestionState(next, newState.doc)
              }
            }

            const meta = tr.getMeta(aiWritingPluginKey) as AiWritingMeta | undefined

            if (!meta) {
              return next
            }

            if (meta.type === 'setEnabled') {
              return {
                ...next,
                enabled: meta.enabled,
                text: meta.enabled ? next.text : '',
                pos: meta.enabled ? next.pos : null,
                decorations: meta.enabled ? next.decorations : DecorationSet.create(newState.doc, []),
                lastTriggerPos: meta.enabled ? next.lastTriggerPos : null,
              }
            }

            if (meta.type === 'clearSuggestion') {
              return clearSuggestionState(next, newState.doc)
            }

            if (meta.type === 'setSuggestion') {
              if (!meta.text || meta.pos == null) {
                return {
                  ...next,
                  text: '',
                  pos: null,
                  decorations: DecorationSet.create(newState.doc, []),
                  lastDocText: meta.lastDocText,
                  lastTriggerPos: meta.lastTriggerPos,
                  requestId: meta.requestId,
                }
              }

              return {
                ...next,
                text: meta.text,
                pos: meta.pos,
                decorations: DecorationSet.create(newState.doc, [createSuggestionDecoration(meta.pos, meta.text)]),
                lastDocText: meta.lastDocText,
                lastTriggerPos: meta.lastTriggerPos,
                requestId: meta.requestId,
              }
            }

            return next
          },
        },
        view: (view) => {
          aiWritingOptionsByView.set(view, options)

          const updateSuggestion = () => {
            const pluginState = aiWritingPluginKey.getState(view.state)

            if (!pluginState?.enabled) {
              return
            }

            const currentPos = view.state.selection.from

            if (pluginState.text && pluginState.pos != null && pluginState.pos !== currentPos) {
              view.dispatch(view.state.tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' } satisfies AiWritingMeta))
              return
            }

            if (isAtEndWithNoContentAfter(view)) {
              debouncedRequest(view)
            }
          }

          updateSuggestion()

          return {
            update: updateSuggestion,
            destroy: () => {
              aiWritingOptionsByView.delete(view)
            },
          }
        },
        props: {
          decorations(state) {
            return aiWritingPluginKey.getState(state)?.decorations ?? null
          },
          handleKeyDown(view, event) {
            const pluginState = aiWritingPluginKey.getState(view.state)

            if (!pluginState?.enabled) {
              return false
            }

            if (event.key === 'Tab' && pluginState.text) {
              event.preventDefault()
              return acceptAiWritingCommand()(view.state, view.dispatch, view)
            }

            if (pluginState.text) {
              view.dispatch(view.state.tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' } satisfies AiWritingMeta))
            }

            return false
          },
        },
      }),
  )
}

function defineAiWritingCommands(): AiWritingCommandsExtension {
  return defineCommands({
    setAiWriting: (enabled: boolean) => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      dispatch(state.tr.setMeta(aiWritingPluginKey, { type: 'setEnabled', enabled } satisfies AiWritingMeta))
      return true
    },
    toggleAiWriting: () => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      const pluginState = aiWritingPluginKey.getState(state)
      dispatch(state.tr.setMeta(aiWritingPluginKey, {
        type: 'setEnabled',
        enabled: !pluginState?.enabled,
      } satisfies AiWritingMeta))
      return true
    },
    acceptAiWriting: acceptAiWritingCommand,
    clearAiWritingSuggestion: () => (state, dispatch) => {
      if (!dispatch) {
        return true
      }

      dispatch(state.tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' } satisfies AiWritingMeta))
      return true
    },
  }) as AiWritingCommandsExtension
}

export function getAiWritingState(state: Parameters<typeof aiWritingPluginKey.getState>[0]) {
  const pluginState = aiWritingPluginKey.getState(state)

  return {
    enabled: !!pluginState?.enabled,
    hasSuggestion: !!pluginState?.text,
    suggestion: pluginState?.text || '',
  }
}

export async function requestAiWritingTransform(view: EditorView, request: AiWritingTransformRequest) {
  const options = aiWritingOptionsByView.get(view)

  if (!options?.onTransform) {
    return ''
  }

  return options.onTransform(request)
}

export function defineAiWritingExtension(options: AiWritingOptions = {}): AiWritingExtension {
  return union(
    defineAiWritingPlugin(options),
    defineAiWritingCommands(),
  ) as AiWritingExtension
}

import {
  defineCommands,
  type EditorState,
  findParentNodeOfType,
  setNodeAttrs,
  setNodeAttrsBetween,
} from 'prosekit/core'

import {
  textAlignValues,
  type TextAlignCommandsExtension,
  type TextAlignOptions,
  type TextAlignValue,
} from './types'

function isTextAlignValue(value: string): value is TextAlignValue {
  return (textAlignValues as readonly string[]).includes(value)
}

export function createSetTextAlignCommand(
  value: TextAlignValue,
  options: Required<TextAlignOptions>,
) {
  return (state, dispatch) => {
    const attrs = {
      textAlign: value === options.defaultAlignment ? null : value,
    }

    if (state.selection.empty) {
      return setNodeAttrs({
        type: options.types,
        attrs,
      })(state, dispatch)
    }

    return setNodeAttrsBetween({
      type: options.types,
      attrs,
    })(state, dispatch)
  }
}

export function createUnsetTextAlignCommand(options: Required<TextAlignOptions>) {
  return (state, dispatch) => {
    const attrs = {
      textAlign: null,
    }

    if (state.selection.empty) {
      return setNodeAttrs({
        type: options.types,
        attrs,
      })(state, dispatch)
    }

    return setNodeAttrsBetween({
      type: options.types,
      attrs,
    })(state, dispatch)
  }
}

export function getActiveTextAlign(
  state: EditorState,
  types: string[],
): TextAlignValue | undefined {
  const found = findParentNodeOfType(types, state.selection.$anchor)
  const value = found?.node.attrs.textAlign

  return isTextAlignValue(value) ? value : undefined
}

export function createToggleTextAlignCommand(
  value: TextAlignValue,
  options: Required<TextAlignOptions>,
) {
  if (!isTextAlignValue(value) || !options.alignments.includes(value)) {
    return () => false
  }

  return (state, dispatch) => {
    const activeTextAlign = getActiveTextAlign(state, options.types)

    if (activeTextAlign === value) {
      return createUnsetTextAlignCommand(options)(state, dispatch)
    }

    return createSetTextAlignCommand(value, options)(state, dispatch)
  }
}

export function defineTextAlignCommands(
  options: Required<TextAlignOptions>,
): TextAlignCommandsExtension {
  return defineCommands({
    setTextAlign: (value: TextAlignValue) => {
      if (!isTextAlignValue(value) || !options.alignments.includes(value)) {
        return () => false
      }

      return createSetTextAlignCommand(value, options)
    },
    unsetTextAlign: () => createUnsetTextAlignCommand(options),
    toggleTextAlign: (value: TextAlignValue) => createToggleTextAlignCommand(value, options),
  }) as TextAlignCommandsExtension
}

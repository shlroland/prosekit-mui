import {
  addMark,
  defineCommands,
  defineMarkSpec,
  removeMark,
  union,
  type Extension,
} from 'prosekit/core'

export type TextBackgroundColorSpecExtension = Extension<{
  Marks: {
    textBackgroundColor: {
      value: string
    }
  }
}>

export function defineTextBackgroundColorSpec(): TextBackgroundColorSpecExtension {
  return defineMarkSpec<'textBackgroundColor', { value: string }>({
    name: 'textBackgroundColor',
    attrs: {
      value: { default: undefined },
    },
    parseDOM: [
      {
        style: 'background-color',
        getAttrs: (value: string) => {
          return typeof value === 'string' && value ? { value } : false
        },
      },
      {
        tag: 'span[data-text-background-color]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          return {
            value:
              node.dataset.textBackgroundColor || node.style.backgroundColor || null,
          }
        },
      },
    ],
    toDOM: (node) => {
      const value = node.attrs.value
      const backgroundColor = typeof value === 'string' && value ? value : null

      return [
        'span',
        backgroundColor
          ? {
              'data-text-background-color': backgroundColor,
              style: `background-color:${backgroundColor};`,
            }
          : {},
        0,
      ]
    },
  })
}

export type TextBackgroundColorCommandsExtension = Extension<{
  Commands: {
    setTextBackgroundColor: [string]
    unsetTextBackgroundColor: []
  }
}>

export function defineTextBackgroundColorCommands(): TextBackgroundColorCommandsExtension {
  const setBackgroundColorCommand = (value: string) =>
    addMark({
      type: 'textBackgroundColor',
      attrs: {
        value,
      },
    })

  const unsetBackgroundColorCommand = () =>
    removeMark({ type: 'textBackgroundColor' })

  return defineCommands({
    setTextBackgroundColor: setBackgroundColorCommand,
    unsetTextBackgroundColor: unsetBackgroundColorCommand,
  }) as TextBackgroundColorCommandsExtension
}

export function defineTextBackgroundColorExtension() {
  return union(
    defineTextBackgroundColorSpec(),
    defineTextBackgroundColorCommands(),
  )
}

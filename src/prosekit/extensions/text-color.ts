import {
  addMark,
  defineCommands,
  defineMarkSpec,
  removeMark,
  union,
  type Extension,
} from 'prosekit/core'

export type TextColorSpecExtension = Extension<{
  Marks: {
    textColor: {
      value: string
    }
  }
}>

export function defineTextColorSpec(): TextColorSpecExtension {
  return defineMarkSpec<'textColor', { value: string }>({
    name: 'textColor',
    attrs: {
      value: { default: undefined },
    },
    parseDOM: [
      {
        style: 'color',
        getAttrs: (value: string) => {
          return typeof value === 'string' && value ? { value } : false
        },
      },
      {
        tag: 'span[data-text-color]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          return { value: node.dataset.textColor || node.style.color || null }
        },
      },
    ],
    toDOM: (node) => {
      const value = node.attrs.value
      const textColor = typeof value === 'string' && value ? value : null

      return [
        'span',
        textColor ? { 'data-text-color': textColor, style: `color:${textColor};` } : {},
        0,
      ]
    },
  })
}

export type TextColorCommandsExtension = Extension<{
  Commands: {
    setTextColor: [string]
    unsetTextColor: []
  }
}>

export function defineTextColorCommands(): TextColorCommandsExtension {
  const setTextColorCommand = (value: string) =>
    addMark({
      type: 'textColor',
      attrs: {
        value,
      },
    })

  const unsetTextColorCommand = () => removeMark({ type: 'textColor' })

  return defineCommands({
    setTextColor: setTextColorCommand,
    unsetTextColor: unsetTextColorCommand,
  }) as TextColorCommandsExtension
}

export function defineTextColorExtension() {
  return union(defineTextColorSpec(), defineTextColorCommands())
}

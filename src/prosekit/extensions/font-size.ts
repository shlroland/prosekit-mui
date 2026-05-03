import {
  addMark,
  defineCommands,
  defineMarkSpec,
  removeMark,
  union,
  type Extension,
} from 'prosekit/core'

/**
 * @internal
 */
export type FontSizeSpecExtension = Extension<{
  Marks: {
    fontSize: {
      value: string | number
    }
  }
}>

export function defineFontSizeSpec(): FontSizeSpecExtension {
  return defineMarkSpec<'fontSize', { value: number }>({
    name: 'fontSize',
    attrs: {
      value: { default: undefined },
    },
    parseDOM: [
      {
        style: 'font-size',
        getAttrs: (value: string) => {
          return typeof value === 'string' && value ? { value } : false
        },
      },
      {
        tag: 'span[data-font-size]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false
          }

          return { value: node.dataset.fontSize || node.style.fontSize || null }
        },
      },
    ],
    toDOM: (node) => {
      const value = node.attrs.value
      const fontSize =
        typeof value === 'number' ? `${value}px` : typeof value === 'string' ? value : null

      return [
        'span',
        fontSize ? { 'data-font-size': fontSize, style: `font-size:${fontSize};` } : {},
        0,
      ]
    },
  })
}

/**
 * @internal
 */
export type FontSizeCommandsExtension = Extension<{
  Commands: {
    setFontSize: [string | number]
    unsetFontSize: []
  }
}>

/**
 * @internal
 */
export function defineFontSizeCommands(): FontSizeCommandsExtension {
  return defineCommands({
    setFontSize: (value: string | number) =>
      addMark({
        type: 'fontSize',
        attrs: {
          value: typeof value === 'number' ? `${value}px` : value,
        },
      }),
    unsetFontSize: () => removeMark({ type: 'fontSize' }),
  }) as FontSizeCommandsExtension
}

export function defineFontSizeExtension() {
  return union(defineFontSizeSpec(), defineFontSizeCommands())
}

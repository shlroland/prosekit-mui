import { defineKeymap, toggleMark } from 'prosekit/core'

export function defineHighlightKeymap() {
  return defineKeymap({
    'Mod-Shift-h': toggleMark({ type: 'highlight' }),
  })
}

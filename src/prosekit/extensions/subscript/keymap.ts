import { defineKeymap, toggleMark } from 'prosekit/core'

export function defineSubscriptKeymap() {
  return defineKeymap({
    'Mod-,': toggleMark({ type: 'subscript' }),
  })
}

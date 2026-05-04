import { defineKeymap, toggleMark } from 'prosekit/core'

export function defineSuperscriptKeymap() {
  return defineKeymap({
    'Mod-.': toggleMark({ type: 'superscript' }),
  })
}

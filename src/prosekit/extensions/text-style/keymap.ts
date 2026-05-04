import { defineKeymap } from 'prosekit/core'

import { createSetTextStyleCommand } from './commands'

export function defineTextStyleKeymap() {
  return defineKeymap({
    'Mod-Alt-t': createSetTextStyleCommand({ verticalAlign: 'top' }),
    'Mod-Alt-m': createSetTextStyleCommand({ verticalAlign: 'middle' }),
    'Mod-Alt-b': createSetTextStyleCommand({ verticalAlign: 'bottom' }),
  })
}

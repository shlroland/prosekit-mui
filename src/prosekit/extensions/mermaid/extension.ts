import { union } from 'prosekit/core'

import { defaultMermaidTemplate, defineMermaidCommands } from './commands'
import type { MermaidExtension, MermaidExtensionOptions } from './types'

export function defineMermaidExtension(options: MermaidExtensionOptions = {}): MermaidExtension {
  return union(
    defineMermaidCommands(options.defaultSource ?? defaultMermaidTemplate),
  ) as MermaidExtension
}

export { defaultMermaidTemplate } from './commands'

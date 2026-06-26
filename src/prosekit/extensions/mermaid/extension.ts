import { union } from 'prosekit/core'

import { defaultMermaidTemplate, defineMermaidCommands } from './commands'
import { defineMermaidSyntaxHighlight } from './syntax-highlight'
import type { MermaidExtension, MermaidExtensionOptions } from './types'

export function defineMermaidExtension(options: MermaidExtensionOptions = {}): MermaidExtension {
  return union(
    defineMermaidCommands(options.defaultSource ?? defaultMermaidTemplate),
    defineMermaidSyntaxHighlight(),
  ) as MermaidExtension
}

export { defaultMermaidTemplate } from './commands'

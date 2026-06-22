import { union } from 'prosekit/core'

import { defineImageCommands } from './commands'
import { defineImageNodeView } from './node-view'
import { defineImagePasteExtension } from './paste'
import { defineImageSpec } from './spec'
import type { ImageExtension, ImageExtensionOptions } from './types'

export function defineImageExtension(options: ImageExtensionOptions = {}): ImageExtension {
  return union(
    defineImageSpec(options),
    defineImageCommands(),
    defineImagePasteExtension(options),
    defineImageNodeView(options),
  ) as ImageExtension
}

import { union } from 'prosekit/core'

import { defineImageNodeView } from './node-view'
import { defineImageSpec } from './spec'
import type { ImageExtension, ImageExtensionOptions } from './types'

import './view.css'

export function defineImageExtension(options: ImageExtensionOptions = {}): ImageExtension {
  return union(
    defineImageSpec(),
    defineImageNodeView(options),
  ) as ImageExtension
}

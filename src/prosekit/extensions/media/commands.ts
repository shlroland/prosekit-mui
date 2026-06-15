import { defineCommands, insertNode } from 'prosekit/core'

import type {
  AudioAttrs,
  MediaCommandsExtension,
  VideoAttrs,
} from './types'

export function defineMediaCommands(): MediaCommandsExtension {
  return defineCommands({
    insertVideo: (attrs?: VideoAttrs) => insertNode({
      type: 'video',
      attrs: {
        src: attrs?.src || '',
        width: attrs?.width || '100%',
      },
    }),
    insertAudio: (attrs?: AudioAttrs) => insertNode({
      type: 'audio',
      attrs: {
        src: attrs?.src || '',
      },
    }),
  }) as MediaCommandsExtension
}

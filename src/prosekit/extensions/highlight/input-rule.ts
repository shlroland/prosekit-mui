import type { PlainExtension } from 'prosekit/core'
import { defineMarkInputRule } from 'prosekit/extensions/input-rule'

import { highlightInputRegex } from './shared'

export function defineHighlightInputRule(): PlainExtension {
  return defineMarkInputRule({
    regex: highlightInputRegex,
    type: 'highlight',
  })
}

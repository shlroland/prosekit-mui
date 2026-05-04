import { canUseRegexLookbehind } from 'prosekit/core'

import type { HighlightAttrs, HighlightOptions } from './types'

export const highlightInputRegex = canUseRegexLookbehind()
  ? /(?<=\s|^)==([^=\s](?:[^=]*[^=\s])?)==$/
  : /==([^=\s](?:[^=]*[^=\s])?)==$/

export const highlightPasteRegex = /==([^=\s](?:[^=]*[^=\s])?)==/g

export function getHighlightDomAttrs(
  attrs: HighlightAttrs,
  options: Required<HighlightOptions>,
) {
  if (!options.multicolor || !attrs.color) {
    return {}
  }

  return {
    'data-color': attrs.color,
    style: `background-color:${attrs.color};color:inherit;`,
  }
}

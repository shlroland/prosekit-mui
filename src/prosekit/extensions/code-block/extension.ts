import { union } from 'prosekit/core'
import {
  defineCodeBlockPreviewPlugin,
  defineCodeBlockShiki,
} from 'prosekit/extensions/code-block'

import { defineCodeBlockNodeView } from './node-view'
import {
  defaultCodeBlockLanguages,
  defaultCodeBlockLanguageOptions,
  defaultCodeBlockTheme,
} from './languages'
import type { CodeBlockExtension, CodeBlockExtensionOptions } from './types'

export {
  defaultCodeBlockLanguages,
  defaultCodeBlockLanguageOptions,
  defaultCodeBlockTheme,
} from './languages'

export function defineCodeBlockExtension(
  options: CodeBlockExtensionOptions = {},
): CodeBlockExtension {
  const {
    enablePreview,
    themes,
    langs,
    nodeTypes,
    engine,
    ...rest
  } = options

  const shikiExtension = defineCodeBlockShiki({
    themes: themes ?? [defaultCodeBlockTheme],
    langs: langs ?? defaultCodeBlockLanguages,
    nodeTypes: nodeTypes ?? ['codeBlock'],
    engine,
    ...rest,
  })

  if (enablePreview === false) {
    return union(
      shikiExtension,
      defineCodeBlockNodeView(),
    ) as CodeBlockExtension
  }

  return union(
    shikiExtension,
    defineCodeBlockPreviewPlugin(),
    defineCodeBlockNodeView(),
  ) as CodeBlockExtension
}

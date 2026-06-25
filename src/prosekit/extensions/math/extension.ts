import { definePlugin, union } from 'prosekit/core'
import type { PlainExtension } from 'prosekit/core'
import {
  defineMathBlockEnterRule,
  defineMathBlockSpec,
  defineMathInlineInputRule,
  defineMathInlineSpec,
  defineMathPlugin,
} from 'prosekit/extensions/math'
import { keymap } from 'prosekit/pm/keymap'
import katex from 'katex'

import { defaultBlockMathTemplate, defaultInlineMathTemplate, defineMathCommands, setMathBlock, setMathInline } from './commands'
import { defineMathNodeView } from './node-view'
import type { MathExtension, MathExtensionOptions } from './types'

import 'katex/dist/katex.min.css'
import './view.css'

function renderKatexMath(
  text: string,
  element: HTMLElement,
  displayMode: boolean,
  options?: MathExtensionOptions['katexOptions'],
) {
  element.innerHTML = ''
  element.dataset.mathEmpty = text.trim() ? 'false' : 'true'
  element.dataset.mathError = 'false'

  if (!text.trim()) {
    return
  }

  try {
    katex.render(text, element, {
      displayMode,
      errorColor: '#b91c1c',
      output: 'htmlAndMathml',
      throwOnError: false,
      strict: 'ignore',
      ...options,
    })
  } catch {
    element.dataset.mathError = 'true'
    element.textContent = text
  }
}

function defineMathKeymap(): PlainExtension {
  return definePlugin(keymap({
    'Mod-6': setMathInline(),
    'Mod-7': setMathBlock(),
  }))
}

export function defineMathExtension(options: MathExtensionOptions = {}): MathExtension {
  return union(
    defineMathInlineSpec(),
    defineMathBlockSpec(),
    defineMathInlineInputRule(),
    defineMathBlockEnterRule(),
    defineMathPlugin(),
    defineMathCommands({
      inlineTemplate: options.inlineTemplate ?? defaultInlineMathTemplate,
      blockTemplate: options.blockTemplate ?? defaultBlockMathTemplate,
    }),
    defineMathKeymap(),
    ...defineMathNodeView({
      renderMathInline: (text, element) => {
        renderKatexMath(text, element, false, options.katexOptions)
      },
      renderMathBlock: (text, element) => {
        renderKatexMath(text, element, true, options.katexOptions)
      },
    }),
  ) as MathExtension
}

export {
  defaultBlockMathTemplate,
  defaultInlineMathTemplate,
} from './commands'

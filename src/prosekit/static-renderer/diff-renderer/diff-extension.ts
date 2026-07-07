import { defineMarkSpec, defineNodeSpec, union } from 'prosekit/core'

export type StaticDiffKind = 'insert' | 'modify'

export type StaticDiffInlineAttrs = {
  kind: StaticDiffKind
}

export type StaticDiffDeleteAttrs = {
  text: string
}

export function defineStaticDiffExtension() {
  return union(
    defineMarkSpec<'diffInsert'>({
      name: 'diffInsert',
      inclusive: false,
      parseDOM: [{ tag: 'span[data-diff="insert"]' }],
      toDOM: () => ['span', { class: 'prosekit-diff-insert', 'data-diff': 'insert' }, 0],
    }),
    defineMarkSpec<'diffModify'>({
      name: 'diffModify',
      inclusive: false,
      parseDOM: [{ tag: 'span[data-diff="modify"]' }],
      toDOM: () => ['span', { class: 'prosekit-diff-modify', 'data-diff': 'modify' }, 0],
    }),
    defineNodeSpec<'diffInline', StaticDiffInlineAttrs>({
      name: 'diffInline',
      group: 'inline',
      inline: true,
      content: 'inline*',
      attrs: {
        kind: { default: 'insert', validate: 'string' },
      },
      parseDOM: [
        {
          tag: 'span[data-diff-inline]',
          getAttrs: (dom) => ({
            kind: dom.getAttribute('data-diff-inline') === 'modify' ? 'modify' : 'insert',
          }),
        },
      ],
      toDOM: (node) => {
        const kind = node.attrs.kind === 'modify' ? 'modify' : 'insert'
        const className = kind === 'modify' ? 'prosekit-diff-modify' : 'prosekit-diff-insert'

        return ['span', { class: className, 'data-diff-inline': kind }, 0]
      },
    }),
    defineNodeSpec<'diffDeleteInline', StaticDiffDeleteAttrs>({
      name: 'diffDeleteInline',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: false,
      attrs: {
        text: { default: '', validate: 'string' },
      },
      parseDOM: [
        {
          tag: 'span[data-diff-delete-inline]',
          getAttrs: (dom) => ({ text: dom.textContent || '' }),
        },
      ],
      toDOM: (node) => {
        const text = String(node.attrs.text || '')

        return ['span', {
          class: 'prosekit-diff-delete',
          'data-diff-delete-inline': 'true',
          title: `删除的内容: ${text}`,
        }, text]
      },
    }),
    defineNodeSpec<'diffBlock', StaticDiffInlineAttrs>({
      name: 'diffBlock',
      group: 'block',
      content: 'block*',
      attrs: {
        kind: { default: 'insert', validate: 'string' },
      },
      parseDOM: [
        {
          tag: 'div[data-diff-block]',
          getAttrs: (dom) => ({
            kind: dom.getAttribute('data-diff-block') === 'modify' ? 'modify' : 'insert',
          }),
        },
      ],
      toDOM: (node) => {
        const kind = node.attrs.kind === 'modify' ? 'modify' : 'insert'
        const className = kind === 'modify' ? 'prosekit-diff-modify-node' : 'prosekit-diff-insert-node'

        return ['div', { class: className, 'data-diff-block': kind }, 0]
      },
    }),
    defineNodeSpec<'diffDeleteBlock', StaticDiffDeleteAttrs>({
      name: 'diffDeleteBlock',
      group: 'block',
      atom: true,
      selectable: false,
      attrs: {
        text: { default: '', validate: 'string' },
      },
      parseDOM: [
        {
          tag: 'div[data-diff-delete-block]',
          getAttrs: (dom) => ({ text: dom.textContent || '' }),
        },
      ],
      toDOM: (node) => {
        const text = String(node.attrs.text || '')

        return ['div', {
          class: 'prosekit-diff-delete',
          'data-diff-delete-block': 'true',
          title: `删除的内容: ${text}`,
        }, text]
      },
    }),
  )
}

import { union } from 'prosekit/core'
import { type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderToReactElement } from 'prosekit-static-renderer/react'

import { cn } from '../../../utils/cn'
import { createBuiltinReactMarkMapping, createBuiltinReactNodeMapping, type ProseKitReactRendererOptions } from '../react-renderer'
import { defineStaticRichTextExtension } from '../extension'
import { createStaticDiffDocument, createStaticDiffDocumentFromResult } from './diff-document'
import { defineStaticDiffExtension } from './diff-extension'
import {
  editorDiff,
  type EditorDiffInput,
  type EditorDiffOptions,
  type EditorDiffResult,
} from './editor-diff'

export {
  createStaticDiffDocument,
  createStaticDiffDocumentFromResult,
} from './diff-document'
export {
  defineStaticDiffExtension,
} from './diff-extension'
export {
  editorDiff,
  normalizeEditorDiffInput,
} from './editor-diff'
export type {
  EditorDiffInput,
  EditorDiffOptions,
  EditorDiffResult,
} from './editor-diff'

export type StaticEditorDiffOptions =
  & EditorDiffOptions
  & ProseKitReactRendererOptions
  & {
    className?: string
  }

export type StaticEditorDiffViewProps = {
  oldContent: EditorDiffInput
  newContent: EditorDiffInput
  options?: StaticEditorDiffOptions
  className?: string
}

function renderDeleteNode(text: unknown, isBlock = false): ReactElement {
  const value = typeof text === 'string' ? text : ''
  const Component = isBlock ? 'div' : 'span'

  return (
    <Component
      className="prosekit-diff-delete"
      title={`删除的内容: ${value}`}
      data-diff-delete={isBlock ? 'block' : 'inline'}
    >
      {value || '[已删除]'}
    </Component>
  )
}

function renderDiffContent(
  comparison: EditorDiffResult,
  options: StaticEditorDiffOptions = {},
): ReactNode {
  const diffDoc = createStaticDiffDocumentFromResult(comparison, options)
  const extension = union(
    defineStaticRichTextExtension(options),
    defineStaticDiffExtension(),
  )

  return renderToReactElement({
    extension,
    content: diffDoc,
    sanitizeURL: options.sanitizeURL,
    nodeMapping: {
      ...createBuiltinReactNodeMapping(options),
      diffInline: ({ node, children }) => {
        const kind = node.attrs.kind === 'modify' ? 'modify' : 'insert'
        return (
          <span className={kind === 'modify' ? 'prosekit-diff-modify' : 'prosekit-diff-insert'} data-diff-inline={kind}>
            {children}
          </span>
        )
      },
      diffDeleteInline: ({ node }) => renderDeleteNode(node.attrs.text),
      diffBlock: ({ node, children }) => {
        const kind = node.attrs.kind === 'modify' ? 'modify' : 'insert'
        return (
          <div className={kind === 'modify' ? 'prosekit-diff-modify-node' : 'prosekit-diff-insert-node'} data-diff-block={kind}>
            {children}
          </div>
        )
      },
      diffDeleteBlock: ({ node }) => renderDeleteNode(node.attrs.text, true),
      ...options.nodeMapping,
    },
    markMapping: {
      ...createBuiltinReactMarkMapping(),
      diffInsert: ({ children }) => <span className="prosekit-diff-insert" data-diff="insert">{children}</span>,
      diffModify: ({ children }) => <span className="prosekit-diff-modify" data-diff="modify">{children}</span>,
      ...options.markMapping,
    },
    unhandledNode: options.unhandledNode,
    unhandledMark: options.unhandledMark,
  })
}

export function renderEditorDiffReact(
  oldContent: EditorDiffInput,
  newContent: EditorDiffInput,
  options: StaticEditorDiffOptions = {},
): ReactElement {
  return renderEditorDiffResultReact(editorDiff(oldContent, newContent, options), options)
}

export function renderEditorDiffResultReact(
  comparison: EditorDiffResult,
  options: StaticEditorDiffOptions = {},
): ReactElement {
  return (
    <div
      className={cn(
        'ProseMirror prosekit-static-renderer prosekit-static-diff-renderer',
        options.className,
      )}
      data-static-renderer="true"
      data-static-diff-renderer="true"
    >
      {renderDiffContent(comparison, options)}
    </div>
  )
}

export function renderEditorDiffHTML(
  oldContent: EditorDiffInput,
  newContent: EditorDiffInput,
  options: StaticEditorDiffOptions = {},
): string {
  return renderToStaticMarkup(renderEditorDiffReact(oldContent, newContent, options))
}

export function renderEditorDiffResultHTML(
  comparison: EditorDiffResult,
  options: StaticEditorDiffOptions = {},
): string {
  return renderToStaticMarkup(renderEditorDiffResultReact(comparison, options))
}

export function StaticEditorDiffView({
  oldContent,
  newContent,
  options,
  className,
}: StaticEditorDiffViewProps): ReactElement {
  return renderEditorDiffReact(oldContent, newContent, {
    ...options,
    className: cn(options?.className, className),
  })
}

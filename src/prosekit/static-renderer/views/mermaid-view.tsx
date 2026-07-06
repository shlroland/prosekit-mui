import { renderMermaidSVG } from 'beautiful-mermaid'

import type { StaticNodeViewProps } from './types'
import { getStaticTextContent } from './utils'
import { renderHighlightedCodeBlockHTML } from './shiki-highlight'

export type StaticMermaidRenderResult = {
  svg: string | null
  error: string | null
}

export function renderStaticMermaid(source: string): StaticMermaidRenderResult {
  const trimmedSource = source.trim()

  if (!trimmedSource) {
    return {
      svg: null,
      error: null,
    }
  }

  try {
    return {
      svg: renderMermaidSVG(trimmedSource, {
        bg: 'var(--editor-surface)',
        fg: 'var(--editor-foreground)',
        line: 'var(--editor-border)',
        accent: 'var(--editor-primary)',
        muted: 'var(--editor-muted-foreground)',
        surface: 'var(--editor-surface-muted)',
        border: 'var(--editor-border)',
        font: 'Roboto',
        transparent: true,
      }),
      error: null,
    }
  } catch (error) {
    return {
      svg: null,
      error: error instanceof Error ? error.message : '无法渲染 Mermaid 图表。',
    }
  }
}

export function StaticMermaidView({ children }: StaticNodeViewProps) {
  const source = getStaticTextContent(children)
  const preview = renderStaticMermaid(source)

  return (
    <figure
      className="prosekit-static-mermaid pk:my-4 pk:overflow-hidden pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]"
      data-language="mermaid"
      data-static-renderer="true"
    >
      <div className="pk:border-b pk:border-[var(--editor-border)] pk:px-4 pk:py-2 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">
        Mermaid
      </div>
      <div className="pk:bg-[var(--editor-surface-muted)] pk:p-4">
        {preview.error ? (
          <div className="pk:rounded-lg pk:border pk:border-[color:rgb(220_38_38_/_0.18)] pk:bg-[color:rgb(220_38_38_/_0.08)] pk:p-3 pk:text-sm pk:text-[color:rgb(153_27_27)]">
            <div className="pk:mb-1 pk:font-medium">Mermaid 语法错误</div>
            <pre className="pk:m-0 pk:whitespace-pre-wrap pk:bg-transparent pk:p-0 pk:text-[13px] pk:leading-6 pk:text-inherit">{preview.error}</pre>
          </div>
        ) : preview.svg ? (
          <div
            className="pk:overflow-auto pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4"
            dangerouslySetInnerHTML={{ __html: preview.svg }}
          />
        ) : (
          <div className="pk:flex pk:min-h-[144px] pk:items-center pk:justify-center pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-6 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
            空 Mermaid 图表
          </div>
        )}
      </div>
      <details
        className="prosekit-static-mermaid-source pk:border-t pk:border-[var(--editor-border)]"
        data-static-mermaid-source="true"
      >
        <summary className="pk:cursor-pointer pk:px-4 pk:py-2 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)]">
          Mermaid 源码
        </summary>
        <div dangerouslySetInnerHTML={{ __html: renderHighlightedCodeBlockHTML(source, 'mermaid') }} />
      </details>
    </figure>
  )
}

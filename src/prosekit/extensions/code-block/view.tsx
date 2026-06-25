import { renderMermaidSVG } from 'beautiful-mermaid'
import type { ReactNodeViewProps } from 'prosekit/react'
import { TextSelection } from 'prosekit/pm/state'
import { useMemo, useState, type FocusEvent, type ReactNode } from 'react'

import { CodeLineIcon, EyeLineIcon, SplitCellsHorizontalIcon } from '../../../icons'
import { cn } from '../../../utils/cn'

type MermaidLayoutMode = 'auto' | 'split'

type MermaidRenderState = {
  svg: string | null
  error: string | null
}

function renderMermaidPreview(source: string): MermaidRenderState {
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

function PreviewModeButton({
  active,
  label,
  title,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  title: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onClick={onClick}
      className={cn(
        'pk:inline-flex pk:h-8 pk:min-w-0 pk:items-center pk:justify-center pk:gap-1.5 pk:rounded-md pk:px-2.5 pk:text-[var(--editor-muted-foreground)] pk:transition-colors',
        'pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]',
        active && 'pk:bg-[var(--editor-primary-soft)] pk:text-[var(--editor-primary)]',
      )}
    >
      <span className="pk:inline-flex pk:h-4 pk:w-4 pk:items-center pk:justify-center">
        {icon}
      </span>
      <span className="pk:text-xs pk:font-medium">{label}</span>
    </button>
  )
}

export function CodeBlockView({
  node,
  contentRef,
  selected,
  view,
  getPos,
}: ReactNodeViewProps) {
  const language = typeof node.attrs.language === 'string' && node.attrs.language
    ? node.attrs.language
    : 'text'
  const isMermaid = language === 'mermaid'
  const source = node.textContent
  const lineCount = source.trim() ? source.trim().split('\n').length : 0
  const [layoutMode, setLayoutMode] = useState<MermaidLayoutMode>('auto')
  const [hasDomFocus, setHasDomFocus] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const preview = useMemo(() => {
    return isMermaid ? renderMermaidPreview(source) : { svg: null, error: null }
  }, [isMermaid, source])

  if (!isMermaid) {
    return (
      <pre data-language={language || undefined}>
        <code
          ref={contentRef}
          className={language ? `language-${language}` : undefined}
        />
      </pre>
    )
  }

  const nodePos = getPos()
  const selectionFrom = view.state.selection.from
  const selectionTo = view.state.selection.to
  const isSelectionInside = typeof nodePos === 'number'
    && selectionFrom >= nodePos
    && selectionTo <= nodePos + node.nodeSize
  const isActive = selected || isSelectionInside || hasDomFocus
  const isEditing = hasDomFocus && (selected || isSelectionInside)
  const showCode = layoutMode === 'split' || isEditing
  const showPreview = layoutMode === 'split' || !isEditing
  const showSplit = layoutMode === 'split'
  const showControls = isHovered || isActive || showSplit

  function focusCodeBlock() {
    if (typeof nodePos !== 'number') {
      return
    }

    setHasDomFocus(true)

    const resolvedPos = view.state.doc.resolve(Math.min(view.state.doc.content.size, nodePos + 2))
    const tr = view.state.tr.setSelection(TextSelection.near(resolvedPos))
    view.dispatch(tr.scrollIntoView())
    view.focus()
  }

  function exitEditing() {
    setLayoutMode('auto')
    setHasDomFocus(false)

    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement) {
      activeElement.blur()
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    setHasDomFocus(false)
  }

  return (
    <div
      className={cn(
        'pk:relative pk:my-4 pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)]',
        selected && 'pk:ring-2 pk:ring-[var(--editor-ring)]/30',
      )}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
      onFocusCapture={() => {
        setHasDomFocus(true)
      }}
      onBlurCapture={handleBlur}
    >
      <div
        contentEditable={false}
        data-code-block-controls="true"
        className={cn(
          'pk:absolute pk:right-3 pk:top-3 pk:z-10 pk:flex pk:flex-wrap pk:items-center pk:justify-end pk:gap-2 pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1.5 pk:shadow-sm pk:transition-all',
          showControls
            ? 'pk:pointer-events-auto pk:translate-y-0 pk:opacity-100'
            : 'pk:pointer-events-none pk:translate-y-1 pk:opacity-0',
        )}
      >
        <div className="pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-1">
          <PreviewModeButton
            active={!showSplit && !isEditing}
            label="预览"
            title="退出编辑并查看预览"
            icon={<EyeLineIcon className="pk:h-4 pk:w-4" />}
            onClick={() => {
              exitEditing()
            }}
          />
          <PreviewModeButton
            active={showSplit}
            label="分屏"
            title="分屏查看"
            icon={<SplitCellsHorizontalIcon className="pk:h-4 pk:w-4" />}
            onClick={() => {
              setLayoutMode('split')
              focusCodeBlock()
            }}
          />
          <PreviewModeButton
            active={!showSplit && isEditing}
            label="编辑"
            title="进入源码编辑"
            icon={<CodeLineIcon className="pk:h-4 pk:w-4" />}
            onClick={() => {
              setLayoutMode('auto')
              focusCodeBlock()
            }}
          />
        </div>
      </div>

      <div
        className={cn(
          'pk:grid pk:min-h-[220px] pk:w-full',
          showSplit ? 'pk:grid-cols-1 xl:pk:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]' : 'pk:grid-cols-1',
        )}
      >
        {showCode ? (
          <div className={cn('pk:min-w-0 pk:bg-[var(--editor-surface)] pk:pt-12', showPreview && 'xl:pk:border-r xl:pk:border-[var(--editor-border)]')}>
            <pre
              data-language={language || undefined}
              className="pk:min-h-[176px]"
              style={{
                margin: 0,
                border: 0,
                borderRadius: 0,
                background: 'transparent',
                boxShadow: 'none',
                padding: '1rem',
              }}
            >
              <code
                ref={contentRef}
                className={language ? `language-${language}` : undefined}
              />
            </pre>
            <div
              contentEditable={false}
              className="pk:px-4 pk:pb-3 pk:text-[11px] pk:text-[var(--editor-muted-foreground)]"
            >
              {lineCount} lines
            </div>
          </div>
        ) : null}

        {!showCode ? (
          <div className="pk:absolute pk:left-0 pk:top-0 pk:h-0 pk:w-0 pk:overflow-hidden pk:opacity-0 pk:pointer-events-none">
            <pre
              data-language={language || undefined}
              aria-hidden="true"
              style={{
                margin: 0,
                border: 0,
                padding: 0,
              }}
            >
              <code
                ref={contentRef}
                className={language ? `language-${language}` : undefined}
              />
            </pre>
          </div>
        ) : null}

        {showPreview ? (
          <div className="pk:min-w-0 pk:bg-[var(--editor-surface-muted)] pk:pt-3">
            <div
              contentEditable={false}
              className="pk:flex pk:min-h-[176px] pk:items-start pk:justify-center pk:p-4"
              onClick={() => {
                if (!showSplit) {
                  focusCodeBlock()
                }
              }}
            >
              {preview.error ? (
                <div className="pk:w-full pk:rounded-lg pk:border pk:border-[color:rgb(220_38_38_/_0.18)] pk:bg-[color:rgb(220_38_38_/_0.08)] pk:p-3 pk:text-sm pk:text-[color:rgb(153_27_27)]">
                  <div className="pk:mb-1 pk:font-medium">Mermaid 语法错误</div>
                  <pre className="pk:m-0 pk:whitespace-pre-wrap pk:bg-transparent pk:p-0 pk:text-[13px] pk:leading-6 pk:text-inherit">{preview.error}</pre>
                </div>
              ) : preview.svg ? (
                <div
                  className="pk:w-full pk:overflow-auto pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-4 pk:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  dangerouslySetInnerHTML={{ __html: preview.svg }}
                />
              ) : (
                <div className="pk:flex pk:min-h-[144px] pk:w-full pk:items-center pk:justify-center pk:rounded-lg pk:border pk:border-dashed pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-6 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
                  输入 Mermaid 图表源码后，这里会显示 SVG 预览。
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

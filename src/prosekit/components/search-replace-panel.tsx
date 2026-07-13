import { SearchQuery, getSearchState, setSearchState, type SearchResult } from 'prosemirror-search'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import {
  ArrowDownSLineIcon,
  CloseCircleFillIcon,
  Repeat2LineIcon,
} from '../../icons'
import { cn } from '../../utils/cn'
import { Tooltip } from '../../ui'

type SearchPanelQuery = {
  search: string
  replace: string
  caseSensitive: boolean
  regexp: boolean
  wholeWord: boolean
}

type SearchPanelSnapshot = SearchPanelQuery & {
  activeIndex: number
  count: number
  valid: boolean
}

type SearchPanelPosition = {
  top: number
  right: number
  width: number
}

export type SearchReplacePanelAnchor = HTMLElement | null | (() => HTMLElement | null)

const emptyQuery: SearchPanelQuery = {
  search: '',
  replace: '',
  caseSensitive: false,
  regexp: false,
  wholeWord: false,
}

const emptySnapshot: SearchPanelSnapshot = {
  ...emptyQuery,
  activeIndex: 0,
  count: 0,
  valid: false,
}

function createSearchQuery(query: SearchPanelQuery) {
  return new SearchQuery({
    search: query.search,
    replace: query.replace,
    caseSensitive: query.caseSensitive,
    regexp: query.regexp,
    wholeWord: query.wholeWord,
    literal: true,
  })
}

function isSameSearchResult(a: SearchResult, b: { from: number, to: number }) {
  return a.from === b.from && a.to === b.to
}

export function getSearchMatches(state: any, query: SearchQuery) {
  const matches: SearchResult[] = []
  if (!query.valid) {
    return matches
  }

  let from = 0
  const to = state.doc.content.size

  while (from <= to) {
    const result = query.findNext(state, from, to)
    if (!result) {
      break
    }

    matches.push(result)
    from = Math.max(result.to, result.from + 1)
  }

  return matches
}

function getSearchPanelSnapshot(editor: any) {
  if (!editor.mounted) {
    return JSON.stringify(emptySnapshot)
  }

  const searchState = getSearchState(editor.state)
  if (!searchState) {
    return JSON.stringify(emptySnapshot)
  }

  const { query } = searchState
  const matches = getSearchMatches(editor.state, query)
  const activeIndex = matches.findIndex((match) => isSameSearchResult(match, editor.state.selection))

  return JSON.stringify({
    search: query.search,
    replace: query.replace,
    caseSensitive: query.caseSensitive,
    regexp: query.regexp,
    wholeWord: query.wholeWord,
    valid: query.valid,
    count: matches.length,
    activeIndex: activeIndex >= 0 ? activeIndex + 1 : 0,
  } satisfies SearchPanelSnapshot)
}

function getSelectedText(editor: any) {
  const { state } = editor
  const { from, to, empty } = state.selection
  if (empty || from === to) {
    return ''
  }

  return state.doc.textBetween(from, to, '\n')
}

function resolveSearchPanelAnchor(anchor: SearchReplacePanelAnchor | undefined) {
  return typeof anchor === 'function' ? anchor() : anchor
}

function getSearchPanelPosition(editor: any, anchor?: SearchReplacePanelAnchor): SearchPanelPosition {
  const viewportWidth = window.innerWidth
  const fallbackRight = 16
  const fallbackTop = 16
  const fallbackWidth = Math.min(420, viewportWidth - fallbackRight * 2)
  const anchorElement = resolveSearchPanelAnchor(anchor)

  if (!editor.mounted && !anchorElement) {
    return {
      top: fallbackTop,
      right: fallbackRight,
      width: fallbackWidth,
    }
  }

  const rect = anchorElement?.getBoundingClientRect() ?? (editor.mounted ? editor.view.dom.getBoundingClientRect() : null)
  if (!rect) {
    return {
      top: fallbackTop,
      right: fallbackRight,
      width: fallbackWidth,
    }
  }

  const right = Math.max(viewportWidth - rect.right + 12, 16)
  const availableWidth = Math.max(280, Math.min(rect.width - 24, viewportWidth - right - 16))

  return {
    top: Math.max(rect.top + 12, 12),
    right,
    width: Math.min(420, availableWidth),
  }
}

function SearchToggleButton({
  active,
  label,
  children,
  onClick,
}: {
  active: boolean
  label: string
  children: string
  onClick: () => void
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        data-active={active ? '' : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className={cn(
          'pk:flex pk:h-7 pk:min-w-7 pk:items-center pk:justify-center pk:rounded-md pk:border pk:border-transparent pk:px-1.5 pk:text-[11px] pk:font-semibold pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors',
          'pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]',
          'data-[active]:pk:border-[var(--editor-primary)] data-[active]:pk:bg-[var(--editor-primary-soft)] data-[active]:pk:text-[var(--editor-primary)]',
        )}
      >
        {children}
      </button>
    </Tooltip>
  )
}

function SearchIconButton({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string
  disabled?: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className="pk:flex pk:h-7 pk:w-7 pk:items-center pk:justify-center pk:rounded-md pk:border-0 pk:bg-transparent pk:p-0 pk:text-[var(--editor-muted-foreground)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)] disabled:pk:pointer-events-none disabled:pk:opacity-40"
      >
        {children}
      </button>
    </Tooltip>
  )
}

export type SearchReplacePanelProps = {
  anchor?: SearchReplacePanelAnchor
}

export function SearchReplacePanel({ anchor }: SearchReplacePanelProps = {}) {
  const editor = useEditor<any>()
  const snapshotValue = useEditorDerivedValue<any, string>(getSearchPanelSnapshot)
  const snapshot = useMemo(() => JSON.parse(snapshotValue) as SearchPanelSnapshot, [snapshotValue])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState<SearchPanelQuery>(emptyQuery)
  const [position, setPosition] = useState<SearchPanelPosition | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const updateSearchState = useCallback((nextQuery: SearchPanelQuery) => {
    if (!editor.mounted) {
      return
    }

    const searchQuery = createSearchQuery(nextQuery)
    const tr = setSearchState(editor.state.tr, searchQuery)
    editor.view.dispatch(tr)
  }, [editor])

  const openPanel = useCallback(() => {
    const selectedText = editor.mounted ? getSelectedText(editor) : ''
    const nextQuery = selectedText ? { ...query, search: selectedText } : query
    setQuery(nextQuery)
    setPosition(getSearchPanelPosition(editor, anchor))
    setOpen(true)
    updateSearchState(nextQuery)
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [anchor, editor, query, updateSearchState])

  const closePanel = useCallback(() => {
    setOpen(false)
    updateSearchState(emptyQuery)
    editor.focus()
  }, [editor, updateSearchState])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isFind = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'f'
      if (!isFind) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      openPanel()
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [openPanel])

  useEffect(() => {
    if (!open) {
      return
    }

    function updatePosition() {
      setPosition(getSearchPanelPosition(editor, anchor))
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchor, editor, open])

  useEffect(() => {
    if (!open) {
      return
    }

    setQuery({
      search: snapshot.search,
      replace: snapshot.replace,
      caseSensitive: snapshot.caseSensitive,
      regexp: snapshot.regexp,
      wholeWord: snapshot.wholeWord,
    })
  }, [
    open,
    snapshot.caseSensitive,
    snapshot.regexp,
    snapshot.replace,
    snapshot.search,
    snapshot.wholeWord,
  ])

  function updateQuery(patch: Partial<SearchPanelQuery>) {
    const nextQuery = { ...query, ...patch }
    setQuery(nextQuery)
    updateSearchState(nextQuery)
  }

  function runCommand(command: 'findNext' | 'findPrev' | 'replaceCurrent' | 'replaceAll') {
    editor.commands[command]?.()
    searchInputRef.current?.focus()
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(event.shiftKey ? 'findPrev' : 'findNext')
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closePanel()
    }
  }

  if (!open) {
    return null
  }

  const hasSearch = query.search.length > 0
  const controlsDisabled = !hasSearch || !snapshot.valid
  const countLabel = !hasSearch
    ? ''
    : !snapshot.valid
      ? '无效'
      : snapshot.count
        ? `${snapshot.activeIndex || 1}/${snapshot.count}`
        : '无结果'
  const panelStyle: CSSProperties | undefined = position
    ? {
        top: position.top,
        right: position.right,
        width: position.width,
      }
    : undefined

  return (
    <div
      role="dialog"
      aria-label="查找与替换"
      data-editor-floating
      style={panelStyle}
      className="pk:fixed pk:z-[1600] pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:p-2 pk:text-[var(--editor-foreground)] pk:shadow-[0_18px_56px_rgba(15,23,42,0.22)]"
      onMouseDown={(event) => {
        event.stopPropagation()
      }}
    >
      <div className="pk:grid pk:grid-cols-[minmax(0,1fr)_auto] pk:gap-1.5">
        <div className="pk:grid pk:min-w-0 pk:grid-cols-[minmax(0,1fr)_auto] pk:items-center pk:gap-1 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface-muted,var(--editor-surface))] pk:px-2">
          <input
            ref={searchInputRef}
            aria-label="查找"
            value={query.search}
            placeholder="查找"
            onChange={(event) => updateQuery({ search: event.target.value })}
            onKeyDown={handleSearchKeyDown}
            className="pk:h-8 pk:min-w-0 pk:border-0 pk:bg-transparent pk:px-0 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none placeholder:pk:text-[var(--editor-muted-foreground)]"
          />
          <span className="pk:min-w-[48px] pk:text-right pk:text-[11px] pk:leading-none pk:text-[var(--editor-muted-foreground)]">
            {countLabel}
          </span>
        </div>

        <div className="pk:flex pk:items-center pk:gap-1">
          <SearchIconButton label="上一个" disabled={controlsDisabled} onClick={() => runCommand('findPrev')}>
            <ArrowDownSLineIcon className="pk:h-4 pk:w-4 pk:rotate-180" />
          </SearchIconButton>
          <SearchIconButton label="下一个" disabled={controlsDisabled} onClick={() => runCommand('findNext')}>
            <ArrowDownSLineIcon className="pk:h-4 pk:w-4" />
          </SearchIconButton>
          <SearchIconButton label="关闭" onClick={closePanel}>
            <CloseCircleFillIcon className="pk:h-4 pk:w-4" />
          </SearchIconButton>
        </div>

        <div className="pk:grid pk:min-w-0 pk:grid-cols-[minmax(0,1fr)_auto] pk:items-center pk:gap-1 pk:rounded-md pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface-muted,var(--editor-surface))] pk:px-2">
          <input
            aria-label="替换"
            value={query.replace}
            placeholder="替换"
            onChange={(event) => updateQuery({ replace: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                closePanel()
              }
            }}
            className="pk:h-8 pk:min-w-0 pk:border-0 pk:bg-transparent pk:px-0 pk:text-sm pk:text-[var(--editor-foreground)] pk:outline-none placeholder:pk:text-[var(--editor-muted-foreground)]"
          />
          <Repeat2LineIcon className="pk:h-4 pk:w-4 pk:text-[var(--editor-muted-foreground)]" />
        </div>

        <div className="pk:flex pk:items-center pk:gap-1">
          <SearchIconButton label="替换当前" disabled={controlsDisabled} onClick={() => runCommand('replaceCurrent')}>
            <span className="pk:text-[11px] pk:font-semibold">1</span>
          </SearchIconButton>
          <SearchIconButton label="全部替换" disabled={controlsDisabled} onClick={() => runCommand('replaceAll')}>
            <span className="pk:text-[11px] pk:font-semibold">All</span>
          </SearchIconButton>
        </div>
      </div>

      <div className="pk:mt-2 pk:flex pk:flex-wrap pk:items-center pk:gap-1">
        <SearchToggleButton
          active={query.caseSensitive}
          label="区分大小写"
          onClick={() => updateQuery({ caseSensitive: !query.caseSensitive })}
        >
          Aa
        </SearchToggleButton>
        <SearchToggleButton
          active={query.wholeWord}
          label="全词匹配"
          onClick={() => updateQuery({ wholeWord: !query.wholeWord })}
        >
          Ab
        </SearchToggleButton>
        <SearchToggleButton
          active={query.regexp}
          label="使用正则表达式"
          onClick={() => updateQuery({ regexp: !query.regexp })}
        >
          .*
        </SearchToggleButton>
      </div>
    </div>
  )
}

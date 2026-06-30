import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { ArrowDownSLineIcon } from '../../icons/arrow-down-s-line-icon'
import { CheckboxCircleLineIcon } from '../../icons/checkbox-circle-line-icon'
import { CodeBoxLineIcon } from '../../icons/code-box-line-icon'
import { CopyIcon } from '../../icons/copy-icon'
import { defaultCodeBlockLanguageOptions } from '../extensions/code-block'
import { Button, EditorComboboxMenu, Tooltip } from '../../ui'

type ActiveCodeBlockState = {
  language: string
  nodePos: number | null
  open: boolean
  text: string
}

function getActiveCodeBlockState(editor: any): ActiveCodeBlockState {
  if (!editor.mounted || !editor.view.editable) {
    return {
      language: 'text',
      nodePos: null,
      open: false,
      text: '',
    }
  }

  const { $from } = editor.state.selection

  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name !== 'codeBlock') {
      continue
    }

    return {
      language: typeof node.attrs.language === 'string' && node.attrs.language
        ? node.attrs.language
        : 'text',
      nodePos: $from.before(depth),
      open: node.attrs.language !== 'mermaid',
      text: node.textContent,
    }
  }

  return {
    language: 'text',
    nodePos: null,
    open: false,
    text: '',
  }
}

function rectEquals(a: DOMRect | null, b: DOMRect | null) {
  if (a === b) {
    return true
  }

  if (!a || !b) {
    return false
  }

  return (
    Math.abs(a.left - b.left) < 0.5
    && Math.abs(a.top - b.top) < 0.5
    && Math.abs(a.width - b.width) < 0.5
    && Math.abs(a.height - b.height) < 0.5
  )
}

function getSelectionAnchorElement() {
  const selection = window.getSelection()
  const anchorNode = selection?.anchorNode

  if (!anchorNode) {
    return null
  }

  if (anchorNode instanceof HTMLElement) {
    return anchorNode
  }

  return anchorNode.parentElement
}

function resolveCodeBlockElement(editor: any, nodePos: number) {
  const selectionElement = getSelectionAnchorElement()
  const selectionContainer = selectionElement?.closest('[data-node-view-root], pre')

  if (selectionContainer instanceof HTMLElement) {
    if (selectionContainer.matches('pre')) {
      return selectionContainer
    }

    const nestedPre = selectionContainer.querySelector('pre')
    if (nestedPre instanceof HTMLElement) {
      return nestedPre
    }

    const firstChild = selectionContainer.firstElementChild
    if (firstChild instanceof HTMLElement) {
      return firstChild
    }

    return selectionContainer
  }

  const domNode = editor.view.nodeDOM(nodePos)
  const baseElement = domNode instanceof HTMLElement
    ? domNode
    : domNode instanceof Text
      ? domNode.parentElement
      : null

  if (!baseElement) {
    return null
  }

  const container = baseElement.closest('[data-node-view-root], pre')

  if (container instanceof HTMLElement) {
    if (container.matches('pre')) {
      return container
    }

    const nestedPre = container.querySelector('pre')
    if (nestedPre instanceof HTMLElement) {
      return nestedPre
    }

    const firstChild = container.firstElementChild
    if (firstChild instanceof HTMLElement) {
      return firstChild
    }

    return container
  }

  return baseElement
}

function copyTextWithFallback(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  return new Promise<void>((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    document.body.append(textarea)
    textarea.select()

    try {
      const copied = document.execCommand('copy')
      textarea.remove()

      if (copied) {
        resolve()
        return
      }

      reject(new Error('Copy command was rejected'))
    } catch (error) {
      textarea.remove()
      reject(error)
    }
  })
}

export function CodeBlockToolbar() {
  const editor = useEditor<any>()
  const snapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    return JSON.stringify(getActiveCodeBlockState(currentEditor))
  })
  const state = useMemo(() => JSON.parse(snapshot) as ActiveCodeBlockState, [snapshot])
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [copied, setCopied] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageButtonRef = useRef<HTMLButtonElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const languageOptions = useMemo(() => {
    return defaultCodeBlockLanguageOptions.map((option) => ({
      id: option.id,
      label: option.name,
      description: option.id,
    }))
  }, [])

  const updateRect = useCallback(() => {
    if (!state.open || typeof state.nodePos !== 'number' || !editor.mounted) {
      setRect((current) => (current ? null : current))
      return
    }

    const element = resolveCodeBlockElement(editor, state.nodePos)
    const nextRect = element?.getBoundingClientRect() ?? null
    setRect((current) => (rectEquals(current, nextRect) ? current : nextRect))
  }, [editor, state.nodePos, state.open])

  useEffect(() => {
    updateRect()
  }, [updateRect])

  useEffect(() => {
    if (!state.open || !editor.mounted) {
      setLanguageOpen(false)
      return
    }

    const scheduleUpdate = () => {
      if (frameRef.current != null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        updateRect()
      })
    }

    window.addEventListener('scroll', scheduleUpdate, true)
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [editor, state.open, updateRect])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCopied(false)
    }, 1500)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [copied])

  async function handleCopy() {
    if (!state.text) {
      return
    }

    try {
      await copyTextWithFallback(state.text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function selectLanguage(language: string) {
    editor.focus()
    ;(editor.commands as any).setCodeBlockAttrs?.({
      language,
    })
    setLanguageOpen(false)
  }

  if (!state.open || !rect || typeof document === 'undefined') {
    return null
  }

  const currentLanguage = defaultCodeBlockLanguageOptions.find((option) => option.id === state.language)
    ?? defaultCodeBlockLanguageOptions[0]

  return createPortal(
    <div
      className="pk:pointer-events-none pk:fixed pk:z-[1304]"
      style={{
        top: rect.top + 8,
        left: rect.right - 12,
        transform: 'translateX(-100%)',
      }}
    >
      <div className="pk:pointer-events-auto pk:flex pk:items-center pk:gap-1 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_92%,white)] pk:p-1 pk:shadow-[0_12px_32px_rgba(15,23,42,0.16)] pk:backdrop-blur-md">
        <EditorComboboxMenu
          anchor={languageButtonRef}
          open={languageOpen}
          options={languageOptions}
          value={state.language}
          nativeButton
          side="bottom"
          align="end"
          sideOffset={8}
          popupClassName="pk:z-[1405]"
          searchLabel="搜索代码语言"
          searchPlaceholder="搜索语言..."
          emptyText="没有匹配语言"
          onOpenChange={setLanguageOpen}
          onClose={() => {
            editor.focus()
          }}
          onSelect={(option) => {
            selectLanguage(option.id)
          }}
        >
          <button
            ref={languageButtonRef}
            type="button"
            aria-label="切换代码语言"
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            className="pk:inline-flex pk:h-7 pk:max-w-[148px] pk:items-center pk:gap-1.5 pk:rounded-md pk:px-2.5 pk:text-xs pk:font-medium pk:text-[var(--editor-muted-foreground)] pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:hover:text-[var(--editor-foreground)]"
          >
            <CodeBoxLineIcon className="pk:h-3.5 pk:w-3.5" />
            <span className="pk:truncate">{currentLanguage.name}</span>
            <ArrowDownSLineIcon className="pk:h-4 pk:w-4" />
          </button>
        </EditorComboboxMenu>

        <Tooltip content={copied ? '复制成功' : '复制代码'}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="复制代码"
            className={copied ? 'pk:text-[var(--editor-primary)]' : 'pk:text-[var(--editor-muted-foreground)]'}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              void handleCopy()
            }}
          >
            {copied ? <CheckboxCircleLineIcon className="pk:h-4 pk:w-4" /> : <CopyIcon className="pk:h-4 pk:w-4" />}
          </Button>
        </Tooltip>
      </div>
    </div>,
    document.body,
  )
}

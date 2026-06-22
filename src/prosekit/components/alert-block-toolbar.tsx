import {
  BlockHandleDraggable,
  BlockHandlePopup,
  BlockHandlePositioner,
  BlockHandleRoot,
} from 'prosekit/react/block-handle'
import { useEditor } from 'prosekit/react'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { useMemo, useState, type ReactNode } from 'react'

import {
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  DeleteLineIcon,
  DraggableIcon,
  ErrorWarningFillIcon,
  Information2FillIcon,
  ScrollToBottomLineIcon,
  TextIcon,
  UserSmileFillIcon,
} from '../../icons'
import { cn } from '../../utils/cn'
import { Button, Separator, Tooltip } from '../../ui'
import type { AlertType, AlertVariant } from '../extensions/alert-panel'

type AlertBlockState = {
  node: ProseMirrorNode
  pos: number
} | null

type AlertVariantOption = {
  value: AlertVariant
  label: string
  icon: ReactNode
}

const alertVariantOptions: AlertVariantOption[] = [
  { value: 'info', label: '提示', icon: <Information2FillIcon className="h-4 w-4 text-[var(--primary)]" /> },
  { value: 'success', label: '成功', icon: <CheckboxCircleFillIcon className="h-4 w-4 text-[#2e7d32]" /> },
  { value: 'warning', label: '警告', icon: <ErrorWarningFillIcon className="h-4 w-4 text-[#ed6c02]" /> },
  { value: 'error', label: '错误', icon: <CloseCircleFillIcon className="h-4 w-4 text-[var(--destructive)]" /> },
  { value: 'default', label: '默认', icon: <UserSmileFillIcon className="h-4 w-4 text-[var(--editor-muted-foreground)]" /> },
]

type AlertTypeOption = {
  value: AlertType
  label: string
  icon: ReactNode
}

const alertTypeOptions: AlertTypeOption[] = [
  { value: 'text', label: '纯文字', icon: <TextIcon className="h-4 w-4" /> },
  { value: 'icon', label: '图标文字', icon: <ScrollToBottomLineIcon className="h-4 w-4 rotate-90" /> },
]

function normalizeAlertVariant(value: unknown): AlertVariant {
  return value === 'success' || value === 'warning' || value === 'error' || value === 'default'
    ? value
    : 'info'
}

function normalizeAlertType(value: unknown): AlertType {
  return value === 'text' ? 'text' : 'icon'
}

function findAlertBlockState(editor: any, state: AlertBlockState): AlertBlockState {
  if (!state) {
    return null
  }

  if (state.node.type.name === 'alert') {
    return state
  }

  let found: AlertBlockState = null

  editor.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (found) {
      return false
    }

    if (node.type.name !== 'alert') {
      return true
    }

    const start = pos
    const end = pos + node.nodeSize
    if (state.pos >= start && state.pos < end) {
      found = { node, pos }
      return false
    }

    return true
  })

  return found
}

function AlertToolbarSurface({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.16),0_2px_8px_rgba(15,23,42,0.08)]"
      data-editor-floating
    >
      <div className="flex items-center gap-1">
        {children}
      </div>
    </div>
  )
}

export function AlertBlockToolbar() {
  const editor = useEditor<any>()
  const [blockState, setBlockState] = useState<AlertBlockState>(null)

  const alertBlockState = useMemo(() => {
    return findAlertBlockState(editor, blockState)
  }, [blockState, editor])

  const activeVariant = normalizeAlertVariant(alertBlockState?.node.attrs.variant)
  const activeType = normalizeAlertType(alertBlockState?.node.attrs.type)

  function updateVariant(variant: AlertVariant) {
    if (!alertBlockState) {
      return
    }

    const { node, pos } = alertBlockState
    const tr = editor.view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      variant,
    })

    editor.view.dispatch(tr)
    editor.view.focus()
  }

  function updateType(type: AlertType) {
    if (!alertBlockState) {
      return
    }

    const { node, pos } = alertBlockState
    const tr = editor.view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      type,
    })

    editor.view.dispatch(tr)
    editor.view.focus()
  }

  function deleteAlert() {
    if (!alertBlockState) {
      return
    }

    const { node, pos } = alertBlockState
    const tr = editor.view.state.tr.delete(pos, pos + node.nodeSize)

    editor.view.dispatch(tr.scrollIntoView())
    editor.view.focus()
  }

  return (
    <BlockHandleRoot
      editor={editor}
      onStateChange={(event) => {
        setBlockState(event.detail as AlertBlockState)
      }}
    >
      <BlockHandlePositioner
        placement="top-start"
        offset={6}
        strategy="fixed"
        className="z-[1305]"
        shift
        hoist
      >
        <BlockHandlePopup>
          {alertBlockState ? (
            <AlertToolbarSurface>
              <BlockHandleDraggable editor={editor} className="inline-flex">
                <Tooltip content="拖动提示块">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="拖动提示块"
                    className="h-7 w-7 rounded-md text-[var(--editor-muted-foreground)] hover:bg-[var(--editor-muted)] hover:text-[var(--editor-foreground)]"
                  >
                    <DraggableIcon className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </BlockHandleDraggable>
              <Separator orientation="vertical" className="mx-1 h-4" />
              {alertVariantOptions.map((option) => (
                <Tooltip content={option.label} key={option.value}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={option.label}
                    className={cn(
                      'h-7 w-7 rounded-md text-[var(--editor-muted-foreground)] hover:bg-[var(--editor-muted)] hover:text-[var(--editor-foreground)]',
                      option.value === activeVariant && 'bg-[var(--editor-primary-soft)] text-[var(--editor-primary)]',
                    )}
                    onClick={() => updateVariant(option.value)}
                  >
                    {option.icon}
                  </Button>
                </Tooltip>
              ))}
              <Separator orientation="vertical" className="mx-1 h-4" />
              {alertTypeOptions.map((option) => (
                <Tooltip content={option.label} key={option.value}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={option.label}
                    className={cn(
                      'h-7 w-7 rounded-md text-[var(--editor-muted-foreground)] hover:bg-[var(--editor-muted)] hover:text-[var(--editor-foreground)]',
                      option.value === activeType && 'bg-[var(--editor-primary-soft)] text-[var(--editor-primary)]',
                    )}
                    onClick={() => updateType(option.value)}
                  >
                    {option.icon}
                  </Button>
                </Tooltip>
              ))}
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Tooltip content="删除提示块">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="删除提示块"
                  className="h-7 w-7 rounded-md text-[var(--editor-muted-foreground)] hover:bg-[var(--editor-muted)] hover:text-[var(--editor-foreground)]"
                  onClick={deleteAlert}
                >
                  <DeleteLineIcon className="h-4 w-4" />
                </Button>
              </Tooltip>
            </AlertToolbarSurface>
          ) : null}
        </BlockHandlePopup>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  )
}

import {
  Divider,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material'
import {
  BlockHandleDraggable,
  BlockHandlePopup,
  BlockHandlePositioner,
  BlockHandleRoot,
} from 'prosekit/react/block-handle'
import { useEditor } from 'prosekit/react'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { useMemo, useState, type ReactNode } from 'react'

import './toolbar.css'

import {
  DeleteLineIcon,
  DraggableIcon,
} from '../../icons'
import type { AlertBoxKind } from '../extensions/alert-panel'

type AlertBlockState = {
  node: ProseMirrorNode
  pos: number
} | null

type AlertVariantOption = {
  value: AlertBoxKind
  label: string
}

const alertVariantOptions: AlertVariantOption[] = [
  { value: 'info', label: '提示' },
  { value: 'success', label: '成功' },
  { value: 'warning', label: '警告' },
  { value: 'error', label: '错误' },
]

function normalizeAlertKind(value: unknown): AlertBoxKind {
  return value === 'success' || value === 'warning' || value === 'error'
    ? value
    : 'info'
}

function findAlertBlockState(editor: any, state: AlertBlockState): AlertBlockState {
  if (!state) {
    return null
  }

  if (state.node.type.name === 'alertBox') {
    return state
  }

  let found: AlertBlockState = null

  editor.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (found) {
      return false
    }

    if (node.type.name !== 'alertBox') {
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
    <Paper elevation={8} className="alert-block-toolbar-surface">
      <div className="alert-block-toolbar-row">
        {children}
      </div>
    </Paper>
  )
}

export function AlertBlockToolbar() {
  const editor = useEditor<any>()
  const [blockState, setBlockState] = useState<AlertBlockState>(null)

  const alertBlockState = useMemo(() => {
    return findAlertBlockState(editor, blockState)
  }, [blockState, editor])

  const activeVariant = normalizeAlertKind(alertBlockState?.node.attrs.variant)

  function updateVariant(variant: AlertBoxKind) {
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
        className="alert-block-toolbar-positioner"
        shift
        hoist
      >
        <BlockHandlePopup className="alert-block-toolbar-popup">
          {alertBlockState ? (
            <AlertToolbarSurface>
              <BlockHandleDraggable editor={editor} className="alert-block-toolbar-draggable">
                <Tooltip title="拖动提示块" arrow>
                  <IconButton
                    size="small"
                    aria-label="拖动提示块"
                    className="alert-block-toolbar-button alert-block-toolbar-drag-button"
                  >
                    <DraggableIcon className="alert-block-toolbar-icon" />
                  </IconButton>
                </Tooltip>
              </BlockHandleDraggable>
              <Divider orientation="vertical" flexItem className="alert-block-toolbar-divider" />
              {alertVariantOptions.map((option) => (
                <Tooltip title={option.label} arrow key={option.value}>
                  <IconButton
                    size="small"
                    aria-label={option.label}
                    className="alert-block-toolbar-button alert-block-toolbar-variant-button"
                    data-variant={option.value}
                    data-active={option.value === activeVariant ? 'true' : 'false'}
                    onClick={() => updateVariant(option.value)}
                  >
                    <span className="alert-block-toolbar-swatch" />
                  </IconButton>
                </Tooltip>
              ))}
              <Divider orientation="vertical" flexItem className="alert-block-toolbar-divider" />
              <Tooltip title="删除提示块" arrow>
                <IconButton
                  size="small"
                  aria-label="删除提示块"
                  className="alert-block-toolbar-button"
                  onClick={deleteAlert}
                >
                  <DeleteLineIcon className="alert-block-toolbar-icon" />
                </IconButton>
              </Tooltip>
            </AlertToolbarSurface>
          ) : null}
        </BlockHandlePopup>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  )
}

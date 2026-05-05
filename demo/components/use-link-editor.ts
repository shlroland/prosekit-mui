import type { Editor } from 'prosekit/core'
import { useEffect, useRef, useState } from 'react'

import {
  type LinkEditorPopoverProps,
  getCurrentLinkHref,
  isLinkActive,
} from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'

export function canOpenLinkEditor(editor: Editor<MinimalEditorExtension>) {
  return !editor.state.selection.empty || isLinkActive(editor.state)
}

export function openLinkEditor(editor: Editor<MinimalEditorExtension>) {
  if (editor.commands.expandLink?.canExec()) {
    editor.commands.expandLink()
  }
}

export function applyLinkValue(
  editor: Editor<MinimalEditorExtension>,
  href: string,
) {
  const nextHref = href.trim()

  if (!nextHref) {
    editor.commands.removeLink()
    return
  }

  editor.commands.addLink({ href: nextHref })
}

export function useLinkEditor(
  editor: Editor<MinimalEditorExtension>,
  selectionKey?: string,
) {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const previousSelectionKeyRef = useRef(selectionKey)
  const [open, setOpen] = useState(false)
  const canOpen = canOpenLinkEditor(editor)

  useEffect(() => {
    if (open && selectionKey && previousSelectionKeyRef.current !== selectionKey) {
      setOpen(false)
    }

    previousSelectionKeyRef.current = selectionKey
  }, [open, selectionKey])

  function closeEditor() {
    setOpen(false)
    editor.focus()
  }

  function openEditor() {
    if (!canOpen) {
      return
    }

    openLinkEditor(editor)
    setOpen((current) => !current)
  }

  const popoverProps: LinkEditorPopoverProps = {
    anchorEl: anchorRef.current,
    open: open && canOpen,
    initialHref: getCurrentLinkHref(editor.state),
    onClose: closeEditor,
    onSubmit: (value) => {
      applyLinkValue(editor, value.href)
      closeEditor()
    },
    onRemove: isLinkActive(editor.state)
      ? () => {
          editor.commands.removeLink()
          closeEditor()
        }
      : undefined,
  }

  return {
    anchorRef,
    open,
    canOpen,
    openEditor,
    closeEditor,
    popoverProps,
  }
}

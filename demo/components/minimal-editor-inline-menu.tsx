import { Button, Stack, TextField } from '@mui/material'
import { Bold, Code2, Italic, Link2, Strikethrough, Underline } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import type { EditorState } from 'prosekit/pm/state'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import {
  InlineMenu,
  InlineMenuButton,
  InlineMenuDivider,
  InlineMenuGroup,
  InlineMenuPanel,
} from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'

const inlineMenuIconProps = {
  className: 'h-4 w-4',
  strokeWidth: 1.9,
}

type InlineMenuCommandItem = {
  isActive: boolean
  canExec: boolean
  command: () => void
}

type InlineMenuLinkItem = InlineMenuCommandItem & {
  currentLink: string
  expandSelection?: () => void
}

type MinimalEditorInlineMenuState = {
  bold?: InlineMenuCommandItem
  italic?: InlineMenuCommandItem
  underline?: InlineMenuCommandItem
  strike?: InlineMenuCommandItem
  code?: InlineMenuCommandItem
  link?: InlineMenuLinkItem
  selectionKey: string
}

function getCurrentLink(state: EditorState): string {
  const { $from, from, to } = state.selection
  const marks = from === to ? $from.marks() : $from.marksAcross(state.doc.resolve(to))

  if (!marks) {
    return ''
  }

  for (const mark of marks) {
    if (mark.type.name === 'link') {
      return typeof mark.attrs.href === 'string' ? mark.attrs.href : ''
    }
  }

  return ''
}

function getMinimalEditorInlineMenuState(
  editor: Editor<MinimalEditorExtension>,
): MinimalEditorInlineMenuState {
  return {
    bold: editor.commands.toggleBold
      ? {
          isActive: editor.marks.bold?.isActive() ?? false,
          canExec: editor.commands.toggleBold.canExec(),
          command: () => editor.commands.toggleBold(),
        }
      : undefined,
    italic: editor.commands.toggleItalic
      ? {
          isActive: editor.marks.italic?.isActive() ?? false,
          canExec: editor.commands.toggleItalic.canExec(),
          command: () => editor.commands.toggleItalic(),
        }
      : undefined,
    underline: editor.commands.toggleUnderline
      ? {
          isActive: editor.marks.underline?.isActive() ?? false,
          canExec: editor.commands.toggleUnderline.canExec(),
          command: () => editor.commands.toggleUnderline(),
        }
      : undefined,
    strike: editor.commands.toggleStrike
      ? {
          isActive: editor.marks.strike?.isActive() ?? false,
          canExec: editor.commands.toggleStrike.canExec(),
          command: () => editor.commands.toggleStrike(),
        }
      : undefined,
    code: editor.commands.toggleCode
      ? {
          isActive: editor.marks.code?.isActive() ?? false,
          canExec: editor.commands.toggleCode.canExec(),
          command: () => editor.commands.toggleCode(),
        }
      : undefined,
    link: editor.commands.addLink
      ? {
          isActive: editor.marks.link?.isActive() ?? false,
          canExec:
            editor.commands.addLink.canExec({ href: 'https://' }) ||
            editor.commands.removeLink.canExec(),
          command: () => {
            if (editor.commands.expandLink?.canExec()) {
              editor.commands.expandLink()
            }
          },
          expandSelection: editor.commands.expandLink
            ? () => editor.commands.expandLink()
            : undefined,
          currentLink: getCurrentLink(editor.state),
        }
      : undefined,
    selectionKey: `${editor.state.selection.from}:${editor.state.selection.to}:${editor.state.selection.empty}`,
  }
}

export function MinimalEditorInlineMenu() {
  const editor = useEditor<MinimalEditorExtension>()
  const menuState = useEditorDerivedValue<
    MinimalEditorExtension,
    MinimalEditorInlineMenuState
  >(getMinimalEditorInlineMenuState)
  const linkInputRef = useRef<HTMLInputElement | null>(null)
  const [linkMenuOpen, setLinkMenuOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')

  useEffect(() => {
    if (!linkMenuOpen) {
      return
    }

    setLinkMenuOpen(false)
  }, [menuState.selectionKey, linkMenuOpen])

  useEffect(() => {
    if (!linkMenuOpen) {
      return
    }

    linkInputRef.current?.focus()
    linkInputRef.current?.select()
  }, [linkMenuOpen])

  function handleLinkOpen() {
    if (!menuState.link) {
      return
    }

    menuState.link.expandSelection?.()
    setLinkValue(menuState.link.currentLink)
    setLinkMenuOpen((current) => !current)
  }

  function handleLinkSubmit(event?: FormEvent) {
    event?.preventDefault()
    if (!menuState.link) {
      return
    }

    const href = linkValue.trim()
    if (!href) {
      editor.commands.removeLink()
    } else {
      editor.commands.addLink({ href })
    }

    setLinkMenuOpen(false)
    editor.focus()
  }

  function handleLinkRemove() {
    editor.commands.removeLink()
    setLinkMenuOpen(false)
    editor.focus()
  }

  return (
    <InlineMenu>
      <InlineMenuGroup>
        {menuState.bold ? (
          <InlineMenuButton
            title="Bold"
            active={menuState.bold.isActive}
            disabled={!menuState.bold.canExec}
            onClick={menuState.bold.command}
          >
            <Bold {...inlineMenuIconProps} />
          </InlineMenuButton>
        ) : null}
        {menuState.italic ? (
          <InlineMenuButton
            title="Italic"
            active={menuState.italic.isActive}
            disabled={!menuState.italic.canExec}
            onClick={menuState.italic.command}
          >
            <Italic {...inlineMenuIconProps} />
          </InlineMenuButton>
        ) : null}
        {menuState.underline ? (
          <InlineMenuButton
            title="Underline"
            active={menuState.underline.isActive}
            disabled={!menuState.underline.canExec}
            onClick={menuState.underline.command}
          >
            <Underline {...inlineMenuIconProps} />
          </InlineMenuButton>
        ) : null}
        {menuState.strike ? (
          <InlineMenuButton
            title="Strikethrough"
            active={menuState.strike.isActive}
            disabled={!menuState.strike.canExec}
            onClick={menuState.strike.command}
          >
            <Strikethrough {...inlineMenuIconProps} />
          </InlineMenuButton>
        ) : null}
        {menuState.code ? (
          <InlineMenuButton
            title="Code"
            active={menuState.code.isActive}
            disabled={!menuState.code.canExec}
            onClick={menuState.code.command}
          >
            <Code2 {...inlineMenuIconProps} />
          </InlineMenuButton>
        ) : null}
      </InlineMenuGroup>

      {menuState.link ? <InlineMenuDivider /> : null}

      {menuState.link ? (
        <InlineMenuGroup>
          <InlineMenuButton
            title="Link"
            active={menuState.link.isActive || linkMenuOpen}
            disabled={!menuState.link.canExec}
            onClick={handleLinkOpen}
          >
            <Link2 {...inlineMenuIconProps} />
          </InlineMenuButton>
        </InlineMenuGroup>
      ) : null}

      {menuState.link && linkMenuOpen ? (
        <InlineMenuPanel>
          <form onSubmit={handleLinkSubmit}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TextField
                inputRef={linkInputRef}
                value={linkValue}
                size="small"
                placeholder="Paste the link..."
                onChange={(event) => setLinkValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setLinkMenuOpen(false)
                    editor.focus()
                  }
                }}
                slotProps={{
                  input: {
                    onMouseDown: (event) => event.stopPropagation(),
                  },
                  htmlInput: {
                    className: 'w-56',
                  },
                }}
              />
              {menuState.link.isActive ? (
                <Button
                  size="small"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleLinkRemove}
                  className="normal-case"
                >
                  Remove
                </Button>
              ) : null}
              <Button
                size="small"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setLinkMenuOpen(false)
                  editor.focus()
                }}
                className="normal-case"
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                type="submit"
                onMouseDown={(event) => event.preventDefault()}
                className="normal-case"
              >
                Save
              </Button>
            </Stack>
          </form>
        </InlineMenuPanel>
      ) : null}
    </InlineMenu>
  )
}

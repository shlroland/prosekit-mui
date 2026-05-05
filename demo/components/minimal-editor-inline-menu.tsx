import { Bold, Code2, Italic, Link2, Strikethrough, Underline } from 'lucide-react'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import {
  InlineMenu,
  InlineMenuButton,
  InlineMenuDivider,
  InlineMenuGroup,
  LinkEditorPopover,
  isLinkActive,
} from '../../src'
import type { MinimalEditorExtension } from './minimal-editor-extension'
import { useLinkEditor } from './use-link-editor'

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
    link: {
      isActive: isLinkActive(editor.state),
      canExec:
        !editor.state.selection.empty ||
        isLinkActive(editor.state),
      command: () => {
        if (editor.commands.expandLink?.canExec()) {
          editor.commands.expandLink()
        }
      },
      expandSelection: editor.commands.expandLink
        ? () => editor.commands.expandLink()
        : undefined,
    },
    selectionKey: `${editor.state.selection.from}:${editor.state.selection.to}:${editor.state.selection.empty}`,
  }
}

export function MinimalEditorInlineMenu() {
  const editor = useEditor<MinimalEditorExtension>()
  const menuState = useEditorDerivedValue<
    MinimalEditorExtension,
    MinimalEditorInlineMenuState
  >(getMinimalEditorInlineMenuState)
  const linkEditor = useLinkEditor(editor, menuState.selectionKey)

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
            ref={linkEditor.anchorRef}
            title="Link"
            active={menuState.link.isActive || linkEditor.open}
            disabled={!menuState.link.canExec}
            onClick={() => linkEditor.openEditor()}
          >
            <Link2 {...inlineMenuIconProps} />
          </InlineMenuButton>
        </InlineMenuGroup>
      ) : null}
      <LinkEditorPopover {...linkEditor.popoverProps} />
    </InlineMenu>
  )
}

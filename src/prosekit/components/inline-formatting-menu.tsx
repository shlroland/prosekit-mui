import { useMemo } from 'react'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import {
  BoldIcon,
  CodeLineIcon,
  EraserLineIcon,
  ItalicIcon,
  MarkPenLineIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from '../../icons'
import { getCurrentLinkAttrs, isLinkActive, type LinkAttrs } from '../extensions/link'
import {
  EditorAiTransformMenuButton,
  EditorLinkMenuButton,
  EditorTooltipMenuButton,
} from './editor-popover-buttons'
import { InlineMenu, InlineMenuButton, InlineMenuDivider, InlineMenuGroup } from './inline-menu'

type InlineFormattingState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code: boolean
  highlight: boolean
  superscript: boolean
  subscript: boolean
  link: boolean
  tooltip: boolean
  selectedText: string
  currentLink: LinkAttrs | null
}

function getInlineFormattingSnapshot(editor: any): string {
  const { state } = editor
  const { selection } = state
  const selectedText = state.doc.textBetween(selection.from, selection.to, ' ').trim()
  const currentLink = getCurrentLinkAttrs(state)

  return JSON.stringify({
    bold: editor.marks.bold?.isActive() ?? false,
    italic: editor.marks.italic?.isActive() ?? false,
    underline: editor.marks.underline?.isActive() ?? false,
    strike: editor.marks.strike?.isActive() ?? false,
    code: editor.marks.code?.isActive() ?? false,
    highlight: editor.marks.highlight?.isActive() ?? false,
    superscript: editor.marks.superscript?.isActive() ?? false,
    subscript: editor.marks.subscript?.isActive() ?? false,
    link: isLinkActive(state),
    tooltip: editor.marks.tooltip?.isActive() ?? false,
    selectedText,
    currentLink,
  } satisfies InlineFormattingState)
}

export function InlineFormattingMenu() {
  const editor = useEditor<any>() as any
  const snapshot = useEditorDerivedValue<any, string>(getInlineFormattingSnapshot)
  const state = useMemo<InlineFormattingState>(() => {
    return JSON.parse(snapshot) as InlineFormattingState
  }, [snapshot])

  function focus() {
    editor.focus()
  }

  function run(command: () => void) {
    focus()
    command()
  }

  function clearFormat() {
    focus()

    const { state: editorState, view } = editor
    const { from, to, empty } = editorState.selection

    if (empty) {
      ;[
        'unsetBold',
        'unsetItalic',
        'unsetUnderline',
        'unsetStrike',
        'unsetCode',
        'unsetHighlight',
        'unsetSuperscript',
        'unsetSubscript',
        'unsetTooltip',
      ].forEach((commandName) => {
        ;(editor.commands as any)[commandName]?.()
      })
      editor.commands.removeLink?.()
      return
    }

    view.dispatch(editorState.tr.removeMark(from, to).scrollIntoView())
  }

  return (
    <>
      <InlineMenu placement="top" offset={10}>
        <InlineMenuGroup>
          <EditorAiTransformMenuButton surface="inline" />
        </InlineMenuGroup>

        <InlineMenuDivider />

        <InlineMenuGroup>
          <InlineMenuButton
            title="加粗"
            active={state.bold}
            onClick={() => run(() => editor.commands.toggleBold())}
          >
            <BoldIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="斜体"
            active={state.italic}
            onClick={() => run(() => editor.commands.toggleItalic())}
          >
            <ItalicIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="删除线"
            active={state.strike}
            onClick={() => run(() => editor.commands.toggleStrike())}
          >
            <StrikethroughIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="下划线"
            active={state.underline}
            onClick={() => run(() => editor.commands.toggleUnderline())}
          >
            <UnderlineIcon />
          </InlineMenuButton>
        </InlineMenuGroup>

        <InlineMenuDivider />

        <InlineMenuGroup>
          <InlineMenuButton
            title="行内代码"
            active={state.code}
            onClick={() => run(() => editor.commands.toggleCode())}
          >
            <CodeLineIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="高亮"
            active={state.highlight}
            onClick={() => run(() => editor.commands.toggleHighlight())}
          >
            <MarkPenLineIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="上标"
            active={state.superscript}
            onClick={() => run(() => editor.commands.toggleSuperscript())}
          >
            <SuperscriptIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="下标"
            active={state.subscript}
            onClick={() => run(() => editor.commands.toggleSubscript())}
          >
            <SubscriptIcon />
          </InlineMenuButton>
        </InlineMenuGroup>

        <InlineMenuDivider />

        <InlineMenuGroup>
          <EditorLinkMenuButton
            surface="inline"
            active={state.link}
            currentLink={state.currentLink}
            selectedText={state.selectedText}
          />
          <EditorTooltipMenuButton surface="inline" active={state.tooltip} />
          <InlineMenuButton
            title="清除格式"
            onClick={clearFormat}
          >
            <EraserLineIcon />
          </InlineMenuButton>
        </InlineMenuGroup>
      </InlineMenu>
    </>
  )
}

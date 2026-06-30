import { useMemo, useState } from 'react'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import {
  AiGenerateTextIcon,
  BoldIcon,
  CodeLineIcon,
  EraserLineIcon,
  ItalicIcon,
  LinkIcon,
  MarkPenLineIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TooltipLineIcon,
  UnderlineIcon,
} from '../../icons'
import { Button } from '../../ui'
import { EditorFloatingPopover, type EditorFloatingPopoverProps } from '../../ui'
import {
  requestAiWritingTransform,
  type AiWritingTransformAction,
} from '../extensions/ai-writing'
import { getCurrentLinkAttrs, isLinkActive, type LinkAttrs } from '../extensions/link'
import { InlineMenu, InlineMenuButton, InlineMenuDivider, InlineMenuGroup } from './inline-menu'
import { LinkEditorPanel } from './link-editor-popover'

type AiSelectionRange = {
  from: number
  to: number
  text: string
}

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

const aiTransformActions: Array<{
  action: AiWritingTransformAction
  label: string
}> = [
  { action: 'polish', label: '润色' },
  { action: 'expand', label: '扩写' },
  { action: 'shorten', label: '缩短' },
  { action: 'simplify', label: '简化' },
  { action: 'formal', label: '正式' },
]

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

function createSelectionAnchor(editor: any): EditorFloatingPopoverProps['anchor'] {
  const { view } = editor
  const selection = window.getSelection()
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  const rangeRect = range?.getBoundingClientRect()

  if (
    range
    && rangeRect
    && (rangeRect.width > 0 || rangeRect.height > 0)
    && view.dom.contains(range.commonAncestorContainer)
  ) {
    const anchorRect = new DOMRect(
      rangeRect.x,
      rangeRect.y,
      Math.max(rangeRect.width, 1),
      Math.max(rangeRect.height, 1),
    )

    return {
      contextElement: view.dom,
      getBoundingClientRect: () => anchorRect,
    }
  }

  const { from, to } = view.state.selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right, left + 1)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom, top + 1)
  const anchorRect = new DOMRect(left, top, right - left, bottom - top)

  return {
    contextElement: view.dom,
    getBoundingClientRect: () => anchorRect,
  }
}

export function InlineFormattingMenu() {
  const editor = useEditor<any>() as any
  const snapshot = useEditorDerivedValue<any, string>(getInlineFormattingSnapshot)
  const state = useMemo<InlineFormattingState>(() => {
    return JSON.parse(snapshot) as InlineFormattingState
  }, [snapshot])
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkAnchor, setLinkAnchor] = useState<EditorFloatingPopoverProps['anchor']>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiAnchor, setAiAnchor] = useState<EditorFloatingPopoverProps['anchor']>(null)
  const [aiRange, setAiRange] = useState<AiSelectionRange | null>(null)
  const [aiAction, setAiAction] = useState<AiWritingTransformAction>('polish')
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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

  function openLinkEditor() {
    focus()
    setLinkAnchor(createSelectionAnchor(editor))
    setLinkOpen(true)
  }

  async function runAiTransform(action: AiWritingTransformAction, range = aiRange) {
    if (!range?.text.trim()) {
      return
    }

    setAiAction(action)
    setAiLoading(true)
    setAiError('')

    try {
      const { doc } = editor.state
      const result = await requestAiWritingTransform(editor.view, {
        action,
        text: range.text,
        prefix: doc.textBetween(0, range.from, '\n', '\n'),
        suffix: doc.textBetween(range.to, doc.content.size, '\n', '\n'),
      })

      setAiResult(result.trim())
      if (!result.trim()) {
        setAiError('当前没有可用的 AI 返回结果。')
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI 处理失败。')
      setAiResult('')
    } finally {
      setAiLoading(false)
    }
  }

  function openAiPanel() {
    const { from, to, empty } = editor.state.selection
    if (empty) {
      return
    }

    const text = editor.state.doc.textBetween(from, to, '\n', '\n').trim()
    if (!text) {
      return
    }

    const range = { from, to, text }
    focus()
    setAiAnchor(createSelectionAnchor(editor))
    setAiRange(range)
    setAiResult('')
    setAiError('')
    setAiOpen(true)
    void runAiTransform('polish', range)
  }

  function replaceWithAiResult() {
    if (!aiRange || !aiResult) {
      return
    }

    const { state: editorState, view } = editor
    view.dispatch(editorState.tr.insertText(aiResult, aiRange.from, aiRange.to).scrollIntoView())
    focus()
    setAiOpen(false)
  }

  function insertAiResultAfterSelection() {
    if (!aiRange || !aiResult) {
      return
    }

    const { state: editorState, view } = editor
    view.dispatch(editorState.tr.insertText(aiResult, aiRange.to).scrollIntoView())
    focus()
    setAiOpen(false)
  }

  return (
    <>
      <InlineMenu placement="top" offset={10}>
        <InlineMenuGroup>
          <InlineMenuButton
            title="AI 润色"
            onClick={openAiPanel}
          >
            <AiGenerateTextIcon />
          </InlineMenuButton>
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
          <InlineMenuButton
            title="链接"
            active={state.link}
            onClick={openLinkEditor}
          >
            <LinkIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="文本提示"
            active={state.tooltip}
            onClick={() => run(() => {
              if (state.tooltip) {
                editor.commands.unsetTooltip()
              } else {
                editor.commands.toggleTooltip()
              }
            })}
          >
            <TooltipLineIcon />
          </InlineMenuButton>
          <InlineMenuButton
            title="清除格式"
            onClick={clearFormat}
          >
            <EraserLineIcon />
          </InlineMenuButton>
        </InlineMenuGroup>
      </InlineMenu>

      <EditorFloatingPopover
        anchor={linkAnchor}
        open={linkOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setLinkOpen(false)
          }
        }}
        side="bottom"
        align="center"
        sideOffset={8}
        popupClassName="pk:rounded-lg pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_80%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_94%,var(--editor-surface-muted))] pk:shadow-[0_14px_36px_rgb(15_23_42_/_14%),0_3px_10px_rgb(15_23_42_/_8%)] pk:backdrop-blur-md"
        content={(
          <LinkEditorPanel
            open={linkOpen}
            initialHref={state.currentLink?.href ?? ''}
            initialTitle={state.currentLink?.title ?? state.selectedText}
            initialType={state.currentLink?.type ?? 'icon'}
            initialTarget={state.currentLink?.target ?? '_blank'}
            showAdvancedOptions
            submitLabel={state.currentLink ? '修改链接' : '插入链接'}
            onClose={() => setLinkOpen(false)}
            onRemove={state.currentLink ? () => {
              focus()
              editor.commands.removeLink()
              setLinkOpen(false)
            } : undefined}
            onSubmit={(value) => {
              focus()
              editor.commands.setLink({
                href: value.href,
                title: value.title || state.selectedText,
                type: value.type,
                target: value.target,
              })
              setLinkOpen(false)
            }}
          />
        )}
      />

      <EditorFloatingPopover
        anchor={aiAnchor}
        open={aiOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAiOpen(false)
          }
        }}
        side="bottom"
        align="center"
        sideOffset={8}
        popupClassName="pk:rounded-xl pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_80%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_94%,var(--editor-surface-muted))] pk:text-[var(--editor-foreground)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_16%),0_4px_12px_rgb(15_23_42_/_8%)] pk:backdrop-blur-md"
        content={(
          <div className="pk:grid pk:w-[380px] pk:gap-3 pk:p-3">
            <div className="pk:flex pk:flex-wrap pk:items-center pk:gap-1">
              {aiTransformActions.map((item) => (
                <Button
                  key={item.action}
                  size="sm"
                  variant={aiAction === item.action ? 'default' : 'ghost'}
                  disabled={aiLoading}
                  className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void runAiTransform(item.action)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="pk:max-h-44 pk:min-h-24 pk:overflow-y-auto pk:rounded-lg pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_78%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-muted)_82%,var(--editor-surface))] pk:p-3 pk:text-[13px] pk:leading-6 pk:text-[var(--editor-foreground)]">
              {aiLoading ? (
                <span className="pk:text-[var(--editor-muted-foreground)]">AI 正在处理...</span>
              ) : aiResult ? (
                aiResult
              ) : (
                <span className="pk:text-[var(--editor-muted-foreground)]">
                  {aiError || '选择一种 AI 操作来生成结果。'}
                </span>
              )}
            </div>

            {aiRange ? (
              <div className="pk:rounded-lg pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_78%,var(--editor-muted))] pk:px-2 pk:py-1.5 pk:text-[11px] pk:leading-5 pk:text-[var(--editor-muted-foreground)]">
                原文：{aiRange.text}
              </div>
            ) : null}

            <div className="pk:flex pk:items-center pk:justify-end pk:gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setAiOpen(false)}
              >
                取消
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!aiResult || aiLoading}
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertAiResultAfterSelection}
              >
                插入到后面
              </Button>
              <Button
                size="sm"
                disabled={!aiResult || aiLoading}
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={replaceWithAiResult}
              >
                替换选区
              </Button>
            </div>
          </div>
        )}
      />
    </>
  )
}

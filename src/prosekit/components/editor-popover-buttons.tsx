import { useEditor } from 'prosekit/react'
import { useState, type ReactNode } from 'react'

import {
  AiGenerateTextIcon,
  EmotionLineIcon,
  LinkIcon,
  Table2Icon,
  TooltipLineIcon,
} from '../../icons'
import { Button, EditorFloatingPopover, type EditorFloatingPopoverProps } from '../../ui'
import {
  requestAiWritingTransform,
  type AiWritingTransformAction,
} from '../extensions/ai-writing'
import { EmojiPickerPanel, insertEmojiCommand, type EmojiItem } from '../extensions/emoji/picker'
import { type LinkAttrs } from '../extensions/link'
import { TooltipEditPopover } from '../extensions/tooltip'
import { EditorMenuButton, type EditorMenuButtonSurface } from './editor-menu-button'
import { LinkEditorPanel, type LinkEditorSubmitValue } from './link-editor-popover'
import { createSelectionAnchor } from './selection-anchor'
import { TableSizePicker, type TableSize } from './table-size-picker'

type AiSelectionRange = {
  from: number
  to: number
  text: string
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

export type EditorLinkMenuButtonProps = {
  surface: EditorMenuButtonSurface
  active?: boolean
  currentLink: LinkAttrs | null
  selectedText: string
  icon?: ReactNode
}

export type EditorTooltipMenuButtonProps = {
  surface: EditorMenuButtonSurface
  active?: boolean
  icon?: ReactNode
}

export type EditorAiTransformMenuButtonProps = {
  surface?: EditorMenuButtonSurface
  icon?: ReactNode
}

export type EditorTableSizeMenuButtonProps = {
  icon?: ReactNode
  onSelect: (size: TableSize) => void
}

export type EditorEmojiMenuButtonProps = {
  surface?: EditorMenuButtonSurface
  icon?: ReactNode
}

function getPopoverAnchor(
  surface: EditorMenuButtonSurface,
  editor: any,
  element: HTMLElement,
): EditorFloatingPopoverProps['anchor'] {
  if (surface === 'inline') {
    return createSelectionAnchor(editor)
  }

  return element
}

function useEditorMenuPopover(surface: EditorMenuButtonSurface) {
  const editor = useEditor<any>() as any
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<EditorFloatingPopoverProps['anchor']>(null)

  function openFrom(element: HTMLElement) {
    editor.focus()
    setAnchor(getPopoverAnchor(surface, editor, element))
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setAnchor(null)
  }

  return {
    anchor,
    close,
    editor,
    open,
    openFrom,
    setOpen,
  }
}

export function EditorLinkMenuButton({
  surface,
  active = false,
  currentLink,
  selectedText,
  icon = <LinkIcon />,
}: EditorLinkMenuButtonProps) {
  const {
    anchor,
    close,
    editor,
    open,
    openFrom,
    setOpen,
  } = useEditorMenuPopover(surface)

  function submitLink(value: LinkEditorSubmitValue) {
    editor.focus()
    editor.commands.setLink({
      href: value.href,
      title: value.title || selectedText,
      type: value.type,
      target: value.target,
    })
    close()
  }

  return (
    <>
      <EditorMenuButton
        surface={surface}
        label="链接"
        active={active}
        icon={icon}
        onClick={(event) => openFrom(event.currentTarget)}
      />
      <EditorFloatingPopover
        anchor={anchor}
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            close()
            return
          }

          setOpen(nextOpen)
        }}
        side="bottom"
        align={surface === 'toolbar' ? 'start' : 'center'}
        sideOffset={8}
        popupClassName="pk:rounded-lg pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_80%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_94%,var(--editor-surface-muted))] pk:shadow-[0_14px_36px_rgb(15_23_42_/_14%),0_3px_10px_rgb(15_23_42_/_8%)] pk:backdrop-blur-md"
        content={(
          <LinkEditorPanel
            open={open}
            initialHref={currentLink?.href ?? ''}
            initialTitle={currentLink?.title ?? selectedText}
            initialType={currentLink?.type ?? 'icon'}
            initialTarget={currentLink?.target ?? '_blank'}
            showAdvancedOptions
            submitLabel={currentLink ? '修改链接' : '插入链接'}
            onClose={close}
            onRemove={currentLink ? () => {
              editor.focus()
              editor.commands.removeLink()
              close()
            } : undefined}
            onSubmit={submitLink}
          />
        )}
      />
    </>
  )
}

export function EditorTooltipMenuButton({
  surface,
  active = false,
  icon = <TooltipLineIcon />,
}: EditorTooltipMenuButtonProps) {
  const {
    anchor,
    close,
    editor,
    open,
    openFrom,
  } = useEditorMenuPopover(surface)

  function handleClick(element: HTMLElement) {
    if (active) {
      editor.focus()
      editor.commands.unsetTooltip()
      return
    }

    openFrom(element)
  }

  return (
    <>
      <EditorMenuButton
        surface={surface}
        label="文本提示"
        active={active}
        icon={icon}
        onClick={(event) => handleClick(event.currentTarget)}
      />
      <TooltipEditPopover
        anchor={anchor}
        open={open}
        initialValue=""
        onClose={close}
        onSubmit={(value) => {
          editor.focus()
          editor.commands.setTooltip(value)
          close()
        }}
        onRemove={close}
      />
    </>
  )
}

export function EditorAiTransformMenuButton({
  surface = 'inline',
  icon = <AiGenerateTextIcon />,
}: EditorAiTransformMenuButtonProps) {
  const {
    anchor,
    close,
    editor,
    open,
    openFrom,
    setOpen,
  } = useEditorMenuPopover(surface)
  const [range, setRange] = useState<AiSelectionRange | null>(null)
  const [action, setAction] = useState<AiWritingTransformAction>('polish')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function runAiTransform(nextAction: AiWritingTransformAction, nextRange = range) {
    if (!nextRange?.text.trim()) {
      return
    }

    setAction(nextAction)
    setLoading(true)
    setError('')

    try {
      const { doc } = editor.state
      const nextResult = await requestAiWritingTransform(editor.view, {
        action: nextAction,
        text: nextRange.text,
        prefix: doc.textBetween(0, nextRange.from, '\n', '\n'),
        suffix: doc.textBetween(nextRange.to, doc.content.size, '\n', '\n'),
      })

      setResult(nextResult.trim())
      if (!nextResult.trim()) {
        setError('当前没有可用的 AI 返回结果。')
      }
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'AI 处理失败。')
      setResult('')
    } finally {
      setLoading(false)
    }
  }

  function openPanel(element: HTMLElement) {
    const { from, to, empty } = editor.state.selection
    if (empty) {
      return
    }

    const text = editor.state.doc.textBetween(from, to, '\n', '\n').trim()
    if (!text) {
      return
    }

    const nextRange = { from, to, text }
    openFrom(element)
    setRange(nextRange)
    setResult('')
    setError('')
    void runAiTransform('polish', nextRange)
  }

  function replaceWithResult() {
    if (!range || !result) {
      return
    }

    const { state, view } = editor
    view.dispatch(state.tr.insertText(result, range.from, range.to).scrollIntoView())
    editor.focus()
    close()
  }

  function insertResultAfterSelection() {
    if (!range || !result) {
      return
    }

    const { state, view } = editor
    view.dispatch(state.tr.insertText(result, range.to).scrollIntoView())
    editor.focus()
    close()
  }

  return (
    <>
      <EditorMenuButton
        surface={surface}
        label="AI 润色"
        icon={icon}
        onClick={(event) => openPanel(event.currentTarget)}
      />
      <EditorFloatingPopover
        anchor={anchor}
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            close()
            return
          }

          setOpen(nextOpen)
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
                  variant={action === item.action ? 'default' : 'ghost'}
                  disabled={loading}
                  className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void runAiTransform(item.action)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="pk:max-h-44 pk:min-h-24 pk:overflow-y-auto pk:rounded-lg pk:border pk:border-[color:color-mix(in_srgb,var(--editor-border)_78%,transparent)] pk:bg-[color:color-mix(in_srgb,var(--editor-muted)_82%,var(--editor-surface))] pk:p-3 pk:text-[13px] pk:leading-6 pk:text-[var(--editor-foreground)]">
              {loading ? (
                <span className="pk:text-[var(--editor-muted-foreground)]">AI 正在处理...</span>
              ) : result ? (
                result
              ) : (
                <span className="pk:text-[var(--editor-muted-foreground)]">
                  {error || '选择一种 AI 操作来生成结果。'}
                </span>
              )}
            </div>

            {range ? (
              <div className="pk:rounded-lg pk:bg-[color:color-mix(in_srgb,var(--editor-surface)_78%,var(--editor-muted))] pk:px-2 pk:py-1.5 pk:text-[11px] pk:leading-5 pk:text-[var(--editor-muted-foreground)]">
                原文：{range.text}
              </div>
            ) : null}

            <div className="pk:flex pk:items-center pk:justify-end pk:gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={close}
              >
                取消
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!result || loading}
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertResultAfterSelection}
              >
                插入到后面
              </Button>
              <Button
                size="sm"
                disabled={!result || loading}
                className="pk:min-h-7 pk:px-2 pk:py-1 pk:text-[12px]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={replaceWithResult}
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

export function EditorTableSizeMenuButton({
  icon = <Table2Icon />,
  onSelect,
}: EditorTableSizeMenuButtonProps) {
  const editor = useEditor<any>() as any
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <>
      <EditorMenuButton
        surface="toolbar"
        label="表格"
        active={Boolean(anchorEl)}
        icon={icon}
        onClick={(event) => {
          editor.focus()
          setAnchorEl((current) => current ? null : event.currentTarget)
        }}
      />
      <TableSizePicker
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onSelect={(size) => {
          editor.focus()
          onSelect(size)
        }}
      />
    </>
  )
}

export function EditorEmojiMenuButton({
  surface = 'toolbar',
  icon = <EmotionLineIcon />,
}: EditorEmojiMenuButtonProps) {
  const {
    anchor,
    close,
    editor,
    open,
    openFrom,
    setOpen,
  } = useEditorMenuPopover(surface)

  function insertEmoji(item: EmojiItem) {
    editor.focus()
    insertEmojiCommand(editor, item.id)
    close()
  }

  return (
    <>
      <EditorMenuButton
        surface={surface}
        label="Emoji"
        active={open}
        icon={icon}
        onClick={(event) => {
          if (open) {
            close()
            return
          }

          openFrom(event.currentTarget)
        }}
      />
      <EditorFloatingPopover
        anchor={anchor}
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            close()
            return
          }

          setOpen(nextOpen)
        }}
        side="bottom"
        align={surface === 'toolbar' ? 'start' : 'center'}
        sideOffset={8}
        popupClassName="pk:z-[1500] pk:overflow-hidden pk:rounded-xl pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:shadow-[0_18px_48px_rgb(15_23_42_/_18%)]"
        content={(
          <EmojiPickerPanel
            onSelect={insertEmoji}
            onEscape={close}
          />
        )}
      />
    </>
  )
}

import { useRef, useState, type RefObject, type ReactNode } from 'react'

import {
  AddCircleFillIcon,
  BoldIcon,
  CodeBoxLineIcon,
  CodeLineIcon,
  DoubleQuotesLIcon,
  ErrorWarningFillIcon,
  FlowChartIcon,
  FunctionsIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  H4Icon,
  H5Icon,
  H6Icon,
  ImageLineIcon,
  Information2FillIcon,
  Information2LineIcon,
  ItalicIcon,
  LinkIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MarkPenLineIcon,
  MenuFold2FillIcon,
  SeparatorIcon,
  SquareRootIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Table2Icon,
  UnderlineIcon,
} from '../../icons'
import {
  EditorDropdownMenu,
  EditorDropdownMenuDivider,
  EditorDropdownMenuItem,
  EditorDropdownMenuSectionLabel,
} from '../../ui'
import { cn } from '../../utils/cn'
import type { MarkdownSourceEditorHandle } from './markdown-source-editor'
import { TableSizePicker } from './table-size-picker'
import { ToolbarItem } from './toolbar-item'

export type MarkdownSourceToolbarProps = {
  editorRef: RefObject<MarkdownSourceEditorHandle | null>
  expanded?: boolean
  className?: string
}

type MarkdownAction = {
  key: string
  label: string
  icon: ReactNode
  onSelect: () => void
}

const iconClassName = 'pk:h-4 pk:w-4'

function focusEditorAfterToolbarAction(editor: MarkdownSourceEditorHandle) {
  const scheduleFrame = globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => globalThis.setTimeout(callback, 0))

  scheduleFrame(() => {
    editor.focus()
  })
}

export function MarkdownSourceToolbar({
  editorRef,
  expanded = true,
  className,
}: MarkdownSourceToolbarProps) {
  const tableButtonRef = useRef<HTMLButtonElement | null>(null)
  const [tablePickerOpen, setTablePickerOpen] = useState(false)

  function run(command: (editor: MarkdownSourceEditorHandle) => void) {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    command(editor)
    focusEditorAfterToolbarAction(editor)
  }

  const insertActions: MarkdownAction[] = [
    {
      key: 'separator',
      label: '分割线',
      icon: <SeparatorIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: '---\n\n', row: 2 })),
    },
    {
      key: 'blockquote',
      label: '引用',
      icon: <DoubleQuotesLIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: '> ', position: 2 })),
    },
    {
      key: 'details',
      label: '折叠面板',
      icon: <MenuFold2FillIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({
        text: ':::details\n\n:::detailsSummary\n\n:::\n\n:::detailsContent\n\n:::\n\n:::',
        row: 3,
        wrap: true,
      })),
    },
    {
      key: 'code-block',
      label: '代码块',
      icon: <CodeBoxLineIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: '```\n\n```', row: 1, wrap: true })),
    },
    {
      key: 'math-block',
      label: '块级公式',
      icon: <FunctionsIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: '$$\n\n$$', row: 1, wrap: true })),
    },
    {
      key: 'mermaid',
      label: 'Mermaid 图表',
      icon: <FlowChartIcon className={iconClassName} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: '```mermaid\n\n```', row: 1, wrap: true })),
    },
  ]

  const alertActions: MarkdownAction[] = [
    {
      key: 'info',
      label: '信息 Info',
      icon: <Information2FillIcon className={cn(iconClassName, 'pk:text-[var(--editor-primary)]')} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: ':::alert {variant="info"}\n\n:::', row: 1, wrap: true })),
    },
    {
      key: 'warning',
      label: '警告 Warning',
      icon: <ErrorWarningFillIcon className={cn(iconClassName, 'pk:text-[var(--editor-warning,#d97706)]')} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: ':::alert {variant="warning"}\n\n:::', row: 1, wrap: true })),
    },
    {
      key: 'error',
      label: '错误 Error',
      icon: <ErrorWarningFillIcon className={cn(iconClassName, 'pk:text-[var(--editor-danger,#dc2626)]')} />,
      onSelect: () => run((editor) => editor.insertBlock({ text: ':::alert {variant="error"}\n\n:::', row: 1, wrap: true })),
    },
  ]

  const headingActions: MarkdownAction[] = [
    { key: 'h1', label: '一级标题', icon: <H1Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(1)) },
    { key: 'h2', label: '二级标题', icon: <H2Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(2)) },
    { key: 'h3', label: '三级标题', icon: <H3Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(3)) },
    { key: 'h4', label: '四级标题', icon: <H4Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(4)) },
    { key: 'h5', label: '五级标题', icon: <H5Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(5)) },
    { key: 'h6', label: '六级标题', icon: <H6Icon className={iconClassName} />, onSelect: () => run((editor) => editor.insertHeading(6)) },
  ]

  return (
    <div className={className}>
      <div className="editor-toolbar">
        <div className="editor-toolbar-row">
          <div className="editor-toolbar-group">
            <EditorDropdownMenu
              finalFocus={false}
              trigger={(
                <ToolbarItem
                  tip="插入"
                  text="插入"
                  icon={<AddCircleFillIcon />}
                />
              )}
            >
              <EditorDropdownMenuSectionLabel>常用</EditorDropdownMenuSectionLabel>
              {insertActions.slice(0, 3).map((action) => (
                <EditorDropdownMenuItem key={action.key} action={action} />
              ))}
              <EditorDropdownMenuDivider />
              <EditorDropdownMenuSectionLabel>专业</EditorDropdownMenuSectionLabel>
              {insertActions.slice(3).map((action) => (
                <EditorDropdownMenuItem key={action.key} action={action} />
              ))}
              <EditorDropdownMenuDivider />
              <EditorDropdownMenuSectionLabel>警告块</EditorDropdownMenuSectionLabel>
              {alertActions.map((action) => (
                <EditorDropdownMenuItem key={action.key} action={action} />
              ))}
            </EditorDropdownMenu>

            <EditorDropdownMenu
              finalFocus={false}
              trigger={(
                <ToolbarItem
                  tip="标题"
                  text="标题"
                  icon={<Information2LineIcon />}
                />
              )}
            >
              {headingActions.map((action) => (
                <EditorDropdownMenuItem key={action.key} action={action} />
              ))}
            </EditorDropdownMenu>
          </div>

          <div className="editor-toolbar-divider pk:w-px pk:bg-[var(--editor-border)]" />

          <div className="editor-toolbar-group">
            <ToolbarItem tip="加粗" icon={<BoldIcon />} onClick={() => run((editor) => editor.insertInline({ single: '**' }))} />
            <ToolbarItem tip="斜体" icon={<ItalicIcon />} onClick={() => run((editor) => editor.insertInline({ single: '*' }))} />
            <ToolbarItem tip="删除线" icon={<StrikethroughIcon />} onClick={() => run((editor) => editor.insertInline({ single: '~~' }))} />
            <ToolbarItem tip="下划线" icon={<UnderlineIcon />} onClick={() => run((editor) => editor.insertInline({ single: '++' }))} />
            <ToolbarItem tip="高亮" icon={<MarkPenLineIcon />} onClick={() => run((editor) => editor.insertInline({ single: '==' }))} />
            {expanded ? (
              <>
                <ToolbarItem tip="行内代码" icon={<CodeLineIcon />} onClick={() => run((editor) => editor.insertInline({ single: '`' }))} />
                <ToolbarItem tip="行内公式" icon={<SquareRootIcon />} onClick={() => run((editor) => editor.insertInline({ single: '$' }))} />
                <ToolbarItem tip="上标" icon={<SuperscriptIcon />} onClick={() => run((editor) => editor.insertInline({ single: '^' }))} />
                <ToolbarItem tip="下标" icon={<SubscriptIcon />} onClick={() => run((editor) => editor.insertInline({ single: '~' }))} />
              </>
            ) : null}
          </div>

          <div className="editor-toolbar-divider pk:w-px pk:bg-[var(--editor-border)]" />

          <div className="editor-toolbar-group">
            <ToolbarItem tip="无序列表" icon={<ListUnorderedIcon />} onClick={() => run((editor) => editor.insertBlock({ text: '- ', position: 2 }))} />
            <ToolbarItem tip="有序列表" icon={<ListOrdered2Icon />} onClick={() => run((editor) => editor.insertBlock({ text: '1. ', position: 3 }))} />
            <ToolbarItem tip="任务列表" icon={<ListCheck3Icon />} onClick={() => run((editor) => editor.insertBlock({ text: '- [ ] ', position: 6 }))} />
            <ToolbarItem tip="链接" icon={<LinkIcon />} onClick={() => run((editor) => editor.insertInline({ left: '[', right: ']()' }))} />
            <ToolbarItem tip="图片" icon={<ImageLineIcon />} onClick={() => run((editor) => editor.insertInline({ left: '![', right: ']()' }))} />
            <ToolbarItem
              ref={tableButtonRef}
              tip="表格"
              icon={<Table2Icon />}
              onClick={() => setTablePickerOpen((open) => !open)}
            />
          </div>
        </div>
      </div>

      <TableSizePicker
        anchorEl={tableButtonRef.current}
        open={tablePickerOpen}
        onClose={() => setTablePickerOpen(false)}
        onSelect={(size) => run((editor) => editor.insertTable(size))}
      />
    </div>
  )
}

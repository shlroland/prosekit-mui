import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'
import 'prosekit/extensions/placeholder/style.css'
import 'prosekit/extensions/table/style.css'

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlertBlockToolbar,
  ArrowGoBackLineIcon,
  ArrowGoForwardLineIcon,
  AttachmentLineIcon,
  BoldIcon,
  CodeLineIcon,
  CollapseIcon,
  EditorContent,
  EditorShell,
  ErrorWarningFillIcon,
  FlipGridIcon,
  ImageAddLineIcon,
  Information2LineIcon,
  ItalicIcon,
  LinkIcon,
  LinkEditorPopover,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MarkPenLineIcon,
  MovieLineIcon,
  Music2LineIcon,
  ProseKitProvider,
  QuoteTextIcon,
  SeparatorIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Table2Icon,
  TableCellFloatingToolbar,
  TableFloatingToolbar,
  TableSizePicker,
  ToolbarItem,
  UnderlineIcon,
  defineRichTextExtension,
  getCurrentLinkAttrs,
  isLinkActive,
} from '../../src'
import type { LinkAttrs } from '../../src'
import { Button, Separator } from '../../src/ui'
import type { Editor, NodeJSON } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useMemo, useState, type ReactNode } from 'react'

const demoContent: NodeJSON = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: 'ProseKit + MUI editor testbed' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: 'Select text and use the link button to insert an inline or block link. Existing examples: ' },
        {
          type: 'inlineLink',
          attrs: {
            href: 'https://prosekit.dev',
            target: '_blank',
            rel: 'noopener noreferrer',
            class: null,
            title: 'ProseKit',
            type: 'icon',
            download: null,
          },
        },
        { type: 'text', text: ' and ' },
        {
          type: 'inlineLink',
          attrs: {
            href: 'https://mui.com',
            target: '_blank',
            rel: 'noopener noreferrer',
            class: null,
            title: 'Material UI',
            type: 'text',
            download: null,
          },
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'blockLink',
      attrs: {
        href: 'https://github.com/prosekit/prosekit',
        target: '_blank',
        rel: 'noopener noreferrer',
        class: null,
        title: 'ProseKit GitHub repository',
        type: 'block',
        download: null,
      },
    },
    {
      type: 'image',
      attrs: {
        src: 'https://picsum.photos/seed/prosekit-mui/960/360',
        width: null,
        height: null,
      },
    },
    {
      type: 'blockAttachment',
      attrs: {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        title: '示例附件.pdf',
        size: '13 KB',
        type: 'block',
        view: '0',
        height: 300,
      },
    },
    {
      type: 'video',
      attrs: {
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        width: '100%',
      },
    },
    {
      type: 'audio',
      attrs: {
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
      },
    },
    {
      type: 'alert',
      attrs: { id: 'alert-demo-info', variant: 'info', type: 'icon' },
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '这是一个提示块，可以在工具栏里插入不同语义的 alert。' }],
        },
      ],
    },
    {
      type: 'details',
      attrs: { open: true },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: '可折叠面板' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: '面板标题可点击展开和收起，内容区域仍然是可编辑的 ProseMirror block。' }],
            },
          ],
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '功能' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '状态' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '备注' }],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '插入行列' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '待验证' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '点击单元格后出现表格浮动工具栏。' }],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '合并拆分' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '待验证' }],
                },
              ],
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '选择多个单元格后测试合并。' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'flipGrid',
      attrs: { gap: '16px' },
      content: [
        {
          type: 'flipGridColumn',
          attrs: { width: 50 },
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: '第一栏内容，可以拖拽中间分隔线调整宽度。' }],
            },
          ],
        },
        {
          type: 'flipGridColumn',
          attrs: { width: 50 },
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: '第二栏内容，hover 栏位可以左右插入新栏。' }],
            },
          ],
        },
      ],
    },
  ],
}

const extension = defineRichTextExtension({
  placeholder: '输入内容...',
})

const iconProps = {
  className: 'toolbar-icon-svg',
  sx: { fontSize: '1rem' },
}

type ToolbarState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code: boolean
  highlight: boolean
  superscript: boolean
  subscript: boolean
  blockquote: boolean
  codeBlock: boolean
  link: boolean
}

function getToolbarState(editor: Editor<any>): ToolbarState {
  return {
    bold: editor.marks.bold?.isActive() ?? false,
    italic: editor.marks.italic?.isActive() ?? false,
    underline: editor.marks.underline?.isActive() ?? false,
    strike: editor.marks.strike?.isActive() ?? false,
    code: editor.marks.code?.isActive() ?? false,
    highlight: editor.marks.highlight?.isActive() ?? false,
    superscript: editor.marks.superscript?.isActive() ?? false,
    subscript: editor.marks.subscript?.isActive() ?? false,
    blockquote: editor.nodes.blockquote?.isActive() ?? false,
    codeBlock: editor.nodes.codeBlock?.isActive() ?? false,
    link: isLinkActive(editor.state),
  }
}

function getToolbarStateSnapshot(editor: Editor<any>): string {
  return JSON.stringify(getToolbarState(editor))
}

function DemoToolbarButton({
  tip,
  active,
  disabled,
  icon,
  onClick,
}: {
  tip: string
  active?: boolean
  disabled?: boolean
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <ToolbarItem
      tip={tip}
      icon={icon}
      className={active ? 'tool-active' : undefined}
      disabled={disabled}
      onClick={onClick}
    />
  )
}

function ProseKitAstrobookToolbar() {
  const editor = useEditor<any>()
  const stateSnapshot = useEditorDerivedValue<any, string>(getToolbarStateSnapshot)
  const state = useMemo<ToolbarState>(() => {
    return JSON.parse(stateSnapshot) as ToolbarState
  }, [stateSnapshot])
  const currentLinkSnapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    const attrs = getCurrentLinkAttrs(currentEditor.state)
    return attrs ? JSON.stringify(attrs) : ''
  })
  const currentLink = useMemo<LinkAttrs | null>(() => {
    return currentLinkSnapshot ? JSON.parse(currentLinkSnapshot) as LinkAttrs : null
  }, [currentLinkSnapshot])
  const [linkOpen, setLinkOpen] = useState(false)
  const [tablePickerAnchor, setTablePickerAnchor] = useState<HTMLElement | null>(null)
  const tablePickerOpen = Boolean(tablePickerAnchor)

  function focus() {
    editor.focus()
  }

  function getSelectedText() {
    return editor.state.doc
      .textBetween(editor.state.selection.from, editor.state.selection.to, ' ')
      .trim()
  }

  return (
    <div className="border-b border-[var(--editor-border)] bg-[var(--editor-surface)] px-2 py-1.5">
      <div className="flex flex-wrap items-center gap-1">
        <select
          defaultValue="paragraph"
          onChange={(event) => {
            focus()
            const value = event.target.value
            if (value === 'paragraph') {
              editor.commands.setParagraph()
              return
            }
            editor.commands.setHeading({ level: Number(value) })
          }}
          className="h-[34px] min-w-[116px] rounded-lg border border-[var(--editor-border)] bg-white px-2 text-sm font-medium text-[var(--editor-foreground)] outline-none focus:ring-2 focus:ring-[var(--editor-ring)]"
        >
          <option value="paragraph">正文</option>
          <option value="1">标题 1</option>
          <option value="2">标题 2</option>
          <option value="3">标题 3</option>
        </select>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DemoToolbarButton
          tip="撤销"
          icon={<ArrowGoBackLineIcon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.undo()
          }}
        />
        <DemoToolbarButton
          tip="重做"
          icon={<ArrowGoForwardLineIcon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.redo()
          }}
        />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DemoToolbarButton tip="加粗" active={state.bold} icon={<BoldIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleBold() }} />
        <DemoToolbarButton tip="斜体" active={state.italic} icon={<ItalicIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleItalic() }} />
        <DemoToolbarButton tip="下划线" active={state.underline} icon={<UnderlineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleUnderline() }} />
        <DemoToolbarButton tip="删除线" active={state.strike} icon={<StrikethroughIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleStrike() }} />
        <DemoToolbarButton tip="行内代码" active={state.code} icon={<CodeLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleCode() }} />
        <DemoToolbarButton tip="高亮" active={state.highlight} icon={<MarkPenLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleHighlight() }} />
        <DemoToolbarButton tip="上标" active={state.superscript} icon={<SuperscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSuperscript() }} />
        <DemoToolbarButton tip="下标" active={state.subscript} icon={<SubscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSubscript() }} />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <div className="inline-flex items-center gap-px" aria-label="text alignment">
          {[
            ['left', <AlignLeftIcon key="left" {...iconProps} />],
            ['center', <AlignCenterIcon key="center" {...iconProps} />],
            ['right', <AlignRightIcon key="right" {...iconProps} />],
            ['justify', <AlignJustifyIcon key="justify" {...iconProps} />],
          ].map(([value, icon]) => (
            <ToolbarItem
              key={value as string}
              tip={`对齐: ${value}`}
              icon={icon}
              onClick={() => {
                focus()
                editor.commands.setTextAlign(value as string)
              }}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <DemoToolbarButton
          tip="无序列表"
          icon={<ListUnorderedIcon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.toggleList({ kind: 'bullet' })
          }}
        />
        <DemoToolbarButton
          tip="有序列表"
          icon={<ListOrdered2Icon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.toggleList({ kind: 'ordered' })
          }}
        />
        <DemoToolbarButton
          tip="任务列表"
          icon={<ListCheck3Icon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.toggleList({ kind: 'task' })
          }}
        />
        <DemoToolbarButton tip="引用" active={state.blockquote} icon={<QuoteTextIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleBlockquote() }} />
        <DemoToolbarButton tip="提示块" icon={<Information2LineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.setAlert({ variant: 'info', type: 'icon' }) }} />
        <DemoToolbarButton tip="警告块" icon={<ErrorWarningFillIcon {...iconProps} />} onClick={() => { focus(); editor.commands.setAlert({ variant: 'warning', type: 'icon' }) }} />
        <DemoToolbarButton tip="折叠面板" icon={<CollapseIcon {...iconProps} />} onClick={() => { focus(); editor.commands.setDetails() }} />
        <DemoToolbarButton tip="分割线" icon={<SeparatorIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertHorizontalRule() }} />
        <ToolbarItem
          tip="表格"
          icon={<Table2Icon {...iconProps} />}
          className={tablePickerOpen ? 'tool-active' : undefined}
          onClick={(event) => {
            setTablePickerAnchor((current) => current ? null : event.currentTarget)
          }}
        />
        <TableSizePicker
          anchorEl={tablePickerAnchor}
          open={tablePickerOpen}
          onClose={() => setTablePickerAnchor(null)}
          onSelect={({ rows, columns }) => {
            focus()
            editor.commands.insertTable({ row: rows, col: columns })
          }}
        />
        <DemoToolbarButton tip="图片" icon={<ImageAddLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertImage({ src: '' }) }} />
        <DemoToolbarButton tip="附件" icon={<AttachmentLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertAttachment() }} />
        <DemoToolbarButton tip="视频" icon={<MovieLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertVideo({ src: '', width: '100%' }) }} />
        <DemoToolbarButton tip="音频" icon={<Music2LineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertAudio({ src: '' }) }} />
        <DemoToolbarButton tip="分栏" icon={<FlipGridIcon {...iconProps} />} onClick={() => { focus(); editor.commands.setFlipGrid(2) }} />
        <LinkEditorPopover
          triggerStyle={{ display: 'inline-flex' }}
          open={linkOpen}
          initialHref={currentLink?.href ?? ''}
          initialTitle={currentLink?.title ?? getSelectedText()}
          initialType={currentLink?.type ?? 'icon'}
          initialTarget={currentLink?.target ?? '_blank'}
          showAdvancedOptions
          submitLabel={currentLink ? '修改链接' : '插入链接'}
          onClose={() => setLinkOpen(false)}
          onRemove={currentLink ? () => {
            focus()
            editor.commands.removeLink()
            setLinkOpen(false)
          } : undefined}
          onSubmit={(value) => {
            focus()
            editor.commands.setLink({
              href: value.href,
              title: value.title || getSelectedText(),
              type: value.type,
              target: value.target,
            })
            setLinkOpen(false)
          }}
        >
          <span className="inline-flex">
            <DemoToolbarButton
              tip="链接节点"
              active={state.link}
              icon={<LinkIcon {...iconProps} />}
              onClick={() => {
                focus()
                setLinkOpen(true)
              }}
            />
          </span>
        </LinkEditorPopover>
      </div>
    </div>
  )
}

function DemoInspector() {
  const editor = useEditor<any>()
  const statsSnapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    const text = currentEditor.state.doc.textBetween(0, currentEditor.state.doc.content.size, '\n')
    return JSON.stringify({
      text,
      chars: text.length,
    })
  })
  const stats = useMemo<{ text: string; chars: number }>(() => {
    return JSON.parse(statsSnapshot) as { text: string; chars: number }
  }, [statsSnapshot])

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="m-0 text-sm text-[var(--editor-muted-foreground)]">
        Characters: {stats.chars}
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          console.info(editor.state.doc.toJSON())
        }}
      >
        Log JSON
      </Button>
    </div>
  )
}

export function ProseKitAstrobookDemo() {
  return (
    <div className="pk-mui-theme pk-demo-page" data-theme="light">
      <ProseKitProvider extension={extension} initialContent={demoContent}>
        <EditorShell
          toolbar={<ProseKitAstrobookToolbar />}
          content={<EditorContent className="prosekit-astrobook-editor-content" />}
          footer={<DemoInspector />}
        />
        <AlertBlockToolbar />
        <TableFloatingToolbar />
        <TableCellFloatingToolbar />
        <div className="mt-2">
          <p className="m-0 text-sm leading-6 text-[var(--editor-muted-foreground)]">
            This demo intentionally uses ProseKit built-in extensions for repeated
            features and keeps project-specific code focused on node links,
            tooltip, flip-grid, and Base UI presentation.
          </p>
        </div>
      </ProseKitProvider>
    </div>
  )
}

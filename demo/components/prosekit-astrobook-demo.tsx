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
  BlockHandle,
  BoldIcon,
  CodeBoxLineIcon,
  CodeBlockToolbar,
  CodeLineIcon,
  CollapseIcon,
  EditorContent,
  EditorShell,
  EmojiAutocomplete,
  EmojiPickerPopover,
  EmotionLineIcon,
  ErrorWarningFillIcon,
  FlipGridIcon,
  FlowChartIcon,
  FormulaIcon,
  FunctionsIcon,
  ImageAddLineIcon,
  Information2LineIcon,
  ItalicIcon,
  LinkIcon,
  LinkEditorPopover,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MarkPenLineIcon,
  MindMapIcon,
  ProseKitProvider,
  QuoteTextIcon,
  SeparatorIcon,
  SlashCommandAutocomplete,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Table2Icon,
  TableCellFloatingToolbar,
  TableFloatingToolbar,
  TableOfContents,
  TableSizePicker,
  ToolbarItem,
  TooltipLineIcon,
  UnderlineIcon,
  createProseKitEditor,
  defaultMermaidTemplate,
  defaultBlockMathTemplate,
  defaultInlineMathTemplate,
  defineRichTextExtension,
  getDiffState,
  getCurrentLinkAttrs,
  isLinkActive,
} from '../../src'
import type { LinkAttrs } from '../../src'
import { Button, EditorComboboxMenu, Separator } from '../../src/ui'
import type { NodeJSON } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useDemoTheme } from './use-demo-theme'

const demoImageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="960" height="360" viewBox="0 0 960 360"%3E%3Cdefs%3E%3ClinearGradient id="bg" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0" stop-color="%23fcfaf5"/%3E%3Cstop offset="0.5" stop-color="%23f5efe4"/%3E%3Cstop offset="1" stop-color="%23dbe8e1"/%3E%3C/linearGradient%3E%3CradialGradient id="clay" cx="18%25" cy="16%25" r="50%25"%3E%3Cstop offset="0" stop-color="%23b85c38" stop-opacity="0.38"/%3E%3Cstop offset="1" stop-color="%23b85c38" stop-opacity="0"/%3E%3C/radialGradient%3E%3CradialGradient id="moss" cx="88%25" cy="86%25" r="52%25"%3E%3Cstop offset="0" stop-color="%232f5d50" stop-opacity="0.34"/%3E%3Cstop offset="1" stop-color="%232f5d50" stop-opacity="0"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="960" height="360" rx="28" fill="url(%23bg)"/%3E%3Crect width="960" height="360" rx="28" fill="url(%23clay)"/%3E%3Crect width="960" height="360" rx="28" fill="url(%23moss)"/%3E%3Ccircle cx="760" cy="94" r="46" fill="%23ffffff" fill-opacity="0.68"/%3E%3Ccircle cx="812" cy="118" r="26" fill="%23ffffff" fill-opacity="0.5"/%3E%3Cpath d="M0 285 C155 225 253 257 372 220 C510 178 626 210 735 170 C832 134 893 146 960 118 L960 360 L0 360 Z" fill="%232f5d50" fill-opacity="0.2"/%3E%3Cpath d="M0 314 C152 255 258 291 390 252 C528 211 626 241 746 202 C844 170 906 184 960 160 L960 360 L0 360 Z" fill="%23b85c38" fill-opacity="0.18"/%3E%3Ctext x="56" y="112" fill="%23171717" font-family="Roboto,Arial,sans-serif" font-size="42" font-weight="700"%3EImage block preview%3C/text%3E%3Ctext x="56" y="164" fill="%23171717" fill-opacity="0.68" font-family="Roboto,Arial,sans-serif" font-size="22"%3EUpload tab, embed link tab, title and dimensions%3C/text%3E%3C/svg%3E'
const demoMermaidSource = defaultMermaidTemplate

export const demoContent: NodeJSON = {
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
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: 'Tooltip mark 示例：把鼠标移到 ' },
        {
          type: 'text',
          text: '这段文本',
          marks: [
            {
              type: 'tooltip',
              attrs: {
                id: 'demo-tooltip-mark',
                text: '<strong>文本提示</strong><br />支持简单 HTML 内容。',
              },
            },
          ],
        },
        { type: 'text', text: ' 上，可以看到悬浮提示；选中文本后点击工具栏的文本提示可以新建或移除 tooltip。' },
      ],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: 'Emoji 示例：输入 ' },
        { type: 'text', text: ':smile' },
        { type: 'text', text: ' 会出现 autocomplete，也可以用工具栏插入 ' },
        {
          type: 'emoji',
          attrs: {
            name: 'sparkles',
            native: '✨',
          },
        },
        { type: 'text', text: '。' },
      ],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [{ type: 'text', text: 'Slash Commands 示例：在空段落输入 / 可以打开命令菜单，快速插入标题、列表、图片、表格、折叠面板、Mermaid 和 Excalidraw。' }],
    },
    {
      type: 'heading',
      attrs: { level: 3, textAlign: null },
      content: [{ type: 'text', text: '链接与富文本' }],
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
      type: 'heading',
      attrs: { level: 3, textAlign: null },
      content: [{ type: 'text', text: '代码、图表与公式' }],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [{ type: 'text', text: '下面是图片节点示例：包含固定宽高和图片描述，用来检查 image 的插入、编辑和 hover 工具条表现。' }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [
        {
          type: 'text',
          text: [
            "import { createEditor } from 'prosekit/core'",
            '',
            'const editor = createEditor({',
            "  defaultContent: '<p>Hello ProseKit</p>',",
            '})',
          ].join('\n'),
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [{ type: 'text', text: '下面这个 Mermaid code block 会直接在编辑器里同步渲染 SVG 预览。' }],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'mermaid' },
      content: [
        {
          type: 'text',
          text: demoMermaidSource,
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [
        { type: 'text', text: '行内数学示例：' },
        {
          type: 'mathInline',
          content: [{ type: 'text', text: defaultInlineMathTemplate }],
        },
        { type: 'text', text: '，点击公式本身会切回源码编辑。' },
      ],
    },
    {
      type: 'mathBlock',
      attrs: { language: 'tex' },
      content: [{ type: 'text', text: defaultBlockMathTemplate }],
    },
    {
      type: 'heading',
      attrs: { level: 2, textAlign: null },
      content: [{ type: 'text', text: '媒体与结构化内容' }],
    },
    {
      type: 'image',
      attrs: {
        src: demoImageSrc,
        width: 420,
        height: 360,
        title: 'Image block preview',
        align: 'center',
      },
    },
    {
      type: 'paragraph',
      attrs: { textAlign: null },
      content: [{ type: 'text', text: '下面这个占位节点用来测试 Excalidraw 扩展：点击后会打开画板，保存后替换成 image 节点。' }],
    },
    {
      type: 'excalidraw',
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
      type: 'alert',
      attrs: { id: 'alert_5ysakwbhvqv', variant: 'warning', type: 'icon' },
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '此时这是一个警告块。' }],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 6, textAlign: null },
      content: [{ type: 'text', text: '折叠面板' }],
    },
    {
      type: 'details',
      attrs: { open: true },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: 'PandaWiki 折叠说明' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: 'PandaWiki 是一款 AI 大模型驱动的开源知识库搭建系统，帮助你快速构建智能化的产品文档、技术文档、FAQ 和博客系统。' }],
            },
            {
              type: 'details',
              attrs: { open: true },
              content: [
                {
                  type: 'detailsSummary',
                  content: [{ type: 'text', text: '嵌套面板' }],
                },
                {
                  type: 'detailsContent',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: { textAlign: null },
                      content: [{ type: 'text', text: '嵌套 details 用来检查内部面板的 0.5rem margin、三角指针和内容间距。' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: '点击左侧三角可以展开或收起，内容区域仍然保持可编辑。' }],
            },
          ],
        },
      ],
    },
    {
      type: 'details',
      attrs: { open: false },
      content: [
        {
          type: 'detailsSummary',
          content: [{ type: 'text', text: '默认关闭的面板' }],
        },
        {
          type: 'detailsContent',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: null },
              content: [{ type: 'text', text: '这个内容默认隐藏，用来检查关闭态三角方向和 open class。' }],
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

const iconProps = {
  className: 'toolbar-icon-svg',
  sx: { fontSize: '1rem' },
}

type ToolbarState = {
  headingLevel: number | null
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
  codeBlockLanguage: string | null
  mathInline: boolean
  mathBlock: boolean
  link: boolean
  tooltip: boolean
}

function getToolbarState(editor: any): ToolbarState {
  const { $from } = editor.state.selection
  let codeBlockLanguage: string | null = null
  let headingLevel: number | null = null

  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name === 'heading') {
      headingLevel = Number(node.attrs.level) || null
    }

    if (node.type.name === 'codeBlock') {
      codeBlockLanguage = typeof node.attrs.language === 'string' && node.attrs.language
        ? node.attrs.language
        : 'text'
      break
    }
  }

  return {
    headingLevel,
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
    codeBlockLanguage,
    mathInline: editor.nodes.mathInline?.isActive() ?? false,
    mathBlock: editor.nodes.mathBlock?.isActive() ?? false,
    link: isLinkActive(editor.state),
    tooltip: editor.marks.tooltip?.isActive() ?? false,
  }
}

function getDiffToolbarSnapshot(editor: any): string {
  const state = getDiffState(editor.state)
  return JSON.stringify({
    isActive: state.isActive,
    diffCount: state.diffCount,
    hasBaseline: Boolean(state.baseline),
  })
}

function getToolbarStateSnapshot(editor: any): string {
  return JSON.stringify(getToolbarState(editor))
}

const blockTypeOptions = [
  { id: 'paragraph', label: '正文' },
  { id: '1', label: '标题 1' },
  { id: '2', label: '标题 2' },
  { id: '3', label: '标题 3' },
]

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
  const editor = useEditor<any>() as any
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
  const diffSnapshot = useEditorDerivedValue<any, string>(getDiffToolbarSnapshot)
  const diffState = useMemo<{
    isActive: boolean
    diffCount: number
    hasBaseline: boolean
  }>(() => {
    return JSON.parse(diffSnapshot) as {
      isActive: boolean
      diffCount: number
      hasBaseline: boolean
    }
  }, [diffSnapshot])
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
    <div className="pk:border-b pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface)] pk:px-2 pk:py-1.5">
      <div className="pk:flex pk:flex-wrap pk:items-center pk:gap-1">
        <EditorComboboxMenu
          options={blockTypeOptions}
          value={state.headingLevel ? String(state.headingLevel) : 'paragraph'}
          searchable={false}
          side="bottom"
          align="start"
          sideOffset={6}
          popupClassName="pk:!w-[160px] pk:!min-w-[160px]"
          getOptionMeta={() => ''}
          onSelect={(option) => {
            focus()
            if (option.id === 'paragraph') {
              editor.commands.setParagraph()
              return
            }
            editor.commands.setHeading({ level: Number(option.id) })
          }}
        >
          <button
            type="button"
            className="pk:flex pk:h-[34px] pk:min-w-[116px] pk:items-center pk:justify-between pk:gap-2 pk:rounded-lg pk:border pk:border-[var(--editor-border)] pk:bg-white pk:px-2 pk:text-sm pk:font-medium pk:text-[var(--editor-foreground)] pk:outline-none pk:transition-colors pk:hover:bg-[var(--editor-muted)] pk:focus-visible:ring-2 pk:focus-visible:ring-[var(--editor-ring)]"
          >
            <span className="pk:truncate">
              {state.headingLevel ? `标题 ${state.headingLevel}` : '正文'}
            </span>
          </button>
        </EditorComboboxMenu>

        <Separator orientation="vertical" className="pk:mx-1 pk:h-5" />

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

        <Button
          size="sm"
          variant={diffState.hasBaseline && !diffState.isActive ? 'default' : 'outline'}
          className="pk:h-8 pk:px-2 pk:text-xs"
          onClick={() => {
            focus()
            ;(editor.commands as any).setDiffBaseline?.()
          }}
        >
          Diff 基准
        </Button>
        <Button
          size="sm"
          variant={diffState.isActive ? 'default' : 'outline'}
          className="pk:h-8 pk:px-2 pk:text-xs"
          disabled={!diffState.hasBaseline}
          onClick={() => {
            focus()
            ;(editor.commands as any).toggleDiff?.()
          }}
        >
          {diffState.isActive ? `隐藏 Diff (${diffState.diffCount})` : '显示 Diff'}
        </Button>

        <Separator orientation="vertical" className="pk:mx-1 pk:h-5" />

        <DemoToolbarButton tip="加粗" active={state.bold} icon={<BoldIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleBold() }} />
        <DemoToolbarButton tip="斜体" active={state.italic} icon={<ItalicIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleItalic() }} />
        <DemoToolbarButton tip="下划线" active={state.underline} icon={<UnderlineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleUnderline() }} />
        <DemoToolbarButton tip="删除线" active={state.strike} icon={<StrikethroughIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleStrike() }} />
        <DemoToolbarButton tip="行内代码" active={state.code} icon={<CodeLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleCode() }} />
        <DemoToolbarButton
          tip="代码块"
          active={state.codeBlock}
          icon={<CodeBoxLineIcon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.toggleCodeBlock({
              language: state.codeBlockLanguage ?? 'text',
            })
          }}
        />
        <DemoToolbarButton
          tip="Mermaid 图表"
          icon={<FlowChartIcon {...iconProps} />}
          onClick={() => {
            focus()
            ;(editor.commands as any).insertMermaidCodeBlock?.(demoMermaidSource)
          }}
        />
        <DemoToolbarButton
          tip="行内公式"
          active={state.mathInline}
          icon={<FormulaIcon {...iconProps} />}
          onClick={() => {
            focus()
            ;(editor.commands as any).setMathInline?.()
          }}
        />
        <DemoToolbarButton
          tip="公式块"
          active={state.mathBlock}
          icon={<FunctionsIcon {...iconProps} />}
          onClick={() => {
            focus()
            ;(editor.commands as any).setMathBlock?.()
          }}
        />
        <DemoToolbarButton tip="高亮" active={state.highlight} icon={<MarkPenLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleHighlight() }} />
        <DemoToolbarButton
          tip="文本提示"
          active={state.tooltip}
          icon={<TooltipLineIcon {...iconProps} />}
          onClick={() => {
            focus()
            if (state.tooltip) {
              editor.commands.unsetTooltip()
            } else {
              editor.commands.toggleTooltip()
            }
          }}
        />
        <DemoToolbarButton tip="上标" active={state.superscript} icon={<SuperscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSuperscript() }} />
        <DemoToolbarButton tip="下标" active={state.subscript} icon={<SubscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSubscript() }} />

        <Separator orientation="vertical" className="pk:mx-1 pk:h-5" />

        <div className="pk:inline-flex pk:items-center pk:gap-px" aria-label="text alignment">
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

        <Separator orientation="vertical" className="pk:mx-1 pk:h-5" />

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
        <DemoToolbarButton tip="折叠面板" icon={<CollapseIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertDetails() }} />
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
        <DemoToolbarButton tip="图片" icon={<ImageAddLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertImage({ src: '', width: 760, align: 'center' }) }} />
        <DemoToolbarButton tip="Excalidraw 绘图" icon={<MindMapIcon {...iconProps} />} onClick={() => { focus(); (editor.commands as any).setExcalidraw?.() }} />
        <EmojiPickerPopover>
          <EmotionLineIcon {...iconProps} />
        </EmojiPickerPopover>
        <DemoToolbarButton tip="附件" icon={<AttachmentLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertAttachment() }} />
        <DemoToolbarButton tip="分栏" icon={<FlipGridIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertFlipGrid(2) }} />
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
          <span className="pk:inline-flex">
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
  const editor = useEditor<any>() as any
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
    <div className="pk:flex pk:items-center pk:justify-between pk:gap-2">
      <p className="pk:m-0 pk:text-sm pk:text-[var(--editor-muted-foreground)]">
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

function DemoContentSync({
  onChange,
}: {
  onChange: (content: NodeJSON) => void
}) {
  const snapshot = useEditorDerivedValue<any, string>((currentEditor) => {
    return JSON.stringify(currentEditor.state.doc.toJSON())
  })

  useEffect(() => {
    onChange(JSON.parse(snapshot) as NodeJSON)
  }, [onChange, snapshot])

  return null
}

export function ProseKitAstrobookDemo() {
  const theme = useDemoTheme()
  const [content, setContent] = useState<NodeJSON>(demoContent)
  const contentRef = useRef<NodeJSON>(demoContent)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  const extension = useMemo(() => {
    return defineRichTextExtension({
      placeholder: '输入内容...',
      codeBlock: {
        themes: [theme === 'dark' ? 'github-dark' : 'github-light'],
      },
    })
  }, [theme])
  const editor = useMemo(() => {
    return createProseKitEditor({
      extension,
      defaultContent: contentRef.current,
    })
  }, [extension])

  return (
    <div className="pk-mui-theme pk-demo-page" data-theme={theme}>
      <ProseKitProvider editor={editor}>
        <div className="pk:grid pk:gap-4 pk:lg:grid-cols-[minmax(0,1fr)_240px] pk:lg:items-start">
          <EditorShell
            toolbar={<ProseKitAstrobookToolbar />}
            content={<EditorContent className="prosekit-astrobook-editor-content" />}
            footer={<DemoInspector />}
          />
          <aside className="pk:sticky pk:top-4 pk:hidden pk:lg:block">
            <TableOfContents title="目录" />
          </aside>
        </div>
        <DemoContentSync onChange={setContent} />
        <AlertBlockToolbar />
        <CodeBlockToolbar />
        <TableFloatingToolbar />
        <TableCellFloatingToolbar />
        <BlockHandle />
        <EmojiAutocomplete />
        <SlashCommandAutocomplete />
        <div className="pk:mt-2">
          <p className="pk:m-0 pk:text-sm pk:leading-6 pk:text-[var(--editor-muted-foreground)]">
            This demo intentionally uses ProseKit built-in extensions for repeated
            features and keeps project-specific code focused on node links,
            tooltip, flip-grid, and Base UI presentation.
          </p>
        </div>
      </ProseKitProvider>
    </div>
  )
}

import {
  AttachmentLineIcon,
  CodeBoxLineIcon,
  CollapseIcon,
  ErrorWarningFillIcon,
  FlipGridIcon,
  FlowChartIcon,
  FormulaIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  ImageAddLineIcon,
  Information2LineIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MindMapIcon,
  QuoteTextIcon,
  SeparatorIcon,
  Table2Icon,
  TextIcon,
} from '../../../icons'
import { defaultMermaidTemplate } from '../mermaid'
import type { SlashCommandGroup, SlashCommandItem } from './types'

const iconClassName = 'pk:h-4 pk:w-4'

function withFocus(command: SlashCommandItem['command']): SlashCommandItem['command'] {
  return (editor) => {
    editor.focus()
    command(editor)
  }
}

function getCommands(editor: Parameters<SlashCommandItem['command']>[0]) {
  return editor.commands as any
}

export const defaultSlashCommandGroups: SlashCommandGroup[] = [
  {
    id: 'text',
    title: '文本',
    items: [
      {
        id: 'paragraph',
        title: '正文',
        description: '切换为普通段落',
        keywords: ['text', 'paragraph', 'p', '正文', '段落'],
        icon: <TextIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).setParagraph()
        }),
      },
      {
        id: 'heading-1',
        title: '标题 1',
        description: '一级标题',
        keywords: ['h1', 'heading', 'title', '标题'],
        icon: <H1Icon className={iconClassName} />,
        shortcut: '#',
        command: withFocus((editor) => {
          getCommands(editor).setHeading({ level: 1 })
        }),
      },
      {
        id: 'heading-2',
        title: '标题 2',
        description: '二级标题',
        keywords: ['h2', 'heading', 'title', '标题'],
        icon: <H2Icon className={iconClassName} />,
        shortcut: '##',
        command: withFocus((editor) => {
          getCommands(editor).setHeading({ level: 2 })
        }),
      },
      {
        id: 'heading-3',
        title: '标题 3',
        description: '三级标题',
        keywords: ['h3', 'heading', 'title', '标题'],
        icon: <H3Icon className={iconClassName} />,
        shortcut: '###',
        command: withFocus((editor) => {
          getCommands(editor).setHeading({ level: 3 })
        }),
      },
      {
        id: 'blockquote',
        title: '引用',
        description: '插入引用块',
        keywords: ['quote', 'blockquote', '引用'],
        icon: <QuoteTextIcon className={iconClassName} />,
        shortcut: '>',
        command: withFocus((editor) => {
          getCommands(editor).toggleBlockquote()
        }),
      },
      {
        id: 'horizontal-rule',
        title: '分割线',
        description: '插入水平分割线',
        keywords: ['hr', 'divider', 'separator', '分割线'],
        icon: <SeparatorIcon className={iconClassName} />,
        shortcut: '---',
        command: withFocus((editor) => {
          getCommands(editor).insertHorizontalRule()
        }),
      },
    ],
  },
  {
    id: 'list',
    title: '列表',
    items: [
      {
        id: 'bullet-list',
        title: '无序列表',
        description: '创建项目符号列表',
        keywords: ['ul', 'bullet', 'list', '无序', '列表'],
        icon: <ListUnorderedIcon className={iconClassName} />,
        shortcut: '-',
        command: withFocus((editor) => {
          getCommands(editor).toggleList({ kind: 'bullet' })
        }),
      },
      {
        id: 'ordered-list',
        title: '有序列表',
        description: '创建编号列表',
        keywords: ['ol', 'ordered', 'number', 'list', '有序', '列表'],
        icon: <ListOrdered2Icon className={iconClassName} />,
        shortcut: '1.',
        command: withFocus((editor) => {
          getCommands(editor).toggleList({ kind: 'ordered' })
        }),
      },
      {
        id: 'task-list',
        title: '任务列表',
        description: '创建待办事项列表',
        keywords: ['task', 'todo', 'checkbox', '任务', '待办'],
        icon: <ListCheck3Icon className={iconClassName} />,
        shortcut: '[ ]',
        command: withFocus((editor) => {
          getCommands(editor).toggleList({ kind: 'task' })
        }),
      },
    ],
  },
  {
    id: 'insert',
    title: '插入',
    items: [
      {
        id: 'image',
        title: '图片',
        description: '插入图片占位并打开图片工具',
        keywords: ['image', 'picture', 'photo', '图片'],
        icon: <ImageAddLineIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertImage({ src: '', width: 760, align: 'center' })
        }),
      },
      {
        id: 'attachment',
        title: '附件',
        description: '插入附件上传块',
        keywords: ['file', 'attachment', 'upload', '附件', '上传'],
        icon: <AttachmentLineIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertAttachment()
        }),
      },
      {
        id: 'table',
        title: '表格',
        description: '插入 3 x 3 表格',
        keywords: ['table', 'grid', '表格'],
        icon: <Table2Icon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertTable({ row: 3, col: 3 })
        }),
      },
      {
        id: 'details',
        title: '折叠面板',
        description: '插入可展开的详情块',
        keywords: ['details', 'collapse', 'toggle', '折叠', '面板'],
        icon: <CollapseIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertDetails()
        }),
      },
      {
        id: 'alert-info',
        title: '提示块',
        description: '插入信息提示块',
        keywords: ['alert', 'callout', 'info', '提示'],
        icon: <Information2LineIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).setAlert({ variant: 'info', type: 'icon' })
        }),
      },
      {
        id: 'alert-warning',
        title: '警告块',
        description: '插入警告提示块',
        keywords: ['alert', 'callout', 'warning', '警告'],
        icon: <ErrorWarningFillIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).setAlert({ variant: 'warning', type: 'icon' })
        }),
      },
      {
        id: 'flip-grid',
        title: '分栏',
        description: '插入双栏布局',
        keywords: ['columns', 'layout', 'grid', 'flip', '分栏'],
        icon: <FlipGridIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertFlipGrid(2)
        }),
      },
      {
        id: 'excalidraw',
        title: 'Excalidraw 绘图',
        description: '插入手绘画板',
        keywords: ['draw', 'excalidraw', 'sketch', '绘图', '画板'],
        icon: <MindMapIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).setExcalidraw()
        }),
      },
    ],
  },
  {
    id: 'advanced',
    title: '高级',
    items: [
      {
        id: 'code-block',
        title: '代码块',
        description: '插入代码块',
        keywords: ['code', 'codeblock', '代码'],
        icon: <CodeBoxLineIcon className={iconClassName} />,
        shortcut: '```',
        command: withFocus((editor) => {
          getCommands(editor).toggleCodeBlock({ language: 'text' })
        }),
      },
      {
        id: 'mermaid',
        title: 'Mermaid 图表',
        description: '插入 Mermaid 图表代码块',
        keywords: ['mermaid', 'diagram', 'flowchart', '图表', '流程图'],
        icon: <FlowChartIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).insertMermaidCodeBlock(defaultMermaidTemplate)
        }),
      },
      {
        id: 'math-block',
        title: '公式块',
        description: '插入块级数学公式',
        keywords: ['math', 'formula', 'latex', '公式'],
        icon: <FormulaIcon className={iconClassName} />,
        command: withFocus((editor) => {
          getCommands(editor).setMathBlock()
        }),
      },
    ],
  },
]

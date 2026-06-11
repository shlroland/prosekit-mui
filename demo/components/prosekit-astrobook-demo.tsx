import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'
import 'prosekit/extensions/placeholder/style.css'
import 'prosekit/extensions/table/style.css'

import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowGoBackLineIcon,
  ArrowGoForwardLineIcon,
  BoldIcon,
  CodeLineIcon,
  EditorContent,
  EditorShell,
  ItalicIcon,
  LinkIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MarkPenLineIcon,
  ProseKitProvider,
  QuoteTextIcon,
  SeparatorIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Table2Icon,
  ToolbarItem,
  UnderlineIcon,
  defineRichTextExtension,
  isLinkActive,
} from '../../src'
import type { Editor, NodeJSON } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import type { ReactNode } from 'react'

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
        { type: 'text', text: 'This Astrobook story uses ProseKit built-in formatting extensions and keeps only project-specific node extensions such as node links, tooltip, flip grid, and trailing node.' },
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
  const state = useEditorDerivedValue<any, ToolbarState>(getToolbarState)

  function focus() {
    editor.focus()
  }

  return (
    <Paper
      variant="outlined"
      square
      sx={{
        borderWidth: 0,
        borderBottomWidth: 1,
        bgcolor: 'background.paper',
        px: 1,
        py: 0.75,
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
        <Select
          size="small"
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
          sx={{ minWidth: 116, height: 34 }}
        >
          <MenuItem value="paragraph">正文</MenuItem>
          <MenuItem value="1">标题 1</MenuItem>
          <MenuItem value="2">标题 2</MenuItem>
          <MenuItem value="3">标题 3</MenuItem>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <DemoToolbarButton tip="加粗" active={state.bold} icon={<BoldIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleBold() }} />
        <DemoToolbarButton tip="斜体" active={state.italic} icon={<ItalicIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleItalic() }} />
        <DemoToolbarButton tip="下划线" active={state.underline} icon={<UnderlineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleUnderline() }} />
        <DemoToolbarButton tip="删除线" active={state.strike} icon={<StrikethroughIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleStrike() }} />
        <DemoToolbarButton tip="行内代码" active={state.code} icon={<CodeLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleCode() }} />
        <DemoToolbarButton tip="高亮" active={state.highlight} icon={<MarkPenLineIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleHighlight() }} />
        <DemoToolbarButton tip="上标" active={state.superscript} icon={<SuperscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSuperscript() }} />
        <DemoToolbarButton tip="下标" active={state.subscript} icon={<SubscriptIcon {...iconProps} />} onClick={() => { focus(); editor.commands.toggleSubscript() }} />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" exclusive aria-label="text alignment">
          {[
            ['left', <AlignLeftIcon key="left" {...iconProps} />],
            ['center', <AlignCenterIcon key="center" {...iconProps} />],
            ['right', <AlignRightIcon key="right" {...iconProps} />],
            ['justify', <AlignJustifyIcon key="justify" {...iconProps} />],
          ].map(([value, icon]) => (
            <ToggleButton
              key={value as string}
              value={value}
              onClick={() => {
                focus()
                editor.commands.setTextAlign(value as string)
              }}
              sx={{ width: 34, height: 34, p: 0 }}
            >
              {icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
        <DemoToolbarButton tip="分割线" icon={<SeparatorIcon {...iconProps} />} onClick={() => { focus(); editor.commands.insertHorizontalRule() }} />
        <DemoToolbarButton tip="表格" icon={<Table2Icon {...iconProps} />} onClick={() => { focus(); editor.commands.insertTable({ row: 3, col: 4 }) }} />
        <DemoToolbarButton
          tip="链接节点"
          active={state.link}
          icon={<LinkIcon {...iconProps} />}
          onClick={() => {
            focus()
            editor.commands.setInlineLink({
              href: '',
              title: editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ').trim(),
              type: 'icon',
              target: '_blank',
            })
          }}
        />
      </Stack>
    </Paper>
  )
}

function DemoInspector() {
  const editor = useEditor<any>()
  const stats = useEditorDerivedValue<any, { text: string; chars: number }>((currentEditor) => {
    const text = currentEditor.state.doc.textBetween(0, currentEditor.state.doc.content.size, '\n')
    return {
      text,
      chars: text.length,
    }
  })

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary">
        Characters: {stats.chars}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          console.info(editor.state.doc.toJSON())
        }}
      >
        Log JSON
      </Button>
    </Stack>
  )
}

export function ProseKitAstrobookDemo() {
  return (
    <ProseKitProvider extension={extension} initialContent={demoContent}>
      <EditorShell
        toolbar={<ProseKitAstrobookToolbar />}
        content={<EditorContent className="prosekit-astrobook-editor-content" />}
        footer={<DemoInspector />}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This demo intentionally uses ProseKit built-in extensions for repeated
          features and keeps project-specific code focused on node links,
          tooltip, flip-grid, and MUI presentation.
        </Typography>
      </Box>
    </ProseKitProvider>
  )
}

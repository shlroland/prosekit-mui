import { Box } from '@mui/material'
import {
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
} from 'lucide-react'
import type { BasicExtension } from 'prosekit/basic'
import type { Editor } from 'prosekit/core'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'

import { ToolbarMenu, type ToolbarMenuOption } from '../../src'

const toolbarIconProps = {
  className: 'toolbar-icon-svg',
  strokeWidth: 1.9,
}

type HeadingOptionId = 'paragraph' | '1' | '2' | '3' | '4' | '5' | '6'

type HeadingOptionPreset = {
  key: HeadingOptionId
  label: string
  shortcutKey: string[]
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export function createMinimalEditorHeadingPreset(): HeadingOptionPreset[] {
  return [
    {
      key: 'paragraph',
      label: '正文',
      shortcutKey: ['ctrl', 'alt', '0'],
    },
    {
      key: '1',
      label: '标题 1',
      shortcutKey: ['ctrl', 'alt', '1'],
      level: 1,
    },
    {
      key: '2',
      label: '标题 2',
      shortcutKey: ['ctrl', 'alt', '2'],
      level: 2,
    },
    {
      key: '3',
      label: '标题 3',
      shortcutKey: ['ctrl', 'alt', '3'],
      level: 3,
    },
    {
      key: '4',
      label: '标题 4',
      shortcutKey: ['ctrl', 'alt', '4'],
      level: 4,
    },
    {
      key: '5',
      label: '标题 5',
      shortcutKey: ['ctrl', 'alt', '5'],
      level: 5,
    },
    {
      key: '6',
      label: '标题 6',
      shortcutKey: ['ctrl', 'alt', '6'],
      level: 6,
    },
  ]
}

const headingOptionPreset = createMinimalEditorHeadingPreset()

const headingIcons = {
  paragraph: <Pilcrow {...toolbarIconProps} />,
  '1': <Heading1 {...toolbarIconProps} />,
  '2': <Heading2 {...toolbarIconProps} />,
  '3': <Heading3 {...toolbarIconProps} />,
  '4': <Heading4 {...toolbarIconProps} />,
  '5': <Heading5 {...toolbarIconProps} />,
  '6': <Heading6 {...toolbarIconProps} />,
} satisfies Record<HeadingOptionId, JSX.Element>

const headingOptions: ToolbarMenuOption<HeadingOptionId>[] = headingOptionPreset.map(
  (option) => ({
    key: option.key,
    label: option.label,
    shortcutKey: option.shortcutKey,
    icon: headingIcons[option.key],
  }),
)


type HeadingState = {
  selectedKey: HeadingOptionId
  canOpen: boolean
}

function getHeadingState(editor: Editor<BasicExtension>): HeadingState {
  const selectedOption = headingOptionPreset.find((option) => {
    if (!option.level) {
      return false
    }

    return editor.nodes.heading.isActive({ level: option.level })
  })

  return {
    selectedKey: selectedOption?.key ?? 'paragraph',
    canOpen:
      editor.commands.setParagraph.canExec() ||
      headingOptionPreset.some((option) =>
        option.level
          ? editor.commands.toggleHeading.canExec({ level: option.level })
          : false,
      ),
  }
}

function applyHeadingOption(
  editor: Editor<BasicExtension>,
  selectedKey: HeadingOptionId,
) {
  const option = headingOptionPreset.find((item) => item.key === selectedKey)

  if (!option) {
    return
  }

  if (option.level) {
    editor.commands.toggleHeading({ level: option.level })
    return
  }

  editor.commands.setParagraph()
}

export function MinimalEditorHeading() {
  const editor = useEditor<BasicExtension>()
  const headingState = useEditorDerivedValue<BasicExtension, HeadingState>(
    getHeadingState,
  )

  const isActive = headingState.selectedKey !== 'paragraph'
  const selectedOption =
    headingOptionPreset.find((option) => option.key === headingState.selectedKey) ??
    headingOptionPreset[0]
  const selectedIcon = headingIcons[selectedOption.key]

  return (
    <ToolbarMenu
      tip="标题"
      options={headingOptions}
      selectedKey={headingState.selectedKey}
      active={isActive}
      disabled={!headingState.canOpen}
      triggerContent={
        <Box className="toolbar-heading-trigger">
          <Box component="span" className="toolbar-heading-icon">
            {selectedIcon}
          </Box>
          <ChevronDown className="toolbar-heading-chevron" strokeWidth={1.85} />
        </Box>
      }
      onSelect={(selectedKey) => applyHeadingOption(editor, selectedKey)}
    />
  )
}

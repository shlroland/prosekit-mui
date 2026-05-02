import 'prosekit/basic/style.css'
import './toolbar.css'

import { Box, Card, Stack, Typography } from '@mui/material'
import type { NodeJSON } from 'prosekit/core'
import { useEditor } from 'prosekit/react'

import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarGroup,
  EditorToolbarPlaceholder,
} from './EditorToolbar'
import { ProseKitProvider } from './prosekit-provider'

export type MinimalProsekitEditorProps = {
  initialContent?: NodeJSON
}

export function MinimalProsekitEditor({
  initialContent,
}: MinimalProsekitEditorProps) {
  return (
    <ProseKitProvider initialContent={initialContent}>
      <MinimalProsekitEditorShell />
    </ProseKitProvider>
  )
}

export function MinimalProsekitEditorShell() {
  return (
    <Stack spacing={1.5}>
      <Card variant="outlined" className="minimal-prosekit-editor-shell">
        <Box className="minimal-prosekit-editor-toolbar-frame">
          <MinimalProsekitEditorToolbar />
        </Box>
        <Box className="minimal-prosekit-editor-content">
          <MinimalProsekitEditorContent />
        </Box>
      </Card>
      <Typography variant="body2" color="text.secondary">
        This editor remains fully visible while the internals are being rebuilt.
        We will replace toolbar placeholders with real controls step by step
        without breaking the full editor shell.
      </Typography>
    </Stack>
  )
}

export function MinimalProsekitEditorToolbar() {
  useEditor()

  return (
    <EditorToolbar>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Insert" />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Undo" />
        <EditorToolbarPlaceholder label="Redo" />
        <EditorToolbarPlaceholder label="Clear" />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Heading" />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Font Size" />
        <EditorToolbarPlaceholder label="Text Color" />
        <EditorToolbarPlaceholder label="Highlight" />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Bold" />
        <EditorToolbarPlaceholder label="Italic" />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Underline" />
        <EditorToolbarPlaceholder label="Strike" />
        <EditorToolbarPlaceholder label="Tooltip" />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="List" />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Link" />
        <EditorToolbarPlaceholder label="Align" />
        <EditorToolbarPlaceholder label="More" />
      </EditorToolbarGroup>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Code Block" />
      </EditorToolbarGroup>
    </EditorToolbar>
  )
}

export function MinimalProsekitEditorContent() {
  const editor = useEditor()

  return (
    <div ref={editor.mount} />
  )
}

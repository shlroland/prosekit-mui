import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'

import { Typography } from '@mui/material'

import {
  EditorContent,
  EditorShell,
  ProseKitProvider,
} from '../../src'
import { minimalEditorDefaultContent } from './minimal-editor-default-content'
import { MinimalEditorToolbar } from './MinimalEditorToolbar'

export function MinimalEditorDemo() {
  return (
    <ProseKitProvider initialContent={minimalEditorDefaultContent}>
      <EditorShell
        toolbar={<MinimalEditorToolbar />}
        content={<EditorContent />}
        footer={
          <Typography variant="body2" color="text.secondary">
            This is a demo-only composition. The published `src/` layer now
            exposes abstract ProseKit and MUI primitives instead of a concrete editor.
          </Typography>
        }
      />
    </ProseKitProvider>
  )
}

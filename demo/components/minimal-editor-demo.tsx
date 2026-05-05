import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'
import 'prosekit/extensions/list/style.css'

import { Typography } from '@mui/material'

import {
  EditorContent,
  EditorShell,
  ProseKitProvider,
} from '../../src'
import { minimalEditorExtension } from './minimal-editor-extension'
import { minimalEditorDefaultContent } from './minimal-editor-default-content'
import { MinimalEditorEmojiMenu } from './minimal-editor-emoji-menu'
import { MinimalEditorInlineMenu } from './minimal-editor-inline-menu'
import { MinimalEditorToolbar } from './minimal-editor-toolbar'

export function MinimalEditorDemo() {
  return (
    <ProseKitProvider
      extension={minimalEditorExtension}
      initialContent={minimalEditorDefaultContent}
    >
      <MinimalEditorInlineMenu />
      <MinimalEditorEmojiMenu />
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

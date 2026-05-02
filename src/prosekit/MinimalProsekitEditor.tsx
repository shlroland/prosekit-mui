import 'prosekit/basic/style.css'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, type NodeJSON } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'
import { useMemo } from 'react'

import { defaultContent } from './default-content'

export type MinimalProsekitEditorProps = {
  initialContent?: NodeJSON
}

export function MinimalProsekitEditor({
  initialContent = defaultContent,
}: MinimalProsekitEditorProps) {
  const editor = useMemo(
    () =>
      createEditor({
        extension: defineBasicExtension(),
        defaultContent: initialContent,
      }),
    [initialContent],
  )

  return (
    <Stack spacing={1.5}>
      <Card
        variant="outlined"
        sx={{
          overflow: 'hidden',
          borderRadius: 3,
          borderColor: 'rgba(23, 23, 23, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.84)',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid rgba(23, 23, 23, 0.08)',
            px: 2,
            py: 1.5,
            backgroundColor: 'rgba(252, 250, 245, 0.92)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Editor Surface
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            '& .ProseMirror': {
              minHeight: 240,
              outline: 'none',
              whiteSpace: 'pre-wrap',
            },
          }}
        >
          <ProseKit editor={editor}>
            <div ref={editor.mount} />
          </ProseKit>
        </Box>
      </Card>
      <Typography variant="body2" color="text.secondary">
        This is intentionally minimal. Next steps can add commands, toolbar state,
        and MUI-specific controls on top of the same editor instance.
      </Typography>
    </Stack>
  )
}

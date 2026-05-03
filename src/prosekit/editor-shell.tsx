import { Box, Card, Stack, Typography } from '@mui/material'
import { type ReactNode } from 'react'

export type EditorShellProps = {
  toolbar?: ReactNode
  content?: ReactNode
  footer?: ReactNode
}

export function EditorShell({ toolbar, content, footer }: EditorShellProps) {
  return (
    <Stack spacing={1.5}>
      <Card variant="outlined" className="minimal-prosekit-editor-shell">
        {toolbar ? (
          <Box className="minimal-prosekit-editor-toolbar-frame">
            {toolbar}
          </Box>
        ) : null}
        {content}
      </Card>
      {footer ?? (
        <Typography variant="body2" color="text.secondary">
          Compose your own editor UI by combining the provider, shell, toolbar,
          and content primitives exported from this package.
        </Typography>
      )}
    </Stack>
  )
}

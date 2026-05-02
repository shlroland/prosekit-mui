import { Box, Divider, Stack, Typography } from '@mui/material'
import { useEditor } from 'prosekit/react'
import { type PropsWithChildren } from 'react'

export type EditorToolbarProps = PropsWithChildren

export type EditorToolbarGroupProps = PropsWithChildren<{
  className?: string
}>

export type EditorToolbarDividerProps = {
  className?: string
}

export function EditorToolbar({ children }: EditorToolbarProps) {
  useEditor()

  return (
    <Box className="editor-toolbar">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        className="editor-toolbar-row"
      >
        {children}
      </Stack>
    </Box>
  )
}

export function EditorToolbarGroup({ className, children }: EditorToolbarGroupProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      className={['editor-toolbar-group', className ?? ''].join(' ').trim()}
    >
      {children}
    </Stack>
  )
}

export function EditorToolbarDivider({ className }: EditorToolbarDividerProps) {
  return (
    <Divider
      orientation="vertical"
      flexItem
      className={['editor-toolbar-divider', className ?? ''].join(' ').trim()}
    />
  )
}

export function EditorToolbarPlaceholder({
  label,
}: {
  label: string
}) {
  return (
    <Box className="editor-toolbar-placeholder">
      <Typography variant="caption" fontWeight={700} color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

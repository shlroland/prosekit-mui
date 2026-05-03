import { Box } from '@mui/material'
import { useEditor } from 'prosekit/react'

import { cn } from '../utils/cn'

export type EditorContentProps = {
  className?: string
}

export function EditorContent({ className }: EditorContentProps) {
  const editor = useEditor<any>() as any

  return (
    <Box className={cn('minimal-prosekit-editor-content', className)}>
      <div ref={editor.mount} />
    </Box>
  )
}

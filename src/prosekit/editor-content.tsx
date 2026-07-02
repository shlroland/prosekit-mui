import { useEditor } from 'prosekit/react'

import { cn } from '../utils/cn'
import './editor-shell.css'

export type EditorContentProps = {
  className?: string
}

export function EditorContent({ className }: EditorContentProps) {
  const editor = useEditor<any>() as any

  return (
    <div className={cn('minimal-prosekit-editor-content', className)}>
      <div ref={editor.mount} />
    </div>
  )
}

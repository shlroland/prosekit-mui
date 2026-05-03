import { Bold, Redo2, Undo2 } from 'lucide-react'
import { useEditor, useEditorDerivedValue } from 'prosekit/react'
import { useCallback } from 'react'

import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarGroup,
  EditorToolbarPlaceholder,
  ToolbarItem,
} from '../../src'

export function MinimalEditorToolbar() {
  const editor = useEditor<any>() as any

  const deriveToolbarState = useCallback((currentEditor: any) => {
    const typedEditor = currentEditor as any

    return {
      canUndo: typedEditor.commands.undo.canExec(),
      canRedo: typedEditor.commands.redo.canExec(),
      isBold: typedEditor.marks.bold.isActive(),
    }
  }, [])

  const { canUndo, canRedo, isBold } = useEditorDerivedValue<any, {
    canUndo: boolean
    canRedo: boolean
    isBold: boolean
  }>(deriveToolbarState)

  return (
    <EditorToolbar>
      <EditorToolbarGroup>
        <EditorToolbarPlaceholder label="Insert" />
      </EditorToolbarGroup>
      <EditorToolbarDivider />
      <EditorToolbarGroup>
        <ToolbarItem
          tip="撤销"
          shortcutKey={['ctrl', 'z']}
          icon={<Undo2 />}
          disabled={!canUndo}
          onClick={() => editor.commands.undo()}
        />
        <ToolbarItem
          tip="重做"
          shortcutKey={['ctrl', 'y']}
          icon={<Redo2 />}
          disabled={!canRedo}
          onClick={() => editor.commands.redo()}
        />
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
        <ToolbarItem
          tip="加粗"
          shortcutKey={['ctrl', 'b']}
          icon={<Bold />}
          className={isBold ? 'tool-active' : ''}
          onClick={() => editor.commands.toggleBold()}
        />
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

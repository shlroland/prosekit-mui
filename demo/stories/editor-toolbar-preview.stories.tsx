import { EditorToolbarPreview } from './editor-toolbar-preview'
import { ClientOnlyStoryFrame } from './client-only-story-frame'

function EditorToolbarPreviewStory() {
  return (
    <ClientOnlyStoryFrame
      eyebrow="Composite"
      title="Editor toolbar preview"
      copy="This composite story shows the intended split: MUI for structure and interaction primitives, Tailwind for the component-facing visual language."
      loadingLabel="Loading toolbar preview..."
    >
      <EditorToolbarPreview />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: EditorToolbarPreviewStory,
}

export const Toolbar = {}

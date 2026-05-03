import 'prosekit/basic/typography.css'

import { MinimalEditorDemo } from '../components/MinimalEditorDemo'
import { ClientOnlyStoryFrame } from './ClientOnlyStoryFrame'

function MinimalProsekitEditorStory() {
  return (
    <ClientOnlyStoryFrame
      eyebrow="ProseKit"
      title="Full editor shell"
      copy="This is a demo composition built from the abstract provider, shell, toolbar, toolbar item, and content primitives exported by src/."
      loadingLabel="Loading editor playground..."
    >
      <MinimalEditorDemo />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: MinimalProsekitEditorStory,
}

export const DefaultEditor = {}

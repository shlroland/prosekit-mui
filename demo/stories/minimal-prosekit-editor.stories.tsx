import 'prosekit/basic/typography.css'

import { ProseKitAstrobookDemo } from '../components/prosekit-astrobook-demo'
import { ClientOnlyStoryFrame } from './client-only-story-frame'

function MinimalProsekitEditorStory() {
  return (
    <ClientOnlyStoryFrame
      eyebrow="ProseKit"
      title="Full editor shell"
      copy="This is a demo composition built from the abstract provider, shell, toolbar, toolbar item, and content primitives exported by src/."
      loadingLabel="Loading editor playground..."
    >
      <ProseKitAstrobookDemo />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: MinimalProsekitEditorStory,
}

export const DefaultEditor = {}

import 'prosekit/basic/typography.css'

import { MinimalProsekitEditor } from '../../src'
import { MuiPlaygroundProvider } from './MuiPlaygroundProvider'
import { PlaygroundShell } from './PlaygroundShell'

export default {
  component: MinimalProsekitEditor,
  decorators: [
    { component: MuiPlaygroundProvider },
    {
      component: PlaygroundShell,
      props: {
        eyebrow: 'ProseKit',
        title: 'Full editor shell',
        copy: 'This story always renders the full editor shell. We will keep replacing the toolbar and content internals step by step, but the complete editor stays visible the whole time.',
      },
    },
  ],
}

export const DefaultEditor = {}

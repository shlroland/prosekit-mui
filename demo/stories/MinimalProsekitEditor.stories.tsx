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
        title: 'Minimal editor',
        copy: 'This is the first real editor component in src/. It follows the official ProseKit minimal example, then adds a thin Material UI shell so we can evolve it into a fuller integration.',
      },
    },
  ],
}

export const DefaultEditor = {}

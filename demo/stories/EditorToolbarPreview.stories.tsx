import { EditorToolbarPreview } from './EditorToolbarPreview'
import { MuiPlaygroundProvider } from './MuiPlaygroundProvider'
import { PlaygroundShell } from './PlaygroundShell'

export default {
  component: EditorToolbarPreview,
  decorators: [
    { component: MuiPlaygroundProvider },
    {
      component: PlaygroundShell,
      props: {
        eyebrow: 'Composite',
        title: 'Editor toolbar preview',
        copy: 'This composite story shows the intended split: MUI for structure and interaction primitives, Tailwind for the component-facing visual language.',
      },
    },
  ],
}

export const Toolbar = {}

import { MuiPlaygroundProvider } from './MuiPlaygroundProvider'
import { PlaygroundShell } from './PlaygroundShell'
import { StatusChip, type StatusChipProps } from './StatusChip'

export default {
  component: StatusChip,
  decorators: [
    { component: MuiPlaygroundProvider },
    {
      component: PlaygroundShell,
      props: {
        eyebrow: 'Signals',
        title: 'Status chips',
        copy: 'Material UI Chip gives you behavior and shape primitives, while Tailwind handles the tone system you want to expose in product components.',
      },
    },
  ],
}

export const Neutral = {
  args: {
    label: 'Draft',
  } satisfies StatusChipProps,
}

export const Success = {
  args: {
    label: 'Synced',
    tone: 'success',
  } satisfies StatusChipProps,
}

export const Warning = {
  args: {
    label: 'Unsaved',
    tone: 'warning',
  } satisfies StatusChipProps,
}

export const Danger = {
  args: {
    label: 'Conflict',
    tone: 'danger',
  } satisfies StatusChipProps,
}

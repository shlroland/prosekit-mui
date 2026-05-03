import { ClientOnlyStoryFrame } from './ClientOnlyStoryFrame'
import { StatusChip, type StatusChipProps } from './StatusChip'

function StatusChipStory(args: StatusChipProps) {
  return (
    <ClientOnlyStoryFrame
      eyebrow="Signals"
      title="Status chips"
      copy="Material UI Chip gives you behavior and shape primitives, while Tailwind handles the tone system you want to expose in product components."
      loadingLabel="Loading status chip story..."
    >
      <StatusChip {...args} />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: StatusChipStory,
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

import { CommandButton, type CommandButtonProps } from './CommandButton'
import { ClientOnlyStoryFrame } from './ClientOnlyStoryFrame'

function CommandButtonStory(args: CommandButtonProps) {
  return (
    <ClientOnlyStoryFrame
      eyebrow="Primitive"
      title="Command buttons"
      copy="These examples use a Material UI Button underneath, but the visible surface styling stays in Tailwind classes so your app components can remain Tailwind-first."
      loadingLabel="Loading command button story..."
    >
      <CommandButton {...args} />
    </ClientOnlyStoryFrame>
  )
}

export default {
  component: CommandButtonStory,
}

export const DefaultButton = {
  args: {
    label: 'Paragraph',
  } satisfies CommandButtonProps,
}

export const ActiveButton = {
  args: {
    label: 'Bold',
    active: true,
  } satisfies CommandButtonProps,
}

export const AccentButton = {
  args: {
    label: 'Publish',
    tone: 'accent',
  } satisfies CommandButtonProps,
}

export const GhostButton = {
  args: {
    label: 'Comment',
    tone: 'ghost',
  } satisfies CommandButtonProps,
}

import { Button } from '../../src/ui'
import { cn } from '../../src/utils/cn'

type CommandButtonProps = {
  label: string
  tone?: 'default' | 'accent' | 'ghost'
  active?: boolean
}

const toneClasses: Record<NonNullable<CommandButtonProps['tone']>, string> = {
  default:
    'border border-black/10 bg-white text-neutral-950 hover:border-black/15 hover:bg-stone-50',
  accent:
    'border border-neutral-950 bg-neutral-950 text-white hover:bg-black',
  ghost:
    'border border-transparent bg-transparent text-stone-700 hover:border-black/8 hover:bg-white/80',
}

export function CommandButton({
  label,
  tone = 'default',
  active = false,
}: CommandButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'pk:min-h-11 pk:rounded-2xl pk:px-4 pk:font-bold pk:shadow-none pk:transition-transform pk:duration-150 pk:hover:-translate-y-px',
        toneClasses[tone],
        active && 'pk:border-clay-500 pk:bg-clay-500 pk:text-white pk:hover:bg-clay-500',
      )}
    >
      {label}
    </Button>
  )
}

export type { CommandButtonProps }

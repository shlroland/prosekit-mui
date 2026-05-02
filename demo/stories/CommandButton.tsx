import Button from '@mui/material/Button'

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
      disableElevation
      variant="contained"
      className={[
        'min-h-11 rounded-2xl px-4 font-bold shadow-none transition-transform duration-150 hover:-translate-y-px',
        toneClasses[tone],
        active ? 'border-clay-500 bg-clay-500 text-white hover:bg-clay-500' : '',
      ].join(' ')}
    >
      {label}
    </Button>
  )
}

export type { CommandButtonProps }

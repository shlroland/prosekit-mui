import { cn } from '../../src/utils/cn'

type StatusChipProps = {
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneClasses: Record<NonNullable<StatusChipProps['tone']>, string> = {
  neutral: 'bg-white text-neutral-900 border-black/8',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
}

export function StatusChip({
  label,
  tone = 'neutral',
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full border px-3 text-sm font-medium shadow-none',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}

export type { StatusChipProps }

import type { ReactNode } from 'react'

type PlaygroundShellProps = {
  eyebrow?: string
  title?: string
  copy?: string
  children?: ReactNode
}

export function PlaygroundShell({
  eyebrow = 'Playground',
  title = 'Editor surfaces',
  copy = 'Compose stories around small interaction units first, then combine them into larger editing flows.',
  children,
}: PlaygroundShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-[1.75rem] border border-black/8 bg-white/86 p-6 shadow-[0_24px_80px_rgba(23,23,23,0.08)] md:p-8">
      <div className="grid gap-4">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-stone-500">
          {eyebrow}
        </p>
        <h1 className="m-0 text-[clamp(2rem,4vw,3.6rem)] leading-[0.92] font-extrabold tracking-[-0.05em] text-neutral-950">
          {title}
        </h1>
        <p className="m-0 max-w-3xl text-base leading-7 text-stone-600">
          {copy}
        </p>
        {children}
      </div>
    </div>
  )
}

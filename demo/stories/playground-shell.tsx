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
    <div className="pk:mx-auto pk:w-full pk:max-w-5xl pk:rounded-[1.75rem] pk:border pk:border-black/8 pk:bg-white/86 pk:p-6 pk:shadow-[0_24px_80px_rgba(23,23,23,0.08)] pk:md:p-8">
      <div className="pk:grid pk:gap-4">
        <p className="pk:m-0 pk:text-[0.72rem] pk:font-bold pk:uppercase pk:tracking-[0.2em] pk:text-stone-500">
          {eyebrow}
        </p>
        <h1 className="pk:m-0 pk:text-[clamp(2rem,4vw,3.6rem)] pk:leading-[0.92] pk:font-extrabold pk:tracking-[-0.05em] pk:text-neutral-950">
          {title}
        </h1>
        <p className="pk:m-0 pk:max-w-3xl pk:text-base pk:leading-7 pk:text-stone-600">
          {copy}
        </p>
        {children}
      </div>
    </div>
  )
}

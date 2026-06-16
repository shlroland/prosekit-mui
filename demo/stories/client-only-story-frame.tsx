import { useEffect, useState, type ReactNode } from 'react'

import { BaseUiPlaygroundProvider } from './base-ui-playground-provider'
import { PlaygroundShell } from './playground-shell'

export type ClientOnlyStoryFrameProps = {
  eyebrow?: string
  title?: string
  copy?: string
  loadingLabel?: string
  children?: ReactNode
}

export function ClientOnlyStoryFrame({
  eyebrow = 'Playground',
  title = 'Story preview',
  copy = 'This story renders its interactive surface after client hydration to avoid server-rendered Emotion output in the Astrobook shell.',
  loadingLabel = 'Loading story preview...',
  children,
}: ClientOnlyStoryFrameProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
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
          <div className="rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50/90 px-4 py-10 text-center text-sm font-medium text-stone-500">
            {loadingLabel}
          </div>
        </div>
      </div>
    )
  }

  return (
    <BaseUiPlaygroundProvider>
      <PlaygroundShell eyebrow={eyebrow} title={title} copy={copy}>
        {children}
      </PlaygroundShell>
    </BaseUiPlaygroundProvider>
  )
}

import { useEffect, useLayoutEffect, useState, type ComponentType } from 'react'

export function CtzhianTiptapDemo() {
  const [Demo, setDemo] = useState<ComponentType | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useLayoutEffect(() => {
    const htmlStyle = document.documentElement.style
    const bodyStyle = document.body.style
    const previousHtmlOverflowY = htmlStyle.overflowY
    const previousBodyOverflowY = bodyStyle.overflowY
    const previousHtmlHeight = htmlStyle.height
    const previousBodyHeight = bodyStyle.height

    htmlStyle.overflowY = 'auto'
    bodyStyle.overflowY = 'auto'
    htmlStyle.height = 'auto'
    bodyStyle.height = 'auto'

    return () => {
      htmlStyle.overflowY = previousHtmlOverflowY
      bodyStyle.overflowY = previousBodyOverflowY
      htmlStyle.height = previousHtmlHeight
      bodyStyle.height = previousBodyHeight
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    import('@ctzhian/tiptap/dist/Editor/demo.js')
      .then((module) => {
        if (!cancelled) {
          setDemo(() => module.default)
        }
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error(String(caughtError)),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error.message}
      </div>
    )
  }

  if (!Demo) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm font-medium text-stone-500">
        Loading @ctzhian/tiptap demo...
      </div>
    )
  }

  return <Demo />
}

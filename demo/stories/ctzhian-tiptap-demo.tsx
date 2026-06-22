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
      <div className="pk:rounded-lg pk:border pk:border-red-200 pk:bg-red-50 pk:px-4 pk:py-3 pk:text-sm pk:text-red-700">
        {error.message}
      </div>
    )
  }

  if (!Demo) {
    return (
      <div className="pk:rounded-lg pk:border pk:border-dashed pk:border-stone-300 pk:bg-stone-50 pk:px-4 pk:py-10 pk:text-center pk:text-sm pk:font-medium pk:text-stone-500">
        Loading @ctzhian/tiptap demo...
      </div>
    )
  }

  return <Demo />
}

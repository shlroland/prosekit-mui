import '../styles/tailwind.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'

import { getDemoThemeStyle, useDemoTheme } from '../components/use-demo-theme'

function useDocumentThemeVariables(style: CSSProperties) {
  useEffect(() => {
    const targets = [document.documentElement, document.body]
    const entries = Object.entries(style).filter(([key]) => key.startsWith('--'))
    const previous = targets.map((target) => {
      return entries.map(([key]) => [key, target.style.getPropertyValue(key)] as const)
    })

    for (const target of targets) {
      for (const [key, value] of entries) {
        target.style.setProperty(key, String(value))
      }
    }

    return () => {
      targets.forEach((target, targetIndex) => {
        for (const [key, value] of previous[targetIndex] ?? []) {
          if (value) {
            target.style.setProperty(key, value)
          } else {
            target.style.removeProperty(key)
          }
        }
      })
    }
  }, [style])
}

export function BaseUiPlaygroundProvider({ children }: { children?: ReactNode }) {
  const theme = useDemoTheme()
  const themeStyle = getDemoThemeStyle(theme)

  useDocumentThemeVariables(themeStyle)

  return (
    <div
      className="pk-mui-theme pk-demo-page pk:min-h-screen pk:w-full"
      data-theme={theme}
      style={themeStyle}
    >
      {children}
    </div>
  )
}

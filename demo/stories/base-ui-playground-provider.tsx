import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import type { ReactNode } from 'react'

export function BaseUiPlaygroundProvider({ children }: { children?: ReactNode }) {
  return (
    <div className="pk-mui-theme pk-demo-page" data-theme="light">
      {children}
    </div>
  )
}

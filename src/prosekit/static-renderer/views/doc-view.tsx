import type { ReactNode } from 'react'

export function StaticDocView({ children }: { children?: ReactNode }) {
  return (
    <div className="ProseMirror prosekit-static-renderer" data-static-renderer="true">
      {children}
    </div>
  )
}

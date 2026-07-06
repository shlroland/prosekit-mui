import type { ReactNode } from 'react'

import type { StaticRendererAssetOptions } from '../url'

export type StaticNodeViewProps = StaticRendererAssetOptions & {
  attrs: Record<string, unknown>
  children?: ReactNode
}

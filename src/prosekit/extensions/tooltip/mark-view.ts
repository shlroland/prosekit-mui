import { defineReactMarkView } from 'prosekit/react'

import { TooltipView } from './view'

export function defineTooltipMarkView() {
  return defineReactMarkView({
    name: 'tooltip',
    component: TooltipView,
    as: 'span',
    contentAs: 'span',
  })
}

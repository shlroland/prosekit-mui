import { defineAlertNodeView } from '../alert'
import { defineDetailsNodeView } from '../details'

export function defineAlertPanelNodeView() {
  return [
    defineAlertNodeView(),
    defineDetailsNodeView(),
  ] as const
}

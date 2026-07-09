import { describe, expect, it } from 'vitest'

import {
  shouldKeepAnchoredRootOpenOnClose,
  shouldKeepAnchoredSubmenuOpenOnClose,
} from './anchored-menu'

describe('shouldKeepAnchoredRootOpenOnClose', () => {
  it.each(['sibling-open', 'trigger-hover', 'focus-out'])(
    'keeps anchored root menus open for transient %s closes',
    (reason) => {
      expect(shouldKeepAnchoredRootOpenOnClose({ reason })).toBe(true)
    },
  )

  it.each(['outside-press', 'escape-key', 'trigger-press', 'item-click', 'none'])(
    'allows anchored root menus to close for concrete %s closes',
    (reason) => {
      expect(shouldKeepAnchoredRootOpenOnClose({ reason })).toBe(false)
    },
  )
})

describe('shouldKeepAnchoredSubmenuOpenOnClose', () => {
  it.each(['trigger-hover', 'focus-out'])(
    'keeps anchored submenus open for portal-boundary %s closes',
    (reason) => {
      expect(shouldKeepAnchoredSubmenuOpenOnClose({ reason })).toBe(true)
    },
  )

  it.each(['sibling-open', 'outside-press', 'escape-key', 'trigger-press', 'item-click', 'none'])(
    'allows anchored submenus to close for concrete %s closes',
    (reason) => {
      expect(shouldKeepAnchoredSubmenuOpenOnClose({ reason })).toBe(false)
    },
  )
})

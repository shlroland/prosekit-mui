import { describe, expect, it } from 'vitest'

import {
  isSameTableAxisMenuTarget,
  shouldCloseTableHandleMenuOnTrigger,
  type TableAxisMenuTarget,
} from './table-floating-toolbar'

function column(index: number): TableAxisMenuTarget {
  return {
    orientation: 'column',
    index,
    tablePos: 10,
  }
}

describe('isSameTableAxisMenuTarget', () => {
  it('matches the same table axis', () => {
    expect(isSameTableAxisMenuTarget(column(1), column(1))).toBe(true)
  })

  it('does not match different axes', () => {
    expect(isSameTableAxisMenuTarget(column(1), column(2))).toBe(false)
  })
})

describe('shouldCloseTableHandleMenuOnTrigger', () => {
  it('closes when the open menu trigger is clicked for the selected axis', () => {
    expect(shouldCloseTableHandleMenuOnTrigger('column', column(1), column(1))).toBe(true)
  })

  it('keeps the open menu when the trigger moves to a different axis', () => {
    expect(shouldCloseTableHandleMenuOnTrigger('column', column(1), column(2))).toBe(false)
  })
})

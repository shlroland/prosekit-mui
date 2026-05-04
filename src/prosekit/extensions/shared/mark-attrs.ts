import type { Mark, Node as ProseMirrorNode } from 'prosekit/pm/model'
import type { EditorState, Transaction } from 'prosekit/pm/state'

export type AttrMap = Record<string, string | undefined>

export function normalizeMarkAttrs<T extends AttrMap>(attrs: Partial<T>): T {
  const nextAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([, value]) => {
      return typeof value === 'string' && value.length > 0
    }),
  )

  return nextAttrs as T
}

export function getMark(markName: string, marks: readonly Mark[]) {
  return marks.find((mark) => mark.type.name === markName)
}

export function getMarkAttrs<T extends AttrMap>(
  markName: string,
  marks: readonly Mark[],
): T {
  const mark = getMark(markName, marks)

  if (!mark) {
    return {} as T
  }

  return normalizeMarkAttrs(mark.attrs as Partial<T>)
}

export function getActiveMarkAttrs<T extends AttrMap>(
  state: EditorState,
  markName: string,
): T {
  const storedMark = state.storedMarks?.find((mark) => mark.type.name === markName)

  if (storedMark) {
    return normalizeMarkAttrs(storedMark.attrs as Partial<T>)
  }

  return getMarkAttrs<T>(markName, state.selection.$from.marks())
}

type MarkAttrsUpdater<T extends AttrMap> = (attrs: T) => T

function updateStoredMarkAttrs<T extends AttrMap>(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  markName: string,
  updateAttrs: MarkAttrsUpdater<T>,
) {
  const markType = state.schema.marks[markName]

  if (!markType) {
    return false
  }

  const baseMarks = state.storedMarks ?? state.selection.$from.marks()
  const nextAttrs = normalizeMarkAttrs(updateAttrs(getMarkAttrs<T>(markName, baseMarks)))
  const nextMarks = baseMarks.filter((mark: Mark) => mark.type !== markType)

  if (Object.keys(nextAttrs).length > 0) {
    nextMarks.push(markType.create(nextAttrs))
  }

  dispatch(state.tr.setStoredMarks(nextMarks))
  return true
}

function updateRangeMarkAttrs<T extends AttrMap>(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  markName: string,
  updateAttrs: MarkAttrsUpdater<T>,
) {
  const markType = state.schema.marks[markName]

  if (!markType) {
    return false
  }

  const { from, to } = state.selection
  let tr = state.tr

  state.doc.nodesBetween(from, to, (node: ProseMirrorNode, pos: number) => {
    if (!node.isText) {
      return
    }

    const start = Math.max(pos, from)
    const end = Math.min(pos + node.nodeSize, to)
    const nextAttrs = normalizeMarkAttrs(
      updateAttrs(getMarkAttrs<T>(markName, node.marks)),
    )

    tr = tr.removeMark(start, end, markType)

    if (Object.keys(nextAttrs).length > 0) {
      tr = tr.addMark(start, end, markType.create(nextAttrs))
    }
  })

  dispatch(tr)
  return true
}

export function createSetMarkAttrsCommand<T extends AttrMap>(
  markName: string,
  attrs: Partial<T>,
) {
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    if (!state.schema.marks[markName]) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const nextAttrs = normalizeMarkAttrs(attrs)

    if (Object.keys(nextAttrs).length === 0) {
      return false
    }

    if (state.selection.empty) {
      return updateStoredMarkAttrs<T>(state, dispatch, markName, (currentAttrs) => ({
        ...currentAttrs,
        ...nextAttrs,
      }))
    }

    return updateRangeMarkAttrs<T>(state, dispatch, markName, (currentAttrs) => ({
      ...currentAttrs,
      ...nextAttrs,
    }))
  }
}

export function createUnsetMarkAttrsCommand<T extends AttrMap>(
  markName: string,
  keys: keyof T | Array<keyof T>,
) {
  const keyList = Array.isArray(keys) ? keys : [keys]

  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    if (!state.schema.marks[markName]) {
      return false
    }

    if (!dispatch) {
      return true
    }

    const clearAttrs = (attrs: T): T => {
      const nextAttrs: AttrMap = { ...attrs }

      for (const key of keyList) {
        nextAttrs[String(key)] = undefined
      }

      return nextAttrs as T
    }

    if (state.selection.empty) {
      return updateStoredMarkAttrs<T>(state, dispatch, markName, clearAttrs)
    }

    return updateRangeMarkAttrs<T>(state, dispatch, markName, clearAttrs)
  }
}

export function createRemoveEmptyMarkCommand<T extends AttrMap>(markName: string) {
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    const markType = state.schema.marks[markName]

    if (!markType) {
      return false
    }

    if (!dispatch) {
      return true
    }

    let tr = state.tr

    state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
      if (!node.isText) {
        return
      }

      const attrs = getMarkAttrs<T>(markName, node.marks)

      if (Object.keys(attrs).length > 0) {
        return
      }

      tr = tr.removeMark(pos, pos + node.nodeSize, markType)
    })

    dispatch(tr)
    return true
  }
}

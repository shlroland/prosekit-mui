import type { NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'

type LegacyListKind = 'bullet' | 'ordered' | 'task'

const legacyListKinds: Record<string, LegacyListKind> = {
  bulletList: 'bullet',
  bullet_list: 'bullet',
  orderedList: 'ordered',
  ordered_list: 'ordered',
  taskList: 'task',
  task_list: 'task',
}

const legacyListItemTypes = new Set([
  'listItem',
  'list_item',
  'taskItem',
  'taskListItem',
  'task_list_item',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isNodeJSON(value: NodeJSON | ProseMirrorNode): value is NodeJSON {
  return isRecord(value) && typeof value.type === 'string'
}

function normalizeContent(content: NodeJSON[] | undefined): NodeJSON[] | undefined {
  if (!content) {
    return undefined
  }

  return content.flatMap((child) => normalizeNode(child))
}

function normalizeLegacyListItem(node: NodeJSON, kind: LegacyListKind): NodeJSON {
  const attrs = isRecord(node.attrs) ? node.attrs : {}

  return {
    ...node,
    type: 'list',
    attrs: {
      ...attrs,
      collapsed: Boolean(attrs.closed ?? attrs.collapsed),
      kind,
    },
    content: normalizeContent(node.content),
  }
}

function normalizeNode(node: NodeJSON): NodeJSON[] {
  const listKind = legacyListKinds[node.type]

  if (listKind) {
    return (node.content ?? []).flatMap((child) => {
      if (legacyListItemTypes.has(child.type)) {
        return [normalizeLegacyListItem(child, listKind)]
      }

      return normalizeNode(child).map((item) => {
        if (legacyListItemTypes.has(item.type)) {
          return normalizeLegacyListItem(item, listKind)
        }

        if (item.type === 'list') {
          return {
            ...item,
            attrs: {
              ...item.attrs,
              kind: item.attrs?.kind ?? listKind,
            },
          }
        }

        return item
      })
    })
  }

  if (legacyListItemTypes.has(node.type)) {
    return [normalizeLegacyListItem(node, 'bullet')]
  }

  return [{
    ...node,
    content: normalizeContent(node.content),
  }]
}

export function normalizeNodeJSON(content: NodeJSON): NodeJSON {
  return normalizeNode(content)[0] ?? content
}

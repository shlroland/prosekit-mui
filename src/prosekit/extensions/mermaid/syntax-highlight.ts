import { definePlugin, type PlainExtension } from 'prosekit/core'
import type { Node as ProseMirrorNode } from 'prosekit/pm/model'
import { Plugin, PluginKey } from 'prosekit/pm/state'
import { Decoration, DecorationSet } from 'prosekit/pm/view'

const mermaidSyntaxHighlightPluginKey = new PluginKey('prosekit-mermaid-syntax-highlight')

const diagramKeywords = [
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'pie',
  'journey',
  'gitGraph',
  'mindmap',
  'timeline',
  'quadrantChart',
  'requirementDiagram',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Dynamic',
  'C4Deployment',
]

const statementKeywords = [
  'accDescr',
  'accTitle',
  'actor',
  'alt',
  'and',
  'autonumber',
  'break',
  'class',
  'classDef',
  'click',
  'critical',
  'else',
  'end',
  'linkStyle',
  'loop',
  'note',
  'opt',
  'over',
  'par',
  'participant',
  'rect',
  'section',
  'style',
  'subgraph',
  'title',
]

const directionPattern = /\b(?:TB|TD|BT|RL|LR)\b/g
const edgeLabelPattern = /\|[^|\n]+\|/g
const edgePattern = /<?(?:-+|=+|\.+)[ox>]?(?:\|[^|\n]*\|)?(?:-+|=+|\.+)?[ox>]*/g
const nodeIdPattern = /(^|\s)([A-Za-z_][\w-]*)(?=\s*(?:\[\[?|\(\(?|\{|\>))/g
const shapePattern = /(\[[^\]\n]+\]|\([^)\n]+\)|\{[^}\n]+\}|>[^]\n]+)/g

const diagramKeywordPattern = new RegExp(`^\\s*(${diagramKeywords.join('|')})\\b`, 'i')
const statementKeywordPattern = new RegExp(`\\b(${statementKeywords.join('|')})\\b`, 'g')

const styles = {
  comment: 'color: var(--editor-muted-foreground) !important; font-style: italic;',
  direction: 'color: rgb(100 116 139) !important; font-weight: 600;',
  edge: 'color: rgb(184 92 56) !important; font-weight: 600;',
  label: 'color: rgb(47 93 80) !important; font-weight: 600;',
  keyword: 'color: rgb(37 99 235) !important; font-weight: 700;',
  node: 'color: rgb(47 93 80) !important; font-weight: 600;',
  shape: 'color: rgb(126 34 206) !important;',
} as const

function addInlineDecoration(
  decorations: Decoration[],
  from: number,
  to: number,
  style: string,
) {
  if (to <= from) {
    return
  }

  decorations.push(Decoration.inline(from, to, { style }))
}

function addRegexDecorations(
  decorations: Decoration[],
  line: string,
  lineStart: number,
  regex: RegExp,
  style: string,
  getRange = (match: RegExpExecArray) => {
    return {
      from: match.index,
      to: match.index + match[0].length,
    }
  },
) {
  regex.lastIndex = 0

  for (let match = regex.exec(line); match; match = regex.exec(line)) {
    const range = getRange(match)
    addInlineDecoration(
      decorations,
      lineStart + range.from,
      lineStart + range.to,
      style,
    )
  }
}

function addMermaidLineDecorations(
  decorations: Decoration[],
  line: string,
  lineStart: number,
) {
  const commentIndex = line.indexOf('%%')
  if (commentIndex >= 0) {
    addInlineDecoration(decorations, lineStart + commentIndex, lineStart + line.length, styles.comment)

    if (line.slice(0, commentIndex).trim() === '') {
      return
    }
  }

  const diagramKeywordMatch = diagramKeywordPattern.exec(line)
  if (diagramKeywordMatch?.[1]) {
    const from = line.indexOf(diagramKeywordMatch[1], diagramKeywordMatch.index)
    addInlineDecoration(decorations, lineStart + from, lineStart + from + diagramKeywordMatch[1].length, styles.keyword)
  }

  addRegexDecorations(decorations, line, lineStart, statementKeywordPattern, styles.keyword)
  addRegexDecorations(decorations, line, lineStart, directionPattern, styles.direction)
  addRegexDecorations(decorations, line, lineStart, nodeIdPattern, styles.node, (match) => {
    const prefixLength = match[1]?.length ?? 0
    const nodeName = match[2] ?? ''
    return {
      from: match.index + prefixLength,
      to: match.index + prefixLength + nodeName.length,
    }
  })
  addRegexDecorations(decorations, line, lineStart, edgePattern, styles.edge)
  addRegexDecorations(decorations, line, lineStart, edgeLabelPattern, styles.label, (match) => {
    return {
      from: match.index + 1,
      to: match.index + match[0].length - 1,
    }
  })
  addRegexDecorations(decorations, line, lineStart, shapePattern, styles.shape)
}

function isMermaidCodeBlock(node: ProseMirrorNode) {
  return node.type.name === 'codeBlock' && node.attrs.language === 'mermaid'
}

function createMermaidSyntaxDecorations(doc: ProseMirrorNode) {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!isMermaidCodeBlock(node)) {
      return
    }

    const source = node.textContent
    let lineOffset = 0

    for (const line of source.split('\n')) {
      addMermaidLineDecorations(decorations, line, pos + 1 + lineOffset)
      lineOffset += line.length + 1
    }

    return false
  })

  return DecorationSet.create(doc, decorations)
}

export function defineMermaidSyntaxHighlight(): PlainExtension {
  return definePlugin(
    new Plugin({
      key: mermaidSyntaxHighlightPluginKey,
      props: {
        decorations(state) {
          return createMermaidSyntaxDecorations(state.doc)
        },
      },
    }),
  )
}

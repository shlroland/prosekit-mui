import { union, type PlainExtension, type Union } from 'prosekit/core'
import {
  defineSearchCommands,
  defineSearchQuery,
  type SearchCommandsExtension,
} from 'prosekit/extensions/search'

import 'prosekit/extensions/search/style.css'

export type SearchExtension = Union<[PlainExtension, SearchCommandsExtension]>

export function defineSearchExtension(): SearchExtension {
  return union(
    defineSearchQuery({ search: '' }),
    defineSearchCommands(),
  ) as SearchExtension
}

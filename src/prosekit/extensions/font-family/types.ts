export type {
  FontFamilyAttrs,
  FontFamilyCommandsExtension,
  FontFamilyExtension,
} from 'prosekit/extensions/font-family'

export type FontFamilyOption = {
  id: string
  label: string
  value: string | null
  source: 'system' | 'fallback'
  keywords?: string[]
}

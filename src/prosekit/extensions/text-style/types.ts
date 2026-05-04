import type { Extension, Union } from 'prosekit/core'

export type TextStyleAttrs = {
  color?: string
  backgroundColor?: string
  fontSize?: string
  fontFamily?: string
  lineHeight?: string
}

export type TextStyleAttrKey = keyof TextStyleAttrs

export type TextStyleFeatureKey = TextStyleAttrKey

export type TextStyleExtensionOptions = {
  features?: Partial<Record<TextStyleFeatureKey, boolean>>
}

type TextStyleMark = {
  textStyle: TextStyleAttrs
}

export type TextStyleSpecExtension = Extension<{
  Marks: TextStyleMark
}>

export type TextStyleCommandsExtension = Extension<{
  Commands: {
    setTextStyle: [Partial<TextStyleAttrs>]
    unsetTextStyle: [TextStyleAttrKey | TextStyleAttrKey[]]
    removeEmptyTextStyle: []
  }
}>

export type TextStyleColorCommandsExtension = Extension<{
  Commands: {
    setTextColor: [string]
    unsetTextColor: []
  }
}>

export type TextStyleBackgroundColorCommandsExtension = Extension<{
  Commands: {
    setTextBackgroundColor: [string]
    unsetTextBackgroundColor: []
  }
}>

export type TextStyleFontSizeCommandsExtension = Extension<{
  Commands: {
    setFontSize: [string | number]
    unsetFontSize: []
  }
}>

export type TextStyleFontFamilyCommandsExtension = Extension<{
  Commands: {
    setFontFamily: [string]
    unsetFontFamily: []
  }
}>

export type TextStyleLineHeightCommandsExtension = Extension<{
  Commands: {
    setLineHeight: [string | number]
    unsetLineHeight: []
  }
}>

export type TextStyleExtension = Union<[TextStyleSpecExtension,
  TextStyleCommandsExtension,
  TextStyleColorCommandsExtension,
  TextStyleBackgroundColorCommandsExtension,
  TextStyleFontSizeCommandsExtension,
  TextStyleFontFamilyCommandsExtension,
  TextStyleLineHeightCommandsExtension]>

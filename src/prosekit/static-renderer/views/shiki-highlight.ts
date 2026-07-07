import {
  bundledLanguages,
  bundledThemes,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki/bundle/full'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import {
  defaultCodeBlockLanguages,
  defaultCodeBlockTheme,
} from '../../extensions/code-block/languages'
import { escapeHTML } from '../html-utils'
import { normalizeText } from './utils'

const codeBlockTheme: BundledTheme = defaultCodeBlockTheme

function isBundledLanguage(language: string): language is BundledLanguage {
  return language in bundledLanguages
}

const loadedLanguageIds = defaultCodeBlockLanguages.filter(isBundledLanguage)
const loadedLanguageSet = new Set<string>(loadedLanguageIds)

const loadedLanguages = (
  await Promise.all(
    loadedLanguageIds.map(async (language) => {
      const module = await bundledLanguages[language]()
      return module.default
    }),
  )
).flat()

const themeModule = await bundledThemes[codeBlockTheme]()

const highlighter = createHighlighterCoreSync({
  themes: [themeModule.default],
  langs: loadedLanguages,
  engine: createJavaScriptRegexEngine(),
})

function escapeAttribute(value: string) {
  return escapeHTML(value).replaceAll('"', '&quot;')
}

function normalizeShikiLanguage(language: unknown) {
  const value = normalizeText(language) || 'text'

  if (value === 'text' || value === 'plain' || value === 'plaintext') {
    return 'text'
  }

  return loadedLanguageSet.has(value) ? value : 'text'
}

function renderPlainCodeBlockHTML(source: string, language: string) {
  return `<pre class="prosekit-static-code-block pk:my-4 pk:overflow-auto pk:rounded-[var(--radius)] pk:border pk:border-[var(--editor-border)] pk:bg-[var(--editor-surface-muted)] pk:p-4 pk:text-sm pk:leading-6" data-language="${escapeAttribute(language)}" data-static-renderer="true"><code>${escapeHTML(source)}</code></pre>`
}

function enhanceShikiHTML(html: string, language: string) {
  return html
    .replace('<pre class="shiki', '<pre class="prosekit-static-code-block shiki')
    .replace('<pre ', `<pre data-language="${escapeAttribute(language)}" data-static-renderer="true" `)
}

export function renderHighlightedCodeBlockHTML(source: string, language: unknown) {
  const normalizedLanguage = normalizeShikiLanguage(language)

  if (normalizedLanguage === 'text') {
    return renderPlainCodeBlockHTML(source, normalizedLanguage)
  }

  try {
    return enhanceShikiHTML(
      highlighter.codeToHtml(source, {
        lang: normalizedLanguage,
        theme: codeBlockTheme,
      }),
      normalizedLanguage,
    )
  } catch {
    return renderPlainCodeBlockHTML(source, normalizedLanguage)
  }
}

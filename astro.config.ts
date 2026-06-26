import { fileURLToPath } from 'node:url'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import astrobook from 'astrobook'

import { version } from './package.json'

const shikiLanguageDeps = [
  '@shikijs/langs/mermaid',
  '@shikijs/langs/typescript',
  '@shikijs/langs/tsx',
  '@shikijs/langs/javascript',
  '@shikijs/langs/jsx',
  '@shikijs/langs/python',
  '@shikijs/langs/java',
  '@shikijs/langs/go',
  '@shikijs/langs/rust',
  '@shikijs/langs/php',
  '@shikijs/langs/ruby',
  '@shikijs/langs/c',
  '@shikijs/langs/cpp',
  '@shikijs/langs/csharp',
  '@shikijs/langs/kotlin',
  '@shikijs/langs/scala',
  '@shikijs/langs/swift',
  '@shikijs/langs/dart',
  '@shikijs/langs/elixir',
  '@shikijs/langs/erlang',
  '@shikijs/langs/haskell',
  '@shikijs/langs/clojure',
  '@shikijs/langs/lua',
  '@shikijs/langs/perl',
  '@shikijs/langs/r',
  '@shikijs/langs/matlab',
  '@shikijs/langs/json',
  '@shikijs/langs/html',
  '@shikijs/langs/css',
  '@shikijs/langs/markdown',
  '@shikijs/langs/yaml',
  '@shikijs/langs/toml',
  '@shikijs/langs/xml',
  '@shikijs/langs/ini',
  '@shikijs/langs/graphql',
  '@shikijs/langs/http',
  '@shikijs/langs/shellscript',
  '@shikijs/langs/powershell',
  '@shikijs/langs/dockerfile',
  '@shikijs/langs/nginx',
  '@shikijs/langs/sql',
  '@shikijs/langs/diff',
]

export default defineConfig({
  srcDir: './demo',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['shiki/bundle/full', ...shikiLanguageDeps],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  integrations: [
    react(),
    astrobook({
      subpath: '/playground',
      directory: 'demo/stories',
      css: ['./demo/styles/tailwind.css', './demo/styles/astrobook.css'],
      head: './demo/components/astrobook-head.astro',
      title: 'ProseKit MUI Playground',
      homeContent: {
        title: 'ProseKit MUI Playground',
        subtitle: 'Material UI v7 primitives with Tailwind-driven component styling.',
        version: {
          label: `v${version}`,
          href: '#',
        },
        repo: {
          href: 'https://github.com/ocavue/astrobook',
          label: 'Powered by Astrobook',
        },
      },
    }),
  ],
})

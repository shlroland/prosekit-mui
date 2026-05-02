import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import astrobook from 'astrobook'

import { version } from './package.json'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    astrobook({
      subpath: '/playground',
      directory: 'demo/stories',
      css: ['./demo/styles/tailwind.css', './demo/styles/astrobook.css'],
      head: './demo/components/AstrobookHead.astro',
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

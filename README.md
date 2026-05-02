# ProseKit MUI Playground

This repository contains a small [Astro](https://astro.build/) demo app with an
[Astrobook](https://github.com/ocavue/astrobook) playground mounted at
`/playground`, while keeping `src/` available for the actual ProseKit + MUI
integration source code.

The playground is prepared for:

- `@mui/material` v7 as the component primitive layer
- Tailwind CSS v4 as the primary styling approach for app components
- Emotion only as the runtime styling engine required by Material UI

## Package management

This project uses `aube` as the package manager.

- Install or sync dependencies: `aube install`
- Start the dev server: `aube run dev`
- Build the site: `aube run build`
- Preview the production build: `aube run preview`

This project disables Aube's global virtual store with `.npmrc` because
Astro/Vite dev serving can otherwise resolve React integration files from
`~/.cache/aube/virtual-store`, which falls outside Vite's filesystem allow list.

## Demo layout

Astrobook and the demo site now live under `demo/`.

- `demo/pages`: Astro demo pages
- `demo/stories`: Astrobook stories
- `demo/components`: Astrobook-only support components
- `demo/styles`: demo and Astrobook styles

Add new Astrobook stories under `demo/stories` using
`.stories.ts`, `.stories.tsx`, `.stories.js`, or `.stories.jsx`.

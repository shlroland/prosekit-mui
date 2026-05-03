# Project Rules

- Use `aube` as the package manager for this repository.
- Do not use `npm`, `pnpm`, or `yarn` for install, script, or dependency management tasks.
- Use `aube install` to sync dependencies from `package.json` and `aube-lock.yaml`.
- Use `aube run <script>` to run package scripts such as `dev`, `build`, and `preview`.
- Use `aube exec <binary>` when invoking local project binaries directly.
- Use `aube add <pkg>` and `aube remove <pkg>` for dependency changes.
- Keep `aube-lock.yaml` in sync with dependency changes.
- Prefer named imports and named exports throughout the project.
- Do not introduce default imports or default exports unless a framework or tool requires them, such as Astro config or Astrobook story metadata.
- Use `kebab-case` for new file and directory names across `src/` and `demo/`.

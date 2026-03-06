# [Thesis Website](https://thesis-php.github.io)

Central documentation website for the `thesis-php` organization, powered by VitePress.

## Requirements

- Node.js 20+
- npm
- git

## Install

```bash
npm ci
```

## Commands

- `npm run docs:dev`  
  Start local VitePress dev server.

- `npm run docs:sync`  
  Sync package docs from GitHub repositories into local `drivers/` and `low-level/`.

- `npm run docs:build`  
  Build static site output.

- `npm run docs:preview`  
  Preview built static site locally.

## Content Layout

- `index.md` - home page
- `drivers/` - synced package docs for driver packages
- `low-level/` - synced package docs for low-level packages
- `public/` - static assets
- `.vitepress/` - VitePress config and theme files

## Package Source of Truth

Package lists are declared in:

- `packages.mjs`

Each section (`drivers`, `low-level`) contains package objects:

```js
{ name: 'amqp', title: 'Amqp' }
```

- `name` is used for repository sync and URL path.
- `title` is used for sidebar labels.

Order in `packages.mjs` is preserved in generated navigation/sidebar.

## How Sync Works

`npm run docs:sync` executes `scripts/sync.mjs`.

For every package in every section:

1. Clone `https://github.com/thesis-php/<package>.git` (shallow clone).
2. Target output directory is:
   - `drivers/<package>/` for `drivers`
   - `low-level/<package>/` for `low-level`
3. If repository has `docs/`, copy `docs/` into target directory.
4. If `docs/` does not exist, fallback to `README.md` as `index.md`.
5. Post-process markdown links:
   - Keep local links if copied target exists.
   - If local target is not copied but exists in source repo, rewrite to absolute GitHub URL (`blob`/`tree`) for the repository default branch.

This keeps builds clean while preserving useful links to examples/licenses in source repos.

## Notes

- Synced package folders are git-ignored by default:
  - `drivers/*/`
  - `low-level/*/`
- `.gitignore` keeps root placeholders (like `.gitignore` files inside section folders) tracked.

## Deployment Updates

- Documentation is rebuilt and deployed automatically once per day (GitHub Actions schedule).
- You can also [trigger deployment manually](https://github.com/thesis-php/thesis-php.github.io/actions/workflows/deploy.yml).

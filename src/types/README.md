# `src/types/`

Application-local types that are shared across several features but don't
belong to any single one. Empty by default -- add files as the app grows.

Example of what fits: a `Paginated<T>` wrapper this MFE uses in three
features, or an app-wide `Theme` union.

## What does NOT go here

| | Goes instead in |
|---|---|
| Build-time constants (`__API_BASE_URL__`) | `src/env.ts` -- declared file-scoped so nothing leaks globally |
| Domain types (`User`, `Order`, `Property`) | `features/{domain}/{domain}.types.ts` |
| Component prop types | the component's own file, next to the component |
| Types that cross a service boundary (API DTOs) | `@lynkflow/types`, and only if they're genuinely a contract -- see `architecture.md` |

## Why there's no `assets.d.ts`

CSS imports (`import "./styles.css"` in `App.tsx`) would normally need an
ambient `declare module "*.css"`. `tsconfig.json` sets
`noUncheckedSideEffectImports: false` instead -- that declaration is a wildcard
and never caught a mistyped path anyway, so it added a file without adding
safety. Webpack and Jest both still fail loudly on a missing asset.

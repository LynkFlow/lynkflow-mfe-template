# lynkflow-mfe-template

Template for a LynkFlow microfrontend. Copy it, rename `example` to your
domain, add your first feature on top of the reusable pieces it ships with. It
boots, builds, and has a green test suite on day one so you always have a
working baseline to diff against.

Platform-wide rules live one level up, in the workspace root's
`.claude/rules/` -- this repo itself carries no Claude-specific files
(deliberate: this template, and every MFE generated from it, should stand on
its own without depending on the workspace's AI tooling context). This
README covers everything you need to work inside a generated MFE without
that external context.

**What this template deliberately does NOT ship:** a fake CRUD feature wired
into `App.tsx`/`Routes.tsx`. Earlier drafts of this template did, and it made
every generated MFE inherit dead example code that had to be hunted down and
deleted. Instead, the reusable _concerns_ (API calls, loading, errors, i18n)
are generic, global infrastructure you build your real feature on top of --
see §3.

---

## 1. Turn this template into a real MFE

1. **Copy the folder** and name it `lynkflow-{domain}-ui` (e.g. `lynkflow-users-ui`).
2. **Find-and-replace, case-sensitively:**
   - `example` → `users` (lowercase: `package.json` name/description, and the
     `src/features/example/` folder name -- rename it to `src/features/users/`)
3. **Copy `.env.example` to `.env`** and set `MFE_NAME` (must match the key
   the Shell uses in its own `remotes` map) and `PORT` (this MFE's own
   dev-server port -- agree it with whoever owns the Shell's dev setup so two
   MFEs never collide on one machine). See §2 for what else lives there.
4. Delete `src/features/{domain}/pages/ExamplePage.tsx` and replace the
   placeholder route in `Routes.tsx` with your first real page -- its
   `components/` and `hooks/` subfolders stay; they're infrastructure every
   feature needs, not example content. See §3 for where things go.
5. `npm install && npm run dev`.

## 2. Configuration: `.env`

Everything that needs to be configured centrally for this MFE lives in
`.env`, not scattered across source files:

| Variable       | Used for                                                                | Default if unset   |
| -------------- | ----------------------------------------------------------------------- | ------------------ |
| `MFE_NAME`     | Module Federation remote name; must match the Shell's `remotes` key     | `example`          |
| `PORT`         | Standalone dev-server port (`npm run dev`)                              | `3001`             |
| `API_BASE_URL` | This domain's backend base URL, baked in as `__API_BASE_URL__` at build | `/api/${MFE_NAME}` |

`.env.example` is the committed template (copy it to `.env`, which is
gitignored, per §1). `webpack.config.mjs` loads it via `dotenv` and falls back
to the defaults above if a variable -- or the whole file -- is missing, so a
fresh clone with no `.env` yet still builds. Adding a new value that needs to
be configured per-environment (a feature flag, a second backend URL, ...)
follows the same pattern: add it to `.env.example` with a comment, read it in
`webpack.config.mjs`, and if the browser bundle needs it at runtime, expose it
through `webpack.DefinePlugin` + a file-scoped `declare const` in `src/env.ts`
(see §5 for why this is no longer `src/types/globals.d.ts`).

## 3. Where things go

```
src/
├── index.ts                    MF async boundary — don't put logic here
├── bootstrap.tsx                standalone dev render only (no Shell) --
│                                 includes a dev-only RTL/language switcher
├── App.tsx                     ← MF export "./App"    (providers, language)
├── Routes.tsx                  ← MF export "./Routes" (this MFE's route tree)
├── styles.css                  Tailwind utilities only (no preflight — see §7)
│
├── api/
│   ├── httpClient.ts           generic createApiClient() factory — reusable,
│   │                            domain-agnostic (see §4)
│   └── {domain}Client.ts       your domain's client, built on httpClient.ts
│                                (doesn't exist yet — you add it)
│
├── components/                 shared *within this MFE* only
│   ├── ErrorFallback/          ⚠ temporary — moves to @lynkflow/ui-kit
│   ├── PageLoadingSkeleton/    ⚠ temporary — moves to @lynkflow/ui-kit
│   ├── RouteBoundary/          the route-level error/loading wrapper — see §4
│   └── QueryBoundary/          the per-query loading/error/empty/success
│                                wrapper — see §4
│
├── features/
│   └── example/                 one folder per domain concept — this one is
│                                 scaffolding for the placeholder domain;
│                                 rename it when you rename `example` (§1)
│       ├── pages/
│       │   └── ExamplePage.tsx  ⚠ scaffolding — delete once you add a real
│       │                        page, but its LOCATION is the real pattern
│       │                        (a worked example — see its own docblock)
│       ├── components/         empty (.gitkeep) — feature-specific
│       │                        components (+ tests) go here
│       ├── hooks/               empty (.gitkeep) — TanStack Query hooks go
│       │                        here (see §4)
│       └── example.types.ts    doesn't exist yet — types shared across this
│                                feature go here once you have one
│
├── i18n/                       en.json / ar.json (start EMPTY) + this MFE's
│                                i18next instance + a getDirection() helper
├── test/                       renderWithProviders helper, jest globals
└── types/                      app-wide types shared across SEVERAL features
                                 — see §5. NOT ambient declarations (there
                                 aren't any anymore), NOT domain types, NOT
                                 build-time constants
```

**Decision guide for a new file:**

| You're adding…                                           | It goes…                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| A generic, domain-free UI element (Button, Modal, Table) | `@lynkflow/ui-kit` — **not here**                               |
| A component that knows about your domain                 | `features/{domain}/components/`                                 |
| A component reused by several features in this MFE       | `src/components/`                                               |
| A new screen                                             | `features/{domain}/pages/` + a route in `Routes.tsx`            |
| A backend call                                           | `api/{domain}Client.ts` (built on `api/httpClient.ts`) + a hook |
| Rendering a query's loading/error/empty/success states   | `<QueryBoundary query={...}>` — never hand-rolled per page      |
| Your domain's data shapes (`User`, `Order`, ...)         | `features/{domain}/{domain}.types.ts` — **not** `src/types/`    |
| A type shared across SEVERAL features, owned by none     | `src/types/` — see §5                                           |
| User-facing text                                         | `i18n/en.json` **and** `i18n/ar.json` — never inline            |
| A color / spacing / radius value                         | a token in `@lynkflow/ui-kit` — never hardcoded                 |

## 4. The reusable concerns: API calls, loading, errors

These are the actual reusable deliverables of this template. Every generated
MFE gets them for free; none of them are tied to a specific domain, and none
of them are hardcoded to one behavior -- each has an override point.

**Quick reference -- every shared component in `src/components/` and what it's for:**

| Component             | Catches                                                          | Renders by default                      |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| `RouteBoundary`       | A whole page crashing, or its lazy chunk failing to load         | `PageLoadingSkeleton` / `ErrorFallback` |
| `QueryBoundary`       | One `useQuery()` result's loading/error/empty state              | `PageLoadingSkeleton` / `ErrorFallback` |
| `PageLoadingSkeleton` | (nothing -- it's the loading UI itself, used by both boundaries) | --                                      |
| `ErrorFallback`       | (nothing -- it's the error UI itself, used by both boundaries)   | --                                      |

`RouteBoundary` and `QueryBoundary` are the two _decision-making_ components
(they choose what to render based on state); `PageLoadingSkeleton` and
`ErrorFallback` are the two _visual_ components they render by default and
that either boundary can be told to render something else instead. Detail on
each below.

**The default loading/error visuals are generic on purpose, not final.**
`PageLoadingSkeleton` is a plain shimmer block and `ErrorFallback` is a plain
message + retry button — they exist so a brand-new page isn't left with a
blank screen while loading or a raw stack trace on failure, not because every
page should look like that forever. Once a real page's layout exists, its
loading state usually reads much better as a skeleton shaped like _that page_
(matching card/list/table layout, not a generic block), and a domain-specific
error screen (illustration, tone, a more specific recovery action than
"retry") often fits the product better than the shared default. Both
`RouteBoundary` and `QueryBoundary` already support this per call site —
`loadingFallback`/`fallback` — so building a custom skeleton or a custom error
component for a specific feature is expected, normal usage, not a deviation
from the pattern. The shared defaults are the floor, not the ceiling.

**API calls** — `api/httpClient.ts` exports `createApiClient(baseUrl)`, a
domain-agnostic fetch wrapper: typed `get`/`post`/`put`/`patch`/`delete`,
normalized `ApiError`/`ApiRequestError` (with `fieldErrors` keyed by field
name per `business-domain.md`). Build your domain's client on top of it:

```ts
// api/usersClient.ts
import { createApiClient } from "./httpClient";
import type { User } from "../features/users/users.types";

const apiClient = createApiClient(__API_BASE_URL__);

export const usersClient = {
  list: () => apiClient.get<User[]>(""),
  getById: (id: string) => apiClient.get<User>(`/${encodeURIComponent(id)}`),
};
```

This stays a local file, not a published package, until a second real MFE
repo exists to actually prove the abstraction is worth sharing -- extracting
it to `@lynkflow/api-client` before then would be speculative. If/when that
happens, only this one file changes (an import swap), nothing that consumes
it does.

**Where hooks go** — server state goes through **TanStack Query**
(`@tanstack/react-query`, already wired up in `App.tsx` via
`QueryClientProvider`), never hand-rolled `useEffect` + `useState` + `fetch`.
That's already decided platform-wide; the only open question per feature is
where the hook that calls `useQuery`/`useMutation` lives. Answer:
`features/{domain}/hooks/`, one file per concept, built on top of the
`api/{domain}Client.ts` from above -- **not** in `api/` (that folder is
transport-layer clients only, no React) and **not** at `src/` root (there's
no generic hooks dumping ground, same reasoning as everywhere else in this
platform). `features/example/hooks/` is already scaffolded, empty, ready for
this:

```ts
// features/users/hooks/useUsers.ts
import { useQuery } from "@tanstack/react-query";

import { usersClient } from "../../../api/usersClient";

export const usersKeys = { all: ["users"] as const };

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.all,
    queryFn: () => usersClient.list(),
  });
}
```

A page then calls `useUsers()` and renders the result through
`QueryBoundary`, below.

**Route-level errors and loading** — `components/RouteBoundary` wraps a route
in an `ErrorBoundary` + `Suspense` pair with **overridable** defaults, so
catching "this page crashed" or "this page's lazy chunk failed to load" isn't
hardcoded to one fallback:

```tsx
<RouteBoundary
  fallback={CustomErrorScreen} // optional, defaults to the shared ErrorFallback
  loadingFallback={<CustomSkeleton />} // optional, defaults to PageLoadingSkeleton
  onError={(error) => reportToMonitoring(error)} // optional, no-op by default
>
  <SomePage />
</RouteBoundary>
```

**Per-query loading and errors** — `components/QueryBoundary` renders a
TanStack Query result's loading/error/empty/success states consistently, so a
page only ever implements the success view:

```tsx
const query = useUsers(); // a useQuery() hook from your feature

return (
  <QueryBoundary
    query={query}
    isEmpty={(users) => users.length === 0}
    emptyFallback={<p>{t("users.list.empty")}</p>}
  >
    {(users) => <UserList users={users} />}
  </QueryBoundary>
);
```

`QueryBoundary` is the finer-grained of the two layers: `RouteBoundary`
catches a page crashing outright; `QueryBoundary` handles the far more common
case of one query on an otherwise-healthy page failing or still loading. Both
default to the same shared `ErrorFallback`/`PageLoadingSkeleton`, but neither
is locked to them -- override per call site when a specific page needs
something else.

**i18n** — see §6.

## 5. `src/types/` — application-local shared types (not declarations, not domain types)

This folder used to hold `assets.d.ts` and `globals.d.ts`, two **ambient
global declaration files**. Both are gone now — removed once their reason for
existing went away:

- `globals.d.ts` declared the webpack-injected build constants
  (`__API_BASE_URL__`, ...) as globals. Superseded by `src/env.ts`, which
  declares the same constants **file-scoped** instead (`declare const` inside
  a module, not leaked globally) — see §2. Every value that used to live in
  `globals.d.ts` now lives there.
- `assets.d.ts` held one line, `declare module "*.css"`, so `import
"./styles.css"` would typecheck. It was dropped in favor of setting
  `noUncheckedSideEffectImports: false` in `tsconfig.json`: the wildcard
  declaration never actually caught a typo'd path either way (`import
"./styels.css"` typechecked fine with or without it) — it bought a file, not
  safety. A missing or misspelled asset still fails loudly where it actually
  can be caught: webpack fails the build, Jest fails the test.

**So `src/types/` is no longer an ambient-declarations folder at all.** Its
purpose now: application-local types that are genuinely shared across
**several** features but aren't owned by any single one — e.g. a `Paginated<T>`
wrapper three different feature lists reuse, or an app-wide `Theme` union.
It ships empty; add files as the app actually grows into needing them, not
speculatively.

**What still does NOT go here:**

| Type                                                    | Goes instead in                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Build-time constants (`__API_BASE_URL__`, ...)          | `src/env.ts` — file-scoped, not global                                              |
| Your domain's data shapes (`User`, `Order`, `Property`) | `features/{domain}/{domain}.types.ts`                                               |
| A component's own prop types                            | The component's own file, next to it                                                |
| Types that cross a service boundary (API DTOs)          | `@lynkflow/types` — and only if they're genuinely a contract, see `architecture.md` |

Don't delete this folder when specializing the template for a real domain —
it's infrastructure every MFE eventually needs, not scaffolding like
`ExamplePage.tsx`. See `src/types/README.md` for the same guidance colocated
with the folder itself.

## 6. Localization and RTL

- Each MFE owns its own i18next instance and its own `en.json`/`ar.json` (they
  ship empty in this template). Keys are namespaced `{domain}.{module}.{key}`.
- The **active language is a prop**, not local state: `App.tsx` receives
  `language` from the Shell and calls `setLanguage()`. This MFE never reads or
  stores the language itself.
- **Direction is derived, not stored separately.** `i18n/index.ts` exports
  `getDirection(language)`, a pure lookup against a small RTL-languages set
  (currently just `ar`) -- there's no independent "is this RTL" state to keep
  in sync with the language.
- `<html lang>`/`<html dir>` belong to the Shell, globally, once. RTL then
  falls out of Tailwind's logical utilities (`ps-*`/`pe-*`, `ms-*`/`me-*`,
  `start-*`/`end-*`, `text-start`) automatically inheriting `direction` from
  `<html dir>` — no per-component RTL logic needed once the Shell sets it.
- **Locale is a user-profile preference, not a URL parameter** -- there's no
  `/en/...` vs `/ar/...` prefix anywhere in this app's routes, on purpose (the
  workspace root's `i18n.md` has the full reasoning). Don't add a locale
  segment to `Routes.tsx` if you're building the Shell's route map later.
- **Because `lynkflow-shell` doesn't exist yet, there's no runtime language
  switcher in this template at all** — standalone dev fakes the Shell's
  `language` prop with a single **build-time** value instead. `.env`'s
  `DEV_LANGUAGE` (default `en`) is read by `webpack.config.mjs` and used in
  two places: baked directly into `public/index.html`'s `<html lang>`/`dir`
  via `HtmlWebpackPlugin`'s `templateParameters` (so the static HTML is
  already correct before any JS runs), and passed into `<App
language={env.devLanguage} />` in `bootstrap.tsx` via the
  `__DEV_LANGUAGE__` constant declared in `src/env.ts`. **To preview Arabic/RTL
  locally: set `DEV_LANGUAGE=ar` in `.env` and restart `npm run dev`** — this
  is a full rebuild, not a live in-browser toggle, and that's deliberate: a
  fixed, restart-to-change value is simpler than runtime switcher UI for
  something only ever used while developing this one MFE in isolation. See
  `bootstrap.tsx`'s own docblock and `webpack.config.mjs`'s `DEV_LANGUAGE`
  section for the full mechanism.
- **This is a standalone-dev-only stand-in, not a preview of how it'll really
  work.** In production there's no `.env`, no build-time bake, and no
  restart: the Shell sets `<html lang>`/`dir` at **runtime**, from the
  logged-in user's stored profile preference (or a pre-login guess via
  `navigator.language` / a remembered cookie), via a synchronous inline
  `<script>` in the Shell's own `index.html` `<head>` — before any stylesheet
  or bundle loads, so there's no visible flash of the wrong direction while
  the JS is still downloading. That mechanism lives in `lynkflow-shell`, which
  doesn't exist yet; the workspace root's `i18n.md` ("Avoiding a flash of the
  wrong direction on first paint" and "Locale source of truth") has the full
  design. This MFE's own role once mounted under a real Shell stays exactly
  what §"active language is a prop" above says: receive `language`, call
  `setLanguage()`, never touch `<html>` itself — `bootstrap.tsx` and `env.ts`
  stop being relevant entirely, since the Shell imports `./App` directly.

## 7. Styling

Tailwind v4, themed from `@lynkflow/ui-kit`'s tokens via `tailwind.config.ts`.
Colors and border-radius are pulled in with `{ ...color }` / `{ ...radius }`
spreads rather than re-listing every token key by hand -- the ui-kit's token
object's own keys are already exactly the Tailwind names this project wants.
If the ui-kit ever ships a token that shouldn't become a Tailwind value here,
that's the point to switch back to an explicit allow-list, not something to
guard against preemptively.

`src/styles.css` deliberately imports Tailwind's **theme + utilities only**, not
the all-in-one `@import "tailwindcss"`, because that would also emit preflight
(the global reset + base typography). The ui-kit's stylesheet already ships
preflight and the Shell imports it once — if every MFE emitted its own, the page
would carry one reset per loaded MFE and cascade order would decide the winner.

Also required (see `styling.md`): RTL-safe logical utilities (`ps-*`/`pe-*`,
`ms-*`/`me-*`, `text-start`), a visible `focus-visible` state on anything
interactive, `aria-busy` + a decorative spinner rather than swapping out labels,
and merging any `className` prop instead of overwriting it.

## 8. Scripts

```bash
npm run dev          # standalone dev server (this MFE alone, no Shell)
npm run build        # production build -> dist/remoteEntry.js
npm run typecheck    # tsc --noEmit, one-off
npm run typecheck:watch  # tsc --noEmit --watch -- run in a SECOND terminal
                          # alongside `npm run dev`; re-checks automatically on
                          # every save instead of you re-running `typecheck` by
                          # hand. Deliberately a separate process, not folded
                          # into webpack -- babel-loader only strips types
                          # syntactically (fast, no type info), so `npm run dev`
                          # alone will build past a real type error. Your editor
                          # already shows type errors live as you type; this is
                          # for a terminal-visible check without touching the
                          # webpack build's speed.
npm test             # jest
npm run test:watch
npm run test:coverage
npm run format
npm run update:lynkflow  # deliberate, reviewable bump of @lynkflow/config
                          # and @lynkflow/ui-kit to their latest published
                          # version -- see §9 for why this isn't the same
                          # as pinning "latest" in package.json
```

A Husky pre-commit hook runs Prettier, related tests, and a full type-check.
`git commit --no-verify` is the escape hatch for a genuinely broken hook.

## 9. Known deviations from the ui-kit's setup

Don't "fix" any of these without reading the reasoning first.

- **`@lynkflow/ui-kit` and `@lynkflow/config` use normal caret ranges**
  (`^0.1.0`, `^0.0.1`), not the `latest` dist-tag. Both packages are pre-1.0,
  so the caret is already tight — `^0.1.0` only allows `>=0.1.0 <0.2.0`,
  `^0.0.1` only allows exactly `0.0.1` — npm's own semver rules treat a
  pre-1.0 package as unstable by default, which is the right default here:
  an MFE shouldn't silently pick up a breaking `0.2.0` just from running
  `npm install`. When you deliberately want the newest published version,
  run `npm run update:lynkflow` — it runs `npm install
@lynkflow/config@latest @lynkflow/ui-kit@latest`, which resolves the
  `latest` tag **once, right now**, and writes the concrete resulting version
  into `package.json`/`package-lock.json` as a normal, reviewable diff. That's
  a deliberate, on-demand bump — not the same thing as writing the literal
  string `"latest"` into `package.json`, which would silently float on every
  future install instead.
- **No `.js` extensions on relative imports.** The ui-kit is a published library
  using `moduleResolution: nodenext`, which requires them. This is a bundled app
  using `moduleResolution: bundler`, which doesn't.
- **`webpack.config.mjs`, not `.ts`.** This repo is on TypeScript 6.x, where a
  `webpack.config.ts` actually works (verified) — so this is a deliberate
  choice, not a forced workaround: a `.ts` config buys type-checking of this
  one file at the cost of a `ts-node` dependency and a transpile step on every
  webpack invocation, which isn't worth it when `npm run typecheck` (`tsc
--noEmit`) already covers `src/` in full. (Earlier, on TypeScript 7, this
  really was forced — `ts-node` drives the TS compiler API programmatically,
  which breaks on TS 7's missing stable API. The platform rolled back to TS 6
  on 10 Aug 2026; see the workspace root's `tooling.md`.)

## 10. Temporary: `ErrorFallback` and `PageLoadingSkeleton`

These two live in `src/components/` but **belong in `@lynkflow/ui-kit`** so
every MFE has the same _default_ loading and failure states available. They're
local only because ui-kit doesn't ship them yet. When it does: delete both
folders and import from the package instead. `RouteBoundary` and
`QueryBoundary` (§4) will each need a one-line import update at that point,
nothing else.

This move doesn't change how customizable they are — it only changes where the
_default_ comes from. As covered in §4, a page or feature is always free to
pass its own loading skeleton or error component via
`loadingFallback`/`fallback` when the shared default doesn't fit — that stays
true whether the default is this local component or the future ui-kit one.

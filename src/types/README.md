# `src/types/`

Two kinds of file belong here:

1. **Ambient declarations** that must be global to work -- currently
   `assets.d.ts`, which tells TypeScript that `import "./styles.css"` is a
   valid module. A `declare module "*.css"` can't be scoped to one file, so it
   has to live in a `.d.ts` like this.

2. **App-wide shared types** -- shapes used across several features that don't
   belong to any single one.

What does NOT belong here:

- **Build-time constants.** Those live in `src/env.ts`, declared file-scoped so
  they don't leak into the global namespace.
- **Domain types.** A `User`, an `Order`, a `Property` belongs to its feature:
  `features/{domain}/{domain}.types.ts` (see `naming-conventions.md`).
- **Component prop types.** Those stay in the component's own file.

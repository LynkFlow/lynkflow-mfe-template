/**
 * Side-effect CSS imports carry no runtime value -- webpack's css-loader turns
 * them into injected <style> tags. TypeScript still needs to know the modules
 * exist, or it rejects the import.
 *
 * NOT where domain types go (same note as globals.d.ts). This file only
 * teaches TypeScript that importing a non-JS asset (`*.css` today; add
 * `*.svg`, `*.png`, etc. here too if this MFE starts importing those) is
 * valid. It has no relationship to your domain's data shapes -- those go in
 * `features/{domain}/{domain}.types.ts`.
 */
declare module "*.css";

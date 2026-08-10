/**
 * SCAFFOLDING ONLY -- delete this file once you've added a real page.
 *
 * Two jobs at once:
 *  1. Gives the template a route to render on day one, so it boots and
 *     builds without a real feature yet.
 *  2. Is a worked example of where a page actually lives: this file's own
 *     location (`features/example/pages/ExamplePage.tsx`) IS the pattern
 *     described in README.md §3's decision table -- copy this file's
 *     placement, not its content, when you add your first real page.
 *
 * Its text is intentionally NOT wired through i18n: it never ships
 * (README.md §1 has you delete it before your first real feature), and
 * `src/i18n/en.json` / `ar.json` start empty on purpose -- translation
 * content belongs to the domain this template becomes, not to the template
 * itself.
 *
 * This page renders no data on purpose. For a page that DOES fetch and
 * render data, see `components/QueryBoundary` (README.md §4) for the
 * loading/error/empty/success pattern and `api/httpClient.ts` for the API
 * client pattern -- both are the actual reusable parts of this template.
 * `features/example/hooks/` and `features/example/components/` are already
 * scaffolded (empty, `.gitkeep`-only) for exactly that next step.
 */
export default function ExamplePage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-xl font-bold text-neutral-900">
        This microfrontend has no pages yet
      </h1>
      <p className="text-sm text-neutral-500">
        Replace ExamplePage.tsx with your first real route. See README.md for the
        template-to-MFE checklist.
      </p>
    </div>
  );
}

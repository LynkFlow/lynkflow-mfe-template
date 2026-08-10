import type { Config } from "tailwindcss";
import { color, radius, typography } from "@lynkflow/ui-kit";

/**
 * Theme values are imported from @lynkflow/ui-kit's design tokens -- never
 * redefined locally. If a value you need isn't a token yet, add it to the
 * ui-kit rather than hardcoding it here (.claude/rules/styling.md).
 *
 * `color` and `radius` are spread directly rather than re-listing each key:
 * the ui-kit's token object's own keys (`primary`, `neutral`, `success`, ...)
 * are already exactly the Tailwind color/radius names this project wants, so
 * there's nothing to rename or filter. If the ui-kit ever adds a token this
 * project should NOT expose as a Tailwind value, that's the point where this
 * goes back to an explicit allow-list -- don't reach for that preemptively.
 *
 * `radius` still needs one addition on top of the spread: Tailwind's
 * `DEFAULT` key (what plain `rounded` resolves to, with no suffix) isn't a
 * token name on its own, so it's aliased to `radius.md` after the spread.
 */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ...color },
      borderRadius: { ...radius, DEFAULT: radius.md },
      fontFamily: {
        sans: [typography.fontFamily.base],
      },
    },
  },
} satisfies Config;

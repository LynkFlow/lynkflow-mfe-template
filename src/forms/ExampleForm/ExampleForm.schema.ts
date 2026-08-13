import { z } from "zod";

/**
 * Worked example of the platform's chosen form-validation pattern -- see
 * .claude/rules/forms.md at the workspace root for the full decision and
 * why it's baked into this template. Delete this file along with
 * ExampleForm.tsx once you've built your first real form; keep the
 * *pattern* (schema colocated with its form, `{FormName}.schema.ts`).
 *
 * The schema is the single source of truth for both the TS type
 * (`ExampleFormValues`, inferred below -- never hand-written separately,
 * or the two will drift) and the validation rules react-hook-form runs on
 * submit/blur via the zod resolver in ExampleForm.tsx.
 *
 * Message copy is written the way it'll actually reach the user: through
 * `{ message: "..." }` on each rule, matching business-domain.md's
 * "validation messages must identify the offending field" -- each message
 * is field-specific by construction here, not a form-level banner.
 */
export const exampleFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please complete all mandatory fields." })
    .email({ message: "Please enter a valid email format." }),
  code: z
    .string()
    .length(6, { message: "Please enter the full 6-digit code." })
    .regex(/^\d+$/, { message: "The code can only contain digits." }),
});

export type ExampleFormValues = z.infer<typeof exampleFormSchema>;

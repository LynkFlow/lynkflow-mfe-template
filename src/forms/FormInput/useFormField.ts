import { useController, useFormContext } from "react-hook-form";
import type { FieldPath, FieldValues } from "react-hook-form";

/**
 * Thin adapter over react-hook-form's `useController`, scoped to whichever
 * form is currently provided via `<FormProvider>` (see
 * `.claude/rules/forms.md` at the workspace root for the full pattern).
 * This is what makes a field component like `FormInput` need nothing from
 * its call site except a field `name` -- no `register()`, no `control`
 * threaded through props, no reading `formState.errors` by hand.
 *
 * Private to `FormInput` -- not re-exported from `index.ts`. Nothing else in
 * this template calls it directly. If a future `FormCodeDigit` or similar
 * field wrapper needs it too (react-hook-form's `field.onChange` already
 * accepts either a native change event or a raw value, so the same `field`
 * object would work for a `value`/`onChange(value)`-style control unchanged),
 * that's the point to promote it back out to `forms/useFormField.ts` as
 * shared infrastructure -- not before, since a single-consumer "shared"
 * hook is really just an implementation detail wearing a public label.
 *
 * `name` isn't typed against a specific form's schema unless the caller
 * opts in with an explicit generic (`useFormField<ExampleFormValues>("email")`)
 * -- see `FormInput`'s own docblock for why that's the deliberate default.
 */
export function useFormField<TFieldValues extends FieldValues = FieldValues>(
  name: FieldPath<TFieldValues>,
) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController<TFieldValues>({ name, control });

  // Dots show up in nested field names (e.g. "address.street"); harmless in
  // an `id` attribute, but swapped for dashes so it never looks like it's
  // trying to be a CSS selector if someone greps the DOM.
  const id = name.replace(/\./g, "-");

  return {
    field,
    error: fieldState.error?.message,
    id,
    messageId: `${id}-message`,
  };
}

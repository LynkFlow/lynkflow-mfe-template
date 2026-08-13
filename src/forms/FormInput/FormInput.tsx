import type { FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@lynkflow/ui-kit";
import type { InputProps } from "@lynkflow/ui-kit";

import { useFormField } from "./useFormField";

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<InputProps, "id" | "name" | "value" | "onChange" | "onBlur" | "error"> {
  /** The field's name in the enclosing form -- same string `register()` would take. */
  name: FieldPath<TFieldValues>;
}

/**
 * A form field with zero manual wiring at the call site -- no `register()`,
 * no reading `formState.errors`, no hand-written `aria-invalid` /
 * `aria-describedby`. Render it inside a `<FormProvider {...form}>` and it
 * reads its own value and error straight off the form via `name`:
 *
 * ```tsx
 * <FormProvider {...form}>
 *   <FormInput<ExampleFormValues> name="email" label="Email" isRequired />
 * </FormProvider>
 * ```
 *
 * Renders `@lynkflow/ui-kit`'s real `Input` -- `useFormField` supplies
 * `field` (spread straight onto `Input`, same shape `Input` already
 * expects: `value`/`onChange`/`onBlur`/`ref`/`name`) and `error` (mapped to
 * `Input.error`, which already owns its own `aria-invalid`,
 * `aria-describedby`, and error-message rendering -- this component doesn't
 * duplicate any of that). `label`/`isRequired`/`helperText`/`size` and every
 * other native input prop just pass straight through to `Input` unchanged.
 *
 * 13 Aug 2026: this used to live in a separate `@lynkflow/forms` package,
 * built specifically to defer the `@lynkflow/ui-kit` dependency to "later."
 * Moved back into the template by explicit developer decision -- this repo
 * already depends on `@lynkflow/ui-kit` directly, so there was no real
 * boundary being protected by the extra package, just an extra repo to
 * maintain. See `.claude/rules/forms.md` for the full history.
 */
export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  ...rest
}: FormInputProps<TFieldValues>) {
  const { field, error, id } = useFormField<TFieldValues>(name);

  // Conditional spread, not `error={error}` directly -- Input.error is
  // typed `string`, not `string | undefined` (exactOptionalPropertyTypes),
  // so an explicit `undefined` (the common "no error yet" case) isn't
  // assignable even though the prop itself is optional. Omitting the key
  // entirely is what exactOptionalPropertyTypes actually wants.
  return (
    <Input {...field} id={id} {...(error !== undefined ? { error } : {})} {...rest} />
  );
}

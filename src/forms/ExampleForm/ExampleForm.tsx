import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@lynkflow/ui-kit";
import { FormInput } from "../FormInput";

import { exampleFormSchema } from "./ExampleForm.schema";
import type { ExampleFormValues } from "./ExampleForm.schema";

export interface ExampleFormProps {
  onSubmit: (values: ExampleFormValues) => void;
}

/**
 * SCAFFOLDING ONLY -- delete alongside ExamplePage.tsx once you've built a
 * real form. This is a worked example of the platform's chosen
 * form-validation pattern (see .claude/rules/forms.md at the workspace
 * root for the full decision): react-hook-form owns field state and
 * submission, a zod schema (ExampleForm.schema.ts, colocated right next
 * to this file) defines the rules and the message copy, and `<FormInput>`
 * (`src/forms/FormInput`, this template's own) reads its value and
 * error straight off the form via `name` -- no `register()`, no
 * `formState.errors` lookup, no hand-written `aria-invalid`/
 * `aria-describedby` at this call site. The whole form only needs to wrap
 * its fields in react-hook-form's own `<FormProvider>` so `FormInput` can
 * reach the form's `control`.
 *
 * `FormInput` renders `@lynkflow/ui-kit`'s real `Input` component --
 * `src/forms/useFormField.ts` supplies `field`/`error`, spread straight onto
 * `Input`, which already owns its own label/mandatory-indicator/error
 * rendering and `aria-invalid`/`aria-describedby` wiring. This used to live
 * in a separate `@lynkflow/forms` package; moved back here by explicit
 * developer decision on 13 Aug 2026 -- see `.claude/rules/forms.md` for the
 * full history.
 */
export function ExampleForm({ onSubmit }: ExampleFormProps) {
  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: { email: "", code: "" },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormInput<ExampleFormValues> name="email" label="Email" isRequired />
        <FormInput<ExampleFormValues>
          name="code"
          label="Verification code"
          inputMode="numeric"
          isRequired
        />

        <Button type="submit" disabled={isSubmitting}>
          Submit
        </Button>
      </form>
    </FormProvider>
  );
}

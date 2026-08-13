import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { FormInput } from "./FormInput";

interface Values {
  email: string;
}

function Harness({ defaultHelperText }: { defaultHelperText?: string }) {
  const form = useForm<Values>({ defaultValues: { email: "" } });

  const validateAndMaybeSetError = () => {
    if (!form.getValues("email")) {
      form.setError("email", {
        message: "Please complete all mandatory fields.",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          validateAndMaybeSetError();
        }}
      >
        <FormInput<Values>
          name="email"
          label="Email"
          isRequired
          {...(defaultHelperText !== undefined
            ? { helperText: defaultHelperText }
            : {})}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("FormInput", () => {
  it("renders the label, marks it mandatory, and needs no manual aria wiring at the call site", () => {
    render(<Harness />);

    const input = screen.getByLabelText("Email *");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("renders the real ui-kit Input, not a bare native input", () => {
    render(<Harness />);

    // Input's own floating-label mechanism always sets a single-space
    // placeholder (see Input.tsx) -- a bare <input> built by hand wouldn't
    // have this. This is a regression guard against silently falling back
    // to a plain <input> again.
    expect(screen.getByLabelText("Email *")).toHaveAttribute("placeholder", " ");
  });

  it("shows helper text when the field has no error", () => {
    render(<Harness defaultHelperText="We'll never share this." />);

    expect(screen.getByText("We'll never share this.")).toBeInTheDocument();
  });

  it("sets aria-invalid and aria-describedby, and renders the field's error message, once it's set", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const input = await screen.findByLabelText("Email *");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const message = await screen.findByText("Please complete all mandatory fields.");
    expect(input).toHaveAttribute("aria-describedby", message.id);
  });

  it("replaces helper text with the error message once the field is invalid", async () => {
    const user = userEvent.setup();
    render(<Harness defaultHelperText="We'll never share this." />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Please complete all mandatory fields."),
    ).toBeInTheDocument();
    expect(screen.queryByText("We'll never share this.")).not.toBeInTheDocument();
  });

  it("updates the field's value as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByLabelText("Email *");
    await user.type(input, "person@lynkflow.com");

    expect(input).toHaveValue("person@lynkflow.com");
  });
});

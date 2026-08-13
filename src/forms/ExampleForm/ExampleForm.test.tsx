import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ExampleForm } from "./ExampleForm";

describe("ExampleForm", () => {
  it("blocks submission and shows field-specific messages for invalid input", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<ExampleForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email *"), "not-an-email");
    await user.type(screen.getByLabelText("Verification code *"), "12");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Please enter a valid email format."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please enter the full 6-digit code.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("marks invalid fields with aria-invalid, associated to their message via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<ExampleForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const email = await screen.findByLabelText("Email *");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute(
      "aria-describedby",
      screen.getByText("Please complete all mandatory fields.").id,
    );
  });

  it("rejects a code with non-digit characters", async () => {
    const user = userEvent.setup();
    render(<ExampleForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText("Email *"), "person@lynkflow.com");
    await user.type(screen.getByLabelText("Verification code *"), "12a456");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("The code can only contain digits."),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with the parsed values once every field is valid", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<ExampleForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email *"), "person@lynkflow.com");
    await user.type(screen.getByLabelText("Verification code *"), "123456");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith(
      { email: "person@lynkflow.com", code: "123456" },
      expect.anything(),
    );
  });

  it("clears a field's error once corrected and resubmitted", async () => {
    const user = userEvent.setup();
    render(<ExampleForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText("Email *"), "not-an-email");
    await user.type(screen.getByLabelText("Verification code *"), "123456");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(
      await screen.findByText("Please enter a valid email format."),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Email *"));
    await user.type(screen.getByLabelText("Email *"), "person@lynkflow.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.queryByText("Please enter a valid email format."),
    ).not.toBeInTheDocument();
  });
});

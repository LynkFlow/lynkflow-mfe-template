import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { act, renderHook } from "@testing-library/react";

import { useFormField } from "./useFormField";

interface Values {
  "user.email": string;
}

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm<Values>({ defaultValues: { "user.email": "" } });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("useFormField", () => {
  it("replaces dots in the field name with dashes for the id/messageId, leaving the RHF field name untouched", () => {
    const { result } = renderHook(() => useFormField<Values>("user.email"), {
      wrapper: Wrapper,
    });

    expect(result.current.id).toBe("user-email");
    expect(result.current.messageId).toBe("user-email-message");
    expect(result.current.field.name).toBe("user.email");
  });

  it("has no error message before the field is touched or validated", () => {
    const { result } = renderHook(() => useFormField<Values>("user.email"), {
      wrapper: Wrapper,
    });

    expect(result.current.error).toBeUndefined();
  });

  it("reflects a value written through field.onChange", () => {
    const { result } = renderHook(() => useFormField<Values>("user.email"), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.field.onChange("person@lynkflow.com");
    });

    expect(result.current.field.value).toBe("person@lynkflow.com");
  });
});

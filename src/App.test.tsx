import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "./App";
import i18n from "./i18n/index";

describe("App", () => {
  it("renders its routed content", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("This microfrontend has no pages yet"),
    ).toBeInTheDocument();
  });

  it("syncs the i18n instance to the language prop passed in by the Shell", async () => {
    render(
      <MemoryRouter>
        <App language="ar" />
      </MemoryRouter>,
    );

    await screen.findByText("This microfrontend has no pages yet");
    expect(i18n.language).toBe("ar");
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Routes from "./Routes";

describe("Routes", () => {
  it("renders the index route wrapped in RouteBoundary", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes />
      </MemoryRouter>,
    );

    // ExamplePage is lazy-loaded, so it appears after Suspense resolves.
    expect(
      await screen.findByText("This microfrontend has no pages yet"),
    ).toBeInTheDocument();
  });
});

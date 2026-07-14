import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./register";

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./register-form", () => ({
  default: () => <div data-testid="register-form">RegisterForm</div>,
}));

describe("Register page", () => {
  it("renders the register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });
});

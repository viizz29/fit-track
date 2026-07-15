import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterForm from "./register-form";
import { MemoryRouter } from "react-router-dom";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("../../api/auth-api", () => ({
  registerApi: vi.fn(),
}));

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe("RegisterForm", () => {
  it("renders all form fields", () => {
    renderRegisterForm();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders the Register button", () => {
    renderRegisterForm();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("renders the login link", () => {
    renderRegisterForm();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders the page title", () => {
    renderRegisterForm();
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
  });
});

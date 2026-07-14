import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./login-form";

vi.mock("../../context/use-auth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
    isAuthReady: true,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  })),
}));

vi.mock("../../api/auth-api", () => ({
  loginApi: vi.fn(),
  getProfileApi: vi.fn(),
  verifyOtpLoginApi: vi.fn(),
}));

vi.mock("../../assets/ftrk-logo", () => ({
  default: () => <div>FtrkLogo</div>,
}));

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the Login button", () => {
    renderLoginForm();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders register link", () => {
    renderLoginForm();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderLoginForm();
    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
  });

  it("renders resend verification link", () => {
    renderLoginForm();
    expect(screen.getByText("Resend verification email")).toBeInTheDocument();
  });

  it("renders the login title", () => {
    renderLoginForm();
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });
});

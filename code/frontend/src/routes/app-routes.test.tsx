import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./app-routes";

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({
    user: null,
    isAuthReady: true,
    token: null,
    isAuthenticated: false,
  }),
}));

vi.mock("@/components/navigate-setter", () => ({
  default: () => null,
}));

vi.mock("@/components/layouts/main-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/pages/dashboard/dashboard", () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));

vi.mock("@/pages/auth/login", () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

vi.mock("@/pages/auth/register", () => ({
  default: () => <div data-testid="register-page">Register</div>,
}));

vi.mock("@/pages/auth/forgot-password", () => ({
  default: () => <div data-testid="forgot-password-page">ForgotPassword</div>,
}));

vi.mock("@/pages/auth/reset-password", () => ({
  default: () => <div data-testid="reset-password-page">ResetPassword</div>,
}));

vi.mock("@/pages/auth/verify-email", () => ({
  default: () => <div data-testid="verify-email-page">VerifyEmail</div>,
}));

vi.mock("@/pages/auth/resend-verification", () => ({
  default: () => <div data-testid="resend-verification-page">ResendVerification</div>,
}));

vi.mock("@/pages/exercises/exercises", () => ({
  default: () => <div data-testid="exercises-page">Exercises</div>,
}));

vi.mock("@/pages/schedules/schedules", () => ({
  default: () => <div data-testid="schedules-page">Schedules</div>,
}));

vi.mock("@/pages/completions-history/completions-history", () => ({
  default: () => <div data-testid="completions-page">Completions</div>,
}));

vi.mock("@/pages/reports/reports", () => ({
  default: () => <div data-testid="reports-page">Reports</div>,
}));

vi.mock("@/pages/calendar/calendar", () => ({
  default: () => <div data-testid="calendar-page">Calendar</div>,
}));

vi.mock("@/pages/profile/profile", () => ({
  default: () => <div data-testid="profile-page">Profile</div>,
}));

vi.mock("@/pages/misc/not-found", () => ({
  default: () => <div data-testid="not-found-page">NotFound</div>,
}));

describe("AppRoutes", () => {
  it("renders login page for unauthenticated user at /login", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  it("renders register page for unauthenticated user", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("register-page")).toBeInTheDocument();
    });
  });

  it("renders forgot password page", async () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("forgot-password-page")).toBeInTheDocument();
    });
  });

  it("renders not found page for unknown routes", async () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    });
  });

  it("renders verify email page", async () => {
    render(
      <MemoryRouter initialEntries={["/verify-email"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("verify-email-page")).toBeInTheDocument();
    });
  });

  it("renders reset password page", async () => {
    render(
      <MemoryRouter initialEntries={["/reset-password"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("reset-password-page")).toBeInTheDocument();
    });
  });
});

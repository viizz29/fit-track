import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./auth-provider";
import { useContext } from "react";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

vi.mock("@/providers/local-storage-provider", () => ({
  useStorage: () => ({
    get: vi.fn((key: string) => {
      if (key === "token") return null;
      if (key === "user") return null;
      return null;
    }),
    set: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock("@/api/auth-api", () => ({
  getProfileApi: vi.fn().mockRejectedValue(new Error("Network")),
  logoutApi: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/utils/navigate", () => ({
  clearAuthAndRedirect: vi.fn(),
}));

function TestConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="is-auth-ready">{String(ctx?.isAuthReady)}</span>
      <span data-testid="is-authenticated">{String(ctx?.isAuthenticated)}</span>
      <span data-testid="user">{JSON.stringify(ctx?.user)}</span>
      <span data-testid="token">{ctx?.token ?? "null"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders children after auth is ready with no stored token", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-auth-ready")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("provides login function via context", async () => {
    vi.mocked(jwtDecode).mockReturnValue({
      sub: "user1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    } as any);

    let loginFn: ((token: string, profile?: any) => void) | undefined;

    function CaptureLogin() {
      const ctx = useContext(AuthContext);
      loginFn = ctx?.login;
      return <div data-testid="ready">{String(ctx?.isAuthReady)}</div>;
    }

    render(
      <AuthProvider>
        <CaptureLogin />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    expect(loginFn).toBeDefined();
  });

  it("provides logout function via context", async () => {
    let logoutFn: (() => void) | undefined;

    function CaptureLogout() {
      const ctx = useContext(AuthContext);
      logoutFn = ctx?.logout;
      return <div data-testid="ready">{String(ctx?.isAuthReady)}</div>;
    }

    render(
      <AuthProvider>
        <CaptureLogout />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    expect(logoutFn).toBeDefined();
  });
});

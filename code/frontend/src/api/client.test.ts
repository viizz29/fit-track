import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "./client";
import { clearAuthAndRedirect } from "@/utils/navigate";

vi.mock("@/utils/navigate", () => ({
  clearAuthAndRedirect: vi.fn(),
}));

describe("API client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an axios instance with correct baseURL", () => {
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBeDefined();
  });

  it("sets Content-Type header to application/json", () => {
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("adds Authorization header from localStorage token", async () => {
    localStorage.setItem("token", "my-jwt-token");

    const config = {
      url: "/test",
      method: "get",
      headers: {} as Record<string, string>,
    } as any;

    const resolved = await api.interceptors.request.handlers[0].fulfilled(config);
    expect(resolved.headers.Authorization).toBe("Bearer my-jwt-token");
  });

  it("parses JSON-wrapped token from localStorage", async () => {
    localStorage.setItem("token", '"quoted-token"');

    const config = {
      url: "/test",
      method: "get",
      headers: {} as Record<string, string>,
    } as any;

    const resolved = await api.interceptors.request.handlers[0].fulfilled(config);
    expect(resolved.headers.Authorization).toBe("Bearer quoted-token");
  });

  it("does not set Authorization when no token exists", async () => {
    const config = {
      url: "/test",
      method: "get",
      headers: {} as Record<string, string>,
    } as any;

    const resolved = await api.interceptors.request.handlers[0].fulfilled(config);
    expect(resolved.headers.Authorization).toBeUndefined();
  });

  it("calls clearAuthAndRedirect on 401 response", async () => {
    const error = { response: { status: 401 } };

    try {
      await api.interceptors.response.handlers[0].rejected(error);
    } catch {
      // expected rejection
    }

    expect(clearAuthAndRedirect).toHaveBeenCalled();
  });

  it("does not call clearAuthAndRedirect on non-401 error", async () => {
    const error = { response: { status: 500 } };

    try {
      await api.interceptors.response.handlers[0].rejected(error);
    } catch {
      // expected rejection
    }

    expect(clearAuthAndRedirect).not.toHaveBeenCalled();
  });

  it("rejects the promise on error", async () => {
    const error = { response: { status: 500 }, message: "Server Error" };

    await expect(
      api.interceptors.response.handlers[0].rejected(error)
    ).rejects.toEqual(error);
  });
});

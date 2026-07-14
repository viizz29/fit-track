import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loginApi,
  logoutApi,
  registerApi,
  getProfileApi,
  updateProfileApi,
  forgotPasswordApi,
  resetPasswordApi,
  verifyEmailApi,
  resendEmailVerificationLink,
  verifyOtpLoginApi,
  toggle2faApi,
  getEmailPreferencesApi,
  updateEmailPreferencesApi,
} from "./auth-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("auth-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loginApi sends POST with email and password", async () => {
    const mockData = { token: "jwt", user: { id: 1 } };
    mockApi.post.mockResolvedValue({ data: mockData });

    const result = await loginApi("test@test.com", "pass123");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/login", {
      email: "test@test.com",
      password: "pass123",
    });
    expect(result).toEqual(mockData);
  });

  it("logoutApi sends POST to logout endpoint", async () => {
    mockApi.post.mockResolvedValue({});

    await logoutApi();

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/logout");
  });

  it("registerApi sends POST with name, email, password", async () => {
    const mockResponse = { status: 201, data: { message: "OK" } };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await registerApi("John", "j@j.com", "secret");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/register", {
      name: "John",
      email: "j@j.com",
      password: "secret",
    });
    expect(result).toBe(mockResponse);
  });

  it("getProfileApi sends GET to /api/v1/users/me", async () => {
    const profile = { id: 1, name: "John" };
    mockApi.get.mockResolvedValue({ data: profile });

    const result = await getProfileApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/me");
    expect(result).toEqual(profile);
  });

  it("updateProfileApi sends PATCH with profile data", async () => {
    const data = { name: "Updated" };
    mockApi.patch.mockResolvedValue({ data });

    const result = await updateProfileApi(data);

    expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/users/me", data);
    expect(result).toEqual(data);
  });

  it("forgotPasswordApi sends POST with email", async () => {
    mockApi.post.mockResolvedValue({ data: { message: "sent" } });

    const result = await forgotPasswordApi("test@test.com");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/forgot-password", {
      email: "test@test.com",
    });
    expect(result).toEqual({ message: "sent" });
  });

  it("resetPasswordApi sends POST with token and password", async () => {
    mockApi.post.mockResolvedValue({ data: { message: "reset" } });

    const result = await resetPasswordApi("tok123", "newpass");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/reset-password", {
      token: "tok123",
      password: "newpass",
    });
    expect(result).toEqual({ message: "reset" });
  });

  it("verifyEmailApi sends POST with token", async () => {
    mockApi.post.mockResolvedValue({ data: { verified: true } });

    const result = await verifyEmailApi("verify-token");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/verify-email", {
      token: "verify-token",
    });
    expect(result).toEqual({ verified: true });
  });

  it("resendEmailVerificationLink sends POST with email", async () => {
    const response = { status: 200, data: {} };
    mockApi.post.mockResolvedValue(response);

    const result = await resendEmailVerificationLink("test@test.com");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/resend-verification", {
      email: "test@test.com",
    });
    expect(result).toBe(response);
  });

  it("verifyOtpLoginApi sends POST with tempToken and otp", async () => {
    mockApi.post.mockResolvedValue({ data: { token: "jwt" } });

    const result = await verifyOtpLoginApi("temp-tok", "123456");

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/verify-otp-login", {
      tempToken: "temp-tok",
      otp: "123456",
    });
    expect(result).toEqual({ token: "jwt" });
  });

  it("toggle2faApi sends POST with enabled flag", async () => {
    mockApi.post.mockResolvedValue({ data: { enabled: true } });

    const result = await toggle2faApi(true);

    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/auth/toggle-2fa", {
      enabled: true,
    });
    expect(result).toEqual({ enabled: true });
  });

  it("getEmailPreferencesApi sends GET", async () => {
    mockApi.get.mockResolvedValue({ data: { emailNotifications: true } });

    const result = await getEmailPreferencesApi();

    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/me/email-preferences");
    expect(result).toEqual({ emailNotifications: true });
  });

  it("updateEmailPreferencesApi sends PUT", async () => {
    const prefs = { emailNotifications: false };
    mockApi.put.mockResolvedValue({ data: prefs });

    const result = await updateEmailPreferencesApi(prefs);

    expect(mockApi.put).toHaveBeenCalledWith("/api/v1/users/me/email-preferences", prefs);
    expect(result).toEqual(prefs);
  });
});

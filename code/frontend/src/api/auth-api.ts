import api from "./client";

export type ProfileData = {
  email?: string;
  name?: string;
  timezone?: string;
};

export const logoutApi = async () => {
  await api.post("/api/v1/auth/logout");
};

export const getProfileApi = async () => {
  const response = await api.get("/api/v1/users/me");
  return response.data;
};

export const updateProfileApi = async (data: ProfileData) => {
  const response = await api.patch("/api/v1/users/me", data);
  return response.data;
};

export type EmailPreferences = {
  emailNotifications: boolean;
};

export const getEmailPreferencesApi = async (): Promise<EmailPreferences> => {
  const response = await api.get("/api/v1/users/me/email-preferences");
  return response.data;
};

export const updateEmailPreferencesApi = async (
  prefs: EmailPreferences,
): Promise<EmailPreferences> => {
  const response = await api.put("/api/v1/users/me/email-preferences", prefs);
  return response.data;
};

export const loginApi = async (email: string, password: string) => {
  const response = await api.post("/api/v1/auth/login", {
    email,
    password,
  });

  return response.data;
  // expected: { token: "...", user: {...} }
};

export const registerApi = async (
  email: string,
  password: string,
  timezone: string,
) => {
  const response = await api.post("/api/v1/auth/register", {
    email,
    password,
    timezone,
  });
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await api.post("/v1/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, password: string) => {
  const response = await api.post("/v1/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};

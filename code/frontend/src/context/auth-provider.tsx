import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useStorage } from "@/providers/local-storage-provider";
import { getProfileApi, logoutApi } from "@/api/auth-api";
import { clearAuthAndRedirect } from "@/utils/navigate";

export type UserProfile = {
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  timezone?: string;
  is2faEnabled?: boolean;
};

type User = UserProfile & {
  sub?: string;
  exp?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (token: string, profile?: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { get, set, remove } = useStorage();

  const login = (newToken: string, profile?: UserProfile) => {
    set("token", newToken);
    if (profile) {
      set("user", profile);
    }

    const decoded: User = jwtDecode(newToken);

    setToken(newToken);
    setUser({ ...decoded, ...profile });
  };

  const updateProfile = useCallback((profile: UserProfile) => {
    set("user", profile);
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
  }, [set]);

  const logout = useCallback(() => {
    logoutApi().catch(() => {});
    remove("token");
    remove("user");
    setToken(null);
    setUser(null);
  }, [remove]);

  useEffect(() => {
    (async () => {
      const storedToken = get("token") as string;

      if (storedToken) {
        try {
          const decoded: User = jwtDecode(storedToken);

          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            remove("token");
            remove("user");
          } else {
            const storedUser = get("user") as UserProfile | null;
            setToken(storedToken);
            setUser({ ...decoded, ...(storedUser || {}) });

            try {
              const profile = await getProfileApi();
              set("user", profile);
              setUser({ ...decoded, ...profile });
            } catch {
              // Use cached profile if fetch fails
            }
          }
        } catch {
          remove("token");
          remove("user");
        }
      }

      setIsAuthReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    const exp = user?.exp;
    if (!exp) return;
    const msUntilExpiry = exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      clearAuthAndRedirect();
      return;
    }
    const timeout = setTimeout(() => {
      clearAuthAndRedirect();
    }, msUntilExpiry);
    return () => clearTimeout(timeout);
  }, [token, user?.exp]);

  return (
    isAuthReady ? (
      <AuthContext.Provider
        value={{
          user,
          token,
          isAuthenticated: !!user,
          isAuthReady,
          login,
          logout,
          updateProfile,
        }}
      >
        {children}
      </AuthContext.Provider>
    ) : (
      <div>Loading auth state ...</div>
    )
  );
};

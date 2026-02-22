import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  name: string;
  email: string;
  initial: string;
  country: string;
  county: string;
  roles: string[];
  currency: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("agrihubx_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem("agrihubx_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("agrihubx_user");
    setUser(null);
  }, []);

  return { user, isLoggedIn: !!user, login, logout };
};

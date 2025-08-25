import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, setTokenProvider } from "../api/client";

type User = {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  // Let api client read the latest token
  useEffect(() => {
    setTokenProvider(() => token);
  }, [token]);

  // Bootstrap current user if token exists
  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!token) { setUser(null); setLoading(false); return; }
      setLoading(true);
      try {
        const me = await apiFetch<User>("/api/v1/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          // invalid token -> clear
          localStorage.removeItem("access_token");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMe();
    return () => { cancelled = true; };
  }, [token]);

  async function signIn(email: string, password: string) {
    const data = await apiFetch<{ access_token: string; token_type: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    const me = await apiFetch<User>("/api/v1/auth/me");
    setUser(me);
  }

  function signOut() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextType>(() => ({ user, token, loading, signIn, signOut }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

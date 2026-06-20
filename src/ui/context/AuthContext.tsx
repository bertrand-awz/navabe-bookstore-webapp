import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../../domain/models";
import { api } from "../../infrastructure/api/client";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(data: Record<string, string>): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setUser(await api.auth.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => void refresh(), []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        setUser(await api.auth.login(email, password));
      },
      async register(data) {
        setUser(await api.auth.register(data));
      },
      async logout() {
        try {
          await api.auth.logout();
        } finally {
          setUser(null);
        }
      },
      refresh,
    }),
    [loading, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

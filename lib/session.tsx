"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { type AuthUser, getToken, getUser, clearSession } from "./api";

type SessionContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => void;
  signOut: () => void;
};

const Ctx = createContext<SessionContextValue | null>(null);

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getUser();
    setUser(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = pathname ? PUBLIC_PATHS.has(pathname) : false;
    const hasToken = Boolean(getToken());
    if (!hasToken && !isPublic) router.replace("/login");
    if (hasToken && pathname === "/login") router.replace("/");
  }, [loading, pathname, router]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      loading,
      refresh: () => setUser(getUser()),
      signOut: () => {
        clearSession();
        setUser(null);
        router.replace("/login");
      },
    }),
    [user, loading, router],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

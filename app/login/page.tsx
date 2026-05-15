"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "../../lib/api";
import { useSession } from "../../lib/session";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("grow@bylmtm.com");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "sign-in") await signIn(email, password);
      else await signUp(email, password, name || email);
      refresh();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 bg-card rounded-lg border border-border">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">LMTM Panel</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "sign-in" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "sign-up" ? (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              autoComplete="name"
            />
          ) : null}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => {
            setError(null);
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { getPocketBase } from "@/lib/pocketbase";

export interface AuthUser {
  id: string;
  email: string;
  reg_number?: string;
  name?: string;
}

export interface SignUpInput {
  email: string;
  regNumber: string;
  password: string;
  passwordConfirm: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

function toAuthUser(record: Record<string, unknown>): AuthUser {
  return {
    id: record.id as string,
    email: record.email as string,
    reg_number: record.reg_number as string | undefined,
    name: record.name as string | undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore and validate the persisted session against PocketBase on mount.
  React.useEffect(() => {
    let cancelled = false;
    const pb = getPocketBase();

    async function init() {
      if (pb.authStore.isValid) {
        try {
          const authData = await pb.collection("users").authRefresh();
          if (!cancelled) setUser(toAuthUser(authData.record));
        } catch {
          pb.authStore.clear();
          if (!cancelled) setUser(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = React.useCallback(async (input: SignUpInput) => {
    const pb = getPocketBase();

    const created = await pb.collection("users").create({
      email: input.email,
      password: input.password,
      passwordConfirm: input.passwordConfirm,
      reg_number: input.regNumber,
    });

    // Auto-login after a successful signup so the user lands on the dashboard.
    const authData = await pb
      .collection("users")
      .authWithPassword(created.email, input.password);

    setUser(toAuthUser(authData.record));
  }, []);

  const logIn = React.useCallback(async (email: string, password: string) => {
    const pb = getPocketBase();
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    setUser(toAuthUser(authData.record));
  }, []);

  const logOut = React.useCallback(async () => {
    const pb = getPocketBase();
    pb.authStore.clear();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, signUp, logIn, logOut }),
    [user, isLoading, signUp, logIn, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const USER_ROLES = [
  "SaaS Owner",
  "Brand Admin",
  "Supervisor",
  "Agent",
  "Assistant",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

export const DEMO_USERS: readonly AuthUser[] = [
  {
    id: "saas-owner",
    name: "Sarah Chen",
    email: "owner@ipaycash.demo",
    role: "SaaS Owner",
  },
  {
    id: "brand-admin",
    name: "Omar Ben Salah",
    email: "admin@ipaycash.demo",
    role: "Brand Admin",
  },
  {
    id: "supervisor",
    name: "Nadia Trabelsi",
    email: "supervisor@ipaycash.demo",
    role: "Supervisor",
  },
  {
    id: "agent",
    name: "Yassine Kallel",
    email: "agent@ipaycash.demo",
    role: "Agent",
  },
  {
    id: "assistant",
    name: "Meriem Jaziri",
    email: "assistant@ipaycash.demo",
    role: "Assistant",
  },
];

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  "SaaS Owner": "Platform-wide visibility, brands, revenue, risk, and system controls.",
  "Brand Admin": "Manage one brand's players, payment flows, distributors, and finance.",
  Supervisor: "Monitor operations, supervise agents, queues, and exceptions.",
  Agent: "Work assigned payment cases, verify activity, and resolve daily queues.",
  Assistant: "Handle follow-ups, administrative tasks, and lightweight operational support.",
};

const AUTH_STORAGE_KEY = "ipaycash_mock_auth";

type AuthContextValue = {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (role: UserRole) => AuthUser;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

function isStoredUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    isUserRole(candidate.role) &&
    (typeof candidate.avatar === "string" || candidate.avatar === undefined)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (isStoredUser(parsed)) {
          setUser(parsed);
        }
      }
    } catch {
      // Ignore malformed demo session data and start logged out.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = (role: UserRole) => {
    const demoUser = DEMO_USERS.find((candidate) => candidate.role === role) ?? DEMO_USERS[0];
    setUser(demoUser);

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // In-memory auth still works if storage is unavailable.
    }

    return demoUser;
  };

  const logout = () => {
    setUser(null);

    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage access errors.
    }
  };

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      login,
      logout,
    }),
    [user, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export function hasRole(role: UserRole | null | undefined, allowedRoles: readonly UserRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}

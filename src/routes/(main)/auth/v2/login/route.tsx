import { useEffect, useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Globe, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/app-config";
import {
  DEMO_USERS,
  ROLE_DESCRIPTIONS,
  USER_ROLES,
  useAuth,
  type UserRole,
} from "@/stores/auth/auth-provider";
import { cn } from "cn";

export const Route = createFileRoute("/(main)/auth/v2/login")({
  component: LoginV2,
});

const roleAccent: Record<UserRole, string> = {
  "SaaS Owner": "Platform",
  "Brand Admin": "Brand",
  Supervisor: "Operations",
  Agent: "Queue",
  Assistant: "Support",
};

function LoginV2() {
  const navigate = useNavigate();
  const { user, isHydrated, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Brand Admin");

  useEffect(() => {
    if (isHydrated && user) {
      navigate({ to: "/dashboard/" });
    }
  }, [isHydrated, user, navigate]);

  const handleLogin = () => {
    login(selectedRole);
    navigate({ to: "/dashboard/" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-5 py-8 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border bg-background shadow-sm lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="hidden border-r bg-muted/25 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                  <Sparkles className="size-4" />
                </div>
                {APP_CONFIG.name}
              </div>

              <div className="mt-14 max-w-sm">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Role-based access
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                  One workspace.
                  <br />
                  Different responsibilities.
                </h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Choose the role you want to preview. Each role receives its own operational dashboard,
                  navigation, and level of access.
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Mock authentication</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    This environment uses a local demo session. No backend credentials are required.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="p-5 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Login</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose a role</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a demo identity to enter the matching dashboard.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="size-3.5" />
                ENG
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {USER_ROLES.map((role) => {
                const demoUser = DEMO_USERS.find((candidate) => candidate.role === role);
                const selected = selectedRole === role;

                return (
                  <button key={role} type="button" onClick={() => setSelectedRole(role)} className="text-left">
                    <Card
                      className={cn(
                        "h-full shadow-none transition-colors",
                        selected && "border-foreground ring-1 ring-foreground",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{role}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{roleAccent[role]}</p>
                          </div>
                          <div
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full border",
                              selected ? "border-foreground bg-foreground text-background" : "border-border",
                            )}
                          >
                            {selected ? <Check className="size-3.5" /> : null}
                          </div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>

                        <div className="mt-4 border-t pt-3">
                          <p className="truncate text-xs font-medium">{demoUser?.name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{demoUser?.email}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>

            <Button className="mt-5 h-11 w-full" type="button" onClick={handleLogin}>
              Continue as {selectedRole}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By continuing, you are entering the ipaycash demo environment.
            </p>

            <div className="mt-8 flex justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>{APP_CONFIG.copyright}</span>
              <span>Demo access</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

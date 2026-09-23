import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  CreditCard,
  FileClock,
  Globe2,
  Languages,
  LockKeyhole,
  ListFilter,
  Settings2,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsNav, type SettingsKey } from "./settings-data";

const iconMap = {
  general: Settings2,
  languages: Languages,
  security: LockKeyhole,
  notifications: Bell,
  "audit-log": FileClock,
  billing: CreditCard,
  features: SlidersHorizontal,
  "portal-routing": ListFilter,
  "custom-domain": Globe2,
  "team-access": UsersRound,
} as const;

export function SettingsShell({
  active,
  title,
  description,
  children,
}: {
  active: SettingsKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage platform preferences, access, controls and account configuration.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 p-2 pt-0">
            {settingsNav.map((item) => {
              const Icon = iconMap[item.key];
              const activeClass = item.key === active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground";
              return (
                <Link
                  key={item.key}
                  to={("/dashboard/settings/" + item.key) as any}
                  className={"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors " + activeClass}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <div className="min-w-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">Frontend-only template with default mock data. No setting is persisted to a backend.</p>
    </section>
  );
}

export function SettingCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

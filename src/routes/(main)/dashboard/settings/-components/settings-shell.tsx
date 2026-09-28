import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsKey } from "./settings-data";

export function SettingsShell({
  title,
  description,
  children,
}: {
  active?: SettingsKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div>
        <Link
          to="/dashboard/settings"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="min-w-0">{children}</div>

      <p className="text-[11px] text-muted-foreground">
        Frontend-only template with default mock data. No setting is persisted to a backend.
      </p>
    </section>
  );
}

export function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
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

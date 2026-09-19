import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowRight, Bell, CreditCard, FileClock, Languages, LockKeyhole, Settings2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  ["general", "General", "Workspace identity, regional defaults and company profile.", Settings2],
  ["languages", "Languages", "Language, locale, timezone and formatting preferences.", Languages],
  ["security", "Security", "Authentication policies, sessions and access protection.", LockKeyhole],
  ["notifications", "Notifications", "Operational alerts, channel preferences and notification rules.", Bell],
  ["audit-log", "Audit log", "Administrative activity history.", FileClock],
  ["billing", "Billing", "Plan, invoices and payment configuration.", CreditCard],
  ["features", "Features", "Platform modules, availability and rollout controls.", SlidersHorizontal],
] as const;

export const Route = createFileRoute("/(main)/dashboard/settings")({
  component: Page,
});

function Page() {
  const { pathname } = useLocation();

  if (pathname !== "/dashboard/settings") {
    return <Outlet />;
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Central configuration for platform preferences, security, notifications, billing and feature controls.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([key, title, description, Icon]) => (
          <Link key={key} to={("/dashboard/settings/" + key) as any}>
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="pt-2 text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{description}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Frontend-only template with default mock data.</p>
    </section>
  );
}

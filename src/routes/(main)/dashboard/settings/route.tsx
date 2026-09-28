import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CreditCard,
  FileClock,
  FileCog,
  FileUp,
  Globe2,
  HardDrive,
  IdCard,
  Languages,
  ListFilter,
  LockKeyhole,
  PlugZap,
  Settings2,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  ["general", "General", "Workspace identity, regional defaults, wallet formatting and support details.", Settings2],
  ["languages", "Languages", "Language, locale, timezone and number/date formatting preferences.", Languages],
  ["security", "Security", "Authentication, session protection, wallet security and merchant API controls.", LockKeyhole],
  ["notifications", "Notifications", "Operational notification channels, alert events and sound preferences.", Bell],
  ["integration-center", "Integration Center", "Payment providers, security services, messaging and other platform connections.", PlugZap],
  ["kyc-verification", "KYC Verification", "Player identity verification, automation and risk thresholds.", IdCard],
  ["agent-program", "Agent Program", "Distributor onboarding, commissions, eligibility and application rules.", UsersRound],
  ["media-uploads", "Media & Uploads", "Payment evidence, KYC documents, attachments and upload limits.", FileUp],
  ["system-health", "System Health", "Operational monitoring, retention and alert behavior.", HardDrive],
  ["maintenance", "Maintenance", "Controlled downtime settings and access recovery configuration.", FileCog],
  ["audit-log", "Audit log", "Administrative activity history and configuration changes.", FileClock],
  ["billing", "Billing", "Plan, invoices and payment configuration.", CreditCard],
  ["features", "Features", "Platform capabilities, rollout state and module controls.", SlidersHorizontal],
  ["portal-routing", "Portal Routing", "Ordering priorities for payment methods shown in the customer portal.", ListFilter],
  ["custom-domain", "Custom Domain", "Branded dashboard and payment portal domains.", Globe2],
  ["team-access", "Team & Access", "Workspace members, roles and permissions.", UsersRound],
] as const;

export const Route = createFileRoute("/(main)/dashboard/settings")({
  component: Page,
});

function Page() {
  const { pathname } = useLocation();

  if (pathname !== "/dashboard/settings" && pathname !== "/dashboard/settings/") {
    return <Outlet />;
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Configure PayMine from one central settings hub. Open any card to manage that area.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {cards.map(([key, title, description, Icon]) => (
          <Link key={key} to={("/dashboard/settings/" + key) as any} className="group block">
            <Card className="h-full rounded-lg py-0 shadow-none transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm">
              <CardContent className="flex min-h-32 items-start gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-medium leading-5">{title}</h2>
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Settings are currently frontend configuration screens; values are presented as local defaults until backend persistence is connected.
      </p>
    </section>
  )
}

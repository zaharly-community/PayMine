import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, PlugZap, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/(main)/dashboard/integrations")({ component: Page });

const integrations = [
  { name: "D17", category: "Payment provider", description: "Shared payment account connectivity for deposits and withdrawals.", status: "Connected", account: "D17-SHARED-01", health: "Operational" },
  { name: "Flouci", category: "Payment provider", description: "Wallet-based payment operations and account verification.", status: "Connected", account: "FL-PRIMARY", health: "Operational" },
  { name: "Slack", category: "Notifications", description: "Send finance, settlement and security alerts to operations channels.", status: "Connected", account: "#paymine-ops", health: "Operational" },
  { name: "HubSpot", category: "CRM", description: "Sync distributor and account lifecycle information.", status: "Available", account: "Not connected", health: "Ready" },
  { name: "Sentry", category: "Observability", description: "Capture frontend errors and release health signals.", status: "Available", account: "Not connected", health: "Ready" },
  { name: "Google Workspace", category: "Identity", description: "Enterprise sign-in and directory synchronization.", status: "Available", account: "Not connected", health: "Ready" },
];

function Page() {
  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <div><h1 className="text-2xl font-semibold tracking-tight">Integrations</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Connect payment providers, identity systems, notifications and operational services from one place.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{integrations.map((item) =>
      <Card key={item.name} className="h-full"><CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><PlugZap className="size-4" /></div><Badge variant={item.status === "Connected" ? "secondary" : "outline"}>{item.status === "Connected" ? <CheckCircle2 className="size-3.5" /> : null}{item.status}</Badge></div>
        <CardTitle className="pt-2 text-base">{item.name}</CardTitle><p className="text-xs text-muted-foreground">{item.category}</p>
      </CardHeader><CardContent><p className="min-h-10 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-4 rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Connection</p><p className="mt-1 text-sm font-medium">{item.account}</p><p className="mt-1 text-xs text-muted-foreground">Health · {item.health}</p></div><div className="mt-4 flex items-center gap-2"><Button size="sm">{item.status === "Connected" ? <><Settings2 /> Configure</> : "Connect"}</Button><Button size="icon" variant="outline" aria-label="Open documentation"><ExternalLink /></Button></div></CardContent></Card>
    )}</div>
    <p className="text-[11px] text-muted-foreground">Frontend-only integration template. No provider credentials are stored or transmitted.</p>
  </section>;
}

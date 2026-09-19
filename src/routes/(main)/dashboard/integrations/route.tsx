import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, ChevronRight, Database, ExternalLink, Gauge, KeyRound, LockKeyhole, Megaphone, MessageSquare, PlugZap, Save, Search, Settings2, ShieldCheck, SlidersHorizontal, Webhook, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type IntegrationCategory = "Providers" | "Analytics" | "CRM & Marketing" | "Communications" | "Monitoring & Security" | "Identity";

type Integration = {
  id: string;
  name: string;
  initials: string;
  category: IntegrationCategory;
  description: string;
  status: "Connected" | "Available";
  accent: string;
  config: "provider" | "analytics" | "crm" | "communication" | "monitoring" | "identity";
  meta: string;
};

const integrations: Integration[] = [
  { id: "betconstruct", name: "BetConstruct", initials: "BC", category: "Providers", description: "Player wallet and account data bridge for an external sportsbook or casino stack.", status: "Available", accent: "bg-sky-500/10 text-sky-600", config: "provider", meta: "Player API" },
  { id: "everymatrix", name: "EveryMatrix", initials: "EM", category: "Providers", description: "Connect a player account source and expose only the data required for operations.", status: "Connected", accent: "bg-violet-500/10 text-violet-600", config: "provider", meta: "Player API" },
  { id: "google-analytics", name: "Google Analytics", initials: "GA", category: "Analytics", description: "Measure portal sessions, checkout funnel events and conversion activity.", status: "Connected", accent: "bg-amber-500/10 text-amber-600", config: "analytics", meta: "Measurement ID" },
  { id: "posthog", name: "PostHog", initials: "PH", category: "Analytics", description: "Product analytics, session insights and feature usage for the dashboard.", status: "Available", accent: "bg-fuchsia-500/10 text-fuchsia-600", config: "analytics", meta: "Project key" },
  { id: "hubspot", name: "HubSpot", initials: "HS", category: "CRM & Marketing", description: "Sync distributor lifecycle, contact records and account-level events.", status: "Available", accent: "bg-orange-500/10 text-orange-600", config: "crm", meta: "Private app" },
  { id: "meta-pixel", name: "Meta Pixel", initials: "MP", category: "CRM & Marketing", description: "Track checkout and acquisition events for campaign measurement.", status: "Available", accent: "bg-blue-500/10 text-blue-600", config: "analytics", meta: "Pixel ID" },
  { id: "slack", name: "Slack", initials: "SL", category: "Communications", description: "Send settlement, treasury and security notifications to operations channels.", status: "Connected", accent: "bg-pink-500/10 text-pink-600", config: "communication", meta: "Webhook" },
  { id: "sentry", name: "Sentry", initials: "SE", category: "Monitoring & Security", description: "Capture application errors, performance signals and release health.", status: "Available", accent: "bg-red-500/10 text-red-600", config: "monitoring", meta: "DSN" },
  { id: "google-workspace", name: "Google Workspace", initials: "GW", category: "Identity", description: "Enterprise sign-in and directory synchronization for internal users.", status: "Available", accent: "bg-emerald-500/10 text-emerald-600", config: "identity", meta: "OAuth app" },
];

const categories: IntegrationCategory[] = ["Providers", "Analytics", "CRM & Marketing", "Communications", "Monitoring & Security", "Identity"];

const scopes = [
  ["username", "Username", true],
  ["email", "Email address", true],
  ["balance", "Wallet balance", true],
  ["phone", "Phone number", false],
  ["kyc", "KYC status", false],
  ["transactions", "Transaction history", false],
] as const;

const categoryIcons: Record<IntegrationCategory, typeof PlugZap> = {
  Providers: PlugZap,
  Analytics: BarChart3,
  "CRM & Marketing": Megaphone,
  Communications: MessageSquare,
  "Monitoring & Security": ShieldCheck,
  Identity: LockKeyhole,
};

export const Route = createFileRoute("/(main)/dashboard/integrations")({ component: Page });

function IntegrationLogo({ item, large = false }: { item: Integration; large?: boolean }) {
  return (
    <div className={"flex shrink-0 items-center justify-center rounded-xl border bg-background font-semibold tracking-tight " + (large ? "size-12 text-sm" : "size-10 text-xs")}>
      <span className={"flex size-full items-center justify-center rounded-xl " + item.accent}>{item.initials}</span>
    </div>
  );
}

function Page() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = integrations.filter((item) => {
    const needle = query.trim().toLowerCase();
    return !needle || [item.name, item.category, item.description].some((value) => value.toLowerCase().includes(needle));
  });

  return (
    <section className="flex min-h-full flex-col gap-6 bg-background">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Platform connections</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Connect player providers, analytics, CRM, communication and security tools. Every integration has its own configuration model and permission scope.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search integrations..." />
        </div>
      </div>

      {categories.map((category) => {
        const items = filtered.filter((item) => item.category === category);
        if (!items.length) return null;
        const CategoryIcon = categoryIcons[category];
        return (
          <section key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted"><CategoryIcon className="size-4" /></div>
              <div><h2 className="text-sm font-semibold">{category}</h2><p className="text-xs text-muted-foreground">{items.length} available connection{items.length > 1 ? "s" : ""}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <IntegrationLogo item={item} />
                      <Badge variant={item.status === "Connected" ? "secondary" : "outline"}>
                        {item.status === "Connected" ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground/60" />}
                        {item.status}
                      </Badge>
                    </div>
                    <div className="pt-1">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{item.meta}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="min-h-12 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Database className="size-3.5" /> Frontend configuration</div>
                      <Button size="sm" onClick={() => { setSelected(item); setOpen(true); }}>
                        {item.status === "Connected" ? <Settings2 /> : <PlugZap />}
                        {item.status === "Connected" ? "Configure" : "Connect"}
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">Frontend-only integration templates. API keys, tokens and provider credentials are displayed as placeholders and are not stored or transmitted.</div>

      <IntegrationDialog integration={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

function IntegrationDialog({ integration, open, onOpenChange }: { integration: Integration | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [environment, setEnvironment] = useState("Production");
  const [enabled, setEnabled] = useState(true);
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>(
    Object.fromEntries(scopes.map(([key, , value]) => [key, value])),
  );

  if (!integration) return null;
  const setPermission = (key: string, value: boolean) => setPermissionState((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <IntegrationLogo item={integration} large />
            <div className="min-w-0"><DialogTitle>{integration.name}</DialogTitle><DialogDescription>{integration.description}</DialogDescription></div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-3">
            <div><p className="text-sm font-medium">Integration enabled</p><p className="text-xs text-muted-foreground">Activate this connection for the workspace.</p></div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {integration.config === "provider" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label>API Key</Label><Input type="password" defaultValue="pk_live_••••••••••••" /></div>
                <div className="grid gap-2"><Label>Base URL</Label><Input defaultValue={"https://api." + integration.name.toLowerCase().replace(/\s+/g, "") + ".com"} /></div>
                <div className="grid gap-2"><Label>Environment</Label><Select value={environment} onValueChange={setEnvironment}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Production">Production</SelectItem><SelectItem value="Sandbox">Sandbox</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Player lookup mode</Label><Select defaultValue="player-id"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="player-id">Player ID</SelectItem><SelectItem value="username">Username</SelectItem><SelectItem value="email">Email</SelectItem></SelectContent></Select></div>
              </div>
              <Separator />
              <div><div className="mb-3"><p className="text-sm font-semibold">Player data permissions</p><p className="text-xs text-muted-foreground">Choose exactly what PayMine may read from the provider for player operations.</p></div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {scopes.map(([key, label, initial]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2"><KeyRound className="size-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
                      <Switch checked={permissionState[key] ?? initial} onCheckedChange={(value) => setPermission(key, value)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {integration.config === "analytics" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>{integration.id === "google-analytics" ? "Measurement ID" : integration.id === "meta-pixel" ? "Pixel ID" : "Project key"}</Label><Input defaultValue={integration.id === "google-analytics" ? "G-7PM9K4X21" : integration.id === "meta-pixel" ? "245901884221" : "phc_pm_••••••"} /></div>
              <div className="grid gap-2"><Label>Data region</Label><Select defaultValue="eu"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="eu">EU</SelectItem><SelectItem value="us">US</SelectItem><SelectItem value="global">Global</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2"><div><p className="text-sm font-medium">Checkout events</p><p className="text-xs text-muted-foreground">page_view · begin_checkout · payment_method_selected · purchase</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2"><div><p className="text-sm font-medium">Mask player identifiers</p><p className="text-xs text-muted-foreground">Avoid sending direct identifiers in analytics events.</p></div><Switch defaultChecked /></div>
            </div>
          ) : null}

          {integration.config === "crm" ? (
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>Private app token</Label><Input type="password" defaultValue="pat-••••••••••••" /></div>
              <div className="grid gap-2"><Label>Portal / Workspace ID</Label><Input defaultValue="PM-HUB-4821" /></div>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Distributors", "Player contacts", "Lifecycle events", "Notes & activities"].map((label, index) => <div key={label} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{label}</span><Switch defaultChecked={index < 3} /></div>)}
              </div>
            </div>
          ) : null}

          {integration.config === "communication" ? (
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>Webhook URL</Label><Input defaultValue="https://hooks.slack.com/services/T000/B000/••••" /></div>
              <div className="grid gap-2"><Label>Default channel</Label><Input defaultValue="#paymine-ops" /></div>
              <div><p className="mb-2 text-sm font-semibold">Events</p><div className="grid gap-2 sm:grid-cols-2">{["Settlement blocked", "Treasury mismatch", "Provider offline", "Security alert"].map((label, index) => <div key={label} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{label}</span><Switch defaultChecked={index !== 3} /></div>)}</div></div>
            </div>
          ) : null}

          {integration.config === "monitoring" ? (
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>DSN</Label><Input defaultValue="https://public@sentry.example/42" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Performance monitoring</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Session replay</span><Switch defaultChecked={false} /></div>
              </div>
            </div>
          ) : null}

          {integration.config === "identity" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Client ID</Label><Input defaultValue="pm-client-82f1" /></div>
              <div className="grid gap-2"><Label>Tenant / Domain</Label><Input defaultValue="paymine.example" /></div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2"><div><p className="text-sm font-medium">Directory sync</p><p className="text-xs text-muted-foreground">Provision and deactivate internal users from the identity provider.</p></div><Switch defaultChecked /></div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}><X /> Close</Button>
          <Button onClick={() => onOpenChange(false)}><Save /> Save configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

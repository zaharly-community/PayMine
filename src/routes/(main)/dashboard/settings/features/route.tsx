import { type DragEvent, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Database, GripVertical, Network, Save, ShieldCheck, SlidersHorizontal, ToggleLeft, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";
import { featureRows } from "../-components/settings-data";

const featureIcons = {
  "Distributor network": Network,
  "Payment forms": CreditCard,
  "Treasury reconciliation": Database,
  "Advanced risk rules": ShieldCheck,
  "White-label portals": SlidersHorizontal,
} as const;

type FeatureName = keyof typeof featureIcons;

export const Route = createFileRoute("/(main)/dashboard/settings/features")({ component: Page });

function Page() {
  const [selected, setSelected] = useState<FeatureName | null>(null);

  return (
    <SettingsShell active="features" title="Features" description="Platform capabilities and rollout state by module.">
      <div className="grid gap-4 md:grid-cols-2">
        {featureRows.map((row) => {
          const Icon = featureIcons[row.name as FeatureName];
          return (
            <Card key={row.name} feature={row.name} onClick={() => setSelected(row.name as FeatureName)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></div>
                  <div className="min-w-0"><p className="font-medium">{row.name}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{row.description}</p><p className="mt-3 text-xs text-muted-foreground">Owner · {row.owner}</p></div>
                </div>
                <Badge variant={row.status === "Enabled" ? "secondary" : "outline"}>{row.status}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted-foreground">Feature configuration</span><Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); setSelected(row.name as FeatureName); }}><ToggleLeft /> Manage</Button></div>
            </Card>
          );
        })}
      </div>
      <PortalRoutingSection />
      <FeatureDialog feature={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </SettingsShell>
  );
}

function Card({ children, feature, onClick }: { children: React.ReactNode; feature: string; onClick: () => void }) {
  return <button type="button" className="rounded-xl border bg-card p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm" onClick={onClick} aria-label={"Configure " + feature}>{children}</button>;
}


type PriorityRule = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const initialPortalRoutingRules = {
  distributors: [
    { id: "response-speed", label: "Fastest response", description: "Prioritize agents and supervisors with the shortest recent response time.", enabled: true },
    { id: "rating", label: "Highest rating", description: "Prefer distributors with the strongest customer rating history.", enabled: true },
    { id: "newest", label: "Newest distributors", description: "Give recently onboarded agents and supervisors higher placement.", enabled: false },
    { id: "oldest", label: "Oldest distributors", description: "Prefer the longest-tenured agents and supervisors.", enabled: false },
  ],
  wallets: [
    { id: "wallet-response-speed", label: "Fastest response", description: "Prefer wallets/providers with the fastest recent response time.", enabled: true },
    { id: "wallet-rating", label: "Highest rating", description: "Prefer wallets/providers with the strongest customer rating history.", enabled: true },
    { id: "wallet-newest", label: "Newest wallets", description: "Give recently added wallets higher placement.", enabled: false },
    { id: "wallet-oldest", label: "Oldest wallets", description: "Prefer the longest-running wallets.", enabled: false },
  ],
} satisfies Record<string, PriorityRule[]>;

function PortalRoutingSection() {
  const [distributorRules, setDistributorRules] = useState<PriorityRule[]>(() => initialPortalRoutingRules.distributors);
  const [walletRules, setWalletRules] = useState<PriorityRule[]>(() => initialPortalRoutingRules.wallets);
  const [saved, setSaved] = useState(true);

  const markDirty = () => setSaved(false);
  const handleSave = () => setSaved(true);
  const handleReset = () => {
    setDistributorRules(initialPortalRoutingRules.distributors);
    setWalletRules(initialPortalRoutingRules.wallets);
    setSaved(true);
  };

  return (
    <SettingCard
      title="Portal display & routing priority"
      description="Control which agents, supervisors and wallets appear first in the portal."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Priority order</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Drag criteria to set priority from top to bottom. Rules switched Off are ignored completely.
            </p>
          </div>
          <Badge variant={saved ? "secondary" : "outline"}>
            {saved ? "Saved" : "Unsaved changes"}
          </Badge>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <PriorityRuleList
            title="Agents & Supervisors"
            description="How eligible distributors are ordered inside the portal."
            rules={distributorRules}
            onChange={(rules) => { setDistributorRules(rules); markDirty(); }}
          />
          <PriorityRuleList
            title="Wallets"
            description="How available wallets/providers are ordered for the player."
            rules={walletRules}
            onChange={(rules) => { setWalletRules(rules); markDirty(); }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">Top position = highest priority. Off rules are excluded from the ordering.</p>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={handleReset}>Reset</Button>
            <Button type="button" size="sm" onClick={handleSave}><Save /> Save routing</Button>
          </div>
        </div>
      </div>
    </SettingCard>
  );
}

function PriorityRuleList({
  title,
  description,
  rules,
  onChange,
}: {
  title: string;
  description: string;
  rules: PriorityRule[];
  onChange: (rules: PriorityRule[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveRule = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const sourceIndex = rules.findIndex((rule) => rule.id === sourceId);
    const targetIndex = rules.findIndex((rule) => rule.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const next = [...rules];
    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) return;
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (sourceId) moveRule(sourceId, targetId);
    setDraggedId(null);
  };

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-3 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Priority</span>
      </div>

      <div className="space-y-2" role="list">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            draggable
            role="listitem"
            onDragStart={(event) => handleDragStart(event, rule.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, rule.id)}
            onDragEnd={() => setDraggedId(null)}
            className={[
              "group flex cursor-grab items-center gap-3 rounded-lg border px-3 py-3 transition",
              rule.enabled ? "bg-background" : "bg-muted/30 opacity-60",
              draggedId === rule.id ? "border-primary/50 shadow-sm" : "hover:border-primary/30",
            ].join(" ")}
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{rule.label}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{rule.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={rule.enabled ? "text-[10px] font-medium text-foreground" : "text-[10px] font-medium text-muted-foreground"}>
                {rule.enabled ? "On" : "Off"}
              </span>
              <Switch
                checked={rule.enabled}
                onCheckedChange={(enabled) => {
                  onChange(rules.map((item) => item.id === rule.id ? { ...item, enabled } : item));
                }}
                aria-label={rule.label + (rule.enabled ? " On" : " Off")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureDialog({ feature, open, onOpenChange }: { feature: FeatureName | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!feature) return null;
  const Icon = featureIcons[feature];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><div><DialogTitle>{feature}</DialogTitle><DialogDescription>Configure this capability using the dedicated controls for the feature.</DialogDescription></div></div>
        </DialogHeader>

        <div className="space-y-4">
          {feature === "Distributor network" && <DistributorFeature />}
          {feature === "Payment forms" && <PaymentFeature />}
          {feature === "Treasury reconciliation" && <TreasuryFeature />}
          {feature === "Advanced risk rules" && <RiskFeature />}
          {feature === "White-label portals" && <PortalFeature />}
        </div>

        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}><X /> Close</Button><Button onClick={() => onOpenChange(false)}><CheckCircle2 /> Save feature</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DistributorFeature() {
  return <div className="grid gap-4 sm:grid-cols-2">
    <div className="rounded-xl border bg-muted/20 p-4"><div className="flex items-center gap-2"><Users className="size-4 text-muted-foreground" /><span className="text-sm font-medium">Network capacity</span></div><p className="mt-2 text-2xl font-semibold">42</p><p className="text-xs text-muted-foreground">31 Agents · 11 Supervisors</p></div>
    <div className="rounded-xl border bg-muted/20 p-4"><p className="text-sm font-medium">Default onboarding</p><p className="mt-1 text-xs text-muted-foreground">New distributors require invitation acceptance.</p><Switch className="mt-3" defaultChecked /></div>
    <div className="grid gap-2 sm:col-span-2"><Label>Default Agent program</Label><Input defaultValue="Standard Agent" /></div>
  </div>;
}

function PaymentFeature() {
  return <div className="grid gap-4">
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="grid gap-2"><Label>Default checkout currency</Label><Input defaultValue="USD" /></div>
      <div className="grid gap-2"><Label>Default success redirect</Label><Input defaultValue="https://merchant.example/success" /></div>
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      {["Mobile optimized", "Save payment preference", "Remember customer locale", "Show supported methods"].map((label, index) => <div key={label} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{label}</span><Switch defaultChecked={index !== 2} /></div>)}
    </div>
  </div>;
}

function TreasuryFeature() {
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label="Accounts" value="6" />
      <Metric label="Reconciled" value="4" />
      <Metric label="Mismatches" value="2" />
    </div>
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><p className="text-sm font-medium">Settlement guard</p><p className="mt-1 text-xs text-muted-foreground">Block settlement whenever expected and provider balances differ beyond the allowed threshold.</p><div className="mt-3 flex items-center gap-3"><Input className="max-w-28" defaultValue="0.00" /><span className="text-xs text-muted-foreground">Allowed variance (USD)</span></div></div>
  </div>;
}

function RiskFeature() {
  return <div className="space-y-4">
    {[["Velocity rule", "More than 5 requests in 10 minutes", true], ["Amount rule", "Deposit exceeds $5,000", true], ["New device rule", "New device + first transaction", false], ["High-risk geography", "Country requires manual review", true]].map(([title, description, enabled]) => <div key={String(title)} className="flex items-center justify-between gap-4 rounded-xl border p-3"><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><Switch defaultChecked={Boolean(enabled)} /></div>)}
    <div className="grid gap-2"><Label>Default action</Label><Input defaultValue="Hold for manual review" /></div>
  </div>;
}

function PortalFeature() {
  return <div className="space-y-4">
    <div className="rounded-xl border bg-muted/20 p-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-background border"><CreditCard className="size-4" /></div><div><p className="text-sm font-medium">White-label checkout</p><p className="text-xs text-muted-foreground">Remove platform branding and serve merchant-owned checkout assets.</p></div><Switch defaultChecked={false} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Primary brand name</Label><Input defaultValue="Merchant Payments" /></div><div className="grid gap-2"><Label>Checkout domain</Label><Input defaultValue="pay.merchant.example" /></div></div>
    <div className="grid gap-2"><Label>Custom CSS token set</Label><Input defaultValue="brand-primary / surface / radius-lg" /></div>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>;
}

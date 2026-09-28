import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Database,
  FileCheck2,
  Handshake,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  Megaphone,
  PanelTop,
  Percent,
  Search,
  Settings2,
  ShieldCheck,
  Store,
  ToggleRight,
  User,
  UserCog,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/(main)/dashboard/settings/features")({
  component: Page,
});

type CategoryKey = "money_movement" | "p2p" | "business" | "cards" | "engagement";
type Panel = "User" | "Merchant" | "Agent";

type Feature = {
  id: number;
  key: string;
  name: string;
  description: string;
  category: CategoryKey;
  enabled: boolean;
  core?: boolean;
  role?: boolean;
  icon: typeof Wallet;
  panels: Record<Panel, boolean>;
};

type Category = {
  key: CategoryKey;
  label: string;
  description: string;
  icon: typeof Wallet;
  tone: string;
};

const categories: Category[] = [
  { key: "money_movement", label: "Money movement", description: "Deposits, withdrawals, verification and transaction control.", icon: Wallet, tone: "bg-primary/10 text-primary" },
  { key: "p2p", label: "P2P marketplace", description: "Direct player transfers and peer-to-peer capabilities.", icon: Handshake, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { key: "business", label: "Business & merchant", description: "Payment links, merchants, distributors and API processing.", icon: Store, tone: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { key: "cards", label: "Virtual cards", description: "Card-based payment experiences and card verification.", icon: CreditCard, tone: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { key: "engagement", label: "Engagement & growth", description: "Portal experience, notifications, analytics and customer tools.", icon: Megaphone, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
];

const initialFeatures: Feature[] = [
  { id: 1, key: "deposit_processing", name: "Deposit Processing", description: "Allow players to fund their balance through active payment channels and manual deposit flows.", category: "money_movement", enabled: true, core: true, icon: Wallet, panels: { User: true, Merchant: true, Agent: true } },
  { id: 2, key: "withdrawal_processing", name: "Withdrawal Processing", description: "Allow approved players to request withdrawals through configured payout methods and operator review.", category: "money_movement", enabled: true, core: true, icon: ArrowRight, panels: { User: true, Merchant: true, Agent: true } },
  { id: 3, key: "transaction_verification", name: "Transaction Verification", description: "Run payment verification checks and route uncertain transactions to manual review.", category: "money_movement", enabled: true, icon: FileCheck2, panels: { User: true, Merchant: true, Agent: true } },
  { id: 4, key: "transaction_ledger", name: "Transaction Ledger", description: "Keep a consolidated finance ledger across deposits, withdrawals and payment-link activity.", category: "money_movement", enabled: true, icon: Database, panels: { User: false, Merchant: true, Agent: true } },
  { id: 5, key: "fee_engine", name: "Fee & Commission Engine", description: "Apply platform fees and distributor commissions to supported payment operations.", category: "money_movement", enabled: true, icon: Percent, panels: { User: false, Merchant: true, Agent: true } },
  { id: 6, key: "payment_evidence", name: "Payment Evidence", description: "Collect and review uploaded transaction proof for deposits and withdrawals.", category: "money_movement", enabled: true, icon: FileCheck2, panels: { User: true, Merchant: true, Agent: true } },
  { id: 7, key: "player_transfers", name: "Player Transfers", description: "Allow one player to send balance directly to another player inside PayMine.", category: "p2p", enabled: false, icon: UsersRound, panels: { User: true, Merchant: false, Agent: false } },
  { id: 8, key: "payment_links", name: "Payment Links", description: "Allow operators and authorized users to generate shareable payment links with expiry and one-time usage rules.", category: "business", enabled: true, icon: Link2, panels: { User: true, Merchant: true, Agent: true } },
  { id: 9, key: "merchant_payments", name: "Merchant Payments", description: "Allow customers to pay registered merchants through connected PayMine payment methods.", category: "business", enabled: false, icon: Store, panels: { User: true, Merchant: true, Agent: false } },
  { id: 10, key: "distributor_network", name: "Distributor Network", description: "Enable distributor, supervisor and account-based processing programs used by PayMine operations.", category: "business", enabled: true, icon: Building2, panels: { User: false, Merchant: true, Agent: true } },
  { id: 11, key: "agent_program", name: "Agent Program", description: "Enable agent registration, agent access and agent-facing operational surfaces.", category: "business", enabled: true, role: true, icon: UserCog, panels: { User: false, Merchant: false, Agent: true } },
  { id: 12, key: "hosted_payment_forms", name: "Hosted Payment Forms", description: "Serve reusable hosted forms for player deposits and configured checkout experiences.", category: "business", enabled: true, icon: PanelTop, panels: { User: true, Merchant: true, Agent: true } },
  { id: 13, key: "merchant_api", name: "Merchant API", description: "Expose signed payment initiation and verification endpoints to connected merchants.", category: "business", enabled: true, icon: KeyRound, panels: { User: false, Merchant: true, Agent: false } },
  { id: 14, key: "card_payments", name: "Card Payments", description: "Enable card-based payment methods and their verification surfaces where configured.", category: "cards", enabled: true, icon: CreditCard, panels: { User: true, Merchant: true, Agent: true } },
  { id: 15, key: "saved_payment_methods", name: "Saved Payment Methods", description: "Allow supported customer payment methods to be remembered for future checkout flows.", category: "cards", enabled: false, icon: ToggleRight, panels: { User: true, Merchant: true, Agent: false } },
  { id: 16, key: "customer_portal", name: "Customer Portal", description: "Enable the hosted customer payment portal and its payment-method selection experience.", category: "engagement", enabled: true, icon: PanelTop, panels: { User: true, Merchant: false, Agent: false } },
  { id: 17, key: "notifications", name: "Operational Notifications", description: "Deliver in-app alerts and operational notifications for important payment events.", category: "engagement", enabled: true, icon: Bell, panels: { User: true, Merchant: true, Agent: true } },
  { id: 18, key: "portal_analytics", name: "Portal Analytics", description: "Expose checkout funnel, payment-channel, revenue and customer-country analytics.", category: "engagement", enabled: true, icon: BarChart3, panels: { User: false, Merchant: true, Agent: true } },
  { id: 19, key: "access_controls", name: "Role Access Controls", description: "Gate dashboard modules and role-specific surfaces for internal operators.", category: "engagement", enabled: true, role: true, icon: LockKeyhole, panels: { User: false, Merchant: true, Agent: true } },
  { id: 20, key: "automated_kyc", name: "Automated KYC", description: "Allow connected identity providers to automatically clear low-risk player verification submissions.", category: "engagement", enabled: false, icon: ShieldCheck, panels: { User: true, Merchant: false, Agent: false } },
];

const storageKey = "paymine-feature-management-v1";
const changeKey = "paymine-feature-management-last-change-v1";

const panelMeta: Array<{ key: Panel; label: string; icon: typeof User }> = [
  { key: "User", label: "User", icon: UserRound },
  { key: "Merchant", label: "Merchant", icon: Store },
  { key: "Agent", label: "Agent", icon: UsersRound },
];

function readStoredFeatures() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialFeatures;
    const parsed = JSON.parse(stored) as Array<Partial<Feature>>;
    const byKey = new Map(parsed.map((item) => [item.key, item]));
    return initialFeatures.map((feature) => ({ ...feature, enabled: byKey.get(feature.key)?.enabled ?? feature.enabled, panels: byKey.get(feature.key)?.panels ?? feature.panels }));
  } catch {
    return initialFeatures;
  }
}

function formatChangedAt(timestamp: number) {
  if (!timestamp) return "Last change · just now";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Last change · just now";
  if (seconds < 3600) return "Last change · " + Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return "Last change · " + Math.floor(seconds / 3600) + "h ago";
  return "Last change · " + Math.floor(seconds / 86400) + "d ago";
}

function Page() {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("money_movement");
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled" | "core">("all");
  const [search, setSearch] = useState("");
  const [changeFeature, setChangeFeature] = useState<Feature | null>(null);
  const [manageFeature, setManageFeature] = useState<Feature | null>(null);
  const [lastChangedAt, setLastChangedAt] = useState(0);
  const [pendingPanels, setPendingPanels] = useState<Record<Panel, boolean> | null>(null);

  useEffect(() => {
    setFeatures(readStoredFeatures());
    const storedChange = Number(window.localStorage.getItem(changeKey) || 0);
    setLastChangedAt(storedChange);
  }, []);

  const persist = (next: Feature[], changed = true) => {
    setFeatures(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next.map(({ key, enabled, panels }) => ({ key, enabled, panels }))));
    if (changed) {
      const now = Date.now();
      setLastChangedAt(now);
      window.localStorage.setItem(changeKey, String(now));
    }
  };

  useEffect(() => {
    const onStorage = () => {
      setFeatures(readStoredFeatures());
      setLastChangedAt(Number(window.localStorage.getItem(changeKey) || 0));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const activeCategoryConfig = categories.find((category) => category.key === activeCategory) ?? categories[0];
  const activeCategoryFeatures = features.filter((feature) => feature.category === activeCategory);
  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeCategoryFeatures.filter((feature) => {
      const matchesSearch = !query || [feature.name, feature.key, feature.description].join(" ").toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "enabled" && feature.enabled) ||
        (filter === "disabled" && !feature.enabled) ||
        (filter === "core" && feature.core);
      return matchesSearch && matchesFilter;
    });
  }, [activeCategoryFeatures, filter, search]);

  const total = features.length;
  const enabled = features.filter((feature) => feature.enabled).length;
  const disabled = total - enabled;
  const coreTotal = features.filter((feature) => feature.core).length;
  const coreEnabled = features.filter((feature) => feature.core && feature.enabled).length;
  const roleTotal = features.filter((feature) => feature.role).length;
  const roleEnabled = features.filter((feature) => feature.role && feature.enabled).length;
  const standardEnabled = enabled - coreEnabled - roleEnabled;
  const enabledPct = total ? Math.round((enabled / total) * 100) : 0;

  const categoryCounts = (key: CategoryKey) => {
    const rows = features.filter((feature) => feature.category === key);
    return { total: rows.length, enabled: rows.filter((feature) => feature.enabled).length };
  };

  const categoryFilterCounts = {
    all: activeCategoryFeatures.length,
    enabled: activeCategoryFeatures.filter((feature) => feature.enabled).length,
    disabled: activeCategoryFeatures.filter((feature) => !feature.enabled).length,
    core: activeCategoryFeatures.filter((feature) => feature.core).length,
  };

  const requestToggle = (feature: Feature) => setChangeFeature(feature);

  const confirmToggle = () => {
    if (!changeFeature) return;
    const nextEnabled = !changeFeature.enabled;
    const next = features.map((feature) =>
      feature.key === changeFeature.key ? { ...feature, enabled: nextEnabled } : feature,
    );
    persist(next);
    setChangeFeature(null);
  };

  const openManage = (feature: Feature) => {
    setManageFeature(feature);
    setPendingPanels(feature.panels);
  };

  const saveManage = () => {
    if (!manageFeature || !pendingPanels) return;
    const next = features.map((feature) =>
      feature.key === manageFeature.key ? { ...feature, panels: pendingPanels } : feature,
    );
    persist(next);
    setManageFeature(null);
    setPendingPanels(null);
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="rounded-2xl border bg-card px-5 py-5 shadow-sm">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Platform</Link></li>
            <li>/</li>
            <li><Link to="/dashboard/settings/general" className="hover:text-foreground">Settings</Link></li>
            <li>/</li>
            <li className="text-foreground" aria-current="page">Feature controls</li>
          </ol>
        </nav>

        <header className="relative mt-4 overflow-hidden rounded-xl border bg-muted/20 px-5 py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-20 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings2 className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">System config</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-current" />
                  {disabled === 0 ? "All systems live" : disabled + " features disabled"}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Feature Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Control what users, merchants and agents can see and use — from one place.</p>
            </div>
          </div>
        </header>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <nav className="rounded-2xl border bg-card p-2.5" aria-label="Feature categories">
            <div className="grid gap-1" role="tablist">
              {categories.map((category) => {
                const counts = categoryCounts(category.key);
                const Icon = category.icon;
                const active = category.key === activeCategory;
                return (
                  <button
                    key={category.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setActiveCategory(category.key);
                      setSearch("");
                      setFilter("all");
                    }}
                    className={"flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors " + (active ? "bg-muted" : "hover:bg-muted/60")}
                  >
                    <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + category.tone}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{category.label}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{counts.enabled} enabled</span>
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full border text-xs font-medium tabular-nums">{counts.enabled}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Overview</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-current" />Live
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-semibold tabular-nums">{enabled}<span className="text-base font-medium text-muted-foreground">/{total}</span></div>
                <div className="mt-1 text-xs text-muted-foreground">features enabled</div>
              </div>
              <div className="text-lg font-semibold tabular-nums text-muted-foreground">{enabledPct}%</div>
            </div>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
              {standardEnabled > 0 ? <span className="bg-primary/70" style={{ flex: standardEnabled }} /> : null}
              {coreEnabled > 0 ? <span className="bg-primary" style={{ flex: coreEnabled }} /> : null}
              {roleEnabled > 0 ? <span className="bg-violet-500" style={{ flex: roleEnabled }} /> : null}
            </div>

            <div className="mt-4 space-y-2">
              {[
                ["Enabled", enabled, "bg-primary"],
                ["Disabled", disabled, "bg-muted-foreground/40"],
                ["Core features", coreTotal, "bg-primary"],
                ["Role switches", roleTotal, "bg-violet-500"],
              ].map(([label, value, swatch]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className={"size-2 rounded-full " + swatch} />{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t pt-3 text-[11px] text-muted-foreground">{formatChangedAt(lastChangedAt)}</div>
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border bg-card">
          <header className="border-b p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl " + activeCategoryConfig.tone}>
                  <activeCategoryConfig.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{activeCategoryConfig.label}</h2>
                  <p className="truncate text-xs text-muted-foreground">{activeCategoryConfig.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative block sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search features" aria-label="Search features" />
                </label>

                <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by state">
                  {([
                    ["all", "All"],
                    ["enabled", "Enabled"],
                    ["disabled", "Disabled"],
                    ["core", "Core"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      aria-pressed={filter === key}
                      className={"inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors " + (filter === key ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                      {label}
                      <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] tabular-nums">{categoryFilterCounts[key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-3 p-4 sm:p-5">
            {filteredFeatures.map((feature) => (
              <FeatureCard key={feature.key} feature={feature} onToggle={() => requestToggle(feature)} onManage={() => openManage(feature)} />
            ))}

            {filteredFeatures.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
                <div className="flex size-11 items-center justify-center rounded-full bg-muted"><Search className="size-4 text-muted-foreground" /></div>
                <h3 className="mt-3 text-sm font-semibold">No matching features</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">Try a different keyword or clear the filter.</p>
                <button type="button" className="mt-3 text-xs font-medium text-primary hover:underline" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ToggleDialog feature={changeFeature} open={Boolean(changeFeature)} onOpenChange={(open) => !open && setChangeFeature(null)} onConfirm={confirmToggle} />

      <Dialog open={Boolean(manageFeature)} onOpenChange={(open) => { if (!open) { setManageFeature(null); setPendingPanels(null); } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage {manageFeature?.name}</DialogTitle>
            <DialogDescription>Configure the feature surfaces and access rules used across PayMine.</DialogDescription>
          </DialogHeader>

          {manageFeature && pendingPanels ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><CircleCheck className="size-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{manageFeature.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{manageFeature.description}</p>
                    <code className="mt-2 block text-[11px] text-muted-foreground">{manageFeature.key}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Panel access</Label>
                {panelMeta.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                    <div className="flex items-center gap-3">
                      <div className={"flex size-9 items-center justify-center rounded-lg " + (pendingPanels[key] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}><Icon className="size-4" /></div>
                      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{pendingPanels[key] ? "Visible & accessible" : "Hidden"}</p></div>
                    </div>
                    <button type="button" role="switch" aria-checked={pendingPanels[key]} onClick={() => setPendingPanels((current) => current ? { ...current, [key]: !current[key] } : current)} className={"relative h-6 w-11 rounded-full border transition-colors " + (pendingPanels[key] ? "bg-primary" : "bg-muted")}>
                      <span className={"absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform " + (pendingPanels[key] ? "left-[22px]" : "left-0.5")} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-dashed p-4">
                <div className="flex items-start gap-3">
                  {manageFeature.core ? <CircleAlert className="mt-0.5 size-4 text-amber-500" /> : <ShieldCheck className="mt-0.5 size-4 text-muted-foreground" />}
                  <div>
                    <p className="text-xs font-medium">{manageFeature.core ? "Core feature" : "Feature control"}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {manageFeature.core ? "This is business-critical. Disabling it can stop payment flows that depend on this module." : "Changes are applied to the frontend immediately and stored locally in this prototype."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setManageFeature(null); setPendingPanels(null); }}>Cancel</Button>
            <Button onClick={saveManage}><Check /> Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function FeatureCard({ feature, onToggle, onManage }: { feature: Feature; onToggle: () => void; onManage: () => void }) {
  const category = categories.find((item) => item.key === feature.category) ?? categories[0];
  const Icon = feature.icon;

  return (
    <article
      className={"rounded-xl border p-4 transition-colors " + (feature.enabled ? "bg-card hover:border-primary/30" : "bg-muted/20")}
      style={{ "--fm-cat-fg": "currentColor" } as React.CSSProperties}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={"flex size-10 shrink-0 items-center justify-center rounded-xl " + category.tone}>
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span>{feature.name}</span>
              {feature.core ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-700 dark:text-amber-300">
                  <CircleAlert className="size-2.5" /> CORE
                </span>
              ) : null}
              {feature.role ? (
                <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[9px] font-semibold tracking-wide text-muted-foreground">
                  <UserCog className="size-2.5" /> ROLE
                </span>
              ) : null}
            </h3>
            <code className="mt-1 block text-[10px] text-muted-foreground">{feature.key}</code>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={feature.enabled}
          aria-label={(feature.enabled ? "Turn off " : "Turn on ") + feature.name}
          onClick={onToggle}
          className={"relative h-6 w-11 shrink-0 rounded-full border transition-colors " + (feature.enabled ? "bg-primary" : "bg-muted")}
        >
          <span className={"absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform " + (feature.enabled ? "left-[22px]" : "left-0.5")} />
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{feature.description}</p>

      <div className="mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {panelMeta.map(({ key, label, icon: PanelIcon }) => (
            <span
              key={key}
              title={feature.panels[key] ? label + ": visible & accessible" : label + ": hidden"}
              className={"inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium " + (feature.panels[key] ? "bg-background" : "bg-muted/60 text-muted-foreground")}
            >
              <PanelIcon className="size-3" />
              {label}
            </span>
          ))}
        </div>

        <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={onManage}>
          Manage <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}

function ToggleDialog({ feature, open, onOpenChange, onConfirm }: { feature: Feature | null; open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  if (!feature) return null;

  const turningOn = !feature.enabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{turningOn ? "Turn on " : "Turn off "}{feature.name}?</DialogTitle>
          <DialogDescription>
            {turningOn
              ? "The feature becomes available according to its panel rules."
              : feature.core
                ? "This is a core feature. Business-critical flows that depend on it may stop working."
                : feature.role
                  ? "Every surface for this role — registration, login and dashboard — will be hidden."
                  : "The feature will be hidden across all panels."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            {turningOn ? <CircleCheck className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" /> : <CircleAlert className="mt-0.5 size-4 text-amber-500" />}
            <div>
              <p className="text-xs font-medium">{turningOn ? "Impact" : feature.core ? "Business-critical impact" : "Platform impact"}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {turningOn ? "Menus, widgets and guarded routes follow this switch immediately." : "Menus, widgets and guarded routes stop responding immediately for all users."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={turningOn ? "default" : "destructive"} onClick={onConfirm}>{turningOn ? "Turn on" : "Turn off"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

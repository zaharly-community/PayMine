import * as React from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { distributors } from "../-components/data";

export const Route = createFileRoute("/(main)/dashboard/distributors/account")({
  component: Page,
});

type LeftTab = "Details" | "Contacts" | "Notes";
type MainTab = "Invoices" | "Activity" | "Payment methods" | "Settings";

const billedMonths = [
  { month: "Aug", paid: 62000, open: 0, overdue: 0 },
  { month: "Sep", paid: 76000, open: 0, overdue: 0 },
  { month: "Oct", paid: 89000, open: 0, overdue: 0 },
  { month: "Nov", paid: 42000, open: 0, overdue: 0 },
  { month: "Dec", paid: 97000, open: 0, overdue: 0 },
  { month: "Jan", paid: 52000, open: 0, overdue: 0 },
  { month: "Feb", paid: 89000, open: 0, overdue: 0 },
  { month: "Mar", paid: 72000, open: 0, overdue: 0 },
  { month: "Apr", paid: 39000, open: 0, overdue: 0 },
  { month: "May", paid: 86000, open: 0, overdue: 0 },
  { month: "Jun", paid: 96000, open: 18000, overdue: 70000 },
  { month: "Jul", paid: 82000, open: 18000, overdue: 72000 },
];

const invoices = [
  ["INV-2081", "Monthly network settlement · August", 96000, "Overdue", "Due 12 days ago"],
  ["INV-2074", "Monthly network settlement · September", 88000, "Overdue", "Due 4 days ago"],
  ["INV-2068", "Distributor support retainer", 18000, "Open", "Due in 16 days"],
  ["INV-2055", "Network commission · Q2", 88000, "Paid", "Paid 14 May 2026"],
  ["INV-2041", "Custom commission · onboarding", 42500, "Paid", "Paid 2 Apr 2026"],
  ["INV-2029", "Annual distribution agreement", 88000, "Paid", "Paid 19 Feb 2026"],
  ["INV-2014", "Platform expansion · Figma handoff", 12400, "Paid", "Paid 8 Jan 2026"],
  ["INV-2098", "Q4 workspace expansion", 74000, "Draft", "Not yet issued"],
] as const;

const activities = [
  ["Invoice INV-2081 passed its due date", "$96,000.00 · first reminder sent", "12 days ago", AlertTriangle],
  ["Invoice INV-2074 issued", "$88,000.00 · September settlement", "18 days ago", FileText],
  ["Seat count increased to 240", "40 seats added for the product platform team", "24 days ago", Users],
  ["Payment received for INV-2055", "$88,000.00 · bank transfer cleared", "14 May 2026", CheckCircle2],
  ["Annual agreement renewed", "12-month term retained with current commission", "2 Mar 2026", ShieldCheck],
  ["Payment received for INV-2041", "$42,500.00 · bank transfer cleared", "2 Apr 2026", CheckCircle2],
] as const;

const notes = [
  ["12 Jun 2026", "Quarterly settlement review completed. Distributor volume is tracking above plan and no unreconciled balance remains."],
  ["28 Apr 2026", "Finance confirmed every statement should include the distributor reference ID to avoid matching delays."],
  ["15 Feb 2026", "Adjusted the commission plan after a duplicate payout was identified and corrected."],
] as const;

const contacts = [
  ["IS", "Ingrid Sandoval", "Account manager", "ingrid@paymine.tn", true],
  ["MP", "Maya Patel", "Head of Product", "maya@paymine.tn", false],
  ["SM", "Sofia Martins", "Finance lead", "finance@paymine.tn", false],
  ["AC", "Alex Chen", "Procurement lead", "finance@paymine.tn", false],
] as const;

function Page() {
  const distributor = distributors[0];
  const [leftTab, setLeftTab] = React.useState<LeftTab>("Details");
  const [mainTab, setMainTab] = React.useState<MainTab>("Invoices");

  const activeStatus = distributor.status === "Active";
  const totalBilled = 1_060_000;
  const maxBilled = 200_000;

  return (
    <section data-content-padding="false" className="flex min-h-full min-w-0 flex-col bg-background text-foreground">
      <div className="grid min-w-0 xl:grid-cols-[414px_minmax(0,1fr)]">
        <aside className="border-b xl:border-b-0 xl:border-r">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-14 shrink-0">
                <AvatarImage src={distributor.avatarUrl || undefined} alt="" referrerPolicy="no-referrer" />
                <AvatarFallback className="text-base">{getInitials(distributor.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">{distributor.name}</h1>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">@{distributor.username}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <Plus />
                New invoice
              </Button>
              <Button size="sm" variant="outline">
                <Mail />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Plus />
                Add note
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Lifetime volume" value={formatCompactCurrency(distributor.balance * 3.8)} />
              <Metric label="On-time rate" value="96%" />
              <Metric label="Avg days to pay" value="18 days" />
            </div>
          </div>

          <div className="flex border-y">
            {(["Details", "Contacts", "Notes"] as LeftTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={cn(
                  "flex h-11 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground transition-colors",
                  leftTab === tab && "border-foreground text-foreground",
                )}
              >
                {tab === "Details" ? (
                  <FileText className="size-4" />
                ) : tab === "Contacts" ? (
                  <Users className="size-4" />
                ) : (
                  <MessageSquare className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {leftTab === "Details" ? (
              <>
                <div className="space-y-5">
                  <DetailRow icon={FileText} label="Distributor ID" value={distributor.id} mono />
                  <DetailRow icon={UserRound} label="Role" value={distributor.type} />
                  <DetailRow icon={Mail} label="Billing email" value={distributor.email} />
                  <DetailRow icon={CalendarDays} label="Joined" value={distributor.joinedDate} />
                  <DetailRow icon={WalletCards} label="Wallet balance" value={formatCurrency(distributor.balance)} />
                  <DetailRow icon={Settings2} label="Wallet model" value={distributor.walletModel ?? "—"} />
                  <DetailRow icon={ShieldCheck} label="Status" value={activeStatus ? "Active" : distributor.status} />
                  <DetailRow icon={Users} label="Players" value={String(distributor.players)} />
                </div>

                <div className="mt-7 border-t pt-5">
                  <p className="text-sm font-semibold">About the account</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {distributor.name} is a {distributor.type.toLowerCase()} account with {distributor.players} linked players.
                    The account uses the {distributor.walletModel?.toLowerCase() ?? "standard wallet"} model and currently has
                    {activeStatus ? " active processing access." : " restricted processing access."}
                  </p>
                </div>
              </>
            ) : null}

            {leftTab === "Contacts" ? (
              <div className="space-y-0">
                {contacts.map(([initials, name, role, email, primary]) => (
                  <div key={name} className="flex items-start gap-3 border-b py-4 first:pt-0">
                    <Avatar size="sm" className="shrink-0">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{name}</p>
                        {primary ? (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            Primary
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {leftTab === "Notes" ? (
              <div className="space-y-0">
                {notes.map(([date, note]) => (
                  <div key={date} className="border-b py-4 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{distributor.name}</p>
                      <span className="text-xs text-muted-foreground">{date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Billed volume · last 12 months</p>
                <div className="mt-1 text-3xl font-semibold tracking-tight">{formatCompactCurrency(totalBilled)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <Legend dotClass="bg-foreground" label="Paid" value="$858K" />
                <Legend dotClass="bg-muted-foreground" label="Open" value="$18K" />
                <Legend dotClass="bg-muted-foreground/50" label="Overdue" value="$184K" />
              </div>
            </div>

            <div className="mt-5">
              <div className="relative h-[150px]">
                {[0, 100000, 200000].map((value) => (
                  <div
                    key={value}
                    className="absolute left-9 right-0 border-t border-dashed border-border/70"
                    style={{ bottom: (value / 200000) * 100 + "%" }}
                  >
                    <span className="absolute -left-9 -top-2.5 text-[10px] text-muted-foreground">
                      {value === 0 ? "0" : value / 1000 + "k"}
                    </span>
                  </div>
                ))}

                <div className="absolute inset-y-0 left-11 right-0 flex items-end justify-between gap-2">
                  {billedMonths.map((item) => {
                    const paidHeight = (item.paid / maxBilled) * 130;
                    const openHeight = (item.open / maxBilled) * 130;
                    const overdueHeight = (item.overdue / maxBilled) * 130;
                    return (
                      <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center justify-end">
                        <div className="flex w-full max-w-8 flex-col justify-end">
                          <div className="bg-muted-foreground/50" style={{ height: overdueHeight + "px" }} />
                          <div className="bg-muted-foreground/75" style={{ height: openHeight + "px" }} />
                          <div className="bg-foreground" style={{ height: paidHeight + "px" }} />
                        </div>
                        <span className="mt-2 text-[10px] text-muted-foreground">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto border-b">
            {(["Invoices", "Activity", "Payment methods", "Settings"] as MainTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMainTab(tab)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground transition-colors",
                  mainTab === tab && "border-foreground text-foreground",
                )}
              >
                {tab === "Invoices" ? (
                  <FileText className="size-4" />
                ) : tab === "Activity" ? (
                  <CalendarDays className="size-4" />
                ) : tab === "Payment methods" ? (
                  <CreditCard className="size-4" />
                ) : (
                  <Settings2 className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {mainTab === "Invoices" ? <InvoicesPanel /> : null}
            {mainTab === "Activity" ? <ActivityPanel /> : null}
            {mainTab === "Payment methods" ? <PaymentMethodsPanel distributor={distributor} /> : null}
            {mainTab === "Settings" ? <SettingsPanel distributor={distributor} /> : null}
          </div>
        </main>
      </div>
    </section>
  );
}

function InvoicesPanel() {
  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">Total: 8 invoices</p>
      <div className="grid gap-3 md:grid-cols-2">
        {invoices.map(([id, description, amount, status, meta]) => (
          <div key={id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{id}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
              </div>
              <InvoiceBadge status={status} />
            </div>
            <div className="mt-3 text-sm">
              <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>
              <span className="text-muted-foreground"> · {meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="divide-y">
      {activities.map(([title, detail, date, Icon]) => (
        <div key={title} className="flex items-start gap-4 py-4 first:pt-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
        </div>
      ))}
    </div>
  );
}

function PaymentMethodsPanel({ distributor }: { distributor: (typeof distributors)[number] }) {
  const methods = distributor.configuration?.paymentMethods ?? [];

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">Authorized provider accounts for this distributor.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {methods.slice(0, 3).map((method) => (
          <div key={method.id} className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                {method.category === "Wallet" ? (
                  <Banknote className="size-5 text-muted-foreground" />
                ) : (
                  <CreditCard className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{method.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {method.providerAccountRef ?? "Provider account"} · {method.category}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {method.enabled ? "Processing enabled" : "Processing disabled"} · {method.limitMode}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto shrink-0 px-1.5 py-0 text-[10px]">
                Default
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ distributor }: { distributor: (typeof distributors)[number] }) {
  const config = distributor.configuration;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingItem label="Processing scope" value={config?.processingScope ?? "—"} />
        <SettingItem label="Fee mode" value={config?.feeMode ?? "—"} />
        <SettingItem
          label="Deposit commission"
          value={config?.defaultDepositCommissionRate != null ? config.defaultDepositCommissionRate + "%" : "—"}
        />
        <SettingItem
          label="Withdrawal commission"
          value={config?.defaultWithdrawalCommissionRate != null ? config.defaultWithdrawalCommissionRate + "%" : "—"}
        />
        <SettingItem
          label="Default request limit"
          value={config?.defaultRequestLimit != null ? String(config.defaultRequestLimit) : "—"}
        />
        <SettingItem
          label="Default amount limit"
          value={config?.defaultAmountLimit != null ? formatCurrency(config.defaultAmountLimit) : "—"}
        />
      </div>
      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Account controls</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Configuration is inherited from the selected distributor program. Changes remain subject to wallet,
          payment-method, and status controls.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">Edit configuration</Button>
          <Button variant="outline" size="sm">Audit changes</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-[140px] shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 truncate text-sm font-medium", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Legend({ dotClass, label, value }: { dotClass: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-2 rounded-full", dotClass)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function InvoiceBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Overdue: "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
    Open: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
    Paid: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
    Draft: "border-border bg-muted/40 text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={cn("shrink-0 px-2 py-0.5 text-[10px]", styles[status])}>
      {status}
    </Badge>
  );
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/\\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return "$" + Math.round(value / 1_000) + "K";
  return formatCurrency(value);
}

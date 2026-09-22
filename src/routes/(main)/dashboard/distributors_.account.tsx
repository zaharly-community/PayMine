import * as React from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "cn";

import { distributors } from "./distributors/-components/data";

export const Route = createFileRoute("/(main)/dashboard/distributors_/account")({
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
  { month: "Mar", paid: 76000, open: 0, overdue: 0 },
  { month: "Apr", paid: 39000, open: 0, overdue: 0 },
  { month: "May", paid: 86000, open: 0, overdue: 0 },
  { month: "Jun", paid: 94000, open: 18000, overdue: 72000 },
  { month: "Jul", paid: 82000, open: 18000, overdue: 66000 },
];

const invoices = [
  ["INV-2081", "Q3 workspace expansion · 40 seats", 96000, "Overdue", "Due 12 days ago"],
  ["INV-2074", "Annual agreement · Q3 instalment", 88000, "Overdue", "Due 4 days ago"],
  ["INV-2068", "Priority support retainer", 18000, "Open", "Due in 16 days"],
  ["INV-2055", "Annual agreement · Q2 instalment", 88000, "Paid", "Paid 14 May 2026"],
  ["INV-2041", "Custom component commission · design system", 42500, "Paid", "Paid 2 Apr 2026"],
  ["INV-2029", "Annual agreement · Q1 instalment", 88000, "Paid", "Paid 19 Feb 2026"],
  ["INV-2014", "Figma kit handoff · design system", 12400, "Paid", "Paid 8 Jan 2026"],
  ["INV-2098", "Q4 workspace expansion · product team", 74000, "Draft", "Not yet issued"],
] as const;

const contacts = [
  ["IS", "Ingrid Sandoval", "Account manager", "ingrid@paymine.tn", true],
  ["MP", "Maya Patel", "Head of Product", "maya@paymine.tn", false],
  ["SM", "Sofia Martins", "Finance lead", "finance@paymine.tn", false],
] as const;

const notes = [
  ["12 Jun 2026", "Quarterly settlement review completed. Distributor volume is tracking above plan and no unreconciled balance remains."],
  ["28 Apr 2026", "Finance confirmed every statement should include the distributor reference ID to avoid matching delays."],
  ["15 Feb 2026", "Adjusted the commission plan after a duplicate payout was identified and corrected."],
] as const;

const activities = [
  ["Invoice INV-2081 passed its due date", "$96,000.00 · first reminder sent", "12 days ago", "warning"],
  ["Invoice INV-2074 issued", "$88,000.00 · September settlement", "18 days ago", "invoice"],
  ["Payment received for INV-2055", "$88,000.00 · bank transfer cleared", "14 May 2026", "success"],
  ["Wallet reconciliation completed", "$28,450.75 · ledger matched", "12 May 2026", "wallet"],
] as const;

const chartConfig = {
  paid: { label: "Paid", color: "var(--foreground)" },
  open: { label: "Open", color: "var(--muted-foreground)" },
  overdue: {
    label: "Overdue",
    color: "color-mix(in oklch, var(--muted-foreground) 55%, transparent)",
  },
} satisfies ChartConfig;

function Page() {
  const distributor = distributors[0];
  const [leftTab, setLeftTab] = React.useState<LeftTab>("Details");
  const [mainTab, setMainTab] = React.useState<MainTab>("Invoices");

  const totalBilled = billedMonths.reduce(
    (total, item) => total + item.paid + item.open + item.overdue,
    0,
  );

  return (
    <section
      data-content-padding="false"
      className="flex min-h-full min-w-0 flex-col bg-background text-foreground"
    >
      <div className="grid min-w-0 xl:grid-cols-[414px_minmax(0,1fr)]">
        <aside className="border-b xl:border-b-0 xl:border-r">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-14 shrink-0">
                <AvatarImage
                  src={distributor.avatarUrl || undefined}
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-base">
                  {getInitials(distributor.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {distributor.name}
                </h1>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {distributor.email}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <FileText />
                New invoice
              </Button>
              <Button size="sm" variant="outline">
                <Mail />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare />
                Add note
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Lifetime volume" value="$2.41M" />
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
                  <Pencil className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {leftTab === "Details" ? (
              <>
                <div className="space-y-5">
                  <DetailRow icon={Building2} label="Legal name" value={distributor.name} />
                  <DetailRow icon={Mail} label="Billing email" value={distributor.email} />
                  <DetailRow icon={MapPin} label="Location" value="Tunis, Tunisia" />
                  <DetailRow icon={CalendarDays} label="Customer since" value={distributor.joinedDate} />
                  <DetailRow icon={UserRound} label="Account manager" value="Ingrid Sandoval" />
                  <DetailRow icon={CreditCard} label="Tax ID" value="TN 74 612 893 204" />
                  <DetailRow
                    icon={CreditCard}
                    label="Payment terms"
                    value="Net 30"
                  />
                  <DetailRow
                    icon={Users}
                    label="Licensed players"
                    value={String(distributor.players) + " active"}
                  />
                </div>

                <div className="mt-7 border-t pt-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">About the account</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {distributor.name} uses the full PayMine distribution workspace across
                    settlement, payment routing, player operations, and account controls.
                    This enterprise-style account currently tracks {distributor.players} linked players.
                  </p>
                </div>
              </>
            ) : null}

            {leftTab === "Contacts" ? (
              <div className="space-y-0">
                {contacts.map(([initials, name, role, email, primary]) => (
                  <div
                    key={name}
                    className="flex items-start gap-3 border-b py-4 first:pt-0"
                  >
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
          <div className="border-b p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Billed volume · last 12 months</p>
                <div className="mt-1 text-3xl font-semibold tracking-tight">
                  {formatCompactCurrency(totalBilled)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <Legend label="Paid" value="$858K" tone="dark" />
                <Legend label="Open" value="$18K" tone="medium" />
                <Legend label="Overdue" value="$184K" tone="light" />
              </div>
            </div>

            <div className="mt-5">
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <BarChart
                  data={billedMonths}
                  margin={{ top: 2, right: 4, left: 0, bottom: 0 }}
                  barCategoryGap="48%"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={42}
                    ticks={[0, 100000, 200000]}
                    tickFormatter={(value) => (value === 0 ? "0" : value / 1000 + "k")}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => String(value)}
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === "paid" ? "Paid" : name === "open" ? "Open" : "Overdue",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="overdue"
                    stackId="volume"
                    fill="var(--color-overdue)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive
                    animationBegin={240}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="open"
                    stackId="volume"
                    fill="var(--color-open)"
                    isAnimationActive
                    animationBegin={140}
                    animationDuration={980}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="paid"
                    stackId="volume"
                    fill="var(--color-paid)"
                    isAnimationActive
                    animationDuration={820}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
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
                  <WalletCards className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
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
          <div
            key={id}
            className="rounded-xl border p-4 transition-colors hover:bg-muted/20"
          >
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
    <div className="space-y-0">
      {activities.map(([title, detail, date, tone]) => (
        <div key={title} className="flex items-start gap-4 border-b py-4 first:pt-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {tone === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : tone === "invoice" ? (
              <FileText className="size-4" />
            ) : tone === "wallet" ? (
              <WalletCards className="size-4" />
            ) : (
              <CreditCard className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
        </div>
      ))}
    </div>
  );
}

function PaymentMethodsPanel({
  distributor,
}: {
  distributor: (typeof distributors)[number];
}) {
  const methods = distributor.configuration?.paymentMethods ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {methods.slice(0, 6).map((method) => (
        <div key={method.id} className="rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {method.category === "Wallet" ? (
                <WalletCards className="size-5 text-muted-foreground" />
              ) : (
                <CreditCard className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">{method.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {method.category} · {method.providerAccountRef ?? method.id}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Request limit: {method.requestLimit ?? "—"} · Amount limit:{" "}
                {method.amountLimit ? formatCurrency(method.amountLimit) : "—"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({
  distributor,
}: {
  distributor: (typeof distributors)[number];
}) {
  const config = distributor.configuration;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Processing settings</p>
        <div className="mt-4 divide-y">
          <SettingRow
            label="Processing scope"
            value={config?.processingScope ?? "Deposits & Withdrawals"}
          />
          <SettingRow label="Fee mode" value={config?.feeMode ?? "Commission"} />
          <SettingRow
            label="Deposit commission"
            value={
              config?.defaultDepositCommissionRate != null
                ? config.defaultDepositCommissionRate + "%"
                : "—"
            }
          />
          <SettingRow
            label="Withdrawal commission"
            value={
              config?.defaultWithdrawalCommissionRate != null
                ? config.defaultWithdrawalCommissionRate + "%"
                : "—"
            }
          />
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Account controls</p>
        <div className="mt-4 space-y-2">
          <SettingAction
            icon={Check}
            title="Account verified"
            detail="Identity and business details confirmed"
          />
          <SettingAction
            icon={Users}
            title="Linked players"
            detail={String(distributor.players) + " active players"}
          />
          <SettingAction
            icon={WalletCards}
            title="Wallet model"
            detail={distributor.walletModel ?? "Transaction ledger"}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <span className="min-w-0 text-sm font-medium">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Legend({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "dark" | "medium" | "light";
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "dark"
            ? "bg-foreground"
            : tone === "medium"
              ? "bg-muted-foreground"
              : "bg-muted-foreground/50",
        )}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function InvoiceBadge({ status }: { status: string }) {
  const styles =
    status === "Paid"
      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      : status === "Open"
        ? "border-blue-500/30 text-blue-600 dark:text-blue-400"
        : status === "Draft"
          ? "border-border text-muted-foreground"
          : "border-red-500/30 text-red-500";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 py-0.5 text-[10px] font-normal", styles)}
    >
      {status}
    </Badge>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function SettingAction({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </button>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return "$" + Math.round(value / 1_000) + "K";
  return formatCurrency(value);
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

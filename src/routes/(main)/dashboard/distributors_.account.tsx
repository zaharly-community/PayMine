import * as React from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clipboard,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type MainTab = "Overview" | "Activity" | "Payment methods" | "Settings";
type Period = "6M" | "12M";

const volume12Months = [
  { month: "Aug", gross: 62000, net: 55000 },
  { month: "Sep", gross: 76000, net: 67000 },
  { month: "Oct", gross: 89000, net: 77000 },
  { month: "Nov", gross: 42000, net: 37000 },
  { month: "Dec", gross: 97000, net: 84000 },
  { month: "Jan", gross: 72000, net: 61000 },
  { month: "Feb", gross: 91000, net: 79000 },
  { month: "Mar", gross: 68000, net: 59000 },
  { month: "Apr", gross: 88000, net: 76000 },
  { month: "May", gross: 104000, net: 90000 },
  { month: "Jun", gross: 142000, net: 122000 },
  { month: "Jul", gross: 129000, net: 112000 },
];

const recentPayments = [
  ["PMT-49821", "Maya Ben Amor", "Visa", 1840.5, "Succeeded", "18 Sep 2026"],
  ["PMT-49817", "Sami Trabelsi", "Flouci", 920, "Succeeded", "18 Sep 2026"],
  ["PMT-49798", "Ines Gharbi", "D17", 1260.75, "Succeeded", "17 Sep 2026"],
  ["PMT-49774", "Youssef Jaziri", "Mastercard", 2400, "Pending", "17 Sep 2026"],
  ["PMT-49765", "Amal Kallel", "e-Dinar", 680, "Succeeded", "16 Sep 2026"],
  ["PMT-49742", "Karim Mejri", "Visa", 3120, "Refunded", "16 Sep 2026"],
] as const;

const invoices = [
  ["INV-2081", "Monthly settlement · August", 96000, "Overdue", "Due 12 days ago"],
  ["INV-2074", "Monthly settlement · September", 88000, "Overdue", "Due 4 days ago"],
  ["INV-2068", "Distributor support retainer", 18000, "Open", "Due in 16 days"],
  ["INV-2055", "Network commission · Q2", 88000, "Paid", "Paid 14 May 2026"],
] as const;

const activities = [
  ["Payment received", "PMT-49821 · $1,840.50 cleared through Visa", "18 Sep 2026, 04:48 PM", CheckCircle2],
  ["Invoice reminder sent", "INV-2081 is still open and has passed its due date", "18 Sep 2026, 02:20 PM", Clock3],
  ["Payment method enabled", "D17 provider access was confirmed for the account", "17 Sep 2026, 11:08 AM", CreditCard],
  ["Wallet reconciled", "Prefunded wallet matched the expected balance", "16 Sep 2026, 05:14 PM", WalletCards],
  ["Account reviewed", "Risk and operational settings reviewed by Finance", "15 Sep 2026, 09:36 AM", ShieldCheck],
  ["Player limit updated", "Linked player capacity increased to 200", "12 Sep 2026, 03:12 PM", Users],
] as const;

const chartConfig = {
  gross: {
    label: "Gross volume",
    color: "var(--chart-3)",
  },
  net: {
    label: "Net volume",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function Page() {
  const distributor = distributors[0];
  const [activeTab, setActiveTab] = React.useState<MainTab>("Overview");
  const [period, setPeriod] = React.useState<Period>("12M");
  const [copied, setCopied] = React.useState(false);

  const volume = period === "12M" ? volume12Months : volume12Months.slice(-6);
  const periodTotal = volume.reduce((sum, item) => sum + item.gross, 0);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(distributor.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      data-content-padding="false"
      className="min-h-full min-w-0 bg-background text-foreground"
    >
      <header className="border-b bg-background">
        <div className="flex min-h-16 min-w-0 items-center gap-3 px-4 lg:px-6">
          <Link
            to="/dashboard/distributors"
            aria-label="Back to distributors"
            title="Back to distributors"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="default" className="size-10 shrink-0">
              <AvatarImage
                src={distributor.avatarUrl || undefined}
                alt=""
                referrerPolicy="no-referrer"
              />
              <AvatarFallback>{getInitials(distributor.name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight">{distributor.name}</h1>
                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 text-[10px]">
                  <BadgeCheck className="size-3" />
                  Verified
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400"
                >
                  Active
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                @{distributor.username} · {distributor.type} · {distributor.email}
              </p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" className="hidden sm:inline-flex">
              <Mail />
              Email
            </Button>
            <Button size="sm" variant="outline" className="hidden md:inline-flex">
              <FileText />
              New invoice
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="More account actions">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b xl:border-b-0 xl:border-r">
          <div className="space-y-6 p-4 lg:p-5 xl:sticky xl:top-0">
            <section>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Account overview
                </p>
                <Button size="icon-xs" variant="ghost" onClick={copyId} aria-label="Copy distributor ID">
                  <Clipboard className="size-3.5" />
                </Button>
              </div>

              <div className="mt-3 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <UserRound className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{distributor.name}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{distributor.id}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label="Players" value={String(distributor.players)} />
                  <MiniStat label="Last active" value="2 min" />
                  <MiniStat label="Role" value={distributor.type} />
                  <MiniStat label="Status" value="Active" />
                </div>
              </div>

              {copied ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Distributor ID copied.</p>
              ) : null}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Contact
              </p>
              <div className="mt-3 space-y-1">
                <ContactRow icon={Mail} label="Billing email" value={distributor.email} />
                <ContactRow icon={CalendarDays} label="Joined" value={distributor.joinedDate} />
                <ContactRow icon={Clock3} label="Last active" value="2 minutes ago" />
              </div>
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Processing profile
              </p>
              <div className="mt-3 space-y-1">
                <ContactRow
                  icon={BarChart3}
                  label="Scope"
                  value={distributor.configuration?.processingScope ?? "Deposits & Withdrawals"}
                />
                <ContactRow
                  icon={Settings2}
                  label="Fee mode"
                  value={distributor.configuration?.feeMode ?? "Commission"}
                />
                <ContactRow
                  icon={WalletCards}
                  label="Wallet model"
                  value={distributor.walletModel ?? "Transaction ledger"}
                />
              </div>
            </section>

            <section className="border-t pt-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                About
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enterprise-style account workspace for monitoring distributor volume, settlements,
                account controls, payment methods, and operational history.
              </p>
              <Button size="sm" variant="ghost" className="mt-2 -ml-2">
                <MessageSquare />
                Add note
              </Button>
            </section>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden">
          <div className="space-y-4 p-4 lg:p-6">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard
                icon={CircleDollarSign}
                label="Lifetime volume"
                value="$1.06M"
                detail="+12.8% vs previous period"
              />
              <MetricCard
                icon={WalletCards}
                label="Wallet balance"
                value={formatCurrency(distributor.balance)}
                detail="Available for operations"
              />
              <MetricCard
                icon={Banknote}
                label="Commission earned"
                value="$41,820"
                detail="+8.4% across the last 12 months"
              />
              <MetricCard
                icon={Activity}
                label="Success rate"
                value="98.4%"
                detail="Across the latest 2,184 operations"
              />
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div>
                  <CardDescription className="text-xs">Processed volume</CardDescription>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                      {formatCompactCurrency(periodTotal)}
                    </CardTitle>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      +12.8%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gross vs net distributor volume
                  </p>
                </div>

                <CardAction className="flex items-center gap-2">
                  <div className="flex rounded-lg border p-0.5">
                    {(["6M", "12M"] as Period[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPeriod(item)}
                        className={cn(
                          "h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors",
                          period === item && "bg-muted text-foreground",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <Button size="icon-sm" variant="ghost" aria-label="Chart options">
                    <MoreHorizontal />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <LegendDot className="bg-chart-3" label="Gross volume" />
                  <LegendDot className="bg-chart-4" label="Net volume" />
                  <span className="ml-auto hidden sm:inline">{period === "12M" ? "Aug 2025 – Jul 2026" : "Feb 2026 – Jul 2026"}</span>
                </div>

                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={volume}
                      margin={{ top: 8, right: 2, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="distributorGrossFill" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--color-gross)"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-gross)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                        <linearGradient id="distributorNetFill" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--color-net)"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-net)"
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        width={48}
                        tick={{ fontSize: 10 }}
                        tickFormatter={formatAxisCurrency}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            className="w-44"
                            labelFormatter={(value) => String(value)}
                            formatter={(value, name) => [
                              formatCurrency(Number(value)),
                              name === "gross" ? "Gross volume" : "Net volume",
                            ]}
                          />
                        }
                      />
                      <Area
                        dataKey="gross"
                        type="natural"
                        stroke="var(--color-gross)"
                        fill="url(#distributorGrossFill)"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                      <Area
                        dataKey="net"
                        type="natural"
                        stroke="var(--color-net)"
                        fill="url(#distributorNetFill)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive
                        animationDuration={1400}
                        animationBegin={150}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="flex overflow-x-auto border-b">
              {(["Overview", "Activity", "Payment methods", "Settings"] as MainTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-4 text-sm font-medium text-muted-foreground transition-colors",
                      activeTab === tab && "border-foreground text-foreground",
                    )}
                  >
                    {tab === "Overview" ? (
                      <BarChart3 className="size-4" />
                    ) : tab === "Activity" ? (
                      <Activity className="size-4" />
                    ) : tab === "Payment methods" ? (
                      <CreditCard className="size-4" />
                    ) : (
                      <Settings2 className="size-4" />
                    )}
                    {tab}
                  </button>
                ),
              )}
            </div>

            {activeTab === "Overview" ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent payments</CardTitle>
                    <CardDescription>Latest payment activity routed through this account.</CardDescription>
                    <CardAction>
                      <Button size="sm" variant="outline">
                        View all
                        <ArrowUpRight />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <div className="hidden overflow-hidden rounded-lg border md:block">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-xs text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Reference</th>
                            <th className="px-3 py-2 text-left font-medium">Customer</th>
                            <th className="px-3 py-2 text-left font-medium">Method</th>
                            <th className="px-3 py-2 text-right font-medium">Amount</th>
                            <th className="px-3 py-2 text-left font-medium">Status</th>
                            <th className="px-3 py-2 text-right font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPayments.map(([reference, customer, method, amount, status, date]) => (
                            <tr key={reference} className="border-t">
                              <td className="px-3 py-3 font-mono text-xs">{reference}</td>
                              <td className="px-3 py-3 font-medium">{customer}</td>
                              <td className="px-3 py-3 text-muted-foreground">{method}</td>
                              <td className="px-3 py-3 text-right font-semibold tabular-nums">
                                {formatCurrency(amount)}
                              </td>
                              <td className="px-3 py-3">
                                <PaymentStatus status={status} />
                              </td>
                              <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                                {date}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 md:hidden">
                      {recentPayments.map(([reference, customer, method, amount, status, date]) => (
                        <div key={reference} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs">{reference}</p>
                              <p className="mt-1 truncate text-sm font-medium">{customer}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {method} · {date}
                              </p>
                            </div>
                            <PaymentStatus status={status} />
                          </div>
                          <div className="mt-3 text-sm font-semibold tabular-nums">
                            {formatCurrency(amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Open and recently settled distributor invoices.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {invoices.map(([id, title, amount, status, meta]) => (
                      <div
                        key={id}
                        className="group rounded-lg border p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs">{id}</p>
                            <p className="mt-1 truncate text-sm font-medium">{title}</p>
                          </div>
                          <InvoiceBadge status={status} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">{meta}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                          <span>Open invoice</span>
                          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "Activity" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Account activity</CardTitle>
                  <CardDescription>Operational events, settlements, and configuration changes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {activities.map(([title, detail, date, Icon]) => (
                      <div key={title + date} className="flex items-start gap-4 py-4 first:pt-0">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{title}</p>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "Payment methods" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {(distributor.configuration?.paymentMethods ?? []).map((method) => (
                  <Card key={method.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {method.category === "Wallet" ? (
                            <Banknote className="size-5 text-muted-foreground" />
                          ) : (
                            <CreditCard className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <CardTitle>{method.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {method.category} · {method.providerAccountRef ?? method.id}
                          </CardDescription>
                        </div>
                      </div>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            !method.enabled && "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {method.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      <DetailValue label="Request limit" value={String(method.requestLimit ?? "—")} />
                      <DetailValue
                        label="Amount limit"
                        value={method.amountLimit ? formatCurrency(method.amountLimit) : "—"}
                      />
                      <DetailValue
                        label="Deposit commission"
                        value={
                          method.depositCommissionRate != null
                            ? method.depositCommissionRate + "%"
                            : "—"
                        }
                      />
                      <DetailValue
                        label="Withdrawal commission"
                        value={
                          method.withdrawalCommissionRate != null
                            ? method.withdrawalCommissionRate + "%"
                            : "—"
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {activeTab === "Settings" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing settings</CardTitle>
                    <CardDescription>Current configuration applied to this distributor account.</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y">
                    <SettingRow
                      label="Processing scope"
                      value={distributor.configuration?.processingScope ?? "Deposits & Withdrawals"}
                    />
                    <SettingRow
                      label="Fee mode"
                      value={distributor.configuration?.feeMode ?? "Commission"}
                    />
                    <SettingRow
                      label="Commission transactions"
                      value={
                        distributor.configuration?.commissionTransactions ?? "Deposits & Withdrawals"
                      }
                    />
                    <SettingRow
                      label="Deposit commission"
                      value={
                        distributor.configuration?.defaultDepositCommissionRate != null
                          ? distributor.configuration.defaultDepositCommissionRate + "%"
                          : "—"
                      }
                    />
                    <SettingRow
                      label="Withdrawal commission"
                      value={
                        distributor.configuration?.defaultWithdrawalCommissionRate != null
                          ? distributor.configuration.defaultWithdrawalCommissionRate + "%"
                          : "—"
                      }
                    />
                    <SettingRow
                      label="Default request limit"
                      value={
                        distributor.configuration?.defaultRequestLimit != null
                          ? String(distributor.configuration.defaultRequestLimit)
                          : "—"
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account controls</CardTitle>
                    <CardDescription>Operational actions and account-level access.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <SettingAction
                      icon={ShieldCheck}
                      title="Risk review"
                      detail="Account last reviewed on 15 Sep 2026"
                    />
                    <SettingAction
                      icon={Users}
                      title="Linked players"
                      detail={distributor.players + " active players on this account"}
                    />
                    <SettingAction
                      icon={Mail}
                      title="Billing contact"
                      detail={distributor.email}
                    />
                    <SettingAction
                      icon={Settings2}
                      title="Program configuration"
                      detail={distributor.configuration?.programName ?? "Configured distributor program"}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted">
            <Icon className="size-3.5" />
          </div>
          <span className="truncate">{label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/40">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-2 rounded-full", className)} />
      <span>{label}</span>
    </span>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const styles =
    status === "Succeeded"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : status === "Pending"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-border bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[10px]", styles)}>
      {status}
    </Badge>
  );
}

function InvoiceBadge({ status }: { status: string }) {
  const styles =
    status === "Paid"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : status === "Open"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
        : "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400";

  return (
    <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[10px]", styles)}>
      {status}
    </Badge>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3">
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
      className="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <ChevronRight className="mt-1 size-4 text-muted-foreground" />
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

function formatAxisCurrency(value: number) {
  if (value >= 100_000) return "$" + Math.round(value / 1_000) + "k";
  if (value >= 1_000) return "$" + Math.round(value / 1_000) + "k";
  return "$" + value;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

import type { ComponentType, ReactNode } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Ellipsis,
  LifeBuoy,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Funnel, FunnelChart, LabelList, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "cn";
import type { UserRole } from "@/stores/auth/auth-provider";
import { useBrand } from "@/stores/brands/brand-provider";

const chartConfig = {
  volume: { label: "Volume", color: "var(--foreground)" },
  deposits: { label: "Deposits", color: "var(--primary)" },
  withdrawals: { label: "Withdrawals", color: "color-mix(in oklch, var(--primary) 75%, var(--background))" },
} satisfies ChartConfig;

export function RoleDashboard({ role }: { role: UserRole }) {
  switch (role) {
    case "SaaS Owner":
      return <SaasOwnerDashboard />;
    case "Brand Admin":
      return <BrandAdminDashboard />;
    case "Supervisor":
      return <SupervisorDashboard />;
    case "Agent":
      return <AgentDashboard />;
    case "Assistant":
      return <AssistantDashboard />;
  }
}

function DashboardShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6" data-content-padding="false">
      <div className="border-b px-5 pb-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge variant="outline" className="w-fit">
            Demo data
          </Badge>
        </div>
      </div>
      <div className="space-y-6 px-5 pb-6">{children}</div>
    </section>
  );
}

function StatGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    note: string;
    icon: ComponentType<{ className?: string }>;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, note, icon: Icon }) => (
        <Card key={label} className="shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? (
        <Button variant="ghost" size="sm" className="h-8 px-2">
          {action}
        </Button>
      ) : null}
    </div>
  );
}

function HealthRow({
  name,
  detail,
  value,
  status,
}: {
  name: string;
  detail: string;
  value: string;
  status: "healthy" | "attention" | "critical";
}) {
  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-0">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
          status === "critical" && "text-destructive",
        )}
      >
        {status === "healthy" ? (
          <CheckCircle2 className="size-4" />
        ) : status === "attention" ? (
          <AlertTriangle className="size-4" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium tabular-nums">{value}</p>
        <Badge variant={status === "healthy" ? "secondary" : "outline"} className="mt-1 px-1.5 py-0 text-[10px]">
          {status}
        </Badge>
      </div>
    </div>
  );
}

function SaasOwnerDashboard() {
  const platformTrend = [
    { month: "Apr", volume: 410000, commission: 18200 },
    { month: "May", volume: 470000, commission: 19800 },
    { month: "Jun", volume: 530000, commission: 22100 },
    { month: "Jul", volume: 590000, commission: 24700 },
    { month: "Aug", volume: 620000, commission: 26800 },
    { month: "Sep", volume: 710000, commission: 29400 },
  ];

  return (
    <DashboardShell
      eyebrow="SaaS Owner"
      title="Platform dashboard"
      description="A high-level view of platform growth, users, subscriptions, commission revenue, and overall business health."
    >
      <StatGrid
        items={[
          { label: "Total users", value: "11,640", note: "+7.0% this month", icon: Users },
          { label: "Active users", value: "9,420", note: "81.0% of total users", icon: UserCheck },
          { label: "Platform commission", value: "$184.7K", note: "+12.8% vs prior period", icon: DollarSign },
          { label: "MRR", value: "$22.6K", note: "+8.4% month over month", icon: CreditCard },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active brands</p>
            <p className="mt-3 text-xl font-semibold tabular-nums">18</p>
            <p className="mt-1 text-xs text-muted-foreground">2 onboarded this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payment volume</p>
            <p className="mt-3 text-xl font-semibold tabular-nums">$3.84M</p>
            <p className="mt-1 text-xs text-muted-foreground">Across all brands · monthly</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active subscriptions</p>
            <p className="mt-3 text-xl font-semibold tabular-nums">2,346</p>
            <p className="mt-1 text-xs text-muted-foreground">96.8% gross retention</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Net churn</p>
            <p className="mt-3 text-xl font-semibold tabular-nums">1.8%</p>
            <p className="mt-1 text-xs text-muted-foreground">Down 0.6 pts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.65fr)]">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={BarChart3}
              title="Platform economics"
              description="Payment volume and commission generated over six months"
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              volume: { label: "Payment volume", color: "var(--foreground)" },
              commission: { label: "Commission", color: "var(--muted-foreground)" },
            }} className="h-[270px] w-full">
              <BarChart data={platformTrend} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={48} tickFormatter={(value) => "$" + Number(value).toLocaleString("en-US")} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => "$" + Number(value).toLocaleString()} />} />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" fill="var(--color-commission)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle icon={Activity} title="Platform snapshot" description="Current business position" />
          </CardHeader>
          <CardContent className="space-y-0">
            <HealthRow name="User activation" detail="9,420 active of 11,640 total" value="81%" status="healthy" />
            <HealthRow name="Subscription health" detail="2,346 active subscriptions" value="96.8%" status="healthy" />
            <HealthRow name="Commission yield" detail="Blended platform take rate" value="4.8%" status="healthy" />
            <HealthRow name="Risk exposure" detail="Settlement and operational exceptions" value="$412K" status="attention" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle icon={Users} title="User overview" description="The signals that matter to platform growth" />
          </CardHeader>
          <CardContent className="space-y-0">
            <HealthRow name="New users" detail="This month · 764 newly registered" value="+7.0%" status="healthy" />
            <HealthRow name="Active users" detail="Logged in or transacted during the period" value="9,420" status="healthy" />
            <HealthRow name="Pending activation" detail="Invited or onboarding users" value="1,486" status="attention" />
            <HealthRow name="Suspended / inactive" detail="Accounts outside normal activity" value="734" status="attention" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle icon={CreditCard} title="Subscription overview" description="Recurring revenue and package movement" />
          </CardHeader>
          <CardContent className="space-y-0">
            <HealthRow name="New subscriptions" detail="Created during the current month" value="262" status="healthy" />
            <HealthRow name="Upgrades" detail="Accounts moving into higher plans" value="84" status="healthy" />
            <HealthRow name="Cancellations" detail="Subscriptions cancelled this month" value="55" status="attention" />
            <HealthRow name="MRR expansion" detail="Net monthly recurring revenue movement" value="+8.4%" status="healthy" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <SectionTitle icon={BarChart3} title="Go deeper" description="Detailed reporting is separated from the operational dashboard." />
            <a href="/dashboard/reports" className="text-xs font-medium hover:underline">Open Reports</a>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <DashboardLink title="User analytics" detail="Growth, activation, retention, and user quality." to="/dashboard/reports" />
          <DashboardLink title="Commission analytics" detail="Commission by period, brand, package, and volume." to="/dashboard/reports" />
          <DashboardLink title="Subscription analytics" detail="MRR, ARR, churn, upgrades, and package mix." to="/dashboard/reports" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function DashboardLink({ title, detail, to }: { title: string; detail: string; to: string }) {
  return (
    <a href={to} className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </a>
  );
}

function BrandAdminDashboard() {
  const { activeBrand } = useBrand();
  const todayLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const hourlyActivity = [
    { hour: "00", deposits: 120, withdrawals: 35 },
    { hour: "01", deposits: 85, withdrawals: 25 },
    { hour: "02", deposits: 60, withdrawals: 20 },
    { hour: "03", deposits: 45, withdrawals: 15 },
    { hour: "04", deposits: 55, withdrawals: 20 },
    { hour: "05", deposits: 120, withdrawals: 45 },
    { hour: "06", deposits: 220, withdrawals: 90 },
    { hour: "07", deposits: 480, withdrawals: 160 },
    { hour: "08", deposits: 810, withdrawals: 280 },
    { hour: "09", deposits: 1250, withdrawals: 400 },
    { hour: "10", deposits: 1720, withdrawals: 590 },
    { hour: "11", deposits: 1950, withdrawals: 710 },
    { hour: "12", deposits: 2280, withdrawals: 840 },
    { hour: "13", deposits: 2410, withdrawals: 920 },
    { hour: "14", deposits: 2250, withdrawals: 870 },
    { hour: "15", deposits: 2120, withdrawals: 810 },
    { hour: "16", deposits: 2330, withdrawals: 860 },
    { hour: "17", deposits: 2510, withdrawals: 930 },
    { hour: "18", deposits: 2390, withdrawals: 840 },
    { hour: "19", deposits: 2130, withdrawals: 790 },
    { hour: "20", deposits: 1970, withdrawals: 680 },
    { hour: "21", deposits: 1680, withdrawals: 550 },
    { hour: "22", deposits: 1320, withdrawals: 420 },
    { hour: "23", deposits: 980, withdrawals: 320 },
  ];

  const totals = hourlyActivity.reduce(
    (result, hour) => ({
      deposits: result.deposits + hour.deposits,
      withdrawals: result.withdrawals + hour.withdrawals,
    }),
    { deposits: 0, withdrawals: 0 },
  );
  const cashflow = totals.deposits - totals.withdrawals;
  const estimatedProfit = Math.round(totals.deposits * 0.025 + totals.withdrawals * 0.032);
  const money = (value: number) => "$" + Math.round(value).toLocaleString("en-US");

  const topPlayers = [
    { id: "PLRBSSTUDIO", transactions: 24, volume: 4820, lastActivity: "2 min ago" },
    { id: "PLR-29011458", transactions: 19, volume: 3640, lastActivity: "4 min ago" },
    { id: "PLR-61592013", transactions: 16, volume: 2910, lastActivity: "8 min ago" },
    { id: "PLR-99184720", transactions: 13, volume: 2480, lastActivity: "11 min ago" },
    { id: "PLR-18324011", transactions: 11, volume: 1950, lastActivity: "15 min ago" },
  ];

  const queueItems = [
    { label: "Pending review", count: 12, detail: "Oldest pending · 18 min", tone: "bg-amber-500" },
    { label: "Processing", count: 7, detail: "Oldest in progress · 11 min", tone: "bg-sky-500" },
    { label: "Waiting correction", count: 4, detail: "Oldest correction · 32 min", tone: "bg-destructive" },
  ];

  const completedTransactions = 318;
  const successfulTransactions = 350;
  const successRate = (successfulTransactions / 364) * 100;

  const queueFunnel = [
    { name: "Transactions received", value: 364 },
    { name: "Details verified", value: 352 },
    { name: "Approved for processing", value: 341 },
    { name: "Completed", value: completedTransactions },
  ];

  const cardPressure = [
    { metric: "Capacity", value: 92 },
    { metric: "Queue", value: 74 },
    { metric: "Latency", value: 61 },
    { metric: "Failures", value: 28 },
    { metric: "Reports", value: 42 },
  ];

  return (
    <DashboardShell
      eyebrow={"Brand Admin · " + todayLabel}
      title={activeBrand.name + " — Today's performance"}
      description="Monitor today's payment volume, card capacity, transaction flow and issues that need attention."
    >
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3 sm:px-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Payment card nearing capacity</p>
              <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">92% used</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Settlement card is close to its daily limit. Review its capacity to avoid declined payments.
            </p>
          </div>
          <a href="/dashboard/payment-methods" className="shrink-0 pt-1 text-xs font-medium hover:underline">Review</a>
        </div>
        <div className="flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3 sm:px-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LifeBuoy className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">New player report</p>
              <Badge variant="destructive">New</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              PLRBSSTUDIO reported a deposit not received. The case is waiting for review.
            </p>
          </div>
          <a href="/dashboard/players/PLRBSSTUDIO" className="shrink-0 pt-1 text-xs font-medium hover:underline">Open</a>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="bg-card flex min-w-0 flex-1 flex-col gap-4 rounded-xl border p-4 sm:gap-6 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                {money(totals.deposits + totals.withdrawals)}
              </p>
              <p className="text-xs text-muted-foreground">Total Payment Volume (Today)</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex sm:gap-5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary sm:size-3" />
                <span className="text-xs text-muted-foreground">Deposits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground sm:size-3" />
                <span className="text-xs text-muted-foreground">Withdrawals</span>
              </div>
            </div>
            <span className="rounded-md border px-2 py-1 text-[10px] text-muted-foreground sm:text-xs">Today · 24 hours</span>
          </div>
          <div className="h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[280px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={hourlyActivity} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                  tickFormatter={(value) => value + ":00"}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(value) => Number(value) === 0 ? "$0" : "$" + (Number(value) / 1000).toLocaleString("en-US") + "k"}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value + ":00"}
                      formatter={(value, name) => [
                        "$" + Number(value).toLocaleString("en-US"),
                        name === "deposits" ? "Deposits" : "Withdrawals",
                      ]}
                    />
                  }
                />
                <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} maxBarSize={15} />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span>Hourly deposit and withdrawal activity</span>
            <span>Illustrative data · refreshes when connected to live payments</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[420px] xl:shrink-0 xl:grid-cols-2">
          {[
            { label: "Deposits today", value: money(totals.deposits), trend: "246 transactions", tone: "text-muted-foreground" },
            { label: "Withdrawals today", value: money(totals.withdrawals), trend: "118 transactions", tone: "text-muted-foreground" },
            { label: "Net cashflow", value: money(cashflow), trend: "Deposits minus withdrawals", tone: "text-muted-foreground" },
            { label: "Estimated profit", value: money(estimatedProfit), trend: "Estimated payment fees", tone: "text-muted-foreground" },
            { label: "Completed", value: completedTransactions.toLocaleString("en-US"), trend: "Today · all methods", tone: "text-emerald-600 dark:text-emerald-400" },
            { label: "Success rate", value: successRate.toFixed(1) + "%", trend: "Across today's attempts", tone: "text-emerald-600 dark:text-emerald-400" },
          ].map((metric) => (
            <div key={metric.label} className="bg-card flex min-w-0 flex-col rounded-xl border p-3 sm:p-4">
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs text-muted-foreground sm:text-sm">{metric.label}</span>
                <Ellipsis className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="mt-3 break-words text-lg font-semibold tracking-tight sm:text-xl">{metric.value}</span>
              <p className={"mt-1 text-[10px] leading-4 sm:text-xs " + metric.tone}>{metric.trend}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="bg-card min-w-0 rounded-xl border p-4 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <SectionTitle
              icon={Clock3}
              title="Payment queue"
              description="Payment flow from initiation to completion"
            />
            <a href="/dashboard/deposits" className="shrink-0 pt-1 text-xs font-medium hover:underline">Open queue</a>
          </div>
          <ChartContainer
            config={{
              value: { label: "Transactions", color: "var(--primary)" },
            }}
            className="h-[220px] w-full"
          >
            <FunnelChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [Number(value).toLocaleString("en-US"), "Transactions"]}
                  />
                }
              />
              <Funnel dataKey="value" data={queueFunnel} isAnimationActive fill="var(--color-value)" stroke="var(--background)" strokeWidth={2}>
                <LabelList dataKey="name" position="inside" fill="var(--primary-foreground)" fontSize={10} />
              </Funnel>
            </FunnelChart>
          </ChartContainer>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
            {[
              { label: "Pending review", value: "12", color: "bg-amber-500" },
              { label: "Processing", value: "7", color: "bg-sky-500" },
              { label: "Correction", value: "4", color: "bg-destructive" },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={"size-2 shrink-0 rounded-full " + item.color} />
                  <span className="truncate text-[10px] text-muted-foreground sm:text-xs">{item.label}</span>
                </div>
                <p className="mt-1 pl-3.5 text-sm font-semibold tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card min-w-0 rounded-xl border p-4 sm:p-6">
          <div className="mb-1 flex items-start justify-between gap-3">
            <SectionTitle
              icon={CreditCard}
              title="Card pressure monitor"
              description="Normalized pressure across key payment signals"
            />
            <Badge variant="outline" className="shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-400">High load</Badge>
          </div>
          <ChartContainer
            config={{
              pressure: { label: "Pressure", color: "var(--primary)" },
            }}
            className="mx-auto h-[255px] w-full max-w-[440px]"
          >
            <RadarChart data={cardPressure} outerRadius="68%">
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [Number(value) + "%", "Pressure"]}
                  />
                }
              />
              <Radar
                name="Pressure"
                dataKey="value"
                stroke="var(--color-pressure)"
                fill="var(--color-pressure)"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ChartContainer>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span>Higher values indicate increased operational pressure.</span>
            <span>Capacity: 92%</span>
          </div>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <SectionTitle
              icon={Users}
              title="Top players"
              description="Highest payment volume recorded today"
            />
            <a href="/dashboard/players" className="shrink-0 pt-1 text-xs font-medium hover:underline">
              View players
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[minmax(0,1fr)_72px_100px] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground sm:grid-cols-[minmax(0,1fr)_110px_140px]">
            <span>Player</span>
            <span className="text-right">Tx today</span>
            <span className="text-right">Payment volume</span>
          </div>
          <div>
            {topPlayers.map((player, index) => (
              <div
                key={player.id}
                className="grid grid-cols-[minmax(0,1fr)_72px_100px] items-center gap-3 border-b py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_110px_140px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{player.id}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Last activity · {player.lastActivity}</p>
                  </div>
                </div>
                <span className="text-right text-sm tabular-nums">{player.transactions}</span>
                <span className="text-right text-sm font-medium tabular-nums">{money(player.volume)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function QueueCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <Badge variant="outline" className="tabular-nums">{value}</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function SupervisorDashboard() {
  return (
    <DashboardShell
      eyebrow="Supervisor"
      title="Operations control"
      description="Monitor queues, agent workload, service levels, and exceptions before they impact settlement or customer experience."
    >
      <StatGrid
        items={[
          { label: "Pending cases", value: "39", note: "12 high priority", icon: Clock3 },
          { label: "Active agents", value: "12/14", note: "2 offline", icon: UserCheck },
          { label: "SLA today", value: "96.4%", note: "+1.8% vs yesterday", icon: Zap },
          { label: "Exceptions", value: "7", note: "3 require escalation", icon: AlertTriangle },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={Users}
              title="Agent workload"
              description="Current assigned work by agent"
              action="Manage"
            />
          </CardHeader>
          <CardContent className="space-y-0">
            <HealthRow name="Yassine Kallel" detail="8 assigned · 2 due within 15 min" value="92%" status="healthy" />
            <HealthRow name="Sami Ben Amor" detail="7 assigned · 1 overdue" value="84%" status="attention" />
            <HealthRow name="Noura Gharbi" detail="5 assigned · no overdue items" value="98%" status="healthy" />
            <HealthRow name="Rim Jaziri" detail="9 assigned · 3 need review" value="72%" status="critical" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={AlertTriangle}
              title="Exceptions"
              description="Issues that need supervisor action"
            />
          </CardHeader>
          <CardContent className="space-y-0">
            <HealthRow name="High-value withdrawal" detail="$18,450 · waiting for verification" value="18 min" status="attention" />
            <HealthRow name="Deposit provider timeout" detail="7 attempts affected · provider B" value="Open" status="critical" />
            <HealthRow name="Player identity review" detail="Manual review requested by compliance" value="New" status="attention" />
            <HealthRow name="Reconciliation mismatch" detail="Batch #RCN-1042 · 2 records" value="Review" status="critical" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <SectionTitle
            icon={Activity}
            title="Live operations"
            description="Recent events across your team's queues"
          />
        </CardHeader>
        <CardContent className="space-y-0">
          <EventRow time="10:41" title="Withdrawal queue cleared" detail="3 cases completed by Yassine Kallel" />
          <EventRow time="10:37" title="Escalation created" detail="High-value withdrawal moved to manual verification" />
          <EventRow time="10:31" title="SLA recovered" detail="Deposit queue returned below 10-minute wait time" />
          <EventRow time="10:24" title="Agent signed in" detail="Noura Gharbi started the morning operations shift" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function AgentDashboard() {
  return (
    <DashboardShell
      eyebrow="Agent"
      title="My operations queue"
      description="Focus on the payment cases assigned to you, keep SLA healthy, and resolve customer-impacting work quickly."
    >
      <StatGrid
        items={[
          { label: "My queue", value: "8", note: "2 high priority", icon: Clock3 },
          { label: "Due today", value: "5", note: "Next due in 8 min", icon: Zap },
          { label: "Completed", value: "34", note: "Today", icon: CheckCircle2 },
          { label: "SLA", value: "97.2%", note: "Above team target", icon: ShieldCheck },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={WalletCards}
              title="Assigned cases"
              description="Your highest-priority work first"
              action="Open queue"
            />
          </CardHeader>
          <CardContent className="space-y-0">
            <CaseRow id="WD-88421" type="Withdrawal" player="PLR-48291021" amount="$4,820" priority="High" age="8 min" />
            <CaseRow id="DP-77102" type="Deposit" player="PLR-29011458" amount="$1,240" priority="Normal" age="12 min" />
            <CaseRow id="WD-88405" type="Withdrawal" player="PLR-61592013" amount="$780" priority="Normal" age="16 min" />
            <CaseRow id="DP-77088" type="Deposit" player="PLR-99184720" amount="$430" priority="Normal" age="19 min" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={Zap}
              title="Quick actions"
              description="Common actions for your shift"
            />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="justify-start" variant="outline"><CreditCard /> Review next transaction</Button>
            <Button className="justify-start" variant="outline"><UserCheck /> Verify a player</Button>
            <Button className="justify-start" variant="outline"><MessageIcon /> Add internal note</Button>
            <Button className="justify-start" variant="outline"><LifeBuoy /> Ask supervisor</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <SectionTitle
            icon={Activity}
            title="My activity"
            description="Recent work completed from this account"
          />
        </CardHeader>
        <CardContent className="space-y-0">
          <EventRow time="10:42" title="Withdrawal approved" detail="WD-88402 · $640 · player PLR-18324011" />
          <EventRow time="10:29" title="Deposit verified" detail="DP-77061 · $920 · player PLR-70281344" />
          <EventRow time="10:11" title="Player note added" detail="PLR-48291021 · verification requested from compliance" />
          <EventRow time="09:54" title="Case escalated" detail="DP-77042 · provider reference mismatch" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function MessageIcon() {
  return <Activity className="size-4" />;
}

function CaseRow({
  id,
  type,
  player,
  amount,
  priority,
  age,
}: {
  id: string;
  type: string;
  player: string;
  amount: string;
  priority: string;
  age: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {type === "Deposit" ? <ArrowDownToLine className="size-4" /> : <ArrowUpFromLine className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{id}</p>
          <Badge variant={priority === "High" ? "destructive" : "secondary"} className="px-1.5 py-0 text-[10px]">
            {priority}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{player} · {age} ago</p>
      </div>
      <p className="shrink-0 text-sm font-medium tabular-nums">{amount}</p>
    </div>
  );
}

function AssistantDashboard() {
  return (
    <DashboardShell
      eyebrow="Assistant"
      title="Assistant workbench"
      description="Keep follow-ups, administrative requests, and lightweight operations organized for the wider payment team."
    >
      <StatGrid
        items={[
          { label: "Tasks due", value: "11", note: "3 due within 1 hour", icon: Clock3 },
          { label: "Follow-ups", value: "7", note: "2 waiting on replies", icon: Activity },
          { label: "Completed", value: "23", note: "Today", icon: CheckCircle2 },
          { label: "Messages", value: "14", note: "4 unread", icon: LifeBuoy },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={Clock3}
              title="Today's tasks"
              description="Administrative work prioritized by urgency"
              action="View all"
            />
          </CardHeader>
          <CardContent className="space-y-0">
            <TaskRow title="Prepare daily settlement summary" detail="Finance · due 11:00" status="Due soon" />
            <TaskRow title="Follow up on 3 unmatched deposits" detail="Operations · assigned 18 min ago" status="Open" />
            <TaskRow title="Send distributor reconciliation note" detail="Atlas Payments · due 13:30" status="Open" />
            <TaskRow title="Archive completed player reviews" detail="Compliance · 6 records" status="Ready" />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={ShieldCheck}
              title="Support signals"
              description="Things to keep visible for the team"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <QueueCard label="Unread operational messages" value="4" note="2 from supervisors" />
            <QueueCard label="Missing attachments" value="3" note="Across 2 records" />
            <QueueCard label="Pending approvals" value="2" note="Awaiting account owner" />
            <QueueCard label="Open admin requests" value="5" note="1 older than 24h" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <SectionTitle
            icon={Activity}
            title="Recent updates"
            description="Latest actions from your workbench"
          />
        </CardHeader>
        <CardContent className="space-y-0">
          <EventRow time="10:39" title="Settlement file prepared" detail="September settlement summary exported for finance review" />
          <EventRow time="10:24" title="Distributor follow-up sent" detail="Northline Network · reconciliation note delivered" />
          <EventRow time="09:58" title="Player review archived" detail="6 completed checks moved to archive" />
          <EventRow time="09:42" title="Supervisor message received" detail="New instruction added to the morning queue" />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function TaskRow({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b py-3 last:border-0">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <CheckCircle2 className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={status === "Due soon" ? "outline" : "secondary"} className="shrink-0 px-1.5 py-0 text-[10px]">
        {status}
      </Badge>
    </div>
  );
}

function EventRow({ time, title, detail }: { time: string; title: string; detail: string }) {
  return (
    <div className="flex gap-3 border-b py-3 last:border-0">
      <span className="w-12 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-muted-foreground">{time}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

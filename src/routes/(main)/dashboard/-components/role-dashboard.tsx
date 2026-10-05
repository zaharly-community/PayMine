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
  LifeBuoy,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Link } from "@tanstack/react-router";

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

const ownerVolume = [
  { label: "Apr", volume: 410000 },
  { label: "May", volume: 470000 },
  { label: "Jun", volume: 530000 },
  { label: "Jul", volume: 590000 },
  { label: "Aug", volume: 620000 },
  { label: "Sep", volume: 710000 },
];

const brandVolume = [
  { label: "Apr", deposits: 195000, withdrawals: 74000 },
  { label: "May", deposits: 224000, withdrawals: 82000 },
  { label: "Jun", deposits: 248000, withdrawals: 97000 },
  { label: "Jul", deposits: 272000, withdrawals: 105000 },
  { label: "Aug", deposits: 301000, withdrawals: 118000 },
  { label: "Sep", deposits: 326000, withdrawals: 126000 },
];

const chartConfig = {
  volume: { label: "Volume", color: "var(--foreground)" },
  deposits: { label: "Deposits", color: "var(--foreground)" },
  withdrawals: { label: "Withdrawals", color: "var(--muted-foreground)" },
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
                <YAxis axisLine={false} tickLine={false} width={48} tickFormatter={(value) => "$" + Math.round(Number(value) / 1000) + "k"} />
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
            <Link to="/dashboard/reports" className="text-xs font-medium hover:underline">Open Reports</Link>
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

function DashboardLink({ title, detail, to }: { title: string; detail: string; to: "/dashboard/reports" }) {
  return (
    <Link to={to} className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </Link>
  );
}

function BrandAdminDashboard() {
  const { activeBrand } = useBrand();

  return (
    <DashboardShell
      eyebrow="Brand Admin"
      title={activeBrand.name + " overview"}
      description="Manage your brand's payment activity, players, distributors, finance, and operational exceptions from one place."
    >
      <StatGrid
        items={[
          { label: "Players", value: "14,286", note: "12,904 active", icon: Users },
          { label: "Deposits", value: "$326K", note: "97.1% successful", icon: ArrowDownToLine },
          { label: "Withdrawals", value: "$126K", note: "94.2% successful", icon: ArrowUpFromLine },
          { label: "Net movement", value: "$200K", note: "Last 24 hours", icon: WalletCards },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)]">
        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={BarChart3}
              title="Payment activity"
              description="Deposits and withdrawals over the last six months"
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={brandVolume} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={46}
                  tickFormatter={(value) => "$" + Math.round(Number(value) / 1000) + "k"}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => ["$" + Number(value).toLocaleString(), name === "deposits" ? "Deposits" : "Withdrawals"]}
                    />
                  }
                />
                <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <SectionTitle
              icon={Clock3}
              title="Payment queue"
              description="Work items that need attention"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <QueueCard label="Pending deposits" value="28" note="Oldest 18 min" />
            <QueueCard label="Pending withdrawals" value="11" note="Oldest 27 min" />
            <QueueCard label="Unmatched transactions" value="4" note="2 need review" />
            <QueueCard label="Open disagreements" value="3" note="1 high priority" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <SectionTitle
            icon={Users}
            title="Top distributors"
            description="Highest active payment volume for this brand"
            action="View all"
          />
        </CardHeader>
        <CardContent className="space-y-0">
          <HealthRow name="Atlas Payments" detail="312 players · 128 transactions today" value="$82K" status="healthy" />
          <HealthRow name="Northline Network" detail="286 players · 117 transactions today" value="$64K" status="healthy" />
          <HealthRow name="Delta Commerce" detail="191 players · 74 transactions today" value="$41K" status="attention" />
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

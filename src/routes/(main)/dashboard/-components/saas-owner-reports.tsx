import type { ComponentType } from "react";

import {
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Layers3,
  LineChart,
  PieChart as PieChartIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const revenueTrend = [
  { month: "Apr", commission: 18200, subscriptions: 16400 },
  { month: "May", commission: 19800, subscriptions: 17100 },
  { month: "Jun", commission: 22100, subscriptions: 18400 },
  { month: "Jul", commission: 24700, subscriptions: 19300 },
  { month: "Aug", commission: 26800, subscriptions: 21100 },
  { month: "Sep", commission: 29400, subscriptions: 22600 },
];

const userGrowth = [
  { month: "Apr", users: 8420, active: 6840 },
  { month: "May", users: 8910, active: 7220 },
  { month: "Jun", users: 9360, active: 7580 },
  { month: "Jul", users: 10040, active: 8140 },
  { month: "Aug", users: 10880, active: 8790 },
  { month: "Sep", users: 11640, active: 9420 },
];

const packageMix = [
  { name: "Starter", value: 34 },
  { name: "Growth", value: 46 },
  { name: "Scale", value: 20 },
];

const packagePerformance = [
  ["Growth", "46%", "$72.4K", "+14.2%"],
  ["Scale", "20%", "$61.8K", "+21.8%"],
  ["Starter", "34%", "$28.6K", "+6.4%"],
] as const;

const reportCards = [
  {
    title: "Commission & revenue",
    description: "Platform commission, subscription revenue, take rate, and revenue trend.",
    metric: "$226.0K",
    note: "Total platform revenue · 12 months",
    icon: CircleDollarSign,
  },
  {
    title: "User growth",
    description: "New users, activated users, retention, and account growth by period.",
    metric: "11.6K",
    note: "Registered users",
    icon: Users,
  },
  {
    title: "Subscriptions",
    description: "MRR, ARR, upgrades, cancellations, and net subscription movement.",
    metric: "$22.6K",
    note: "Current monthly recurring revenue",
    icon: CreditCard,
  },
  {
    title: "Package performance",
    description: "Package adoption, average revenue per account, and plan contribution.",
    metric: "46%",
    note: "Growth plan share",
    icon: Layers3,
  },
  {
    title: "Transaction economics",
    description: "Platform volume, average ticket, fee yield, and commission efficiency.",
    metric: "$3.84M",
    note: "Monthly platform volume",
    icon: BarChart3,
  },
  {
    title: "Retention & churn",
    description: "Cohort retention, churn, reactivation, and subscription health.",
    metric: "96.8%",
    note: "Gross logo retention",
    icon: LineChart,
  },
  {
    title: "Risk & platform health",
    description: "Operational exceptions, settlement exposure, and control health.",
    metric: "82%",
    note: "Platform controls healthy",
    icon: ShieldCheck,
  },
];

const revenueConfig = {
  commission: { label: "Commission", color: "var(--foreground)" },
  subscriptions: { label: "Subscriptions", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const userConfig = {
  users: { label: "Users", color: "var(--foreground)" },
  active: { label: "Active", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function SaasOwnerReports() {
  return (
    <section className="space-y-6" data-content-padding="false">
      <div className="border-b px-5 pb-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
        <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports & analytics</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Deeper platform intelligence across users, subscriptions, commission, packages, transaction economics, retention, and risk.
            </p>
          </div>
          <div className="flex gap-1 rounded-lg border p-1">
            {["30 days", "90 days", "12 months"].map((period, index) => (
              <button
                key={period}
                type="button"
                className={"rounded-md px-2.5 py-1.5 text-xs font-medium " + (index === 2 ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStat label="Platform commission" value="$184.7K" note="+12.8% vs prior period" icon={CircleDollarSign} />
        <ReportStat label="MRR" value="$22.6K" note="+8.4% month over month" icon={CreditCard} />
        <ReportStat label="Active users" value="9,420" note="81.0% of registered users" icon={Users} />
        <ReportStat label="Net churn" value="1.8%" note="Down 0.6 pts" icon={LineChart} />
      </div>

      <div className="grid gap-6 px-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.65fr)]">
        <Card className="shadow-none">
          <CardHeader>
            <ReportHeading icon={CircleDollarSign} title="Revenue mix" description="Commission and subscription revenue over the last six months" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[290px] w-full">
              <BarChart data={revenueTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={48} tickFormatter={(value) => "$" + Math.round(Number(value) / 1000) + "k"} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => "$" + Number(value).toLocaleString()} />} />
                <Bar dataKey="commission" fill="var(--color-commission)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="subscriptions" fill="var(--color-subscriptions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <ReportHeading icon={PieChartIcon} title="Package mix" description="Active subscriptions by package" />
          </CardHeader>
          <CardContent>
            <div className="mx-auto h-[210px] max-w-[240px]">
              <ChartContainer config={revenueConfig} className="h-full w-full">
                <PieChart>
                  <Pie data={packageMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88}>
                    {packageMix.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? "var(--foreground)" : "var(--muted-foreground)"} opacity={1 - index * 0.18} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {packageMix.map((item) => (
                <div key={item.name}>
                  <p className="text-sm font-semibold">{item.value}%</p>
                  <p className="text-[11px] text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 px-5 xl:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <ReportHeading icon={Users} title="User growth & activation" description="Registered accounts versus active users" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={userConfig} className="h-[250px] w-full">
              <RechartsLineChart data={userGrowth} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="active" stroke="var(--color-active)" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <ReportHeading icon={Layers3} title="Package performance" description="Subscription share and platform revenue contribution" />
          </CardHeader>
          <CardContent className="space-y-0">
            {packagePerformance.map(([plan, share, revenue, growth]) => (
              <div key={plan} className="flex items-center gap-3 border-b py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{plan}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{share} of active subscriptions</p>
                </div>
                <p className="text-sm font-medium tabular-nums">{revenue}</p>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{growth}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 px-5 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <ReportCard key={report.title} {...report} />
        ))}
      </div>
    </section>
  );
}

function ReportStat({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function ReportHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  description,
  metric,
  note,
  icon: Icon,
}: {
  title: string;
  description: string;
  metric: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
            <p className="mt-4 text-lg font-semibold tabular-nums">{metric}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

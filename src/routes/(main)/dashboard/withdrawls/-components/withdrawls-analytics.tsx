import { useState } from "react";
import type { ReactNode } from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Download,
  Ellipsis,
  Percent,
  RefreshCw,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const rangeItems = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
] as const;

const volumeData = [
  { day: "Sep 16", deposits: 84, withdrawls: 51 },
  { day: "Sep 17", deposits: 96, withdrawls: 58 },
  { day: "Sep 18", deposits: 91, withdrawls: 63 },
  { day: "Sep 19", deposits: 108, withdrawls: 67 },
  { day: "Sep 20", deposits: 116, withdrawls: 74 },
  { day: "Sep 21", deposits: 123, withdrawls: 82 },
  { day: "Sep 22", deposits: 131, withdrawls: 89 },
];

const transactionData = [
  { month: "Apr", deposits: 16.4, withdrawls: 9.1 },
  { month: "May", deposits: 18.2, withdrawls: 10.7 },
  { month: "Jun", deposits: 21.1, withdrawls: 12.4 },
  { month: "Jul", deposits: 22.8, withdrawls: 13.7 },
  { month: "Aug", deposits: 24.2, withdrawls: 14.6 },
  { month: "Sep", deposits: 26.1, withdrawls: 16.2 },
];

const methodData = [
  { method: "Flouci", amount: 34, fill: "var(--color-flouci)" },
  { method: "D17", amount: 27, fill: "var(--color-d17)" },
  { method: "KashY", amount: 21, fill: "var(--color-kashy)" },
  { method: "Bank transfer", amount: 18, fill: "var(--color-bank)" },
];

const withdrawalStatus = [
  { status: "Completed", amount: 71 },
  { status: "Pending", amount: 18 },
  { status: "Waiting correction", amount: 7 },
  { status: "Failed", amount: 4 },
];

const playerActivity = [
  { day: "Mon", active: 1824, newPlayers: 214 },
  { day: "Tue", active: 1912, newPlayers: 238 },
  { day: "Wed", active: 2038, newPlayers: 261 },
  { day: "Thu", active: 1984, newPlayers: 247 },
  { day: "Fri", active: 2198, newPlayers: 288 },
  { day: "Sat", active: 2316, newPlayers: 301 },
  { day: "Sun", active: 2244, newPlayers: 276 },
];

const distributorData = [
  { name: "Maya L.", volume: 18.4, commission: 3680, transactions: 1284 },
  { name: "Noah K.", volume: 16.7, commission: 3340, transactions: 1158 },
  { name: "Liam R.", volume: 14.9, commission: 2980, transactions: 1082 },
  { name: "Ava B.", volume: 12.6, commission: 2520, transactions: 964 },
  { name: "Olivia S.", volume: 11.8, commission: 2360, transactions: 911 },
];

const revenueOverTime = [
  { day: "Sep 16", revenue: 412000 },
  { day: "Sep 17", revenue: 438000 },
  { day: "Sep 18", revenue: 429000 },
  { day: "Sep 19", revenue: 486000 },
  { day: "Sep 20", revenue: 518000 },
  { day: "Sep 21", revenue: 552000 },
  { day: "Sep 22", revenue: 601000 },
];

const customersByCountry = [
  { country: "Tanzania", customers: 6420 },
  { country: "Kenya", customers: 4580 },
  { country: "Uganda", customers: 3210 },
  { country: "Rwanda", customers: 1940 },
  { country: "Zambia", customers: 1330 },
];

const checkoutFunnel = [
  { step: "Checkout opened", value: 12480, rate: 100 },
  { step: "Method selected", value: 10840, rate: 86.9 },
  { step: "Details submitted", value: 9420, rate: 75.5 },
  { step: "Payment initiated", value: 8610, rate: 69.0 },
  { step: "Payment completed", value: 7820, rate: 62.7 },
];

const paymentChannels = [
  { channel: "Mobile Money", volume: 46, fill: "var(--color-flouci)" },
  { channel: "Bank Transfer", volume: 24, fill: "var(--color-d17)" },
  { channel: "Cards", volume: 18, fill: "var(--color-kashy)" },
  { channel: "Voucher", volume: 12, fill: "var(--color-bank)" },
];

const providerData = [
  { provider: "Flouci", successRate: 98.4, latency: 1.8, volume: 34.2, failures: 1.6 },
  { provider: "D17", successRate: 97.8, latency: 2.1, volume: 27.8, failures: 2.2 },
  { provider: "KashY", successRate: 96.9, latency: 2.6, volume: 21.4, failures: 3.1 },
  { provider: "Bank transfer", successRate: 94.8, latency: 3.4, volume: 16.6, failures: 5.2 },
];

const volumeChartConfig = {
  deposits: { label: "Deposits", color: "var(--chart-2)" },
  withdrawls: { label: "Withdrawls", color: "var(--chart-3)" },
} satisfies ChartConfig;

const transactionChartConfig = {
  deposits: { label: "Deposits", color: "var(--chart-2)" },
  withdrawls: { label: "Withdrawls", color: "var(--chart-4)" },
} satisfies ChartConfig;

const methodChartConfig = {
  flouci: { label: "Flouci", color: "var(--chart-1)" },
  d17: { label: "D17", color: "var(--chart-2)" },
  kashy: { label: "KashY", color: "var(--chart-3)" },
  bank: { label: "Bank transfer", color: "var(--chart-4)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const countryChartConfig = {
  customers: { label: "Customers", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelChartConfig = {
  volume: { label: "Share", color: "var(--chart-3)" },
} satisfies ChartConfig;

const playerChartConfig = {
  active: { label: "Active players", color: "var(--chart-2)" },
  newPlayers: { label: "New players", color: "var(--chart-3)" },
} satisfies ChartConfig;

function TrendBadge({ value, positive = true }: { value: string; positive?: boolean }) {
  return (
    <Badge
      className={
        positive
          ? "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300"
          : "bg-destructive/10 text-destructive"
      }
    >
      {positive ? <ArrowUpRight /> : <ArrowDownRight />}
      {value}
    </Badge>
  );
}

function MetricCard({
  title,
  value,
  detail,
  trend,
  positive = true,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  trend: string;
  positive?: boolean;
  icon: typeof Activity;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-sm">{title}</CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl leading-none tracking-tight">{value}</div>
          <TrendBadge value={trend} positive={positive} />
        </div>
        <div className="text-muted-foreground text-xs">{detail}</div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  children,
  action = true,
}: {
  title: string;
  children: ReactNode;
  action?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal">{title}</CardTitle>
        {action ? (
          <CardAction>
            <Button variant="ghost" size="icon" className="size-7">
              <Ellipsis className="size-4" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}


const activityStart = new Date("2025-10-01T00:00:00.000Z");
const activityEnd = new Date("2026-09-22T00:00:00.000Z");

const dailyFlowActivity = Array.from(
  { length: Math.round((activityEnd.getTime() - activityStart.getTime()) / 86400000) + 1 },
  (_, index) => {
    const date = new Date(activityStart.getTime() + index * 86400000);
    const phase = index % 11;
    const base = 28 + (index % 9) * 4;

    const deposits =
      base +
      [18, 8, 27, 5, 21, 12, 31, 15, 4, 24, 10][phase] +
      Math.round(Math.sin(index / 5) * 9);
    const withdrawls =
      base +
      [7, 20, 12, 25, 10, 18, 29, 6, 23, 14, 19][phase] +
      Math.round(Math.cos(index / 7) * 7);

    return {
      date,
      deposits: Math.max(8, deposits),
      withdrawls: Math.max(8, withdrawls),
    };
  },
);

function getFlowTone(deposits: number, withdrawls: number) {
  const difference = Math.abs(deposits - withdrawls);
  const larger = Math.max(deposits, withdrawls);
  const relativeGap = larger === 0 ? 0 : difference / larger;

  if (relativeGap <= 0.12) {
    return deposits >= withdrawls ? "bg-emerald-500/20" : "bg-red-500/20";
  }

  return deposits > withdrawls ? "bg-emerald-500/70" : "bg-red-500/70";
}

function formatActivityDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getMonthMarkers() {
  const markers: Array<{ label: string; index: number }> = [];
  let currentMonth = -1;

  dailyFlowActivity.forEach((item, index) => {
    const month = item.date.getUTCMonth();

    if (month !== currentMonth) {
      markers.push({
        label: item.date.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
        index,
      });
      currentMonth = month;
    }
  });

  return markers;
}

const activityMonthMarkers = getMonthMarkers();

function DailyFlowActivity() {
  const firstDayOffset = (activityStart.getUTCDay() + 6) % 7;
  const paddedActivity = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...dailyFlowActivity,
  ];
  const weeks = Math.ceil(paddedActivity.length / 7);
  const grid = Array.from({ length: weeks * 7 }, (_, index) => paddedActivity[index] ?? null);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-normal">Daily Flow Activity</CardTitle>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Deposits vs. withdrawls</span> by day
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Withdrawls higher</span>
            <span className="inline-block size-3 rounded-sm bg-red-500/70" />
            <span className="inline-block size-3 rounded-sm bg-red-500/20" />
            <span className="inline-block size-3 rounded-sm bg-emerald-500/20" />
            <span className="inline-block size-3 rounded-sm bg-emerald-500/70" />
            <span>Deposits higher</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[760px]">
            <div className="relative ml-8 h-5 text-[10px] text-muted-foreground">
              {activityMonthMarkers.map((marker) => (
                <span
                  key={marker.label + marker.index}
                  className="absolute"
                  style={{
                    left: `${(marker.index / dailyFlowActivity.length) * 100}%`,
                  }}
                >
                  {marker.label}
                </span>
              ))}
            </div>

            <div
              className="grid grid-flow-col grid-rows-7 gap-1"
              style={{
                gridTemplateColumns: `repeat(${weeks}, minmax(11px, 1fr))`,
              }}
            >
              {grid.map((item, index) => {
                if (!item) {
                  return <span key={index} className="size-3.5 sm:size-4" aria-hidden="true" />;
                }

                return (
                  <span
                    key={item.date.toISOString()}
                    className={`size-3.5 rounded-[3px] sm:size-4 ${getFlowTone(item.deposits, item.withdrawls)} transition-colors hover:ring-1 hover:ring-foreground/30`}
                    title={`${formatActivityDate(item.date)} — Deposits: ${item.deposits}k · Withdrawls: ${item.withdrawls}k`}
                    aria-label={`${formatActivityDate(item.date)}. Deposits ${item.deposits} thousand. Withdrawls ${item.withdrawls} thousand.`}
                  />
                );
              })}
            </div>

            <div className="mt-2 grid grid-cols-7 text-[10px] text-muted-foreground">
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
              <span>Sun</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformOverview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Gross volume" value="$148.6k" detail="All deposits and withdrawls" trend="8.4%" icon={WalletCards} />
        <MetricCard title="Deposit volume" value="$96.4k" detail="4,821 successful deposits" trend="10.8%" icon={ArrowDownRight} />
        <MetricCard title="Withdrawl volume" value="$52.2k" detail="2,184 processed payouts" trend="6.1%" icon={ArrowUpRight} />
        <MetricCard title="Net flow" value="$44.2k" detail="Deposits minus withdrawls" trend="12.4%" icon={BarChart3} />
        <MetricCard title="Success rate" value="97.8%" detail="Across all payment methods" trend="1.2%" icon={Percent} />
        <MetricCard title="Active players" value="18,462" detail="Players transacting this period" trend="4.7%" icon={Users} />
      </div>

      <DailyFlowActivity />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="Revenue over time (TZS)">
            <ChartContainer config={revenueChartConfig} className="h-72 w-full">
              <AreaChart data={revenueOverTime} margin={{ left: 4, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  width={64}
                  tickFormatter={(value) => {
                    const numeric = Number(value);
                    return numeric >= 1000000
                      ? numeric / 1000000 + "M"
                      : Math.round(numeric / 1000) + "K";
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => Number(value).toLocaleString() + " TZS"}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="var(--color-revenue)"
                  fillOpacity={0.14}
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>
          </SectionCard>
        </div>

        <div className="xl:col-span-5">
          <SectionCard title="Customers by Country">
            <ChartContainer config={countryChartConfig} className="h-72 w-full">
              <BarChart
                data={customersByCountry}
                layout="vertical"
                margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis
                  type="category"
                  dataKey="country"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={78}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="customers"
                  fill="var(--color-customers)"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ChartContainer>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="Checkout Funnel">
            <div className="space-y-4">
              {checkoutFunnel.map((item, index) => {
                const width = Math.max(26, item.rate);
                return (
                  <div key={item.step} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>{index + 1}. {item.step}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {item.value.toLocaleString()} · {item.rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: width + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-5">
          <SectionCard title="Payment Channels">
            <ChartContainer config={channelChartConfig} className="h-72 w-full">
              <BarChart data={paymentChannels} margin={{ left: 4, right: 8, top: 12, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="channel" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  width={40}
                  tickFormatter={(value) => value + "%"}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => value + "%"}
                    />
                  }
                />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]}>
                  {paymentChannels.map((item) => (
                    <Cell key={item.channel} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="Platform volume">
            <ChartContainer config={volumeChartConfig} className="h-72 w-full">
              <AreaChart data={volumeData} margin={{ left: 4, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => "$" + value + "k"}
                  width={48}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="deposits"
                  type="monotone"
                  fill="var(--color-deposits)"
                  fillOpacity={0.12}
                  stroke="var(--color-deposits)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="withdrawls"
                  type="monotone"
                  fill="var(--color-withdrawls)"
                  fillOpacity={0.08}
                  stroke="var(--color-withdrawls)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </SectionCard>
        </div>

        <div className="xl:col-span-5">
          <SectionCard title="Payment methods">
            <ChartContainer config={methodChartConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={methodData}
                  dataKey="amount"
                  nameKey="method"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={2}
                >
                  {methodData.map((item) => (
                    <Cell key={item.method} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {methodData.map((item) => (
                <div key={item.method} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.method}</span>
                  </div>
                  <span className="font-medium tabular-nums">{item.amount}%</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SectionCard title="Monthly transaction value">
            <ChartContainer config={transactionChartConfig} className="h-72 w-full">
              <BarChart data={transactionData} margin={{ left: 4, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => "$" + value + "m"}
                  width={48}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawls" fill="var(--color-withdrawls)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </SectionCard>
        </div>

        <div className="xl:col-span-5">
          <SectionCard title="Withdrawal status mix">
            <div className="space-y-4">
              {withdrawalStatus.map((item) => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.status}</span>
                    <span className="tabular-nums text-muted-foreground">{item.amount}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: item.amount + "%" }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function DepositsAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Deposit volume" value="$96.4k" detail="Successful deposits" trend="10.8%" icon={ArrowDownRight} />
        <MetricCard title="Transactions" value="4,821" detail="Successful this period" trend="7.6%" icon={Activity} />
        <MetricCard title="Avg. deposit" value="$19.99" detail="Average transaction value" trend="2.3%" icon={CreditCard} />
        <MetricCard title="Deposit success" value="98.6%" detail="Across all deposit methods" trend="0.7%" icon={Percent} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SectionCard title="Deposit volume by day">
            <ChartContainer config={volumeChartConfig} className="h-72 w-full">
              <LineChart data={volumeData} margin={{ left: 4, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="deposits" type="monotone" dot={false} stroke="var(--color-deposits)" strokeWidth={2.5} />
              </LineChart>
            </ChartContainer>
          </SectionCard>
        </div>
        <div className="xl:col-span-4">
          <SectionCard title="Deposit mix">
            <div className="space-y-4">
              {methodData.map((item) => (
                <div key={item.method} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    {item.method}
                  </div>
                  <div className="font-medium tabular-nums">{item.amount}%</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function WithdrawlsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Withdrawl volume" value="$52.2k" detail="Processed payouts" trend="6.1%" icon={ArrowUpRight} />
        <MetricCard title="Transactions" value="2,184" detail="Withdrawal requests" trend="5.2%" icon={Activity} />
        <MetricCard title="Avg. payout" value="$23.90" detail="Average withdrawl value" trend="1.8%" icon={CreditCard} />
        <MetricCard title="Completion rate" value="95.4%" detail="Completed without correction" trend="0.9%" icon={Percent} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SectionCard title="Withdrawl volume trend">
            <ChartContainer config={volumeChartConfig} className="h-72 w-full">
              <AreaChart data={volumeData} margin={{ left: 4, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => "$" + value + "k"}
                  width={48}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="withdrawls"
                  type="monotone"
                  fill="var(--color-withdrawls)"
                  fillOpacity={0.12}
                  stroke="var(--color-withdrawls)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </SectionCard>
        </div>
        <div className="xl:col-span-4">
          <SectionCard title="Processing mix">
            <div className="space-y-4">
              {withdrawalStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{item.status}</span>
                  <Badge variant="outline">{item.amount}%</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function PlayersAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active players" value="18,462" detail="Transacting players" trend="4.7%" icon={Users} />
        <MetricCard title="New players" value="1,825" detail="Joined this period" trend="8.6%" icon={Users} />
        <MetricCard title="Avg. deposit / player" value="$142.30" detail="Across active players" trend="3.4%" icon={CreditCard} />
        <MetricCard title="Repeat rate" value="72.6%" detail="Players returning to transact" trend="1.1%" icon={Percent} />
      </div>

      <SectionCard title="Player activity">
        <ChartContainer config={playerChartConfig} className="h-80 w-full">
          <LineChart data={playerActivity} margin={{ left: 4, right: 8, top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="active" type="monotone" dot={false} stroke="var(--color-active)" strokeWidth={2.5} />
            <Line dataKey="newPlayers" type="monotone" dot={false} stroke="var(--color-newPlayers)" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </SectionCard>
    </div>
  );
}

function DistributorsAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active distributors" value="42" detail="Generating platform volume" trend="4.9%" icon={Users} />
        <MetricCard title="Distributor volume" value="$74.4k" detail="Attributed transaction value" trend="9.2%" icon={WalletCards} />
        <MetricCard title="Commission paid" value="$14.9k" detail="Fees generated this period" trend="5.8%" icon={CreditCard} />
        <MetricCard title="Avg. monthly volume" value="$1.77k" detail="Per active distributor" trend="3.1%" icon={BarChart3} />
      </div>

      <SectionCard title="Top distributors by volume" action={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3 text-left font-medium">Distributor</th>
                <th className="pb-3 text-right font-medium">Volume</th>
                <th className="pb-3 text-right font-medium">Commission</th>
                <th className="pb-3 text-right font-medium">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {distributorData.map((item) => (
                <tr key={item.name} className="border-b last:border-0">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-right tabular-nums">{"$"}{item.volume.toFixed(1)}k</td>
                  <td className="py-3 text-right tabular-nums">{"$"}{item.commission.toLocaleString()}</td>
                  <td className="py-3 text-right tabular-nums">{item.transactions.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function ProvidersAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Provider success" value="97.8%" detail="Weighted across providers" trend="1.2%" icon={Percent} />
        <MetricCard title="Avg. latency" value="2.4s" detail="Payment confirmation" trend="8.2%" positive={false} icon={Activity} />
        <MetricCard title="Provider volume" value="$148.6k" detail="All routed transactions" trend="8.4%" icon={WalletCards} />
        <MetricCard title="Failure rate" value="2.2%" detail="All provider failures" trend="0.4%" positive={false} icon={RefreshCw} />
      </div>

      <SectionCard title="Provider performance" action={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3 text-left font-medium">Provider</th>
                <th className="pb-3 text-right font-medium">Success rate</th>
                <th className="pb-3 text-right font-medium">Latency</th>
                <th className="pb-3 text-right font-medium">Volume</th>
                <th className="pb-3 text-right font-medium">Failure rate</th>
              </tr>
            </thead>
            <tbody>
              {providerData.map((item) => (
                <tr key={item.provider} className="border-b last:border-0">
                  <td className="py-3 font-medium">{item.provider}</td>
                  <td className="py-3 text-right tabular-nums">{item.successRate}%</td>
                  <td className="py-3 text-right tabular-nums">{item.latency.toFixed(1)}s</td>
                  <td className="py-3 text-right tabular-nums">{"$"}{item.volume.toFixed(1)}k</td>
                  <td className="py-3 text-right tabular-nums">{item.failures}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}


const analyticsTabs = [
  { value: "overview", label: "Overview" },
  { value: "deposits", label: "Deposits" },
  { value: "withdrawls", label: "Withdrawls" },
  { value: "players", label: "Players" },
  { value: "distributors", label: "Distributors" },
  { value: "providers", label: "Providers" },
] as const;

type AnalyticsTab = (typeof analyticsTabs)[number]["value"];

function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");

  return (
    <div className="-mx-4 -mb-4 flex flex-col gap-4 sm:-mx-6 sm:-mb-6">
      <nav className="border-b bg-background" aria-label="Analytics sections">
        <ul role="list" className="flex min-w-full items-center gap-6 overflow-x-auto px-4 sm:px-6">
          {analyticsTabs.map((tab) => {
            const active = activeTab === tab.value;

            return (
              <li key={tab.value} className="shrink-0">
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveTab(tab.value)}
                  className={
                    active
                      ? "inline-flex h-12 items-center border-b-2 border-foreground text-sm font-semibold text-foreground transition-colors"
                      : "inline-flex h-12 items-center border-b-2 border-transparent text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 sm:px-6">
        {activeTab === "overview" ? <PlatformOverview /> : null}
        {activeTab === "deposits" ? <DepositsAnalytics /> : null}
        {activeTab === "withdrawls" ? <WithdrawlsTab /> : null}
        {activeTab === "players" ? <PlayersAnalytics /> : null}
        {activeTab === "distributors" ? <DistributorsAnalytics /> : null}
        {activeTab === "providers" ? <ProvidersAnalytics /> : null}
      </div>
    </div>
  );
}

export function WithdrawlsAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Monitor the full payment platform across deposits, withdrawls, players, distributors, and providers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="30d" items={rangeItems}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rangeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw /> Refresh
          </Button>
        </div>
      </div>

      <AnalyticsTabs />
    </div>
  );
}

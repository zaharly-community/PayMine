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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <ChartContainer config={methodChartConfig} className="h-72 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={methodData}
                  dataKey="amount"
                  nameKey="method"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={2}
                >
                  {methodData.map((item) => (
                    <Cell key={item.method} fill={item.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="method" />} />
              </PieChart>
            </ChartContainer>
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

export function WithdrawlsAnalytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-[0.14em]">Withdrawls / Analytics</div>
          <h1 className="text-3xl tracking-tight">Platform Analytics</h1>
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

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawls">Withdrawls</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="distributors">Distributors</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <PlatformOverview />
        </TabsContent>
        <TabsContent value="deposits">
          <DepositsAnalytics />
        </TabsContent>
        <TabsContent value="withdrawls">
          <WithdrawlsTab />
        </TabsContent>
        <TabsContent value="players">
          <PlayersAnalytics />
        </TabsContent>
        <TabsContent value="distributors">
          <DistributorsAnalytics />
        </TabsContent>
        <TabsContent value="providers">
          <ProvidersAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

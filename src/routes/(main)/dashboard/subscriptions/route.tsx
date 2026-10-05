import type { ComponentType } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CreditCard, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const trend = [
  { month: "Apr", active: 1840, new: 164, cancelled: 72 },
  { month: "May", active: 1925, new: 181, cancelled: 68 },
  { month: "Jun", active: 2014, new: 205, cancelled: 64 },
  { month: "Jul", active: 2142, new: 226, cancelled: 61 },
  { month: "Aug", active: 2278, new: 248, cancelled: 58 },
  { month: "Sep", active: 2346, new: 262, cancelled: 55 },
];

const config = {
  active: { label: "Active subscriptions", color: "var(--foreground)" },
  new: { label: "New", color: "var(--muted-foreground)" },
  cancelled: { label: "Cancelled", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export const Route = createFileRoute("/(main)/dashboard/subscriptions" as any)({
  component: Page,
});

function Page() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor recurring revenue, package movement, renewals, upgrades, and churn.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active subscriptions" value="2,346" note="+3.0% this month" icon={CreditCard} />
        <Stat label="MRR" value="$22.6K" note="+8.4% this month" icon={ArrowUpRight} />
        <Stat label="New subscriptions" value="262" note="+5.6% this month" icon={Users} />
        <Stat label="Churned" value="55" note="-8.3% this month" icon={ArrowDownRight} />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div><h2 className="text-sm font-semibold">Subscription movement</h2><p className="mt-1 text-xs text-muted-foreground">Active, new, and cancelled subscriptions over six months.</p></div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[290px] w-full">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="active-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.16}/><stop offset="100%" stopColor="var(--foreground)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="active" stroke="var(--color-active)" fill="url(#active-fill)" strokeWidth={2} />
              <Area type="monotone" dataKey="new" stroke="var(--color-new)" fill="transparent" strokeWidth={1.5} />
              <Area type="monotone" dataKey="cancelled" stroke="var(--color-cancelled)" fill="transparent" strokeWidth={1.5} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ["Starter", "312", "$9.0K", "2.4%"],
          ["Growth", "1,204", "$95.1K", "1.6%"],
          ["Scale", "524", "$104.3K", "1.1%"],
        ].map(([plan, active, revenue, churn]) => (
          <Card key={plan} className="shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold">{plan}</p><Badge variant="outline">Active</Badge></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-xs text-muted-foreground">Subs</p><p className="mt-1 font-medium">{active}</p></div>
                <div><p className="text-xs text-muted-foreground">MRR</p><p className="mt-1 font-medium">{revenue}</p></div>
                <div><p className="text-xs text-muted-foreground">Churn</p><p className="mt-1 font-medium">{churn}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: ComponentType<{ className?: string }> }) {
  return <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-muted-foreground" /></div><p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></CardContent></Card>;
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowDownToLine, ArrowUpFromLine, BarChart3, Globe2, TrendingUp, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/(main)/dashboard/analytics/")({ component: AnalyticsOverview });

const revenueTrend = [
  { label: "08 Oct", value: 38200 }, { label: "09 Oct", value: 41700 }, { label: "10 Oct", value: 39500 },
  { label: "11 Oct", value: 46800 }, { label: "12 Oct", value: 51200 }, { label: "13 Oct", value: 48300 }, { label: "14 Oct", value: 57400 },
];
const countries = [
  { name: "Tunisia", count: 8420, share: 64 }, { name: "France", count: 1720, share: 21 },
  { name: "Italy", count: 980, share: 8 }, { name: "Other", count: 440, share: 7 },
];
const funnel = [
  { stage: "Checkout opened", count: 18420, rate: 100 },
  { stage: "Payment method selected", count: 15680, rate: 85.1 },
  { stage: "Payment submitted", count: 12840, rate: 69.7 },
  { stage: "Payment completed", count: 11970, rate: 65 },
];
const channels = [
  { name: "Flouci", attempts: 6840, completed: 6554, amount: 684000 },
  { name: "D17", attempts: 4280, completed: 3978, amount: 428000 },
  { name: "Kashy", attempts: 2410, completed: 2261, amount: 241000 },
  { name: "Other / unverified", attempts: 890, completed: 712, amount: 89000 },
];
const fmt = (value: number) => value.toLocaleString("en-US");
const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 0 });

function AnalyticsOverview() {
  const [period, setPeriod] = useState("7 days");
  const visibleTrend = useMemo(() => {
    if (period === "24 hours") return [
      { label: "00:00", value: 3400 }, { label: "04:00", value: 3800 }, { label: "08:00", value: 5200 },
      { label: "12:00", value: 6100 }, { label: "16:00", value: 5800 }, { label: "20:00", value: 7100 }, { label: "Now", value: 8400 },
    ];
    if (period === "30 days") return [
      { label: "Sep 16", value: 125000 }, { label: "Sep 20", value: 138000 }, { label: "Sep 24", value: 142000 },
      { label: "Sep 28", value: 160000 }, { label: "Oct 02", value: 177000 }, { label: "Oct 08", value: 189000 }, { label: "Oct 14", value: 205000 },
    ];
    return revenueTrend;
  }, [period]);
  const total = visibleTrend.reduce((sum, item) => sum + item.value, 0);
  const maxTrend = Math.max(...visibleTrend.map((item) => item.value));
  const totalAttempts = channels.reduce((sum, item) => sum + item.attempts, 0);
  const totalCompleted = channels.reduce((sum, item) => sum + item.completed, 0);

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="size-4" /> Analytics</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Analytics overview</h1><p className="mt-1 text-sm text-muted-foreground">Understand revenue, customer geography, checkout conversion and payment-channel performance.</p></div><div className="flex items-center gap-2"><label htmlFor="analytics-period" className="text-sm text-muted-foreground">Period</label><select id="analytics-period" value={period} onChange={(event) => setPeriod(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>24 hours</option><option>7 days</option><option>30 days</option></select></div></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Illustrative analytics.</strong> The selected period changes the demo revenue scale only. Production reports must use persisted events, explicit timezone rules, tenant scope and native-currency grouping.</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Gross payment volume</p><WalletCards className="size-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-semibold tabular-nums">{money(total)}</p><p className="mt-1 text-xs text-muted-foreground">Illustrative TND equivalent</p></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Checkout completion</p><Activity className="size-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-semibold tabular-nums">{(funnel[3].count / funnel[0].count * 100).toFixed(1)}%</p><p className="mt-1 text-xs text-muted-foreground">{fmt(funnel[3].count)} completed checkouts</p></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Payment success rate</p><TrendingUp className="size-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-semibold tabular-nums">{(totalCompleted / totalAttempts * 100).toFixed(1)}%</p><p className="mt-1 text-xs text-muted-foreground">{fmt(totalCompleted)} of {fmt(totalAttempts)} attempts</p></CardContent></Card>
      <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Countries represented</p><Globe2 className="size-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-semibold">{countries.length}</p><p className="mt-1 text-xs text-muted-foreground">Based on demo customer profile data</p></CardContent></Card>
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Revenue over time</CardTitle><p className="text-sm text-muted-foreground">Payment volume · sample TND amounts · {period}</p></CardHeader><CardContent><div className="flex h-52 items-end gap-3 border-b pb-2">{visibleTrend.map((item) => <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] tabular-nums text-muted-foreground">{Math.round(item.value / 1000)}k</span><div className="flex w-full items-end justify-center" style={{ height: "78%" }}><div className="w-full max-w-12 rounded-t-md bg-primary/80" style={{ height: Math.max(8, item.value / maxTrend * 100) + "%" }} /></div><span className="text-[10px] text-muted-foreground">{item.label}</span></div>)}</div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Total in selected demo period</span><span className="font-semibold tabular-nums">{money(total)}</span></div></CardContent></Card>
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Customers by country</CardTitle><p className="text-sm text-muted-foreground">Illustrative customer profile distribution</p></CardHeader><CardContent className="space-y-4">{countries.map((item) => <div key={item.name}><div className="mb-1.5 flex items-center justify-between text-sm"><span>{item.name}</span><span className="tabular-nums text-muted-foreground">{fmt(item.count)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary/80" style={{ width: item.share + "%" }} /></div></div>)}<p className="text-xs leading-5 text-muted-foreground">Country reporting should follow privacy rules and the trusted country source configured for each tenant.</p></CardContent></Card>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Checkout funnel</CardTitle><p className="text-sm text-muted-foreground">Drop-off between checkout stages</p></CardHeader><CardContent className="space-y-4">{funnel.map((item) => <div key={item.stage}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span>{item.stage}</span><span className="whitespace-nowrap tabular-nums text-muted-foreground">{fmt(item.count)} · {item.rate}%</span></div><div className="h-2.5 rounded-full bg-muted"><div className="h-2.5 rounded-full bg-primary" style={{ width: item.rate + "%" }} /></div></div>)}<div className="rounded-lg bg-muted/40 p-3 text-sm"><span className="text-muted-foreground">Largest drop-off:</span> method selection to payment submitted.</div></CardContent></Card>
      <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Payment channels</CardTitle><p className="text-sm text-muted-foreground">Attempt volume and completed payments</p></CardHeader><CardContent className="space-y-3">{channels.map((item) => <div key={item.name} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{fmt(item.completed)} completed / {fmt(item.attempts)} attempts</p><div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary/80" style={{ width: (item.completed / item.attempts * 100) + "%" }} /></div></div><div className="text-right"><p className="text-sm font-semibold tabular-nums">{(item.completed / item.attempts * 100).toFixed(1)}%</p><Badge variant="secondary" className="mt-1">Success</Badge></div></div>)}</CardContent></Card>
    </div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => window.location.assign("/dashboard/analytics/deposits")}><ArrowDownToLine className="mr-2 size-4" />Deposit performance</Button><Button variant="outline" size="sm" onClick={() => window.location.assign("/dashboard/analytics/withdrawals")}><ArrowUpFromLine className="mr-2 size-4" />Withdrawal performance</Button><Button variant="outline" size="sm" onClick={() => window.location.assign("/dashboard/transactions/fees-revenue")}>Fees & revenue</Button></div>
  </section>;
}

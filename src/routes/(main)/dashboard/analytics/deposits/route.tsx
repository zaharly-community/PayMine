import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, CheckCircle2, Clock3, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(main)/dashboard/analytics/deposits")({ component: DepositAnalyticsPage });

const rows = [
  { method: "Flouci", currency: "TND", attempts: 18420, successful: 17893, volume: 1842000, avgSeconds: 42, failures: "Timeout / pending status" },
  { method: "D17", currency: "TND", attempts: 12780, successful: 12047, volume: 1278000, avgSeconds: 68, failures: "Status verification delayed" },
  { method: "Kashy", currency: "TND", attempts: 7410, successful: 6992, volume: 741000, avgSeconds: 51, failures: "Insufficient / expired request" },
  { method: "e-Dinar", currency: "TND", attempts: 3420, successful: 3104, volume: 342000, avgSeconds: 94, failures: "Provider capability not verified" },
];

function money(value: number, currency: string) { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }

function DepositAnalyticsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rows.filter((row) => [row.method, row.failures].join(" ").toLowerCase().includes(query.toLowerCase())), [query]);
  const attempts = filtered.reduce((sum, row) => sum + row.attempts, 0);
  const success = filtered.reduce((sum, row) => sum + row.successful, 0);
  const volume = filtered.reduce((sum, row) => sum + row.volume, 0);
  const rate = attempts ? success / attempts * 100 : 0;
  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header><div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowDownToLine className="size-4" /> Analytics / Deposits</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Deposit performance</h1><p className="mt-1 text-sm text-muted-foreground">Compare payment-channel completion, volume and processing speed.</p></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Sample analytics.</strong> Values are illustrative and do not represent live provider metrics. A production version must use authoritative transaction events and a selected reporting period.</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Payment attempts</p><p className="mt-2 text-2xl font-semibold tabular-nums">{attempts.toLocaleString()}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Success rate</p><p className="mt-2 text-2xl font-semibold tabular-nums">{rate.toFixed(1)}%</p><p className="mt-1 text-xs text-muted-foreground">{success.toLocaleString()} successful attempts</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Illustrative volume</p><p className="mt-2 text-2xl font-semibold tabular-nums">{money(volume, "TND")}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Channels shown</p><p className="mt-2 text-2xl font-semibold">{filtered.length}</p></CardContent></Card></div>
    <Card className="overflow-hidden shadow-none"><div className="flex items-center gap-3 border-b p-3"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payment channel or failure reason..." /></div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr>{["Channel", "Attempts", "Successful", "Success rate", "Gross volume*", "Avg. processing", "Common exception"].map((item) => <th key={item} className="px-3 py-3 font-medium whitespace-nowrap">{item}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((row) => <tr key={row.method} className="hover:bg-muted/20"><td className="px-3 py-3 font-medium">{row.method}<span className="mt-1 block text-xs text-muted-foreground">{row.currency}</span></td><td className="px-3 py-3 tabular-nums">{row.attempts.toLocaleString()}</td><td className="px-3 py-3 tabular-nums">{row.successful.toLocaleString()}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><span className="w-12 tabular-nums">{(row.successful / row.attempts * 100).toFixed(1)}%</span><div className="h-1.5 w-20 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: (row.successful / row.attempts * 100) + "%" }} /></div></div></td><td className="px-3 py-3 tabular-nums">{money(row.volume, row.currency)}</td><td className="px-3 py-3"><Badge variant="secondary"><Clock3 className="mr-1 size-3" />{row.avgSeconds}s</Badge></td><td className="px-3 py-3 text-xs text-muted-foreground">{row.failures}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No channels match this search.</div>}</div><div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground"><CheckCircle2 className="size-3.5" />*Sample volume shown in TND. Production values must respect currency-specific reporting.</div></Card>
  </section>;
}

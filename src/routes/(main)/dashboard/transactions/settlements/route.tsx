import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Download, Landmark, Plus, Search, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SettlementStatus = "Settled" | "Processing" | "Pending" | "Failed";
type Settlement = { id: string; provider: string; account: string; period: string; gross: number; fees: number; net: number; status: SettlementStatus; date: string };
const settlements: Settlement[] = [
  { id: "SET-260928-001", provider: "Flouci", account: "ACCT-TN-001", period: "27 Sep 2026", gross: 18420, fees: 184.2, net: 18235.8, status: "Settled", date: "28 Sep 2026, 08:42" },
  { id: "SET-260927-014", provider: "D17", account: "ACCT-TN-002", period: "26 Sep 2026", gross: 12780, fees: 191.7, net: 12588.3, status: "Settled", date: "27 Sep 2026, 17:18" },
  { id: "SET-260928-002", provider: "Tunisie Telecom", account: "ACCT-TT-004", period: "27 Sep 2026", gross: 9630, fees: 96.3, net: 9533.7, status: "Processing", date: "28 Sep 2026, 09:05" },
  { id: "SET-260927-015", provider: "Kashy", account: "ACCT-TN-003", period: "26 Sep 2026", gross: 7410, fees: 111.15, net: 7298.85, status: "Pending", date: "27 Sep 2026, 18:34" },
  { id: "SET-260926-021", provider: "Ooredoo", account: "ACCT-TN-005", period: "25 Sep 2026", gross: 5210, fees: 52.1, net: 5157.9, status: "Failed", date: "26 Sep 2026, 14:27" },
  { id: "SET-260926-020", provider: "Orange", account: "ACCT-TN-006", period: "25 Sep 2026", gross: 11340, fees: 170.1, net: 11169.9, status: "Settled", date: "26 Sep 2026, 11:03" },
];
const statusClass: Record<SettlementStatus, string> = {
  Settled: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Processing: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Failed: "border-destructive/25 bg-destructive/10 text-destructive",
};
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

function SummaryCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return <Card className="shadow-none"><CardContent className="flex min-h-[112px] items-center justify-between gap-4 p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

export const Route = createFileRoute("/(main)/dashboard/transactions/settlements")({ component: SettlementsPage });

function SettlementsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState(settlements[0].id);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftProvider, setDraftProvider] = useState("Flouci");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => settlements.filter((row) => [row.id, row.provider, row.account, row.period].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "All" || row.status === status)), [query, status]);
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0];
  const totalGross = filtered.reduce((sum, row) => sum + row.gross, 0);
  const totalFees = filtered.reduce((sum, row) => sum + row.fees, 0);
  const settledCount = filtered.filter((row) => row.status === "Settled").length;
  const pendingCount = filtered.filter((row) => row.status === "Pending" || row.status === "Processing").length;

  const exportCsv = () => {
    const head = ["Settlement", "Provider", "Account", "Period", "Gross", "Fees", "Net", "Currency", "Status", "Date"];
    const data = filtered.map((row) => [row.id, row.provider, row.account, row.period, row.gross, row.fees, row.net, "TND", row.status, row.date]);
    const csv = [head, ...data].map((row) => row.map((cell) => "\"" + String(cell).replaceAll("\"", "\"\"") + "\"").join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ipaycash-settlements-demo.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><Landmark className="size-5" /></div><div><div className="text-xs font-medium text-muted-foreground">Finance</div><h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Settlements</h1><p className="mt-1 text-sm text-muted-foreground">Review provider batches, gross amounts, fees, net proceeds and unresolved delivery.</p></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 size-4" />Export CSV</Button><Button size="sm" onClick={() => { setDraftOpen((open) => !open); setNotice(""); }}><Plus className="mr-2 size-4" />Prepare settlement</Button></div></div></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Sample settlement batches.</strong> Amounts are illustrative TND values. Export includes only the rows currently visible after filtering.</div>
    {notice && <div role="status" className="rounded-lg border px-4 py-3 text-sm">{notice}</div>}
    {draftOpen && <Card className="border-primary/30 shadow-none"><CardHeader><CardTitle className="text-base">Prepare settlement preview</CardTitle><p className="text-sm text-muted-foreground">Select a provider to scope a future statement import. No money movement will occur here.</p></CardHeader><CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><div className="grid gap-2"><label className="text-sm font-medium" htmlFor="settlement-provider">Provider</label><select id="settlement-provider" value={draftProvider} onChange={(event) => setDraftProvider(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>Flouci</option><option>D17</option><option>Kashy</option><option>e-Dinar</option><option>Other</option></select></div><div className="grid gap-2"><label className="text-sm font-medium" htmlFor="settlement-period">Statement period</label><select id="settlement-period" className="h-9 rounded-md border bg-background px-3 text-sm"><option>Previous business day</option><option>Current day</option><option>Custom period (configure after backend)</option></select></div><Button onClick={() => setNotice("Demo only: a " + draftProvider + " settlement preview was prepared conceptually. A real run requires provider statement/API data and reconciliation results.")}>Validate preview</Button></CardContent></Card>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Gross in view" value={money(totalGross)} sub="Visible sample batches" icon={<WalletCards className="size-5" />} /><SummaryCard label="Provider fees" value={money(totalFees)} sub="Recorded example fees" icon={<Landmark className="size-5" />} /><SummaryCard label="Settled batches" value={String(settledCount)} sub="Completed sample cycles" icon={<CheckCircle2 className="size-5" />} /><SummaryCard label="In progress" value={String(pendingCount)} sub="Pending or processing" icon={<Clock3 className="size-5" />} /></div>
    <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search settlement ID, provider, account..." className="pl-9 md:max-w-[440px]" /></div><select aria-label="Settlement status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>Settled</option><option>Processing</option><option>Pending</option><option>Failed</option></select></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Settlement", "Provider / account", "Period", "Gross", "Fees", "Net", "Status"].map((head) => <th key={head} className="px-3 py-3 text-left font-medium whitespace-nowrap">{head}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((row) => <tr key={row.id} className={(selected?.id === row.id ? "bg-muted/40 " : "") + "hover:bg-muted/20"}><td className="px-3 py-3"><button className="text-left" onClick={() => setSelectedId(row.id)}><span className="block font-medium">{row.id}</span><span className="mt-1 block text-xs text-muted-foreground">{row.date}</span></button></td><td className="px-3 py-3"><span className="block font-medium">{row.provider}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{row.account}</span></td><td className="px-3 py-3 whitespace-nowrap">{row.period}</td><td className="px-3 py-3 tabular-nums whitespace-nowrap">{money(row.gross)}</td><td className="px-3 py-3 tabular-nums whitespace-nowrap text-muted-foreground">{money(row.fees)}</td><td className="px-3 py-3 font-medium tabular-nums whitespace-nowrap">{money(row.net)}</td><td className="px-3 py-3"><Badge variant="outline" className={statusClass[row.status]}>{row.status}</Badge></td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No settlements match these filters.</td></tr>}</tbody></table></div><div className="border-t px-3 py-2 text-xs text-muted-foreground">Showing {filtered.length} sample settlement batches · Currency: TND</div></Card>
    {selected && <Card className="shadow-none"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-base">Settlement details</CardTitle><p className="mt-1 font-mono text-xs text-muted-foreground">{selected.id} · {selected.provider} · {selected.account}</p></div><Badge variant="outline" className={statusClass[selected.status]}>{selected.status}</Badge></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs text-muted-foreground">Gross</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.gross)}</p></div><div><p className="text-xs text-muted-foreground">Provider fees</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.fees)}</p></div><div><p className="text-xs text-muted-foreground">Net expected</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.net)}</p></div><div><p className="text-xs text-muted-foreground">Settlement period</p><p className="mt-1 text-sm font-medium">{selected.period}</p></div><div className="sm:col-span-2 xl:col-span-4 rounded-lg bg-muted/40 p-3 text-sm leading-5 text-muted-foreground">Production detail should include provider statement reference, included transaction IDs, statement hash, matched/unmatched totals, expected arrival date and any related reconciliation exceptions.</div><div className="sm:col-span-2 xl:col-span-4"><Button variant="outline" size="sm" onClick={() => window.location.assign("/dashboard/transactions/reconciliation")}>Review reconciliation</Button></div></CardContent></Card>}
  </section>;
}

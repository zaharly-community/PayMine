import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Download, RefreshCcw, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReconciliationStatus = "Matched" | "Needs review" | "Investigating";
type ReconciliationRow = { id: string; provider: string; account: string; date: string; expected: number; actual: number; currency: "TND"; status: ReconciliationStatus; notes: string };

const rows: ReconciliationRow[] = [
  { id: "REC-260928-081", provider: "Flouci", account: "ACCT-TN-001", date: "28 Sep 2026, 08:55", expected: 18420, actual: 18420, currency: "TND", status: "Matched", notes: "Provider balance confirmed" },
  { id: "REC-260928-080", provider: "D17", account: "ACCT-TN-002", date: "28 Sep 2026, 08:41", expected: 12780, actual: 12694, currency: "TND", status: "Needs review", notes: "Unexplained variance" },
  { id: "REC-260928-079", provider: "Kashy", account: "ACCT-TN-003", date: "28 Sep 2026, 08:22", expected: 7410, actual: 7410, currency: "TND", status: "Matched", notes: "Daily batch matched" },
  { id: "REC-260927-078", provider: "Tunisie Telecom", account: "ACCT-TT-004", date: "27 Sep 2026, 23:59", expected: 9630, actual: 9712, currency: "TND", status: "Investigating", notes: "Settlement timing difference" },
  { id: "REC-260927-077", provider: "Orange", account: "ACCT-TN-006", date: "27 Sep 2026, 23:42", expected: 11340, actual: 11340, currency: "TND", status: "Matched", notes: "Provider report matched" },
  { id: "REC-260927-076", provider: "Ooredoo", account: "ACCT-TN-005", date: "27 Sep 2026, 22:18", expected: 5210, actual: 5190, currency: "TND", status: "Needs review", notes: "20 TND variance after fee adjustment" },
];
const statusClass: Record<ReconciliationStatus, string> = {
  Matched: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Needs review": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Investigating: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

export const Route = createFileRoute("/(main)/dashboard/transactions/reconciliation")({ component: ReconciliationPage });

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card className="shadow-none"><CardContent className="flex min-h-[108px] items-center justify-between p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div><div className="flex size-10 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

function ReconciliationPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState("REC-260928-080");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => rows.filter((row) => [row.id, row.provider, row.account, row.notes].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "All" || row.status === status)), [query, status]);
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0];
  const mismatches = filtered.filter((row) => row.expected !== row.actual);
  const matched = filtered.length - mismatches.length;
  const variance = mismatches.reduce((sum, row) => sum + Math.abs(row.actual - row.expected), 0);

  const exportCsv = () => {
    const head = ["Reconciliation", "Provider", "Account", "Date", "Expected", "Actual", "Variance", "Currency", "Status", "Notes"];
    const data = filtered.map((row) => [row.id, row.provider, row.account, row.date, row.expected, row.actual, row.actual - row.expected, row.currency, row.status, row.notes]);
    const csv = [head, ...data].map((row) => row.map((cell) => "\"" + String(cell).replaceAll("\"", "\"\"") + "\"").join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ipaycash-reconciliation-demo.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><RefreshCcw className="size-5" /></div><div><div className="text-xs font-medium text-muted-foreground">Finance</div><h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Reconciliation</h1><p className="mt-1 text-sm text-muted-foreground">Compare internal records with provider statements and investigate variances.</p></div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 size-4" />Export CSV</Button><Button size="sm" onClick={() => setNotice("Demo only: this preview used the sample rows on this page. No provider API or statement file was queried.")}><RefreshCcw className="mr-2 size-4" />Run preview</Button></div></div></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Sample reconciliation rows.</strong> A production run must be idempotent, record its source statement and never create a financial adjustment solely because a variance was detected.</div>
    {notice && <div role="status" className="rounded-lg border px-4 py-3 text-sm">{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Accounts checked" value={String(filtered.length)} icon={<CircleDollarSign className="size-5" />} /><Metric label="Exact matches" value={String(matched)} icon={<CheckCircle2 className="size-5" />} /><Metric label="Mismatches" value={String(mismatches.length)} icon={<AlertTriangle className="size-5" />} /><Metric label="Open variance" value={money(variance)} icon={<ShieldAlert className="size-5" />} /></div>
    <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reconciliation ID, provider, account..." className="pl-9 md:max-w-[440px]" /></div><select aria-label="Reconciliation status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>Matched</option><option>Needs review</option><option>Investigating</option></select></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Reconciliation", "Provider / account", "Expected", "Actual", "Variance", "Status"].map((head) => <th key={head} className="px-3 py-3 text-left font-medium whitespace-nowrap">{head}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((row) => { const delta = row.actual - row.expected; return <tr key={row.id} className={(selected?.id === row.id ? "bg-muted/40 " : "") + (delta !== 0 ? "hover:bg-amber-500/[0.06]" : "hover:bg-muted/20")}><td className="px-3 py-3"><button onClick={() => { setSelectedId(row.id); setNotice(""); }} className="text-left"><span className="block font-medium">{row.id}</span><span className="mt-1 block text-xs text-muted-foreground">{row.date}</span></button></td><td className="px-3 py-3"><span className="block font-medium">{row.provider}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{row.account}</span></td><td className="px-3 py-3 tabular-nums whitespace-nowrap">{money(row.expected)}</td><td className="px-3 py-3 tabular-nums whitespace-nowrap">{money(row.actual)}</td><td className={"px-3 py-3 font-medium tabular-nums whitespace-nowrap " + (delta === 0 ? "text-muted-foreground" : "text-amber-700 dark:text-amber-300")}>{delta === 0 ? "—" : (delta > 0 ? "+" : "−") + money(Math.abs(delta))}</td><td className="px-3 py-3"><Badge variant="outline" className={statusClass[row.status]}>{row.status}</Badge></td></tr>; })}{filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No records match these filters.</td></tr>}</tbody></table></div>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">Showing {filtered.length} sample records · Currency: TND · Amount-based matches should be treated as probable until reviewed.</div>
    </Card>
    {selected && <Card className="shadow-none"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-base">Exception review</CardTitle><p className="mt-1 font-mono text-xs text-muted-foreground">{selected.id} · {selected.provider} · {selected.account}</p></div><Badge variant="outline" className={statusClass[selected.status]}>{selected.status}</Badge></div></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><div><p className="text-xs text-muted-foreground">Expected amount</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.expected)}</p></div><div><p className="text-xs text-muted-foreground">Provider-reported amount</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.actual)}</p></div><div><p className="text-xs text-muted-foreground">Variance</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(selected.actual - selected.expected)}</p></div><div className="md:col-span-3 rounded-lg bg-muted/40 p-3 text-sm"><p className="font-medium">Investigation notes</p><p className="mt-1 text-muted-foreground">{selected.notes}</p></div><div className="md:col-span-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => window.location.assign("/dashboard/approvals")}>Open approval center</Button><Button size="sm" variant="outline" onClick={() => setNotice("Demo only: investigation note saved to local page state. No reconciliation record was changed.")}>Record review note</Button></div><p className="md:col-span-3 text-xs leading-5 text-muted-foreground">Do not post an adjustment automatically. Production should create an audited adjustment request with maker-checker review.</p></CardContent></Card>}
  </section>;
}

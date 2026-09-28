import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDollarSign, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReconciliationStatus = "Matched" | "Needs review" | "Investigating";

type ReconciliationRow = {
  id: string;
  provider: string;
  account: string;
  date: string;
  expected: number;
  actual: number;
  status: ReconciliationStatus;
  notes: string;
};

const rows: ReconciliationRow[] = [
  { id: "REC-260928-081", provider: "Flouci", account: "ACCT-TN-001", date: "28 Sep 2026, 08:55", expected: 18420, actual: 18420, status: "Matched", notes: "Provider balance confirmed" },
  { id: "REC-260928-080", provider: "D17", account: "ACCT-TN-002", date: "28 Sep 2026, 08:41", expected: 12780, actual: 12694, status: "Needs review", notes: "Unexplained variance" },
  { id: "REC-260928-079", provider: "Kashy", account: "ACCT-TN-003", date: "28 Sep 2026, 08:22", expected: 7410, actual: 7410, status: "Matched", notes: "Daily batch matched" },
  { id: "REC-260927-078", provider: "Tunisie Telecom", account: "ACCT-TT-004", date: "27 Sep 2026, 23:59", expected: 9630, actual: 9712, status: "Investigating", notes: "Settlement timing difference" },
  { id: "REC-260927-077", provider: "Orange", account: "ACCT-TN-006", date: "27 Sep 2026, 23:42", expected: 11340, actual: 11340, status: "Matched", notes: "Provider report matched" },
  { id: "REC-260927-076", provider: "Ooredoo", account: "ACCT-TN-005", date: "27 Sep 2026, 22:18", expected: 5210, actual: 5190, status: "Needs review", notes: "20.00 variance after fee adjustment" },
];

const statusClass: Record<ReconciliationStatus, string> = {
  Matched: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Needs review": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Investigating: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

const money = (value: number) => "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const Route = createFileRoute("/(main)/dashboard/transactions/reconciliation")({
  component: ReconciliationPage,
});

function ReconciliationPage() {
  const mismatches = rows.filter((row) => row.expected !== row.actual);
  const matched = rows.length - mismatches.length;
  const variance = mismatches.reduce((sum, row) => sum + Math.abs(row.expected - row.actual), 0);

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><RefreshCcw className="size-5" /></div><div><div className="text-xs font-medium text-muted-foreground">Finance</div><h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Reconciliation</h1><p className="mt-1 text-sm text-muted-foreground">Compare expected PayMine balances with provider-reported amounts and surface variances.</p></div></div>
          <Button size="sm"><RefreshCcw /> Run reconciliation</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Accounts checked" value={String(rows.length)} icon={<CircleDollarSign className="size-5" />} />
        <Metric label="Matched" value={String(matched)} icon={<CheckCircle2 className="size-5" />} />
        <Metric label="Mismatches" value={String(mismatches.length)} icon={<AlertTriangle className="size-5" />} />
        <Metric label="Open variance" value={money(variance)} icon={<CircleDollarSign className="size-5" />} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
          <Input placeholder="Search reconciliation ID, provider, account..." className="md:max-w-[420px]" />
          <select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"><option>All statuses</option><option>Matched</option><option>Needs review</option><option>Investigating</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Reconciliation", "Provider", "Account", "Expected", "Actual", "Variance", "Status", "Notes"].map((head) => <th key={head} className="px-4 py-3 text-left font-medium whitespace-nowrap">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const delta = row.actual - row.expected;
                return <tr key={row.id} className={delta !== 0 ? "bg-amber-500/[0.035] hover:bg-amber-500/[0.06]" : "hover:bg-muted/20"}>
                  <td className="px-4 py-3"><div className="font-medium">{row.id}</div><div className="text-xs text-muted-foreground">{row.date}</div></td>
                  <td className="px-4 py-3">{row.provider}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.account}</td>
                  <td className="px-4 py-3 tabular-nums">{money(row.expected)}</td>
                  <td className="px-4 py-3 tabular-nums">{money(row.actual)}</td>
                  <td className={"px-4 py-3 font-medium tabular-nums " + (delta === 0 ? "text-muted-foreground" : "text-amber-700 dark:text-amber-300")}>{delta === 0 ? "—" : (delta > 0 ? "+" : "-") + money(Math.abs(delta))}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusClass[row.status]}>{row.status}</Badge></td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-muted-foreground">{row.notes}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div><div className="flex size-10 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

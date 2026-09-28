import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Landmark, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SettlementStatus = "Settled" | "Processing" | "Pending" | "Failed";

type Settlement = {
  id: string;
  provider: string;
  account: string;
  period: string;
  gross: number;
  fees: number;
  net: number;
  status: SettlementStatus;
  date: string;
};

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

function money(value: number) {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex min-h-[112px] items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/(main)/dashboard/transactions/settlements")({
  component: SettlementsPage,
});

function SettlementsPage() {
  const totalGross = settlements.reduce((sum, row) => sum + row.gross, 0);
  const totalFees = settlements.reduce((sum, row) => sum + row.fees, 0);
  const settledCount = settlements.filter((row) => row.status === "Settled").length;
  const pendingCount = settlements.filter((row) => row.status === "Pending" || row.status === "Processing").length;

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><Landmark className="size-5" /></div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Finance</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Settlements</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track provider settlement batches, fees and net amounts received by PayMine accounts.</p>
            </div>
          </div>
          <div className="flex gap-2"><Button variant="outline" size="sm">Export CSV</Button><Button size="sm">Create settlement</Button></div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Gross settled" value={money(totalGross)} sub="All mock settlement batches" icon={<WalletCards className="size-5" />} />
        <SummaryCard label="Provider fees" value={money(totalFees)} sub="Recorded settlement fees" icon={<Landmark className="size-5" />} />
        <SummaryCard label="Settled batches" value={String(settledCount)} sub="Completed settlement cycles" icon={<CheckCircle2 className="size-5" />} />
        <SummaryCard label="In progress" value={String(pendingCount)} sub="Pending or processing" icon={<Clock3 className="size-5" />} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
          <Input placeholder="Search settlement ID, provider, account..." className="md:max-w-[420px]" />
          <select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"><option>All statuses</option><option>Settled</option><option>Processing</option><option>Pending</option><option>Failed</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>{["Settlement", "Provider", "Account", "Period", "Gross", "Fees", "Net", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-medium whitespace-nowrap">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {settlements.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3"><div className="font-medium">{row.id}</div><div className="text-xs text-muted-foreground">{row.date}</div></td>
                  <td className="px-4 py-3">{row.provider}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.account}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.period}</td>
                  <td className="px-4 py-3 tabular-nums">{money(row.gross)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{money(row.fees)}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{money(row.net)}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusClass[row.status]}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

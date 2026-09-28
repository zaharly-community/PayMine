import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock3, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DisagreementStatus = "Open" | "Under review" | "Resolved";

type Disagreement = {
  id: string;
  transaction: string;
  player: string;
  type: "Deposit" | "Withdrawl";
  expected: number;
  received: number;
  reason: string;
  status: DisagreementStatus;
  opened: string;
};

const rows: Disagreement[] = [
  { id: "DSG-260928-014", transaction: "DEP-10482", player: "Sami K.", type: "Deposit", expected: 500, received: 480, reason: "Provider amount differs from submitted amount", status: "Open", opened: "28 Sep 2026, 09:14" },
  { id: "DSG-260928-013", transaction: "WDL-20871", player: "Maya R.", type: "Withdrawl", expected: 320, received: 300, reason: "Commission adjustment not reflected", status: "Under review", opened: "28 Sep 2026, 08:48" },
  { id: "DSG-260927-012", transaction: "DEP-10451", player: "Karim B.", type: "Deposit", expected: 950, received: 950, reason: "Duplicate callback amount", status: "Resolved", opened: "27 Sep 2026, 21:22" },
  { id: "DSG-260927-011", transaction: "DEP-10417", player: "Ines H.", type: "Deposit", expected: 1250, received: 1240, reason: "Provider fee posted before callback", status: "Under review", opened: "27 Sep 2026, 18:09" },
  { id: "DSG-260926-010", transaction: "WDL-20822", player: "Ahmed S.", type: "Withdrawl", expected: 640, received: 640, reason: "Manual correction matched ledger", status: "Resolved", opened: "26 Sep 2026, 16:40" },
  { id: "DSG-260926-009", transaction: "DEP-10388", player: "Nour T.", type: "Deposit", expected: 780, received: 760, reason: "Settlement reconciliation difference", status: "Open", opened: "26 Sep 2026, 12:31" },
];

const statusClass: Record<DisagreementStatus, string> = {
  Open: "border-destructive/25 bg-destructive/10 text-destructive",
  "Under review": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const money = (value: number) => "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const Route = createFileRoute("/(main)/dashboard/analytics/disagreements")({
  component: DisagreementsPage,
});

function DisagreementsPage() {
  const open = rows.filter((row) => row.status === "Open").length;
  const review = rows.filter((row) => row.status === "Under review").length;
  const resolved = rows.filter((row) => row.status === "Resolved").length;
  const exposure = rows.filter((row) => row.status !== "Resolved").reduce((sum, row) => sum + Math.abs(row.expected - row.received), 0);

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><Scale className="size-5" /></div><div><div className="text-xs font-medium text-muted-foreground">Operations · Analytics</div><h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Disagreements</h1><p className="mt-1 text-sm text-muted-foreground">Review payment discrepancies where submitted, provider and ledger amounts do not fully agree.</p></div></div>
          <Button size="sm"><AlertTriangle /> Review queue</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Open" value={String(open)} sub="Requires operator action" icon={<AlertTriangle className="size-5" />} />
        <Metric label="Under review" value={String(review)} sub="Investigations in progress" icon={<Clock3 className="size-5" />} />
        <Metric label="Resolved" value={String(resolved)} sub="Closed disagreement cases" icon={<CheckCircle2 className="size-5" />} />
        <Metric label="Open exposure" value={money(exposure)} sub="Absolute unmatched amount" icon={<Scale className="size-5" />} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><Input placeholder="Search case, transaction, player..." className="md:max-w-[420px]" /><select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"><option>All statuses</option><option>Open</option><option>Under review</option><option>Resolved</option></select><select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"><option>All types</option><option>Deposit</option><option>Withdrawl</option></select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Case", "Transaction", "Player", "Type", "Expected", "Observed", "Difference", "Reason", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-medium whitespace-nowrap">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const difference = row.received - row.expected;
                return <tr key={row.id} className={row.status === "Open" ? "bg-destructive/[0.025]" : "hover:bg-muted/20"}>
                  <td className="px-4 py-3"><div className="font-medium">{row.id}</div><div className="text-xs text-muted-foreground">{row.opened}</div></td>
                  <td className="px-4 py-3 font-mono text-xs">{row.transaction}</td>
                  <td className="px-4 py-3">{row.player}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.type}</Badge></td>
                  <td className="px-4 py-3 tabular-nums">{money(row.expected)}</td>
                  <td className="px-4 py-3 tabular-nums">{money(row.received)}</td>
                  <td className={"px-4 py-3 font-semibold tabular-nums " + (difference === 0 ? "text-muted-foreground" : "text-destructive")}>{difference === 0 ? "—" : (difference > 0 ? "+" : "-") + money(Math.abs(difference))}</td>
                  <td className="max-w-[320px] px-4 py-3 text-xs text-muted-foreground">{row.reason}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusClass[row.status]}>{row.status}</Badge></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex min-h-[112px] items-center justify-between gap-4 p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

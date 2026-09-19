import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settlementRows } from "./finance-data";

export function FinanceSettlements() {
  return (
    <section className="flex min-h-full flex-col gap-4 bg-background">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settlements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historical settlement records. Current balances remain in Treasury.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Completed", "18"],
          ["Settled value", "$14,280"],
          ["Blocked", "2"],
          ["Awaiting approval", "1"],
        ].map(([label, value]) => (
          <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><span className="text-xl font-semibold tabular-nums">{value}</span></CardContent></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b"><CardTitle className="text-sm">Settlement history</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>{["Settlement", "Provider", "Amount", "Before", "After", "Status", "Initiated by", "Date"].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {settlementRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{row.id}</td>
                    <td className="px-4 py-3">{row.provider}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{row.amount ? "$" + row.amount.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.before.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.after.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={row.status === "Completed" ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : row.status === "Blocked" ? "border-red-500/20 text-red-600 dark:text-red-400" : "border-amber-500/20 text-amber-600 dark:text-amber-400"}>
                        {row.status === "Completed" ? <CheckCircle2 /> : row.status === "Blocked" ? <ShieldAlert /> : <Clock3 />}{row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{row.initiatedBy}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-[11px] text-muted-foreground">Frontend-only mockup. No settlement is executed.</p>
    </section>
  );
}

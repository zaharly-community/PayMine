import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { treasuryAccounts } from "./finance-data";

export function FinanceTreasury() {
  return (
    <section className="flex min-h-full flex-col gap-4 bg-background">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Treasury</h1>
        <p className="mt-1 text-sm text-muted-foreground">Current provider account position, reconciliation state and settlement availability.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Expected balance", "$116,640"],
          ["Actual provider balance", "$115,565"],
          ["Reserved", "$6,340"],
          ["Available after reserve", "$110,300"],
        ].map(([label, value]) => (
          <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><span className="text-xl font-semibold tabular-nums">{value}</span></CardContent></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b"><CardTitle className="text-sm">Provider accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>{["Provider", "Account", "Expected", "Actual", "Reserved", "Available", "Variance", "Status"].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {treasuryAccounts.map((row) => (
                  <tr key={row.account} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{row.provider}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.account}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.expected.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.actual.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.reserved.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{"$" + row.available.toLocaleString()}</td>
                    <td className={row.variance < 0 ? "px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400" : "px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400"}>{row.variance === 0 ? "$0" : "-$" + Math.abs(row.variance).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={row.status === "Mismatch" ? "border-red-500/20 text-red-600 dark:text-red-400" : "border-emerald-500/20 text-emerald-600 dark:text-emerald-400"}>
                        {row.status === "Mismatch" ? <ShieldAlert /> : <CheckCircle2 />}{row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-[11px] text-muted-foreground">Frontend-only mockup. Reconciliation is visual; mismatches do not modify balances.</p>
    </section>
  );
}

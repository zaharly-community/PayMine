import { ArrowLeft, Download, Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { reportData, type FinanceReportKey } from "./finance-data";

export function FinanceReportPage({ reportKey }: { reportKey: FinanceReportKey }) {
  const report = reportData[reportKey];

  return (
    <section className="flex min-h-full flex-col gap-4 bg-background">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/dashboard/finance/reports" className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Reports
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{report.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Filter /> Filters</Button>
          <Button size="sm" variant="outline"><Download /> Export</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {report.metrics.map(([label, value, trend]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <span className="text-xl font-semibold tabular-nums">{value}</span>
              <Badge variant="secondary" className="text-[10px]">{trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm">Report data</CardTitle>
            <div className="flex items-center gap-2">
              <Input className="h-8 w-44" placeholder="Filter rows..." />
              <Badge variant="outline">18 Sep 2026</Badge>
              <Badge variant="outline">All providers</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>{report.headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {report.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/20">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={cn("whitespace-nowrap px-4 py-3", cellIndex > 0 ? "tabular-nums" : "font-medium")}>
                        {["Completed", "Reconciled", "Mismatch", "Blocked", "Pending"].includes(cell)
                          ? <span className={cn("text-xs font-medium", cell === "Mismatch" || cell === "Blocked" ? "text-red-600 dark:text-red-400" : cell === "Pending" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>{cell}</span>
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">Frontend-only mockup. Report controls are visual and do not call providers or change financial data.</p>
    </section>
  );
}

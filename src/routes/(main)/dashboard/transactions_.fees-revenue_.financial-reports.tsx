import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReportTab = "Profits" | "Deposits" | "Withdrawals";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];
const REPORT_TABS: ReportTab[] = ["Profits", "Deposits", "Withdrawals"];

function getDailyValue(year: number, monthIndex: number, day: number, tab: ReportTab): number | null {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  if (day > daysInMonth) return null;
  // The current-year view stays within the current date; all older years are complete.
  if (year === 2026 && (monthIndex > 9 || (monthIndex === 9 && day > 14))) return null;

  const seed = year * 17 + (monthIndex + 1) * 31 + day * 13;
  if ((seed + (tab === "Profits" ? 1 : tab === "Deposits" ? 2 : 3)) % 4 !== 0) return null;

  const amountSeed = (seed * (tab === "Profits" ? 7 : tab === "Deposits" ? 11 : 5)) % 997;
  if (tab === "Profits") {
    const amount = Math.round((amountSeed / 17 + 0.45) * 100) / 100;
    return (seed + day) % 7 === 0 ? -amount : amount;
  }

  const scale = tab === "Deposits" ? 18.5 : 9.75;
  return Math.round((amountSeed * scale + 42.5) * 100) / 100;
}

function formatMoney(value: number) {
  const absolute = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${absolute}` : `$${absolute}`;
}

function makeCsv(year: number, tab: ReportTab, values: Array<Array<number | null>>, totals: number[]) {
  const rows = [
    ["Day", ...MONTHS, "Total"].join(","),
    ...values.map((months, index) => [
      String(index + 1),
      ...months.map((value) => (value === null ? "" : value.toFixed(2))),
      months.reduce<number>((sum, value) => sum + (value ?? 0), 0).toFixed(2),
    ].join(",")),
    ["Total", ...totals.map((value) => value.toFixed(2)), totals.reduce((sum, value) => sum + value, 0).toFixed(2)].join(","),
  ];
  return [["Report", tab], ["Year", String(year)], [], ...rows.map((row) => [row])].map((row) => Array.isArray(row) ? row.join(",") : String(row)).join("\n");
}

export const Route = createFileRoute("/(main)/dashboard/transactions_/fees-revenue_/financial-reports")({
  component: FinancialReportsPage,
});

function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Profits");
  const [year, setYear] = useState(2026);
  const values = useMemo(
    () => Array.from({ length: 31 }, (_, dayIndex) =>
      MONTHS.map((_, monthIndex) => getDailyValue(year, monthIndex, dayIndex + 1, activeTab)),
    ),
    [activeTab, year],
  );
  const totals = useMemo(
    () => MONTHS.map((_, monthIndex) =>
      values.reduce((sum, day) => sum + (day[monthIndex] ?? 0), 0),
    ),
    [values],
  );

  const exportCsv = () => {
    const csv = makeCsv(year, activeTab, values, totals);
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ipaycash-${activeTab.toLowerCase()}-${year}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex min-h-full flex-col gap-4 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Finance / Fees &amp; Revenue</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Financial Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Yearly calendar breakdown by day and month.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Sample data</Badge>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Financial report type">
          {REPORT_TABS.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? "default" : "outline"}
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Year
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {YEARS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-medium">{activeTab} · {year}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeTab === "Profits"
              ? "Negative profit amounts are shown with a minus sign in red."
              : `Daily ${activeTab.toLowerCase()} totals, grouped by month.`}
            {" "}Illustrative values only; live financial data is not connected.
          </p>
        </div>
        <div className="max-w-full overflow-auto">
          <table className="w-full min-w-[1020px] border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-20 bg-muted/70 text-xs text-muted-foreground backdrop-blur">
              <tr>
                <th className="sticky left-0 z-30 border-b bg-muted/90 px-4 py-3 text-left font-medium">Day</th>
                {MONTHS.map((month) => (
                  <th key={month} className="border-b px-3 py-3 text-right font-medium">{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((days, dayIndex) => (
                <tr key={dayIndex + 1} className="group">
                  <td className="sticky left-0 z-10 border-b bg-card px-4 py-2.5 font-mono text-xs text-muted-foreground group-hover:bg-muted/60">
                    {dayIndex + 1}
                  </td>
                  {days.map((value, monthIndex) => (
                    <td
                      key={MONTHS[monthIndex]}
                      className={[
                        "border-b px-3 py-2.5 text-right font-mono text-xs tabular-nums group-hover:bg-muted/30",
                        value === null ? "text-muted-foreground/40" : "",
                        activeTab === "Profits" && value !== null && value < 0 ? "font-semibold text-destructive" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {value === null ? "·" : formatMoney(value)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-muted/40">
                <th className="sticky bottom-0 left-0 z-20 border-t-2 bg-muted/90 px-4 py-3 text-left font-semibold">Total</th>
                {totals.map((total, monthIndex) => (
                  <td
                    key={MONTHS[monthIndex]}
                    className={[
                      "border-t-2 px-3 py-3 text-right font-mono text-xs font-semibold tabular-nums",
                      activeTab === "Profits" && total < 0 ? "text-destructive" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {formatMoney(total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

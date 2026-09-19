import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceReportCenter } from "../-components/finance-report-center";

export const Route = createFileRoute("/(main)/dashboard/finance/reports")({
  component: Page,
});

function Page() {
  const { pathname } = useLocation();

  if (pathname !== "/dashboard/finance/reports") {
    return <Outlet />;
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/dashboard/finance" className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Finance
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Central report library for financial analysis. Each report has a single responsibility and avoids duplicating operational pages.</p>
        </div>
        <Button size="sm" variant="outline"><BarChart3 /> Report schedule</Button>
      </div>
      <FinanceReportCenter />
      <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Reports are analytical views. Transactions, Treasury, Settlements and Distributor actions remain in their dedicated operational areas.
      </div>
    </section>
  );
}

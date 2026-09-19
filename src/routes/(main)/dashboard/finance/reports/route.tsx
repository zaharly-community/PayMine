import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Landmark, CircleDollarSign } from "lucide-react";
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

      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Operational finance views</h2>
          <p className="text-xs text-muted-foreground">Open the live Treasury and Settlements pages without duplicating their operational data inside Reports.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/dashboard/finance/treasury">
            <div className="group flex items-center justify-between rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Landmark className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Treasury</p>
                  <p className="text-xs text-muted-foreground">Current provider balances, reserves and reconciliation state.</p>
                </div>
              </div>
              <BarChart3 className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link to="/dashboard/finance/settlements">
            <div className="group flex items-center justify-between rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CircleDollarSign className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Settlements</p>
                  <p className="text-xs text-muted-foreground">Settlement history, blocked records and approval state.</p>
                </div>
              </div>
              <BarChart3 className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Reports are analytical views. Transactions, Treasury, Settlements and Distributor actions remain in their dedicated operational areas.
      </div>
    </section>
  );
}

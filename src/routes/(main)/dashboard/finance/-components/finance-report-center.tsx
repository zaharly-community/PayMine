import { ArrowRight, FileBarChart, Landmark, Network, ReceiptText, Scale, WalletCards } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financeReportCards } from "./finance-data";

const iconMap = {
  "financial-performance": FileBarChart,
  "provider-performance": Landmark,
  "distributor-performance": Network,
  "fees-compensation": WalletCards,
  "settlement-report": ReceiptText,
  "reconciliation-report": Scale,
} as const;

export function FinanceReportCenter() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {financeReportCards.map((report) => {
        const Icon = iconMap[report.key];
        return (
          <Link key={report.key} to={("/dashboard/finance/reports/" + report.key) as any}>
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="pt-2 text-base">{report.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{report.description}</p></CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

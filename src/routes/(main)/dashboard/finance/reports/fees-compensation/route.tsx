import { createFileRoute } from "@tanstack/react-router";
import { FinanceReportPage } from "../../-components/finance-report-page";
export const Route = createFileRoute("/(main)/dashboard/finance/reports/fees-compensation")({
  component: () => <FinanceReportPage reportKey="fees-compensation" />,
});

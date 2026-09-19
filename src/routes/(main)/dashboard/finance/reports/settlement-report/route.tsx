import { createFileRoute } from "@tanstack/react-router";
import { FinanceReportPage } from "../../-components/finance-report-page";
export const Route = createFileRoute("/(main)/dashboard/finance/reports/settlement-report")({
  component: () => <FinanceReportPage reportKey="settlement-report" />,
});

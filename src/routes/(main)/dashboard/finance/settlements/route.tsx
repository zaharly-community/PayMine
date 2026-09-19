import { createFileRoute } from "@tanstack/react-router";
import { FinanceSettlements } from "../-components/finance-settlements";

export const Route = createFileRoute("/(main)/dashboard/finance/settlements")({
  component: FinanceSettlements,
});

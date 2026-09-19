import { createFileRoute } from "@tanstack/react-router";
import { FinanceTransactions } from "../-components/finance-transactions";

export const Route = createFileRoute("/(main)/dashboard/finance/transactions")({
  component: FinanceTransactions,
});

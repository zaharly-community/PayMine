import { createFileRoute } from "@tanstack/react-router";
import { FinanceTreasury } from "../-components/finance-treasury";

export const Route = createFileRoute("/(main)/dashboard/finance/treasury")({
  component: FinanceTreasury,
});

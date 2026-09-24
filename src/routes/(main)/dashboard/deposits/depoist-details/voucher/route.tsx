import { createFileRoute } from "@tanstack/react-router";

import { TransactionDetail } from "../../-components/transaction-detail";

export const Route = createFileRoute(
  "/(main)/dashboard/deposits/depoist-details/voucher",
)({
  component: () => <TransactionDetail variant="voucher" />,
});

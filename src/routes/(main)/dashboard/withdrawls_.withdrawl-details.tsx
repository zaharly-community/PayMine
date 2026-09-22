import { createFileRoute } from "@tanstack/react-router";

import { WithdrawalDetail } from "./withdrawls/-components/withdrawl-detail";

export const Route = createFileRoute(
  "/(main)/dashboard/withdrawls_/withdrawl-details",
)({
  component: WithdrawalDetail,
});

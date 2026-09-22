import { createFileRoute } from "@tanstack/react-router";

import { WithdrawlsAnalytics } from "./withdrawls/-components/withdrawls-analytics";

export const Route = createFileRoute("/(main)/dashboard/withdrawls_/analytics")({
  component: WithdrawlsAnalytics,
});

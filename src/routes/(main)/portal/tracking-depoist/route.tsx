import { createFileRoute } from "@tanstack/react-router";

import { DepositRequestTrackingRoute } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/tracking-depoist")({
  component: DepositRequestTrackingRoute,
});

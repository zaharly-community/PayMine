import { createFileRoute } from "@tanstack/react-router";

import { SaasOwnerReports } from "../-components/saas-owner-reports";

export const Route = createFileRoute("/(main)/dashboard/reports")({
  component: SaasOwnerReports,
});

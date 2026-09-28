import { createFileRoute } from "@tanstack/react-router";

import { IntegrationCenter } from "@/routes/(main)/dashboard/integrations/route";

export const Route = createFileRoute("/(main)/dashboard/settings/integration-center")({
  component: IntegrationCenterSettings,
});

function IntegrationCenterSettings() {
  return <IntegrationCenter />;
}

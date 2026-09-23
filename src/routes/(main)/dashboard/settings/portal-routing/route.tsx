import { createFileRoute } from "@tanstack/react-router";

import { PortalRoutingSettings } from "../-components/portal-routing-settings";

export const Route = createFileRoute("/(main)/dashboard/settings/portal-routing")({
  component: PortalRoutingSettings,
});

import { createFileRoute } from "@tanstack/react-router";

import { IntegrationCenter } from "../-components/integration-center";

export const Route = createFileRoute("/(main)/dashboard/settings/integration-center")({
  component: IntegrationCenter,
});

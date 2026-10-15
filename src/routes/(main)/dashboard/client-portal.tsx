import { createFileRoute } from "@tanstack/react-router";

import { ClientPortalBuilder } from "./portal/-components/client-portal-builder";

export const Route = createFileRoute("/(main)/dashboard/client-portal")({
  component: ClientPortalPage,
});

export function ClientPortalPage() {
  return <ClientPortalBuilder />;
}

import { createFileRoute } from "@tanstack/react-router";

import { ClientPortalBuilder } from "./dashboard/portal/-components/client-portal-builder";

export const Route = createFileRoute("/(main)/builder")({
  validateSearch: (search: Record<string, unknown>) => ({
    form: typeof search.form === "string" ? search.form : undefined,
  }),
  component: PortalBuilderPage,
});

function PortalBuilderPage() {
  const { form } = Route.useSearch();

  return (
    <ClientPortalBuilder
      key={form ?? "default"}
      initialSlug={form ?? "main-deposit"}
      onExit={() => window.location.assign("/dashboard/client-portal")}
    />
  );
}

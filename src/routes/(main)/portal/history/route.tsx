import { createFileRoute } from "@tanstack/react-router";

import { PortalPlayerHistoryPage } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/history")({
  validateSearch: (search: Record<string, unknown>) => ({
    form: typeof search.form === "string" ? search.form : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { form } = Route.useSearch();
  return <PortalPlayerHistoryPage formSlug={form} />;
}

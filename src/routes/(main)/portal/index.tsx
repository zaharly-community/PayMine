import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "./-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search.preview === "1" || search.preview === true,
    form: typeof search.form === "string" ? search.form : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { form, preview } = Route.useSearch();
  return <CustomerPortal formSlug={form} preview={preview} />;
}

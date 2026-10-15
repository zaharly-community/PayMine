import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ClientPortalFormsLibrary } from "./portal/-components/client-portal-library";
import { ClientPortalBuilder } from "./portal/-components/client-portal-builder";

export const Route = createFileRoute("/(main)/dashboard/client-portal")({
  validateSearch: (search: Record<string, unknown>) => ({
    form: typeof search.form === "string" ? search.form : undefined,
  }),
  component: ClientPortalPage,
});

function ClientPortalPage() {
  const { form } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard/client-portal" });

  if (form) {
    return (
      <ClientPortalBuilder
        key={form}
        initialSlug={form}
        onExit={() => void navigate({ search: {} })}
      />
    );
  }

  return (
    <ClientPortalFormsLibrary
      onCustomize={(slug) => void navigate({ search: { form: slug } })}
    />
  );
}

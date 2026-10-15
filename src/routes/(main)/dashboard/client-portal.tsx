import { createFileRoute } from "@tanstack/react-router";

import { ClientPortalFormsLibrary } from "./portal/-components/client-portal-library";

export const Route = createFileRoute("/(main)/dashboard/client-portal")({
  component: ClientPortalPage,
});

function ClientPortalPage() {
  return (
    <ClientPortalFormsLibrary
      onCustomize={(slug) => {
        window.location.assign("/builder?form=" + encodeURIComponent(slug));
      }}
    />
  );
}

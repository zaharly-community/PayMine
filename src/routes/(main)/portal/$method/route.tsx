import { createFileRoute } from "@tanstack/react-router";

import { PaymentLinkPage } from "../-components/payment-link-page";
import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/$method")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search.preview === "1" || search.preview === true,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { method } = Route.useParams();
  const { preview } = Route.useSearch();

  if (method.startsWith("LinkID=")) {
    return <PaymentLinkPage linkId={method.slice("LinkID=".length)} />;
  }

  return <CustomerPortal initialMethodId={method} preview={preview} />;
}

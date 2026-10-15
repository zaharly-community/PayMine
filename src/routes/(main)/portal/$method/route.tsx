import { createFileRoute } from "@tanstack/react-router";

import { PaymentLinkPage } from "../-components/payment-link-page";
import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/$method")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search.preview === "1" || search.preview === true,
    form: typeof search.form === "string" ? search.form : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { method } = Route.useParams();
  const { preview, form } = Route.useSearch();

  if (method.startsWith("LinkID=")) {
    return <PaymentLinkPage linkId={method.slice("LinkID=".length)} />;
  }

  return <CustomerPortal initialMethodId={method} formSlug={form} preview={preview} />;
}

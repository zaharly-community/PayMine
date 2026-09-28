import { createFileRoute } from "@tanstack/react-router";

import { PaymentLinkPage } from "../-components/payment-link-page";
import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/$method")({
  component: RouteComponent,
});

function RouteComponent() {
  const { method } = Route.useParams();

  if (method.startsWith("LinkID=")) {
    return <PaymentLinkPage linkId={method.slice("LinkID=".length)} />;
  }

  return <CustomerPortal initialMethodId={method} />;
}

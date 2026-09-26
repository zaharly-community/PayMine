import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/$method")({
  component: RouteComponent,
});

function RouteComponent() {
  const { method } = Route.useParams();

  return <CustomerPortal initialMethodId={method} />;
}

import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/ooredoo")({
  component: () => <CustomerPortal initialMethodId="ooredoo" />,
});

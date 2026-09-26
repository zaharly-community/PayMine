import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/d17")({
  component: () => <CustomerPortal initialMethodId="d17" />,
});

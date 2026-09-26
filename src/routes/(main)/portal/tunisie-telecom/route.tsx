import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/tunisie-telecom")({
  component: () => <CustomerPortal initialMethodId="tunisie-telecom" />,
});

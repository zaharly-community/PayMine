import { createFileRoute } from "@tanstack/react-router";

import { CustomerPortal } from "../-components/customer-portal";

export const Route = createFileRoute("/(main)/portal/flouci")({
  component: () => <CustomerPortal initialMethodId="flouci" />,
});

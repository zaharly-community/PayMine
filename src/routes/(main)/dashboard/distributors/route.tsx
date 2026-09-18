import { createFileRoute } from "@tanstack/react-router";

import { distributors } from "./-components/data";
import { Distributors } from "./-components/distributors";

export const Route = createFileRoute("/(main)/dashboard/distributors")({
  component: Page,
});

function Page() {
  return <Distributors distributors={distributors} />;
}

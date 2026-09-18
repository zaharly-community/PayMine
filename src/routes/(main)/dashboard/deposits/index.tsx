import { createFileRoute } from "@tanstack/react-router";

import { deposits } from "./-components/data";
import { Deposits } from "./-components/deposits";

export const Route = createFileRoute("/(main)/dashboard/deposits/")({
  component: Page,
});

function Page() {
  return <Deposits deposits={deposits} />;
}

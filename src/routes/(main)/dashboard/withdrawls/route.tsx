import { createFileRoute } from "@tanstack/react-router";

import { withdrawls } from "./-components/data";
import { Withdrawls } from "./-components/withdrawls";

export const Route = createFileRoute("/(main)/dashboard/withdrawls")({
  component: Page,
});

function Page() {
  return <Withdrawls withdrawls={withdrawls} />;
}

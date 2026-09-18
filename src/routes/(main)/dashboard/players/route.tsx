import { createFileRoute } from "@tanstack/react-router";

import { players } from "./-components/data";
import { Players } from "./-components/players";

export const Route = createFileRoute("/(main)/dashboard/players")({
  component: Page,
});

function Page() {
  return <Players players={players} />;
}

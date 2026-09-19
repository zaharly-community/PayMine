import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { players } from "./-components/data";
import { Players } from "./-components/players";

export const Route = createFileRoute("/(main)/dashboard/players")({
  component: Page,
});

function Page() {
  const { pathname } = useLocation();
  if (pathname !== "/dashboard/players") return <Outlet />;
  return <Players players={players} />;
}

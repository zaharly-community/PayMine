import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/deposits")({
  component: Page,
});

function Page() {
  return <Outlet />;
}

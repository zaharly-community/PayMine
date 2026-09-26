import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return <Outlet />;
}

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(main)/dashboard/deposits/depoist-details",
)({
  component: () => <Outlet />,
});

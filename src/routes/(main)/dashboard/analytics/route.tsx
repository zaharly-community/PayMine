import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/analytics")({
  component: AnalyticsLayout,
});

function AnalyticsLayout() {
  return <Outlet />;
}

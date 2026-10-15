import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/portal")({
  component: LegacyPortalRedirect,
});

function LegacyPortalRedirect() {
  return <Navigate to="/dashboard/client-portal" replace />;
}

import { createFileRoute } from "@tanstack/react-router";

import { RoleDashboard } from "./-components/role-dashboard";
import { useAuth } from "@/stores/auth/auth-provider";

export const Route = createFileRoute("/(main)/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <RoleDashboard role={user.role} />;
}

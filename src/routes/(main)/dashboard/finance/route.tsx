import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/finance")({
  component: Page,
});

function Page() {
  const { pathname } = useLocation();

  if (pathname === "/dashboard/finance") {
    return <Navigate to="/dashboard/finance/transactions" />;
  }

  return <Outlet />;
}

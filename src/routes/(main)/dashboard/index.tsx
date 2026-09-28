import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </div>
    </div>
  );
}

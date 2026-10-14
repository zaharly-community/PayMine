import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/analytics/disagreements")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/disagreements", replace: true });
  },
});

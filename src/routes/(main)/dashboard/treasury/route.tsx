import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/treasury")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/remittance" });
  },
});

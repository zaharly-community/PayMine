import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/finance")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/finance/transactions",
    });
  },
});

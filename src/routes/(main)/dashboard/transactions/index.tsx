import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(main)/dashboard/transactions/")({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
      </div>
    </div>
  );
}

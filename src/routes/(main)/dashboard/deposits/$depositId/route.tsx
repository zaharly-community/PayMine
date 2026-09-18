import { createFileRoute } from "@tanstack/react-router";

import { deposits } from "../-components/data";
import { TransactionDetail } from "../-components/transaction-detail";

export const Route = createFileRoute("/(main)/dashboard/deposits/$depositId")({
  component: Page,
});

function Page() {
  const { depositId } = Route.useParams();
  const deposit = deposits.find((item) => item.id === depositId);

  if (!deposit) {
    return (
      <div className="flex min-h-full items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Transaction not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested deposit transaction could not be found.
          </p>
          <a
            href="/dashboard/deposits"
            className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
          >
            Back to deposits
          </a>
        </div>
      </div>
    );
  }

  return <TransactionDetail deposit={deposit} />;
}

import * as React from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  ShieldAlert,
  WalletMinimal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

import { distributors, treasuryAccounts } from "../../../../distributors/-components/data";

export function PrimaryAccount() {
  const [operation, setOperation] = React.useState<"agent-fund" | "agent-recover" | "supervisor-settle" | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = React.useState(distributors[0]?.id ?? "");
  const [amount, setAmount] = React.useState("");

  const agents = distributors.filter((distributor) => distributor.type === "Agent" && distributor.status === "Active");
  const supervisors = distributors.filter(
    (distributor) => distributor.type === "Supervisor" && distributor.status === "Active",
  );
  const mismatches = treasuryAccounts.filter((account) => account.reconciliationStatus === "Mismatch");

  const selectedDistributor =
    distributors.find((distributor) => distributor.id === selectedDistributorId) ??
    (operation === "supervisor-settle" ? supervisors[0] : agents[0]);

  const isAgent = operation === "agent-fund" || operation === "agent-recover";
  const numericAmount = Number(amount);
  const maxAmount =
    operation === "agent-recover" || operation === "supervisor-settle"
      ? selectedDistributor?.balance ?? 0
      : Infinity;

  const canSubmit =
    Boolean(selectedDistributor) &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= maxAmount;

  const openOperation = (next: NonNullable<typeof operation>) => {
    const defaultDistributor =
      next === "supervisor-settle" ? supervisors[0] : agents[0];

    setSelectedDistributorId(defaultDistributor?.id ?? "");
    setAmount("");
    setOperation(next);
  };

  const closeOperation = (open: boolean) => {
    if (!open) {
      setOperation(null);
      setAmount("");
    }
  };

  return (
    <>
      <div className="group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]">
        <div className="grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing)">
          <div className="font-heading text-base leading-snug font-medium">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-content-center rounded-sm bg-muted">
                <WalletMinimal className="size-5" />
              </span>
              Distributor Treasury
            </div>
          </div>
        </div>

        <div className="px-(--card-spacing)">
          <div className="space-y-0.5">
            <p className="font-medium text-xl tabular-nums">{formatCurrency(42680, { noDecimals: true })}</p>
            <p className="text-muted-foreground text-xs">Available for distributor operations</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-muted/20 px-2.5 py-2">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Agent funding</span>
              <span className="mt-0.5 block text-sm font-semibold tabular-nums">
                {formatCurrency(12450, { noDecimals: true })}
              </span>
            </div>
            <div className="rounded-lg border bg-muted/20 px-2.5 py-2">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Supervisor ledger</span>
              <span className="mt-0.5 block text-sm font-semibold tabular-nums">
                {formatCurrency(30230, { noDecimals: true })}
              </span>
            </div>
          </div>

          {mismatches.length > 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-2 text-[11px] text-red-600 dark:text-red-400">
              <ShieldAlert className="size-3.5 shrink-0" />
              <span className="truncate">
                {mismatches.length} provider account{mismatches.length > 1 ? "s" : ""} need reconciliation
              </span>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button className="flex-1" size="sm" onClick={() => openOperation("agent-fund")}>
              <ArrowDownToLine />
              Fund Agent
            </Button>
            <Button className="flex-1" size="sm" variant="outline" onClick={() => openOperation("supervisor-settle")}>
              <ArrowUpFromLine />
              Settle Supervisor
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>{agents.length} active agents</span>
            <span>{supervisors.length} active supervisors</span>
          </div>
        </div>
      </div>

      <Dialog open={operation !== null} onOpenChange={closeOperation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {operation === "agent-fund"
                ? "Fund Agent wallet"
                : operation === "agent-recover"
                  ? "Recover Agent funds"
                  : "Settle Supervisor earnings"}
            </DialogTitle>
            <DialogDescription>
              {operation === "agent-fund"
                ? "Add funds to an Agent's pre-funded fee wallet. This is separate from shared provider accounts."
                : operation === "agent-recover"
                  ? "Recover available funds from an Agent's pre-funded wallet with an auditable adjustment."
                  : "Settle an amount from a Supervisor's transaction ledger without changing the underlying provider account balance."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {operation === "agent-fund" || operation === "agent-recover" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={operation === "agent-fund" ? "default" : "outline"}
                  onClick={() => openOperation("agent-fund")}
                >
                  <ArrowDownToLine />
                  Fund Agent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={operation === "agent-recover" ? "default" : "outline"}
                  onClick={() => openOperation("agent-recover")}
                >
                  <ArrowUpFromLine />
                  Recover
                </Button>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="dashboard-distributor">
                Distributor
              </label>
              <select
                id="dashboard-distributor"
                value={selectedDistributor?.id ?? ""}
                onChange={(event) => setSelectedDistributorId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {(operation === "supervisor-settle" ? supervisors : agents).map((distributor) => (
                  <option key={distributor.id} value={distributor.id}>
                    {distributor.name} · {distributor.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  Current
                </span>
                <span className="mt-1 block text-sm font-semibold tabular-nums">
                  {formatCurrency(selectedDistributor?.balance ?? 0)}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                  Operation
                </span>
                <span className="mt-1 block text-sm font-semibold">
                  {operation === "agent-fund"
                    ? "Credit"
                    : operation === "agent-recover"
                      ? "Debit"
                      : "Settlement"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="dashboard-distributor-amount">
                Amount
              </label>
              <Input
                id="dashboard-distributor-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
              {(operation === "agent-recover" || operation === "supervisor-settle") && selectedDistributor ? (
                <p className="text-[11px] text-muted-foreground">
                  Maximum available: {formatCurrency(selectedDistributor.balance)}
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 text-[11px] leading-4 text-muted-foreground">
              UI-only template: the operation is shown as a ledger action and does not call a provider or backend.
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Landmark className="size-3.5" />
                {isAgent ? "Agent funding model" : "Supervisor ledger model"}
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => closeOperation(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={!canSubmit} onClick={() => closeOperation(false)}>
                  {operation === "agent-fund"
                    ? "Record funding"
                    : operation === "agent-recover"
                      ? "Record recovery"
                      : "Record settlement"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

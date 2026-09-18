import * as React from "react";

import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Landmark,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import {
  treasuryAccounts,
  type DistributorRow,
  type TreasuryAccount,
} from "./data";

type TreasuryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributors: DistributorRow[];
};

type LedgerItem = {
  id: string;
  type: "Deposit" | "Withdrawal" | "Settlement" | "Manual review";
  reference: string;
  amount: number;
  direction: "in" | "out";
  createdAt: string;
  note?: string;
};

const ledgerByAccount: Record<string, LedgerItem[]> = {
  "treasury-d17": [
    { id: "LED-1701", type: "Deposit", reference: "DEP-02026002", amount: 42.45, direction: "in", createdAt: "18 Sep, 09:39 AM" },
    { id: "LED-1702", type: "Deposit", reference: "DEP-02026013", amount: 101.23, direction: "in", createdAt: "17 Sep, 10:15 AM" },
    { id: "LED-1703", type: "Withdrawal", reference: "WDL-02026009", amount: 352.67, direction: "out", createdAt: "17 Sep, 03:47 AM" },
    {
      id: "LED-1704",
      type: "Manual review",
      reference: "REV-00041",
      amount: 1075,
      direction: "out",
      createdAt: "18 Sep, 04:32 PM",
      note: "Provider balance lower than expected",
    },
  ],
  "treasury-flouci": [
    { id: "LED-101", type: "Deposit", reference: "DEP-02026001", amount: 185.23, direction: "in", createdAt: "18 Sep, 09:51 AM" },
    { id: "LED-102", type: "Withdrawal", reference: "WDL-02026001", amount: 185.23, direction: "out", createdAt: "18 Sep, 10:12 AM" },
    { id: "LED-103", type: "Settlement", reference: "SET-0018", amount: 2500, direction: "out", createdAt: "17 Sep, 06:00 PM" },
  ],
  "treasury-kashy": [
    { id: "LED-201", type: "Deposit", reference: "DEP-02026003", amount: 98.65, direction: "in", createdAt: "18 Sep, 08:29 AM" },
    { id: "LED-202", type: "Withdrawal", reference: "WDL-02026007", amount: 165.05, direction: "out", createdAt: "17 Sep, 01:55 PM" },
    { id: "LED-203", type: "Settlement", reference: "SET-0016", amount: 1200, direction: "out", createdAt: "17 Sep, 05:30 PM" },
  ],
  "treasury-visa": [
    { id: "LED-301", type: "Deposit", reference: "DEP-02026004", amount: 533.79, direction: "in", createdAt: "18 Sep, 06:21 AM" },
    { id: "LED-302", type: "Withdrawal", reference: "WDL-02026004", amount: 533.79, direction: "out", createdAt: "18 Sep, 07:52 AM" },
    {
      id: "LED-303",
      type: "Manual review",
      reference: "REV-00038",
      amount: 350,
      direction: "out",
      createdAt: "18 Sep, 04:21 PM",
      note: "Pending provider-side verification",
    },
  ],
  "treasury-mastercard": [
    { id: "LED-401", type: "Deposit", reference: "DEP-02026006", amount: 32.51, direction: "in", createdAt: "18 Sep, 03:18 AM" },
    { id: "LED-402", type: "Settlement", reference: "SET-0015", amount: 1800, direction: "out", createdAt: "17 Sep, 04:20 PM" },
  ],
  "treasury-e-dinar": [
    { id: "LED-501", type: "Deposit", reference: "DEP-02026008", amount: 206.47, direction: "in", createdAt: "17 Sep, 04:10 PM" },
    { id: "LED-502", type: "Withdrawal", reference: "WDL-02026008", amount: 206.47, direction: "out", createdAt: "17 Sep, 04:55 PM" },
  ],
};

function getGap(account: TreasuryAccount) {
  return account.actualBalance - account.balance;
}

function StatusBadge({ account }: { account: TreasuryAccount }) {
  const mismatch = account.reconciliationStatus === "Mismatch";
  const pending = account.reconciliationStatus === "Pending check";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full",
        mismatch
          ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
          : pending
            ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      {mismatch ? <ShieldAlert className="size-3" /> : pending ? <Clock3 className="size-3" /> : <CheckCircle2 className="size-3" />}
      {account.reconciliationStatus}
    </Badge>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("mt-1 block text-sm font-semibold tabular-nums", className)}>{value}</span>
    </div>
  );
}

export function TreasuryDialog({ open, onOpenChange, distributors }: TreasuryDialogProps) {
  const [selectedId, setSelectedId] = React.useState(treasuryAccounts[0]?.id ?? "");
  const [settlementAmount, setSettlementAmount] = React.useState("");

  const selected = treasuryAccounts.find((account) => account.id === selectedId) ?? treasuryAccounts[0];
  if (!selected) return null;

  const gap = getGap(selected);
  const available = Math.max(0, selected.balance - selected.reservedBalance);
  const ledger = ledgerByAccount[selected.id] ?? [];
  const supervisors = distributors.filter((distributor) => distributor.type === "Supervisor");

  const assignedSupervisors = supervisors.filter((_, index) => {
    const accountIndex = treasuryAccounts.findIndex((account) => account.id === selected.id);
    return (index + accountIndex) % 2 === 0;
  });

  const canPrepareSettlement =
    selected.reconciliationStatus === "Reconciled" &&
    Number.isFinite(Number(settlementAmount)) &&
    Number(settlementAmount) > 0 &&
    Number(settlementAmount) <= available;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Landmark className="size-4 text-primary" />
                Treasury & reconciliation
              </DialogTitle>
              <DialogDescription className="mt-1">
                Monitor shared provider accounts, detect balance differences, review access, and prepare settlement only after reconciliation.
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              Frontend demo
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 md:grid-cols-[300px_1fr]">
          <div className="border-b md:border-r md:border-b-0">
            <div className="border-b px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider accounts</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Shared project-owned payment accounts.
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {treasuryAccounts.map((account) => {
                const accountGap = getGap(account);
                const active = account.id === selected.id;

                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(account.id);
                      setSettlementAmount("");
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary/15"
                        : "border-transparent hover:border-border hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{account.name}</span>
                          {account.shared ? (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Shared</span>
                          ) : null}
                        </div>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{account.category} · {account.currency}</span>
                      </div>
                      <StatusBadge account={account} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Expected</span>
                      <span className="font-medium tabular-nums">{account.balance.toLocaleString("en-US", { style: "currency", currency: account.currency })}</span>
                    </div>
                    {accountGap !== 0 ? (
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Gap</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{accountGap.toLocaleString("en-US", { style: "currency", currency: account.currency })}</span>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{selected.name}</h3>
                    <StatusBadge account={selected} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last provider check: {selected.lastReconciledAt}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <RefreshCw />
                  Check now
                </Button>
              </div>

              {selected.reconciliationStatus === "Mismatch" ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Reconciliation difference detected</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The provider balance is lower than the expected internal balance. Settlement is blocked until the difference is reviewed.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-red-500/20 text-red-600 dark:text-red-400">
                          Gap {gap.toLocaleString("en-US", { style: "currency", currency: selected.currency })}
                        </Badge>
                        <Badge variant="secondary">
                          Reserved {selected.reservedBalance.toLocaleString("en-US", { style: "currency", currency: selected.currency })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Expected balance" value={selected.balance.toLocaleString("en-US", { style: "currency", currency: selected.currency })} />
                <Metric label="Reserved / pending" value={selected.reservedBalance.toLocaleString("en-US", { style: "currency", currency: selected.currency })} />
                <Metric label="Available for settlement" value={available.toLocaleString("en-US", { style: "currency", currency: selected.currency })} />
                <Metric
                  label="Actual provider balance"
                  value={selected.actualBalance.toLocaleString("en-US", { style: "currency", currency: selected.currency })}
                  className={gap < 0 ? "text-red-600 dark:text-red-400" : undefined}
                />
              </div>

              <div className="rounded-xl border">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Provider access</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Supervisors with permission to log in and process this shared account.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {assignedSupervisors.length} users
                  </div>
                </div>

                <div className="divide-y">
                  {assignedSupervisors.slice(0, 5).map((supervisor) => (
                    <div key={supervisor.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{supervisor.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{supervisor.id} · @{supervisor.username}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 />
                          Login access
                        </Badge>
                        <Button type="button" size="icon-sm" variant="ghost" title="View access">
                          <LockKeyhole className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">Recent treasury activity</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Keep provider-side movements and internal transaction references together.
                  </p>
                </div>

                <div className="divide-y">
                  {ledger.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full",
                          item.direction === "in" ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600",
                        )}
                      >
                        {item.direction === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{item.type}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{item.reference}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.note ?? item.createdAt}
                        </p>
                      </div>
                      <span className={cn("shrink-0 text-sm font-semibold tabular-nums", item.direction === "in" ? "text-emerald-600" : "text-orange-600")}>
                        {item.direction === "in" ? "+" : "-"}
                        {item.amount.toLocaleString("en-US", { style: "currency", currency: selected.currency })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Settlement</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Settlement should use the reconciled, available balance only.
                    </p>
                  </div>
                  {selected.reconciliationStatus !== "Reconciled" ? (
                    <Badge variant="outline" className="border-red-500/20 text-red-600 dark:text-red-400">
                      Blocked
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3 p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label className="text-xs font-medium" htmlFor={"treasury-settlement-" + selected.id}>
                        Amount to settle
                      </label>
                      <Input
                        id={"treasury-settlement-" + selected.id}
                        type="number"
                        min="0"
                        step="0.01"
                        value={settlementAmount}
                        onChange={(event) => setSettlementAmount(event.target.value)}
                        placeholder="0.00"
                        disabled={selected.reconciliationStatus !== "Reconciled"}
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Maximum available: {available.toLocaleString("en-US", { style: "currency", currency: selected.currency })}
                      </p>
                    </div>
                    <Button type="button" disabled={!canPrepareSettlement}>
                      Prepare settlement
                    </Button>
                  </div>
                  {selected.reconciliationStatus !== "Reconciled" ? (
                    <div className="rounded-md bg-muted/40 px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                      Settlement stays unavailable while a reconciliation gap or pending provider check exists.
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted/40 px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                      This is a UI-only settlement draft. No provider or account balance is changed here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

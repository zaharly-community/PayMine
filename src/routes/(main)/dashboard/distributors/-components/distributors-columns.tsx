import * as React from "react";

import { Link } from "@tanstack/react-router";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Check, Eye, Minus, Plus, Trash2, WalletCards } from "lucide-react";

import { cn } from "cn";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { DistributorRow } from "./data";

type DistributorColumnActions = {
  onSuspend: (distributorId: string) => void;
  onDelete: (distributorId: string) => void;
  onWalletAdjust: (distributorId: string, delta: number, reason: string) => void;
};

function getAvatarTone(name: string) {
  const tones = [
    "[&_[data-slot=avatar-fallback]]:bg-amber-100 [&_[data-slot=avatar-fallback]]:text-amber-700 after:border-amber-200 dark:[&_[data-slot=avatar-fallback]]:bg-amber-500/15 dark:[&_[data-slot=avatar-fallback]]:text-amber-300 dark:after:border-amber-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-orange-100 [&_[data-slot=avatar-fallback]]:text-orange-700 after:border-orange-200 dark:[&_[data-slot=avatar-fallback]]:bg-orange-500/15 dark:[&_[data-slot=avatar-fallback]]:text-orange-300 dark:after:border-orange-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-rose-100 [&_[data-slot=avatar-fallback]]:text-rose-700 after:border-rose-200 dark:[&_[data-slot=avatar-fallback]]:bg-rose-500/15 dark:[&_[data-slot=avatar-fallback]]:text-rose-300 dark:after:border-rose-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-pink-100 [&_[data-slot=avatar-fallback]]:text-pink-700 after:border-pink-200 dark:[&_[data-slot=avatar-fallback]]:bg-pink-500/15 dark:[&_[data-slot=avatar-fallback]]:text-pink-300 dark:after:border-pink-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-violet-100 [&_[data-slot=avatar-fallback]]:text-violet-700 after:border-violet-200 dark:[&_[data-slot=avatar-fallback]]:bg-violet-500/15 dark:[&_[data-slot=avatar-fallback]]:text-violet-300 dark:after:border-violet-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-indigo-100 [&_[data-slot=avatar-fallback]]:text-indigo-700 after:border-indigo-200 dark:[&_[data-slot=avatar-fallback]]:bg-indigo-500/15 dark:[&_[data-slot=avatar-fallback]]:text-indigo-300 dark:after:border-indigo-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-sky-100 [&_[data-slot=avatar-fallback]]:text-sky-700 after:border-sky-200 dark:[&_[data-slot=avatar-fallback]]:bg-sky-500/15 dark:[&_[data-slot=avatar-fallback]]:text-sky-300 dark:after:border-sky-500/20",
    "[&_[data-slot=avatar-fallback]]:bg-emerald-100 [&_[data-slot=avatar-fallback]]:text-emerald-700 after:border-emerald-200 dark:[&_[data-slot=avatar-fallback]]:bg-emerald-500/15 dark:[&_[data-slot=avatar-fallback]]:text-emerald-300 dark:after:border-emerald-500/20",
  ];

  return tones[name.length % tones.length];
}

function DistributorCell({ distributor }: { distributor: DistributorRow }) {
  return (
    <div className="flex min-w-52 items-center gap-3">
      <Avatar size="default" className={cn("shrink-0 font-medium", getAvatarTone(distributor.name))}>
        <AvatarImage
          src={distributor.avatarUrl || undefined}
          alt=""
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>{getInitials(distributor.name)}</AvatarFallback>
        {distributor.verified ? (
          <AvatarBadge className="bg-blue-600 text-blue-950 [&>svg]:text-white">
            <Check />
          </AvatarBadge>
        ) : null}
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground text-sm">{distributor.name}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: DistributorRow["type"] }) {
  const isSupervisor = role === "Supervisor";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-sm border px-1.5 py-0.5 font-medium text-xs",
        isSupervisor
          ? "border-sky-500/10 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          : "border-rose-500/10 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: DistributorRow["status"] }) {
  const suspended = status === "Suspended";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-sm px-2 py-0.5 font-medium",
        suspended
          ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      <span className={cn("size-1.5 rounded-full", suspended ? "bg-orange-500" : "bg-emerald-500")} />
      {status === "Suspended" ? "Suspended" : "Active"}
    </Badge>
  );
}

function IconButton({
  label,
  children,
  onClick,
  className,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={label}
      title={label}
      className={cn(
        "size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function DistributorActions({
  distributor,
  onSuspend,
  onDelete,
  onWalletAdjust,
}: {
  distributor: DistributorRow;
} & DistributorColumnActions) {
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [walletMode, setWalletMode] = React.useState<"add" | "withdraw">("add");
  const [walletAmount, setWalletAmount] = React.useState("");
  const [walletReason, setWalletReason] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");

  const amount = Number(walletAmount);
  const maxAmount = walletMode === "add" ? Number.POSITIVE_INFINITY : distributor.balance;
  const canApplyWallet =
    distributor.type === "Agent" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= maxAmount &&
    walletReason.trim().length >= 5;

  const signedDelta = walletMode === "add" ? amount : -amount;
  const distributorAfter = distributor.balance + (Number.isFinite(amount) ? signedDelta : 0);
  const isDelete = distributor.status === "Suspended";
  const canConfirmAction = confirmation === distributor.id;

  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setConfirmation("");
  };

  const closeWallet = (open: boolean) => {
    setWalletOpen(open);
    if (!open) {
      setWalletAmount("");
      setWalletReason("");
      setWalletMode("add");
    }
  };

  const recentAudit = distributor.walletAudit ?? [];
  const supervisorMethods = distributor.configuration?.paymentMethods ?? [];
  const canLoginToMethod = (method: (typeof supervisorMethods)[number]) =>
    method.accessGranted !== false;

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        <Link
          to="/dashboard/distributors/account"
          aria-label={"View " + distributor.name}
          title={"View " + distributor.name}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Eye className="size-3.5" />
        </Link>

        <IconButton
          label={distributor.type === "Agent" ? "Control funding wallet" : "View wallet ledger"}
          onClick={() => setWalletOpen(true)}
        >
          <WalletCards className="size-3.5" />
        </IconButton>

        <IconButton
          label={isDelete ? "Delete distributor" : "Suspend distributor"}
          className={
            isDelete
              ? "text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
              : "text-orange-500 hover:bg-orange-500/10 hover:text-orange-600 dark:text-orange-400"
          }
          onClick={() => setConfirmOpen(true)}
        >
          {isDelete ? <Trash2 className="size-3.5" /> : <Ban className="size-3.5" />}
        </IconButton>
      </div>

      <Dialog open={walletOpen} onOpenChange={closeWallet}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {distributor.type === "Agent" ? "Agent funding wallet" : "Supervisor wallet & ledger"}
            </DialogTitle>
            <DialogDescription>
              {distributor.type === "Agent"
                ? "This is a pre-funded fee wallet. Shared payment methods are separate and are never used for manual wallet adjustments."
                : "This wallet is transaction-driven. Manual add or deduct operations are disabled; deposits and withdrawals must create their own ledger entries."}
            </DialogDescription>
          </DialogHeader>

          {distributor.type === "Agent" ? (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/35 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={walletMode === "add" ? "default" : "ghost"}
                  onClick={() => setWalletMode("add")}
                >
                  <Plus />
                  Add balance
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={walletMode === "withdraw" ? "default" : "ghost"}
                  onClick={() => setWalletMode("withdraw")}
                >
                  <Minus />
                  Deduct balance
                </Button>
              </div>

              <div className="rounded-lg border bg-muted/20 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Current funding wallet</span>
                    <span className="mt-0.5 block text-lg font-semibold tabular-nums">{formatCurrency(distributor.balance)}</span>
                  </div>
                  <span className="rounded-full border bg-background px-2 py-1 text-[10px] text-muted-foreground">Pre-funded</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium" htmlFor={"wallet-amount-" + distributor.id}>
                    Amount
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Available <strong className="font-medium text-foreground">{formatCurrency(distributor.balance)}</strong>
                  </span>
                </div>
                <Input
                  id={"wallet-amount-" + distributor.id}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={walletAmount}
                  onChange={(event) => setWalletAmount(event.target.value)}
                  placeholder="0.00"
                />

                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 500, 1000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      disabled={walletMode === "withdraw" && quickAmount > distributor.balance}
                      onClick={() => setWalletAmount(String(quickAmount))}
                    >
                      {quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={"wallet-reason-" + distributor.id}>
                  Reason <span className="font-normal text-muted-foreground">(required)</span>
                </label>
                <Input
                  id={"wallet-reason-" + distributor.id}
                  value={walletReason}
                  onChange={(event) => setWalletReason(event.target.value)}
                  placeholder="e.g. Monthly security top-up"
                  maxLength={255}
                />
                {walletReason.trim().length > 0 && walletReason.trim().length < 5 ? (
                  <p className="text-xs text-destructive">Enter at least 5 characters so the adjustment is auditable.</p>
                ) : null}
              </div>

              <div className="grid grid-cols-3 items-center gap-3 rounded-lg border bg-muted/20 px-3 py-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Current</span>
                  <span className="mt-0.5 block text-sm font-medium tabular-nums">{formatCurrency(distributor.balance)}</span>
                </div>
                <div className="text-center text-muted-foreground text-lg">→</div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">After</span>
                  <span className="mt-0.5 block text-sm font-semibold tabular-nums">{formatCurrency(distributorAfter)}</span>
                </div>
              </div>

              <div className="rounded-md border border-dashed px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                Every manual funding change is recorded with the operator, timestamp, amount and reason. It is an audit event, not a direct overwrite of the balance.
              </div>

              {recentAudit.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent wallet audit</p>
                  <div className="space-y-1.5">
                    {recentAudit.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <span className="block font-medium">{entry.reason}</span>
                          <span className="text-muted-foreground">{entry.createdAt}</span>
                        </div>
                        <span className={cn("shrink-0 font-semibold tabular-nums", entry.action === "Credit" ? "text-emerald-600" : "text-orange-600")}>
                          {entry.action === "Credit" ? "+" : "-"}{formatCurrency(entry.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => closeWallet(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!canApplyWallet}
                  onClick={() => {
                    onWalletAdjust(distributor.id, signedDelta, walletReason.trim());
                    closeWallet(false);
                  }}
                >
                  {walletMode === "add" ? "Record funding" : "Record deduction"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/20 px-3 py-3">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Wallet balance</span>
                  <span className="mt-0.5 block text-lg font-semibold tabular-nums">{formatCurrency(distributor.balance)}</span>
                </div>
                <div className="rounded-lg border bg-muted/20 px-3 py-3">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Players</span>
                  <span className="mt-0.5 block text-lg font-semibold tabular-nums">{distributor.players}</span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-3">
                <p className="text-sm font-medium">Transaction-driven balance</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A Supervisor never receives a manual wallet top-up through this control. Deposits and withdrawals create immutable ledger entries that reference the exact transaction and shared provider account used.
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Authorized provider accounts</p>
                {supervisorMethods.length > 0 ? (
                  <div className="space-y-2">
                    {supervisorMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                        <div className="min-w-0">
                          <span className="block text-sm font-medium">{method.name}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{method.category}</span>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          {canLoginToMethod(method) ? "Login access" : "No access"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
                    No provider accounts are assigned to this Supervisor.
                  </div>
                )}
              </div>

              {recentAudit.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manual audit events</p>
                  <div className="space-y-1.5">
                    {recentAudit.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <span className="block font-medium">{entry.reason}</span>
                          <span className="text-muted-foreground">{entry.createdAt}</span>
                        </div>
                        <span className={cn("shrink-0 font-semibold tabular-nums", entry.action === "Credit" ? "text-emerald-600" : "text-orange-600")}>
                          {entry.action === "Credit" ? "+" : "-"}{formatCurrency(entry.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end border-t pt-4">
                <Button type="button" variant="outline" onClick={() => closeWallet(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={closeConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{isDelete ? "Delete distributor?" : "Suspend distributor?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDelete
                ? "This will permanently remove the distributor from the dashboard. Re-enter the Distributor ID below to confirm."
                : "This will suspend the distributor and prevent active processing. Re-enter the Distributor ID below to confirm."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">{distributor.id}</div>
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Re-enter Distributor ID"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={isDelete ? "destructive" : "default"}
              disabled={!canConfirmAction}
              onClick={() => {
                if (isDelete) onDelete(distributor.id);
                else onSuspend(distributor.id);
                setConfirmation("");
                setConfirmOpen(false);
              }}
            >
              {isDelete ? <Trash2 /> : <Ban />}
              {isDelete ? "Confirm delete" : "Confirm suspension"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function createDistributorsColumns(actions: DistributorColumnActions): ColumnDef<DataTableFeatures, DistributorRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => row.name + " " + row.email + " " + row.username + " " + row.id,
      filterFn: "includesString",
      enableHiding: true,
    },
    {
      accessorKey: "id",
      header: "Distributor ID",
      cell: ({ row }) => (
        <div className="whitespace-nowrap font-mono text-xs tracking-wide text-foreground">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Distributor",
      cell: ({ row }) => <DistributorCell distributor={row.original} />,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <span className="whitespace-nowrap text-sm">@{row.original.username || "—"}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: "joinedDate",
      header: "Joined",
      cell: ({ row }) => <span className="whitespace-nowrap text-sm">{row.original.joinedDate}</span>,
    },
    {
      accessorKey: "type",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.type} />,
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Wallet Balance</div>,
      cell: ({ row }) => (
        <div className="pr-2 text-right font-medium text-sm tabular-nums">{formatCurrency(row.original.balance)}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DistributorActions
          distributor={row.original}
          onSuspend={actions.onSuspend}
          onDelete={actions.onDelete}
          onWalletAdjust={actions.onWalletAdjust}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}

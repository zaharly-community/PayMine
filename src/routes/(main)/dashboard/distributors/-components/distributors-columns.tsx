import * as React from "react";

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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { DistributorRow } from "./data";

type DistributorColumnActions = {
  onSuspend: (distributorId: string) => void;
  onDelete: (distributorId: string) => void;
  onWalletAdjust: (distributorId: string, delta: number) => void;
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
      <Avatar size="lg" className={cn("shrink-0 font-medium", getAvatarTone(distributor.name))}>
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
  const [viewOpen, setViewOpen] = React.useState(false);
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [walletMode, setWalletMode] = React.useState<"add" | "withdraw">("add");
  const [walletAmount, setWalletAmount] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");

  const isDelete = distributor.status === "Suspended";
  const amount = Number(walletAmount);
  const canApplyWallet = Number.isFinite(amount) && amount > 0 && (walletMode === "add" || amount <= distributor.balance);
  const canConfirmAction = confirmation === distributor.id;

  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setConfirmation("");
  };

  const closeWallet = (open: boolean) => {
    setWalletOpen(open);
    if (!open) {
      setWalletAmount("");
      setWalletMode("add");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        <IconButton label={"View " + distributor.name} onClick={() => setViewOpen(true)}>
          <Eye className="size-3.5" />
        </IconButton>

        <IconButton label={"Adjust wallet for " + distributor.name} onClick={() => setWalletOpen(true)}>
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Distributor details</DialogTitle>
            <DialogDescription>{distributor.name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5 text-sm">
            <div className="flex items-center gap-3 border-b pb-3">
              <Avatar size="lg" className={cn("shrink-0", getAvatarTone(distributor.name))}>
                <AvatarImage src={distributor.avatarUrl || undefined} alt="" referrerPolicy="no-referrer" />
                <AvatarFallback>{getInitials(distributor.name)}</AvatarFallback>
                {distributor.verified ? (
                  <AvatarBadge className="bg-blue-600 text-blue-950 [&>svg]:text-white">
                    <Check />
                  </AvatarBadge>
                ) : null}
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold">{distributor.name}</p>
                <p className="text-muted-foreground">@{distributor.username}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow label="Distributor ID" value={distributor.id} mono />
              <InfoRow label="Role" value={distributor.type} />
              <InfoRow label="Username" value={"@" + (distributor.username || "—")} />
              <InfoRow label="Email" value={distributor.email} />
              <InfoRow label="Joined" value={distributor.joinedDate} />
              <InfoRow label="Wallet balance" value={formatCurrency(distributor.balance)} />
              <InfoRow label="Status" value={distributor.status === "Suspended" ? "Suspended" : "Active"} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={walletOpen} onOpenChange={closeWallet}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust wallet balance</DialogTitle>
            <DialogDescription>
              {distributor.name} · Current balance {formatCurrency(distributor.balance)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={walletMode === "add" ? "default" : "outline"}
                onClick={() => setWalletMode("add")}
              >
                <Plus />
                Add balance
              </Button>
              <Button
                type="button"
                variant={walletMode === "withdraw" ? "default" : "outline"}
                onClick={() => setWalletMode("withdraw")}
              >
                <Minus />
                Withdraw balance
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor={"wallet-amount-" + distributor.id}>
                Amount
              </label>
              <Input
                id={"wallet-amount-" + distributor.id}
                type="number"
                min="0.01"
                step="0.01"
                value={walletAmount}
                onChange={(event) => setWalletAmount(event.target.value)}
                placeholder="0.00"
              />
              {walletMode === "withdraw" && amount > distributor.balance ? (
                <p className="text-xs text-destructive">Amount cannot exceed the current wallet balance.</p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => closeWallet(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canApplyWallet}
                onClick={() => {
                  onWalletAdjust(distributor.id, walletMode === "add" ? amount : -amount);
                  closeWallet(false);
                }}
              >
                {walletMode === "add" ? "Add funds" : "Withdraw funds"}
              </Button>
            </div>
          </div>
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

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-muted/35 px-3 py-2">
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("mt-0.5 block truncate font-medium text-sm", mono ? "font-mono text-xs" : "")}>{value}</span>
    </div>
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

import * as React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Check, Repeat2, Trash2, WalletCards } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { UserRow } from "./data";

type UserColumnActions = {
  onPlanChange: (userId: string, nextPackage: UserRow["package"]) => void;
  onWalletFund: (userId: string, amount: number, reason: string) => void;
  onDisable: (userId: string) => void;
  onDelete: (userId: string) => void;
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

function UserCell({ user }: { user: UserRow }) {
  return (
    <div className="flex min-w-52 items-center gap-3">
      <Avatar size="default" className={cn("shrink-0 font-medium", getAvatarTone(user.name))}>
        <AvatarImage src={user.avatarUrl || undefined} alt="" referrerPolicy="no-referrer" />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground text-sm">{user.name}</div>
        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
}

function PackageBadge({ packageName }: { packageName: UserRow["package"] }) {
  const tone =
    packageName === "Scale"
      ? "border-violet-500/10 bg-violet-500/10 text-violet-600 dark:text-violet-400"
      : packageName === "Growth"
        ? "border-sky-500/10 bg-sky-500/10 text-sky-600 dark:text-sky-400"
        : "border-muted-foreground/15 bg-muted/45 text-muted-foreground";

  return (
    <Badge variant="secondary" className={cn("rounded-sm border px-1.5 py-0.5 font-medium text-xs", tone)}>
      {packageName}
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserRow["status"] }) {
  const disabled = status === "Disabled";
  const pending = status === "Pending";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-sm px-2 py-0.5 font-medium",
        disabled
          ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
          : pending
            ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          disabled ? "bg-red-500" : pending ? "bg-orange-500" : "bg-emerald-500",
        )}
      />
      {status}
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

function UserActions({
  user,
  onPlanChange,
  onWalletFund,
  onDisable,
  onDelete,
}: { user: UserRow } & UserColumnActions) {
  const [planOpen, setPlanOpen] = React.useState(false);
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [nextPackage, setNextPackage] = React.useState<UserRow["package"]>(user.package);
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");

  const fundingAmount = Number(amount);
  const canFund =
    Number.isFinite(fundingAmount) && fundingAmount > 0 && reason.trim().length >= 5;

  const isDelete = user.status === "Disabled";
  const canConfirm = confirmation === user.id;

  const closeWallet = (open: boolean) => {
    setWalletOpen(open);
    if (!open) {
      setAmount("");
      setReason("");
    }
  };

  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setConfirmation("");
  };

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        <IconButton label={"Change plan for " + user.name} onClick={() => setPlanOpen(true)}>
          <Repeat2 className="size-3.5" />
        </IconButton>

        <IconButton label={"Fund wallet for " + user.name} onClick={() => setWalletOpen(true)}>
          <WalletCards className="size-3.5" />
        </IconButton>

        <IconButton
          label={isDelete ? "Delete user" : "Disable user"}
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

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change user plan</DialogTitle>
            <DialogDescription>
              Select a package for {user.name}. Current plan: {user.package}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select value={nextPackage} onValueChange={(value) => setNextPackage(value as UserRow["package"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Starter", "Growth", "Scale"] as const).map((packageName) => (
                  <SelectItem key={packageName} value={packageName}>
                    {packageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  onPlanChange(user.id, nextPackage);
                  setPlanOpen(false);
                }}
              >
                <Check />
                Save plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={walletOpen} onOpenChange={closeWallet}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fund wallet</DialogTitle>
            <DialogDescription>
              Add balance to {user.name}'s wallet and record the reason for the adjustment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="rounded-lg border bg-muted/20 px-3 py-3">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Current wallet balance</span>
              <span className="mt-0.5 block text-lg font-semibold tabular-nums">{formatCurrency(user.balance)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={"user-wallet-amount-" + user.id}>Amount</label>
              <Input
                id={"user-wallet-amount-" + user.id}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
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
                    onClick={() => setAmount(String(quickAmount))}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={"user-wallet-reason-" + user.id}>
                Reason <span className="font-normal text-muted-foreground">(required)</span>
              </label>
              <Input
                id={"user-wallet-reason-" + user.id}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. Account funding"
                maxLength={255}
              />
              {reason.trim().length > 0 && reason.trim().length < 5 ? (
                <p className="text-xs text-destructive">Enter at least 5 characters.</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => closeWallet(false)}>Cancel</Button>
              <Button
                disabled={!canFund}
                onClick={() => {
                  onWalletFund(user.id, fundingAmount, reason.trim());
                  closeWallet(false);
                }}
              >
                <WalletCards />
                Fund wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={closeConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{isDelete ? "Delete user?" : "Disable user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDelete
                ? "This will permanently remove the user from the dashboard. Re-enter the User ID below to confirm."
                : "This will disable the user and prevent active access. Re-enter the User ID below to confirm."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">{user.id}</div>
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Re-enter User ID"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={isDelete ? "destructive" : "default"}
              disabled={!canConfirm}
              onClick={() => {
                if (isDelete) onDelete(user.id);
                else onDisable(user.id);
                setConfirmation("");
                setConfirmOpen(false);
              }}
            >
              {isDelete ? <Trash2 /> : <Ban />}
              {isDelete ? "Confirm delete" : "Confirm disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function createUsersColumns(actions: UserColumnActions): ColumnDef<DataTableFeatures, UserRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => row.name + " " + row.email + " " + row.id + " " + row.package,
      filterFn: "includesString",
      enableHiding: true,
    },
    {
      accessorKey: "id",
      header: "User ID",
      cell: ({ row }) => (
        <div className="whitespace-nowrap font-mono text-xs tracking-wide text-foreground">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => <UserCell user={row.original} />,
    },
    {
      accessorKey: "joinedDate",
      header: "Joined",
      cell: ({ row }) => <span className="whitespace-nowrap text-sm">{row.original.joinedDate}</span>,
    },
    {
      accessorKey: "package",
      header: "Package",
      cell: ({ row }) => <PackageBadge packageName={row.original.package} />,
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
        <UserActions
          user={row.original}
          onPlanChange={actions.onPlanChange}
          onWalletFund={actions.onWalletFund}
          onDisable={actions.onDisable}
          onDelete={actions.onDelete}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}

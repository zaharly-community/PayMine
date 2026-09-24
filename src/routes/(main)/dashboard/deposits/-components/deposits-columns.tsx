import * as React from "react";

import { Link } from "@tanstack/react-router";

import type { ColumnDef } from "@tanstack/react-table";
import { parse } from "date-fns";
import {
  Ban,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  LoaderCircle,
  PencilLine,
  RotateCcw,
  XCircle,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { DepositRow, DepositStatus, VerificationStatus } from "./data";

export const processingLockedRows = new Set([
  "DEP-02026003",
  "DEP-02026007",
  "DEP-02026011",
  "DEP-02026016",
  "DEP-02026022",
]);

function PaymentMethodCell({ deposit }: { deposit: DepositRow }) {
  return (
    <div className="flex min-w-34 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-xs border bg-background">
        <img
          src={deposit.paymentMethodImage}
          alt=""
          className="size-full object-contain p-0.5"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="truncate text-sm">{deposit.paymentMethod}</span>
    </div>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config: Record<
    VerificationStatus,
    { icon: typeof Clock3; className: string }
  > = {
    Pending: {
      icon: Clock3,
      className: "border-border bg-muted/40 text-muted-foreground",
    },
    Processing: {
      icon: LoaderCircle,
      className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    Approved: {
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    Canceled: {
      icon: XCircle,
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    "Waiting Correction": {
      icon: PencilLine,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    "In Process": {
      icon: LoaderCircle,
      className: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 rounded-4xl px-1.5 py-0.5 font-medium",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-3!",
          status === "Processing" || status === "In Process" ? "animate-spin" : "",
        )}
      />
      {status}
    </Badge>
  );
}

function DepositStatusBadge({ status }: { status: DepositStatus }) {
  const config: Record<
    DepositStatus,
    { className: string; icon: typeof Clock3 }
  > = {
    Pending: {
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      icon: Clock3,
    },
    Processing: {
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
      icon: LoaderCircle,
    },
    Completed: {
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    Canceled: {
      className:
        "border-destructive/20 bg-destructive/10 text-destructive",
      icon: XCircle,
    },
  };

  const { className, icon: Icon } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-sm px-1.5 py-0.5 font-medium",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-3!",
          status === "Processing" ? "animate-spin" : "",
        )}
      />
      {status}
    </Badge>
  );
}

function ProcessorCell({
  processor,
}: {
  processor: DepositRow["processedBy"];
}) {
  return (
    <div className="flex min-w-42 items-center gap-2">
      <Avatar size="sm" className="shrink-0">
        <AvatarImage
          src={processor.image}
          alt=""
          referrerPolicy="no-referrer"
        />
        <AvatarFallback className="bg-muted text-[10px] font-medium">
          {getInitials(processor.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate font-medium text-sm">{processor.name}</span>
    </div>
  );
}

function DepositActions({ deposit }: { deposit: DepositRow }) {
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [canceled, setCanceled] = React.useState(
    deposit.depositStatus === "Canceled",
  );

  const canConfirmCancel = confirmation === deposit.id;

  const closeCancelDialog = (open: boolean) => {
    setCancelOpen(open);
    if (!open) setConfirmation("");
  };

  const downloadReceipt = () => {
    const receipt = [
      "Deposit Receipt",
      `Transaction: ${deposit.id}`,
      `Player: ${deposit.name}`,
      `Payment Method: ${deposit.paymentMethod}`,
      `Date: ${deposit.date}`,
      `Amount: ${formatCurrency(deposit.amount)}`,
      `Fees: ${deposit.feePercent > 0 ? `${deposit.feePercent}% - ${formatCurrency(deposit.feeAmount)}` : "Not concerned"}`,
      `Status: ${canceled ? "Canceled" : deposit.depositStatus}`,
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${deposit.id}-receipt.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        <Button
          type="button"
          aria-label={`Download receipt for ${deposit.id}`}
          title="Download receipt"
          className="size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:bg-muted hover:text-foreground"
          size="icon-sm"
          variant="ghost"
          onClick={downloadReceipt}
        >
          <Download className="size-3.5" />
        </Button>

        <Link
          to={getDepositDetailPath(deposit.paymentMethod)}
          aria-label={`Open deposit ${deposit.id} for processing`}
          title="Open deposit"
          className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Eye className="size-3.5" />
        </Link>

        {canceled ? (
          <Button
            type="button"
            aria-label={`Enable deposit ${deposit.id}`}
            title="Enable deposit"
            className="size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:bg-muted hover:text-foreground"
            size="icon-sm"
            variant="ghost"
            onClick={() => setCanceled(false)}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            aria-label={`Cancel deposit ${deposit.id}`}
            title="Cancel deposit"
            className="size-7 rounded-[min(var(--radius-md),12px)] text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            size="icon-sm"
            variant="ghost"
            onClick={() => setCancelOpen(true)}
          >
            <Ban className="size-3.5" />
          </Button>
        )}
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={closeCancelDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel deposit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will <strong>cancel</strong> the deposit. It will not
              delete the transaction. Re-enter the transaction number to
              confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
              {deposit.id}
            </div>
            <Input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Re-enter transaction number"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmation("")}>
              Keep deposit
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!canConfirmCancel}
              onClick={() => {
                setCanceled(true);
                setConfirmation("");
                setCancelOpen(false);
              }}
            >
              <Check />
              Confirm cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const voucherPaymentMethods = new Set(["Tunisie Telecom", "Orange", "Ooredoo"]);

function getDepositDetailPath(paymentMethod: DepositRow["paymentMethod"]) {
  return voucherPaymentMethods.has(paymentMethod)
    ? "/dashboard/deposits/depoist-details/voucher"
    : "/dashboard/deposits/depoist-details/";
}

export const depositsColumns: ColumnDef<DataTableFeatures, DepositRow>[] = [
  {
    id: "search",
    accessorFn: (row) =>
      `${row.name} ${row.email} ${row.id} ${row.paymentMethod}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    id: "depositId",
    accessorKey: "id",
    header: "Deposit ID",
    cell: ({ row }) => (
      <div className="font-mono text-foreground text-xs tracking-wide">
        {row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Player",
    cell: ({ row }) => (
      <div className="flex min-w-36 items-center gap-2.5">
        <Avatar size="sm" className="shrink-0">
          <AvatarFallback className="bg-muted text-[10px] font-medium">
            {getInitials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate font-medium text-sm">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => <PaymentMethodCell deposit={row.original} />,
  },
  {
    id: "date",
    accessorFn: (row) =>
      parse(row.date, "dd MMM yyyy, hh:mm a", new Date()).getTime(),
    header: "Date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm tabular-nums">
        {row.original.date}
      </div>
    ),
  },
  {
    accessorKey: "verificationStatus",
    header: "Verification Status",
    cell: ({ row }) => (
      <VerificationBadge status={row.original.verificationStatus} />
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="pr-2 text-right font-medium text-sm tabular-nums">
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },
  {
    id: "fees",
    accessorFn: (row) => row.feeAmount,
    header: "Fees",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-muted-foreground text-sm tabular-nums">
        {row.original.feePercent > 0
          ? `${row.original.feePercent}% - ${formatCurrency(row.original.feeAmount)}`
          : "Not concerned"}
      </div>
    ),
  },
  {
    accessorKey: "depositStatus",
    header: "Deposit status",
    cell: ({ row }) => (
      <DepositStatusBadge status={row.original.depositStatus} />
    ),
  },
  {
    id: "processedBy",
    accessorFn: (row) => row.processedBy.name,
    header: "Processed By",
    cell: ({ row }) => (
      <ProcessorCell processor={row.original.processedBy} />
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right"> </div>,
    cell: ({ row }) => <DepositActions deposit={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

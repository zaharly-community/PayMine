import type { ColumnDef } from "@tanstack/react-table";
import { parse } from "date-fns";
import {
  Check,
  CircleHelp,
  Clock3,
  Eye,
  LoaderCircle,
  PencilLine,
} from "lucide-react";

import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { WithdrawlRow, WithdrawlStatus } from "./data";

function WithdrawlMethodCell({ withdrawl }: { withdrawl: WithdrawlRow }) {
  return (
    <div className="flex min-w-34 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-xs border bg-background">
        <img
          src={withdrawl.withdrawlMethodImage}
          alt=""
          className="size-full object-contain p-0.5"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="truncate text-sm">{withdrawl.withdrawlMethod}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: WithdrawlStatus }) {
  const config: Record<
    WithdrawlStatus,
    { icon: typeof Clock3; className: string }
  > = {
    Pending: {
      icon: Clock3,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    Completed: {
      icon: Check,
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    "Waiting Correction": {
      icon: PencilLine,
      className: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn("h-5 gap-1 rounded-4xl px-1.5 py-0.5 font-medium", className)}
    >
      <Icon className="size-3!" />
      {status}
    </Badge>
  );
}

function ProcessorCell({ processor }: { processor: WithdrawlRow["processedBy"] }) {
  return (
    <div className="flex min-w-42 items-center gap-2">
      <Avatar size="sm" className="shrink-0">
        <AvatarImage src={processor.image} alt="" referrerPolicy="no-referrer" />
        <AvatarFallback className="bg-muted text-[10px] font-medium">
          {getInitials(processor.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate font-medium text-sm">{processor.name}</span>
    </div>
  );
}

function Actions({ withdrawl }: { withdrawl: WithdrawlRow }) {
  const completed = withdrawl.status === "Completed";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        aria-label={`Approve withdrawal ${withdrawl.id}`}
        title="Approve"
        size="icon-sm"
        variant="ghost"
        disabled={completed}
        className="size-7 rounded-[min(var(--radius-md),12px)] text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 disabled:text-emerald-600/40 dark:text-emerald-400"
      >
        <Check className="size-3.5" />
      </Button>
      <Button
        type="button"
        aria-label={`View withdrawal ${withdrawl.id}`}
        title="View"
        size="icon-sm"
        variant="ghost"
        className="size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Eye className="size-3.5" />
      </Button>
      <Button
        type="button"
        aria-label={`Skip withdrawal ${withdrawl.id}`}
        title="Skip"
        size="icon-sm"
        variant="ghost"
        className="size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <CircleHelp className="size-3.5" />
      </Button>
    </div>
  );
}

export const withdrawlsColumns: ColumnDef<DataTableFeatures, WithdrawlRow>[] = [
  {
    id: "search",
    accessorFn: (row) => `${row.name} ${row.email} ${row.id} ${row.withdrawlMethod}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    id: "withdrawlId",
    accessorKey: "id",
    header: "Withdrawls ID",
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
        <span className="truncate font-medium text-sm">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "withdrawlMethod",
    header: "Withdrawl Method",
    cell: ({ row }) => <WithdrawlMethodCell withdrawl={row.original} />,
  },
  {
    id: "date",
    accessorFn: (row) =>
      parse(row.date, "dd MMM yyyy, hh:mm a", new Date()).getTime(),
    header: "date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm tabular-nums">
        {row.original.date}
      </div>
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
    id: "commission",
    accessorFn: (row) => row.commissionAmount,
    header: "Commission",
    cell: ({ row }) => (
      <div className="whitespace-nowrap font-medium text-emerald-600 text-sm tabular-nums dark:text-emerald-400">
        {row.original.commissionPercent > 0
          ? `${row.original.commissionPercent}% - ${formatCurrency(row.original.commissionAmount)}`
          : "No commission"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "processedBy",
    accessorFn: (row) => row.processedBy.name,
    header: "Processed By",
    cell: ({ row }) => <ProcessorCell processor={row.original.processedBy} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right"> </div>,
    cell: ({ row }) => <Actions withdrawl={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

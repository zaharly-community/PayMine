import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { DistributorRow } from "./data";

function DistributorCell({ distributor }: { distributor: DistributorRow }) {
  return (
    <div className="flex min-w-55 items-center gap-3">
      <Avatar size="sm" className="shrink-0">
        <AvatarImage src={distributor.avatarUrl || undefined} alt={distributor.name} />
        <AvatarFallback className="bg-muted text-[10px] font-medium">
          {getInitials(distributor.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground text-sm">{distributor.name}</div>
      </div>
    </div>
  );
}

function StatusCell({ distributor }: { distributor: DistributorRow }) {
  const meta = {
    Active: {
      badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      dotClass: "bg-emerald-500",
    },
    "Pending invite": {
      badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dotClass: "bg-amber-500",
    },
    Suspended: {
      badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
      dotClass: "bg-orange-500",
    },
    Deactivated: {
      badgeClass: "border-border bg-muted/50 text-muted-foreground",
      dotClass: "bg-muted-foreground",
    },
  }[distributor.status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-medium text-xs", meta.badgeClass)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {distributor.status}
    </span>
  );
}

export const distributorsColumns: ColumnDef<DataTableFeatures, DistributorRow>[] = [
  {
    id: "search",
    accessorFn: (row) => row.name + " " + row.email + " " + row.id,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "name",
    header: "Distributor",
    cell: ({ row }) => <DistributorCell distributor={row.original} />,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.type}</span>,
  },
  {
    accessorKey: "players",
    header: () => <div className="text-right">Players</div>,
    cell: ({ row }) => <div className="pr-2 text-right text-sm tabular-nums">{row.original.players}</div>,
  },
  {
    accessorKey: "lastActive",
    header: "Last activity",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm tabular-nums">{row.original.joinedDate}</div>
    ),
    sortingFn: (a, b) => a.original.lastActive - b.original.lastActive,
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => (
      <div className="pr-2 text-right font-medium text-sm tabular-nums">{formatCurrency(row.original.balance)}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell distributor={row.original} />,
  },
  {
    accessorKey: "id",
    header: "Distributor ID",
    cell: ({ row }) => <div className="font-mono text-foreground text-xs tracking-wide">{row.original.id}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right"> </div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={"Open actions for " + row.original.name}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>View distributor</DropdownMenuItem>
              <DropdownMenuItem>Edit distributor</DropdownMenuItem>
              <DropdownMenuItem>View players</DropdownMenuItem>
              <DropdownMenuItem>View transactions</DropdownMenuItem>
              <DropdownMenuItem>Manage distributor</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">Suspend distributor</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
];

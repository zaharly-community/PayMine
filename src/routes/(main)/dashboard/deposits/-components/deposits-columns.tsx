import type { ColumnDef } from "@tanstack/react-table";
import { parse } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

import type { DepositRow } from "./data";

const locations = [
  "5559 Wuckert Expressway, West Lenna, NY 53554",
  "592 Cordie Oval, Lancaster, ID 57534-0209",
  "295 Woodside Road, Gorczanyberg, LA 29992",
  "378 Lambert Branch, South Franco, MO 77683",
  "447 Stanley View, New Gina, CA 21361",
  "800 Muller Road, West Fletcher, SC 49730-5632",
  "565 Summer Heights, Dubuque, MS 44690",
  "53571 Abner Crest, Willys­mouth, TX 55146-3625",
  "823 Park View, North Mabelleboro, AR 35965",
  "1368 South Street, East Johnnietown, AR 86049-3338",
  "5901 Schamberger Prairie, Racine, SC 45518",
  "27665 Cedar Grove, Lake Amanda­berg, ND 74115-3302",
  "65389 Murray Prairie, West Clifforside, MS 13932-5376",
];

function getDepositMeta(deposit: DepositRow) {
  let seed = 0;
  for (const char of deposit.email) seed += char.charCodeAt(0);

  return {
    bets: 1 + (seed % 12),
    balance: 32.5 + (seed % 65000) + ((seed % 100) / 100),
    location: locations[seed % locations.length] ?? locations[0],
    id: `PLR${deposit.email.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase()}`,
  };
}

function DepositCell({ deposit }: { deposit: DepositRow }) {
  return (
    <div className="flex min-w-55 items-center gap-3">
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-muted text-[10px] font-medium">
          {getInitials(deposit.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground text-sm">{deposit.name}</div>
      </div>
    </div>
  );
}

export const depositsColumns: ColumnDef<DataTableFeatures, DepositRow>[] = [
  {
    accessorKey: "name",
    header: "Deposit",
    cell: ({ row }) => <DepositCell deposit={row.original} />,
  },
  {
    id: "bets",
    accessorFn: (row) => getDepositMeta(row).bets,
    header: () => <div className="text-right">Bets</div>,
    cell: ({ row }) => {
      const { bets } = getDepositMeta(row.original);
      return <div className="pr-2 text-right text-sm tabular-nums">{bets}</div>;
    },
  },
  {
    id: "lastActivity",
    accessorFn: (row) => parse(row.joinedDate, "dd MMM yyyy, h:mm a", new Date()).getTime(),
    header: "Last activity",
    cell: ({ row }) => <div className="whitespace-nowrap text-sm tabular-nums">{row.original.joinedDate}</div>,
  },
  {
    id: "balance",
    accessorFn: (row) => getDepositMeta(row).balance,
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const { balance } = getDepositMeta(row.original);
      return <div className="pr-2 text-right font-medium text-sm tabular-nums">{formatCurrency(balance)}</div>;
    },
  },
  {
    id: "location",
    accessorFn: (row) => getDepositMeta(row).location,
    header: "Location",
    cell: ({ row }) => (
      <div className="max-w-95 truncate text-muted-foreground text-sm" title={getDepositMeta(row.original).location}>
        {getDepositMeta(row.original).location}
      </div>
    ),
  },
  {
    id: "depositId",
    accessorFn: (row) => getDepositMeta(row).id,
    header: "Deposit ID",
    cell: ({ row }) => (
      <div className="font-mono text-foreground text-xs tracking-wide">
        {getDepositMeta(row.original).id}
      </div>
    ),
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
                aria-label={`Open actions for ${row.original.name}`}
                className={cn("size-8 rounded-md text-muted-foreground hover:bg-muted/50")}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>View deposit</DropdownMenuItem>
              <DropdownMenuItem>Edit deposit</DropdownMenuItem>
              <DropdownMenuItem>View transactions</DropdownMenuItem>
              <DropdownMenuItem>Manage deposit</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">Suspend deposit</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
];

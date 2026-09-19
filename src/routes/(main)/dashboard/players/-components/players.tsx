import * as React from "react";

import { type ColumnFiltersState, type ColumnVisibilityState, type PaginationState, type SortingState, useTable } from "@tanstack/react-table";
import { Cog, Download, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { dataTableFeatures } from "@/lib/data-table-features";
import type { PlayerRow } from "./data";
import { createPlayersColumns } from "./players-columns";
import { PlayersTable } from "./players-table";

export function Players({ players }: { players: PlayerRow[] }) {
  const [playerRows, setPlayerRows] = React.useState<PlayerRow[]>(players);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "joined", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({ search: false });
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [statusById, setStatusById] = React.useState<Record<string, "Active" | "Suspended">>({});

  const handleSuspend = React.useCallback((playerId: string) => {
    setStatusById((current) => ({ ...current, [playerId]: "Suspended" }));
  }, []);

  const handleDelete = React.useCallback((playerId: string) => {
    setPlayerRows((current) => current.filter((player) => {
      const id = "PLR" + player.email.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
      return id !== playerId;
    }));
  }, []);

  const columns = React.useMemo(() => createPlayersColumns({ statusById, onSuspend: handleSuspend, onDelete: handleDelete }), [statusById, handleSuspend, handleDelete]);

  const table = useTable({
    features: dataTableFeatures,
    data: playerRows,
    columns,
    state: { rowSelection, sorting, columnFilters, columnVisibility, pagination },
    getRowId: (row) => row.email,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string | undefined) ?? "";

  return (
    <section data-content-padding="false" className="flex min-h-full flex-col bg-background">
      <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Players</h1>
          <p className="text-muted-foreground text-sm">Manage player identity, financial activity, access and reports.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InputGroup className="h-8 w-64">
            <InputGroupAddon align="inline-start"><Search className="size-3.5" /></InputGroupAddon>
            <InputGroupInput className="h-8" placeholder="Search players..." value={searchQuery} onChange={(event) => { table.getColumn("search")?.setFilterValue(event.target.value || undefined); table.setPageIndex(0); }} />
            <InputGroupAddon align="inline-end"><Kbd className="h-4 text-[10px]">⌘K</Kbd></InputGroupAddon>
          </InputGroup>
          <Button variant="outline" size="sm"><SlidersHorizontal /> Hide</Button>
          <Button variant="outline" size="sm"><Cog /> Customize</Button>
          <Button variant="outline" size="sm"><Download /> Export</Button>
          <Button size="sm"><Plus /> Add Player</Button>
        </div>
      </div>
      <div className="min-w-0 flex-1"><PlayersTable table={table} /></div>
    </section>
  );
}
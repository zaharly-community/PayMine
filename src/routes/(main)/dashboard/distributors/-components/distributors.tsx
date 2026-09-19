import * as React from "react";

import { Link } from "@tanstack/react-router";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { Cog, Download, Landmark, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddDistributorDialog } from "./add-distributor-dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { dataTableFeatures } from "@/lib/data-table-features";

import type { DistributorRow } from "./data";
import { createDistributorsColumns } from "./distributors-columns";
import { DistributorsTable } from "./distributors-table";

export function Distributors({ distributors: initialDistributors }: { distributors: DistributorRow[] }) {
  const [distributors, setDistributors] = React.useState(initialDistributors);
  const [addDistributorOpen, setAddDistributorOpen] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({
    search: false,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const handleSuspend = React.useCallback((distributorId: string) => {
    setDistributors((current) =>
      current.map((distributor) =>
        distributor.id === distributorId
          ? { ...distributor, status: "Suspended" as const }
          : distributor,
      ),
    );
  }, []);

  const handleDelete = React.useCallback((distributorId: string) => {
    setDistributors((current) => current.filter((distributor) => distributor.id !== distributorId));
  }, []);

  const handleWalletAdjust = React.useCallback((distributorId: string, delta: number, reason: string) => {
    const now = new Date();
    const auditId = "WAL-" + now.getTime();

    setDistributors((current) =>
      current.map((distributor) => {
        if (distributor.id !== distributorId) return distributor;
        if (distributor.type !== "Agent") return distributor;

        return {
          ...distributor,
          balance: Math.max(0, distributor.balance + delta),
          walletAudit: [
            {
              id: auditId,
              action: delta >= 0 ? "Credit" : "Debit",
              amount: Math.abs(delta),
              reason,
              createdAt: now.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            ...(distributor.walletAudit ?? []),
          ],
        };
      }),
    );
  }, []);

  const distributorsColumns = React.useMemo(
    () =>
      createDistributorsColumns({
        onSuspend: handleSuspend,
        onDelete: handleDelete,
        onWalletAdjust: handleWalletAdjust,
      }),
    [handleSuspend, handleDelete, handleWalletAdjust],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: distributors,
    columns: distributorsColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id,
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
          <h1 className="text-xl font-semibold tracking-tight">Distributors</h1>
          <p className="text-muted-foreground text-sm">Manage your agents and supervisors.</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <InputGroup className="h-8 w-64">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-8"
              placeholder="Search distributors..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
            <InputGroupAddon align="inline-end">
              <Kbd className="h-4 text-[10px]">⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>

          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/finance/treasury"><Landmark /> Treasury</Link>
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal /> Hide
          </Button>
          <Button variant="outline" size="sm">
            <Cog /> Customize
          </Button>
          <Button variant="outline" size="sm">
            <Download /> Export
          </Button>
          <Button size="sm" onClick={() => setAddDistributorOpen(true)}>
            <Plus /> Add Distributor
          </Button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <DistributorsTable table={table} />
      </div>

      <AddDistributorDialog
        open={addDistributorOpen}
        onOpenChange={setAddDistributorOpen}
        onCreate={(distributor) => setDistributors((current) => [distributor, ...current])}
      />

    </section>
  );
}

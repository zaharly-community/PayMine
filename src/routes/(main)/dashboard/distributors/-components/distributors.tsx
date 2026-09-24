import * as React from "react";

import { Link } from "@tanstack/react-router";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { Check, Cog, Download, GripVertical, Landmark, Plus, Search } from "lucide-react";

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
  const [columnOrder, setColumnOrder] = React.useState<string[]>([
    "id",
    "name",
    "username",
    "email",
    "score",
    "joinedDate",
    "type",
    "balance",
    "status",
    "actions",
  ]);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const customizeRef = React.useRef<HTMLDivElement>(null);
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
      columnOrder,
      pagination,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
  });

  React.useEffect(() => {
    if (!customizeOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setCustomizeOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [customizeOpen]);

  const reorderColumns = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setColumnOrder((current) => {
      const next = [...current];
      const sourceIndex = next.indexOf(sourceId);
      const targetIndex = next.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return current;
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

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
          <div className="relative" ref={customizeRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={customizeOpen}
              aria-haspopup="menu"
              onClick={() => setCustomizeOpen((open) => !open)}
            >
              <Cog /> Customize
            </Button>
            {customizeOpen ? (
              <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-lg bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
                <div className="border-b px-2 pb-2">
                  <p className="text-sm font-medium">Customize columns</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Show, hide, and drag columns to change their order.</p>
                </div>
                <div className="mt-2 max-h-80 overflow-y-auto">
                  {table.getAllLeafColumns()
                    .filter((column) => column.id !== "search")
                    .map((column) => {
                      const visible = column.getIsVisible();
                      const canHide = column.getCanHide();
                      const labelMap: Record<string, string> = {
                        id: "Distributor ID",
                        name: "Distributor",
                        username: "Username",
                        email: "Email",
                        score: "Score",
                        joinedDate: "Joined",
                        type: "Role",
                        balance: "Wallet Balance",
                        status: "Status",
                        actions: "Actions",
                      };
                      return (
                        <div
                          key={column.id}
                          draggable={column.id !== "actions"}
                          onDragStart={() => {
                            if (column.id !== "actions") customizeRef.current?.setAttribute("data-dragging-column", column.id);
                          }}
                          onDragEnd={() => customizeRef.current?.removeAttribute("data-dragging-column")}
                          onDragOver={(event) => {
                            if (column.id !== "actions") event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const sourceId = customizeRef.current?.getAttribute("data-dragging-column");
                            if (sourceId) reorderColumns(sourceId, column.id);
                          }}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                        >
                          <GripVertical className={column.id === "actions" ? "size-3.5 text-muted-foreground/35" : "size-3.5 cursor-grab text-muted-foreground"} />
                          <button
                            type="button"
                            disabled={!canHide}
                            role="menuitemcheckbox"
                            aria-checked={visible}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              if (canHide) column.toggleVisibility(!visible);
                            }}
                          >
                            <span className={visible ? "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground" : "flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background"}>
                              {visible ? <Check className="size-3" /> : null}
                            </span>
                            <span className="truncate">{labelMap[column.id] ?? column.id}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">Actions stays visible and cannot be hidden.</div>
              </div>
            ) : null}
          </div>
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

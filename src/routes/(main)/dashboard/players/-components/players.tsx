import * as React from "react";

import { type ColumnFiltersState, type ColumnVisibilityState, type PaginationState, type SortingState, useTable } from "@tanstack/react-table";
import { AlertTriangle, Check, Cog, Download, GripVertical, Plus, Search, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { dataTableFeatures } from "@/lib/data-table-features";
import type { PlayerRow } from "./data";
import { createPlayersColumns } from "./players-columns";
import { PlayersTable } from "./players-table";

const playerRegistryStorageKey = "ipaycash-player-registry-v1";

type PlayerIdentityDraft = {
  name: string;
  playerId: string;
  email: string;
  phoneNumber: string;
};

type PlayerIdentityMatch = {
  player: PlayerRow;
  matchedBy: string[];
};

const emptyIdentityDraft = (): PlayerIdentityDraft => ({
  name: "",
  playerId: "",
  email: "",
  phoneNumber: "",
});

function normalizePlayerId(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function normalizePlayerEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePlayerPhone(value: string) {
  return value.replace(/\D/g, "");
}

function getDashboardPlayerId(player: PlayerRow) {
  if (player.playerId?.trim()) return normalizePlayerId(player.playerId);
  if (player.email.trim()) {
    return "PLR" + player.email.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
  }
  const source = player.phoneNumber || player.id || player.name;
  return "PLR" + source.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
}

function getPlayerRowKey(player: PlayerRow) {
  return player.id || player.playerId || player.email || player.phoneNumber || player.name;
}

function getPlayerMatches(playerRows: PlayerRow[], draft: PlayerIdentityDraft): PlayerIdentityMatch[] {
  const wantedId = normalizePlayerId(draft.playerId);
  const wantedEmail = normalizePlayerEmail(draft.email);
  const wantedPhone = normalizePlayerPhone(draft.phoneNumber);

  return playerRows.flatMap((player) => {
    const matchedBy: string[] = [];
    const existingId = getDashboardPlayerId(player);
    if (wantedId && normalizePlayerId(existingId) === wantedId) matchedBy.push("Player ID");
    if (wantedEmail && player.email && normalizePlayerEmail(player.email) === wantedEmail) matchedBy.push("Email");
    if (wantedPhone && player.phoneNumber && normalizePlayerPhone(player.phoneNumber) === wantedPhone) matchedBy.push("Phone Number");
    return matchedBy.length ? [{ player, matchedBy }] : [];
  });
}

function readSavedPlayerRegistry(): PlayerRow[] {
  try {
    const raw = window.localStorage.getItem(playerRegistryStorageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PlayerRow[] : [];
  } catch {
    return [];
  }
}

export function Players({ players }: { players: PlayerRow[] }) {
  const [playerRows, setPlayerRows] = React.useState<PlayerRow[]>(players);
  const [addPlayerOpen, setAddPlayerOpen] = React.useState(false);
  const [identityDraft, setIdentityDraft] = React.useState<PlayerIdentityDraft>(emptyIdentityDraft);
  const [identityError, setIdentityError] = React.useState("");
  const [identityMatches, setIdentityMatches] = React.useState<PlayerIdentityMatch[]>([]);

  React.useEffect(() => {
    try {
      const saved = readSavedPlayerRegistry();
      setPlayerRows((current) => {
        const knownKeys = new Set(current.map(getPlayerRowKey));
        return [...current, ...saved.filter((player) => !knownKeys.has(getPlayerRowKey(player)))];
      });
    } catch {
      // The Players table remains available when browser storage is disabled.
    }
  }, []);
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "joined", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({ search: false });
  const [columnOrder, setColumnOrder] = React.useState<string[]>([
    "playerId",
    "identifier",
    "joined",
    "score",
    "deposits",
    "withdrawals",
    "status",
    "actions",
  ]);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const customizeRef = React.useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [statusById, setStatusById] = React.useState<Record<string, "Active" | "Suspended">>({});

  const handleSuspend = React.useCallback((playerId: string) => {
    setStatusById((current) => ({ ...current, [playerId]: "Suspended" }));
  }, []);

  const handleDelete = React.useCallback((playerId: string) => {
    setPlayerRows((current) => current.filter((player) => getDashboardPlayerId(player) !== playerId));
    try {
      const saved = readSavedPlayerRegistry().filter((player) => getDashboardPlayerId(player) !== playerId);
      window.localStorage.setItem(playerRegistryStorageKey, JSON.stringify(saved));
    } catch {
      // Deleting from the current table still works if browser storage is unavailable.
    }
  }, []);

  const createPlayer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIdentityError("");
    setIdentityMatches([]);

    const name = identityDraft.name.trim();
    const playerId = normalizePlayerId(identityDraft.playerId);
    const email = normalizePlayerEmail(identityDraft.email);
    const phoneInput = identityDraft.phoneNumber.trim();
    const phoneDigits = normalizePlayerPhone(phoneInput);

    if (!name) {
      setIdentityError("Enter the player name.");
      return;
    }
    if (!playerId && !email && !phoneInput) {
      setIdentityError("Enter at least one unique identifier: Player ID, Email, or Phone Number.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIdentityError("Enter a valid email address.");
      return;
    }
    if (phoneInput && !/^\+[1-9]\d{7,14}$/.test(phoneInput.replace(/[\s().-]/g, ""))) {
      setIdentityError("Use an international phone number, for example +216 20 123 456.");
      return;
    }

    const matches = getPlayerMatches(playerRows, {
      ...identityDraft,
      name,
      playerId,
      email,
      phoneNumber: phoneInput,
    });
    if (matches.length) {
      setIdentityMatches(matches);
      setIdentityError(
        matches.length === 1
          ? "This identifier already belongs to an existing player. A duplicate record was not created."
          : "These identifiers match different existing player records. Creation is blocked until the identity conflict is reviewed.",
      );
      return;
    }

    const generatedId = "PLR" + Date.now().toString(36).toUpperCase().slice(-8);
    const finalPlayerId = playerId || generatedId;
    const normalizedPhone = phoneInput ? "+" + phoneDigits : undefined;
    const created: PlayerRow = {
      id: "local-player-" + Date.now().toString(36),
      playerId: finalPlayerId,
      name,
      email,
      phoneNumber: normalizedPhone,
      role: "Player",
      status: "Active",
      team: "Customer Ops",
      workspace: ["iPayCash"],
      joinedDate: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      lastActive: 0,
    };

    const nextRows = [created, ...playerRows];
    setPlayerRows(nextRows);
    try {
      const saved = readSavedPlayerRegistry();
      window.localStorage.setItem(playerRegistryStorageKey, JSON.stringify([created, ...saved]));
    } catch {
      // The newly created row remains visible for this session even if storage is unavailable.
    }
    setIdentityDraft(emptyIdentityDraft());
    setIdentityMatches([]);
    setIdentityError("");
    setAddPlayerOpen(false);
  };

  const closeAddPlayer = (open: boolean) => {
    setAddPlayerOpen(open);
    if (!open) {
      setIdentityDraft(emptyIdentityDraft());
      setIdentityMatches([]);
      setIdentityError("");
    }
  };

  const columns = React.useMemo(() => createPlayersColumns({ statusById, onSuspend: handleSuspend, onDelete: handleDelete }), [statusById, handleSuspend, handleDelete]);

  const table = useTable({
    features: dataTableFeatures,
    data: playerRows,
    columns,
    state: { rowSelection, sorting, columnFilters, columnVisibility, columnOrder, pagination },
    getRowId: (row) => getPlayerRowKey(row),
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
          <h1 className="text-xl font-semibold tracking-tight">Players</h1>
          <p className="text-muted-foreground text-sm">Manage player identity, financial activity, access and reports.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InputGroup className="h-8 w-64">
            <InputGroupAddon align="inline-start"><Search className="size-3.5" /></InputGroupAddon>
            <InputGroupInput className="h-8" placeholder="Search players..." value={searchQuery} onChange={(event) => { table.getColumn("search")?.setFilterValue(event.target.value || undefined); table.setPageIndex(0); }} />
            <InputGroupAddon align="inline-end"><Kbd className="h-4 text-[10px]">⌘K</Kbd></InputGroupAddon>
          </InputGroup>
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
                        playerId: "Player ID",
                        identifier: "Identifier",
                        joined: "Joined",
                        score: "Score",
                        deposits: "Deposits",
                        withdrawals: "Withdrawls",
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
          <Button variant="outline" size="sm"><Download /> Export</Button>
          <Button size="sm" onClick={() => setAddPlayerOpen(true)}><Plus /> Add Player</Button>
        </div>
      </div>
      <div className="min-w-0 flex-1"><PlayersTable table={table} /></div>

      <Dialog open={addPlayerOpen} onOpenChange={closeAddPlayer}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add player</DialogTitle>
            <DialogDescription>
              A player may have a Player ID, email address, phone number, or a combination. iPayCash checks all identifiers before creating a new record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createPlayer} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-player-name" className="text-sm font-medium">Player name <span className="text-destructive">*</span></label>
              <Input id="new-player-name" autoFocus value={identityDraft.name} onChange={(event) => { setIdentityDraft((draft) => ({ ...draft, name: event.target.value })); setIdentityError(""); setIdentityMatches([]); }} placeholder="Enter player's name" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="new-player-id" className="text-sm font-medium">Player ID</label>
                <Input id="new-player-id" value={identityDraft.playerId} onChange={(event) => { setIdentityDraft((draft) => ({ ...draft, playerId: event.target.value })); setIdentityError(""); setIdentityMatches([]); }} placeholder="e.g. PLR12345678" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="new-player-email" className="text-sm font-medium">Email</label>
                <Input id="new-player-email" type="email" value={identityDraft.email} onChange={(event) => { setIdentityDraft((draft) => ({ ...draft, email: event.target.value })); setIdentityError(""); setIdentityMatches([]); }} placeholder="player@example.com" autoComplete="email" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-player-phone" className="text-sm font-medium">Phone number</label>
              <Input id="new-player-phone" type="tel" value={identityDraft.phoneNumber} onChange={(event) => { setIdentityDraft((draft) => ({ ...draft, phoneNumber: event.target.value })); setIdentityError(""); setIdentityMatches([]); }} placeholder="+216 20 123 456" autoComplete="tel" />
              <p className="text-xs text-muted-foreground">Use the international format with country code. At least one of the three identifiers is required.</p>
            </div>

            {identityError ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-foreground">{identityError}</p>
                </div>
                {identityMatches.length ? (
                  <div className="mt-3 space-y-2">
                    {identityMatches.map(({ player, matchedBy }) => {
                      const matchedId = getDashboardPlayerId(player);
                      return (
                        <div key={getPlayerRowKey(player)} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{player.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{matchedId} · Matched by {matchedBy.join(", ")}</p>
                          </div>
                          <Link to="/dashboard/players/$playerId" params={{ playerId: matchedId }} className="shrink-0 text-xs font-medium text-primary hover:underline">
                            Open player
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => closeAddPlayer(false)}>Cancel</Button>
              <Button type="submit"><ShieldCheck /> Check & create player</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
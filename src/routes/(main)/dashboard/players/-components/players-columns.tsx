import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Eye, Flag, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { PlayerRow } from "./data";

const locations = ["Tunis, Tunisia", "Sousse, Tunisia", "Sfax, Tunisia", "Monastir, Tunisia", "Bizerte, Tunisia", "Nabeul, Tunisia"];
type PlayerStatus = "Active" | "Suspended";
type PlayerMeta = { playerId: string; identifier: string; joined: string; score: number; deposits: number; withdrawals: number; location: string; };

export type PlayerColumnActions = { statusById: Record<string, PlayerStatus>; onSuspend: (playerId: string) => void; onDelete: (playerId: string) => void; };

function getPlayerMeta(player: PlayerRow): PlayerMeta {
  let seed = 0;
  for (const char of player.email) seed += char.charCodeAt(0);
  const playerId = "PLR" + player.email.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
  const identifier = seed % 2 === 0 ? playerId : player.name.toLowerCase().replace(/[^a-z0-9]+/g, ".") + "-" + String(seed % 90 + 10);
  return { playerId, identifier, joined: player.joinedDate, score: Number(((seed % 101) / 10).toFixed(1)), deposits: 250 + (seed % 18500), withdrawals: 120 + (seed % 9200), location: locations[seed % locations.length] ?? locations[0] };
}

function scoreTone(score: number) {
  if (score <= 3) return "bg-emerald-500";
  if (score <= 6) return "bg-amber-500";
  return "bg-red-500";
}

function ScoreBars({ score }: { score: number }) {
  const filled = Math.min(10, Math.max(0, Math.round(score)));
  const tone = scoreTone(score);
  return <div aria-label={"Score " + score.toFixed(1) + " out of 10"} className="flex items-center gap-[3px]" role="img" title={"Score " + score.toFixed(1)}>{Array.from({ length: 10 }, (_, index) => <span key={index} className={cn("h-4 w-1 rounded-full", index < filled ? tone : "bg-muted-foreground/20")} />)}</div>;
}

function PlayerCell({ player }: { player: PlayerRow }) {
  const meta = getPlayerMeta(player);
  return <div className="flex min-w-48 items-center gap-3"><Avatar size="sm" className="shrink-0"><AvatarFallback className="bg-muted text-[10px] font-medium">{getInitials(player.name)}</AvatarFallback></Avatar><div className="min-w-0"><div className="truncate font-medium text-foreground text-sm">{player.name}</div><div className="truncate text-xs text-muted-foreground">{meta.location}</div></div></div>;
}

function StatusBadge({ status }: { status: PlayerStatus }) {
  const suspended = status === "Suspended";
  return <Badge variant="outline" className={cn("gap-1.5 rounded-sm px-2 py-0.5 font-medium", suspended ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}><span className={cn("size-1.5 rounded-full", suspended ? "bg-orange-500" : "bg-emerald-500")} />{status}</Badge>;
}

function PlayerActions({ player, meta, status, onSuspend, onDelete }: { player: PlayerRow; meta: PlayerMeta; status: PlayerStatus; onSuspend: (playerId: string) => void; onDelete: (playerId: string) => void; }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [reason, setReason] = React.useState("Suspicious player activity");
  const deleting = status === "Suspended";
  const matches = confirmation.trim() === meta.playerId;
  const closeConfirm = (open: boolean) => { setConfirmOpen(open); if (!open) setConfirmation(""); };

  return <>
    <div className="flex items-center justify-end gap-0.5">
      <Button type="button" size="icon-sm" variant="ghost" className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={"View " + player.name} title="View player profile" render={<Link to="/dashboard/players/$playerId" params={{ playerId: meta.playerId }} />}><Eye className="size-3.5" /></Button>
      <Button type="button" size="icon-sm" variant="ghost" className={cn("size-8 rounded-md", deleting ? "text-red-500 hover:bg-red-500/10" : "text-orange-500 hover:bg-orange-500/10")} aria-label={deleting ? "Delete player" : "Suspend player"} title={deleting ? "Delete player" : "Suspend player"} onClick={() => setConfirmOpen(true)}>{deleting ? <Trash2 className="size-3.5" /> : <Ban className="size-3.5" />}</Button>
      <Button type="button" size="icon-sm" variant="ghost" className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={"Report " + player.name} title="Report player" onClick={() => setReportOpen(true)}><Flag className="size-3.5" /></Button>
    </div>

    <AlertDialog open={confirmOpen} onOpenChange={closeConfirm}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader><AlertDialogTitle>{deleting ? "Delete player" : "Suspend player"}</AlertDialogTitle><AlertDialogDescription>{deleting ? "This permanently removes the player from this frontend mockup. Type the Player ID to confirm deletion." : "This suspends the player account and blocks normal access. Type the Player ID to confirm suspension."}</AlertDialogDescription></AlertDialogHeader>
        <div className="grid gap-2"><label htmlFor={"player-confirm-" + meta.playerId} className="text-sm font-medium">Player ID</label><Input id={"player-confirm-" + meta.playerId} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={meta.playerId} /><p className="text-xs text-muted-foreground">Enter exactly: <span className="font-mono font-medium text-foreground">{meta.playerId}</span></p></div>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={!matches} className={deleting ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-orange-500 text-white hover:bg-orange-600"} onClick={(event) => { event.preventDefault(); if (!matches) return; if (deleting) onDelete(meta.playerId); else onSuspend(meta.playerId); closeConfirm(false); }}>{deleting ? "Confirm delete" : "Confirm suspension"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={reportOpen} onOpenChange={setReportOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Report player</DialogTitle><DialogDescription>Submit a frontend-only report for {player.name}.</DialogDescription></DialogHeader><div className="grid gap-2"><label className="text-sm font-medium">Reason</label><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe the issue..." /></div><DialogFooter><Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button><Button onClick={() => setReportOpen(false)}><Flag /> Submit report</Button></DialogFooter></DialogContent></Dialog>
  </>;
}

export const createPlayersColumns = (actions: PlayerColumnActions): ColumnDef<DataTableFeatures, PlayerRow>[] => [
  { id: "search", accessorFn: (row) => row.name + " " + row.email + " " + getPlayerMeta(row).identifier + " " + getPlayerMeta(row).playerId, filterFn: "includesString", enableHiding: true },
  { id: "player", accessorFn: (row) => row.name, header: "Player", cell: ({ row }) => <PlayerCell player={row.original} /> },
  { id: "playerId", accessorFn: (row) => getPlayerMeta(row).playerId, header: "Player ID", cell: ({ row }) => <span className="font-mono text-xs tracking-wide text-foreground">{getPlayerMeta(row.original).playerId}</span> },
  { id: "identifier", accessorFn: (row) => getPlayerMeta(row).identifier, header: "Identifier", cell: ({ row }) => <span className="max-w-44 truncate text-sm">{getPlayerMeta(row.original).identifier}</span> },
  { id: "joined", accessorFn: (row) => new Date(row.joinedDate).getTime(), header: "Joined", cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums">{getPlayerMeta(row.original).joined}</span> },
  { id: "score", accessorFn: (row) => getPlayerMeta(row).score, header: "Score", cell: ({ row }) => <ScoreBars score={getPlayerMeta(row.original).score} /> },
  { id: "deposits", accessorFn: (row) => getPlayerMeta(row).deposits, header: () => <div className="text-right">Deposits</div>, cell: ({ row }) => <div className="pr-2 text-right text-sm font-medium tabular-nums">{formatCurrency(getPlayerMeta(row.original).deposits)}</div> },
  { id: "withdrawals", accessorFn: (row) => getPlayerMeta(row).withdrawals, header: () => <div className="text-right">Withdrawls</div>, cell: ({ row }) => <div className="pr-2 text-right text-sm font-medium tabular-nums">{formatCurrency(getPlayerMeta(row.original).withdrawals)}</div> },
  { id: "status", accessorFn: (row) => actions.statusById[getPlayerMeta(row).playerId] ?? (getPlayerMeta(row).score > 8.5 ? "Suspended" : "Active"), header: "Status", cell: ({ row }) => { const meta = getPlayerMeta(row.original); return <StatusBadge status={actions.statusById[meta.playerId] ?? (meta.score > 8.5 ? "Suspended" : "Active")} />; } },
  { id: "actions", header: () => <div className="text-right" />, cell: ({ row }) => { const meta = getPlayerMeta(row.original); const status = actions.statusById[meta.playerId] ?? (meta.score > 8.5 ? "Suspended" : "Active"); return <PlayerActions player={row.original} meta={meta} status={status} onSuspend={actions.onSuspend} onDelete={actions.onDelete} />; }, enableHiding: false, enableSorting: false },
];
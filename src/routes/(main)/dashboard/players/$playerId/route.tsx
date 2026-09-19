import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Ban, CalendarDays, CircleDollarSign, Flag, Gamepad2, Mail, ShieldCheck, UserRound, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/(main)/dashboard/players/$playerId")({ component: Page });

function Page() {
  const { playerId } = Route.useParams();
  const seed = Array.from(playerId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const score = Number(((seed % 101) / 10).toFixed(1));
  const status = score > 8.5 ? "Suspended" : "Active";
  const deposits = 250 + (seed % 18500);
  const withdrawals = 120 + (seed % 9200);
  const identifier = "player-" + playerId.slice(-5).toLowerCase();

  return <section data-content-padding="false" className="flex min-h-full flex-col bg-background">
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div><Link to="/dashboard/players" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Players</Link><h1 className="mt-1 text-xl font-semibold tracking-tight">Player profile</h1></div>
      <div className="flex items-center gap-2"><Button size="sm" variant="outline"><Flag /> Report</Button><Button size="sm" variant={status === "Suspended" ? "destructive" : "outline"}>{status === "Suspended" ? <Ban /> : <ShieldCheck />}{status}</Button></div>
    </div>
    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
      {[[ "Player ID", playerId, UserRound ], [ "Identifier", identifier, Gamepad2 ], [ "Joined", "14 Sep 2026, 09:42 AM", CalendarDays ], [ "Status", status, ShieldCheck ]].map(([label, value, Icon]) => <Card key={String(label)}><CardHeader className="pb-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</div></CardHeader><CardContent><p className="truncate text-sm font-semibold">{value}</p></CardContent></Card>)}
    </div>
    <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[1.2fr_.8fr]">
      <Card><CardHeader><CardTitle className="text-sm">Player overview</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">Score</p><p className="mt-1 text-2xl font-semibold">{score.toFixed(1)}</p><p className="mt-1 text-xs text-muted-foreground">0–3 green · 3.1–6 yellow · &gt;6 red</p></div>
        <div className="rounded-xl border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">Game account</p><p className="mt-1 text-sm font-medium">{identifier}</p></div>
        <div className="flex items-center gap-3 rounded-xl border p-4"><Mail className="size-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">player@example.com</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border p-4"><WalletCards className="size-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Wallet</p><p className="text-sm font-medium">{formatCurrency(Math.max(0, deposits - withdrawals / 2))}</p></div></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Financial activity</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total deposits</span><span className="font-semibold tabular-nums">{formatCurrency(deposits)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total withdrawals</span><span className="font-semibold tabular-nums">{formatCurrency(withdrawals)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Net movement</span><span className="font-semibold tabular-nums">{formatCurrency(deposits - withdrawals)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Recent transactions</span><Badge variant="outline"><CircleDollarSign className="size-3.5" />12</Badge></div>
      </CardContent></Card>
    </div>
  </section>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

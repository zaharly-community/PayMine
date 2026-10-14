import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Search, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(main)/dashboard/wallets")({ component: WalletsPage });

type Currency = "TND" | "USD" | "EUR" | "USDT";
type WalletStatus = "Active" | "Frozen" | "Review";
type WalletRow = {
  id: string;
  owner: string;
  ownerType: "Player" | "Agent" | "Brand";
  currency: Currency;
  available: number;
  reserved: number;
  status: WalletStatus;
  updatedAt: string;
};

const demoWallets: WalletRow[] = [
  { id: "WAL-1001", owner: "Amine Ben Salem", ownerType: "Player", currency: "TND", available: 18420.5, reserved: 250, status: "Active", updatedAt: "14 Oct 2026, 10:42" },
  { id: "WAL-1002", owner: "Atlas Payments", ownerType: "Agent", currency: "TND", available: 6320, reserved: 0, status: "Active", updatedAt: "14 Oct 2026, 10:35" },
  { id: "WAL-1003", owner: "Northline Network", ownerType: "Agent", currency: "USD", available: 4210.25, reserved: 600, status: "Review", updatedAt: "14 Oct 2026, 10:18" },
  { id: "WAL-1004", owner: "Sami Trabelsi", ownerType: "Player", currency: "TND", available: 820.75, reserved: 0, status: "Frozen", updatedAt: "14 Oct 2026, 09:56" },
  { id: "WAL-1005", owner: "Betcon Demo Brand", ownerType: "Brand", currency: "EUR", available: 12840.6, reserved: 1200, status: "Active", updatedAt: "14 Oct 2026, 09:30" },
  { id: "WAL-1006", owner: "Player PLR-48291021", ownerType: "Player", currency: "USDT", available: 340.125, reserved: 0, status: "Active", updatedAt: "14 Oct 2026, 09:12" },
];

function money(amount: number, currency: Currency) {
  if (currency === "USDT") return amount.toLocaleString("en-US", { maximumFractionDigits: 6 }) + " USDT";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: currency === "TND" ? 3 : 2, maximumFractionDigits: currency === "TND" ? 3 : 2 }).format(amount);
}

function Stat({ title, value, note }: { title: string; value: string; note: string }) {
  return <Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></CardContent></Card>;
}

function WalletsPage() {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState("WAL-1001");

  const filtered = useMemo(() => demoWallets.filter((wallet) => {
    const matchesQuery = [wallet.id, wallet.owner, wallet.ownerType].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (currency === "All" || wallet.currency === currency) && (status === "All" || wallet.status === status);
  }), [query, currency, status]);
  const selected = filtered.find((wallet) => wallet.id === selectedId) ?? filtered[0];
  const totalWallets = demoWallets.length;
  const reviewCount = demoWallets.filter((wallet) => wallet.status === "Review").length;
  const reservedCount = demoWallets.filter((wallet) => wallet.reserved > 0).length;

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm text-muted-foreground"><WalletCards className="size-4" /> Finance / Wallets</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Wallets</h1><p className="mt-1 text-sm text-muted-foreground">Explore wallet balances, reserved funds, ownership and recent activity.</p></div>
        <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCurrency("All"); setStatus("All"); }}><RefreshCw className="mr-2 size-4" />Reset filters</Button>
      </header>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Demo data.</strong> Balances are illustrative and are not connected to a live ledger. Totals must be reviewed by currency; currencies are never combined.</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Wallets" value={String(totalWallets)} note="Across players, agents and brands" />
        <Stat title="Needs review" value={String(reviewCount)} note="Illustrative status only" />
        <Stat title="With reserved funds" value={String(reservedCount)} note="Reserved amount is separate from available" />
        <Stat title="Currencies" value="4" note="TND · USD · EUR · USDT" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <Card className="overflow-hidden shadow-none">
          <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search wallet, owner or ID..." /></div>
            <select aria-label="Currency filter" value={currency} onChange={(event) => setCurrency(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>TND</option><option>USD</option><option>EUR</option><option>USDT</option></select>
            <select aria-label="Wallet status filter" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>Active</option><option>Frozen</option><option>Review</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr>{["Wallet / Owner", "Type", "Available", "Reserved", "Status", ""].map((item) => <th key={item} className="px-3 py-3 font-medium whitespace-nowrap">{item}</th>)}</tr></thead>
              <tbody className="divide-y">
                {filtered.map((wallet) => <tr key={wallet.id} className={selected?.id === wallet.id ? "bg-muted/40" : "hover:bg-muted/20"}>
                  <td className="px-3 py-3"><button className="text-left" onClick={() => setSelectedId(wallet.id)}><span className="block font-medium">{wallet.owner}</span><span className="mt-0.5 block font-mono text-xs text-muted-foreground">{wallet.id}</span></button></td>
                  <td className="px-3 py-3 text-muted-foreground">{wallet.ownerType}</td>
                  <td className="px-3 py-3 font-medium tabular-nums whitespace-nowrap">{money(wallet.available, wallet.currency)}</td>
                  <td className="px-3 py-3 tabular-nums whitespace-nowrap">{money(wallet.reserved, wallet.currency)}</td>
                  <td className="px-3 py-3"><Badge variant="outline" className={wallet.status === "Active" ? "text-emerald-700" : wallet.status === "Frozen" ? "text-destructive" : "text-amber-700"}>{wallet.status}</Badge></td>
                  <td className="px-3 py-3"><Button size="sm" variant="ghost" onClick={() => setSelectedId(wallet.id)}>View</Button></td>
                </tr>)}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No wallets match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">Showing {filtered.length} of {demoWallets.length} demo wallets</div>
        </Card>
        {selected ? <Card className="h-fit shadow-none">
          <CardHeader><CardTitle className="text-base">Wallet details</CardTitle><p className="font-mono text-xs text-muted-foreground">{selected.id}</p></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Owner</p><p className="font-medium">{selected.owner}</p><p className="text-xs text-muted-foreground">{selected.ownerType} wallet</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Available balance</p><p className="mt-1 text-2xl font-semibold tabular-nums">{money(selected.available, selected.currency)}</p><div className="mt-3 flex items-center justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">Reserved / held</span><span className="font-medium tabular-nums">{money(selected.reserved, selected.currency)}</span></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Total ledger balance</span><span className="font-medium tabular-nums">{money(selected.available + selected.reserved, selected.currency)}</span></div></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Currency</span><Badge variant="secondary">{selected.currency}</Badge></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Status</span><Badge variant="outline">{selected.status}</Badge></div>
            <div className="text-xs text-muted-foreground">Last activity: {selected.updatedAt}</div>
            <Button className="w-full" variant="outline" onClick={() => window.location.assign("/dashboard/ledger")}>View ledger history</Button>
            <p className="text-xs leading-5 text-muted-foreground">Financial adjustments should be initiated as a request and require authorized review. Direct balance editing is not available.</p>
          </CardContent>
        </Card> : <Card className="flex min-h-64 items-center justify-center shadow-none"><CardContent className="text-center text-sm text-muted-foreground">Select a wallet to inspect its details.</CardContent></Card>}
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(main)/dashboard/ledger")({ component: LedgerPage });

type Entry = { account: string; direction: "Debit" | "Credit"; amount: number; currency: "TND" | "USD" | "EUR" | "USDT"; memo: string };
type Journal = { id: string; event: string; reference: string; date: string; status: "Posted" | "Reversed" | "Pending"; entries: Entry[] };
const journals: Journal[] = [
  { id: "JRN-01042", event: "Deposit completed", reference: "DEP-26010142", date: "14 Oct 2026, 10:42", status: "Posted", entries: [{ account: "Provider clearing", direction: "Debit", amount: 100, currency: "TND", memo: "Provider gross amount" }, { account: "Player wallet · PLR-48291021", direction: "Credit", amount: 98, currency: "TND", memo: "Net amount credited" }, { account: "Platform fee revenue", direction: "Credit", amount: 2, currency: "TND", memo: "Fee snapshot 2%" }] },
  { id: "JRN-01041", event: "Withdrawal hold", reference: "WDL-26010117", date: "14 Oct 2026, 10:18", status: "Posted", entries: [{ account: "Player available wallet", direction: "Debit", amount: 250, currency: "USD", memo: "Funds moved to hold" }, { account: "Player withdrawal hold", direction: "Credit", amount: 250, currency: "USD", memo: "Pending payout reservation" }] },
  { id: "JRN-01040", event: "Provider fee expense", reference: "SET-26010081", date: "14 Oct 2026, 09:50", status: "Posted", entries: [{ account: "Provider fee expense", direction: "Debit", amount: 1, currency: "TND", memo: "Provider processing fee" }, { account: "Provider clearing", direction: "Credit", amount: 1, currency: "TND", memo: "Settlement deduction" }] },
  { id: "JRN-01039", event: "Deposit reversal", reference: "REV-26010039", date: "14 Oct 2026, 09:12", status: "Reversed", entries: [{ account: "Platform fee revenue", direction: "Debit", amount: 2, currency: "TND", memo: "Original fee reversed" }, { account: "Player wallet", direction: "Debit", amount: 98, currency: "TND", memo: "Original credit reversed" }, { account: "Provider clearing", direction: "Credit", amount: 100, currency: "TND", memo: "Compensating entry" }] },
  { id: "JRN-01038", event: "Internal transfer", reference: "TRF-26010038", date: "14 Oct 2026, 08:44", status: "Pending", entries: [{ account: "Agent wallet · AG-0103", direction: "Debit", amount: 80, currency: "EUR", memo: "Transfer from sender" }, { account: "Agent wallet · AG-0108", direction: "Credit", amount: 80, currency: "EUR", memo: "Transfer to recipient" }] },
];

function money(value: number, currency: string) {
  if (currency === "USDT") return value.toFixed(6) + " USDT";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: currency === "TND" ? 3 : 2, maximumFractionDigits: currency === "TND" ? 3 : 2 }).format(value);
}
function total(entries: Entry[], direction: "Debit" | "Credit") {
  return entries.filter((entry) => entry.direction === direction).reduce((sum, entry) => sum + entry.amount, 0);
}

function LedgerPage() {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState("JRN-01042");
  const filtered = useMemo(() => journals.filter((journal) => {
    const text = [journal.id, journal.reference, journal.event, ...journal.entries.map((entry) => entry.account)].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "All" || journal.status === status) && (currency === "All" || journal.entries.some((entry) => entry.currency === currency));
  }), [query, currency, status]);
  const selected = filtered.find((journal) => journal.id === selectedId) ?? filtered[0];

  const exportCsv = () => {
    const header = ["Journal", "Event", "Reference", "Date", "Status", "Account", "Direction", "Amount", "Currency"];
    const rows = filtered.flatMap((journal) => journal.entries.map((entry) => [journal.id, journal.event, journal.reference, journal.date, journal.status, entry.account, entry.direction, entry.amount, entry.currency]));
    const csv = [header, ...rows].map((row) => row.map((value) => "\"" + String(value).replaceAll("\"", "\"\"") + "\"").join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ipaycash-ledger-demo.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpenText className="size-4" /> Finance / Ledger</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Ledger explorer</h1><p className="mt-1 text-sm text-muted-foreground">Inspect journals and entries, trace business events, and verify debit-credit balance.</p></div><Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 size-4" />Export CSV</Button></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Illustrative ledger data.</strong> These journals are examples for interface review, not accounting records. Posted entries are designed as immutable; corrections should be represented by compensating journals.</div>
    <div className="grid gap-3 sm:grid-cols-3"><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Journals shown</p><p className="mt-2 text-2xl font-semibold">{filtered.length}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Posted journals</p><p className="mt-2 text-2xl font-semibold">{filtered.filter((row) => row.status === "Posted").length}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Unposted / reversed</p><p className="mt-2 text-2xl font-semibold">{filtered.filter((row) => row.status !== "Posted").length}</p></CardContent></Card></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
      <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search journal, event, reference, account..." /></div><select aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>TND</option><option>USD</option><option>EUR</option><option>USDT</option></select><select aria-label="Journal status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All</option><option>Posted</option><option>Pending</option><option>Reversed</option></select></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr>{["Journal / Event", "Reference", "Currency", "Debit", "Status"].map((item) => <th key={item} className="px-3 py-3 font-medium whitespace-nowrap">{item}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((journal) => <tr key={journal.id} className={selected?.id === journal.id ? "bg-muted/40" : "hover:bg-muted/20"}><td className="px-3 py-3"><button className="text-left" onClick={() => setSelectedId(journal.id)}><span className="block font-mono text-xs">{journal.id}</span><span className="mt-1 block font-medium">{journal.event}</span><span className="mt-1 block text-xs text-muted-foreground">{journal.date}</span></button></td><td className="px-3 py-3 font-mono text-xs">{journal.reference}</td><td className="px-3 py-3">{journal.entries[0].currency}</td><td className="px-3 py-3 tabular-nums whitespace-nowrap">{money(total(journal.entries, "Debit"), journal.entries[0].currency)}</td><td className="px-3 py-3"><Badge variant="outline" className={journal.status === "Posted" ? "text-emerald-700" : journal.status === "Pending" ? "text-amber-700" : "text-muted-foreground"}>{journal.status}</Badge></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No journals match these filters.</td></tr>}</tbody></table></div>
      </Card>
      {selected ? <Card className="h-fit shadow-none"><CardHeader><CardTitle className="text-base">Journal detail</CardTitle><p className="font-mono text-xs text-muted-foreground">{selected.id} · {selected.reference}</p></CardHeader><CardContent className="space-y-4"><div><p className="font-medium">{selected.event}</p><p className="mt-1 text-xs text-muted-foreground">{selected.date}</p></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Posting status</span><Badge variant="outline">{selected.status}</Badge></div><div className="overflow-hidden rounded-lg border"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground"><span>Ledger account</span><span>Amount</span></div>{selected.entries.map((entry, index) => <div key={entry.account + index} className="border-b p-3 last:border-0"><p className="text-sm font-medium">{entry.account}</p><p className="mt-1 text-xs text-muted-foreground">{entry.memo}</p><div className="mt-2 flex items-center justify-between gap-2"><Badge variant="secondary">{entry.direction}</Badge><span className="text-sm font-semibold tabular-nums">{money(entry.amount, entry.currency)}</span></div></div>)}</div><div className="space-y-2 rounded-lg bg-muted/30 p-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Total debit</span><span className="font-medium tabular-nums">{money(total(selected.entries, "Debit"), selected.entries[0].currency)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Total credit</span><span className="font-medium tabular-nums">{money(total(selected.entries, "Credit"), selected.entries[0].currency)}</span></div><div className="flex justify-between border-t pt-2"><span>Balance check</span><Badge variant="outline" className={total(selected.entries, "Debit") === total(selected.entries, "Credit") ? "text-emerald-700" : "text-destructive"}>{total(selected.entries, "Debit") === total(selected.entries, "Credit") ? "Balanced (demo)" : "Out of balance"}</Badge></div></div><p className="text-xs leading-5 text-muted-foreground">This view is read-only. In production, the server and database enforce immutability and balance invariants.</p></CardContent></Card> : <Card className="flex min-h-64 items-center justify-center shadow-none"><CardContent className="text-sm text-muted-foreground">Select a journal to inspect its entries.</CardContent></Card>}
    </div>
  </section>;
}

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { financeTransactions } from "./finance-data";

export function FinanceTransactions() {
  const [query, setQuery] = React.useState("");
  const rows = financeTransactions.filter((row) =>
    [row.id, row.player, row.distributor, row.provider, row.type].some((value) =>
      value.toLowerCase().includes(query.toLowerCase()),
    ),
  );

  return (
    <section className="flex min-h-full flex-col gap-4 bg-background">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Unified ledger for deposits and withdrawals. Operational processing stays in Deposits and Withdrawals.</p>
        </div>
        <Button size="sm" variant="outline"><Download /> Export</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="h-8 w-72">
          <InputGroupAddon align="inline-start"><Search className="size-3.5" /></InputGroupAddon>
          <InputGroupInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions..." />
          <InputGroupAddon align="inline-end"><Kbd className="h-4 text-[10px]">⌘K</Kbd></InputGroupAddon>
        </InputGroup>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">All types</Button>
          <Button size="sm" variant="outline">All providers</Button>
          <Button size="sm" variant="outline">All statuses</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-5 text-[11px]">
          {[
            ["Transactions", "8"],
            ["Gross volume", "$2,539"],
            ["Fees", "$25.38"],
            ["Compensation", "$12.70"],
            ["Pending value", "$545.50"],
          ].map(([label, value]) => (
            <div key={label} className="bg-card px-3 py-3">
              <span className="block text-muted-foreground">{label}</span>
              <span className="mt-1 block text-sm font-semibold tabular-nums">{value}</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
              <tr>{["Transaction", "Player", "Distributor", "Provider", "Amount", "Fee", "Compensation", "Status", "Date"].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-medium">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.type === "Deposit" ? <ArrowDownLeft className="size-3.5 text-emerald-600" /> : <ArrowUpRight className="size-3.5 text-orange-600" />}
                      <div><p className="font-mono text-xs font-medium">{row.id}</p><p className="text-[11px] text-muted-foreground">{row.type}</p></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{row.player}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.distributor}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.provider}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{"$" + row.amount.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{"$" + row.fee.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{"$" + row.compensation.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3"><Badge variant="outline">{row.status}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">Frontend-only mockup. No provider balances or transactions are changed.</p>
    </section>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenCheck, Download, LockKeyhole, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTnd, initialLedgerEntries } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/ledger")({
  component: LedgerPage,
});

function LedgerPage() {
  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("All accounts");
  const [stateFilter, setStateFilter] = useState("All entries");

  const accounts = ["All accounts", ...Array.from(new Set(initialLedgerEntries.map((row) => row.accountName)))];
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialLedgerEntries.filter((row) => {
      const matchesAccount = accountFilter === "All accounts" || row.accountName === accountFilter;
      const matchesState = stateFilter === "All entries" || (stateFilter === "Posted" ? row.state === "Posted" : row.state === "Pending");
      const matchesQuery = !needle || [row.id, row.reference, row.accountName, row.kind, row.actor, row.shiftId, row.note].join(" ").toLowerCase().includes(needle);
      return matchesAccount && matchesState && matchesQuery;
    });
  }, [accountFilter, query, stateFilter]);

  function exportCsv() {
    const header = ["Journal ID", "Reference", "Date", "Account", "Type", "Amount TND", "Debit account", "Credit account", "Actor", "Shift", "Evidence", "State", "Note"];
    const body = rows.map((row) => [row.id, row.reference, row.date, row.accountName, row.kind, row.amount.toFixed(2), row.debitAccount, row.creditAccount, row.actor, row.shiftId, row.evidence, row.state, row.note]);
    const csv = [header, ...body].map((line) => line.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ipaycash-internal-ledger-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const posted = rows.filter((row) => row.state === "Posted");
  const pending = rows.filter((row) => row.state === "Pending");

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader
        title="Internal ledger"
        description="The internal financial journal: opening balances, customer-fund movements, recorded provider fees, reversals and unposted requests."
        icon={<BookOpenCheck className="size-5" />}
        action={<Button size="sm" variant="outline" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>}
      />
      <MockDataNotice>
        Mock journal. In production, posted entries must be append-only in the database; corrections create linked reversal entries. Do not implement immutability using a hidden edit button or browser state.
      </MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Visible journal entries</p><p className="mt-1.5 text-2xl font-semibold tabular-nums">{rows.length}</p><p className="mt-1 text-xs text-muted-foreground">All activity and control requests</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Posted entries</p><p className="mt-1.5 text-2xl font-semibold tabular-nums">{posted.length}</p><p className="mt-1 text-xs text-muted-foreground">Recorded movements</p></div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"><p className="text-xs text-muted-foreground">Not posted</p><p className="mt-1.5 text-2xl font-semibold tabular-nums">{pending.length}</p><p className="mt-1 text-xs text-muted-foreground">Requests never count toward expected balance</p></div>
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col gap-2.5 border-b p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, account, supervisor..." className="h-9 pl-9" /></div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter account" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">{accounts.map((account) => <option key={account}>{account}</option>)}</select>
            <select aria-label="Filter ledger state" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All entries</option><option>Posted</option><option>Pending</option></select>
            <Badge variant="outline" className="h-9 px-3">{rows.length} entries</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>{["Journal / reference", "Account & type", "Debit account", "Credit account", "Amount", "Actor / shift", "Evidence", "State"].map((head) => <th key={head} className="px-3 py-3 text-left font-medium">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className={row.state === "Pending" ? "bg-amber-500/[0.035] hover:bg-amber-500/[0.07]" : "hover:bg-muted/20"}>
                  <td className="px-3 py-3">
                    <p className="font-medium">{row.id}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{row.reference}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{row.date}</p>
                  </td>
                  <td className="px-3 py-3"><p className="font-medium">{row.kind}</p><p className="mt-0.5 text-xs text-muted-foreground">{row.accountName} · {row.accountId}</p><p className="mt-1 max-w-[220px] text-[10px] leading-4 text-muted-foreground">{row.note}</p></td>
                  <td className="px-3 py-3 text-xs">{row.debitAccount}</td>
                  <td className="px-3 py-3 text-xs">{row.creditAccount}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatTnd(row.amount)}<p className="mt-0.5 text-[10px] font-normal text-muted-foreground">{row.direction === "In" ? "Money in" : row.direction === "Out" ? "Money out" : "Opening / control"}</p></td>
                  <td className="px-3 py-3"><p className="font-medium">{row.actor}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{row.shiftId}</p></td>
                  <td className="px-3 py-3"><Badge variant="outline">{row.evidence}</Badge></td>
                  <td className="px-3 py-3"><TreasuryStatus status={row.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No journal entries match these filters.</div> : null}
        </div>
        <div className="flex flex-wrap items-start gap-2 border-t px-3 py-3 text-xs text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" /><span><strong className="font-medium text-foreground">Accounting rule:</strong> a pending fee request or suspected deduction is not a posted expense. It cannot reduce the ledger balance until an independent approval and evidence requirements are satisfied.</span></div>
      </Card>
    </section>
  );
}

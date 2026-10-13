import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, Download, Search, ShieldCheck, SquareArrowOutUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTnd, initialShifts, type TreasuryShift } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/shifts")({
  component: ShiftsPage,
});

function ShiftsPage() {
  const [shifts, setShifts] = useState(initialShifts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All shifts");
  const [selectedShift, setSelectedShift] = useState<TreasuryShift | null>(null);
  const [actualInput, setActualInput] = useState("");
  const [closeNote, setCloseNote] = useState("");

  const rows = useMemo(() => shifts.filter((shift) => {
    const needle = query.trim().toLowerCase();
    const matchesText = !needle || [shift.id, shift.accountName, shift.provider, shift.supervisor, shift.reviewer].join(" ").toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "All shifts" || (statusFilter === "Open shifts" ? shift.status === "Open" : statusFilter === "Variances" ? shift.status === "Variance found" || shift.status === "Awaiting review" : shift.status === "Closed" ? shift.status === "Closed · matched" : true);
    return matchesText && matchesStatus;
  }), [query, shifts, statusFilter]);

  const openCount = shifts.filter((item) => item.status === "Open").length;
  const varianceCount = shifts.filter((item) => item.status === "Variance found" || item.status === "Awaiting review").length;
  const closedCount = shifts.filter((item) => item.status === "Closed · matched").length;

  function beginClose(shift: TreasuryShift) {
    setSelectedShift(shift);
    setActualInput(shift.actualBalance === null ? String(shift.expectedBalance) : String(shift.actualBalance));
    setCloseNote("");
  }

  function closeShift() {
    if (!selectedShift || actualInput.trim() === "" || !Number.isFinite(Number(actualInput)) || Number(actualInput) < 0) return;
    const actual = Number(actualInput);
    const delta = Math.round((actual - selectedShift.expectedBalance) * 100) / 100;
    setShifts((current) => current.map((shift) => shift.id !== selectedShift.id ? shift : {
      ...shift,
      end: "28 Sep 2026, 23:59",
      actualBalance: actual,
      status: Math.abs(delta) < 0.01 ? "Closed · matched" : "Variance found",
      reviewer: "Awaiting independent review",
      note: closeNote.trim() || (Math.abs(delta) < 0.01 ? "Closing count submitted; independent review still required" : "Closing count submitted with unexplained variance of " + formatTnd(delta)),
    }));
    setSelectedShift(null);
  }

  function exportCsv() {
    const header = ["Shift", "Account", "Provider", "Supervisor", "Start", "End", "Opening balance", "Expected", "Actual", "Variance", "Transactions", "Status", "Reviewer", "Note"];
    const body = rows.map((row) => [row.id, row.accountName, row.provider, row.supervisor, row.start, row.end ?? "Open", row.openingBalance, row.expectedBalance, row.actualBalance ?? "", row.actualBalance === null ? "" : row.actualBalance - row.expectedBalance, row.transactionCount, row.status, row.reviewer, row.note]);
    const csv = [header, ...body].map((line) => line.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ipaycash-shifts-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader title="Supervisor shifts" description="Track account custody from opening balance to closing count. A closed shift is not final until an independent reviewer confirms its evidence." icon={<Clock3 className="size-5" />} action={<Button variant="outline" size="sm" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>} />
      <MockDataNotice>Closing a shift here changes only the mock table in this browser session. In production, the server must calculate the expected amount, timestamp the submission, lock the shift, and open a variance incident atomically.</MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Open shifts" value={String(openCount)} hint="Custody is still active" />
        <Summary label="Variances to review" value={String(varianceCount)} hint="Never silently write off" tone="danger" />
        <Summary label="Closed · matched" value={String(closedCount)} hint="Still requires reviewer sign-off" tone="success" />
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shift, account, supervisor..." className="h-9 pl-9" /></div>
          <select aria-label="Filter shifts" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All shifts</option><option>Open shifts</option><option>Variances</option><option>Closed</option></select>
          <Badge variant="outline" className="h-9 px-3">{rows.length} records</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Shift / period", "Account", "Accountable supervisor", "Opening", "Expected close", "Actual close", "Difference", "Activity", "Status", "Action"].map((item) => <th key={item} className="px-3 py-3 text-left font-medium">{item}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((shift) => {
                const variance = shift.actualBalance === null ? null : Math.round((shift.actualBalance - shift.expectedBalance) * 100) / 100;
                return (
                  <tr key={shift.id} className={variance !== null && variance !== 0 ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.06]" : "hover:bg-muted/20"}>
                    <td className="px-3 py-3"><p className="font-medium">{shift.id}</p><p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground">{shift.start}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{shift.end ? "Ended " + shift.end : "Still open"}</p></td>
                    <td className="px-3 py-3"><p className="font-medium">{shift.accountName}</p><p className="text-[11px] text-muted-foreground">{shift.provider} · {shift.accountId}</p></td>
                    <td className="px-3 py-3"><p>{shift.supervisor}</p><p className="mt-0.5 text-[11px] text-muted-foreground">Reviewer: {shift.reviewer}</p></td>
                    <td className="px-3 py-3 tabular-nums">{formatTnd(shift.openingBalance)}</td>
                    <td className="px-3 py-3 font-medium tabular-nums">{formatTnd(shift.expectedBalance)}</td>
                    <td className="px-3 py-3 tabular-nums">{shift.actualBalance === null ? "Not submitted" : formatTnd(shift.actualBalance)}</td>
                    <td className={"px-3 py-3 font-semibold tabular-nums " + (variance === null || variance === 0 ? "text-muted-foreground" : variance < 0 ? "text-rose-600" : "text-amber-700")}>{variance === null ? "—" : variance === 0 ? "—" : (variance > 0 ? "+" : "−") + formatTnd(Math.abs(variance))}</td>
                    <td className="px-3 py-3 tabular-nums">{shift.transactionCount} txns</td>
                    <td className="px-3 py-3"><TreasuryStatus status={shift.status} /><p className="mt-1 max-w-44 text-[10px] leading-4 text-muted-foreground">{shift.note}</p></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-1.5">{shift.status === "Open" ? <Button size="sm" onClick={() => beginClose(shift)}>Close shift</Button> : <Link to={"/dashboard/transactions/incidents" as never} className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs hover:bg-muted">{variance ? "Investigate" : "Review"} <SquareArrowOutUpRight className="size-3" /></Link>}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No shifts match the selected filters.</div> : null}
        </div>
      </Card>

      <div className="rounded-xl border px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-muted-foreground" /> Shift closing policy</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Expected closing balance is derived from posted ledger entries. Submitted actual balance is a separate claim; it cannot rewrite the ledger. A non-zero difference stays open as a discrepancy until an independent reviewer approves an evidence-backed resolution.</p>
        <div className="mt-2"><Link to={"/dashboard/transactions/handovers" as never} className="text-xs font-medium text-primary hover:underline">Continue to handovers →</Link></div>
      </div>

      <Dialog open={Boolean(selectedShift)} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Submit closing count</DialogTitle><DialogDescription>{selectedShift?.accountName} · {selectedShift?.id}. The expected balance is calculated from the internal ledger.</DialogDescription></DialogHeader>
          {selectedShift ? <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Expected balance</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatTnd(selectedShift.expectedBalance)}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Opening balance</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatTnd(selectedShift.openingBalance)}</p></div></div>
            <div className="space-y-2"><Label htmlFor="actual-balance">Actual balance counted (TND)</Label><Input id="actual-balance" type="number" min="0" step="0.01" value={actualInput} onChange={(event) => setActualInput(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="close-note">Closing note / evidence reference</Label><Input id="close-note" value={closeNote} onChange={(event) => setCloseNote(event.target.value)} placeholder="Receipt ID, statement reference, or explanation" /></div>
            {actualInput !== "" && Number.isFinite(Number(actualInput)) ? <div className={Math.abs(Number(actualInput) - selectedShift.expectedBalance) < 0.01 ? "rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700" : "rounded-lg bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700"}>Calculated difference: <strong className="tabular-nums">{Number(actualInput) - selectedShift.expectedBalance > 0 ? "+" : ""}{formatTnd(Number(actualInput) - selectedShift.expectedBalance)}</strong>. {Math.abs(Number(actualInput) - selectedShift.expectedBalance) < 0.01 ? "A reviewer sign-off is still required." : "The shift will be flagged for investigation."}</div> : null}
          </div> : null}
          <DialogFooter><Button variant="outline" onClick={() => setSelectedShift(null)}>Cancel</Button><Button onClick={closeShift} disabled={actualInput.trim() === "" || !Number.isFinite(Number(actualInput)) || Number(actualInput) < 0}>Submit closing count</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Summary({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "danger" | "success" }) {
  const color = tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-foreground";
  return <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={"mt-1.5 text-2xl font-semibold tabular-nums " + color}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
}

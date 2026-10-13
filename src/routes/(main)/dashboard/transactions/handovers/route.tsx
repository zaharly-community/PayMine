import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, CheckCheck, ClipboardSignature, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTnd, initialHandovers, type TreasuryHandover } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/handovers")({
  component: HandoversPage,
});

function HandoversPage() {
  const [handovers, setHandovers] = useState(initialHandovers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All handovers");
  const [selected, setSelected] = useState<TreasuryHandover | null>(null);
  const [receivedBalance, setReceivedBalance] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  const rows = useMemo(() => handovers.filter((row) => {
    const text = query.trim().toLowerCase();
    const matchesText = !text || [row.id, row.accountName, row.accountId, row.outgoing, row.incoming, row.note].join(" ").toLowerCase().includes(text);
    const matchesStatus = statusFilter === "All handovers" || row.status === statusFilter;
    return matchesText && matchesStatus;
  }), [handovers, query, statusFilter]);

  const disputedCount = handovers.filter((row) => row.status === "Disputed" || row.status === "Escalated").length;
  const pendingCount = handovers.filter((row) => row.status === "Pending confirmation").length;

  function openConfirm(row: TreasuryHandover) {
    setSelected(row);
    setReceivedBalance(row.receivedBalance === null ? String(row.expectedBalance) : String(row.receivedBalance));
    setReceiptNote("");
  }

  function confirmReceipt() {
    if (!selected || receivedBalance.trim() === "" || !Number.isFinite(Number(receivedBalance)) || Number(receivedBalance) < 0) return;
    const value = Number(receivedBalance);
    const variance = Math.round((value - selected.expectedBalance) * 100) / 100;
    setHandovers((current) => current.map((row) => row.id !== selected.id ? row : ({
      ...row,
      receivedBalance: value,
      variance,
      status: Math.abs(variance) < 0.01 ? "Accepted" : "Disputed",
      evidence: receiptNote.trim() ? "Incoming confirmation entered · " + receiptNote.trim() : "Incoming confirmation entered; independent evidence not attached",
      note: Math.abs(variance) < 0.01 ? "Counts match in demo; independent review remains required" : "Balance mismatch of " + formatTnd(variance) + "; preserve both declarations and open an incident",
    })));
    setSelected(null);
  }

  function escalate(id: string) {
    setHandovers((current) => current.map((row) => row.id !== id ? row : ({ ...row, status: "Escalated", note: "Escalated for independent review; outgoing and incoming amounts remain unchanged" })));
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader title="Account handovers" description="A custody transfer between supervisors. The outgoing count and incoming count must be recorded separately; neither party can overwrite the other party's value." icon={<ArrowLeftRight className="size-5" />} action={<Badge variant="outline">Dual confirmation</Badge>} />
      <MockDataNotice>These are local mock interactions. A production handover should create an immutable event for each party's confirmation, capture identity and time on the server, and block the receiving supervisor from editing the sender's count.</MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Total handovers" value={String(handovers.length)} note="Recorded custody changes" />
        <Metric label="Pending confirmation" value={String(pendingCount)} note="Incoming count not supplied" tone="warning" />
        <Metric label="Disputed / escalated" value={String(disputedCount)} note="Balances require independent review" tone="danger" />
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1 md:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search handover, account, supervisor..." className="h-9 pl-9" /></div>
          <select aria-label="Filter handovers" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All handovers</option><option>Accepted</option><option>Disputed</option><option>Pending confirmation</option><option>Escalated</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Handover / time", "Payment account", "Outgoing supervisor", "Incoming supervisor", "Expected", "Received", "Variance", "Status", "Action"].map((heading) => <th key={heading} className="px-3 py-3 text-left font-medium">{heading}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className={row.variance !== null && row.variance !== 0 ? "bg-rose-500/[0.035] hover:bg-rose-500/[0.06]" : "hover:bg-muted/20"}>
                  <td className="px-3 py-3"><p className="font-medium">{row.id}</p><p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground">{row.timestamp}</p></td>
                  <td className="px-3 py-3"><p className="font-medium">{row.accountName}</p><p className="text-[11px] text-muted-foreground">{row.accountId}</p><p className="mt-1 max-w-[190px] text-[10px] leading-4 text-muted-foreground">{row.evidence}</p></td>
                  <td className="px-3 py-3">{row.outgoing}</td>
                  <td className="px-3 py-3">{row.incoming}</td>
                  <td className="px-3 py-3 font-medium tabular-nums">{formatTnd(row.expectedBalance)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.receivedBalance === null ? "Not submitted" : formatTnd(row.receivedBalance)}</td>
                  <td className={"px-3 py-3 font-semibold tabular-nums " + (row.variance === null || row.variance === 0 ? "text-muted-foreground" : "text-rose-600")}>{row.variance === null ? "—" : row.variance === 0 ? "—" : (row.variance > 0 ? "+" : "−") + formatTnd(Math.abs(row.variance))}</td>
                  <td className="px-3 py-3"><TreasuryStatus status={row.status} /><p className="mt-1 max-w-48 text-[10px] leading-4 text-muted-foreground">{row.note}</p></td>
                  <td className="px-3 py-3"><div className="flex items-center gap-1.5">{row.status === "Pending confirmation" ? <Button size="sm" onClick={() => openConfirm(row)}>Confirm receipt</Button> : row.status === "Disputed" ? <Button size="sm" variant="outline" onClick={() => escalate(row.id)}>Escalate</Button> : <Badge variant="outline">{row.status === "Accepted" ? "Recorded" : "Under review"}</Badge>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No handovers match the current filters.</div> : null}
        </div>
      </Card>

      <Card className="shadow-none">
        <div className="flex items-start gap-3 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div><p className="text-sm font-medium">When counts do not match</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Do not force acceptance or alter the expected amount. Keep both submitted values, record any supporting statement separately, suspend further custody transfer when risk policy requires it, and open an incident linked to this handover and its shift.</p></div>
        </div>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Confirm receipt of account</DialogTitle><DialogDescription>{selected?.accountName} · {selected?.id}. This records the incoming supervisor's count separately from the outgoing count.</DialogDescription></DialogHeader>
          {selected ? <div className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Expected balance from ledger</p><p className="mt-1 text-xl font-semibold tabular-nums">{formatTnd(selected.expectedBalance)}</p></div>
            <div className="space-y-2"><Label htmlFor="handover-received">Actual received balance (TND)</Label><Input id="handover-received" type="number" min="0" step="0.01" value={receivedBalance} onChange={(event) => setReceivedBalance(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="handover-proof">Evidence / statement reference</Label><Input id="handover-proof" value={receiptNote} onChange={(event) => setReceiptNote(event.target.value)} placeholder="Enter a receipt ID or statement reference" /></div>
            {receivedBalance !== "" && Number.isFinite(Number(receivedBalance)) ? <div className={Math.abs(Number(receivedBalance) - selected.expectedBalance) < 0.01 ? "rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700" : "rounded-lg bg-rose-500/10 p-3 text-sm text-rose-700"}>Difference: <strong>{Number(receivedBalance) - selected.expectedBalance > 0 ? "+" : ""}{formatTnd(Number(receivedBalance) - selected.expectedBalance)}</strong>. {Math.abs(Number(receivedBalance) - selected.expectedBalance) < 0.01 ? "The count matches but still needs independent review." : "The handover will remain disputed and should be investigated."}</div> : null}
          </div> : null}
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button onClick={confirmReceipt} disabled={receivedBalance.trim() === "" || !Number.isFinite(Number(receivedBalance)) || Number(receivedBalance) < 0}><CheckCheck className="size-4" /> Submit confirmation</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Metric({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: "default" | "warning" | "danger" }) {
  const valueColor = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-700" : "text-foreground";
  return <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={"mt-1.5 text-2xl font-semibold tabular-nums " + valueColor}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>;
}

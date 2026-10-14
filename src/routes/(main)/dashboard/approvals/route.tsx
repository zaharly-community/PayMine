import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, Clock3, Search, ShieldAlert, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/(main)/dashboard/approvals")({ component: ApprovalsPage });

type ApprovalStatus = "Pending review" | "Approved (demo)" | "Rejected (demo)";
type Approval = { id: string; type: string; brand: string; requestedBy: string; reviewer: string; amount: number; currency: "TND" | "USD"; risk: "Standard" | "High"; age: string; reason: string; status: ApprovalStatus };
const initialApprovals: Approval[] = [
  { id: "APR-20261014-021", type: "High-value withdrawal", brand: "Betcon Demo", requestedBy: "Yassine Kallel", reviewer: "Unassigned", amount: 18450, currency: "TND", risk: "High", age: "8 min", reason: "Withdrawal exceeds configured supervisor threshold.", status: "Pending review" },
  { id: "APR-20261014-020", type: "Manual adjustment request", brand: "Northline Demo", requestedBy: "Maya Chen", reviewer: "Unassigned", amount: 250, currency: "USD", risk: "High", age: "17 min", reason: "Adjustment requested after a provider mismatch; evidence review required.", status: "Pending review" },
  { id: "APR-20261014-019", type: "Refund / reversal", brand: "Betcon Demo", requestedBy: "Omar Ben Ali", reviewer: "Unassigned", amount: 100, currency: "TND", risk: "Standard", age: "42 min", reason: "Customer support reported a duplicate deposit.", status: "Pending review" },
  { id: "APR-20261014-018", type: "Reconciliation difference", brand: "Atlas Demo", requestedBy: "Finance assistant", reviewer: "Unassigned", amount: 86, currency: "TND", risk: "High", age: "1 h", reason: "Provider statement and internal record do not match.", status: "Pending review" },
];

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: currency === "TND" ? 3 : 2, maximumFractionDigits: currency === "TND" ? 3 : 2 }).format(amount);
}

function ApprovalsPage() {
  const [rows, setRows] = useState(initialApprovals);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(initialApprovals[0].id);
  const [reviewNote, setReviewNote] = useState("");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => rows.filter((row) => [row.id, row.type, row.brand, row.requestedBy, row.reason].join(" ").toLowerCase().includes(query.toLowerCase()) && (statusFilter === "All" || row.status === statusFilter)), [rows, query, statusFilter]);
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0];
  const pendingCount = rows.filter((row) => row.status === "Pending review").length;

  const decide = (decision: "Approved (demo)" | "Rejected (demo)") => {
    if (!selected) return;
    if (decision === "Rejected (demo)" && reviewNote.trim().length < 5) {
      setNotice("Add a clear reason before rejecting this request.");
      return;
    }
    setRows((current) => current.map((row) => row.id === selected.id ? { ...row, status: decision, reviewer: "Current demo reviewer" } : row));
    setNotice("Demo only: review decision saved in local page state. No withdrawal, refund, adjustment or ledger posting was executed.");
    setReviewNote("");
  };

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header><div className="flex items-center gap-2 text-sm text-muted-foreground"><ClipboardCheck className="size-4" /> Operations / Approvals</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Approval center</h1><p className="mt-1 text-sm text-muted-foreground">Review sensitive financial actions with maker-checker separation, evidence and an auditable decision.</p></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Prototype mode.</strong> Decisions update this screen only. Production approval must verify server-side permissions, enforce separation of duties and post financial effects atomically with the ledger.</div>
    {notice && <div role="status" className="rounded-lg border px-4 py-3 text-sm">{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-3"><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Awaiting review</p><p className="mt-2 text-2xl font-semibold">{pendingCount}</p><p className="mt-1 text-xs text-muted-foreground">Requests awaiting an authorized reviewer</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">High risk</p><p className="mt-2 text-2xl font-semibold">{rows.filter((row) => row.risk === "High" && row.status === "Pending review").length}</p><p className="mt-1 text-xs text-muted-foreground">Prioritize high-impact actions</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Reviewed in demo</p><p className="mt-2 text-2xl font-semibold">{rows.filter((row) => row.status !== "Pending review").length}</p><p className="mt-1 text-xs text-muted-foreground">Local UI decisions, not real approvals</p></CardContent></Card></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
      <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search request, brand or requester..." /></div><select aria-label="Approval status" className="h-9 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Pending review</option><option>Approved (demo)</option><option>Rejected (demo)</option></select></div>
        <div className="divide-y">{filtered.map((row) => <button key={row.id} onClick={() => { setSelectedId(row.id); setNotice(""); }} className={"w-full p-4 text-left transition-colors hover:bg-muted/30 " + (selected?.id === row.id ? "bg-muted/40" : "")}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{row.type}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{row.id}</p><p className="mt-2 text-xs text-muted-foreground">{row.brand} · Requested by {row.requestedBy}</p></div><p className="shrink-0 text-right font-semibold tabular-nums">{money(row.amount, row.currency)}<span className="mt-1 block text-xs font-normal text-muted-foreground">{row.age}</span></p></div><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline" className={row.risk === "High" ? "text-destructive" : ""}>{row.risk} risk</Badge><Badge variant="outline">{row.status}</Badge></div></button>)}{filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No requests match these filters.</div>}</div>
      </Card>
      {selected ? <Card className="h-fit shadow-none"><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle className="text-base">Review request</CardTitle><Badge variant="outline" className={selected.risk === "High" ? "text-destructive" : ""}>{selected.risk} risk</Badge></div><p className="font-mono text-xs text-muted-foreground">{selected.id}</p></CardHeader><CardContent className="space-y-4"><div><p className="font-medium">{selected.type}</p><p className="mt-1 text-sm text-muted-foreground">{selected.brand}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Requested amount</p><p className="mt-1 text-2xl font-semibold tabular-nums">{money(selected.amount, selected.currency)}</p><p className="mt-1 text-xs text-muted-foreground">Currency: {selected.currency}</p></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Requester</p><p className="mt-1 font-medium">{selected.requestedBy}</p></div><div><p className="text-xs text-muted-foreground">Reviewer</p><p className="mt-1 font-medium">{selected.reviewer}</p></div></div><div><p className="mb-1 text-xs text-muted-foreground">Reason / supporting context</p><p className="rounded-lg bg-muted/40 p-3 text-sm leading-5">{selected.reason}</p></div><div className="space-y-2"><label htmlFor="review-note" className="text-sm font-medium">Review note {selected.status === "Pending review" ? "(required for rejection)" : ""}</label><Textarea id="review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Record the decision rationale..." rows={3} disabled={selected.status !== "Pending review"} /></div>{selected.status === "Pending review" ? <div className="grid grid-cols-2 gap-2"><Button onClick={() => decide("Approved (demo)")}><CheckCircle2 className="mr-2 size-4" />Approve (demo)</Button><Button variant="destructive" onClick={() => decide("Rejected (demo)")}><XCircle className="mr-2 size-4" />Reject</Button></div> : <div className="rounded-lg border p-3 text-sm"><CheckCircle2 className="mr-2 inline size-4" />Decision: {selected.status}</div>}<p className="text-xs leading-5 text-muted-foreground">A requester must not approve their own sensitive action. Production audit events should retain actor, reason, timestamp and the originating request.</p></CardContent></Card> : <Card className="min-h-48 shadow-none"><CardContent className="p-8 text-sm text-muted-foreground">Select a request to review.</CardContent></Card>}
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldAlert className="size-4" /><Clock3 className="size-4" /> High-value or manual money movement should always follow the server-defined approval threshold.</div>
  </section>;
}

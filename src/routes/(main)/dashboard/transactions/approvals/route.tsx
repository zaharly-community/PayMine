import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, FilePlus2, LockKeyhole, Search, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTnd, initialApprovals, type TreasuryApproval } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Pending only");
  const [feedback, setFeedback] = useState("");

  const rows = useMemo(() => approvals.filter((row) => {
    const needle = query.trim().toLowerCase();
    const matchesText = !needle || [row.id, row.accountName, row.accountId, row.kind, row.requester, row.approver, row.reason].join(" ").toLowerCase().includes(needle);
    const isPending = row.status === "Pending" || row.status === "Evidence requested";
    return matchesText && (filter === "All requests" || (filter === "Pending only" ? isPending : row.status === filter));
  }), [approvals, filter, query]);

  const pendingCount = approvals.filter((item) => item.status === "Pending" || item.status === "Evidence requested").length;
  const blockedCount = approvals.filter((item) => item.status === "Pending" && !canApprove(item)).length;
  const approvedCount = approvals.filter((item) => item.status === "Approved").length;

  function canApprove(item: TreasuryApproval) {
    const neededEvidence = item.risk === "High" ? 2 : 1;
    return item.requester !== item.approver && item.evidenceCount >= neededEvidence;
  }

  function updateRequest(id: string, patch: Partial<TreasuryApproval>, message: string) {
    setApprovals((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    setFeedback(message);
  }

  function requestEvidence(item: TreasuryApproval) {
    updateRequest(item.id, { status: "Evidence requested" }, "Evidence requested for " + item.id + ". No financial entry was posted.");
  }

  function addEvidenceDemo(item: TreasuryApproval) {
    updateRequest(item.id, { evidenceCount: item.evidenceCount + 1, status: "Pending" }, "A demo evidence item was added to " + item.id + ". Verify the actual document in production.");
  }

  function approveDemo(item: TreasuryApproval) {
    if (!canApprove(item) || item.status !== "Pending") return;
    updateRequest(item.id, { status: "Approved" }, item.id + " marked approved in mock data. Production must atomically post the linked, balanced journal entry after server-side validation.");
  }

  function rejectDemo(item: TreasuryApproval) {
    if (item.status !== "Pending" && item.status !== "Evidence requested") return;
    updateRequest(item.id, { status: "Rejected" }, item.id + " rejected in mock data. The original ledger and account balance were not changed.");
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader title="Financial approvals" description="Independent review for provider fees, refunds, manual balance changes, reversals and disputed transactions. Approval requests are separate from posted ledger entries." icon={<ClipboardCheck className="size-5" />} action={<Badge variant="outline">{pendingCount} pending</Badge>} />
      <MockDataNotice>Buttons below only change demo state in this browser session. Production must enforce maker-checker separation, permissions, evidence thresholds, amount limits and balanced journal posting in a trusted backend transaction.</MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Waiting for decision" value={String(pendingCount)} detail="Pending + evidence requested" />
        <Metric label="Blocked by control rules" value={String(blockedCount)} detail="Missing evidence / required control" tone="danger" />
        <Metric label="Approved in this demo" value={String(approvedCount)} detail="No real money movement" tone="success" />
      </div>

      {feedback ? <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm"><p>{feedback}</p><button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setFeedback("")} aria-label="Dismiss message">×</button></div> : null}

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9" placeholder="Search request, account, requester..." /></div>
          <select aria-label="Filter approval requests" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>Pending only</option><option>All requests</option><option>Pending</option><option>Evidence requested</option><option>Approved</option><option>Rejected</option></select>
        </div>
        <div className="divide-y">
          {rows.map((item) => {
            const approvable = canApprove(item) && item.status === "Pending";
            const isOpen = item.status === "Pending" || item.status === "Evidence requested";
            return (
              <div key={item.id} className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)_auto] xl:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.kind}</p><TreasuryStatus status={item.status} /><Badge variant="outline">{item.risk} risk</Badge></div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.id} · {item.createdAt} · {item.accountName} ({item.accountId})</p>
                  <p className="mt-2 max-w-2xl text-sm leading-5">{item.reason}</p>
                  <p className="mt-2 text-base font-semibold tabular-nums">{formatTnd(item.amount)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Requested by</p><p className="mt-1 text-xs font-medium">{item.requester}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Independent approver</p><p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium"><ShieldCheck className="size-3.5 text-muted-foreground" />{item.approver}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Evidence</p><p className={"mt-1 text-xs font-medium " + (item.evidenceCount === 0 ? "text-rose-600" : "text-foreground")}>{item.evidenceCount} item(s) attached{item.risk === "High" ? " · 2 required for high risk" : " · at least 1 required"}</p></div>
                  {!approvable && isOpen ? <p className="text-[11px] leading-4 text-amber-700 dark:text-amber-400">Approval blocked until the required independent evidence is attached.</p> : null}
                </div>
                <div className="flex flex-wrap gap-2 xl:w-36 xl:flex-col">
                  {isOpen ? <>
                    <Button size="sm" className="flex-1 xl:w-full" disabled={!approvable} onClick={() => approveDemo(item)}><CheckCircle2 className="size-4" /> Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1 xl:w-full" onClick={() => requestEvidence(item)}><FilePlus2 className="size-4" /> Request evidence</Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-destructive hover:text-destructive xl:w-full" onClick={() => rejectDemo(item)}><XCircle className="size-4" /> Reject</Button>
                    {item.evidenceCount < (item.risk === "High" ? 2 : 1) ? <Button size="sm" variant="outline" className="xl:w-full" onClick={() => addEvidenceDemo(item)}>Add evidence (demo)</Button> : null}
                  </> : <Badge variant="outline" className="w-fit">{item.status}</Badge>}
                </div>
              </div>
            );
          })}
          {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No approval requests match these filters.</div> : null}
        </div>
      </Card>

      <Card className="shadow-none">
        <CardContent className="flex items-start gap-3 p-4">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div><p className="text-sm font-medium">Approval policy</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Approval records who requested and who decided, preserves rejection reasons, and prevents self-approval. High-risk requests in this mock require two evidence items. Even an approved request is not complete until the backend validates the policy and posts an immutable, balanced journal transaction.</p></div>
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "danger" | "success" }) {
  const color = tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-foreground";
  return <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={"mt-1.5 text-2xl font-semibold tabular-nums " + color}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

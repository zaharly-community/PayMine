import * as React from "react";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileWarning,
  Filter,
  Link2,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type IssueStatus = "Open" | "Investigating" | "Awaiting Evidence" | "Ready for Review" | "Escalated" | "Resolved";
type IssueCategory = "Reconciliation" | "Transaction" | "Treasury" | "Security" | "Provider";

type Issue = {
  id: string;
  title: string;
  category: IssueCategory;
  entity: string;
  amount?: number;
  currency?: string;
  status: IssueStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  detectedBy: string;
  detectedAt: string;
  assignedTo: string;
  summary: string;
  relatedTransactions: string[];
  relatedDistributors: string[];
  timeline: { time: string; title: string; detail: string }[];
};

const initialIssues: Issue[] = [
  {
    id: "RECON-00041",
    title: "D17 provider balance mismatch",
    category: "Reconciliation",
    entity: "D17",
    amount: 1075,
    currency: "USD",
    status: "Investigating",
    priority: "High",
    detectedBy: "Provider reconciliation check",
    detectedAt: "18 Sep 2026, 04:32 PM",
    assignedTo: "Finance",
    summary: "The provider-side balance is lower than the expected internal balance.",
    relatedTransactions: ["DEP-02026002", "DEP-02026013", "WDL-02026009"],
    relatedDistributors: ["SUP-000184", "SUP-000203", "SUP-000221"],
    timeline: [
      { time: "04:32 PM", title: "Mismatch detected", detail: "Expected $12,950 vs actual provider balance $11,875." },
      { time: "04:40 PM", title: "Issue created automatically", detail: "The reconciliation rule opened a case because the variance exceeded the configured tolerance." },
      { time: "04:46 PM", title: "Assigned to Finance", detail: "Case moved to investigation for provider-side review." },
    ],
  },
  {
    id: "RECON-00038",
    title: "Visa provider variance",
    category: "Reconciliation",
    entity: "Visa",
    amount: 350,
    currency: "USD",
    status: "Awaiting Evidence",
    priority: "Medium",
    detectedBy: "Provider reconciliation check",
    detectedAt: "18 Sep 2026, 04:21 PM",
    assignedTo: "Finance",
    summary: "The provider balance is lower than the internal expected amount and requires provider evidence.",
    relatedTransactions: ["DEP-02026004", "WDL-02026004"],
    relatedDistributors: ["SUP-000203"],
    timeline: [
      { time: "04:21 PM", title: "Mismatch detected", detail: "Expected $42,300 vs actual provider balance $41,950." },
      { time: "04:28 PM", title: "Evidence requested", detail: "Provider statement and account activity are required before resolution." },
    ],
  },
  {
    id: "TXN-00217",
    title: "Withdrawal amount needs review",
    category: "Transaction",
    entity: "WDL-02026017",
    amount: 2140,
    currency: "USD",
    status: "Open",
    priority: "High",
    detectedBy: "Transaction anomaly rule",
    detectedAt: "18 Sep 2026, 03:18 PM",
    assignedTo: "Risk",
    summary: "The transaction triggered the configured anomaly threshold and needs human review.",
    relatedTransactions: ["WDL-02026017"],
    relatedDistributors: ["SUP-000284"],
    timeline: [
      { time: "03:18 PM", title: "Anomaly detected", detail: "Transaction exceeded the configured review threshold." },
      { time: "03:18 PM", title: "Issue created automatically", detail: "Risk rule opened a review case without changing the transaction state." },
    ],
  },
  {
    id: "SEC-00012",
    title: "Provider account access requires review",
    category: "Security",
    entity: "D17",
    status: "Escalated",
    priority: "Critical",
    detectedBy: "Provider access activity",
    detectedAt: "18 Sep 2026, 02:54 PM",
    assignedTo: "Security",
    summary: "Provider access activity was flagged and escalated for investigation.",
    relatedTransactions: [],
    relatedDistributors: ["SUP-000184", "SUP-000203"],
    timeline: [
      { time: "02:54 PM", title: "Access event flagged", detail: "The provider account activity crossed the configured review rule." },
      { time: "03:05 PM", title: "Escalated to Security", detail: "Case requires a security review before closure." },
    ],
  },
  {
    id: "SET-00009",
    title: "Settlement ready for review",
    category: "Treasury",
    entity: "Flouci",
    amount: 2500,
    currency: "USD",
    status: "Ready for Review",
    priority: "Low",
    detectedBy: "Settlement workflow",
    detectedAt: "17 Sep 2026, 06:00 PM",
    assignedTo: "Finance",
    summary: "A provider settlement has been prepared and is waiting for final review.",
    relatedTransactions: ["SET-0018"],
    relatedDistributors: [],
    timeline: [
      { time: "06:00 PM", title: "Settlement prepared", detail: "Available reconciled balance was selected for settlement." },
      { time: "06:08 PM", title: "Ready for review", detail: "The case is waiting for the final reviewer." },
    ],
  },
  {
    id: "TXN-00194",
    title: "Duplicate transaction reference",
    category: "Transaction",
    entity: "DEP-02026031",
    amount: 480,
    currency: "USD",
    status: "Resolved",
    priority: "Medium",
    detectedBy: "Transaction integrity rule",
    detectedAt: "17 Sep 2026, 11:42 AM",
    assignedTo: "Risk",
    summary: "A duplicate provider reference was detected and later confirmed as a duplicate callback.",
    relatedTransactions: ["DEP-02026031", "DEP-02026028"],
    relatedDistributors: ["AGT-000395"],
    timeline: [
      { time: "11:42 AM", title: "Duplicate detected", detail: "The same provider reference was seen on two internal records." },
      { time: "12:10 PM", title: "Evidence reviewed", detail: "Provider reference and internal callbacks were compared." },
      { time: "12:32 PM", title: "Resolved", detail: "The duplicate callback was confirmed and the case was closed." },
    ],
  },
];

const statusMeta: Record<IssueStatus, string> = {
  Open: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Investigating: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Awaiting Evidence": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Ready for Review": "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Escalated: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  Resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const priorityMeta: Record<Issue["priority"], string> = {
  Low: "border-border bg-muted/40 text-muted-foreground",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  High: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Critical: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="mt-1 block text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full", statusMeta[status])}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: Issue["priority"] }) {
  return (
    <Badge variant="outline" className={cn("rounded-full", priorityMeta[priority])}>
      {priority}
    </Badge>
  );
}

function IssueDetail({
  issue,
  onStatusChange,
}: {
  issue: Issue;
  onStatusChange: (status: IssueStatus) => void;
}) {
  const [resolutionNote, setResolutionNote] = React.useState("");

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Issue ID" value={issue.id} />
        <Metric label="Category" value={issue.category} />
        <Metric label="Priority" value={issue.priority} />
        <Metric label="Assigned to" value={issue.assignedTo} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Detection & context</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{issue.summary}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Detected by</span>
              <span className="mt-1 block text-sm font-medium">{issue.detectedBy}</span>
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Detected at</span>
              <span className="mt-1 block text-sm font-medium">{issue.detectedAt}</span>
            </div>
            {issue.amount ? (
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Variance / amount</span>
                <span className="mt-1 block text-sm font-semibold tabular-nums">
                  {issue.category === "Reconciliation" ? "-" : ""}{new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: issue.currency ?? "USD",
                  }).format(issue.amount)}
                </span>
              </div>
            ) : null}
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Entity</span>
              <span className="mt-1 block text-sm font-medium">{issue.entity}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Status workflow</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Move the case through review without silently changing balances.</p>
          </div>
          <div className="space-y-2 p-4">
            {(["Open", "Investigating", "Awaiting Evidence", "Ready for Review", "Escalated", "Resolved"] as IssueStatus[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(status)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                    issue.status === status
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30",
                  )}
                >
                  <span>{status}</span>
                  {issue.status === status ? <Check className="size-3.5 text-primary" /> : null}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Related entities</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">The records that should be reviewed before resolving the case.</p>
          </div>
          <Link2 className="size-4 text-muted-foreground" />
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Transactions</p>
            <div className="space-y-1.5">
              {issue.relatedTransactions.length > 0 ? issue.relatedTransactions.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                  <span className="font-mono">{item}</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              )) : <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">No transaction linked.</div>}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Distributors</p>
            <div className="space-y-1.5">
              {issue.relatedDistributors.length > 0 ? issue.relatedDistributors.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                  <span className="font-mono">{item}</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              )) : <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">No distributor linked.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Investigation timeline</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Every case action remains visible in the UI for review.</p>
        </div>
        <div className="divide-y">
          {issue.timeline.map((entry) => (
            <div key={entry.time + entry.title} className="flex gap-3 px-4 py-3">
              <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock3 className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{entry.title}</span>
                  <span className="text-[10px] text-muted-foreground">{entry.time}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{entry.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Evidence</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Mock attachments and references for this frontend template.</p>
          </div>
          <div className="space-y-2 p-4">
            {["Provider statement", "Transaction reference", "Internal ledger snapshot"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <FileWarning className="size-3.5 text-muted-foreground" />
                  <span>{item}</span>
                </div>
                <Button type="button" size="sm" variant="ghost">View</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Resolution</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Document the reason before a case is marked resolved.</p>
          </div>
          <div className="space-y-3 p-4">
            <Input
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              placeholder="Resolution note..."
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onStatusChange("Awaiting Evidence")}>
                Request evidence
              </Button>
              <Button type="button" size="sm" disabled={!resolutionNote.trim()} onClick={() => onStatusChange("Resolved")}>
                <CheckCircle2 />
                Mark resolved
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IssuesPage() {
  const [issues, setIssues] = React.useState(initialIssues);
  const [selectedIssueId, setSelectedIssueId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"All" | IssueStatus>("All");
  const [categoryFilter, setCategoryFilter] = React.useState<"All" | IssueCategory>("All");
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [issue.id, issue.title, issue.entity, issue.assignedTo].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const updateStatus = (status: IssueStatus) => {
    if (!selectedIssueId) return;
    setIssues((current) => current.map((issue) => issue.id === selectedIssueId ? { ...issue, status } : issue));
  };

  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) ?? null;

  const counts = {
    open: issues.filter((issue) => issue.status === "Open").length,
    investigating: issues.filter((issue) => issue.status === "Investigating").length,
    evidence: issues.filter((issue) => issue.status === "Awaiting Evidence").length,
    escalated: issues.filter((issue) => issue.status === "Escalated").length,
    resolved: issues.filter((issue) => issue.status === "Resolved").length,
  };

  return (
    <section data-content-padding="false" className="flex min-h-full flex-col bg-background">
      <div className="border-b px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Issues & Investigations</h1>
              <Badge variant="secondary">Frontend template</Badge>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Central workspace for reconciliation gaps, transaction anomalies, treasury issues, provider access reviews, and their resolution workflow.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            Create issue
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Open" value={String(counts.open)} />
          <Metric label="Investigating" value={String(counts.investigating)} />
          <Metric label="Awaiting evidence" value={String(counts.evidence)} />
          <Metric label="Escalated" value={String(counts.escalated)} />
          <Metric label="Resolved" value={String(counts.resolved)} />
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-60 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search issues..." className="h-8 pl-9" />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Awaiting Evidence">Awaiting Evidence</option>
                <option value="Ready for Review">Ready for Review</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="All">All categories</option>
                <option value="Reconciliation">Reconciliation</option>
                <option value="Transaction">Transaction</option>
                <option value="Treasury">Treasury</option>
                <option value="Security">Security</option>
                <option value="Provider">Provider</option>
              </select>
              <Button type="button" variant="outline" size="sm">
                <Filter />
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Detected by</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <button type="button" className="text-left" onClick={() => setSelectedIssueId(issue.id)}>
                        <div className="font-medium">{issue.title}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{issue.id}</div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs">{issue.category}</td>
                    <td className="px-4 py-3 font-medium">{issue.entity}</td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {issue.amount
                        ? (issue.category === "Reconciliation" ? "-" : "") +
                          new Intl.NumberFormat("en-US", { style: "currency", currency: issue.currency ?? "USD" }).format(issue.amount)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{issue.detectedBy}</td>
                    <td className="px-4 py-3 text-xs">{issue.assignedTo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIssueId(issue.id)}>
                        Investigate
                        <ArrowRight />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredIssues.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">No issues match your filters.</div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <ClipboardCheck className="size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">How issues are created</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  UI model for automatic detection points across the platform.
                </p>
              </div>
            </div>
            <div className="grid gap-2 p-4">
              {[
                ["Provider reconciliation", "A provider balance check compares Expected vs Actual. A variance above the configured tolerance opens a Reconciliation case."],
                ["Transaction anomaly", "A transaction rule can create a case when an amount, reference, status, or pattern needs human review."],
                ["Settlement variance", "A settlement flow can create a case when the settlement amount or provider evidence does not match the expected ledger."],
                ["Provider access review", "Provider-side access activity can open a Security case for review without changing transaction balances."],
              ].map(([title, description], index) => (
                <div key={title} className="flex gap-3 rounded-lg border px-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">{index + 1}</span>
                  <div>
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <ShieldAlert className="size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">Control principle</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  An issue is a case for investigation, not a balance correction.
                </p>
              </div>
            </div>
            <div className="space-y-2 p-4 text-xs leading-5 text-muted-foreground">
              <p>1. Detect a difference or anomaly.</p>
              <p>2. Create a case automatically or manually.</p>
              <p>3. Link the provider, transaction, distributor, and evidence.</p>
              <p>4. Investigate and document the cause.</p>
              <p>5. Review, resolve, or escalate.</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={selectedIssue !== null} onOpenChange={(open) => !open && setSelectedIssueId(null)}>
        <DialogContent className="max-w-6xl gap-0 overflow-hidden p-0 sm:max-w-6xl">
          <DialogHeader className="border-b px-5 py-4">
            {selectedIssue ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <DialogTitle>{selectedIssue.title}</DialogTitle>
                    <DialogDescription className="mt-1 font-mono text-[11px]">{selectedIssue.id}</DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={selectedIssue.priority} />
                    <StatusBadge status={selectedIssue.status} />
                  </div>
                </div>
              </>
            ) : null}
          </DialogHeader>
          <div className="max-h-[78vh] overflow-y-auto p-5">
            {selectedIssue ? <IssueDetail issue={selectedIssue} onStatusChange={updateStatus} /> : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create issue</DialogTitle>
            <DialogDescription>Create a manual case when an operator spots a problem that was not automatically detected.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline"><AlertTriangle /> Reconciliation</Button>
              <Button type="button" variant="outline"><WalletCards /> Treasury</Button>
              <Button type="button" variant="outline"><UserCheck /> Distributor</Button>
              <Button type="button" variant="outline"><ShieldAlert /> Security</Button>
            </div>
            <Input placeholder="Issue title" />
            <Input placeholder="Entity or reference (e.g. D17 / DEP-...)" />
            <Input placeholder="Short description..." />
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="button" onClick={() => setCreateOpen(false)}><Check /> Create case</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

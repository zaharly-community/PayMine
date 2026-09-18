import * as React from "react";

import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileWarning,
  Filter,
  Landmark,
  Link2,
  LockKeyhole,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type IssueStatus =
  | "Open"
  | "Investigating"
  | "Awaiting Evidence"
  | "Ready for Review"
  | "Escalated"
  | "Resolved";

type IssueCategory = "Reconciliation" | "Transaction" | "Treasury" | "Security";

type DetectionSource =
  | "Provider reconciliation check"
  | "Settlement verification"
  | "Transaction integrity rule"
  | "Provider access activity";

type ResolutionType =
  | "Provider fee"
  | "Recorded settlement"
  | "External provider movement"
  | "Transaction valid"
  | "Security escalation"
  | "Other";

type Issue = {
  id: string;
  title: string;
  category: IssueCategory;
  entity: string;
  provider?: string;
  distributor?: string;
  amount?: number;
  currency?: string;
  expected?: number;
  actual?: number;
  status: IssueStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  detectedBy: DetectionSource;
  detectedAt: string;
  assignedTo: string;
  summary: string;
  impact: string;
  relatedTransactions: string[];
  relatedDistributors: string[];
  evidence: string[];
  timeline: { time: string; title: string; detail: string }[];
};

const initialIssues: Issue[] = [
  {
    id: "RECON-00041",
    title: "D17 provider balance mismatch",
    category: "Reconciliation",
    entity: "D17",
    provider: "D17",
    amount: 1075,
    currency: "USD",
    expected: 12950,
    actual: 11875,
    status: "Investigating",
    priority: "High",
    detectedBy: "Provider reconciliation check",
    detectedAt: "18 Sep 2026, 04:32 PM",
    assignedTo: "Finance",
    summary: "Provider balance is lower than the expected internal balance.",
    impact: "Settlement is blocked until the variance is explained and reviewed.",
    relatedTransactions: ["DEP-02026002", "DEP-02026013", "WDL-02026009"],
    relatedDistributors: ["SUP-000184", "SUP-000203", "SUP-000221"],
    evidence: ["D17 provider statement", "Internal ledger snapshot", "Provider activity export"],
    timeline: [
      { time: "04:32 PM", title: "Mismatch detected", detail: "Expected $12,950 vs actual provider balance $11,875." },
      { time: "04:40 PM", title: "Case opened automatically", detail: "Variance crossed the configured reconciliation tolerance." },
      { time: "04:46 PM", title: "Assigned to Finance", detail: "Settlement remains blocked while the case is under investigation." },
    ],
  },
  {
    id: "RECON-00038",
    title: "Visa provider variance",
    category: "Reconciliation",
    entity: "Visa",
    provider: "Visa",
    amount: 350,
    currency: "USD",
    expected: 42300,
    actual: 41950,
    status: "Awaiting Evidence",
    priority: "Medium",
    detectedBy: "Provider reconciliation check",
    detectedAt: "18 Sep 2026, 04:21 PM",
    assignedTo: "Finance",
    summary: "Provider-side Visa balance is lower than expected by $350.",
    impact: "Settlement preparation is paused until supporting provider evidence is reviewed.",
    relatedTransactions: ["DEP-02026004", "WDL-02026004"],
    relatedDistributors: ["SUP-000203"],
    evidence: ["Provider statement", "Settlement history", "Internal ledger snapshot"],
    timeline: [
      { time: "04:21 PM", title: "Mismatch detected", detail: "Expected $42,300 vs actual provider balance $41,950." },
      { time: "04:28 PM", title: "Evidence requested", detail: "Provider statement and account activity were requested for review." },
    ],
  },
  {
    id: "TXN-00217",
    title: "Withdrawal amount needs review",
    category: "Transaction",
    entity: "WDL-02026017",
    distributor: "SUP-000284",
    amount: 2140,
    currency: "USD",
    status: "Open",
    priority: "High",
    detectedBy: "Transaction integrity rule",
    detectedAt: "18 Sep 2026, 03:18 PM",
    assignedTo: "Risk",
    summary: "The withdrawal crossed a configured review threshold.",
    impact: "The transaction is held for investigation before it can be considered cleared.",
    relatedTransactions: ["WDL-02026017"],
    relatedDistributors: ["SUP-000284"],
    evidence: ["Withdrawal detail", "Provider reference", "Processor activity"],
    timeline: [
      { time: "03:18 PM", title: "Anomaly detected", detail: "Transaction exceeded the configured review threshold." },
      { time: "03:18 PM", title: "Case opened automatically", detail: "No wallet balance was changed by the detection rule." },
    ],
  },
  {
    id: "SEC-00012",
    title: "Provider account access requires review",
    category: "Security",
    entity: "D17",
    provider: "D17",
    distributor: "SUP-000184",
    status: "Escalated",
    priority: "Critical",
    detectedBy: "Provider access activity",
    detectedAt: "18 Sep 2026, 02:54 PM",
    assignedTo: "Security",
    summary: "Provider access activity was flagged for manual review.",
    impact: "The case requires a security review before the provider access state is considered cleared.",
    relatedTransactions: [],
    relatedDistributors: ["SUP-000184", "SUP-000203"],
    evidence: ["Provider access log", "Login history", "Assigned provider accounts"],
    timeline: [
      { time: "02:54 PM", title: "Access event flagged", detail: "Provider activity crossed the configured access review rule." },
      { time: "03:05 PM", title: "Escalated to Security", detail: "Case requires security review before closure." },
    ],
  },
  {
    id: "SET-00009",
    title: "Settlement verification pending",
    category: "Treasury",
    entity: "Flouci",
    provider: "Flouci",
    amount: 2500,
    currency: "USD",
    status: "Ready for Review",
    priority: "Low",
    detectedBy: "Settlement verification",
    detectedAt: "17 Sep 2026, 06:00 PM",
    assignedTo: "Finance",
    summary: "A provider settlement draft is ready for final review.",
    impact: "The settlement can only proceed after the provider account remains reconciled.",
    relatedTransactions: ["SET-0018"],
    relatedDistributors: [],
    evidence: ["Settlement draft", "Provider balance snapshot"],
    timeline: [
      { time: "06:00 PM", title: "Settlement prepared", detail: "Available reconciled balance was selected for settlement." },
      { time: "06:08 PM", title: "Ready for review", detail: "Waiting for the assigned Finance reviewer." },
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
    summary: "A duplicate provider reference was detected and confirmed as a duplicate callback.",
    impact: "No additional provider movement was required after the duplicate was confirmed.",
    relatedTransactions: ["DEP-02026031", "DEP-02026028"],
    relatedDistributors: ["AGT-000395"],
    evidence: ["Provider reference", "Internal transaction comparison"],
    timeline: [
      { time: "11:42 AM", title: "Duplicate detected", detail: "The same provider reference appeared on two internal records." },
      { time: "12:10 PM", title: "Evidence reviewed", detail: "Provider and internal records were compared." },
      { time: "12:32 PM", title: "Resolved", detail: "The duplicate callback was confirmed." },
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

function money(value: number | undefined, currency = "USD") {
  if (value === undefined) return "—";
  return value.toLocaleString("en-US", { style: "currency", currency });
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

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("mt-1 block text-lg font-semibold tabular-nums", className)}>{value}</span>
    </div>
  );
}

function IssueDetail({
  issue,
  onStatusChange,
  onResolve,
}: {
  issue: Issue;
  onStatusChange: (status: IssueStatus) => void;
  onResolve: (resolution: ResolutionType, note: string) => void;
}) {
  const [resolution, setResolution] = React.useState<ResolutionType>(
    issue.category === "Reconciliation"
      ? "Provider fee"
      : issue.category === "Security"
        ? "Security escalation"
        : issue.category === "Treasury"
          ? "Recorded settlement"
          : "Transaction valid",
  );
  const [note, setNote] = React.useState("");

  const gap =
    issue.expected !== undefined && issue.actual !== undefined
      ? issue.actual - issue.expected
      : undefined;

  const resolutionReady = note.trim().length >= 8;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Issue ID" value={issue.id} />
        <Metric label="Category" value={issue.category} />
        <Metric label="Priority" value={issue.priority} />
        <Metric label="Assigned" value={issue.assignedTo} />
      </div>

      {issue.expected !== undefined && issue.actual !== undefined ? (
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              <p className="text-sm font-semibold">Reconciliation snapshot</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              This snapshot explains why the case exists. Resolving the case must not silently rewrite the provider balance.
            </p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-4">
            <Metric label="Expected" value={money(issue.expected, issue.currency)} />
            <Metric label="Actual provider" value={money(issue.actual, issue.currency)} className="text-red-600 dark:text-red-400" />
            <Metric label="Difference" value={money(gap, issue.currency)} className="text-red-600 dark:text-red-400" />
            <Metric label="Provider" value={issue.provider ?? issue.entity} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-primary" />
              <p className="text-sm font-semibold">What happened</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{issue.summary}</p>
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
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Entity</span>
              <span className="mt-1 block text-sm font-medium">{issue.entity}</span>
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Impact</span>
              <span className="mt-1 block text-sm leading-5">{issue.impact}</span>
            </div>
            {issue.distributor ? (
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Distributor</span>
                <span className="mt-1 block font-mono text-xs font-medium">{issue.distributor}</span>
              </div>
            ) : null}
            {issue.amount !== undefined ? (
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Amount</span>
                <span className="mt-1 block text-sm font-semibold tabular-nums">{money(issue.amount, issue.currency)}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" />
              <p className="text-sm font-semibold">Case workflow</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Status changes describe the investigation. They do not change balances.</p>
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
                    issue.status === status ? "border-primary bg-primary/5" : "hover:bg-muted/30",
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-primary" />
              <p className="text-sm font-semibold">Related records</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Review these records before choosing a resolution.</p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Transactions</p>
              <div className="space-y-1.5">
                {issue.relatedTransactions.length ? (
                  issue.relatedTransactions.map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                      <span className="font-mono">{item}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">No linked transaction.</div>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Distributors</p>
              <div className="space-y-1.5">
                {issue.relatedDistributors.length ? (
                  issue.relatedDistributors.map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                      <span className="font-mono">{item}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">No linked distributor.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-sm font-semibold">Provider access context</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Who had access to the affected provider account.</p>
          </div>
          <div className="space-y-2 p-4">
            {(issue.provider ? ["SUP-000184", "SUP-000203", "SUP-000221"] : issue.relatedDistributors).slice(0, 3).map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div>
                  <span className="block font-mono text-xs font-medium">{item}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">Login access · last checked {index + 1}h ago</span>
                </div>
                <LockKeyhole className="size-3.5 text-muted-foreground" />
              </div>
            ))}
            {!issue.provider && !issue.relatedDistributors.length ? (
              <div className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">No provider access context.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />
            <p className="text-sm font-semibold">Investigation timeline</p>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Every investigation step stays visible in the case history.</p>
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
            <div className="flex items-center gap-2">
              <FileWarning className="size-4 text-primary" />
              <p className="text-sm font-semibold">Evidence checklist</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">UI-only evidence references for this template.</p>
          </div>
          <div className="space-y-2 p-4">
            {issue.evidence.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-3.5 text-muted-foreground" />
                  <span className="text-xs">{item}</span>
                </div>
                <Button type="button" size="sm" variant="ghost">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <p className="text-sm font-semibold">Resolution</p>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Choose what explains the issue and document the review.</p>
          </div>
          <div className="space-y-3 p-4">
            <select
              value={resolution}
              onChange={(event) => setResolution(event.target.value as ResolutionType)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="Provider fee">Provider fee</option>
              <option value="Recorded settlement">Recorded settlement</option>
              <option value="External provider movement">External provider movement</option>
              <option value="Transaction valid">Transaction valid</option>
              <option value="Security escalation">Security escalation</option>
              <option value="Other">Other</option>
            </select>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Resolution note or evidence reference..."
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onStatusChange("Awaiting Evidence")}>
                Request evidence
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStatusChange("Escalated")}
              >
                <ShieldAlert />
                Escalate
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!resolutionReady}
                onClick={() => onResolve(resolution, note.trim())}
              >
                <CheckCircle2 />
                Resolve case
              </Button>
            </div>
            <div className="rounded-md border border-dashed bg-muted/20 px-3 py-2 text-[11px] leading-4 text-muted-foreground">
              Resolving closes the investigation record in this UI template. It does not change provider balances, distributor balances, or transaction records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IssuesPage() {
  const [issues, setIssues] = React.useState(initialIssues);
  const [selectedIssueId, setSelectedIssueId] = React.useState<string | null>(initialIssues[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = React.useState<"All" | IssueStatus>("All");
  const [categoryFilter, setCategoryFilter] = React.useState<"All" | IssueCategory>("All");
  const [search, setSearch] = React.useState("");

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = statusFilter === "All" || issue.status === statusFilter;
    const categoryMatch = categoryFilter === "All" || issue.category === categoryFilter;
    const query = search.trim().toLowerCase();
    const searchMatch =
      !query ||
      [issue.id, issue.title, issue.entity, issue.provider ?? "", issue.assignedTo, issue.distributor ?? ""]
        .some((value) => value.toLowerCase().includes(query));
    return statusMatch && categoryMatch && searchMatch;
  });

  const selectedIssue =
    issues.find((issue) => issue.id === selectedIssueId) ??
    filteredIssues[0] ??
    null;

  React.useEffect(() => {
    if (!selectedIssue && filteredIssues[0]) setSelectedIssueId(filteredIssues[0].id);
  }, [filteredIssues, selectedIssue]);

  const updateStatus = (status: IssueStatus) => {
    if (!selectedIssueId) return;
    setIssues((current) =>
      current.map((issue) => (issue.id === selectedIssueId ? { ...issue, status } : issue)),
    );
  };

  const resolveIssue = (resolution: ResolutionType, note: string) => {
    if (!selectedIssueId) return;
    setIssues((current) =>
      current.map((issue) =>
        issue.id === selectedIssueId
          ? {
              ...issue,
              status: "Resolved",
              timeline: [
                ...issue.timeline,
                {
                  time: "Now",
                  title: "Resolved",
                  detail: resolution + " · " + note,
                },
              ],
            }
          : issue,
      ),
    );
  };

  const openCount = issues.filter((issue) => issue.status === "Open").length;
  const investigatingCount = issues.filter((issue) => issue.status === "Investigating").length;
  const evidenceCount = issues.filter((issue) => issue.status === "Awaiting Evidence").length;
  const escalatedCount = issues.filter((issue) => issue.status === "Escalated").length;
  const resolvedCount = issues.filter((issue) => issue.status === "Resolved").length;

  return (
    <section data-content-padding="false" className="flex min-h-full flex-col bg-background">
      <div className="border-b px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Issues & Investigations</h1>
              <Badge variant="secondary">Frontend template</Badge>
            </div>
            <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
              One workspace to detect, investigate, document, resolve, and escalate operational issues across Treasury,
              provider accounts, transactions, and distributors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm">
              <Filter />
              Rules
            </Button>
            <Button type="button" size="sm">
              <FileCheck2 />
              Review queue
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Open" value={String(openCount)} />
          <Metric label="Investigating" value={String(investigatingCount)} />
          <Metric label="Awaiting evidence" value={String(evidenceCount)} />
          <Metric label="Escalated" value={String(escalatedCount)} className="text-red-600 dark:text-red-400" />
          <Metric label="Resolved" value={String(resolvedCount)} />
        </div>

        <div className="rounded-xl border">
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search issue, provider, transaction, distributor..."
                className="h-8 pl-9"
              />
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
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Difference</th>
                  <th className="px-4 py-3 font-medium">Detected by</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => {
                  const diff =
                    issue.expected !== undefined && issue.actual !== undefined
                      ? issue.actual - issue.expected
                      : undefined;

                  return (
                    <tr
                      key={issue.id}
                      className={cn(
                        "border-b last:border-0 transition-colors hover:bg-muted/20",
                        selectedIssue?.id === issue.id ? "bg-muted/15" : "",
                      )}
                    >
                      <td className="px-4 py-3">
                        <button type="button" className="text-left" onClick={() => setSelectedIssueId(issue.id)}>
                          <div className="font-medium">{issue.title}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{issue.id}</div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs">{issue.category}</td>
                      <td className="px-4 py-3 font-medium">{issue.entity}</td>
                      <td className="px-4 py-3 text-xs tabular-nums">
                        {diff !== undefined ? (
                          <span className="text-red-600 dark:text-red-400">{money(diff, issue.currency)}</span>
                        ) : issue.amount !== undefined ? (
                          money(issue.amount, issue.currency)
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{issue.detectedBy}</td>
                      <td className="px-4 py-3 text-xs">{issue.assignedTo}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
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
                  );
                })}
              </tbody>
            </table>

            {!filteredIssues.length ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">No issues match the selected filters.</div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <WalletCards className="size-4 text-primary" />
                <p className="text-sm font-semibold">How a problem is detected</p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                These are the UI detection points used by the template. The backend can later feed real events into the same cases.
              </p>
            </div>
            <div className="divide-y">
              {[
                {
                  title: "Provider reconciliation",
                  description: "A Check now or scheduled provider check compares expected and actual balance. A variance beyond tolerance opens a Reconciliation issue.",
                  icon: Landmark,
                },
                {
                  title: "Before treasury settlement",
                  description: "Settlement preparation re-checks the provider balance. A mismatch blocks settlement and opens a Treasury/Reconciliation case.",
                  icon: ArrowUpRight,
                },
                {
                  title: "Transaction integrity",
                  description: "Rules can flag duplicate references, unexpected amounts, status conflicts, or mismatched provider references.",
                  icon: FileCheck2,
                },
                {
                  title: "Provider access activity",
                  description: "Provider login or account-access events can open a Security case for review.",
                  icon: LockKeyhole,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3 px-4 py-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                <p className="text-sm font-semibold">How a problem is resolved</p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                A resolution explains the difference; it does not hide or overwrite the underlying record.
              </p>
            </div>
            <div className="grid gap-2 p-4">
              {[
                ["1", "Detect", "Open a case from a reconciliation gap, settlement check, transaction rule, or security signal."],
                ["2", "Investigate", "Review balances, related transactions, distributors, provider access, and evidence."],
                ["3", "Classify", "Select the documented cause: provider fee, settlement, external movement, valid transaction, security escalation, or other."],
                ["4", "Review", "Move the case to Ready for Review and keep supporting evidence attached."],
                ["5", "Resolve / Escalate", "Resolve with a note when explained, or escalate when the cause remains unresolved."],
              ].map(([step, title, description]) => (
                <div key={step} className="flex gap-3 rounded-lg border px-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">{step}</span>
                  <div>
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedIssue ? (
          <div className="rounded-xl border">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{selectedIssue.title}</h2>
                  <PriorityBadge priority={selectedIssue.priority} />
                  <StatusBadge status={selectedIssue.status} />
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{selectedIssue.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedIssue.provider ? (
                  <Badge variant="outline" className="gap-1.5">
                    <Landmark className="size-3" />
                    {selectedIssue.provider}
                  </Badge>
                ) : null}
                {selectedIssue.distributor ? (
                  <Badge variant="outline" className="gap-1.5">
                    <UserCheck className="size-3" />
                    {selectedIssue.distributor}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="p-4 md:p-5">
              <IssueDetail issue={selectedIssue} onStatusChange={updateStatus} onResolve={resolveIssue} />
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={false} onOpenChange={() => undefined}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review queue</DialogTitle>
            <DialogDescription>Review queue is represented directly on this page in the frontend template.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}

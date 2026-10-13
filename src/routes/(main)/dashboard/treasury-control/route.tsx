import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  Clock3,
  FileWarning,
  GitCompareArrows,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  initialApprovals,
  initialHandovers,
  initialIncidents,
  initialShifts,
  treasuryAccounts,
  formatTnd,
} from "@/lib/treasury-control-mock";
import { ControlRule, MockDataNotice, TreasuryMetric, TreasuryPageHeader, TreasuryStatus } from "../transactions/-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/treasury-control")({
  component: TreasuryControlPage,
});

function TreasuryControlPage() {
  const unresolvedIncidents = initialIncidents.filter((item) => item.status !== "Resolved · approved");
  const openShifts = initialShifts.filter((item) => item.status === "Open");
  const pendingApprovals = initialApprovals.filter((item) => item.status === "Pending" || item.status === "Evidence requested");
  const totalVariance = initialIncidents
    .filter((item) => item.status !== "Resolved · approved")
    .reduce((sum, item) => sum + Math.abs(item.variance), 0);
  const sharedAccounts = treasuryAccounts.filter((item) => item.supervisors.length > 1).length;

  const shortcuts = [
    { title: "Immutable ledger", description: "Review every posted and pending journal entry.", url: "/dashboard/transactions/ledger", icon: BookOpenCheck },
    { title: "Supervisor access", description: "Audit account assignments, activity and overlapping access.", url: "/dashboard/transactions/assignments", icon: UsersRound },
    { title: "Shift control", description: "Review openings, closing counts and assigned reviewers.", url: "/dashboard/transactions/shifts", icon: Clock3 },
    { title: "Handover register", description: "Trace who released and who accepted each account.", url: "/dashboard/transactions/handovers", icon: UsersRound },
    { title: "Reconciliation incidents", description: "Investigate unexplained shortages and surpluses.", url: "/dashboard/transactions/incidents", icon: FileWarning },
    { title: "Approval queue", description: "Enforce evidence and independent-review rules.", url: "/dashboard/transactions/approvals", icon: ClipboardCheck },
  ];

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader
        title="Treasury Control"
        description="A control room for shared payment accounts, supervisor shifts, handovers, ledger integrity, unexplained variances and financial approvals."
        icon={<ShieldCheck className="size-5" />}
        action={<Badge variant="outline">Mock operating model</Badge>}
      />

      <MockDataNotice>
        The information below is seeded demo data for validating the workflow. The current frontend does not persist a financial ledger, authenticate approvals on a server, or independently verify provider balances.
      </MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TreasuryMetric label="Payment accounts" value={String(treasuryAccounts.length)} hint={sharedAccounts + " accounts shared by multiple supervisors"} icon={<WalletCards className="size-4" />} />
        <TreasuryMetric label="Unresolved variance" value={formatTnd(totalVariance)} hint="Absolute value of open incidents" icon={<GitCompareArrows className="size-4" />} tone="danger" />
        <TreasuryMetric label="Open shifts" value={String(openShifts.length)} hint="Closing balance not submitted" icon={<Clock3 className="size-4" />} tone="warning" />
        <TreasuryMetric label="Pending approvals" value={String(pendingApprovals.length)} hint="Some requests lack required evidence" icon={<ClipboardCheck className="size-4" />} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <Card className="overflow-hidden shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b px-4 py-3.5">
            <div>
              <CardTitle className="text-sm">Priority exceptions</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Cases requiring an independent decision</p>
            </div>
            <Badge variant="destructive">{unresolvedIncidents.length} open</Badge>
          </CardHeader>
          <div className="divide-y">
            {unresolvedIncidents.map((incident) => (
              <div key={incident.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={incident.severity === "High" || incident.severity === "Critical" ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600" : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700"}>
                    <FileWarning className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{incident.accountName} <span className="font-normal text-muted-foreground">· {incident.id}</span></p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{incident.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <TreasuryStatus status={incident.status} />
                      <Badge variant="outline">{incident.severity} risk</Badge>
                    </div>
                  </div>
                </div>
                <p className={(incident.variance < 0 ? "text-rose-600" : "text-amber-700") + " shrink-0 text-sm font-semibold tabular-nums"}>{incident.variance > 0 ? "+" : "−"}{formatTnd(Math.abs(incident.variance))}</p>
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <Link to={"/dashboard/transactions/incidents" as never} className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium hover:bg-muted">Open incident register <ArrowRight className="size-4" /></Link>
          </div>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b px-4 py-3.5">
            <CardTitle className="text-sm">Controls that should always hold</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Operating rules for a shared provider account</p>
          </CardHeader>
          <CardContent className="divide-y px-4">
            <ControlRule title="No silent edits" detail="Posted ledger entries are corrected only by a linked reversal or an approved new entry." />
            <ControlRule title="Maker cannot approve own request" detail="A requester and approver must be different people, enforced on the server in production." />
            <ControlRule title="Handover requires two confirmations" detail="Record the outgoing count and incoming count separately; a mismatch becomes an incident." />
            <ControlRule title="Fees require evidence" detail="A balance shortage cannot be relabelled as a provider fee without a receipt or independently reviewed proof." />
            <ControlRule title="Unexplained variance stays visible" detail="Keep the difference open until evidence and a second-person decision are recorded." />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3.5">
            <div>
              <CardTitle className="text-sm">Current shift overview</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Every shift belongs to one account and one accountable supervisor</p>
            </div>
            <Link to={"/dashboard/transactions/shifts" as never} className="text-xs font-medium text-primary hover:underline">View shifts</Link>
          </CardHeader>
          <div className="divide-y">
            {initialShifts.slice(0, 3).map((shift) => (
              <div key={shift.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{shift.accountName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{shift.supervisor} · {shift.id}</p>
                </div>
                <TreasuryStatus status={shift.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3.5">
            <div>
              <CardTitle className="text-sm">Account health</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Ledger expectation compared with last reported actual balance</p>
            </div>
            <Link to={"/dashboard/transactions/reconciliation" as never} className="text-xs font-medium text-primary hover:underline">Reconciliation</Link>
          </CardHeader>
          <div className="divide-y">
            {treasuryAccounts.slice(0, 4).map((account) => {
              const variance = account.actualBalance - account.expectedBalance;
              return (
                <div key={account.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{account.provider} · {account.id}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatTnd(account.expectedBalance)}</p>
                    <p className={"mt-0.5 inline-flex items-center gap-1 text-[11px] " + (variance === 0 ? "text-emerald-600" : variance < 0 ? "text-rose-600" : "text-amber-700")}>
                      {variance < 0 ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                      {variance === 0 ? "Matched" : (variance > 0 ? "+" : "−") + formatTnd(Math.abs(variance))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={(item.url) as never} className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground"><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
              </span>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import * as React from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MessageSquare,
  Send,
  ShieldAlert,
  Ticket,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  readDistributorReports,
  subscribeToDistributorReports,
  updateDistributorReport,
  type DistributorReport,
  type DistributorReportPriority,
  type DistributorReportStatus,
} from "@/lib/distributor-reports";

export const Route = createFileRoute("/(main)/dashboard/disagreements")({
  component: DisagreementsPage,
});

const statuses: DistributorReportStatus[] = [
  "Open",
  "In progress",
  "Waiting for player",
  "Resolved",
];

const priorities: DistributorReportPriority[] = ["Low", "Normal", "High", "Urgent"];

const statusClasses: Record<DistributorReportStatus, string> = {
  Open: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "In progress": "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "Waiting for player": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const priorityClasses: Record<DistributorReportPriority, string> = {
  Low: "border-muted-foreground/20 bg-muted/50 text-muted-foreground",
  Normal: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  High: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Urgent: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function DisagreementsPage() {
  const [reports, setReports] = React.useState<DistributorReport[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"All" | DistributorReportStatus>("All");
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");

  React.useEffect(() => {
    const refresh = () => {
      setReports(
        readDistributorReports().sort(
          (left, right) => right.createdAt.localeCompare(left.createdAt),
        ),
      );
    };

    refresh();
    return subscribeToDistributorReports(refresh);
  }, []);

  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ?? null;

  const counts = React.useMemo(
    () => ({
      open: reports.filter((report) => report.status === "Open").length,
      inProgress: reports.filter((report) => report.status === "In progress").length,
      waiting: reports.filter((report) => report.status === "Waiting for player").length,
      resolved: reports.filter((report) => report.status === "Resolved").length,
    }),
    [reports],
  );

  const filteredReports = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (statusFilter !== "All" && report.status !== statusFilter) return false;
      if (!query) return true;

      return [
        report.id,
        report.distributorName,
        report.distributorEmail,
        report.distributorId,
        report.reporterReference,
        report.depositRequestId ?? "",
        report.reason,
        report.details,
        report.paymentMethod,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [reports, search, statusFilter]);

  const updateStatus = (report: DistributorReport, status: DistributorReportStatus) => {
    if (report.status === status) return;
    updateDistributorReport(report.id, { status }, {
      author: "Support team",
      kind: "system",
      message: `Status changed from ${report.status} to ${status}.`,
    });
  };

  const updatePriority = (report: DistributorReport, priority: DistributorReportPriority) => {
    if (report.priority === priority) return;
    updateDistributorReport(report.id, { priority }, {
      author: "Support team",
      kind: "system",
      message: `Priority changed from ${report.priority} to ${priority}.`,
    });
  };

  const updateAssignee = (report: DistributorReport, assignedTo: string) => {
    if (report.assignedTo === assignedTo) return;
    updateDistributorReport(report.id, { assignedTo }, {
      author: "Support team",
      kind: "system",
      message: `Ticket assigned to ${assignedTo}.`,
    });
  };

  const addReply = () => {
    if (!selectedReport || !reply.trim()) return;
    updateDistributorReport(selectedReport.id, {}, {
      author: "Support team",
      kind: "comment",
      message: reply.trim(),
    });
    setReply("");
  };

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
            <Ticket className="size-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Operations · Support</div>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Disagreements</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review and resolve player reports submitted against distributors and supervisors.
              Each report is tracked as a support ticket.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 px-2.5 py-1">
          <CircleAlert className="size-3.5" />
          {counts.open} open {counts.open === 1 ? "ticket" : "tickets"}
        </Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Open"
          value={counts.open}
          description="Needs an initial review"
          icon={<CircleAlert className="size-5" />}
        />
        <SummaryCard
          label="In progress"
          value={counts.inProgress}
          description="Being investigated"
          icon={<Clock3 className="size-5" />}
        />
        <SummaryCard
          label="Waiting for player"
          value={counts.waiting}
          description="Needs more information"
          icon={<MessageSquare className="size-5" />}
        />
        <SummaryCard
          label="Resolved"
          value={counts.resolved}
          description="Closed tickets"
          icon={<CheckCircle2 className="size-5" />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket, distributor, player or reason..."
              aria-label="Search distributor reports"
            />
          </div>
          <select
            aria-label="Filter by ticket status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | DistributorReportStatus)}
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {filteredReports.length} {filteredReports.length === 1 ? "ticket" : "tickets"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>
                {["Ticket", "Distributor", "Report", "Player", "Payment", "Priority", "Status", ""].map((heading, index) => (
                  <th key={heading || index} className="whitespace-nowrap px-4 py-3 text-left font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <p className="font-medium">{report.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                  </td>
                  <td className="min-w-44 px-4 py-3 align-top">
                    <div className="flex items-start gap-2">
                      {report.distributorAvatarUrl ? (
                        <img src={report.distributorAvatarUrl} alt="" className="size-8 rounded-full object-cover" />
                      ) : (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Building2 className="size-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{report.distributorName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{report.distributorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-56 max-w-sm px-4 py-3 align-top">
                    <p className="font-medium">{report.reason}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {report.details || "No additional details were provided."}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <p>{report.reporterReference}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">{report.reporterLookupType}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <p>{report.paymentMethod}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.amount} {report.currency}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant="outline" className={priorityClasses[report.priority]}>{report.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant="outline" className={statusClasses[report.status]}>{report.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedReportId(report.id);
                      }}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted/40">
                      <ShieldAlert className="size-5 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      {reports.length === 0 ? "No distributor reports yet" : "No tickets match your filters"}
                    </p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      {reports.length === 0
                        ? "When a player submits Report in the deposit flow, the complaint will appear here as a ticket for the team to review and resolve."
                        : "Try another search term or change the status filter."}
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={Boolean(selectedReport)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReportId(null);
            setReply("");
          }
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          {selectedReport ? (
            <>
              <DialogHeader className="pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={statusClasses[selectedReport.status]}>{selectedReport.status}</Badge>
                  <Badge variant="outline" className={priorityClasses[selectedReport.priority]}>{selectedReport.priority} priority</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{selectedReport.id}</span>
                </div>
                <DialogTitle className="pt-1 text-xl">{selectedReport.reason}</DialogTitle>
                <DialogDescription>
                  Submitted {formatDate(selectedReport.createdAt)} · Last updated {formatDate(selectedReport.updatedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0 space-y-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Report details</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {selectedReport.details || "The player did not add additional details."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile icon={<Building2 className="size-4" />} label="Reported distributor" value={selectedReport.distributorName} note={selectedReport.distributorEmail} />
                    <InfoTile icon={<UserRound className="size-4" />} label="Reported by" value={selectedReport.reporterReference} note={selectedReport.reporterLookupType} />
                    <InfoTile icon={<CalendarClock className="size-4" />} label="Deposit request" value={selectedReport.depositRequestId || "Not provided"} note={selectedReport.paymentMethod} />
                    <InfoTile icon={<CircleAlert className="size-4" />} label="Reported amount" value={`${selectedReport.amount} ${selectedReport.currency}`} note="Payment context" />
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Ticket activity</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {selectedReport.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <span className={activity.kind === "comment" ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" : "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"}>
                            {activity.kind === "comment" ? <MessageSquare className="size-4" /> : <Clock3 className="size-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium">{activity.author}</p>
                              <span className="text-[11px] text-muted-foreground">{formatDate(activity.createdAt)}</span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-muted-foreground">{activity.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t pt-4">
                      <label htmlFor="ticket-reply" className="text-xs font-medium">Add internal note</label>
                      <textarea
                        id="ticket-reply"
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        rows={3}
                        placeholder="Record the investigation, contact attempt, or resolution..."
                        className="mt-2 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button type="button" size="sm" onClick={addReply} disabled={!reply.trim()}>
                          <Send className="size-3.5" />
                          Add note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ticket handling</p>
                    <label className="mt-4 block text-xs font-medium" htmlFor="ticket-status">Status</label>
                    <select
                      id="ticket-status"
                      value={selectedReport.status}
                      onChange={(event) => updateStatus(selectedReport, event.target.value as DistributorReportStatus)}
                      className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>

                    <label className="mt-4 block text-xs font-medium" htmlFor="ticket-priority">Priority</label>
                    <select
                      id="ticket-priority"
                      value={selectedReport.priority}
                      onChange={(event) => updatePriority(selectedReport, event.target.value as DistributorReportPriority)}
                      className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>

                    <label className="mt-4 block text-xs font-medium" htmlFor="ticket-assignee">Assigned to</label>
                    <select
                      id="ticket-assignee"
                      value={selectedReport.assignedTo}
                      onChange={(event) => updateAssignee(selectedReport, event.target.value)}
                      className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {["Unassigned", "Support team", "Operations", "Finance", "Compliance"].map((assignee) => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>

                    {selectedReport.status !== "Resolved" ? (
                      <Button
                        type="button"
                        className="mt-5 w-full"
                        onClick={() => updateStatus(selectedReport, "Resolved")}
                      >
                        <CheckCircle2 className="size-4" />
                        Mark as resolved
                      </Button>
                    ) : (
                      <div className="mt-5 flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0" />
                        This ticket is resolved.
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[108px] items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-medium">{value}</p>
      {note ? <p className="mt-1 break-words text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

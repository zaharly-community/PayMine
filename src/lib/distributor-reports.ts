export type DistributorReportStatus =
  | "Open"
  | "In progress"
  | "Waiting for player"
  | "Resolved";

export type DistributorReportPriority = "Low" | "Normal" | "High" | "Urgent";

export type DistributorReportActivity = {
  id: string;
  author: string;
  kind: "system" | "comment";
  message: string;
  createdAt: string;
};

export type DistributorReport = {
  id: string;
  distributorId: string;
  distributorName: string;
  distributorEmail: string;
  distributorAvatarUrl?: string;
  reporterReference: string;
  reporterLookupType: "playerId" | "username" | "email";
  depositRequestId?: string;
  paymentMethod: string;
  amount: string;
  currency: string;
  reason: string;
  details: string;
  status: DistributorReportStatus;
  priority: DistributorReportPriority;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  activities: DistributorReportActivity[];
};

type NewDistributorReport = Omit<
  DistributorReport,
  "id" | "status" | "priority" | "assignedTo" | "createdAt" | "updatedAt" | "activities"
>;

type ReportChanges = Partial<
  Pick<DistributorReport, "status" | "priority" | "assignedTo">
>;

type NewActivity = Pick<DistributorReportActivity, "author" | "kind" | "message">;

const storageKey = "ipaycash-distributor-reports-v1";
export const DISTRIBUTOR_REPORTS_EVENT = "ipaycash:distributor-reports-change";

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function emitReportsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DISTRIBUTOR_REPORTS_EVENT));
}

export function readDistributorReports(): DistributorReport[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DistributorReport[]) : [];
  } catch {
    return [];
  }
}

function writeDistributorReports(reports: DistributorReport[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(reports));
    emitReportsChanged();
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }
}

export function createDistributorReport(input: NewDistributorReport): DistributorReport {
  const createdAt = new Date().toISOString();
  const report: DistributorReport = {
    ...input,
    id: createId("DREP"),
    status: "Open",
    priority: "Normal",
    assignedTo: "Unassigned",
    createdAt,
    updatedAt: createdAt,
    activities: [
      {
        id: createId("ACT"),
        author: "Player",
        kind: "system",
        message: `Report submitted: ${input.reason}`,
        createdAt,
      },
    ],
  };

  writeDistributorReports([report, ...readDistributorReports()]);
  return report;
}

export function updateDistributorReport(
  reportId: string,
  changes: ReportChanges,
  activity?: NewActivity,
): DistributorReport | null {
  const reports = readDistributorReports();
  const index = reports.findIndex((report) => report.id === reportId);
  if (index === -1) return null;

  const current = reports[index];
  const updatedAt = new Date().toISOString();
  const next: DistributorReport = {
    ...current,
    ...changes,
    updatedAt,
    activities: activity
      ? [
          {
            ...activity,
            id: createId("ACT"),
            createdAt: updatedAt,
          },
          ...current.activities,
        ]
      : current.activities,
  };

  const updatedReports = [...reports];
  updatedReports[index] = next;
  writeDistributorReports(updatedReports);
  return next;
}

export function subscribeToDistributorReports(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(DISTRIBUTOR_REPORTS_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(DISTRIBUTOR_REPORTS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

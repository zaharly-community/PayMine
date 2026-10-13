import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Search, ShieldAlert, ShieldCheck, UserCog, UserX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialAssignments } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/assignments")({
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const providers = ["All providers", ...Array.from(new Set(assignments.map((row) => row.provider)))];
  const rows = useMemo(() => assignments.filter((row) => {
    const text = query.trim().toLowerCase();
    const matchesText = !text || [row.id, row.accountId, row.accountName, row.provider, row.supervisor, row.assignedBy].join(" ").toLowerCase().includes(text);
    return matchesText && (providerFilter === "All providers" || row.provider === providerFilter);
  }), [assignments, providerFilter, query]);

  const activeCount = assignments.filter((row) => row.status === "Active").length;
  const suspendedCount = assignments.filter((row) => row.status === "Suspended").length;
  const sharedAccounts = new Set(assignments.filter((row) => row.status === "Active").map((row) => row.accountId)).size;
  const activeSupervisors = new Set(assignments.filter((row) => row.status === "Active").map((row) => row.supervisor)).size;

  function toggleAssignment(id: string) {
    setAssignments((current) => current.map((row) => row.id !== id ? row : ({ ...row, status: row.status === "Active" ? ("Suspended" as const) : ("Active" as const) })));
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader title="Supervisor access & assignments" description="See who can operate each payment account, which permissions they hold, and who granted access. This register helps the owner identify shared-account risk and revoke access when custody changes." icon={<UserCog className="size-5" />} action={<Badge variant="outline">{activeCount} active assignments</Badge>} />
      <MockDataNotice>Suspend / restore actions change demo state only. Production must enforce assignments on the server and, where the provider permits, use individual provider credentials. If several people share the same external login, iPayCash cannot prove which person performed an off-platform action using this register alone.</MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active assignments" value={String(activeCount)} detail="Account-specific access records" />
        <Metric label="Shared accounts" value={String(sharedAccounts)} detail="At least one account has multiple assignees" tone="warning" />
        <Metric label="Supervisors with access" value={String(activeSupervisors)} detail="Unique people in the assignment register" />
        <Metric label="Suspended assignments" value={String(suspendedCount)} detail="Mock suspended records" />
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-col gap-2 border-b p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1 md:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account, supervisor, assignment..." /></div>
          <select aria-label="Filter provider" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">{providers.map((item) => <option key={item}>{item}</option>)}</select>
          <Badge variant="outline" className="h-9 px-3">{rows.length} assignments</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Assignment", "Payment account", "Supervisor", "Permission scope", "Granted by", "Granted on", "Last activity", "Status", "Action"].map((head) => <th key={head} className="px-3 py-3 text-left font-medium">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className={row.status === "Suspended" ? "opacity-60" : "hover:bg-muted/20"}>
                  <td className="px-3 py-3 font-mono text-xs">{row.id}</td>
                  <td className="px-3 py-3"><p className="font-medium">{row.accountName}</p><p className="text-[11px] text-muted-foreground">{row.provider} · {row.accountId}</p></td>
                  <td className="px-3 py-3 font-medium">{row.supervisor}</td>
                  <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-xs"><KeyRound className="size-3.5 text-muted-foreground" />{row.scope}</span><p className="mt-1 text-[10px] text-muted-foreground">{row.shiftRequired ? "Shift required" : "No shift constraint"}</p></td>
                  <td className="px-3 py-3">{row.assignedBy}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs">{row.assignedAt}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-muted-foreground">{row.lastUsed}</td>
                  <td className="px-3 py-3"><TreasuryStatus status={row.status} /></td>
                  <td className="px-3 py-3"><Button size="sm" variant="outline" onClick={() => toggleAssignment(row.id)}><UserX className="size-3.5" />{row.status === "Active" ? "Suspend" : "Restore"}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No assignments match the current filters.</div> : null}
        </div>
      </Card>

      <Card className="shadow-none">
        <div className="flex items-start gap-3 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div><p className="text-sm font-medium">Shared-account risk to review</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Where multiple supervisors can execute transactions on one provider account, overlapping access makes attribution harder. Reduce concurrent access where possible, require a named shift owner, record each internal operator separately, and require an independent close / handover reviewer. Access revocation should be audited and should not erase historical assignments.</p></div>
        </div>
        <div className="border-t px-4 py-3"><p className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Assignment history should be retained even after a person is suspended.</p></div>
      </Card>
    </section>
  );
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "warning" }) {
  return <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={"mt-1.5 text-2xl font-semibold tabular-nums " + (tone === "warning" ? "text-amber-700" : "text-foreground")}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

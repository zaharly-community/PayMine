import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, FileSearch, Files, Search, ShieldCheck, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTnd, initialIncidents, type TreasuryIncident } from "@/lib/treasury-control-mock";
import { MockDataNotice, TreasuryPageHeader, TreasuryStatus } from "../-components/treasury-ui";

export const Route = createFileRoute("/(main)/dashboard/transactions/incidents")({
  component: IncidentsPage,
});

function IncidentsPage() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All incidents");
  const [selectedId, setSelectedId] = useState(initialIncidents[0]?.id ?? "");
  const selected = incidents.find((item) => item.id === selectedId) ?? incidents[0] ?? null;

  const rows = useMemo(() => incidents.filter((item) => {
    const needle = query.trim().toLowerCase();
    const matchesText = !needle || [item.id, item.accountName, item.accountId, item.supervisor, item.reviewer, item.category, item.summary, item.shiftId, item.handoverId].join(" ").toLowerCase().includes(needle);
    return matchesText && (statusFilter === "All incidents" || item.status === statusFilter);
  }), [incidents, query, statusFilter]);

  const openCount = incidents.filter((item) => item.status !== "Resolved · approved").length;
  const highRisk = incidents.filter((item) => item.severity === "High" || item.severity === "Critical").length;
  const exposure = incidents.filter((item) => item.status !== "Resolved · approved").reduce((sum, item) => sum + Math.abs(item.variance), 0);

  function updateIncident(id: string, patch: Partial<TreasuryIncident>) {
    setIncidents((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function addEvidenceDemo(item: TreasuryIncident) {
    updateIncident(item.id, { evidenceCount: item.evidenceCount + 1, status: "Investigating", lastAction: "Demo evidence added locally; reviewer must validate authenticity" });
  }

  function resolveDemo(item: TreasuryIncident) {
    if (item.evidenceCount < 2 || item.reviewer === item.supervisor) return;
    updateIncident(item.id, { status: "Resolved · approved", lastAction: "Marked resolved in the demo only; requires dual approval and accounting reversal/adjustment entry in production" });
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <TreasuryPageHeader title="Reconciliation incidents" description="Investigate unexplained shortages, surpluses, missing fee proof, and disputed handovers without modifying the original financial entries." icon={<FileSearch className="size-5" />} action={<Badge variant="destructive">{openCount} unresolved</Badge>} />
      <MockDataNotice>Incident actions are mock-only. Production resolution must require an independent reviewer, verified supporting evidence, immutable event history and a linked accounting correction when one is justified. Marking a case resolved must never alter its original transactions.</MockDataNotice>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Unresolved cases" value={String(openCount)} hint="Still require an independent decision" />
        <Metric label="High / critical risk" value={String(highRisk)} hint="Priority review queue" tone="danger" />
        <Metric label="Gross variance exposure" value={formatTnd(exposure)} hint="Absolute values; not a confirmed loss" tone="warning" />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <Card className="min-w-0 flex-1 overflow-hidden shadow-none">
          <div className="flex flex-col gap-2 border-b p-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9" placeholder="Search case, supervisor, account..." /></div>
            <select aria-label="Filter incidents" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option>All incidents</option><option>Open</option><option>Investigating</option><option>Awaiting evidence</option><option>Resolved · approved</option></select>
          </div>
          <div className="divide-y">
            {rows.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={"block w-full px-4 py-3.5 text-left transition-colors hover:bg-muted/30 " + (selected?.id === item.id ? "bg-muted/40" : "")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={item.severity === "High" || item.severity === "Critical" ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600" : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700"}><AlertTriangle className="size-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.id} · {item.accountName}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.category}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5"><TreasuryStatus status={item.status} /><Badge variant="outline">{item.severity} severity</Badge><Badge variant="outline">{item.evidenceCount} evidence item(s)</Badge></div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right"><p className={"text-sm font-semibold tabular-nums " + (item.variance < 0 ? "text-rose-600" : "text-amber-700")}>{item.variance < 0 ? "−" : "+"}{formatTnd(Math.abs(item.variance))}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.date}</p></div>
                </div>
              </button>
            ))}
            {!rows.length ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">No incidents match the current filters.</div> : null}
          </div>
        </Card>

        {selected ? <Card className="h-fit w-full shadow-none xl:sticky xl:top-4 xl:w-[420px]">
          <CardHeader className="border-b px-4 py-3.5">
            <div className="flex items-start justify-between gap-3"><div><CardTitle className="text-sm">Case file · {selected.id}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{selected.accountName} · {selected.accountId}</p></div><TreasuryStatus status={selected.status} /></div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Variance under investigation</p><p className={"mt-1 text-2xl font-semibold tabular-nums " + (selected.variance < 0 ? "text-rose-600" : "text-amber-700")}>{selected.variance < 0 ? "−" : "+"}{formatTnd(Math.abs(selected.variance))}</p><p className="mt-1 text-[11px] text-muted-foreground">This is an unresolved difference, not proof of misconduct.</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p><p className="mt-1.5 text-sm leading-5">{selected.summary}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <Meta label="Custody participants" value={selected.supervisor} />
              <Meta label="Independent reviewer" value={selected.reviewer} />
              <Meta label="Shift reference" value={selected.shiftId} />
              <Meta label="Handover reference" value={selected.handoverId} />
            </div>
            <div className="rounded-lg border p-3"><div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2 text-xs font-medium"><Files className="size-4 text-muted-foreground" /> Evidence inventory</span><Badge variant="outline">{selected.evidenceCount} item(s)</Badge></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Last action: {selected.lastAction}</p></div>
            <div className="grid gap-2">
              <Button size="sm" variant="outline" onClick={() => updateIncident(selected.id, { status: "Investigating", lastAction: "Investigation assigned to " + selected.reviewer })} disabled={selected.status === "Resolved · approved"}><UserRoundCheck className="size-4" /> Assign / continue investigation</Button>
              <Button size="sm" variant="outline" onClick={() => updateIncident(selected.id, { status: "Awaiting evidence", lastAction: "Evidence requested from " + selected.supervisor })} disabled={selected.status === "Resolved · approved"}>Request evidence</Button>
              <Button size="sm" variant="outline" onClick={() => addEvidenceDemo(selected)} disabled={selected.status === "Resolved · approved"}><Files className="size-4" /> Add evidence (demo)</Button>
              <Button size="sm" onClick={() => resolveDemo(selected)} disabled={selected.status === "Resolved · approved" || selected.evidenceCount < 2 || selected.reviewer === selected.supervisor}>Mark resolved (demo)</Button>
            </div>
            {(selected.evidenceCount < 2 || selected.reviewer === selected.supervisor) && selected.status !== "Resolved · approved" ? <p className="text-[11px] leading-4 text-muted-foreground">Resolution disabled: require at least 2 evidence items and an independent reviewer different from the accountable supervisor.</p> : null}
            <div className="flex flex-wrap gap-3 border-t pt-3 text-xs"><Link to={"/dashboard/transactions/shifts" as never} className="inline-flex items-center gap-1 text-primary hover:underline">Open shift <ArrowRight className="size-3.5" /></Link><Link to={"/dashboard/transactions/handovers" as never} className="inline-flex items-center gap-1 text-primary hover:underline">Open handover <ArrowRight className="size-3.5" /></Link></div>
          </CardContent>
        </Card> : null}
      </div>
    </section>
  );
}

function Metric({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "danger" | "warning" }) {
  const color = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-700" : "text-foreground";
  return <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={"mt-1.5 text-2xl font-semibold tabular-nums " + color}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 break-words text-xs font-medium">{value}</p></div>;
}

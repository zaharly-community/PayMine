import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingCard, SettingsShell } from "../-components/settings-shell";
import { auditRows } from "../-components/settings-data";

export const Route = createFileRoute("/(main)/dashboard/settings/audit-log")({ component: Page });

function Page() {
  return <SettingsShell active="audit-log" title="Audit log" description="Review administrative changes with actor, target, time and source metadata.">
    <SettingCard title="Administrative activity">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search audit events..." /></div>
        <Button variant="outline" size="sm"><SlidersHorizontal /> Filters</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-2">Event</th><th className="px-3 py-2">Actor</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Date</th></tr></thead>
          <tbody>{auditRows.map((row) => <tr key={row.id} className="border-b last:border-0"><td className="px-3 py-3 font-mono text-xs">{row.id}</td><td className="px-3 py-3">{row.actor}</td><td className="px-3 py-3">{row.action}</td><td className="px-3 py-3">{row.target}</td><td className="px-3 py-3"><Badge variant="outline">{row.ip}</Badge></td><td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{row.date}</td></tr>)}</tbody>
        </table>
      </div>
    </SettingCard>
  </SettingsShell>;
}

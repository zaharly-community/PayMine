import { createFileRoute } from "@tanstack/react-router";
import { ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingCard, SettingsShell } from "../-components/settings-shell";
import { featureRows } from "../-components/settings-data";

export const Route = createFileRoute("/(main)/dashboard/settings/features")({ component: Page });

function Page() {
  return <SettingsShell active="features" title="Features" description="Platform capabilities and rollout state by module.">
    <SettingCard title="Feature controls" description="Manage modules and keep experimental capabilities in preview.">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-2">Feature</th><th className="px-3 py-2">Owner</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Action</th></tr></thead>
          <tbody>{featureRows.map((row) => <tr key={row.name} className="border-b last:border-0"><td className="px-3 py-3"><p className="font-medium">{row.name}</p><p className="mt-1 text-xs text-muted-foreground">{row.description}</p></td><td className="px-3 py-3 text-xs text-muted-foreground">{row.owner}</td><td className="px-3 py-3"><Badge variant={row.status === "Enabled" ? "secondary" : "outline"}>{row.status}</Badge></td><td className="px-3 py-3 text-right"><Button size="sm" variant="outline"><ToggleLeft /> Manage</Button></td></tr>)}</tbody>
        </table>
      </div>
    </SettingCard>
  </SettingsShell>;
}

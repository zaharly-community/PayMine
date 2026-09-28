import { createFileRoute } from "@tanstack/react-router";
import { Activity, BellRing, DatabaseBackup, Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/system-health")({ component: Page });

function Page() {
  return (
    <SettingsShell active="system-health" title="System Health" description="Tune operational monitoring, retention and alert delivery for PayMine.">
      <div className="space-y-4">
        <SettingCard title="Monitoring" description="Frontend controls for operational alert behavior.">
          <div className="space-y-4">
            {[
              ["System health alerts", "Notify operations when service, provider or reconciliation checks report an incident.", true],
              ["Escalate critical incidents", "Keep critical payment failures visible even during quiet hours.", true],
              ["Track provider latency", "Include payment-channel response timing in health monitoring.", true],
            ].map(([title, description, checked]) => (
              <div key={String(title)} className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
                <Switch defaultChecked={Boolean(checked)} />
              </div>
            ))}
          </div>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingCard title="Retention" description="Keep operational occurrences available for troubleshooting and audit context.">
            <div className="grid gap-2 sm:max-w-sm"><Label>Keep occurrences for</Label><div className="flex items-center gap-2"><Input defaultValue="30" inputMode="numeric" /><span className="text-xs text-muted-foreground">days</span></div></div>
            <Button className="mt-4" size="sm">Save retention</Button>
          </SettingCard>

          <SettingCard title="Quiet hours" description="Hold non-critical alerts during a defined window. Critical incidents continue to surface.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Start</Label><Input type="time" defaultValue="23:00" /></div>
              <div className="grid gap-2"><Label>End</Label><Input type="time" defaultValue="07:00" /></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border p-3"><span className="text-sm font-medium">Enable quiet hours</span><Switch defaultChecked={false} /></div>
          </SettingCard>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Monitoring", "Active", Activity],
            ["Retention", "30 days", DatabaseBackup],
            ["Provider checks", "Enabled", Gauge],
          ].map(([title, value, Icon]) => (
            <div key={String(title)} className="flex items-center gap-3 rounded-xl border p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
              <div><p className="text-xs text-muted-foreground">{title}</p><p className="text-sm font-medium">{value}</p></div>
            </div>
          ))}
        </div>
      </div>
    </SettingsShell>
  );
}

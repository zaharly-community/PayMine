import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Wrench, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/maintenance")({ component: Page });

function Page() {
  return (
    <SettingsShell active="maintenance" title="Maintenance" description="Prepare a controlled maintenance window without changing normal payment operations until explicitly enabled.">
      <div className="space-y-4">
        <SettingCard title="Runtime controls" description="Maintenance settings are presented here as configuration; the current frontend does not force a maintenance screen.">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-medium">Maintenance mode</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Show a temporary service message to customer-facing payment surfaces during planned downtime.</p></div>
            <Switch defaultChecked={false} />
          </div>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2"><Label>Maintenance message</Label><textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue="PayMine is temporarily unavailable while we complete scheduled maintenance. Please try again shortly." /></div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><p className="text-sm font-medium">Keep admin access available</p><p className="mt-1 text-xs text-muted-foreground">Allow authorized operators to continue using the dashboard while customer-facing surfaces are unavailable.</p></div><Switch defaultChecked /></div>
          </div>
          <Button className="mt-4" size="sm">Save maintenance settings</Button>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingCard title="Access recovery" description="Recovery configuration to document before activating a maintenance window.">
            <div className="grid gap-2"><Label>Recovery key</Label><div className="flex gap-2"><Input type="password" defaultValue="paymine-recovery-key" /><Button size="icon" variant="outline" aria-label="Reveal recovery key"><KeyRound className="size-4" /></Button></div></div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Store the recovery secret outside the dashboard before enabling maintenance controls in a production environment.</p>
          </SettingCard>

          <SettingCard title="Maintenance checklist" description="Quick operational indicators before a controlled downtime window.">
            <div className="space-y-3">
              {[
                ["Notify operators", true],
                ["Confirm provider status", true],
                ["Confirm recovery access", false],
              ].map(([label, checked]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
                  <Switch defaultChecked={Boolean(checked)} />
                </div>
              ))}
            </div>
          </SettingCard>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-dashed p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Wrench className="size-4" /></div>
          <div><p className="text-sm font-medium">Safe default</p><p className="text-xs text-muted-foreground">Maintenance mode remains off until an operator intentionally enables it.</p></div>
        </div>
      </div>
    </SettingsShell>
  );
}

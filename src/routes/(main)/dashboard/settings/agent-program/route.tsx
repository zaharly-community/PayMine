import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Globe2, Percent, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/agent-program")({ component: Page });

function Page() {
  return (
    <SettingsShell active="agent-program" title="Agent Program" description="Manage distributor onboarding, agent limits, commissions and eligibility.">
      <div className="space-y-4">
        <SettingCard title="Program availability" description="Global visibility and onboarding behavior for the distributor/agent program.">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 border-b pb-4"><div><p className="text-sm font-medium">Enable Agent Program</p><p className="mt-1 text-xs text-muted-foreground">Show agent capabilities across the distributor workflow.</p></div><Switch defaultChecked /></div>
            <div className="flex items-start justify-between gap-4 border-b pb-4"><div><p className="text-sm font-medium">Allow public registration</p><p className="mt-1 text-xs text-muted-foreground">Allow prospective agents to submit an application without an admin invitation.</p></div><Switch defaultChecked={false} /></div>
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">Auto approve new agents</p><p className="mt-1 text-xs text-muted-foreground">Skip manual approval for new agent applications.</p></div><Switch defaultChecked={false} /></div>
          </div>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingCard title="Review requirements" description="Gate agent applications before activation.">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">Require approved KYC</p><p className="mt-1 text-xs text-muted-foreground">Applicants must have approved identity verification before becoming an agent.</p></div><Switch defaultChecked={false} /></div>
              <div className="grid gap-2"><Label>Max agent profiles per user</Label><div className="flex items-center gap-2"><Input defaultValue="1" inputMode="numeric" /><span className="text-xs text-muted-foreground">profiles</span></div></div>
              <div className="grid gap-2"><Label>Agent code prefix</Label><Input defaultValue="AGT-" /></div>
            </div>
          </SettingCard>

          <SettingCard title="Commission rules" description="Default range applied when an agent commission is configured.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2"><Label>Default</Label><div className="flex items-center gap-2"><Input defaultValue="0" inputMode="decimal" /><Percent className="size-4 text-muted-foreground" /></div></div>
              <div className="grid gap-2"><Label>Minimum</Label><div className="flex items-center gap-2"><Input defaultValue="0" inputMode="decimal" /><Percent className="size-4 text-muted-foreground" /></div></div>
              <div className="grid gap-2"><Label>Maximum</Label><div className="flex items-center gap-2"><Input defaultValue="100" inputMode="decimal" /><Percent className="size-4 text-muted-foreground" /></div></div>
            </div>
            <Button className="mt-4" size="sm">Save commission rules</Button>
          </SettingCard>

          <SettingCard title="Country eligibility" description="Optional ISO-2 allowlist. Leave empty to allow all countries.">
            <div className="grid gap-2"><Label>Allowed countries</Label><textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue="" placeholder="TN, DZ, MA, ..."/></div>
          </SettingCard>

          <SettingCard title="Notifications" description="Agent-program events for operations and platform users.">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4"><span className="text-sm">Admin email notifications</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between gap-4"><span className="text-sm">Applicant status notifications</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between gap-4"><span className="text-sm">Commission change notifications</span><Switch defaultChecked /></div>
            </div>
          </SettingCard>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Program", "Enabled", UsersRound],
            ["KYC gate", "Optional", BadgeCheck],
            ["Commission", "0–100%", Globe2],
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

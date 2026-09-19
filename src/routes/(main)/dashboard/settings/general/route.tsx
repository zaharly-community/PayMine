import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsShell, SettingCard } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/general")({ component: Page });

function Page() {
  return <SettingsShell active="general" title="General" description="Core workspace identity and operating defaults.">
    <div className="grid gap-4 xl:grid-cols-2">
      <SettingCard title="Workspace profile" description="Default organization details used across internal screens.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2"><Label>Workspace name</Label><Input defaultValue="PayMine Operations" /></div>
          <div className="grid gap-2"><Label>Organization ID</Label><Input defaultValue="ORG-PM-0019" disabled /></div>
          <div className="grid gap-2 sm:col-span-2"><Label>Support email</Label><Input defaultValue="support@paymine.example" /></div>
        </div>
        <Button className="mt-4" size="sm">Save changes</Button>
      </SettingCard>
      <SettingCard title="Regional defaults" description="Defaults applied to new users and operational views.">
        <div className="grid gap-4">
          <div className="grid gap-2"><Label>Default currency</Label><Input defaultValue="USD" /></div>
          <div className="grid gap-2"><Label>Timezone</Label><Input defaultValue="UTC+01:00 — Tunis" /></div>
          <div className="grid gap-2"><Label>Date format</Label><Input defaultValue="DD MMM YYYY, HH:mm" /></div>
        </div>
      </SettingCard>
    </div>
  </SettingsShell>;
}

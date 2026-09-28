import { createFileRoute } from "@tanstack/react-router";
import { Bell, Mail, Play, Smartphone, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/notifications")({ component: Page });

function Page() {
  return (
    <SettingsShell active="notifications" title="Notifications" description="Choose operational alert channels, events and the default in-app notification sound.">
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingCard title="Channels">
          <div className="space-y-4">
            {[
              ["In-app", "Live dashboard notifications", Bell, true],
              ["Email", "Operational summaries and critical alerts", Mail, true],
              ["SMS", "High-priority payment incidents", Smartphone, false],
            ].map(([title, description, Icon, checked]) => (
              <div key={String(title)} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></div><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div></div>
                <Switch defaultChecked={Boolean(checked)} />
              </div>
            ))}
          </div>
        </SettingCard>

        <SettingCard title="Alert events">
          <div className="space-y-3">
            {[
              "Failed provider authentication",
              "Treasury mismatch detected",
              "Settlement blocked",
              "New distributor invited",
              "Daily finance digest",
            ].map((event, index) => (
              <div key={event} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"><span className="text-sm">{event}</span><Switch defaultChecked={index < 4} /></div>
            ))}
          </div>
        </SettingCard>

        <SettingCard title="Default sound" description="Default behavior for real-time in-app notifications.">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Volume2 className="size-4" /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">Play notification tune</p><p className="text-xs text-muted-foreground">Use a sound cue when a new operational alert arrives in the dashboard.</p></div>
            <Switch defaultChecked />
          </div>
          <div className="mt-4 grid gap-2">
            <label className="text-sm font-medium">Sound profile</label>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" defaultValue="standard">
              <option value="standard">Standard</option>
              <option value="soft">Soft</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <Button className="mt-4" size="sm" variant="outline"><Play /> Preview tune</Button>
        </SettingCard>
      </div>
    </SettingsShell>
  );
}

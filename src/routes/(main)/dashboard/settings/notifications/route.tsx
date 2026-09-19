import { createFileRoute } from "@tanstack/react-router";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/notifications")({ component: Page });

function Page() {
  return <SettingsShell active="notifications" title="Notifications" description="Choose which operational events should generate alerts.">
    <div className="grid gap-4 xl:grid-cols-2">
      <SettingCard title="Channels">
        <div className="space-y-4">
          {[["In-app", "Live dashboard notifications", Bell, true], ["Email", "Operational summaries and critical alerts", Mail, true], ["SMS", "High-priority payment incidents", Smartphone, false]].map(([title, description, Icon, checked]) =>
            <div key={String(title)} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></div><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div></div>
              <Switch defaultChecked={Boolean(checked)} />
            </div>)}
        </div>
      </SettingCard>
      <SettingCard title="Alert events">
        <div className="space-y-3">
          {["Failed provider authentication", "Treasury mismatch detected", "Settlement blocked", "New distributor invited", "Daily finance digest"].map((event, index) =>
            <div key={event} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"><span className="text-sm">{event}</span><Switch defaultChecked={index < 4} /></div>)}
        </div>
      </SettingCard>
    </div>
  </SettingsShell>;
}

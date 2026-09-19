import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/security")({ component: Page });

function Page() {
  return <SettingsShell active="security" title="Security" description="Authentication requirements and active session protection.">
    <div className="grid gap-4 xl:grid-cols-2">
      <SettingCard title="Authentication policy" description="Default security policy for internal operators.">
        <div className="space-y-4">
          {[["Require MFA", "All Admin and Finance users must verify with a second factor.", true], ["Block risky sessions", "Challenge sessions from new devices or unusual locations.", true], ["Force password rotation", "Require password updates every 90 days.", false]].map(([title, description, checked]) =>
            <div key={String(title)} className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
              <Switch defaultChecked={Boolean(checked)} />
            </div>)}
        </div>
      </SettingCard>
      <SettingCard title="Security tools">
        <div className="space-y-3">
          {[["MFA devices", "3 active authenticators", Smartphone], ["Password policy", "Strong · 12+ characters", KeyRound], ["Security status", "Protected", ShieldCheck]].map(([title, description, Icon]) =>
            <div key={String(title)} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
              <div className="min-w-0"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div>
            </div>)}
        </div>
        <Button className="mt-4" size="sm" variant="outline">Review active sessions</Button>
      </SettingCard>
    </div>
  </SettingsShell>;
}

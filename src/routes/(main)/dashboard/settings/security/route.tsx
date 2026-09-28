import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, LockKeyhole, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/security")({ component: Page });

function ToggleRow({ title, description, checked = true }: { title: string; description: string; checked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
      <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
      <Switch defaultChecked={checked} />
    </div>
  );
}

function NumberField({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input defaultValue={value} inputMode="numeric" className="max-w-32" />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Page() {
  return (
    <SettingsShell active="security" title="Security" description="Protect operator access, wallet payment actions and merchant API requests.">
      <div className="space-y-4">
        <SettingCard title="Access protection" description="Transport security, account verification and idle-session controls.">
          <div className="space-y-4">
            <ToggleRow title="Require email verification" description="Require new operator accounts to confirm their email before normal dashboard access." checked />
            <ToggleRow title="Screen lock" description="Lock an idle dashboard session and require the operator password again." checked />
            <div className="grid gap-2 border-t pt-4 sm:max-w-sm">
              <Label>Screen lock duration</Label>
              <div className="flex items-center gap-2"><Input defaultValue="10" inputMode="numeric" /><span className="text-xs text-muted-foreground">minutes</span></div>
            </div>
          </div>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingCard title="Authentication lockouts" description="Brute-force protection for dashboard sign-ins.">
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="Login attempt limit" value="5" unit="attempts" />
              <NumberField label="Login lock duration" value="15" unit="minutes" />
            </div>
          </SettingCard>

          <SettingCard title="Browser protection" description="Security-focused browser response defaults.">
            <div className="space-y-4">
              <ToggleRow title="Secure response headers" description="Enable the platform security-header policy for dashboard responses." checked />
              <ToggleRow title="Strict transport security" description="Keep browsers on HTTPS after a secure visit." checked />
              <ToggleRow title="Force HTTPS" description="Redirect dashboard traffic to HTTPS once a valid TLS certificate is installed." checked={false} />
            </div>
          </SettingCard>

          <SettingCard title="Wallet payment protection" description="Controls for PIN-based wallet authorization used by payment flows.">
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="PIN attempt limit" value="5" unit="attempts" />
              <NumberField label="PIN lock duration" value="15" unit="minutes" />
            </div>
            <Button className="mt-4" size="sm" variant="outline"><LockKeyhole /> Save wallet protection</Button>
          </SettingCard>

          <SettingCard title="Merchant API protection" description="Signature, replay-window and abuse controls for payment API calls.">
            <div className="space-y-4">
              <ToggleRow title="Require API signatures" description="Require signed merchant requests before payment initiation or verification is accepted." checked />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField label="Timestamp tolerance" value="300" unit="seconds" />
                <NumberField label="Rate limit" value="120" unit="requests/min" />
              </div>
            </div>
          </SettingCard>
        </div>

        <SettingCard title="Request limits" description="Protect payment and portal flows from duplicate submissions.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-2 sm:max-w-sm"><Label>Duplicate submission lock</Label><div className="flex items-center gap-2"><Input defaultValue="1" inputMode="numeric" /><span className="text-xs text-muted-foreground">seconds</span></div></div>
            <Button size="sm">Save security settings</Button>
          </div>
        </SettingCard>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Security status", "Protected", ShieldCheck],
            ["API signing", "Required", ShieldAlert],
            ["MFA posture", "3 authenticators", Smartphone],
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

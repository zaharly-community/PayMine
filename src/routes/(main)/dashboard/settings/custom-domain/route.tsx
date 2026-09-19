import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Globe2, LockKeyhole, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/custom-domain")({ component: Page });

function Page() {
  return (
    <SettingsShell active="custom-domain" title="Custom domain" description="Connect a branded domain for the PayMine dashboard and hosted payment portal.">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <SettingCard title="Domain configuration" description="Default mock values for a production-ready domain setup flow.">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Custom domain</Label>
              <Input defaultValue="pay.example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Portal domain</Label>
              <Input defaultValue="checkout.example.com" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">SSL</p><div className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="size-4" /> Active</div></div>
              <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">DNS status</p><div className="mt-1 flex items-center gap-2 text-sm font-medium"><Globe2 className="size-4" /> Verified</div></div>
            </div>
            <Button size="sm">Save domain</Button>
          </div>
        </SettingCard>

        <SettingCard title="DNS instructions" description="Point your domain to the PayMine edge endpoint.">
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">CNAME</p><p className="mt-1 font-mono text-xs">pay.example.com → edge.paymine.test</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Verification token</p><p className="mt-1 font-mono text-xs">pm-domain-8c41b2</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Last verified</p><p className="mt-1 text-sm font-medium">18 Sep 2026, 09:42</p></div>
          </div>
          <div className="mt-4 flex gap-2"><Button size="sm" variant="outline"><RefreshCw /> Re-check DNS</Button><Button size="sm" variant="outline"><LockKeyhole /> SSL settings</Button></div>
        </SettingCard>
      </div>

      <SettingCard title="Domain health" description="Current frontend-only status checks.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Health label="DNS" value="Verified" />
          <Health label="SSL" value="Active" />
          <Health label="Portal" value="Reachable" />
        </div>
      </SettingCard>
    </SettingsShell>
  );
}

function Health({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm text-muted-foreground">{label}</span><Badge variant="secondary"><CheckCircle2 className="size-3.5" />{value}</Badge></div>;
}

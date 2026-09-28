import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileCheck2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/kyc-verification")({ component: Page });

function Page() {
  return (
    <SettingsShell active="kyc-verification" title="KYC Verification" description="Configure player identity verification, review thresholds and applicant consent.">
      <div className="space-y-4">
        <SettingCard title="Automated verification" description="Run eligible player submissions through an identity provider when integration credentials are available.">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Enable automated KYC</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">Keep this off while no provider is connected. Submissions can continue through manual review.</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="mt-4 grid gap-2 sm:max-w-sm">
            <Label>Verification provider</Label>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" defaultValue="manual">
              <option value="manual">Manual review</option>
              <option value="sumsub">Sumsub</option>
              <option value="shuftipro">ShuftiPro</option>
            </select>
          </div>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingCard title="Decision thresholds" description="Provider risk scores run from 0 (clean) to 100 (high risk). Scores between the two thresholds remain in manual review.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Auto approve below</Label><div className="flex items-center gap-2"><Input defaultValue="20" inputMode="numeric" /><span className="text-xs text-muted-foreground">/ 100</span></div></div>
              <div className="grid gap-2"><Label>Auto reject above</Label><div className="flex items-center gap-2"><Input defaultValue="70" inputMode="numeric" /><span className="text-xs text-muted-foreground">/ 100</span></div></div>
            </div>
            <Button className="mt-4" size="sm">Save thresholds</Button>
          </SettingCard>

          <SettingCard title="Applicant consent" description="Store the consent wording alongside each verification submission.">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-medium">Require applicant consent</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Show a consent checkbox before documents are shared with the verification provider.</p></div>
              <Switch defaultChecked />
            </div>
            <div className="mt-4 grid gap-2">
              <Label>Consent statement</Label>
              <textarea className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" defaultValue={"I authorise :site to collect my identity information and documents for the sole purpose of verifying my identity.\n\nI confirm the information and documents I provide are genuine and belong to me."} />
            </div>
          </SettingCard>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Verification mode", "Manual review", FileCheck2],
            ["Approval line", "< 20 / 100", CheckCircle2],
            ["Review queue", "Risk 20–70", ShieldAlert],
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

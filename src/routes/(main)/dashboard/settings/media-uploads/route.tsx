import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileImage, HardDriveUpload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/media-uploads")({ component: Page });

function Page() {
  return (
    <SettingsShell active="media-uploads" title="Media & Uploads" description="Control upload limits and accepted file types for payment evidence and identity documents.">
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingCard title="Upload size" description="Global ceiling for files uploaded through the PayMine interface.">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2"><Label>Maximum upload size</Label><Input defaultValue="5" inputMode="numeric" /></div>
            <span className="pb-2 text-xs text-muted-foreground">MB</span>
          </div>
          <Button className="mt-4" size="sm"><HardDriveUpload /> Save upload limit</Button>
        </SettingCard>

        <SettingCard title="Payment evidence" description="Recommended file types for deposit and withdrawal verification evidence.">
          <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileImage className="size-4" /></div>
            <div><p className="text-sm font-medium">Accepted evidence formats</p><p className="mt-1 text-xs leading-5 text-muted-foreground">JPG, JPEG, PNG, WEBP, PDF</p></div>
          </div>
          <div className="mt-4 grid gap-2"><Label>Evidence file types</Label><Input defaultValue="jpg, jpeg, png, webp, pdf" /></div>
        </SettingCard>

        <SettingCard title="Identity documents" description="Narrow file list for KYC documents.">
          <div className="grid gap-2"><Label>Identity document types</Label><textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue="jpg, jpeg, png, webp, pdf"/></div>
          <div className="mt-4 flex items-center gap-3 rounded-lg border p-3"><FileCheck2 className="size-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Archives and executable files are intentionally excluded from identity uploads.</span></div>
        </SettingCard>

        <SettingCard title="Support attachments" description="General attachments used when operators add supporting files to an operational case.">
          <div className="grid gap-2"><Label>Attachment file types</Label><textarea className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue="pdf, csv, txt, json, png, jpg, jpeg, gif, svg, webp" /></div>
        </SettingCard>
      </div>
    </SettingsShell>
  );
}

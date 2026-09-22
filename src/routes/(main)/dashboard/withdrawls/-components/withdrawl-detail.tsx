import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clipboard,
  FileImage,
  Mail,
  Maximize2,
  Minus,
  Pencil,
  Plus,
  RefreshCcw,
  Upload,
  WalletCards,
  X,
} from "lucide-react";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadImage = {
  url: string;
  name: string;
  size: number;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 text-lg font-semibold tracking-tight">{children}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("truncate text-sm font-medium", mono && "font-mono text-xs")}>
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  date,
  time,
  title,
  actor,
  description,
  active = false,
}: {
  date: string;
  time: string;
  title: string;
  actor: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="grid grid-cols-[72px_20px_1fr] gap-3">
      <div className="pt-0.5 text-right text-xs text-muted-foreground">
        <div>{date}</div>
        <div>{time}</div>
      </div>
      <div className="relative flex justify-center">
        <span
          className={cn(
            "mt-1.5 size-2.5 rounded-full border-2 bg-background",
            active ? "border-amber-500 bg-amber-500" : "border-muted-foreground/40",
          )}
        />
        <span className="absolute top-4 bottom-0 w-px bg-border" />
      </div>
      <div className="pb-7">
        <div className="text-sm">
          <span className="font-semibold">{title}</span>
          <span className="ml-1 text-muted-foreground">by {actor}</span>
        </div>
        <div className="mt-1 text-sm leading-5 text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function WithdrawalProofUpload() {
  const [image, setImage] = useState<UploadImage | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(1);

  const acceptFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return {
        url,
        name: file.name,
        size: file.size,
      };
    });
    setScale(1);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setScale(1);
    setFullscreen(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b pb-0">
          <div className="flex items-center justify-between gap-3 px-0 pb-3">
            <div>
              <CardTitle className="text-sm">Withdrawal proof</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload the screenshot or receipt confirming the payout.
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {image ? "1 image" : "Required"}
            </span>
          </div>
        </CardHeader>

        <div
          className={cn(
            "relative flex h-[320px] items-center justify-center overflow-hidden border-b bg-muted/20",
            dragging && "bg-muted/40",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            acceptFile(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            id="withdrawal-proof-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleInput}
          />

          {image ? (
            <>
              <img
                src={image.url}
                alt="Withdrawal proof"
                draggable={false}
                className="size-full object-contain"
                style={{
                  transform: "scale(" + scale + ")",
                  transition: "transform 160ms ease-out",
                }}
              />

              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setScale((value) => Math.max(1, value - 0.5))}
                  disabled={scale <= 1}
                  aria-label="Zoom out"
                >
                  <Minus />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setScale((value) => Math.min(4, value + 0.5))}
                  disabled={scale >= 4}
                  aria-label="Zoom in"
                >
                  <Plus />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setFullscreen(true)}
                  aria-label="Open full screen"
                >
                  <Maximize2 />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  <X />
                </Button>
              </div>

              <div className="absolute bottom-3 left-3 flex max-w-[85%] items-center gap-2 rounded-md bg-black/60 px-2.5 py-1.5 text-[11px] text-white backdrop-blur">
                <FileImage className="size-3.5 shrink-0" />
                <span className="truncate">{image.name}</span>
                <span className="shrink-0">{formatFileSize(image.size)}</span>
              </div>
            </>
          ) : (
            <label
              htmlFor="withdrawal-proof-upload"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-6 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm">
                <Upload className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">Upload withdrawal proof</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                Drag and drop an image here, or choose a screenshot or receipt from your device.
              </p>
              <span className="mt-3 rounded-md border bg-background px-2.5 py-1 text-[11px] font-medium">
                Choose image
              </span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-none border-r text-sm"
            onClick={() => document.getElementById("withdrawal-proof-upload")?.click()}
          >
            <Upload />
            {image ? "Replace image" : "Upload image"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-none text-sm"
            disabled={!image}
            onClick={() => image && setFullscreen(true)}
          >
            <Maximize2 />
            Preview
          </Button>
        </div>
      </Card>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-black p-0 text-white shadow-none"
        >
          <div className="relative flex h-full w-full items-center justify-center p-5">
            {image ? (
              <img
                src={image.url}
                alt="Withdrawal proof"
                className="max-h-full max-w-full object-contain"
                style={{
                  transform: "scale(" + scale + ")",
                  transition: "transform 160ms ease-out",
                }}
              />
            ) : null}
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 p-1 backdrop-blur">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setScale((value) => Math.max(1, value - 0.5))}
                disabled={scale <= 1}
              >
                <Minus />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setScale((value) => Math.min(4, value + 0.5))}
                disabled={scale >= 4}
              >
                <Plus />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                onClick={() => setFullscreen(false)}
              >
                <X />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WithdrawalDetail() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <section className="min-h-full bg-background pb-24">
      <header className="border-b px-6 py-5">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-6 rounded-md border-amber-500/20 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400"
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-amber-500" />
                  Pending review
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  WDL-02026001
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Withdrawal WDL-02026001
                </h1>
                <Button variant="outline" size="icon-sm" aria-label="Edit withdrawal">
                  <Pencil />
                </Button>
              </div>

              <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
                Review the payout destination, withdrawal amount, operator history, and uploaded proof before marking the withdrawal complete.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" size="sm">
                <RefreshCcw />
                Reprocess
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => setReportOpen(true)}>
                <AlertTriangle />
                Report customer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 xl:grid-cols-[minmax(0,1fr)_304px]">
        <main className="min-w-0 space-y-10">
          <section className="space-y-5">
            <SectionHeading>Withdrawal Details</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Withdrawal ID" value="WDL-02026001" mono />
              <Field label="Amount" value="$185.23" />
              <Field label="Player" value="Olivia Rhye" />
              <Field label="Method" value="Flouci" />
              <Field label="Commission" value="$1.85 · 1.00%" />
              <Field label="Net payout" value="$183.38" />
              <Field label="Processed by" value="Koray Okumus" />
              <Field label="Currency" value="USD" />
              <Field label="Requested" value="Sep 18, 2026, 10:12 AM" />
              <Field label="Completed" value="—" />
              <Field label="Destination" value="+216 ·••• · 4421" />
              <Field label="Reference" value="FL-98200417" mono />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>History</SectionHeading>
            <div>
              <TimelineItem
                date="Sep 18"
                time="10:13"
                title="Destination verified"
                actor="PayMine"
                description="The destination details passed validation and the withdrawal was released to the payout queue."
                active
              />
              <TimelineItem
                date="Sep 18"
                time="10:12"
                title="Withdrawal requested"
                actor="System"
                description="A withdrawal request for $185.23 was created for Olivia Rhye through Flouci."
              />
              <TimelineItem
                date="Sep 17"
                time="05:28"
                title="Account reviewed"
                actor="Risk engine"
                description="No blocking rule was triggered. Proof is still required before final completion."
              />
            </div>
          </section>

          <div className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.location.assign("/dashboard/withdrawls")}
            >
              <ArrowLeft />
              Back to withdrawals
            </Button>
          </div>
        </main>

        <aside className="min-w-0 self-start">
          <div className="sticky top-6 space-y-4">
            <WithdrawalProofUpload />

            <Button variant="outline" className="w-full">
              <Mail />
              Email customer
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigator.clipboard?.writeText("WDL-02026001")}
            >
              <Clipboard />
              Copy withdrawal ID
            </Button>


          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t bg-background/95 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-(--sidebar-width)">
        <div className="flex min-h-[72px] w-full min-w-0 items-center gap-3 px-4 py-2.5 md:px-5 lg:px-6">
          <Badge
            variant="outline"
            className="h-6 shrink-0 rounded-md border-amber-500/20 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400"
          >
            <span className="mr-1.5 size-1.5 rounded-full bg-amber-500" />
            Pending review
          </Badge>

          <div className="shrink-0 text-2xl font-semibold tracking-tight tabular-nums">
            $185.23
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Commission</div>
              <div className="mt-0.5 text-sm font-semibold tabular-nums">$1.85</div>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Net payout</div>
              <div className="mt-0.5 text-sm font-semibold tabular-nums">$183.38</div>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Button type="button" variant="outline" className="h-9 px-3">
              <CheckCircle2 />
              Mark completed
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-9 px-3"
              onClick={() => setReportOpen(true)}
            >
              <AlertTriangle />
              Report customer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
}

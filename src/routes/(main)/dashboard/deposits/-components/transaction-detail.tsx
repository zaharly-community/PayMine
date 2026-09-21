import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  Maximize2,
  Minus,
  Plus,
  Download,
  FileText,
  Mail,
  MoreVertical,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
  MessageSquare,
  X,
} from "lucide-react";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function SectionHeading({ children }: { children: ReactNode }) {
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

function DocumentCard({
  name,
  meta,
  icon: Icon = FileText,
}: {
  name: string;
  meta: string;
  icon?: typeof FileText;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/40">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        </div>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${name}`}>
        <MoreVertical />
      </Button>
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

const evidenceImages = [
  {
    src: "https://public.bnbstatic.com/image/cms/article/body/202404/8338b4f18b05bcfe65d55fe54b671c60.png",
    title: "Payment evidence 1",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmMEuNPq2ez4ZHbY7Icxe4b_8fsoirmKqJaexD7mudUEeG-kCYwnW9ltTe&s=10",
    title: "Payment evidence 2",
  },
] as const;

function EvidenceGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const image = evidenceImages[currentIndex];

  const zoomIn = () =>
    setScale((value) => Math.min(5, Number((value + 0.5).toFixed(1))));

  const zoomOut = () =>
    setScale((value) => {
      const next = Math.max(1, Number((value - 0.5).toFixed(1)));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });

  const previousImage = () => {
    if (evidenceImages.length < 2) return;
    setCurrentIndex(
      (value) => (value - 1 + evidenceImages.length) % evidenceImages.length,
    );
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (evidenceImages.length < 2) return;
    setCurrentIndex((value) => (value + 1) % evidenceImages.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!fullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "+" || event.key === "=") zoomIn();
      if (event.key === "-") zoomOut();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  const openFullscreen = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setFullscreen(true);
  };

  const imageStage = (isFullscreen: boolean) => (
    <div
      className={cn(
        "relative overflow-hidden bg-black/5",
        isFullscreen
          ? "flex h-[100dvh] w-full items-center justify-center"
          : "h-[320px] w-full",
        dragging
          ? "cursor-grabbing"
          : scale > 1
            ? "cursor-grab"
            : "cursor-zoom-in",
      )}
      onWheel={(event) => {
        event.preventDefault();
        if (event.deltaY < 0) zoomIn();
        else zoomOut();
      }}
      onDoubleClick={() => {
        if (scale < 5) zoomIn();
      }}
      onPointerDown={(event) => {
        if (scale === 1) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = { x: event.clientX, y: event.clientY };
        startOffset.current = offset;
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!dragging) return;
        setOffset({
          x: startOffset.current.x + (event.clientX - dragStart.current.x),
          y: startOffset.current.y + (event.clientY - dragStart.current.y),
        });
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDragging(false);
      }}
      onPointerCancel={() => setDragging(false)}
    >
      <img
        src={image.src}
        alt={image.title}
        draggable={false}
        onClick={() => {
          if (!isFullscreen && scale === 1) openFullscreen();
        }}
        className={cn(
          "absolute inset-0 size-full select-none transition-transform duration-150",
          isFullscreen ? "object-contain" : "object-cover",
        )}
        style={{
          transform:
            "translate(" +
            offset.x +
            "px, " +
            offset.y +
            "px) scale(" +
            scale +
            ")",
        }}
      />

      <div
        className={cn(
          "absolute z-10 flex items-center gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur",
          isFullscreen
            ? "left-1/2 top-4 -translate-x-1/2"
            : "right-3 top-3",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={previousImage}
          disabled={evidenceImages.length <= 1}
          aria-label="Previous evidence image"
        >
          <ArrowLeft />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={zoomOut}
          disabled={scale <= 1}
          aria-label="Zoom out"
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={zoomIn}
          disabled={scale >= 5}
          aria-label="Zoom in"
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={nextImage}
          disabled={evidenceImages.length <= 1}
          aria-label="Next evidence image"
        >
          <ChevronRight />
        </Button>
      </div>

      <div
        className={cn(
          "absolute z-10 flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur",
          isFullscreen ? "left-4 bottom-4" : "left-3 bottom-3",
        )}
      >
        <span className="tabular-nums">
          {currentIndex + 1} / {evidenceImages.length}
        </span>
        {!isFullscreen ? (
          <span className="hidden sm:inline">Click image to inspect</span>
        ) : (
          <span className="hidden sm:inline">
            Esc to close · ← → to navigate · + − to zoom
          </span>
        )}
      </div>

      {isFullscreen ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-4 top-4 z-10 size-9 shadow-sm"
          onClick={() => setFullscreen(false)}
          aria-label="Close full screen"
        >
          <X />
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-3 right-3 z-10 size-8 shadow-sm"
          onClick={openFullscreen}
          aria-label="Open image full screen"
        >
          <Maximize2 />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b pb-0">
          <div className="flex items-center justify-between gap-3 px-0 pb-3">
            <div>
              <CardTitle className="text-sm">Payment evidence</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Full preview in the card. Open the viewer for detailed inspection.
              </p>
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {currentIndex + 1} / {evidenceImages.length}
            </span>
          </div>
        </CardHeader>
        {imageStage(false)}
      </Card>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-black p-0 text-white shadow-none"
        >
          {imageStage(true)}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard() {
  return (
    <aside className="overflow-hidden rounded-lg border bg-background">
      <div className="space-y-5 p-5">
        <Badge
          variant="outline"
          className="h-6 rounded-md border-amber-500/20 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400"
        >
          <span className="mr-1.5 size-1.5 rounded-full bg-amber-500" />
          Pending review
        </Badge>

        <div className="text-3xl font-semibold tracking-tight tabular-nums">$8,120.50</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Processor fee</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">$183.63</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Net after fees</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">$7,936.87</div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Manual verification required</div>
              <div className="text-sm leading-5 text-muted-foreground">
                Confirm authorization before release. Capture is paused until the review outcome is logged.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-none border-r text-sm"
          onClick={() => navigator.clipboard?.writeText("txn_R8M42QH91L6C")}
        >
          <Copy />
          Copy ID
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-none text-sm"
        >
          <Download />
          Receipt
        </Button>
      </div>
    </aside>
  );
}

export function TransactionDetail() {
  return (
    <section className="min-h-full bg-background">
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
                <span className="font-mono text-xs text-muted-foreground">pay_ONfo13LR3OInWj5e1r6z4</span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Transaction txn_R8M42QH91L6C
                </h1>
                <Button variant="outline" size="icon-sm" aria-label="Edit transaction">
                  <Pencil />
                </Button>
              </div>

              <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
                Review payment evidence, processor routing, and audit changes before releasing the capture hold.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button className="h-9">
                <CheckCircle2 />
                Approve
              </Button>
              <Button variant="outline" className="h-9">
                <RefreshCcw />
                Refund
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="More transaction actions">
                <MoreVertical />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 xl:grid-cols-[minmax(0,1fr)_304px]">
        <main className="min-w-0 space-y-10">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
                This ACH debit is inside a manual review window because the customer exceeded the new-account velocity limit. Confirm the invoice, authorization file, and bank ownership before approval.
              </p>
            </div>
          </div>

          <section className="space-y-5">
            <SectionHeading>Transaction Details</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Transaction ID" value="txn_R8M42QH91L6C" mono />
              <Field label="Amount" value="$8,120.50" />
              <Field label="Customer" value="Helio Supply" />
              <Field label="Payment method" value="ACH debit" />
              <Field label="Processor" value="Adyen" />
              <Field label="Source" value="Hosted checkout" />
              <Field label="Currency" value="USD" />
              <Field label="Created" value="May 29, 2026, 08:56 IST" />
              <Field label="Settlement" value="Expected Jun 02, 2026" />
              <Field label="Ledger account" value="Operating balance" />
              <Field label="Descriptor" value="HELIO-SUPPLY-0429" />
              <Field label="Statement ID" value="STMT-8462-HS" />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>Supporting documents</SectionHeading>
            <div className="grid gap-3 lg:grid-cols-3">
              <DocumentCard name="bank-authorization.pdf" meta="Uploaded May 29, 2026 at 09:01" />
              <DocumentCard name="risk-review-note.txt" meta="Added by Priya Shah at 09:18" />
              <DocumentCard name="invoice-20486.pdf" meta="Generated from billing workspace" />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>Processor Context</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Merchant route" value="North America / ACH" />
              <Field label="Invoice" value="INV-20486" mono />
              <Field label="Customer email" value="billing@helio.supply" />
              <Field label="Capture mode" value="Automatic after bank confirmation" />
              <Field label="Verification" value="Micro-deposit fallback enabled" />
              <Field label="Location" value="Austin, TX" />
              <Field label="IP address" value="198.51.100.42" mono />
              <Field label="Webhook delivery" value="2 delivered, 1 retry scheduled" />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>Operational Notes</SectionHeading>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <ShieldCheck className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Risk posture</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Low dispute history, elevated transaction size.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <WalletCards className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Funds movement</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Debit is authorized but settlement has not started.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <MessageSquare className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Customer thread</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Billing contact confirmed the invoice by email.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>History</SectionHeading>
            <div>
              <TimelineItem
                date="May 29"
                time="09:22"
                title="Review window opened"
                actor="Risk engine"
                description="ACH velocity threshold requested a second approval before capture."
                active
              />
              <TimelineItem
                date="May 29"
                time="09:18"
                title="Internal note added"
                actor="Priya Shah"
                description="Finance confirmed the purchase order and matching invoice total."
              />
              <TimelineItem
                date="May 29"
                time="09:03"
                title="Bank account verified"
                actor="Adyen"
                description="Account ownership passed through processor verification."
              />
            </div>
          </section>

          <div className="pt-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/dashboard/deposits">
                <ArrowLeft />
                Back to deposits
              </a>
            </Button>
          </div>
        </main>

        <div className="min-w-0">
          <div className="sticky top-6 space-y-4">
            <EvidenceGallery />
            <SummaryCard />
            <Button variant="outline" className="mt-4 w-full">
              <Mail />
              Email customer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

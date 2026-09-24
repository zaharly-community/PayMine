import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Mail,
  Maximize2,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCcw,
  X,
} from "lucide-react";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type VoucherStatus = "Pending" | "Duplicated" | "Processing" | "Approved" | "Declined";

type VoucherMethod = {
  id: string;
  name: "Orange" | "Ooredoo" | "Tunisie Telecom";
  logo?: string;
};

type VoucherRow = {
  id: string;
  method: VoucherMethod;
  ending: string;
  status: VoucherStatus;
};

type PaymentAccountOption = {
  id: string;
  label: string;
  balance: number;
  currency: string;
};

const voucherRows: VoucherRow[] = [
  {
    id: "voucher-orange",
    method: {
      id: "orange",
      name: "Orange",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZinnmva8-lJ1z37ULNDrM8XNNp4GJt91xerwCjyJLPCv2Cn__dTiBxlw&s=10",
    },
    ending: "4123 4574 1000 2589",
    status: "Pending",
  },
  {
    id: "voucher-ooredoo",
    method: {
      id: "ooredoo",
      name: "Ooredoo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Ooredoo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
    ending: "5432 1187 9033 7214",
    status: "Processing",
  },
  {
    id: "voucher-tunisie-telecom",
    method: {
      id: "tunisie-telecom",
      name: "Tunisie Telecom",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcjAL9itCcYdAhLn5lm1jzsMtQMT75EzG3yMOCHB3MDw1vYaQ_yhivDm8&s=10",
    },
    ending: "6214 8831 4470 3926",
    status: "Approved",
  },
  {
    id: "voucher-orange-duplicate",
    method: {
      id: "orange-duplicate",
      name: "Orange",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZinnmva8-lJ1z37ULNDrM8XNNp4GJt91xerwCjyJLPCv2Cn__dTiBxlw&s=10",
    },
    ending: "4890 5501 7391 2048",
    status: "Duplicated",
  },
  {
    id: "voucher-ooredoo-declined",
    method: {
      id: "ooredoo-declined",
      name: "Ooredoo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Ooredoo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
    ending: "3987 2201 6114 5082",
    status: "Declined",
  },
];

const paymentAccounts: PaymentAccountOption[] = [
  { id: "ACC-001", label: "4123 8801 4290", balance: 18420, currency: "TND" },
  { id: "ACC-002", label: "5261 0934 7721", balance: 11875, currency: "TND" },
  { id: "ACC-003", label: "6418 5022 1106", balance: 8640, currency: "TND" },
];

const statusStyles: Record<VoucherStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  Duplicated: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  Processing: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  Declined: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

function VoucherStatusBadge({ status }: { status: VoucherStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-medium", statusStyles[status])}>
      <span className="mr-1.5 size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function VoucherMethodCell({ method }: { method: VoucherMethod }) {
  return (
    <div className="flex items-center gap-3">
      {method.id === "orange" || method.id === "orange-duplicate" ? (
        <span className="flex h-8 w-12 items-center justify-center rounded-md bg-background text-[11px] font-semibold shadow-[0_0_0_1px_var(--border)]">
          G Pay
        </span>
      ) : (
        <span className="flex h-8 w-12 items-center justify-center overflow-hidden rounded-md bg-background p-1 shadow-[0_0_0_1px_var(--border)]">
          <img src={method.logo} alt="" className="max-h-full max-w-full object-contain" />
        </span>
      )}
      <span className="text-sm font-medium">{method.name}</span>
    </div>
  );
}

function TimedAction({
  label,
  tone,
  onCommit,
  className,
  disabled = false,
}: {
  label: string;
  tone: string;
  onCommit: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const [arming, setArming] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [progress, setProgress] = useState(0);
  const onCommitRef = useRef(onCommit);

  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!arming) return;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, (elapsed / 5000) * 100);
      const nextSeconds = Math.max(0, Math.ceil((5000 - elapsed) / 1000));
      setProgress(nextProgress);
      setSeconds(nextSeconds);

      if (elapsed >= 5000) {
        window.clearInterval(timer);
        setArming(false);
        setProgress(0);
        onCommitRef.current();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [arming]);

  if (arming) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("relative h-8 min-w-[116px] overflow-hidden px-2 text-[11px]", className)}
        onClick={() => {
          setArming(false);
          setProgress(0);
          setSeconds(5);
        }}
      >
        <span
          className="absolute inset-y-0 left-0 bg-foreground/10 transition-[width]"
          style={{ width: progress + "%" }}
        />
        <span className="relative z-10 whitespace-nowrap">Undo · {seconds}s</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn("h-8 px-3 text-[11px]", tone, className)}
      onClick={() => setArming(true)}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}

function ProcessVoucherDialog({
  row,
  open,
  onOpenChange,
  onStatusChange,
}: {
  row: VoucherRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: VoucherStatus) => void;
}) {
  const [accountId, setAccountId] = useState(paymentAccounts[0].id);
  const [balanceInput, setBalanceInput] = useState("");
  const selectedAccount = paymentAccounts.find((account) => account.id === accountId) ?? paymentAccounts[0];

  const expectedBalance = selectedAccount.balance.toFixed(2);
  const balanceVerified = balanceInput.trim() === expectedBalance;

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setBalanceInput("");
      setAccountId(paymentAccounts[0].id);
    }
    onOpenChange(nextOpen);
  };

  const approveTarget: VoucherStatus = row.status === "Pending" || row.status === "Declined" ? "Processing" : "Approved";

  const commit = (status: VoucherStatus) => {
    if (!balanceVerified) return;
    onStatusChange(row.id, status);
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Process payment card</DialogTitle>
          <DialogDescription>
            Select the payment account that will receive the card load and verify its current balance before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Payment account</Label>
            <select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                setBalanceInput("");
              }}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              {paymentAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Current balance</p>
              <p className="mt-1 font-semibold tabular-nums">
                {selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Card</p>
              <p className="mt-1 font-semibold tabular-nums">{row.ending}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Enter current balance to verify</Label>
            <Input
              value={balanceInput}
              onChange={(event) => setBalanceInput(event.target.value)}
              placeholder={expectedBalance}
              inputMode="decimal"
              aria-invalid={balanceInput.length > 0 && !balanceVerified}
            />
            {balanceInput.length > 0 ? (
              <p className={cn("text-xs", balanceVerified ? "text-emerald-600" : "text-red-600")}>
                {balanceVerified ? "Balance verified." : "Balance does not match the selected account."}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
            Verification is required before any final status action is enabled.
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <TimedAction
            label="Request editing"
            tone="text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30"
            onCommit={() => commit("Pending")}
            className="min-w-[126px]"
            disabled={!balanceVerified}
          />
          <TimedAction
            label="Decline"
            tone="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            onCommit={() => commit("Declined")}
            className="min-w-[86px]"
            disabled={!balanceVerified}
          />
          <TimedAction
            label="Approve"
            tone="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
            onCommit={() => commit(approveTarget)}
            className="min-w-[86px]"
            disabled={!balanceVerified}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentMethodsTable() {
  const [rows, setRows] = useState(voucherRows);
  const [processRow, setProcessRow] = useState<VoucherRow | null>(null);

  const updateStatus = (id: string, status: VoucherStatus) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b bg-background text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Payment method</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Ending</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="w-[320px] px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                if (row.status === "Duplicated") {
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <VoucherMethodCell method={row.method} />
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{row.ending}</td>
                      <td className="px-4 py-3">
                        <VoucherStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" variant="outline" disabled className="h-8 px-3 text-[11px]">
                          Can't handle
                        </Button>
                      </td>
                    </tr>
                  );
                }

                if (row.status === "Approved") {
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <VoucherMethodCell method={row.method} />
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{row.ending}</td>
                      <td className="px-4 py-3">
                        <VoucherStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[11px] text-muted-foreground">—</span>
                      </td>
                    </tr>
                  );
                }

                if (row.status === "Pending") {
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <VoucherMethodCell method={row.method} />
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{row.ending}</td>
                      <td className="px-4 py-3">
                        <VoucherStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-[11px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30"
                            onClick={() => setProcessRow(row)}
                          >
                            Process
                          </Button>
                          <TimedAction
                            label="Decline"
                            tone="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            onCommit={() => updateStatus(row.id, "Declined")}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (row.status === "Processing") {
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <VoucherMethodCell method={row.method} />
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{row.ending}</td>
                      <td className="px-4 py-3">
                        <VoucherStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-[11px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30"
                            onClick={() => setProcessRow(row)}
                          >
                            Process
                          </Button>
                          <TimedAction
                            label="Decline"
                            tone="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            onCommit={() => updateStatus(row.id, "Declined")}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <VoucherMethodCell method={row.method} />
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{row.ending}</td>
                    <td className="px-4 py-3">
                      <VoucherStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-[11px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/30"
                        onClick={() => setProcessRow(row)}
                      >
                        Reprocess
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {processRow ? (
        <ProcessVoucherDialog
          row={processRow}
          open
          onOpenChange={(open) => !open && setProcessRow(null)}
          onStatusChange={(id, status) => {
            updateStatus(id, status);
            setProcessRow(null);
          }}
        />
      ) : null}
    </>
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
        <SummaryActionsCard />
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

function SummaryCard({ onReport }: { onReport: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t bg-background/95 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-(--sidebar-width)">
      <div className="flex min-h-[72px] w-full min-w-0 items-center gap-3 px-4 py-2.5 md:px-5 lg:px-6">
        <Badge
          variant="outline"
          className="h-6 shrink-0 rounded-md border-amber-500/20 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400"
        >
          <span className="mr-1.5 size-1.5 rounded-full bg-amber-500" />
          Pending review
        </Badge>

        <div className="shrink-0 text-2xl font-semibold tracking-tight tabular-nums">$8,120.50</div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Processor fee</div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums">$183.63</div>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Net after fees</div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums">$7,936.87</div>
          </div>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex xl:max-w-[34rem]">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Manual verification required</div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                Confirm authorization before release. Capture is paused until the review outcome is logged.
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 px-3"
              onClick={() => navigator.clipboard?.writeText("txn_R8M42QH91L6C")}
            >
              <Copy />
              Copy ID
            </Button>
            <Button type="button" variant="outline" className="h-9 shrink-0 px-3">
              <Download />
              Receipt
            </Button>
            <Button type="button" variant="destructive" className="h-9 shrink-0 px-3" onClick={onReport}>
              <Mail />
              Report customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryActionsCard() {
  return (
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
  );
}

function ReportCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [subject, setSubject] = useState("Suspicious activity");
  const [reason, setReason] = useState("");

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubject("Suspicious activity");
      setReason("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report customer</DialogTitle>
          <DialogDescription>
            Select a subject and provide the reason for reporting this customer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="report-subject">Subject</Label>
            <select
              id="report-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option>Suspicious activity</option>
              <option>Fraud</option>
              <option>Duplicate payment</option>
              <option>Abuse</option>
              <option>Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="report-reason">Reason</Label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Write the reason for this report..."
              rows={5}
              className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => close(false)}
          >
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type DepositDetailVariant = "wallet" | "voucher";

export function TransactionDetail({ variant }: { variant: DepositDetailVariant }) {
  const [reportOpen, setReportOpen] = useState(false);
  const isVoucher = variant === "voucher";
  const paymentMethod = isVoucher ? "Tunisie Telecom" : "Flouci";

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

            <div className="relative flex min-h-[110px] w-[220px] shrink-0 items-center justify-center self-stretch max-w-full">
              <div
                className="absolute top-0 h-[90px] w-[180px] rounded-full blur-3xl"
                style={{ background: "radial-gradient(rgba(59, 130, 246, 0.094) 0%, transparent 70%)" }}
              />
              <svg width="200" height="122" viewBox="0 0 180 110" className="h-auto w-[200px] overflow-visible max-w-full">
                <defs>
                  <linearGradient id="health-gauge-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <filter id="health-gauge-glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 20 95 A 70 70 0 0 1 160 95"
                  fill="none"
                  stroke="var(--color-muted, hsl(var(--muted)))"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.2"
                />
                <path
                  d="M 20 95 A 70 70 0 0 1 160 95"
                  fill="none"
                  stroke="url(#health-gauge-grad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="219.9114857512855"
                  filter="url(#health-gauge-glow)"
                  strokeDashoffset="48.3805268652828"
                />
                <text x="18" y="109" textAnchor="middle" className="fill-muted-foreground/40 text-[9px] tabular-nums">
                  0
                </text>
                <text x="90" y="19" textAnchor="middle" className="fill-muted-foreground/40 text-[9px] tabular-nums">
                  50
                </text>
                <text x="162" y="109" textAnchor="middle" className="fill-muted-foreground/40 text-[9px] tabular-nums">
                  100
                </text>
              </svg>
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-3xl font-bold tabular-nums tracking-tight">78</span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  AI Desicion
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Safe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 xl:grid-cols-[minmax(0,1fr)_304px]">
        <main className="min-w-0 space-y-10">
          <section className="space-y-5">
            <SectionHeading>Transaction Details</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Transaction ID" value="txn_R8M42QH91L6C" mono />
              <Field label="Amount" value="$8,120.50" />
              <Field label="Customer" value="Helio Supply" />
              <Field label="Payment method" value={paymentMethod} />
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

          {isVoucher ? (
            <section className="space-y-5">
              <SectionHeading>Payment methods</SectionHeading>
              <p className="text-xs text-muted-foreground">
                Voucher payment methods configured for this deposit.
              </p>
              <PaymentMethodsTable />
            </section>
          ) : null}

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

        <div className="min-w-0 self-start">
          <div className="sticky top-6 space-y-4">
            <EvidenceGallery />
            <Button variant="outline" className="mt-4 w-full">
              <Mail />
              Email customer
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setReportOpen(true)}
            >
              <AlertTriangle />
              Report customer
            </Button>
            <ReportCustomerDialog open={reportOpen} onOpenChange={setReportOpen} />
          </div>
        </div>
      </div>

      <SummaryCard onReport={() => setReportOpen(true)} />
    </section>
  );
}

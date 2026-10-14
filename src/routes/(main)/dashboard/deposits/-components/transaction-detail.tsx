import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
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
      <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-primary" />
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">{children}</h2>
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
    <div className="min-w-0 border-b border-border/60 py-3 pr-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={cn("mt-1.5 truncate text-sm font-medium leading-5 text-foreground", mono && "font-mono text-xs tracking-tight")}>
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
    <div className="grid grid-cols-[60px_16px_minmax(0,1fr)] gap-2 sm:grid-cols-[72px_20px_minmax(0,1fr)] sm:gap-3">
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

function SummaryCard() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [modificationOpen, setModificationOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [verificationConfirmed, setVerificationConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const handleVerificationConfirmed = () => {
    setApproveOpen(false);
    setVerificationConfirmed(true);
    setCountdown(5);
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t bg-background/95 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-(--sidebar-width)">
        <div className="flex min-h-[72px] w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 md:flex-nowrap md:px-5 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            <div className="shrink-0 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">$8,120.50</div>
            <div className="h-9 w-px shrink-0 bg-border" />
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 px-1">
                <div className="whitespace-nowrap text-[9px] text-muted-foreground sm:text-[11px]">Processor fee</div>
                <div className="mt-0.5 text-xs font-semibold tabular-nums sm:text-sm">$183.63</div>
              </div>
              <div className="h-7 w-px shrink-0 bg-border/70" />
              <div className="min-w-0 px-1">
                <div className="whitespace-nowrap text-[9px] text-muted-foreground sm:text-[11px]">Net after fees</div>
                <div className="mt-0.5 text-xs font-semibold tabular-nums sm:text-sm">$7,936.87</div>
              </div>
            </div>
          </div>

          <div className="ml-auto flex w-full shrink-0 items-center justify-end gap-1 border-t border-border/70 pt-2 md:w-auto md:border-0 md:pt-0 md:gap-1.5">
            <Button
              type="button"
              variant="outline"
              aria-label="Cancel payment"
              title="Cancel payment"
              className="h-8 shrink-0 px-2 sm:h-9 sm:px-3"
              onClick={() => setCancelOpen(true)}
              disabled={verificationConfirmed}
            >
              <X className="size-4" />
              <span className="hidden xl:inline">Cancel payment</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              aria-label="Request modification"
              title="Request modification"
              className="h-8 shrink-0 px-2 sm:h-9 sm:px-3"
              onClick={() => setModificationOpen(true)}
              disabled={verificationConfirmed}
            >
              <RefreshCcw className="size-4" />
              <span className="hidden xl:inline">Request modification</span>
            </Button>

            {verificationConfirmed ? (
              <Button
                type="button"
                variant="outline"
                aria-label="Approve verification"
                disabled={countdown > 0}
                className="h-8 min-w-[36px] shrink-0 px-2 sm:min-w-[116px] sm:px-3 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                <CheckCircle2 className="size-3.5" />
                <span className="hidden sm:inline">{"Approve" + (countdown > 0 ? " · " + countdown + "s" : "")}</span>
                <span className="sm:hidden">{countdown > 0 ? countdown + "s" : "Approve"}</span>
              </Button>
            ) : (
              <Button
                type="button"
                aria-label="Confirm verification"
                className="h-8 shrink-0 px-2 sm:h-9 sm:px-3"
                onClick={() => setApproveOpen(true)}
              >
                <CheckCircle2 className="size-4" />
                <span className="hidden xl:inline">Confirm verification</span>
                <span className="xl:hidden">Confirm</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CancelPaymentDialog open={cancelOpen} onOpenChange={setCancelOpen} />
      <RequestModificationDialog open={modificationOpen} onOpenChange={setModificationOpen} />
      <ApprovePaymentDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirmed={handleVerificationConfirmed}
      />
    </>
  );
}

function CancelPaymentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [subject, setSubject] = useState("Payment proof issue");
  const [reason, setReason] = useState("");

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubject("Payment proof issue");
      setReason("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancel payment</DialogTitle>
          <DialogDescription>
            Select the cancellation subject and provide the reason that will be recorded for this deposit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cancel-payment-subject">Subject</Label>
            <select
              id="cancel-payment-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option>Payment proof issue</option>
              <option>Duplicate payment</option>
              <option>Invalid account details</option>
              <option>Fraud / suspicious activity</option>
              <option>Player requested cancellation</option>
              <option>Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cancel-payment-reason">Reason</Label>
            <textarea
              id="cancel-payment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Write the reason for cancelling this payment..."
              rows={5}
              className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Keep payment
          </Button>
          <Button type="button" variant="destructive" disabled={!reason.trim()} onClick={() => close(false)}>
            <X />
            Confirm cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestModificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fields = [
    {
      id: "Payment proof",
      description: "Replace or correct the payment evidence.",
      defaultValue: "payment-proof-verified",
      placeholder: "Enter proof reference",
    },
    {
      id: "Amount",
      description: "Correct the deposit amount.",
      defaultValue: "8120.50",
      placeholder: "0.00",
    },
    {
      id: "Payment method",
      description: "Use the correct wallet or voucher method.",
      defaultValue: "Flouci",
      placeholder: "Select payment method",
    },
    {
      id: "Account number",
      description: "Correct the receiving account number.",
      defaultValue: "4123 8801 4290",
      placeholder: "Account number",
    },
    {
      id: "Player identifier",
      description: "Correct the identifier linked to the deposit.",
      defaultValue: "helio-supply-0429",
      placeholder: "Player identifier",
    },
    {
      id: "Other",
      description: "Handle another correction not listed above.",
      defaultValue: "",
      placeholder: "Describe the correction",
    },
  ] as const;

  type FieldId = (typeof fields)[number]["id"];
  type FieldAction = "edit" | "request";

  const [selectedFields, setSelectedFields] = useState<FieldId[]>(["Payment proof"]);
  const [fieldActions, setFieldActions] = useState<Record<string, FieldAction>>({
    "Payment proof": "request",
  });
  const [directValues, setDirectValues] = useState<Record<string, string>>({
    "Payment proof": "payment-proof-verified",
    Amount: "8120.50",
    "Payment method": "Flouci",
    "Account number": "4123 8801 4290",
    "Player identifier": "helio-supply-0429",
    Other: "",
  });
  const [playerNote, setPlayerNote] = useState("");

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFields(["Payment proof"]);
      setFieldActions({ "Payment proof": "request" });
      setDirectValues({
        "Payment proof": "payment-proof-verified",
        Amount: "8120.50",
        "Payment method": "Flouci",
        "Account number": "4123 8801 4290",
        "Player identifier": "helio-supply-0429",
        Other: "",
      });
      setPlayerNote("");
    }
    onOpenChange(nextOpen);
  };

  const toggleField = (fieldId: FieldId) => {
    setSelectedFields((current) =>
      current.includes(fieldId)
        ? current.filter((id) => id !== fieldId)
        : [...current, fieldId],
    );
  };

  const setAction = (fieldId: FieldId, action: FieldAction) => {
    setFieldActions((current) => ({ ...current, [fieldId]: action }));
  };

  const hasDirectEdits = selectedFields.some((fieldId) => fieldActions[fieldId] === "edit");
  const hasPlayerRequests = selectedFields.some((fieldId) => fieldActions[fieldId] === "request");
  const canSubmit = selectedFields.length > 0 && (!hasPlayerRequests || playerNote.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modify deposit</DialogTitle>
          <DialogDescription>
            Select multiple fields, then decide whether to edit each one directly or ask the player to correct it. Both actions can be done together.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Fields to address</Label>
              <span className="text-[11px] text-muted-foreground">
                {selectedFields.length} selected
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => {
                const selected = selectedFields.includes(field.id);
                return (
                  <button
                    key={field.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleField(field.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background",
                      )}
                    >
                      {selected ? <CheckCircle2 className="size-3.5" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{field.id}</span>
                      <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                        {field.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedFields.length > 0 ? (
            <div className="grid gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action per field
              </div>

              {selectedFields.map((fieldId) => {
                const field = fields.find((item) => item.id === fieldId);
                if (!field) return null;
                const action = fieldActions[fieldId] ?? "request";

                return (
                  <div key={fieldId} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{field.id}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{field.description}</div>
                      </div>

                      <div className="inline-flex rounded-md border bg-muted/30 p-1">
                        <button
                          type="button"
                          onClick={() => setAction(fieldId, "edit")}
                          className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                            action === "edit"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Pencil className="size-3.5" />
                            Edit now
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAction(fieldId, "request")}
                          className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                            action === "request"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <RefreshCcw className="size-3.5" />
                            Ask player
                          </span>
                        </button>
                      </div>
                    </div>

                    {action === "edit" ? (
                      <div className="mt-3 grid gap-2">
                        <Label htmlFor={"direct-edit-" + field.id.replace(/\s+/g, "-").toLowerCase()}>
                          New value
                        </Label>
                        {field.id === "Payment method" ? (
                          <select
                            id={"direct-edit-" + field.id.replace(/\s+/g, "-").toLowerCase()}
                            value={directValues[fieldId] ?? field.defaultValue}
                            onChange={(event) =>
                              setDirectValues((current) => ({
                                ...current,
                                [fieldId]: event.target.value,
                              }))
                            }
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                          >
                            <option>Flouci</option>
                            <option>D17</option>
                            <option>Kashy</option>
                            <option>Tunisie Telecom</option>
                            <option>Orange</option>
                            <option>Ooredoo</option>
                          </select>
                        ) : field.id === "Other" ? (
                          <textarea
                            id={"direct-edit-" + field.id.replace(/\s+/g, "-").toLowerCase()}
                            value={directValues[fieldId] ?? ""}
                            onChange={(event) =>
                              setDirectValues((current) => ({
                                ...current,
                                [fieldId]: event.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                          />
                        ) : (
                          <Input
                            id={"direct-edit-" + field.id.replace(/\s+/g, "-").toLowerCase()}
                            type={field.id === "Amount" ? "number" : "text"}
                            min={field.id === "Amount" ? "0.01" : undefined}
                            step={field.id === "Amount" ? "0.01" : undefined}
                            value={directValues[fieldId] ?? field.defaultValue}
                            onChange={(event) =>
                              setDirectValues((current) => ({
                                ...current,
                                [fieldId]: event.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        This field will be included in the player modification request.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="deposit-player-note">
              {hasDirectEdits && hasPlayerRequests
                ? "Note for player · changes made + changes requested"
                : hasDirectEdits
                  ? "Note for player · changes made"
                  : "Note for player"}
            </Label>
            <textarea
              id="deposit-player-note"
              value={playerNote}
              onChange={(event) => setPlayerNote(event.target.value)}
              placeholder={
                hasDirectEdits && hasPlayerRequests
                  ? "Tell the player what you changed directly and what still needs to be corrected..."
                  : hasDirectEdits
                    ? "Explain the changes you made to the deposit..."
                    : "Explain exactly what the player needs to update..."
              }
              rows={5}
              className="w-full resize-y rounded-md border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <p className="text-[11px] text-muted-foreground">
              This note will be visible to the player.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-[11px] leading-4 text-muted-foreground">
            {hasDirectEdits && hasPlayerRequests
              ? "This action will save your direct edits and send the remaining corrections to the player in one step."
              : hasDirectEdits
                ? "This action will save the selected direct edits and record the note for the player."
                : "This action will send the selected correction request and the note to the player."}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={() => close(false)}>
            {hasDirectEdits && hasPlayerRequests ? <Pencil /> : hasDirectEdits ? <Pencil /> : <RefreshCcw />}
            {hasDirectEdits && hasPlayerRequests
              ? "Save edits & request changes"
              : hasDirectEdits
                ? "Save direct edits"
                : "Send modification request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApprovePaymentDialog({
  open,
  onOpenChange,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
}) {
  const [receivedAmount, setReceivedAmount] = useState("");
  const [feeResponsibility, setFeeResponsibility] = useState<"player" | "platform">("player");
  const numericAmount = Number(receivedAmount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const close = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReceivedAmount("");
      setFeeResponsibility("player");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm verification</DialogTitle>
          <DialogDescription>
            Enter the exact amount actually received. Then choose who bears the payment fees before confirming the deposit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deposit-received-amount">Exact amount received</Label>
            <Input
              id="deposit-received-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={receivedAmount}
              onChange={(event) => setReceivedAmount(event.target.value)}
              placeholder="0.00"
            />
            <p className="text-[11px] text-muted-foreground">
              Use the amount verified from the payment evidence, not the amount entered by the player.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deposit-fee-responsibility">Fees paid by</Label>
            <select
              id="deposit-fee-responsibility"
              value={feeResponsibility}
              onChange={(event) => setFeeResponsibility(event.target.value as "player" | "platform")}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="player">Player pays fees</option>
              <option value="platform">Platform absorbs fees</option>
            </select>
          </div>

          <div className="rounded-lg border bg-muted/30 px-3 py-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Verified received amount</span>
              <strong className="tabular-nums">
                {validAmount ? "$" + numericAmount.toFixed(2) : "—"}
              </strong>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Fee responsibility</span>
              <strong>{feeResponsibility === "player" ? "Player" : "Platform"}</strong>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!validAmount}
            onClick={() => {
              close(false);
              onConfirmed();
            }}
          >
            <CheckCircle2 />
            Confirm verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <section className="min-h-full bg-background pb-32">
      <header className="border-b px-4 py-6 sm:px-6 md:py-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-6 rounded-md border-amber-500/20 bg-amber-500/10 px-2 text-xs font-medium text-amber-700 dark:text-amber-400"
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-amber-500" />
                  Pending
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  May 29, 2026, 08:56
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Deposit DEP-02026010
                </h1>
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Review the submitted evidence and transaction history before confirming this deposit.
              </p>
            </div>

            <div className="flex w-full max-w-[280px] shrink-0 items-center gap-4 border-t pt-4 lg:w-auto lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="relative grid size-[68px] shrink-0 place-items-center">
                <svg viewBox="0 0 68 68" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
                  <circle cx="34" cy="34" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/70" />
                  <circle cx="34" cy="34" r="28" fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" strokeDasharray="175.93" strokeDashoffset="38.7" />
                </svg>
                <span className="text-2xl font-semibold tabular-nums tracking-tight">78</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">AI assessment</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm font-semibold">Safe decision</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Safe
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Risk score · 78/100</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-7 sm:px-6 lg:py-9 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
        <main className="min-w-0 space-y-9">
          <section className="space-y-4">
            <SectionHeading>Deposit Details</SectionHeading>
            <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Player Identifier" value="helio-supply-0429" mono />
              <Field label="Amount" value="$8,120.50" />
              <Field label="Fees" value="$183.63" />
              <Field label="Payment Method" value={paymentMethod} />
              <Field label="Account ID" value="ACC-001" mono />
              <Field label="Account Owner" value="Yassine Trabelsi" />
              <Field label="Account Number" value="4123 8801 4290" mono />
              <Field label="Transaction ID" value="txn_R8M42QH91L6C" mono />
            </div>
          </section>

          {isVoucher ? (
            <section className="space-y-4">
              <SectionHeading>Payment methods</SectionHeading>
              <p className="text-xs text-muted-foreground">
                Voucher payment methods configured for this deposit.
              </p>
              <PaymentMethodsTable />
            </section>
          ) : null}

          <section className="space-y-4">
            <SectionHeading>History</SectionHeading>
            <div className="mt-1 border-t border-border/60 pt-5">
              <TimelineItem
                date="May 29"
                time="08:56"
                title="Deposit request created"
                actor="Helio Supply"
                description="The deposit request was registered with the submitted payment details."
              />
              <TimelineItem
                date="May 29"
                time="09:03"
                title="Deposit request reserved"
                actor="Yassine Trabelsi"
                description="The request was reserved by the assigned Supervisor for processing."
              />
              <TimelineItem
                date="May 29"
                time="09:18"
                title="Payment account verified"
                actor={paymentMethod}
                description="The payment account details passed the payment-method verification step."
              />
              <TimelineItem
                date="May 29"
                time="09:22"
                title="Deposit awaiting confirmation"
                actor="Finance"
                description="The deposit is at the current stage and remains pending final confirmation."
                active
              />
            </div>
          </section>

        </main>

        <div className="min-w-0 self-start">
          <div className="space-y-4 xl:sticky xl:top-6">
            <EvidenceGallery />
            <Button
              type="button"
              variant="outline"
              className="w-full border-destructive/25 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setReportOpen(true)}
            >
              <AlertTriangle />
              Report customer
            </Button>
            <ReportCustomerDialog open={reportOpen} onOpenChange={setReportOpen} />
          </div>
        </div>
      </div>

      <SummaryCard />
    </section>
  );
}

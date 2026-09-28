import * as React from "react";

import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";

import {
  getPaymentLinkStatus,
  nextPaymentLinkId,
  readPaymentLinks,
  writePaymentLinks,
  type PaymentLink,
} from "@/lib/payment-links";

type PaymentLinkMethod = {
  name: string;
  currency: string;
  logoImage: string;
};

const durationOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
  { value: 4320, label: "3 days" },
  { value: 10080, label: "7 days" },
];

export function PaymentLinkTools({
  methods,
}: {
  methods: readonly PaymentLinkMethod[];
}) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [links, setLinks] = React.useState<PaymentLink[]>(() => readPaymentLinks());

  const refresh = React.useCallback(() => {
    setLinks(readPaymentLinks());
  }, []);

  React.useEffect(() => {
    refresh();

    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const createLink = (input: {
    playerId: string;
    amount: number;
    method: PaymentLinkMethod;
    account: string;
    durationMinutes: number;
  }) => {
    const now = new Date();
    const id = nextPaymentLinkId(links);
    const next: PaymentLink = {
      id,
      playerId: input.playerId.trim(),
      amount: input.amount,
      currency: input.method.currency,
      paymentMethod: input.method.name,
      paymentMethodImage: input.method.logoImage,
      account: input.account.trim(),
      durationMinutes: input.durationMinutes,
      createdAt: now.toISOString(),
      expiresAt: new Date(
        now.getTime() + input.durationMinutes * 60_000,
      ).toISOString(),
      status: "active",
    };

    const nextLinks = [...links, next];
    writePaymentLinks(nextLinks);
    setLinks(nextLinks);
    setCreateOpen(false);
    setArchiveOpen(false);

    return next;
  };

  const toggleArchive = (id: number) => {
    const next = links.map((link) =>
      link.id !== id
        ? link
        : link.status === "archived"
          ? { ...link, status: "active" as const, archivedAt: undefined }
          : { ...link, status: "archived" as const, archivedAt: new Date().toISOString() },
    );
    writePaymentLinks(next);
    setLinks(next);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
          <LinkIcon />
          Payment Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Open payment link archive"
          title="Payment link archive"
          onClick={() => setArchiveOpen(true)}
        >
          <Archive />
        </Button>
      </div>

      <CreatePaymentLinkDialog
        open={createOpen}
        methods={methods}
        onOpenChange={setCreateOpen}
        onCreate={createLink}
      />

      <PaymentLinkArchiveDialog
        open={archiveOpen}
        links={links}
        onOpenChange={setArchiveOpen}
        onToggleArchive={toggleArchive}
      />
    </>
  );
}

function CreatePaymentLinkDialog({
  open,
  methods,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  methods: readonly PaymentLinkMethod[];
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    playerId: string;
    amount: number;
    method: PaymentLinkMethod;
    account: string;
    durationMinutes: number;
  }) => PaymentLink;
}) {
  const [playerId, setPlayerId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [methodName, setMethodName] = React.useState(methods[0]?.name ?? "");
  const [account, setAccount] = React.useState("");
  const [duration, setDuration] = React.useState("60");
  const [error, setError] = React.useState("");

  const reset = () => {
    setPlayerId("");
    setAmount("");
    setMethodName(methods[0]?.name ?? "");
    setAccount("");
    setDuration("60");
    setError("");
  };

  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const player = playerId.trim();
    const numericAmount = Number(amount);
    const selectedMethod = methods.find((method) => method.name === methodName);
    const durationMinutes = Number(duration);

    if (!player) {
      setError("Player ID is required.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!selectedMethod) {
      setError("Select a payment method.");
      return;
    }

    if (!account.trim()) {
      setError("Account is required.");
      return;
    }

    if (!durationOptions.some((item) => item.value === durationMinutes)) {
      setError("Select a valid link duration.");
      return;
    }

    onCreate({
      playerId: player,
      amount: numericAmount,
      method: selectedMethod,
      account,
      durationMinutes,
    });

    reset();
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
          <DialogDescription>
            Generate a unique payment URL for one player, amount, payment method, and account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Player ID</label>
              <Input
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                placeholder="Enter player ID"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Amount</label>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Payment Method</label>
            <Select value={methodName} onValueChange={setMethodName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method.name} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Account</label>
            <Input
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="e.g. 22 345 678"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Valid for</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <LinkIcon />
              Generate link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentLinkArchiveDialog({
  open,
  links,
  onOpenChange,
  onToggleArchive,
}: {
  open: boolean;
  links: PaymentLink[];
  onOpenChange: (open: boolean) => void;
  onToggleArchive: (id: number) => void;
}) {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const getUrl = (id: number) =>
    typeof window === "undefined"
      ? "/portal/LinkID=" + id
      : window.location.origin + "/portal/LinkID=" + id;

  const copyLink = async (id: number) => {
    await navigator.clipboard?.writeText(getUrl(id));
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1200);
  };

  const sorted = [...links].sort((a, b) => b.id - a.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Link Archive</DialogTitle>
          <DialogDescription>
            Monitor generated links, expiration, usage, and archived links.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
          {sorted.length ? (
            sorted.map((link) => {
              const status = getPaymentLinkStatus(link);
              const url = getUrl(link.id);

              return (
                <div
                  key={link.id}
                  className={cn(
                    "rounded-xl border px-3 py-3",
                    status === "active"
                      ? "border-emerald-400/20 bg-emerald-400/5"
                      : status === "used"
                        ? "border-blue-400/20 bg-blue-400/5"
                        : status === "expired"
                          ? "border-amber-400/20 bg-amber-400/5"
                          : "border-slate-700 bg-slate-800/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-300">
                      <LinkIcon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs font-semibold text-white">
                          LinkID={link.id}
                        </p>
                        <PaymentLinkStatusBadge status={status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-300">
                        {link.playerId} · {link.amount.toFixed(2)} {link.currency} · {link.paymentMethod}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-slate-500">{url}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Copy payment link"
                        aria-label="Copy payment link"
                        onClick={() => void copyLink(link.id)}
                      >
                        {copiedId === link.id ? <CheckCircle2 /> : <Copy />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Open payment link"
                        aria-label="Open payment link"
                        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                        disabled={status === "archived"}
                      >
                        <ExternalLink />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title={status === "archived" ? "Restore link" : "Archive link"}
                        aria-label={status === "archived" ? "Restore link" : "Archive link"}
                        onClick={() => onToggleArchive(link.id)}
                      >
                        {status === "archived" ? <ArchiveRestore /> : <Archive />}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      Expires {formatDate(link.expiresAt)}
                    </span>
                    <span>Account · {link.account}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center">
              <LinkIcon className="mx-auto size-5 text-slate-500" />
              <p className="mt-2 text-sm font-medium text-slate-300">No payment links yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Generated links will appear here with their current status.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentLinkStatusBadge({ status }: { status: ReturnType<typeof getPaymentLinkStatus> }) {
  const config = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    },
    used: {
      label: "Used",
      icon: CheckCircle2,
      className: "border-blue-400/20 bg-blue-400/10 text-blue-200",
    },
    expired: {
      label: "Expired",
      icon: XCircle,
      className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    },
    archived: {
      label: "Archived",
      icon: Archive,
      className: "border-slate-600 bg-slate-800 text-slate-400",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", config.className)}>
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

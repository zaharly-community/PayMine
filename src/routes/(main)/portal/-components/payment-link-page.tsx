import * as React from "react";

import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Link as LinkIcon,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import {
  getPaymentLinkStatus,
  readPaymentLinkDeposits,
  readPaymentLinks,
  writePaymentLinkDeposits,
  writePaymentLinks,
  type PaymentLink,
} from "@/lib/payment-links";

export function PaymentLinkPage({ linkId }: { linkId: string }) {
  const [link, setLink] = React.useState<PaymentLink | null>(null);
  const [playerId, setPlayerId] = React.useState("");
  const [error, setError] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const id = Number(linkId);
    const found =
      Number.isFinite(id) && id > 0
        ? readPaymentLinks().find((item) => Number(item.id) === id) ?? null
        : null;

    setLink(found);
    setPlayerId(found?.playerId ?? "");
  }, [linkId]);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!link) {
    return (
      <PaymentLinkShell>
        <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-5 text-center">
          <XCircle className="mx-auto size-8 text-red-300" />
          <h1 className="mt-3 text-base font-semibold text-white">Payment link not found</h1>
          <p className="mt-1 text-xs text-slate-500">
            This payment link does not exist or is no longer available.
          </p>
        </div>
      </PaymentLinkShell>
    );
  }

  const status = getPaymentLinkStatus(link);
  const remainingMs = Math.max(0, new Date(link.expiresAt).getTime() - now);
  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  const canComplete = status === "active";

  const completePayment = () => {
    if (status !== "active") {
      setError(
        status === "expired"
          ? "This payment link has expired."
          : status === "used"
            ? "This payment link has already been used."
            : "This payment link is archived.",
      );
      return;
    }

    if (playerId.trim() !== link.playerId.trim()) {
      setError("The Player ID does not match the player assigned to this payment link.");
      return;
    }

    const createdAt = new Date().toISOString();
    const depositId = "DEP-LINK-" + String(link.id).padStart(4, "0");
    const existingDeposits = readPaymentLinkDeposits();

    const row = {
      id: depositId,
      name: link.playerId,
      email: "—",
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(createdAt)).replace(",", ""),
      paymentMethod: link.paymentMethod,
      paymentMethodImage: link.paymentMethodImage,
      verificationStatus: "Pending",
      amount: link.amount,
      feePercent: 0,
      feeAmount: 0,
      depositStatus: "Pending",
      processedBy: {
        name: "Payment Link",
        image: "",
      },
      indicatorStatus: "Pending",
    };

    if (!existingDeposits.some((item) => item.id === depositId)) {
      writePaymentLinkDeposits([row, ...existingDeposits]);
    }

    const updatedLinks = readPaymentLinks().map((item) =>
      item.id === link.id
        ? { ...item, status: "used" as const, usedAt: createdAt }
        : item,
    );

    writePaymentLinks(updatedLinks);
    setLink({ ...link, status: "used", usedAt: createdAt });
    setError("");
  };

  if (status === "used") {
    return (
      <PaymentLinkShell>
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5 text-center">
          <CheckCircle2 className="mx-auto size-9 text-blue-300" />
          <h1 className="mt-3 text-base font-semibold text-white">Payment received</h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            This payment link has already been used and the deposit request has been created.
          </p>
          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-left">
            <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Deposit</p>
            <p className="mt-1 font-mono text-xs text-slate-200">
              DEP-LINK-{String(link.id).padStart(4, "0")}
            </p>
          </div>
        </div>
      </PaymentLinkShell>
    );
  }

  return (
    <PaymentLinkShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-300">
            <LinkIcon className="size-4" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Payment Link</p>
            <p className="font-mono text-xs font-semibold text-white">LinkID={link.id}</p>
          </div>
        </div>

        <PaymentLinkStatus status={status} />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/80 shadow-2xl">
        <div className="border-b border-slate-700/70 bg-slate-800/40 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <CircleDollarSign className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400">Amount to deposit</p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight text-white">
                {link.amount.toFixed(2)} <span className="text-sm text-slate-400">{link.currency}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Expires in</p>
              <p className={cn(
                "mt-0.5 text-sm font-semibold tabular-nums",
                remainingMinutes <= 5 ? "text-red-300" : "text-emerald-300",
              )}>
                {formatRemaining(remainingMs)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-700/60 sm:grid-cols-2">
          <InfoCell icon={UserRound} label="Player ID" value={link.playerId} />
          <InfoCell icon={WalletCards} label="Payment Method" value={link.paymentMethod} />
          <InfoCell icon={ShieldCheck} label="Account" value={link.account} />
          <InfoCell icon={CalendarClock} label="Valid until" value={formatDate(link.expiresAt)} />
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-slate-400" />
          <p className="text-sm font-medium text-white">Confirm player</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Enter the Player ID assigned to this payment link before creating the deposit.
        </p>

        <div className="mt-3">
          <Input
            value={playerId}
            onChange={(event) => {
              setPlayerId(event.target.value);
              setError("");
            }}
            placeholder="Enter Player ID"
            className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
            disabled={!canComplete}
          />
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={completePayment}
          disabled={!canComplete}
          className="mt-4 h-11 w-full bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
        >
          <CircleDollarSign className="size-4" />
          Complete payment
        </Button>
      </section>

      {!canComplete ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-[10px] text-amber-200">
          <Clock3 className="size-3.5 shrink-0" />
          This link is {status === "expired" ? "expired" : "archived"} and cannot create a deposit.
        </div>
      ) : null}

      <p className="mt-3 text-center text-[10px] text-slate-600">
        Secure payment session · LinkID={link.id}
      </p>
    </PaymentLinkShell>
  );
}

function PaymentLinkShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col justify-center">
        {children}
      </div>
    </main>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-slate-900/90 px-4 py-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-400">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function PaymentLinkStatus({
  status,
}: {
  status: ReturnType<typeof getPaymentLinkStatus>;
}) {
  const config = {
    active: {
      label: "Active",
      className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      icon: CheckCircle2,
    },
    used: {
      label: "Used",
      className: "border-blue-400/20 bg-blue-400/10 text-blue-200",
      icon: CheckCircle2,
    },
    expired: {
      label: "Expired",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
      icon: XCircle,
    },
    archived: {
      label: "Archived",
      className: "border-slate-600 bg-slate-800 text-slate-400",
      icon: XCircle,
    },
  }[status];

  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide",
      config.className,
    )}>
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function formatRemaining(milliseconds: number) {
  if (milliseconds <= 0) return "00:00";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
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

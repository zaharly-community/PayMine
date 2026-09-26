import * as React from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  FileImage,
  Info,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type PaymentMethod = {
  id: string;
  name: string;
  min: number;
  max: number;
  currency: string;
  logoUrl?: string;
  logoClass: string;
  note: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "flouci",
    name: "Flouci",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl:
      "https://play-lh.googleusercontent.com/7mMIDBQ-DsWB5GZluLfTwMXROjPTiJDS1LyQDPKRS8G20dW3LD8GGTU68FZ1hhbwM7-5jqe5QNMiDjQrIoDV",
    logoClass: "bg-white",
    note: "Complete the payment using your Flouci account. The deposit is credited after payment confirmation.",
  },
  {
    id: "d17",
    name: "D17",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl:
      "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY",
    logoClass: "bg-white",
    note: "Complete the payment from the D17 application and keep the transaction reference until confirmation.",
  },
  {
    id: "kashy",
    name: "Kashy",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl:
      "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
    logoClass: "bg-white",
    note: "Complete the payment using Kashy. Your deposit is credited after the payment is verified.",
  },
  {
    id: "e-dinar",
    name: "E-Dinar",
    min: 1,
    max: 10000,
    currency: "TND",
    logoClass: "bg-yellow-400/15 text-yellow-300",
    note: "Complete the payment with your E-Dinar account or card and keep the payment reference.",
  },
  {
    id: "ooredoo",
    name: "Ooredoo",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl: "https://cdn.primini.tn/54b40833-66ec-4c99-ac7d-d38e0ca34f19.jpg",
    logoClass: "bg-white",
    note: "Complete the payment through your Ooredoo payment channel. The deposit is credited after confirmation.",
  },
  {
    id: "orange",
    name: "Orange",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl: "https://pbs.twimg.com/media/ETlLS_IXQAAZybC.jpg",
    logoClass: "bg-orange-500/15 text-orange-300",
    note: "Complete the payment through your Orange payment channel and keep the transaction reference.",
  },
  {
    id: "tunisie-telecom",
    name: "Tunisie Telecom",
    min: 1,
    max: 10000,
    currency: "TND",
    logoUrl: "https://ik.imagekit.io/tp/20220202-tunisie-telecom-logo.png",
    logoClass: "bg-white",
    note: "Complete the payment using the Tunisie Telecom channel. Your deposit is credited after confirmation.",
  },
];

function PaymentMethodMark({ method }: { method: PaymentMethod }) {
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center overflow-hidden rounded-full border border-[#343536] text-[9px] font-semibold tracking-tight",
        method.logoClass,
      )}
    >
      {method.logoUrl ? (
        <img
          src={method.logoUrl}
          alt=""
          className="size-full object-contain p-1"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="px-0.5 text-center leading-tight">e-Dinar</span>
      )}
    </span>
  );
}

function PaymentMethodSelector({
  method,
  open,
  onToggle,
  onSelect,
}: {
  method: PaymentMethod;
  open: boolean;
  onToggle: () => void;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {paymentMethods.map((item) => {
          const selected = item.id === method.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "group flex min-w-[48px] shrink-0 flex-col items-center gap-1 rounded-[5px] border border-[#343536] px-1.5 py-1.5 transition-colors sm:min-w-[54px]",
                selected
                  ? "border-[#4b4c4d] bg-[#242526]"
                  : "border-[#343536] bg-[#1d1e1f] hover:border-[#4b4c4d] hover:bg-[#242526]",
              )}
              aria-pressed={selected}
            >
              <PaymentMethodMark method={item} />
              <span className="max-w-full truncate text-[8px] font-medium text-[#ededee]">
                {item.name}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Show all payment methods"
          className="flex min-w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-slate-900/60 px-2 text-slate-400 hover:bg-slate-800/60"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {paymentMethods.map((item) => (
              <button
                key={item.id + "-menu"}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onToggle();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  item.id === method.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/70",
                )}
              >
                <PaymentMethodMark method={item} />
                <span className="min-w-0 truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


function FieldLabel({
  children,
  required = true,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-slate-200">
      {children}
      {required ? <span className="ml-1 text-slate-500">*</span> : null}
    </label>
  );
}

const flouciRecipientNumbers = ["22 345 678", "53 781 249", "29 614 832"];

function FlouciSteps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Deposit details", "Make the transfer", "Waiting"];

  return (
    <div className="mb-5">
      <div className="flex items-start">
        {labels.map((label, index) => {
          const itemStep = index + 1;
          const active = itemStep <= step;

          return (
            <React.Fragment key={label}>
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                    active
                      ? "border-[#109121] bg-[#109121] text-white"
                      : "border-[#343536] bg-[#1d1e1f] text-[#8c8c8d]",
                  )}
                >
                  {itemStep < step ? <Check className="size-4" /> : itemStep}
                </div>
                <span
                  className={cn(
                    "mt-2 hidden max-w-[110px] text-[10px] leading-tight sm:block",
                    active ? "text-[#ededee]" : "text-[#8c8c8d]",
                  )}
                >
                  {label}
                </span>
              </div>

              {index < labels.length - 1 ? (
                <div
                  className={cn(
                    "mt-3.5 h-px flex-1",
                    index + 1 < step ? "bg-[#109121]" : "bg-[#343536]",
                  )}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function FlouciStepOne({
  playerId,
  setPlayerId,
  amount,
  setAmount,
  error,
  onContinue,
}: {
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const presets = [20, 50, 100, 200, 500, 1000];

  return (
    <section className="rounded-[7px] border border-[#2f3031] bg-[#1d1e1f] p-4">
      <div className="mb-5">
        <p className="text-base font-semibold text-white">Flouci deposit</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Enter your player ID and choose the amount you want to deposit.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel>Player ID</FieldLabel>
          <Input
            value={playerId}
            onChange={(event) => setPlayerId(event.target.value)}
            placeholder="Enter your player ID"
            title="Player ID"
            autoComplete="off"
            className="h-12 border-[#343536] bg-[#343536] text-white placeholder:text-[#8c8c8d] shadow-none focus-visible:border-[#4b4c4d] focus-visible:ring-0"
          />
        </div>

        <div>
          <FieldLabel>Deposit amount</FieldLabel>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter deposit amount"
            title="Deposit amount"
            className="h-12 border-[#343536] bg-[#343536] text-white placeholder:text-[#8c8c8d] shadow-none focus-visible:border-[#4b4c4d] focus-visible:ring-0"
          />

          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                title="Select deposit amount"
                className={cn(
                  "h-10 rounded-[5px] border px-2.5 text-xs font-medium tabular-nums transition-colors",
                  Number(amount) === preset
                    ? "border-[#109121] bg-[#109121]/10 text-[#79d383]"
                    : "border-[#343536] bg-[#343536] text-[#d2d2d3] hover:border-[#4b4c4d] hover:bg-[#3a3b3c]",
                )}
              >
                {preset} TND
              </button>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-slate-500">Minimum 1 TND · Maximum 10,000 TND</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-[5px] bg-[#109121] text-sm font-semibold text-white hover:bg-[#0c7f1c]"
        >
          Continue to payment
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

function FlouciStepTwo({
  playerId,
  amount,
  recipientNumber,
  secondsLeft,
  changeRequested,
  transactionId,
  setTransactionId,
  proofFile,
  setProofFile,
  error,
  onRequestChange,
  onConfirm,
}: {
  playerId: string;
  amount: string;
  recipientNumber: string;
  secondsLeft: number;
  changeRequested: boolean;
  transactionId: string;
  setTransactionId: React.Dispatch<React.SetStateAction<string>>;
  proofFile: File | null;
  setProofFile: React.Dispatch<React.SetStateAction<File | null>>;
  error: string;
  onRequestChange: () => void;
  onConfirm: () => void;
}) {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(recipientNumber.replace(/\s/g, ""));
    } catch {
      // Clipboard access may be blocked by the browser.
    }
  };

  return (
    <section className="rounded-[7px] border border-[#2f3031] bg-[#1d1e1f] p-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">Make the Flouci transfer</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Transfer the exact amount to the displayed number before the session expires.
          </p>
        </div>

        <div
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums",
            expired
              ? "border-red-400/30 bg-red-500/10 text-red-300"
              : "border-amber-400/25 bg-amber-400/10 text-amber-200",
          )}
        >
          {expired ? "Expired" : <>{minutes}:{seconds}</>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#8c8c8d]">Player ID</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{playerId}</p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#8c8c8d]">Amount</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-white">
              {Number(amount).toFixed(2)} TND
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-300">Transfer to this Flouci number</p>
              <p className="mt-2 text-2xl font-semibold tracking-wide text-white">{recipientNumber}</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyNumber}
                disabled={expired}
                title="Copy transfer number"
                className="border-[#3b3c3d] bg-[#2f3031] text-white hover:bg-[#393a3b]"
              >
                <Copy className="size-3.5" />
                Copy
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRequestChange}
                disabled={expired || changeRequested}
                title="Request a different transfer number"
                className="border-[#3b3c3d] bg-[#2f3031] text-white hover:bg-[#393a3b]"
              >
                {changeRequested ? <Check className="size-3.5" /> : <RefreshCw className="size-3.5" />}
                {changeRequested ? "Request sent" : "Change number"}
              </Button>
            </div>
          </div>

          <p className="mt-3 flex gap-2 text-[11px] leading-relaxed text-slate-400">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {changeRequested
              ? "Your request to change the transfer number has been recorded."
              : "Use the displayed number only for this deposit session."}
          </p>
        </div>

        <div>
          <FieldLabel>Transaction ID</FieldLabel>
          <Input
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            placeholder="Enter the Flouci transaction ID"
            title="Transaction ID"
            autoComplete="off"
            disabled={expired}
            className="h-12 border-[#343536] bg-[#343536] text-white placeholder:text-[#8c8c8d] shadow-none focus-visible:border-[#4b4c4d] focus-visible:ring-0"
          />
        </div>

        <div>
          <FieldLabel>Transfer proof</FieldLabel>
          <label
            title="Upload transfer proof"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 px-3 py-3 transition-colors hover:border-slate-600 hover:bg-slate-800",
              expired && "pointer-events-none opacity-50",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-700 text-slate-300">
              <FileImage className="size-4" />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-slate-200">
                {proofFile ? proofFile.name : "Upload a screenshot or payment proof"}
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-500">PNG, JPG or WEBP</span>
            </span>

            <Upload className="ml-auto size-4 shrink-0 text-slate-500" />

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              title="Upload transfer proof"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
              disabled={expired}
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={onConfirm}
          disabled={expired}
          className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" />
          Confirm transfer
        </Button>
      </div>
    </section>
  );
}

function WaitingTimeline({
  playerId,
  amount,
}: {
  playerId: string;
  amount: string;
}) {
  const stages = [
    {
      title: "Request verification",
      description: "A supervisor is reviewing your transaction details and transfer proof.",
      icon: ShieldCheck,
      active: true,
    },
    {
      title: "Deposit confirmation",
      description: "The deposit will be confirmed after the supervisor approves the request.",
      icon: CheckCircle2,
      active: false,
    },
    {
      title: "Transfer received",
      description: "Once the transfer is received, the funds will be credited to your player balance.",
      icon: CircleDollarSign,
      active: false,
    },
  ];

  return (
    <section className="rounded-[7px] border border-[#2f3031] bg-[#1d1e1f] p-4">
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
          <Clock3 className="size-5" />
        </div>
        <p className="mt-3 text-base font-semibold text-white">Your deposit is being reviewed</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
          Your request has been submitted successfully. Follow the status below.
        </p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#8c8c8d]">Player ID</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{playerId}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#8c8c8d]">Deposit amount</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-white">
            {Number(amount).toFixed(2)} TND
          </p>
        </div>
      </div>

      <div className="relative pl-1">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.title} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast ? (
                <div className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-700" />
              ) : null}

              <div
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                  stage.active
                    ? "border-[#109121] bg-[#109121] text-white"
                    : "border-[#343536] bg-[#343536] text-[#8c8c8d]",
                )}
              >
                {stage.active ? <Icon className="size-4" /> : <span className="text-xs">{index + 1}</span>}
              </div>

              <div className="min-w-0 pt-0.5">
                <p className={cn("text-sm font-medium", stage.active ? "text-white" : "text-[#8c8c8d]")}>
                  {stage.title}
                  {stage.active ? (
                    <span className="ml-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                      In progress
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs text-slate-400">
        <p className="flex items-center gap-2 text-slate-300">
          <Clock3 className="size-3.5" />
          Waiting for supervisor verification
        </p>
        <p className="mt-1">
          No further action is required from you unless the supervisor requests a correction.
        </p>
      </div>
    </section>
  );
}

function GenericDepositSummary({
  method,
  amount,
  onBack,
}: {
  method: PaymentMethod;
  amount: string;
  onBack: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <main className="min-h-dvh bg-[#1d1e1f] px-4 py-4 text-white sm:px-5">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft /> Back
          </Button>
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Deposit
          </span>
        </div>

        <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 sm:p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <PaymentMethodMark method={method} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#8c8c8d]">Payment method</p>
                <p className="mt-0.5 truncate text-sm font-medium text-white">{method.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Deposit amount</p>
              <div className="mt-2 rounded-lg bg-slate-700/90 px-3 py-3">
                <p className="text-lg font-semibold tabular-nums text-slate-100">
                  {Number(amount || method.min).toFixed(2)} {method.currency}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              <p className="flex gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
                {method.note}
              </p>
              <p className="flex gap-2">
                <Clock3 className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
                Session expires in{" "}
                <span className="font-medium tabular-nums text-white">
                  {minutes}:{seconds}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="size-3.5" />
                Secure payment session
              </div>
              <p className="mt-1">
                Follow the payment instructions provided by the selected method to complete this deposit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FlouciDepositFlow({
  method,
  openMethods,
  onToggleMethods,
  onSelectMethod,
  playerId,
  setPlayerId,
  amount,
  setAmount,
}: {
  method: PaymentMethod;
  openMethods: boolean;
  onToggleMethods: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [error, setError] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [recipientIndex] = React.useState(0);
  const [changeRequested, setChangeRequested] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);

  React.useEffect(() => {
    if (step !== 2) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const continueToPayment = () => {
    if (!playerId.trim()) {
      setError("Enter your player ID.");
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 10000) {
      setError("Amount must be between 1 and 10,000 TND.");
      return;
    }

    setError("");
    setSecondsLeft(15 * 60);
    setStep(2);
  };

  const requestChange = () => {
    setChangeRequested(true);
  };

  const confirmTransfer = () => {
    if (secondsLeft <= 0) {
      setError("This payment session has expired. Go back and start a new deposit.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Enter the Flouci transaction ID.");
      return;
    }

    if (!proofFile) {
      setError("Upload your transfer proof before confirming.");
      return;
    }

    setError("");
    setStep(3);
  };

  return (
    <main className="min-h-dvh bg-[#1d1e1f] px-4 py-4 text-white sm:px-5">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col">
        {step === 1 ? (
          <div className="mb-4">
            <PaymentMethodSelector
              method={method}
              open={openMethods}
              onToggle={onToggleMethods}
              onSelect={onSelectMethod}
            />
          </div>
        ) : null}

        <FlouciSteps step={step} />

        {step === 1 ? (
          <FlouciStepOne
            playerId={playerId}
            setPlayerId={setPlayerId}
            amount={amount}
            setAmount={setAmount}
            error={error}
            onContinue={continueToPayment}
          />
        ) : null}

        {step === 2 ? (
          <FlouciStepTwo
            playerId={playerId}
            amount={amount}
            recipientNumber={flouciRecipientNumbers[recipientIndex]}
            secondsLeft={secondsLeft}
            changeRequested={changeRequested}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
            proofFile={proofFile}
            setProofFile={setProofFile}
            error={error}
            onRequestChange={requestChange}
            onConfirm={confirmTransfer}
          />
        ) : null}

        {step === 3 ? <WaitingTimeline playerId={playerId} amount={amount} /> : null}

        {step !== 3 ? (
          <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
            <ShieldCheck className="size-3.5" />
            Secure checkout
            <ExternalLink className="size-3" />
          </div>
        ) : null}
      </div>
    </main>
  );
}

export function CustomerPortal() {
  const [method, setMethod] = React.useState(paymentMethods[0]);
  const [amount, setAmount] = React.useState(String(paymentMethods[0].min));
  const [playerId, setPlayerId] = React.useState("");
  const [openMethods, setOpenMethods] = React.useState(false);
  const [depositStarted, setDepositStarted] = React.useState(false);
  const [error, setError] = React.useState("");

  const minLabel = method.min.toLocaleString("en-US");
  const maxLabel = method.max.toLocaleString("en-US");

  const selectMethod = (nextMethod: PaymentMethod) => {
    setMethod(nextMethod);
    setAmount(String(nextMethod.min));
    setError("");
    setDepositStarted(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (numericAmount < method.min || numericAmount > method.max) {
      setError(
        "Amount must be between " +
          minLabel +
          " and " +
          maxLabel +
          " " +
          method.currency +
          ".",
      );
      return;
    }

    setError("");
    setDepositStarted(true);
  };

  if (method.id === "flouci") {
    return (
      <FlouciDepositFlow
        method={method}
        openMethods={openMethods}
        onToggleMethods={() => setOpenMethods((current) => !current)}
        onSelectMethod={selectMethod}
        playerId={playerId}
        setPlayerId={setPlayerId}
        amount={amount}
        setAmount={setAmount}
      />
    );
  }

  if (depositStarted) {
    return (
      <GenericDepositSummary
        method={method}
        amount={amount}
        onBack={() => setDepositStarted(false)}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-[#1d1e1f] px-4 py-4 text-white sm:px-5">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
          <div className="space-y-4">
            <PaymentMethodSelector
              method={method}
              open={openMethods}
              onToggle={() => setOpenMethods((current) => !current)}
              onSelect={selectMethod}
            />

            <form
              onSubmit={submit}
              className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 sm:p-5"
            >
              <div>
                <FieldLabel>Deposit amount</FieldLabel>
                <div className="rounded-lg bg-slate-700/90 px-3 py-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter deposit amount"
                    title="Deposit amount"
                    aria-label="Deposit amount"
                    className="h-8 border-0 bg-transparent p-0 text-base text-slate-100 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-400">Min/Max</span>
                <span className="font-medium tabular-nums text-slate-100">
                  {minLabel} - {maxLabel} {method.currency}
                </span>
              </div>

              {error ? (
                <div className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="mt-4 h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
              >
                <CircleDollarSign className="size-4" />
                <span>
                  Do Deposit
                  <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                    Net Amount:{" "}
                    {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"}{" "}
                    {method.currency}
                  </span>
                </span>
              </Button>
            </form>

            <div className="space-y-2 px-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
              <p>Choose your payment method and enter the amount you want to deposit.</p>
              <p className="text-[#b0b0b1]">{method.note}</p>
            </div>

            <div className="flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <ShieldCheck className="size-3.5" />
              Secure checkout
              <ExternalLink className="size-3" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

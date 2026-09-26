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
  Star,
  Upload,
  ScanText,
  Hash,
  UserRound,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { distributors } from "@/routes/(main)/dashboard/distributors/-components/data";

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
        "flex size-8 items-center justify-center overflow-hidden rounded-full border border-white/10 text-[9px] font-semibold tracking-tight",
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
                "group flex min-w-[104px] shrink-0 flex-col items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors",
                selected
                  ? "border-white/25 bg-slate-800/80"
                  : "border-white/8 bg-slate-900/60 hover:border-white/15 hover:bg-slate-800/60",
              )}
              aria-pressed={selected}
            >
              <PaymentMethodMark method={item} />
              <span className="max-w-full truncate text-[10px] font-medium text-slate-200">
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

const flouciRecipientOwners: Record<string, string> = {
  "22 345 678": "Mohamed Trabelsi",
  "53 781 249": "Yassine Ben Amor",
  "29 614 832": "Amine Jlassi",
};

type FlouciDemoStatus =
  | "reviewing"
  | "approved"
  | "received"
  | "correction"
  | "edited"
  | "expired";

type FlouciAiStatus = "idle" | "analyzing" | "matched" | "unrecognized";
type PlayerLookupType = "playerId" | "username" | "email";

const flouciSupervisor =
  distributors.find((distributor) => distributor.type === "Supervisor") ?? distributors[0];

function getSupervisorVerificationScore(email: string) {
  let seed = 0;
  for (const char of email) seed += char.charCodeAt(0);
  return Number(((seed % 101) / 10).toFixed(1));
}

function FlouciStepOne({
  playerId,
  setPlayerId,
  playerLookupType,
  setPlayerLookupType,
  amount,
  setAmount,
  error,
  onContinue,
}: {
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const presets = [20, 50, 100, 200, 500, 1000];

  return (
    <>
      <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
        <form onSubmit={(event) => { event.preventDefault(); onContinue(); }} className="space-y-4">
          <div>
            <FieldLabel>
              {playerLookupType === "playerId"
                ? "Player ID"
                : playerLookupType === "username"
                  ? "Username"
                  : "Email"}
            </FieldLabel>

            <div className="flex items-stretch gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  type={playerLookupType === "email" ? "email" : "text"}
                  value={playerId}
                  onChange={(event) => setPlayerId(event.target.value)}
                  placeholder={
                    playerLookupType === "playerId"
                      ? "Enter your player ID"
                      : playerLookupType === "username"
                        ? "Enter your username"
                        : "Enter your email address"
                  }
                  title={
                    playerLookupType === "playerId"
                      ? "Player ID"
                      : playerLookupType === "username"
                        ? "Username"
                        : "Email"
                  }
                  autoComplete={playerLookupType === "email" ? "email" : "off"}
                  className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div
                className="flex h-12 shrink-0 items-center gap-1.5"
                role="tablist"
                aria-label="Player identification type"
              >
                {(
                  [
                    ["playerId", "Player ID", Hash],
                    ["username", "Username", UserRound],
                    ["email", "Email", Mail],
                  ] as const
                ).map(([type, label, Icon]) => {
                  const active = playerLookupType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={label}
                      title={label}
                      onClick={() => {
                        setPlayerLookupType(type);
                        setPlayerId("");
                      }}
                      className={cn(
                        "group flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-slate-700/90 px-3 text-slate-400 transition-all",
                        active
                          ? "min-w-[92px] text-slate-100 shadow-[0_0_16px_rgba(255,255,255,0.04)]"
                          : "w-12 hover:bg-slate-800 hover:text-slate-100",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          active
                            ? "text-emerald-300"
                            : "text-slate-400 group-hover:text-slate-200",
                        )}
                      />
                      {active ? (
                        <span className="truncate text-xs font-medium">{label}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-1.5 min-h-4 text-[10px] text-slate-500">
              Using{" "}
              <span className="font-medium text-slate-300">
                {playerLookupType === "playerId"
                  ? "Player ID"
                  : playerLookupType === "username"
                    ? "Username"
                    : "Email"}
              </span>
            </div>
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
              className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
            />

            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  title="Select preset deposit amount"
                  className={cn(
                    "rounded-md border px-2.5 py-2 text-xs font-medium tabular-nums transition-colors",
                    Number(amount) === preset
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800",
                  )}
                >
                  {preset} TND
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-400">Min/Max</span>
            <span className="font-medium tabular-nums text-slate-100">
              1 - 10,000 TND
            </span>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            title="Continue to Flouci payment"
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
          >
            <CircleDollarSign className="size-4" />
            <span>
              Do Deposit
              <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                Net Amount: {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"} TND
              </span>
            </span>
          </Button>
        </form>
      </section>

      <div className="mt-5 space-y-1 px-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
        <p>To make a deposit, please fill in all the required fields below.</p>
        <p>
          Note* Make sure to select the correct payment method and enter the correct
          information before submitting your deposit.
        </p>
      </div>
    </>
  );
}


function AiOcrInspectionOverlay({ status }: { status: FlouciAiStatus }) {
  // The page uses this keyframe for the OCR "use detected ID" CTA shimmer.
  const ocrStages = [
    "Locating text regions",
    "Reading transaction fields",
    "Extracting payment amount",
    "Matching transaction ID",
  ];
  const [stageIndex, setStageIndex] = React.useState(0);

  React.useEffect(() => {
    if (status !== "analyzing") {
      setStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % ocrStages.length);
    }, 700);

    return () => window.clearInterval(timer);
  }, [status]);

  if (status === "idle") return null;

  const analyzing = status === "analyzing";
  const matched = status === "matched";
  const unrecognized = status === "unrecognized";

  return (
    <>
      <style>{'@keyframes flouci-ocr-scan { 0% { top: 7%; opacity: 0; } 8% { opacity: 1; } 50% { opacity: 1; } 92% { opacity: 1; } 100% { top: 93%; opacity: 0; } } @keyframes flouci-ocr-cta-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }'}</style>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-md",
        analyzing && "bg-slate-950/10",
        matched && "bg-emerald-400/5",
        unrecognized && "bg-amber-400/5",
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.42)_100%)]" />

      {analyzing ? (
        <>
          <div className="absolute inset-x-5 top-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full border border-cyan-300/30 bg-slate-950/75 px-2.5 py-1.5 backdrop-blur-md">
              <span className="relative flex size-2 items-center justify-center">
                <span className="absolute size-2 rounded-full bg-cyan-300/40 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-cyan-300" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                AI OCR
              </span>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-medium text-slate-200 backdrop-blur-md">
              {ocrStages[stageIndex]}
            </div>
          </div>

          <div className="absolute inset-x-5 top-1/2 -translate-y-1/2">
            <div className="relative h-24">
              <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-300/90" />
              <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-300/90" />
              <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-300/90" />
              <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-cyan-300/90" />

              <div className="absolute left-[12%] top-[18%] h-8 w-[28%] rounded-sm border border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_14px_rgba(103,232,249,0.14)]" />
              <div className="absolute left-[44%] top-[52%] h-8 w-[40%] rounded-sm border border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_14px_rgba(103,232,249,0.14)]" />
              <div className="absolute left-[17%] bottom-[5%] h-6 w-[24%] rounded-sm border border-cyan-300/50 bg-cyan-300/5" />
            </div>
          </div>

          <div
            className="absolute inset-x-4 h-px bg-cyan-200 shadow-[0_0_18px_4px_rgba(103,232,249,0.55)]"
            style={{ animation: "flouci-ocr-scan 2.1s linear infinite" }}
          />
          <div
            className="absolute inset-x-4 h-12 bg-gradient-to-b from-cyan-300/0 via-cyan-300/15 to-cyan-300/0 blur-[2px]"
            style={{ animation: "flouci-ocr-scan 2.1s linear infinite" }}
          />

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-300/25 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
            <span className="text-[10px] font-medium text-slate-200">
              OCR is scanning visible text
            </span>
            <span className="flex gap-0.5">
              <span className="size-1 rounded-full bg-cyan-300 animate-bounce [animation-delay:-0.2s]" />
              <span className="size-1 rounded-full bg-cyan-300 animate-bounce [animation-delay:-0.1s]" />
              <span className="size-1 rounded-full bg-cyan-300 animate-bounce" />
            </span>
          </div>
        </>
      ) : null}

      {matched ? (
        <>
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-slate-950/75 px-2.5 py-1.5 backdrop-blur-md">
              <CheckCircle2 className="size-3.5 text-emerald-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                OCR matched
              </span>
            </div>
            <div className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-medium text-emerald-200 backdrop-blur-md">
              Transfer recognized
            </div>
          </div>

          <div className="absolute inset-x-5 top-1/2 -translate-y-1/2">
            <div className="relative h-24">
              <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-emerald-300/90" />
              <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-emerald-300/90" />
              <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-emerald-300/90" />
              <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-emerald-300/90" />
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-emerald-300/25 bg-slate-950/80 px-3 py-1.5 text-[10px] font-medium text-emerald-200 backdrop-blur-md">
            Transaction details matched
          </div>
        </>
      ) : null}

      {unrecognized ? (
        <div className="absolute inset-x-4 bottom-4 flex justify-center">
          <div className="rounded-full border border-amber-300/25 bg-slate-950/80 px-3 py-1.5 text-[10px] font-medium text-amber-200 backdrop-blur-md">
            OCR could not confidently read the transfer details
          </div>
        </div>
      ) : null}
      </div>
    </>
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
  aiStatus,
  detectedTransactionId,
  onUseDetectedTransactionId,
  supervisorVerified,
  verificationScore,
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
  aiStatus: FlouciAiStatus;
  detectedTransactionId: string;
  onUseDetectedTransactionId: () => void;
  supervisorVerified: boolean;
  verificationScore: number;
  error: string;
  onRequestChange: () => void;
  onConfirm: () => void;
}) {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  const previewUrl = React.useMemo(
    () => (proofFile ? URL.createObjectURL(proofFile) : ""),
    [proofFile],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access may be blocked by the browser.
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProofFile(event.target.files?.[0] ?? null);
  };

  return (
    <>
      <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
        <div className="space-y-4">
          <div>
          <FieldLabel>Flouci transfer number</FieldLabel>
          <div className="flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-700/90">
              <Input
                readOnly
                value={recipientNumber}
                placeholder="Flouci transfer number"
                title="Flouci transfer number"
                className="h-12 flex-1 border-0 bg-transparent px-3 text-sm text-slate-100 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copy(recipientNumber.replace(/\s/g, ""))}
                disabled={expired}
                title="Copy Flouci transfer number"
                className="mr-1 my-1 size-10 shrink-0 rounded-md text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestChange}
              disabled={expired || changeRequested}
              title="Request a different Flouci transfer number"
              className="h-12 shrink-0 rounded-lg border-slate-700 bg-slate-900/60 px-3 text-xs text-slate-200 hover:bg-slate-800"
            >
              {changeRequested ? <Check className="size-3.5" /> : <RefreshCw className="size-3.5" />}
              {changeRequested ? "Request sent" : "Change number"}
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-slate-500">
            <span className="font-medium uppercase tracking-[0.08em] text-slate-600">Account owner</span>
            <span className="text-slate-700">·</span>
            <span className="truncate text-slate-300">
              {flouciRecipientOwners[recipientNumber] ?? "Flouci account holder"}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
            <div className="relative shrink-0">
              <img
                src={flouciSupervisor?.avatarUrl || ""}
                alt=""
                className="size-9 rounded-full object-cover ring-1 ring-white/10"
                referrerPolicy="no-referrer"
              />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-slate-900 text-[9px] text-white",
                  supervisorVerified ? "bg-blue-600" : "bg-slate-600",
                )}
                title={supervisorVerified ? "Supervisor verified" : "Supervisor not verified"}
              >
                {supervisorVerified ? <Check className="size-2.5" /> : "!"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Supervisor</p>
              <p className="truncate text-xs font-medium text-slate-100">{flouciSupervisor?.name ?? "Supervisor"}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Verification score</p>
              <p className="text-xs font-semibold tabular-nums text-slate-100">{verificationScore.toFixed(1)}/10</p>
              <p className={cn("text-[10px]", supervisorVerified ? "text-emerald-300" : "text-slate-500")}>
                {supervisorVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>
        </div>

          <div>
            <FieldLabel>Transfer amount</FieldLabel>
            <div className="flex overflow-hidden rounded-lg bg-slate-700/90">
              <Input
                readOnly
                value={Number(amount).toFixed(2) + " TND"}
                placeholder="Transfer amount"
                title="Transfer amount"
                className="h-12 flex-1 border-0 bg-transparent px-3 text-sm text-slate-100 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copy(Number(amount).toFixed(2))}
                disabled={expired}
                title="Copy transfer amount"
                className="mr-1 my-1 size-10 rounded-md text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <FieldLabel>Transaction ID</FieldLabel>
            <div className="flex items-stretch gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  placeholder="Enter your Flouci transaction ID"
                  title="Transaction ID"
                  autoComplete="off"
                  disabled={expired}
                  className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {proofFile && aiStatus === "matched" && !transactionId.trim() && detectedTransactionId ? (
                <Button
                  type="button"
                  onClick={onUseDetectedTransactionId}
                  disabled={expired}
                  title="Use the transaction ID detected by AI OCR"
                  className="group relative h-12 shrink-0 overflow-hidden rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)] transition-all hover:border-cyan-200/60 hover:bg-cyan-300/15 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/15 to-transparent animate-[flouci-ocr-cta-shimmer_1.8s_linear_infinite]" />
                  <span className="relative flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md border border-cyan-200/30 bg-cyan-300/10">
                      <ScanText className="size-4 animate-pulse text-cyan-200" />
                    </span>
                    <span>Use detected ID</span>
                  </span>
                </Button>
              ) : null}
            </div>

            {proofFile && aiStatus === "matched" && !transactionId.trim() && detectedTransactionId ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/5 px-3 py-2.5 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
                <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
                  <span className="absolute size-3.5 rounded-full bg-cyan-300/25 animate-ping" />
                  <ScanText className="relative size-3.5 text-cyan-200" />
                </span>
                <p className="text-[11px] leading-relaxed text-cyan-100/90">
                  <span className="font-semibold text-cyan-100">AI OCR detected the Transaction ID from your payment photo.</span>{" "}
                  Click <span className="font-semibold text-white">Use detected ID</span> to fill it automatically.
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <FieldLabel>Payment photo</FieldLabel>
            <label
              title="Upload payment photo"
              className={cn(
                "flex min-h-64 cursor-pointer flex-col gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 p-2.5 transition-colors hover:border-slate-600 hover:bg-slate-800",
                expired && "pointer-events-none opacity-50",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-700 text-slate-300">
                  <FileImage className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-200">
                    {proofFile ? proofFile.name : "Upload payment photo"}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    JPG, PNG or WEBP · photo of the completed transfer
                  </span>
                </span>
                <Upload className="ml-auto size-4 shrink-0 text-slate-500" />
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                title="Upload payment photo"
                onChange={handleFileChange}
                disabled={expired}
              />

              {previewUrl ? (
                <div className="relative overflow-hidden rounded-md border border-slate-700 bg-slate-900">
                  <img
                    src={previewUrl}
                    alt="Uploaded payment"
                    className={cn(
                      "max-h-72 w-full object-contain transition-all duration-300",
                      aiStatus === "analyzing" && "brightness-[0.88]",
                    )}
                  />
                  <AiOcrInspectionOverlay status={aiStatus} />
                </div>
              ) : (
                <div className="flex min-h-52 flex-1 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60">
                  <div className="text-center">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                      <FileImage className="size-5" />
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-200">Upload payment photo</p>
                    <p className="mt-1 text-[10px] text-slate-500">AI OCR will inspect the visible transfer details</p>
                  </div>
                </div>
              )}


            </label>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-slate-300">
            <p className="flex gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
              Please transfer only the exact amount to the Flouci number displayed above.
            </p>
            <p className="text-slate-500">
              Player ID: <span className="text-slate-300">{playerId}</span>
            </p>
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
            title="Confirm Flouci transfer"
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Confirm transfer
          </Button>
        </div>
      </section>

      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/45 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Info className="size-3.5 shrink-0 text-slate-300" />
          <p className="text-[11px] font-medium text-slate-200">How to make the transfer</p>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:border-r sm:border-slate-700 sm:pr-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-slate-300">1</span>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Open Flouci and start a transfer.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:px-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-slate-300">2</span>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Enter the number and exact amount shown above.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:border-l sm:border-slate-700 sm:pl-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-slate-300">3</span>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Confirm the transfer, then upload the payment photo.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
        <p>
          Complete the transfer before the timer expires. After confirmation, your
          request will be sent for supervisor verification.
        </p>
      </div>
    </>
  );
}

function WaitingTimeline({
  playerId,
  playerLookupType,
  amount,
  status,
  recipientNumber,
  correctedTransferNumber,
  setCorrectedTransferNumber,
  correctedAmount,
  setCorrectedAmount,
  supervisorNote,
  onSubmitCorrection,
}: {
  playerId: string;
  playerLookupType: PlayerLookupType;
  amount: string;
  status: FlouciDemoStatus;
  recipientNumber: string;
  correctedTransferNumber: string;
  setCorrectedTransferNumber: React.Dispatch<React.SetStateAction<string>>;
  correctedAmount: string;
  setCorrectedAmount: React.Dispatch<React.SetStateAction<string>>;
  supervisorNote: string;
  onSubmitCorrection: () => void;
}) {
  const [postAction, setPostAction] = React.useState<"review" | "report" | null>(null);
  const [rating, setRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [reportReason, setReportReason] = React.useState("");
  const [reportDetails, setReportDetails] = React.useState("");

  const reportReasons = [
    "Transfer not received",
    "Request processing is taking too long",
    "Incorrect transfer amount",
    "Supervisor requested incorrect payment details",
    "Other issue",
  ];

  const stages = [
    {
      title: "Request verification",
      description:
        status === "correction"
          ? "The supervisor found information that must be corrected before continuing."
          : status === "edited"
            ? "The supervisor reviewed the request and updated the payment details directly."
            : "The supervisor is reviewing your transaction details and transfer proof.",
      icon: ShieldCheck,
      state:
        status === "reviewing" || status === "correction"
          ? "active"
          : ["approved", "received", "edited"].includes(status)
            ? "done"
            : "pending",
    },
    {
      title: "Deposit confirmation",
      description:
        status === "approved"
          ? "The supervisor approved the deposit request."
          : status === "edited"
            ? "The supervisor changed the payment details directly. The updated request is ready for the next check."
            : "The deposit will be confirmed after supervisor approval.",
      icon: CheckCircle2,
      state:
        status === "approved"
          ? "active"
          : status === "received"
            ? "done"
            : status === "edited"
              ? "active"
              : "pending",
    },
    {
      title: "Transfer received",
      description:
        status === "received"
          ? "The transfer was received and the deposit can be credited to the player."
          : "Once the transfer is received, the funds will be credited to the player balance.",
      icon: CircleDollarSign,
      state: status === "received" ? "done" : "pending",
    },
  ];

  return (
    <>
      <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
        <div className="mb-5 text-center">
          <p className="text-base font-semibold text-white">
            {status === "received"
              ? "Deposit completed"
              : status === "approved"
                ? "Deposit approved"
                : status === "correction"
                  ? "Correction required"
                  : status === "edited"
                    ? "Payment details updated"
                    : status === "expired"
                      ? "Payment expired"
                      : "Your deposit is being reviewed"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {playerLookupType === "playerId"
              ? "Player ID"
              : playerLookupType === "username"
                ? "Username"
                : "Email"}
            : {playerId} · {Number(amount).toFixed(2)} TND
          </p>
        </div>

        <div className="relative pl-1">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === stages.length - 1;
            const blurStage = status === "correction" && index > 0;

            return (
              <div key={stage.title} className="relative pb-7 last:pb-0">
                <div className="relative flex gap-4">
                  {!isLast ? (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-700" />
                  ) : null}

                  <div
                    className={cn(
                      "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                      stage.state === "done"
                        ? "border-emerald-400 bg-emerald-400 text-slate-950"
                        : stage.state === "active"
                          ? "border-amber-400 bg-amber-400 text-slate-950"
                          : status === "correction" && index === 0
                            ? "border-red-400 bg-red-400 text-slate-950"
                            : "border-slate-700 bg-slate-800 text-slate-500",
                    )}
                  >
                    {stage.state === "done" ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        stage.state === "pending" ? "text-slate-500" : "text-white",
                      )}
                    >
                      {status === "correction" && index === 0 ? "Correction required" : stage.title}
                      {stage.state === "active" ? (
                        <span className="ml-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200">
                          In progress
                        </span>
                      ) : null}
                      {stage.state === "done" ? (
                        <span className="ml-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                          Completed
                        </span>
                      ) : null}
                      {status === "edited" && index === 1 ? (
                        <span className="ml-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-200">
                          Updated
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{stage.description}</p>
                  </div>
                </div>

                {blurStage ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-20 rounded-md bg-gradient-to-b from-slate-900/5 via-slate-950/50 to-slate-950/90 backdrop-blur-[2.5px]"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {status === "correction" ? (
          <div className="mt-1 rounded-lg border border-red-400/20 bg-red-500/5 p-3">
            <div className="mb-3">
              <p className="text-sm font-medium text-white">Correction required</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Please correct the fields identified by the supervisor and submit the request again.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <FieldLabel>Flouci transfer number</FieldLabel>
                <Input
                  value={correctedTransferNumber}
                  onChange={(event) => setCorrectedTransferNumber(event.target.value)}
                  placeholder="Enter the correct Flouci transfer number"
                  title="Correct Flouci transfer number"
                  className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <FieldLabel>Transfer amount</FieldLabel>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={correctedAmount}
                  onChange={(event) => setCorrectedAmount(event.target.value)}
                  placeholder="Enter the correct transfer amount"
                  title="Correct transfer amount"
                  className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <FieldLabel required={false}>Note from supervisor</FieldLabel>
                <div
                  title="Supervisor correction note"
                  className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-3 text-xs leading-relaxed text-slate-300"
                >
                  {supervisorNote}
                </div>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-[11px] text-slate-500">
                Current transfer number: <span className="text-slate-300">{recipientNumber}</span>
              </div>

              <Button
                type="button"
                onClick={onSubmitCorrection}
                title="Submit corrected payment details"
                className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
              >
                <CheckCircle2 className="size-4" />
                Submit correction
              </Button>
            </div>
          </div>
        ) : null}

        {status === "edited" ? (
          <div className="mt-1 rounded-lg border border-blue-400/20 bg-blue-500/5 p-3">
            <p className="text-sm font-medium text-white">Updated by supervisor</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              The supervisor modified the request directly. The changes are shown below.
            </p>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Transfer number</p>
                <p className="mt-1 text-xs text-slate-500">
                  Previous: <span className="text-slate-300">{recipientNumber}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Updated: <span className="font-medium text-white">53 781 249</span>
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Transfer amount</p>
                <p className="mt-1 text-xs text-slate-500">
                  Previous: <span className="text-slate-300">{Number(amount).toFixed(2)} TND</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Updated: <span className="font-medium text-white">95.00 TND</span>
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Supervisor note</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Amount adjusted and transfer number updated by the supervisor.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs text-slate-400">
          <p className="flex items-center gap-2 text-slate-300">
            <Clock3 className="size-3.5" />
            {status === "received"
              ? "Transfer received"
              : status === "approved"
                ? "Waiting for transfer"
                : status === "edited"
                  ? "Waiting with updated payment details"
                  : status === "correction"
                    ? "Correction requested by supervisor"
                    : status === "expired"
                      ? "This payment session has expired"
                      : "Waiting for supervisor verification"}
          </p>
        </div>
      {status === "received" ? (
        <div className="mt-4 border-t border-slate-700 pt-4">
          {postAction === null ? (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={flouciSupervisor?.avatarUrl || ""}
                  alt=""
                  className="size-9 rounded-full object-cover ring-1 ring-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Supervisor</p>
                  <p className="truncate text-xs font-medium text-slate-100">{flouciSupervisor?.name ?? "Supervisor"}</p>
                </div>
                <span className="text-[10px] text-emerald-300">Transfer completed</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant="outline"
                  title="Review supervisor"
                  onClick={() => setPostAction("review")}
                  className="h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:border-amber-400/40 hover:bg-slate-800 hover:text-white"
                >
                  <Star className="size-3.5" />
                  Review Supervisor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  title="Report an issue"
                  onClick={() => setPostAction("report")}
                  className="h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:border-red-400/40 hover:bg-slate-800 hover:text-white"
                >
                  <Info className="size-3.5" />
                  Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  title="Exit deposit flow"
                  onClick={() => window.history.back()}
                  className="h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:bg-slate-800"
                >
                  Exit
                </Button>
              </div>
            </>
          ) : null}

          {postAction === "review" ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Review Supervisor</p>
                  <p className="mt-1 text-xs text-slate-400">
                    How was your experience with {flouciSupervisor?.name ?? "the supervisor"}?
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPostAction(null)}
                  className="h-8 px-2 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </Button>
              </div>

              <div className="mt-4 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={value + " star" + (value === 1 ? "" : "s")}
                    className="rounded-md p-1.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        value <= rating
                          ? "fill-amber-300 text-amber-300"
                          : "text-slate-600 hover:text-amber-200",
                      )}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <FieldLabel required={false}>Your review</FieldLabel>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-700/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              <Button
                type="button"
                disabled={rating === 0}
                onClick={() => setPostAction(null)}
                className="mt-3 h-10 w-full bg-amber-300 text-sm font-medium text-slate-950 hover:bg-amber-200 disabled:opacity-40"
              >
                <Star className="size-4" />
                Submit review
              </Button>
            </div>
          ) : null}

          {postAction === "report" ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Report an issue</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Select what happened so the team can review your case.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPostAction(null)}
                  className="h-8 px-2 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {reportReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setReportReason(reason)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 text-left text-xs transition-colors",
                      reportReason === reason
                        ? "border-red-400/40 bg-red-500/10 text-red-200"
                        : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800",
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <FieldLabel required={false}>Additional details</FieldLabel>
                <textarea
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  placeholder="Add any details that can help us investigate..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-700/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-red-400/40 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <Button
                type="button"
                disabled={!reportReason}
                onClick={() => setPostAction(null)}
                className="mt-3 h-10 w-full bg-red-400 text-sm font-medium text-slate-950 hover:bg-red-300 disabled:opacity-40"
              >
                <Info className="size-4" />
                Submit report
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      </section>
    </>
  );
}

function FlouciDemoControls({
  status,
  setStatus,
  setStep,
  setAiStatus,
  setSupervisorVerified,
}: {
  status: FlouciDemoStatus;
  setStatus: React.Dispatch<React.SetStateAction<FlouciDemoStatus>>;
  setStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
  setAiStatus: React.Dispatch<React.SetStateAction<FlouciAiStatus>>;
  setSupervisorVerified: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setDemo = (next: FlouciDemoStatus) => {
    setStatus(next);
    setStep(3);
  };

  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Flow preview / test states
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        These controls are for previewing each possible supervisor/payment outcome.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("reviewing")}
          title="Preview supervisor reviewing state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "reviewing" && "border-slate-500 bg-slate-800 text-white",
          )}
        >
          Reviewing
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("approved")}
          title="Preview supervisor approved state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "approved" && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
          )}
        >
          Approved
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("received")}
          title="Preview transfer received state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "received" && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
          )}
        >
          Received
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("correction")}
          title="Preview correction required state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "correction" && "border-red-400/40 bg-red-500/10 text-red-300",
          )}
        >
          Correction
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("edited")}
          title="Preview supervisor directly edited state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "edited" && "border-blue-400/40 bg-blue-500/10 text-blue-200",
          )}
        >
          Supervisor edited
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDemo("expired")}
          title="Preview expired state"
          className={cn(
            "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
            status === "expired" && "border-red-400/40 bg-red-500/10 text-red-300",
          )}
        >
          Expired
        </Button>
      </div>


      <div className="mt-3 border-t border-slate-700 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          AI / verification preview
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAiStatus("matched")}
            title="Preview AI recognized and matched transfer"
            className="h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800"
          >
            AI matched
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAiStatus("unrecognized")}
            title="Preview AI could not recognize transfer"
            className="h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800"
          >
            AI unrecognized
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSupervisorVerified(true)}
            title="Preview supervisor verified destination"
            className="h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800"
          >
            Verified
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSupervisorVerified(false)}
            title="Preview unverified destination"
            className="h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800"
          >
            Not verified
          </Button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep(1)}
          title="Preview Flouci step one"
          className="h-8 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Step 1
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep(2)}
          title="Preview Flouci step two"
          className="h-8 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Step 2
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStatus("reviewing");
            setStep(3);
          }}
          title="Preview waiting timeline"
          className="h-8 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Waiting
        </Button>
      </div>
    </div>
  );
}

function FlouciDepositFlow({
  method,
  openMethods,
  onToggleMethods,
  onSelectMethod,
  playerId,
  setPlayerId,
  playerLookupType,
  setPlayerLookupType,
  amount,
  setAmount,
}: {
  method: PaymentMethod;
  openMethods: boolean;
  onToggleMethods: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [demoStatus, setDemoStatus] = React.useState<FlouciDemoStatus>("reviewing");
  const [error, setError] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [aiStatus, setAiStatus] = React.useState<FlouciAiStatus>("idle");
  const [detectedTransactionId, setDetectedTransactionId] = React.useState("");
  const [supervisorVerified, setSupervisorVerified] = React.useState(Boolean(flouciSupervisor?.verified));
  const verificationScore = getSupervisorVerificationScore(flouciSupervisor?.email ?? "");
  const [recipientNumber, setRecipientNumber] = React.useState(flouciRecipientNumbers[0]);
  const [changeRequested, setChangeRequested] = React.useState(false);
  const [correctedTransferNumber, setCorrectedTransferNumber] = React.useState(flouciRecipientNumbers[0]);
  const [correctedAmount, setCorrectedAmount] = React.useState(amount);
  const [supervisorNote] = React.useState(
    "The transfer number and amount do not match the submitted payment. Please correct both fields and submit again.",
  );
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  React.useEffect(() => {
    if (!proofFile) {
      setAiStatus("idle");
      setDetectedTransactionId("");
      return;
    }

    setAiStatus("analyzing");
    setDetectedTransactionId("");

    const timer = window.setTimeout(() => {
      setAiStatus("matched");
      setDetectedTransactionId("FL-4289176035");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [proofFile]);

  React.useEffect(() => {
    if (step !== 2) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const continueToPayment = () => {
    if (!playerId.trim()) {
      setError(
        playerLookupType === "playerId"
          ? "Enter your player ID."
          : playerLookupType === "username"
            ? "Enter your username."
            : "Enter your email address.",
      );
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 10000) {
      setError("Amount must be between 1 and 10,000 TND.");
      return;
    }

    setError("");
    setDemoStatus("reviewing");
    setAiStatus("idle");
    setDetectedTransactionId("");
    setCorrectedTransferNumber(recipientNumber);
    setCorrectedAmount(amount);
    setSecondsLeft(15 * 60);
    setStep(2);
  };

  const requestChange = () => {
    setChangeRequested(true);
  };

  const submitCorrection = () => {
    const numericAmount = Number(correctedAmount);

    if (!correctedTransferNumber.trim()) {
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    setRecipientNumber(correctedTransferNumber);
    setAmount(correctedAmount);
    setError("");
    setDemoStatus("reviewing");
  };

  const confirmTransfer = () => {
    if (secondsLeft <= 0) {
      setError("This payment session has expired. Go back and start a new deposit.");
      setDemoStatus("expired");
      setStep(3);
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
    setDemoStatus("reviewing");
    setStep(3);
  };



  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col">
        {step === 2 ? (
          <div
            className={cn(
              "relative mb-3 overflow-hidden rounded-lg border px-3 py-2",
              expired
                ? "border-red-400/30 bg-red-500/5"
                : "border-emerald-400/20 bg-slate-900/70",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md border",
                  expired
                    ? "border-red-400/30 bg-red-500/10 text-red-300"
                    : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
                )}
              >
                <Clock3 className="size-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!expired ? (
                    <span className="relative flex size-1.5 shrink-0">
                      <span className="absolute size-1.5 animate-ping rounded-full bg-emerald-300/60" />
                      <span className="relative size-1.5 rounded-full bg-emerald-300" />
                    </span>
                  ) : null}
                  <p className="truncate text-[11px] font-medium text-slate-300">
                    {expired ? "Payment session expired" : "Payment expires in"}
                  </p>
                </div>
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      expired ? "bg-red-400" : "bg-emerald-400",
                    )}
                    style={{ width: Math.max(0, Math.min(100, (secondsLeft / (15 * 60)) * 100)) + "%" }}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "shrink-0 rounded-md border px-2.5 py-1 text-sm font-semibold tabular-nums tracking-[0.08em]",
                  expired
                    ? "border-red-400/30 bg-red-500/10 text-red-300"
                    : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.08)]",
                )}
              >
                {minutes}:{seconds}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <PaymentMethodSelector
            method={method}
            open={openMethods}
            onToggle={onToggleMethods}
            onSelect={onSelectMethod}
          />
        </div>

        <div className="flex-1">
          {step === 1 ? (
            <FlouciStepOne
              playerId={playerId}
              setPlayerId={setPlayerId}
              playerLookupType={playerLookupType}
              setPlayerLookupType={setPlayerLookupType}
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
              recipientNumber={recipientNumber}
              secondsLeft={secondsLeft}
              changeRequested={changeRequested}
              transactionId={transactionId}
              setTransactionId={setTransactionId}
              proofFile={proofFile}
              setProofFile={setProofFile}
              aiStatus={aiStatus}
              detectedTransactionId={detectedTransactionId}
              onUseDetectedTransactionId={() => setTransactionId(detectedTransactionId)}
              supervisorVerified={supervisorVerified}
              verificationScore={verificationScore}
              error={error}
              onRequestChange={requestChange}
              onConfirm={confirmTransfer}
            />
          ) : null}

          {step === 3 ? (
            <WaitingTimeline
              playerId={playerId}
              playerLookupType={playerLookupType}
              amount={amount}
              status={demoStatus}
              recipientNumber={recipientNumber}
              correctedTransferNumber={correctedTransferNumber}
              setCorrectedTransferNumber={setCorrectedTransferNumber}
              correctedAmount={correctedAmount}
              setCorrectedAmount={setCorrectedAmount}
              supervisorNote={supervisorNote}
              onSubmitCorrection={submitCorrection}
            />
          ) : null}
        </div>

        <FlouciDemoControls
          status={demoStatus}
          setStatus={setDemoStatus}
          setStep={setStep}
          setAiStatus={setAiStatus}
          setSupervisorVerified={setSupervisorVerified}
        />

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout
          <ExternalLink className="size-3" />
        </div>
      </div>
    </main>
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
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl flex-col">
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
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Payment method</p>
                <p className="mt-0.5 truncate text-sm font-medium text-white">{method.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white">Deposit amount</p>
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

export function CustomerPortal() {
  const [method, setMethod] = React.useState(paymentMethods[0]);
  const [amount, setAmount] = React.useState(String(paymentMethods[0].min));
  const [playerId, setPlayerId] = React.useState("");
  const [playerLookupType, setPlayerLookupType] = React.useState<PlayerLookupType>("playerId");
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
        playerLookupType={playerLookupType}
        setPlayerLookupType={setPlayerLookupType}
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
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
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
                    className="h-12 border-0 bg-transparent p-0 text-sm text-slate-100 placeholder:text-slate-500 shadow-none focus-visible:ring-0"
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
              <p className="text-slate-400">{method.note}</p>
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

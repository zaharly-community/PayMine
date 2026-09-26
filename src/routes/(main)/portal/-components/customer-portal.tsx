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
  Plus,
  Trash2,
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

const walletRecipientNumbers = ["22 345 678", "53 781 249", "29 614 832"];

const walletRecipientOwners: Record<string, string> = {
  "22 345 678": "Mohamed Trabelsi",
  "53 781 249": "Yassine Ben Amor",
  "29 614 832": "Amine Jlassi",
};

const manualTransferMethodIds = new Set(["flouci", "d17", "kashy"]);
const cardDepositMethodIds = new Set(["orange", "ooredoo", "tunisie-telecom"]);

function isCardDepositMethod(method: PaymentMethod) {
  return cardDepositMethodIds.has(method.id);
}

function isManualTransferMethod(method: PaymentMethod) {
  return manualTransferMethodIds.has(method.id);
}

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

function FlouciTransferHelpAccordion({ method }: { method: PaymentMethod }) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  const toggle = (item: string) => {
    setOpenItem((current) => (current === item ? null : item));
  };

  const items = [
    {
      id: "identity",
      title: "1. Enter your player information",
      description: "Use the identifier you normally use to access your account.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="size-6 rounded-md bg-slate-800" />
            <div className="h-2 w-24 rounded bg-slate-800" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-2 w-20 rounded bg-slate-800" />
            <div className="flex h-9 items-center gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2.5">
              <UserRound className="size-3.5 text-emerald-300" />
              <span className="text-[10px] text-slate-300">Player ID / Username / Email</span>
            </div>
            <p className="text-[9px] leading-relaxed text-slate-500">
              Select the matching identifier above and enter the value in the field.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "transfer",
      title: `2. Create the ${method.name} transfer`,
      description: `Send the exact amount to the ${method.name} number displayed in the payment form.`,
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-slate-800 text-[9px] font-semibold text-slate-300">
              {method.name.slice(0, 1)}
            </span>
            <span className="text-[10px] font-medium text-slate-200">New transfer</span>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <p className="mb-1 text-[9px] text-slate-500">Recipient</p>
              <div className="flex h-8 items-center rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 text-[10px] font-medium text-cyan-100">
                22 345 678
              </div>
            </div>
            <div>
              <p className="mb-1 text-[9px] text-slate-500">Amount</p>
              <div className="flex h-8 items-center rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 text-[10px] font-medium text-cyan-100">
                100.00 TND
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "proof",
      title: "3. Keep the transfer proof",
      description: "After completing the transfer, keep the receipt and transaction reference visible.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-medium text-slate-200">Transfer completed</span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-300">
              Success
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-md bg-slate-900 px-2.5 py-2">
              <span className="text-[9px] text-slate-500">Transaction ID</span>
              <span className="text-[9px] font-medium text-slate-200">TX-4289176035</span>
            </div>
            <div className="h-10 rounded-md border border-dashed border-slate-700 bg-slate-900/70" />
          </div>
        </div>
      ),
    },
    {
      id: "ocr",
      title: "4. AI OCR checks the payment photo",
      description: "OCR reads visible text from the receipt, extracts key fields, and compares them with your request.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="relative overflow-hidden rounded-md border border-slate-700 bg-slate-900 p-3">
            <div className="space-y-2 opacity-80">
              <div className="h-2 w-28 rounded bg-slate-700" />
              <div className="h-2 w-20 rounded bg-slate-700" />
              <div className="h-6 w-full rounded border border-cyan-300/30 bg-cyan-300/5" />
              <div className="h-6 w-3/4 rounded border border-cyan-300/30 bg-cyan-300/5" />
            </div>
            <div
              className="absolute inset-x-2 top-1/2 h-px bg-cyan-200 shadow-[0_0_14px_3px_rgba(103,232,249,0.45)]"
              style={{ animation: "flouci-ocr-help-scan 2.1s linear infinite" }}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 text-[9px] text-cyan-100">
              Transaction ID
            </span>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 text-[9px] text-cyan-100">
              Amount
            </span>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 text-[9px] text-cyan-100">
              Recipient
            </span>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 text-[9px] text-cyan-100">
              Date / time
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{'@keyframes flouci-ocr-help-scan { 0% { top: 8%; opacity: 0; } 10% { opacity: 1; } 50% { opacity: 1; } 90% { opacity: 1; } 100% { top: 92%; opacity: 0; } }'}</style>
      <section className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/45">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2.5">
        <Info className="size-3.5 text-slate-300" />
        <div>
          <p className="text-[11px] font-medium text-slate-200">How to complete a {method.name} transfer</p>
          <p className="text-[9px] text-slate-500">Open a step to see where each detail goes and how AI OCR checks the proof.</p>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {items.map((item) => {
          const open = openItem === item.id;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-800/60"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                    open ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-800 text-slate-500",
                  )}
                >
                  {item.id === "ocr" ? <ScanText className="size-3" /> : item.id === "identity" ? "1" : item.id === "transfer" ? "2" : "3"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[11px] font-medium", open ? "text-slate-100" : "text-slate-300")}>
                    {item.title}
                  </span>
                  {!open ? <span className="mt-0.5 block truncate text-[9px] text-slate-500">{item.description}</span> : null}
                </span>

                <ChevronDown className={cn("size-3.5 shrink-0 text-slate-500 transition-transform", open && "rotate-180 text-slate-300")} />
              </button>

              {open ? (
                <div className="grid grid-cols-1 gap-3 bg-slate-950/20 px-3 pb-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-start">
                  <div className="pt-0.5">
                    <p className="text-[10px] leading-relaxed text-slate-400">{item.description}</p>
                    {item.id === "ocr" ? (
                      <div className="mt-2 rounded-md border border-cyan-300/15 bg-cyan-300/5 px-2.5 py-2">
                        <p className="text-[9px] leading-relaxed text-cyan-100/90">
                          The scan can identify the transaction reference from the image. When a match is found, the player can use the detected ID instead of typing it manually.
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div>{item.visual}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
    </>
  );
}

function FlouciStepOne({
  method,
  playerId,
  setPlayerId,
  playerLookupType,
  setPlayerLookupType,
  amount,
  setAmount,
  error,
  onContinue,
}: {
  method: PaymentMethod;
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
            title={`Continue to ${method.name} payment`}
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

      <FlouciTransferHelpAccordion method={method} />

      <div className="mt-3 space-y-1 px-1 text-[10px] leading-relaxed text-slate-400 sm:text-xs">
        <p>Complete the transfer before continuing and keep the payment proof available for verification.</p>
        <p>Note* Make sure the recipient number and amount exactly match the instructions above.</p>
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
  method,
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
  method: PaymentMethod;
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
          <FieldLabel>{method.name} transfer number</FieldLabel>
          <div className="flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-700/90">
              <Input
                readOnly
                value={recipientNumber}
                placeholder={`${method.name} transfer number`}
                title={`${method.name} transfer number`}
                className="h-12 flex-1 border-0 bg-transparent px-3 text-sm text-slate-100 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copy(recipientNumber.replace(/\s/g, ""))}
                disabled={expired}
                title={`Copy ${method.name} transfer number`}
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
              title={`Request a different ${method.name} transfer number`}
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
              {walletRecipientOwners[recipientNumber] ?? `${method.name} account holder`}
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
                  placeholder={`Enter your ${method.name} transaction ID`}
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
              Please transfer only the exact amount to the {method.name} number displayed above.
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
            title={`Confirm ${method.name} transfer`}
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Confirm transfer
          </Button>
        </div>
      </section>

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
  method,
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
  method: PaymentMethod;
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
        {status === "reviewing" ? (
          <div className="mb-3 flex justify-center">
            <img
              src="https://assets-v2.lottiefiles.com/a/32092c6a-1187-11ee-82df-37dd938d41eb/9rtrQDUjoJ.gif"
              alt="Deposit is being reviewed"
              className="h-24 w-24 object-contain"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}

        {status === "received" ? (
          <div className="mb-3 flex justify-center">
            <iframe
              src="https://lottiefiles.com/free-animation/check-jSOmPyr6eH"
              title="Deposit completed animation"
              className="h-24 w-24 border-0"
              scrolling="no"
              loading="eager"
            />
          </div>
        ) : null}

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
                ? "Username"                : "Email"}
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
                <FieldLabel>{method.name} transfer number</FieldLabel>
                <Input
                  value={correctedTransferNumber}
                  onChange={(event) => setCorrectedTransferNumber(event.target.value)}
                  placeholder={`Enter the ${method.name} transfer number`}
                  title={`Correct ${method.name} transfer number`}
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
          title="Preview payment step one"
          className="h-8 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Step 1
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep(2)}
          title="Preview payment step two"
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
  const [recipientNumber, setRecipientNumber] = React.useState(walletRecipientNumbers[0]);
  const [changeRequested, setChangeRequested] = React.useState(false);
  const [correctedTransferNumber, setCorrectedTransferNumber] = React.useState(walletRecipientNumbers[0]);
  const [correctedAmount, setCorrectedAmount] = React.useState(amount);
  const [supervisorNote] = React.useState(
    "The transfer number and amount do not match the submitted payment. Please correct both fields and submit again.",
  );
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  React.useEffect(() => {
    setStep(1);
    setDemoStatus("reviewing");
    setError("");
    setTransactionId("");
    setProofFile(null);
    setAiStatus("idle");
    setDetectedTransactionId("");
    setChangeRequested(false);
    setRecipientNumber(walletRecipientNumbers[0]);
    setCorrectedTransferNumber(walletRecipientNumbers[0]);
    setCorrectedAmount(String(method.min));
    setSecondsLeft(15 * 60);
  }, [method.id]);

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
      const prefix = method.id === "d17" ? "D17" : method.id === "kashy" ? "KSH" : "FL";
      setDetectedTransactionId(`${prefix}-4289176035`);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [proofFile, method.id]);

  const previewUrl = React.useMemo(
    () => (proofFile ? URL.createObjectURL(proofFile) : ""),
    [proofFile],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      setError(`Enter the ${method.name} transaction ID.`);
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

        {step === 2 ? (
          <div className="mb-4 flex items-center justify-center">
            <img
              src={
                method.id === "flouci"
                  ? "https://flouci.com/static/img/gallery/Logos_flouci-horizontal-gradient.12157bd2c525.png"
                  : method.logoUrl ?? ""
              }
              alt={method.name}
              className={cn(
                "object-contain",
                method.id === "flouci"
                  ? "h-7 w-auto"
                  : "size-9 rounded-lg border border-white/10 bg-white p-1",
              )}
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="mb-4">
            <PaymentMethodSelector
              method={method}
              open={openMethods}
              onToggle={onToggleMethods}
              onSelect={onSelectMethod}
            />
          </div>
        )}

        <div className="flex-1">
          {step === 1 ? (
            <FlouciStepOne
              method={method}
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
              method={method}
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
              method={method}
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


type CardOcrStatus = "idle" | "analyzing" | "matched";

function normalizeCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

function formatCardNumber(value: string) {
  const digits = normalizeCardNumber(value);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

const usedCardNumber = "0000000000000000";

function CardDepositStepOne({
  method,
  playerId,
  setPlayerId,
  playerLookupType,
  setPlayerLookupType,
  amount,
  setAmount,
  error,
  onContinue,
}: {
  method: PaymentMethod;
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const presets = [10, 20, 50, 100, 200, 500];

  return (
    <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
        className="space-y-4"
      >
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
          <FieldLabel>Total card amount</FieldLabel>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter total value of the cards"
            title="Total card amount"
            className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
          />

          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                title="Select preset card amount"
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
            {method.min.toLocaleString("en-US")} - {method.max.toLocaleString("en-US")} {method.currency}
          </span>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          title={`Continue to ${method.name} card payment`}
          className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
        >
          <CircleDollarSign className="size-4" />
          <span>
            Do Deposit
            <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
              Total Cards Value:{" "}
              {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"}{" "}
              {method.currency}
            </span>
          </span>
        </Button>
      </form>
    </section>
  );
}

function CardDepositOcrOverlay({ status }: { status: CardOcrStatus }) {
  const stages = [
    "Locating card numbers",
    "Reading card digits",
    "Validating 16-digit codes",
    "Checking used card status",
  ];
  const [stageIndex, setStageIndex] = React.useState(0);

  React.useEffect(() => {
    if (status !== "analyzing") {
      setStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % stages.length);
    }, 700);

    return () => window.clearInterval(timer);
  }, [status]);

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-md",
        status === "analyzing" && "bg-slate-950/10",
        status === "matched" && "bg-emerald-400/5",
      )}
      aria-hidden="true"
    >
      {status === "analyzing" ? (
        <>
          <div className="absolute inset-x-4 top-3 flex items-center justify-between gap-2">
            <span className="rounded-full border border-cyan-300/30 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 backdrop-blur-md">
              AI OCR
            </span>
            <span className="truncate rounded-full border border-white/10 bg-slate-950/75 px-2.5 py-1.5 text-[10px] text-slate-200 backdrop-blur-md">
              {stages[stageIndex]}
            </span>
          </div>
          <div className="absolute inset-x-5 top-1/2 -translate-y-1/2">
            <div className="relative h-28 rounded-md border border-cyan-300/30">
              <span className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-cyan-300/90" />
              <span className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-cyan-300/90" />
              <span className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-cyan-300/90" />
              <span className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-cyan-300/90" />
              <div
                className="absolute inset-x-3 h-px bg-cyan-200 shadow-[0_0_14px_3px_rgba(103,232,249,0.45)]"
                style={{ animation: "flouci-ocr-scan 2.1s linear infinite" }}
              />
              <div className="absolute left-[12%] top-[28%] h-7 w-[72%] rounded-sm border border-cyan-300/60 bg-cyan-300/10" />
              <div className="absolute left-[18%] top-[57%] h-7 w-[58%] rounded-sm border border-cyan-300/60 bg-cyan-300/10" />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-x-4 bottom-3 flex justify-center">
          <div className="rounded-full border border-emerald-300/25 bg-slate-950/80 px-3 py-1.5 text-[10px] font-medium text-emerald-200 backdrop-blur-md">
            OCR detected card numbers
          </div>
        </div>
      )}
    </div>
  );
}

function CardDepositFlow({
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
  const [error, setError] = React.useState("");
  const [cardNumbers, setCardNumbers] = React.useState<string[]>([""]);
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [ocrStatus, setOcrStatus] = React.useState<CardOcrStatus>("idle");
  const [detectedCards, setDetectedCards] = React.useState<string[]>([]);
  const [cardReviewStatus, setCardReviewStatus] = React.useState<"reviewing" | "completed">("reviewing");

  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  React.useEffect(() => {
    setStep(1);
    setError("");
    setCardNumbers([""]);
    setProofFile(null);
    setOcrStatus("idle");
    setDetectedCards([]);
    setCardReviewStatus("reviewing");
    setSecondsLeft(15 * 60);
  }, [method.id]);

  React.useEffect(() => {
    if (!proofFile) {
      setOcrStatus("idle");
      setDetectedCards([]);
      return;
    }

    setOcrStatus("analyzing");
    setDetectedCards([]);

    const timer = window.setTimeout(() => {
      setOcrStatus("matched");
      setDetectedCards([
        "1111 2222 3333 4444",
        "5555 6666 7777 8888",
      ]);
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

  const usedCardIndexes = React.useMemo(
    () =>
      cardNumbers
        .map((value, index) => (normalizeCardNumber(value) === usedCardNumber ? index : -1))
        .filter((index) => index >= 0),
    [cardNumbers],
  );

  const appendCards = (values: string[]) => {
    const normalizedIncoming = values
      .map((value) => formatCardNumber(value))
      .filter((value) => normalizeCardNumber(value).length > 0);

    if (!normalizedIncoming.length) return;

    setCardNumbers((current) => {
      const existing = new Set(
        current
          .map((value) => normalizeCardNumber(value))
          .filter(Boolean),
      );
      const next = [...current];
      const firstBlankIndex = next.findIndex((value) => !normalizeCardNumber(value));

      let insertAt = firstBlankIndex >= 0 ? firstBlankIndex : next.length;

      for (const value of normalizedIncoming) {
        const normalized = normalizeCardNumber(value);
        if (!normalized || existing.has(normalized)) continue;

        if (insertAt >= next.length) next.push("");
        next[insertAt] = formatCardNumber(normalized);
        existing.add(normalized);
        insertAt += 1;
      }

      if (next[next.length - 1] && normalizeCardNumber(next[next.length - 1]).length > 0) {
        next.push("");
      }

      return next;
    });
  };

  const updateCard = (index: number, value: string) => {
    const formatted = formatCardNumber(value);

    setCardNumbers((current) => {
      const next = [...current];
      next[index] = formatted;

      if (formatted && normalizeCardNumber(next[next.length - 1]).length > 0) {
        next.push("");
      }

      return next;
    });
  };

  const addCardInput = () => {
    setCardNumbers((current) => [...current, ""]);
  };

  const deleteCardInput = (index: number) => {
    if (index === 0) return;

    setCardNumbers((current) => {
      if (current.length <= 1) return current;
      return current.filter((_, cardIndex) => cardIndex !== index);
    });
  };

  const continueToCards = () => {
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
    if (!Number.isFinite(numericAmount) || numericAmount < method.min || numericAmount > method.max) {
      setError(
        `Total card amount must be between ${method.min.toLocaleString("en-US")} and ${method.max.toLocaleString("en-US")} ${method.currency}.`,
      );
      return;
    }

    setError("");
    setCardNumbers([""]);
    setProofFile(null);
    setOcrStatus("idle");
    setDetectedCards([]);
    setSecondsLeft(15 * 60);
    setCardReviewStatus("reviewing");
    setStep(2);
  };

  const confirmCards = () => {
    const enteredCards = cardNumbers
      .map(normalizeCardNumber)
      .filter(Boolean);

    if (expired) {
      setError("This payment session has expired. Go back and start a new deposit.");
      setCardReviewStatus("reviewing");
      setStep(3);
      return;
    }

    if (!enteredCards.length) {
      setError("Enter at least one card number.");
      return;
    }

    if (enteredCards.some((value) => value.length !== 16)) {
      setError("Each card number must contain 16 digits.");
      return;
    }

    if (new Set(enteredCards).size !== enteredCards.length) {
      setError("The same card number cannot be entered more than once.");
      return;
    }

    if (enteredCards.some((value) => value === usedCardNumber)) {
      setError("One or more card codes have already been used.");
      return;
    }


    setError("");
    setCardReviewStatus("reviewing");
    setStep(3);
  };

  const cardState = (value: string) => {
    const normalized = normalizeCardNumber(value);
    return normalized === usedCardNumber
      ? "used"
      : normalized.length === 16
        ? "ready"
        : "incomplete";
  };

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col">
        {step === 2 ? (
          <div className="mb-3 flex items-center justify-center">
            <PaymentMethodMark method={method} />
          </div>
        ) : (
          <div className="mb-4">
            <PaymentMethodSelector
              method={method}
              open={openMethods}
              onToggle={onToggleMethods}
              onSelect={onSelectMethod}
            />
          </div>
        )}

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
                <p className="truncate text-[11px] font-medium text-slate-300">
                  {expired ? "Payment session expired" : "Payment expires in"}
                </p>
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
                    : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
                )}
              >
                {minutes}:{seconds}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex-1">
          {step === 1 ? (
            <CardDepositStepOne
              method={method}
              playerId={playerId}
              setPlayerId={setPlayerId}
              playerLookupType={playerLookupType}
              setPlayerLookupType={setPlayerLookupType}
              amount={amount}
              setAmount={setAmount}
              error={error}
              onContinue={continueToCards}
            />
          ) : null}

          {step === 2 ? (
            <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Total card amount</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                      {Number(amount).toFixed(2)} {method.currency}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {cardNumbers.filter((value) => normalizeCardNumber(value)).length} card
                    {cardNumbers.filter((value) => normalizeCardNumber(value)).length === 1 ? "" : "s"}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <FieldLabel>Card numbers</FieldLabel>
                    <span className="text-[10px] text-slate-500">16 digits · XXXX XXXX XXXX XXXX</span>
                  </div>

                  <div className="space-y-2">
                    {cardNumbers.map((value, index) => {
                      const state = cardState(value);
                      const isUsed = state === "used";

                      return (
                        <div key={index} className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <Input
                              value={value}
                              onChange={(event) => updateCard(index, event.target.value)}
                              placeholder="0000 0000 0000 0000"
                              title={index === 0 ? "First card number" : `Card number ${index + 1}`}
                              autoComplete="off"
                              maxLength={19}
                              className={cn(
                                "h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500",
                                isUsed && "border-red-400/50 bg-red-500/10",
                              )}
                            />
                            {isUsed ? (
                              <p className="mt-1 text-[10px] font-medium text-red-300">
                                This card code has already been used.
                              </p>
                            ) : null}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addCardInput}
                            title="Add another card"
                            className="size-12 shrink-0 border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                          >
                            <Plus className="size-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => deleteCardInput(index)}
                            disabled={index === 0}
                            title={index === 0 ? "The first card cannot be deleted" : "Delete card"}
                            className="size-12 shrink-0 border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    The first input is always required. As soon as you enter a card number, the next input is created automatically.
                  </p>
                </div>

                <div>
                  <FieldLabel>Card photo / OCR</FieldLabel>
                  <label
                    title="Upload card photo for OCR"
                    className={cn(
                      "flex min-h-48 cursor-pointer flex-col gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 p-2.5 transition-colors hover:border-slate-600 hover:bg-slate-800",
                      expired && "pointer-events-none opacity-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-700 text-slate-300">
                        <ScanText className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-slate-200">
                          {proofFile ? proofFile.name : "Upload card photo"}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-500">
                          OCR can recognize one or more card numbers from the photo
                        </span>
                      </span>
                      <Upload className="ml-auto size-4 shrink-0 text-slate-500" />
                    </div>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      title="Upload card photo"
                      onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      disabled={expired}
                    />

                    <div className="relative flex min-h-32 flex-1 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-900/60">
                      {proofFile ? (
                        <div className="relative h-full w-full">
                          <img
                            src={previewUrl}
                            alt="Uploaded card photo"
                            className={cn(
                              "max-h-52 w-full object-contain transition-all duration-300",
                              ocrStatus === "analyzing" && "brightness-[0.88]",
                            )}
                          />
                          <CardDepositOcrOverlay status={ocrStatus} />
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileImage className="mx-auto size-6 text-slate-500" />
                          <p className="mt-2 text-xs font-medium text-slate-300">Upload a photo of the cards</p>
                          <p className="mt-1 text-[10px] text-slate-500">AI OCR will read visible card numbers</p>
                        </div>
                      )}
                    </div>
                  </label>

                  {ocrStatus === "matched" && detectedCards.length ? (
                    <div className="mt-2 rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-3">
                      <div className="flex items-center gap-2">
                        <ScanText className="size-4 text-cyan-200" />
                        <div>
                          <p className="text-xs font-semibold text-cyan-100">
                            {detectedCards.length} cards detected
                          </p>
                          <p className="text-[10px] text-slate-500">
                            You can fill one card or all detected cards. Manual and OCR entries can be mixed; duplicate card numbers are ignored.
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          onClick={() => appendCards(detectedCards)}
                          title="Enter all detected cards"
                          className="h-10 flex-1 border border-cyan-300/30 bg-cyan-300/10 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15"
                        >
                          <ScanText className="size-3.5" />
                          Enter all detected cards
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendCards([detectedCards[0]])}
                          title="Enter one detected card"
                          className="h-10 flex-1 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          <Plus className="size-3.5" />
                          Enter one detected card
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={confirmCards}
                  disabled={expired || usedCardIndexes.length > 0}
                  title={\`Confirm \${method.name} card numbers\`}
                  className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="size-4" />
                  Confirm cards
                </Button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 text-center shadow-2xl sm:p-5">
              {cardReviewStatus === "reviewing" ? (
                <>
                  <div className="mb-3 flex justify-center">
                    <img
                      src="https://assets-v2.lottiefiles.com/a/32092c6a-1187-11ee-82df-37dd938d41eb/9rtrQDUjoJ.gif"
                      alt="Card deposit is being reviewed"
                      className="h-24 w-24 object-contain"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-base font-semibold text-white">Card deposit is being reviewed</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Player ID: {playerId} · {Number(amount).toFixed(2)} {method.currency}
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
                    Your card numbers were submitted for verification. The team will check the card codes before crediting the deposit.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden">
                      <iframe
                        src="https://lottiefiles.com/free-animation/check-jSOmPyr6eH"
                        title="Card deposit completed animation"
                        className="h-24 w-24 border-0"
                        scrolling="no"
                        loading="eager"
                      />
                    </div>
                  </div>
                  <p className="text-base font-semibold text-white">Deposit completed</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {cardNumbers.filter((value) => normalizeCardNumber(value)).length} card
                    {cardNumbers.filter((value) => normalizeCardNumber(value)).length === 1 ? "" : "s"} · {Number(amount).toFixed(2)} {method.currency}
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
                    The submitted card codes passed the front-end checks and the deposit is ready to be credited.
                  </p>
                </>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCardReviewStatus("reviewing")}
                  className="h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:bg-slate-800"
                >
                  Reviewing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCardReviewStatus("completed")}
                  className={cn(
                    "h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:bg-slate-800",
                    cardReviewStatus === "completed" && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
                  )}
                >
                  Completed
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
                className="mt-2 h-9 w-full text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Exit
              </Button>
            </section>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout
          <ExternalLink className="size-3" />
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
  Sparkles,
  ShieldAlert,
  Hash,
  UserRound,
  Mail,
  Plus,
  Trash2,
  Wifi,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { createDistributorReport } from "@/lib/distributor-reports";
import {
  CLIENT_PORTAL_FORMS_CHANGE_EVENT,
  getClientPortalFormForSlug,
  type ClientPortalForm,
} from "@/lib/client-portal-config";

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
  automatic?: boolean;
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
    id: "binance-pay",
    name: "Binance Pay",
    min: 1,
    max: 10000,
    currency: "USDT",
    logoClass: "bg-[#F0B90B] text-slate-950",
    note: "Binance Pay automatic checkout is not connected yet. Configure the provider API credentials and server-side payment verification before accepting real deposits.",
    automatic: true,
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

const PortalPaymentMethodsContext = React.createContext<PaymentMethod[]>(paymentMethods);
const PortalButtonLabelContext = React.createContext<string>("Do Deposit");
const PortalFormSlugContext = React.createContext<string | undefined>(undefined);
const PortalPreviewContext = React.createContext(false);

type PortalBuilderSettingsRuntime = {
  template?: "stripe" | "classic" | "minimal";
  buttonShape?: "pill" | "rounded" | "rectangle";
  colors?: { brand?: string; accent?: string };
  features?: {
    supervisorRating?: boolean;
    playerRating?: boolean;
    aiRecognition?: boolean;
    autoConfirm?: boolean;
  };
  configs?: {
    paymentMethods?: string[];
    methodDisplay?: "tabs" | "cards";
    playerIdMode?: "userId" | "email" | "both";
    presetAmounts?: number[];
    timerSeconds?: number;
    scheduleEnabled?: boolean;
    scheduleStart?: string;
    scheduleEnd?: string;
  };
  blocks?: Record<string, { label?: string; placeholder?: string; description?: string }>;
};

const PortalBuilderSettingsContext = React.createContext<PortalBuilderSettingsRuntime | null>(null);

function isPortalWithinSchedule(start?: string, end?: string) {
  if (!start || !end) return true;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) return true;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const first = startHour * 60 + startMinute;
  const last = endHour * 60 + endMinute;
  return first <= last ? current >= first && current <= last : current >= first || current <= last;
}

function normalizePortalMethodName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getMethodsForClientForm(form: ClientPortalForm) {
  const methods = paymentMethods.filter((method) =>
    form.methods.some((name) =>
      normalizePortalMethodName(name) === normalizePortalMethodName(method.name)
      || normalizePortalMethodName(name) === normalizePortalMethodName(method.id),
    ),
  );
  return methods.length ? methods : paymentMethods;
}

function PortalBrandHeader({ form }: { form: ClientPortalForm }) {
  const { appearance } = form;
  const builderSettings = React.useContext(PortalBuilderSettingsContext);
  return (
    <div className="mx-auto flex w-full items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ maxWidth: appearance.width === "wide" ? "72rem" : "48rem", color: appearance.theme === "dark" ? "#f8fafc" : "#0f172a", borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>
      <div className="flex min-w-0 items-center gap-3">
        {appearance.showLogo ? (
          appearance.logoUrl ? (
            <img src={appearance.logoUrl} alt={appearance.brandName + " logo"} className="size-9 shrink-0 rounded-lg object-contain" />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: builderSettings?.colors?.brand || appearance.primaryColor, color: appearance.theme === "dark" ? "#052e22" : "#ffffff" }}>{(appearance.brandName || "iP").slice(0, 2).toUpperCase()}</span>
          )
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{appearance.brandName || "Your brand"}</p>
          <p className="text-[10px]" style={{ color: appearance.theme === "dark" ? "#94a3b8" : "#64748b" }}>Secure checkout</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px]" style={{ borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0", color: appearance.primaryColor }}>
        <ShieldCheck className="size-3.5" /> Protected payment
      </div>
    </div>
  );
}

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
      ) : method.id === "binance-pay" ? (
        <span className="text-[10px] font-black tracking-tight">BNB</span>
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
  const availableMethods = React.useContext(PortalPaymentMethodsContext);
  const formSlug = React.useContext(PortalFormSlugContext);
  const portalPreview = React.useContext(PortalPreviewContext);
  const builderSettings = React.useContext(PortalBuilderSettingsContext);
  const methodDisplay = builderSettings?.configs?.methodDisplay ?? "cards";
  const methodBlock = builderSettings?.blocks?.paymentMethods;
  const selectorSearch = formSlug ? { form: formSlug, preview: portalPreview } : { preview: portalPreview };
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    dragging: false,
  });
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    const viewport = sliderRef.current;
    if (!viewport) return;
    const selected = viewport.querySelector<HTMLElement>(
      "[data-payment-method-id='" + method.id + "']",
    );
    if (!selected) return;

    const viewportRect = viewport.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const itemStart = selectedRect.left - viewportRect.left + viewport.scrollLeft;
    const itemEnd = itemStart + selectedRect.width;

    if (itemStart < viewport.scrollLeft) {
      viewport.scrollTo({ left: Math.max(0, itemStart - 8), behavior: "smooth" });
    } else if (itemEnd > viewport.scrollLeft + viewport.clientWidth) {
      viewport.scrollTo({
        left: itemEnd - viewport.clientWidth + 8,
        behavior: "smooth",
      });
    }
  }, [method.id]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const viewport = sliderRef.current;
    if (!viewport) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
      dragging: true,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const viewport = sliderRef.current;
    if (!viewport || !drag.dragging || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 5 && !drag.moved) {
      drag.moved = true;
      setIsDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail in a few embedded browser contexts.
      }
    }

    if (drag.moved) {
      event.preventDefault();
      viewport.scrollLeft = drag.startScrollLeft - delta;
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    drag.dragging = false;
    setIsDragging(false);
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore a release that happened automatically in the browser.
    }
  };

  const onPointerCancel = () => {
    dragRef.current.dragging = false;
    setIsDragging(false);
  };

  return (
    <div className="relative">
      {methodBlock?.label || methodBlock?.description ? (
        <div className="mb-2 px-1">
          {methodBlock.label ? <p className="text-xs font-medium text-slate-200">{methodBlock.label}</p> : null}
          {methodBlock.description ? <p className="mt-1 text-[11px] leading-4 text-slate-400">{methodBlock.description}</p> : null}
        </div>
      ) : null}
      <div className="flex min-w-0 items-center gap-1.5">
        <div
          ref={sliderRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className={cn(
            "min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          aria-label="Payment methods. Drag or swipe horizontally to browse."
        >
          <div className={methodDisplay === "tabs" ? "flex min-w-max items-stretch gap-1 px-1 py-2" : "flex min-w-max items-stretch gap-2 px-1 py-2"}>
            {availableMethods.map((item) => {
              const selected = item.id === method.id;

              return (
                <Link
                  key={item.id}
                  data-payment-method-id={item.id}
                  to="/portal/$method"
                  params={{ method: item.id }}
                  search={selectorSearch}
                  onClickCapture={(event) => {
                    if (dragRef.current.moved) {
                      event.preventDefault();
                      event.stopPropagation();
                      dragRef.current.moved = false;
                    }
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  onClick={() => onSelect(item)}
                  className={cn(
                    methodDisplay === "tabs"
                      ? "group relative mt-1 flex min-w-[104px] shrink-0 items-center gap-2 rounded-none border-b-2 px-3 py-2 transition-colors"
                      : "group relative mt-1 flex min-w-[104px] shrink-0 flex-col items-center gap-1.5 rounded-lg border px-2.5 pb-2 pt-2.5 transition-colors",
                    selected
                      ? (methodDisplay === "tabs" ? "border-emerald-300 bg-transparent" : "border-white/25 bg-slate-800/80")
                      : (methodDisplay === "tabs" ? "border-transparent bg-transparent hover:border-white/20" : "border-white/8 bg-slate-900/60 hover:border-white/15 hover:bg-slate-800/60"),
                  )}
                  aria-current={selected ? "page" : undefined}
                >
                  {item.automatic ? (
                    <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/40 bg-emerald-300 px-1.5 py-0.5 text-[8px] font-bold leading-none text-slate-950 shadow-sm">
                      Automatique
                    </span>
                  ) : null}
                  <PaymentMethodMark method={item} />
                  <span className="max-w-full truncate text-[10px] font-medium text-slate-200">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Show all payment methods"
          title="Show all payment methods"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-slate-900/80 text-slate-400 transition-colors hover:bg-slate-800"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {availableMethods.map((item) => (
              <Link
                key={item.id + "-menu"}
                to="/portal/$method"
                params={{ method: item.id }}
                  search={selectorSearch}
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
                {item.automatic ? (
                  <span className="ml-auto rounded-full bg-emerald-300 px-1.5 py-0.5 text-[8px] font-bold text-slate-950">
                    Auto
                  </span>
                ) : null}
              </Link>
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
  const builderSettings = React.useContext(PortalBuilderSettingsContext);
  const overrides = builderSettings?.blocks ?? {};
  const text = typeof children === "string" ? children.trim() : "";
  const blockKey =
    text === "Player ID" || text === "Username" ? "playerId"
      : text === "Email" || text === "Email address" ? "email"
      : text === "Deposit amount" ? "amount"
      : text === "Payment evidence" || text === "Upload transfer screenshot" ? "evidence"
      : text === "Transaction ID" ? "transactionId"
      : text === "Transfer number" ? "transferNumber"
      : null;
  const displayChildren = blockKey && overrides[blockKey]?.label ? overrides[blockKey]?.label : children;
  const description = blockKey ? overrides[blockKey]?.description?.trim() : "";

  return (
    <>
      <label className="mb-1.5 block text-xs font-medium text-slate-200">
        {displayChildren}
        {required ? <span className="ml-1 text-slate-500">*</span> : null}
      </label>
      {description ? <p className="mb-2 text-[11px] leading-4 text-slate-400">{description}</p> : null}
    </>
  );
}

const walletRecipientNumbers = ["22 345 678", "53 781 249", "29 614 832"];

const walletRecipientOwners: Record<string, string> = {
  "22 345 678": "Mohamed Trabelsi",
  "53 781 249": "Yassine Ben Amor",
  "29 614 832": "Amine Jlassi",
};


type DepositRequest = {
  id: string;
  playerId: string;
  playerLookupType: PlayerLookupType;
  methodId: string;
  methodName: string;
  amount: string;
  currency: string;
  createdAt: string;
  status: "open";
};

type PlayerRequestLookupStatus = "idle" | "checking" | "available" | "open";

const openDepositRequestsStorageKey = "paymine-open-deposit-requests-v1";

function normalizeRequestPlayerValue(value: string) {
  return value.trim().toLowerCase();
}

function readOpenDepositRequests(): DepositRequest[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(openDepositRequestsStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOpenDepositRequests(requests: DepositRequest[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      openDepositRequestsStorageKey,
      JSON.stringify(requests),
    );
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}

const trackingDemoRequests: Record<string, DepositRequest> = {
  "DEP-DEMO-0000000": {
    id: "DEP-DEMO-0000000",
    playerId: "0000000",
    playerLookupType: "playerId",
    methodId: "flouci",
    methodName: "Flouci",
    amount: "150.00",
    currency: "TND",
    createdAt: "2026-09-26T11:00:00.000Z",
    status: "open",
  },
  "DEP-MUIF4S1X": {
    id: "DEP-MUIF4S1X",
    playerId: "0000000",
    playerLookupType: "playerId",
    methodId: "flouci",
    methodName: "Flouci",
    amount: "150.00",
    currency: "TND",
    createdAt: "2026-09-26T11:05:00.000Z",
    status: "open",
  },
};

function getTrackingDemoDepositRequest(requestId: string) {
  return trackingDemoRequests[requestId] ?? null;
}

function findOpenDepositRequest(
  playerId: string,
  playerLookupType: PlayerLookupType,
) {
  const normalized = normalizeRequestPlayerValue(playerId);
  if (!normalized) return null;

  // Temporary design-preview trigger:
  // Player ID 0000000 always behaves as if an open deposit request exists.
  if (playerLookupType === "playerId" && normalized === "0000000") {
    return getTrackingDemoDepositRequest("DEP-DEMO-0000000");
  }

  return (
    readOpenDepositRequests()
      .filter(
        (request) =>
          request.status === "open" &&
          request.playerLookupType === playerLookupType &&
          normalizeRequestPlayerValue(request.playerId) === normalized,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

function createOpenDepositRequest({
  playerId,
  playerLookupType,
  method,
  amount,
}: {
  playerId: string;
  playerLookupType: PlayerLookupType;
  method: PaymentMethod;
  amount: string;
}) {
  const existing = findOpenDepositRequest(playerId, playerLookupType);
  if (existing) return existing;

  const request: DepositRequest = {
    id: "DEP-" + Date.now().toString(36).toUpperCase(),
    playerId: playerId.trim(),
    playerLookupType,
    methodId: method.id,
    methodName: method.name,
    amount,
    currency: method.currency,
    createdAt: new Date().toISOString(),
    status: "open",
  };

  writeOpenDepositRequests([request, ...readOpenDepositRequests()]);
  return request;
}

function usePlayerRequestLookup(
  playerId: string,
  playerLookupType: PlayerLookupType,
  refreshKey = 0,
) {
  const [status, setStatus] = React.useState<PlayerRequestLookupStatus>("idle");
  const [openRequest, setOpenRequest] = React.useState<DepositRequest | null>(null);

  React.useEffect(() => {
    const normalized = normalizeRequestPlayerValue(playerId);

    if (!normalized) {
      setStatus("idle");
      setOpenRequest(null);
      return;
    }

    setStatus("checking");
    setOpenRequest(null);

    const timer = window.setTimeout(() => {
      const request = findOpenDepositRequest(playerId, playerLookupType);
      setOpenRequest(request);
      setStatus(request ? "open" : "available");
    }, 450);

    return () => window.clearTimeout(timer);
  }, [playerId, playerLookupType, refreshKey]);

  return { status, openRequest };
}

function PlayerRequestStatusNote({
  status,
  openRequest,
}: {
  status: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
}) {
  if (status === "checking") {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <RefreshCw className="size-3.5 shrink-0 animate-spin" />
          Checking for an open deposit request...
        </div>
      </div>
    );
  }

  if (status === "open" && openRequest) {
    return (
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Clock3 className="mt-0.5 size-3.5 shrink-0 text-amber-200" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-amber-100">
              You already have an open deposit request.
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
              A new deposit cannot be started while request {openRequest.id} is still open.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="flex items-center gap-2 px-1 text-[10px] text-emerald-300">
        <CheckCircle2 className="size-3.5 shrink-0" />
        No open deposit request found. You can continue.
      </div>
    );
  }

  return null;
}

export function DepositRequestTrackingPage({
  request,
  onBack,
}: {
  request: DepositRequest;
  onBack: () => void;
}) {
  type TrackingStatus =
    | "reviewing"
    | "approved"
    | "received"
    | "correction"
    | "edited"
    | "expired";

  const [status, setStatus] = React.useState<TrackingStatus>("reviewing");
  const method =
    paymentMethods.find((item) => item.id === request.methodId) ??
    ({
      id: request.methodId,
      name: request.methodName,
      min: 1,
      max: 10000,
      currency: request.currency,
      logoClass: "bg-white",
      note: "",
    } satisfies PaymentMethod);

  const isCardMethod = isCardDepositMethod(method);
  const isEDinar = isEDinarMethod(method);
  const paymentFieldLabel = isCardMethod
    ? `${method.name} card number`
    : isEDinar
      ? "E-Dinar account number"
      : `${method.name} transfer number`;
  const currentPaymentValue = isCardMethod
    ? "1111 2222 3333 4444"
    : isEDinar
      ? "6034 2112 4567 8901"
      : walletRecipientNumbers[0];

  const [correctedPaymentValue, setCorrectedPaymentValue] = React.useState(currentPaymentValue);
  const [correctedAmount, setCorrectedAmount] = React.useState(request.amount);
  const [supervisorNote] = React.useState(
    "The payment details do not match the submitted proof. Please correct the highlighted details and submit the request again.",
  );
  const [postAction, setPostAction] = React.useState<"review" | "report" | null>(null);
  const [rating, setRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [reportReason, setReportReason] = React.useState("");
  const [reportDetails, setReportDetails] = React.useState("");
  const [reportSubmittedId, setReportSubmittedId] = React.useState<string | null>(null);

  const createdAt = new Date(request.createdAt);
  const formattedCreatedAt = Number.isNaN(createdAt.getTime())
    ? request.createdAt
    : createdAt.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  const correctionSubmit = () => {
    if (!correctedPaymentValue.trim()) return;

    const numericAmount = Number(correctedAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    setStatus("reviewing");
  };

  const statusTitle =
    status === "received"
      ? "Deposit completed"
      : status === "approved"
        ? "Deposit approved"
        : status === "correction"
          ? "Correction required"
          : status === "edited"
            ? "Payment details updated"
            : status === "expired"
              ? "Payment expired"
              : "Your deposit is being reviewed";

  const stages = [
    {
      title: "Request submitted",
      description:
        status === "correction"
          ? "The request was submitted, but the supervisor requires corrected payment details."
          : "Your deposit request is registered and linked to this payment session.",
      state: "done" as const,
      icon: CheckCircle2,
    },
    {
      title: "Payment verification",
      description:
        status === "correction"
          ? "Verification is paused until you submit the requested correction."
          : status === "edited"
            ? "The supervisor updated the payment details and the request is ready for another verification check."
            : isEDinar
              ? "Your E-Dinar payment is under review. Verification can take up to 8 hours."
              : "Your payment details and proof are being reviewed by the payment team.",
      state:
        status === "reviewing" || status === "correction" || status === "edited"
          ? "active"
          : status === "approved" || status === "received"
            ? "done"
            : "pending",
      icon: ShieldCheck,
    },
    {
      title: "Deposit credit",
      description:
        status === "received"
          ? "The transfer was received and the deposit can be credited to the player balance."
          : status === "approved"
            ? "The deposit is approved and waiting for the payment confirmation to complete."
            : status === "edited"
              ? "The updated payment details must be verified before the balance can be credited."
              : "The deposit will be credited to the player balance after verification.",
      state: status === "received" ? "done" : status === "approved" ? "active" : "pending",
      icon: CircleDollarSign,
    },
  ];

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft />
            Back
          </Button>

          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Deposit tracking
          </span>
        </div>

        <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
          {status === "reviewing" ? (
            <div className="mb-3 flex justify-center">
              <img
                src="https://assets-v2.lottiefiles.com/a/32092c6a-1187-11ee-82df-37dd938d41eb/9rtrQDUjoJ.gif"
                alt="Deposit is being reviewed"
                className="h-20 w-20 object-contain"
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
                className="h-20 w-20 border-0"
                scrolling="no"
                loading="eager"
              />
            </div>
          ) : null}

          <div className="mb-5 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40">
            <div className="flex items-center gap-3 border-b border-slate-700/70 px-4 py-3.5">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                  status === "received"
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                    : status === "correction"
                      ? "border-red-400/25 bg-red-500/10 text-red-300"
                      : status === "edited"
                        ? "border-blue-400/25 bg-blue-400/10 text-blue-200"
                        : "border-amber-400/25 bg-amber-400/10 text-amber-200",
                )}
              >
                {status === "received" ? (
                  <CheckCircle2 className="size-4.5" />
                ) : status === "correction" ? (
                  <Info className="size-4.5" />
                ) : (
                  <ShieldCheck className="size-4.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{statusTitle}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {request.methodName} deposit request
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Amount</p>
                <p className="mt-0.5 text-base font-semibold tabular-nums text-white">
                  {Number(request.amount).toFixed(2)}{" "}
                  <span className="text-[10px] font-medium text-slate-400">{request.currency}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 border-b border-slate-700/70 px-4 py-3 sm:border-r">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-900/70 text-slate-400">
                  <UserRound className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">
                    {request.playerLookupType === "playerId"
                      ? "Player ID"
                      : request.playerLookupType === "username"
                        ? "Username"
                        : "Email"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-200">{request.playerId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-b border-slate-700/70 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-900/70 text-slate-400">
                  <Clock3 className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">Created</p>
                  <p className="mt-0.5 truncate text-xs text-slate-300">{formattedCreatedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-3 sm:col-span-2">
                <div className="shrink-0 rounded-md border border-slate-700 bg-slate-900/70 p-1">
                  <PaymentMethodMark method={method} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">Payment method</p>
                  <p className="truncate text-xs font-medium text-white">{request.methodName}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">Request ID</p>
                  <p className="mt-0.5 max-w-[220px] truncate font-mono text-[10px] text-slate-400">{request.id}</p>
                </div>
              </div>
            </div>
          </div>

          {isEDinar ? (
            <div className="mb-5 rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-amber-100">
                <Clock3 className="size-3.5" />
                <span className="text-xs font-semibold">Verification window: up to 8 hours</span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                Your request remains open while the E-Dinar payment is being verified.
              </p>
            </div>
          ) : null}

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
                      {stage.state === "done" ? <Check className="size-4" /> : <Icon className="size-4" />}
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
                          <span className="ml-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
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
                <p className="text-sm font-medium text-white">Correction required by supervisor</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Update the requested payment details below. The corrected request will return to verification.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <FieldLabel>{paymentFieldLabel}</FieldLabel>
                  <Input
                    value={correctedPaymentValue}
                    onChange={(event) => setCorrectedPaymentValue(event.target.value)}
                    placeholder={`Enter the correct ${paymentFieldLabel.toLowerCase()}`}
                    title={`Correct ${paymentFieldLabel}`}
                    className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <FieldLabel>Payment amount</FieldLabel>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={correctedAmount}
                    onChange={(event) => setCorrectedAmount(event.target.value)}
                    placeholder="Enter the correct payment amount"
                    title="Correct payment amount"
                    className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <FieldLabel required={false}>Note from supervisor</FieldLabel>
                  <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-3 text-xs leading-relaxed text-slate-300">
                    {supervisorNote}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-[11px] text-slate-500">
                  Current payment detail: <span className="text-slate-300">{currentPaymentValue}</span>
                </div>

                <Button
                  type="button"
                  onClick={correctionSubmit}
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
                The supervisor changed this request directly. The updated payment details are shown below.
              </p>

              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Payment detail</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Previous: <span className="text-slate-300">{currentPaymentValue}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Updated: <span className="font-medium text-white">
                      {isCardMethod ? "5555 6666 7777 8888" : isEDinar ? "6034 2112 9988 7700" : walletRecipientNumbers[1]}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Payment amount</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Previous: <span className="text-slate-300">{Number(request.amount).toFixed(2)} {request.currency}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Updated: <span className="font-medium text-white">95.00 {request.currency}</span>
                  </p>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Supervisor note</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    Payment details updated by the supervisor and sent back for verification.
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
              {reportSubmittedId ? (
                <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-200">
                  Report submitted successfully. Ticket <span className="font-semibold">{reportSubmittedId}</span> is now available in Dashboard → Disagreements.
                </div>
              ) : null}
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
                      onClick={() => {
                        setReportSubmittedId(null);
                        setPostAction("report");
                      }}
                      className="h-10 border-slate-700 bg-slate-900/60 text-xs text-slate-200 hover:border-red-400/40 hover:bg-slate-800 hover:text-white"
                    >
                      <Info className="size-3.5" />
                      Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      title="Exit deposit flow"
                      onClick={onBack}
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
                        aria-label={value + " stars"}
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
                    {[
                      "Transfer not received",
                      "Request processing is taking too long",
                      "Incorrect payment amount",
                      "Supervisor requested incorrect payment details",
                      "Other issue",
                    ].map((reason) => (
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
                    onClick={() => {
                      const report = createDistributorReport({
                        distributorId: flouciSupervisor?.id ?? "unknown",
                        distributorName: flouciSupervisor?.name ?? "Supervisor",
                        distributorEmail: flouciSupervisor?.email ?? "",
                        distributorAvatarUrl: flouciSupervisor?.avatarUrl,
                        reporterReference: request.playerId,
                        reporterLookupType: request.playerLookupType,
                        depositRequestId: request.id,
                        paymentMethod: request.methodName,
                        amount: request.amount,
                        currency: request.currency,
                        reason: reportReason,
                        details: reportDetails.trim(),
                      });
                      setReportSubmittedId(report.id);
                      setPostAction(null);
                      setReportReason("");
                      setReportDetails("");
                    }}
                    className="mt-3 h-10 w-full bg-red-400 text-sm font-medium text-slate-950 hover:bg-red-300 disabled:opacity-40"
                  >
                    <Info className="size-4" />
                    Submit report
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <details className="mt-5 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-3">
            <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Flow preview / test states
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
              {([
                ["reviewing", "Reviewing"],
                ["approved", "Approved"],
                ["received", "Received"],
                ["correction", "Correction"],
                ["edited", "Supervisor edited"],
                ["expired", "Expired"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  onClick={() => setStatus(value)}
                  className={cn(
                    "h-9 border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:bg-slate-800",
                    status === value && "border-slate-500 bg-slate-800 text-white",
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </details>
        </section>

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout
          <ExternalLink className="size-3" />
        </div>
      </div>
    </main>
  );
}

export function DepositRequestTrackingRoute() {
  const [request, setRequest] = React.useState<DepositRequest | null>(null);

  React.useEffect(() => {
    const sync = () => {
      const requestId = new URLSearchParams(window.location.search).get("request");

      if (!requestId) {
        setRequest(readOpenDepositRequests()[0] ?? null);
        return;
      }

      const stored = readOpenDepositRequests().find((item) => item.id === requestId) ?? null;
      const demo = getTrackingDemoDepositRequest(requestId);

      // Tracking is one shared page for every deposit method.
      // A known local request wins; demo IDs keep direct preview URLs usable.
      setRequest(stored ?? demo);
    };

    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = useNavigate();
  const goBack = () => {
    if (request) {
      void navigate({
        to: "/portal/$method",
        params: { method: request.methodId },
      });
      return;
    }

    void navigate({ to: "/portal" });
  };

  if (!request) {
    return (
      <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl items-center justify-center">
          <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-white">Deposit request not found</p>
            <p className="mt-1 text-xs text-slate-500">
              Open the tracking page from an active deposit request.
            </p>
            <Button
              type="button"
              onClick={() => void navigate({ to: "/portal" })}
              className="mt-4 h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
            >
              Back to portal
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return <DepositRequestTrackingPage request={request} onBack={goBack} />;
}

const manualTransferMethodIds = new Set(["flouci", "d17", "kashy"]);

function isManualTransferMethod(method: PaymentMethod) {
  return manualTransferMethodIds.has(method.id);
}

function isEDinarMethod(method: PaymentMethod) {
  return method.id === "e-dinar";
}

const cardDepositMethodIds = new Set(["orange", "ooredoo", "tunisie-telecom"]);

function isCardDepositMethod(method: PaymentMethod) {
  return cardDepositMethodIds.has(method.id);
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
  playerRequestStatus,
  openRequest,
  onViewRequest,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const portalButtonLabel = React.useContext(PortalButtonLabelContext);
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const presets = portalBuilderSettings?.configs?.presetAmounts?.length ? portalBuilderSettings.configs.presetAmounts : [20, 50, 100, 200, 500, 1000];

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
                      ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your player ID")
                      : playerLookupType === "username"
                        ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your username")
                        : (portalBuilderSettings?.blocks?.email?.placeholder || "Enter your email address")
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

          <PlayerRequestStatusNote
            status={playerRequestStatus}
            openRequest={openRequest}
          />
          {playerRequestStatus === "open" && openRequest ? (
          <Link
            to="/portal/tracking-depoist"
            search={{ request: openRequest.id }}
            title="View your open deposit request"
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-amber-300 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-200"
          >
            <CircleDollarSign className="size-4" />
            <span>View Request</span>
          </Link>
        ) : (
          <Button
            type="submit"
            disabled={playerRequestStatus === "idle" || playerRequestStatus === "checking"}
            title={"Continue to " + method.name + " payment"}
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
          >
            <CircleDollarSign className="size-4" />
            <span>
              {portalButtonLabel}
              <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                Net Amount: {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"} TND
              </span>
            </span>
          </Button>
        )}
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
  const [reportSubmittedId, setReportSubmittedId] = React.useState<string | null>(null);

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
          {reportSubmittedId ? (
            <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-200">
              Report submitted successfully. Ticket <span className="font-semibold">{reportSubmittedId}</span> is now available in Dashboard → Disagreements.
            </div>
          ) : null}
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
                  onClick={() => {
                        setReportSubmittedId(null);
                        setPostAction("report");
                      }}
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
                onClick={() => {
                  const report = createDistributorReport({
                    distributorId: flouciSupervisor?.id ?? "unknown",
                    distributorName: flouciSupervisor?.name ?? "Supervisor",
                    distributorEmail: flouciSupervisor?.email ?? "",
                    distributorAvatarUrl: flouciSupervisor?.avatarUrl,
                    reporterReference: playerId,
                    reporterLookupType: playerLookupType,
                    paymentMethod: method.name,
                    amount,
                    currency: method.currency,
                    reason: reportReason,
                    details: reportDetails.trim(),
                  });
                  setReportSubmittedId(report.id);
                  setPostAction(null);
                  setReportReason("");
                  setReportDetails("");
                }}
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
  playerRequestStatus,
  openRequest,
  onViewRequest,
  onOpenTracking,
  onRequestCreated,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  onOpenTracking: () => void;
  onRequestCreated: () => DepositRequest;
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
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const [secondsLeft, setSecondsLeft] = React.useState(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
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
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
  }, [method.id]);

  React.useEffect(() => {
    if (!proofFile || portalBuilderSettings?.features?.aiRecognition === false) {
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
  }, [proofFile, method.id, portalBuilderSettings?.features?.aiRecognition]);

  React.useEffect(() => {
    if (step !== 2) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const continueToPayment = () => {
    if (playerRequestStatus !== "available") {
      setError(
        playerRequestStatus === "open"
          ? "You already have an open deposit request. View it before starting another deposit."
          : "Checking your player request. Please wait a moment and try again.",
      );
      return;
    }

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
    onRequestCreated();
    setDemoStatus("reviewing");
    setAiStatus("idle");
    setDetectedTransactionId("");
    setCorrectedTransferNumber(recipientNumber);
    setCorrectedAmount(amount);
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
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
    onOpenTracking();
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
              playerRequestStatus={playerRequestStatus}
              openRequest={openRequest}
              onViewRequest={onViewRequest}
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
type CardRecognitionStatus = "idle" | "checking" | "available" | "duplicate";

function normalizeCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

function formatCardNumber(value: string) {
  const digits = normalizeCardNumber(value);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

const usedCardNumber = "0000000000000000";

function recognizeRegisteredCard(cardNumber: string) {
  const normalized = normalizeCardNumber(cardNumber);
  if (normalized.length !== 16) return null;

  // Prototype registry: this value represents a card already registered in PayMine.
  // Replace this lookup with the real backend/API registry when persistence is connected.
  return normalized === usedCardNumber;
}


function CardRecognitionIndicator({
  status,
}: {
  status: CardRecognitionStatus | undefined;
}) {
  if (!status || status === "idle") return null;

  if (status === "checking") {
    return (
      <span
        className="pointer-events-none absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
        title="Checking card"
        aria-label="Checking card"
      >
        <span className="absolute inset-0 rounded-full border border-cyan-300/15" />
        <span className="absolute inset-0.5 rounded-full border border-transparent border-t-cyan-300/80 animate-spin" />
        <span className="absolute size-1.5 rounded-full bg-cyan-200/90 shadow-[0_0_9px_rgba(103,232,249,0.8)]" />
        <ScanText className="relative size-3.5 text-cyan-200" />
      </span>
    );
  }

  if (status === "available") {
    return (
      <span
        className="pointer-events-none absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
        title="Card allowed"
        aria-label="Card allowed"
      >
        <span className="absolute size-5 rounded-full bg-emerald-300/5 blur-[5px]" />
        <Sparkles className="relative size-4.5 text-emerald-300 drop-shadow-[0_0_7px_rgba(52,211,153,0.45)]" />
      </span>
    );
  }

  return (
    <span
      className="pointer-events-none absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
      title="Card already registered"
      aria-label="Card already registered"
    >
      <span className="absolute size-5 rounded-full bg-red-400/5 blur-[5px]" />
      <ShieldAlert className="relative size-4.5 text-red-300 drop-shadow-[0_0_7px_rgba(248,113,113,0.4)]" />
    </span>
  );
}

function CardDepositHelpAccordion({ method }: { method: PaymentMethod }) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  const items = [
    {
      id: "identity",
      title: "1. Enter your player information",
      description: "Choose Player ID, Username or Email, then enter the identifier linked to your gaming account.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Hash className="size-3.5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-200">Player account</span>
          </div>
          <div className="mt-3 flex h-9 items-center rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2.5 text-[10px] text-emerald-100">
            Player ID / Username / Email
          </div>
        </div>
      ),
    },
    {
      id: "cards",
      title: `2. Prepare your ${method.name} recharge cards`,
      description: `Use valid ${method.name} recharge cards whose combined value matches the total amount you entered.`,
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <PaymentMethodMark method={method} />
            <span className="text-[10px] font-medium text-slate-200">{method.name} recharge card</span>
          </div>
          <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.08em] text-slate-500">Card value</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-cyan-100">50 TND</p>
          </div>
        </div>
      ),
    },
    {
      id: "codes",
      title: "3. Enter the card numbers",
      description: "Enter each 16-digit card code. A new input appears automatically after you start filling the current one.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="space-y-2">
            <div className="flex h-8 items-center rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2.5 text-[10px] font-medium text-emerald-100">
              1111 2222 3333 4444
            </div>
            <div className="flex h-8 items-center rounded-md border border-slate-700 bg-slate-900/80 px-2.5 text-[10px] text-slate-500">
              0000 0000 0000 0000
            </div>
          </div>
          <p className="mt-2 text-[9px] text-slate-500">The first input cannot be deleted.</p>
        </div>
      ),
    },
    {
      id: "ocr",
      title: "4. Scan the cards with AI OCR",
      description: "Upload a clear photo and OCR can recognize one or multiple card numbers for faster entry.",
      visual: (
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
          <div className="relative overflow-hidden rounded-md border border-slate-700 bg-slate-900 p-3">
            <div className="space-y-2 opacity-80">
              <div className="h-2 w-24 rounded bg-slate-700" />
              <div className="h-5 w-full rounded border border-cyan-300/30 bg-cyan-300/5" />
              <div className="h-5 w-4/5 rounded border border-cyan-300/30 bg-cyan-300/5" />
            </div>
            <div className="absolute inset-x-2 top-1/2 h-px bg-cyan-200 shadow-[0_0_14px_3px_rgba(103,232,249,0.45)]" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 text-[9px] text-cyan-100">Enter all</span>
            <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[9px] text-slate-300">Enter one</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/45">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2.5">
        <Info className="size-3.5 text-slate-300" />
        <div>
          <p className="text-[11px] font-medium text-slate-200">How to complete {method.name} card deposit</p>
          <p className="text-[9px] text-slate-500">Open a step to see how the card entry and OCR process works.</p>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {items.map((item, index) => {
          const open = openItem === item.id;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setOpenItem((current) => (current === item.id ? null : item.id))}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-800/60"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                    open ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-800 text-slate-500",
                  )}
                >
                  {item.id === "ocr" ? <ScanText className="size-3" /> : index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[11px] font-medium", open ? "text-slate-100" : "text-slate-300")}>
                    {item.title}
                  </span>
                  {!open ? (
                    <span className="mt-0.5 block truncate text-[9px] text-slate-500">{item.description}</span>
                  ) : null}
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
                          You can combine manual card entry with OCR. Duplicate card numbers are ignored.
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
  );
}

function CardDepositStepOne({
  method,
  playerId,
  playerRequestStatus,
  openRequest,
  onViewRequest,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const portalButtonLabel = React.useContext(PortalButtonLabelContext);
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const presets = portalBuilderSettings?.configs?.presetAmounts?.length ? portalBuilderSettings.configs.presetAmounts : [10, 20, 50, 100, 200, 500];

  return (
    <>
      <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
      <form onSubmit={(event) => { event.preventDefault(); onContinue(); }} className="space-y-4">
        <div>
          <FieldLabel>
            {playerLookupType === "playerId" ? "Player ID" : playerLookupType === "username" ? "Username" : "Email"}
          </FieldLabel>

          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <Input
                type={playerLookupType === "email" ? "email" : "text"}
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                placeholder={
                  playerLookupType === "playerId"
                    ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your player ID")
                    : playerLookupType === "username"
                      ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your username")
                      : (portalBuilderSettings?.blocks?.email?.placeholder || "Enter your email address")
                }
                title={playerLookupType === "playerId" ? "Player ID" : playerLookupType === "username" ? "Username" : "Email"}
                autoComplete={playerLookupType === "email" ? "email" : "off"}
                className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="flex h-12 shrink-0 items-center gap-1.5" role="tablist" aria-label="Player identification type">
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
                      active ? "min-w-[92px] text-slate-100 shadow-[0_0_16px_rgba(255,255,255,0.04)]" : "w-12 hover:bg-slate-800 hover:text-slate-100",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-emerald-300" : "text-slate-400 group-hover:text-slate-200")} />
                    {active ? <span className="truncate text-xs font-medium">{label}</span> : null}
                  </button>
                );
              })}
            </div>
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

        <PlayerRequestStatusNote
          status={playerRequestStatus}
          openRequest={openRequest}
        />
        {playerRequestStatus === "open" && openRequest ? (
          <Link
            to="/portal/tracking-depoist"
            search={{ request: openRequest.id }}
            title="View your open deposit request"
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-amber-300 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-200"
          >
            <CircleDollarSign className="size-4" />
            <span>View Request</span>
          </Link>
        ) : (
          <Button
            type="submit"
            disabled={playerRequestStatus === "idle" || playerRequestStatus === "checking"}
            title={"Continue to " + method.name + " payment"}
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
          >
            <CircleDollarSign className="size-4" />
            <span>
              {portalButtonLabel}
              <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                Total Cards Value: {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"} {method.currency}
              </span>
            </span>
          </Button>
        )}
      </form>
    </section>

      <CardDepositHelpAccordion method={method} />
    </>
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


function CardDepositTimeline({
  method,
  playerId,
  amount,
  status,
  cardCount,
}: {
  method: PaymentMethod;
  playerId: string;
  amount: string;
  status: "reviewing" | "completed";
  cardCount: number;
}) {
  const completed = status === "completed";

  const stages = [
    {
      title: "Card submission",
      description: "Your card numbers were received and the deposit request is now in the verification queue.",
      state: "done" as const,
      icon: CheckCircle2,
    },
    {
      title: "Card validation",
      description: completed
        ? "The submitted card codes passed the current validation checks."
        : "The team is validating the submitted card codes and their usage status.",
      state: completed ? "done" as const : "active" as const,
      icon: ShieldCheck,
    },
    {
      title: "Deposit credit",
      description: completed
        ? "The deposit is ready to be credited to the player balance."
        : "The balance will be credited after the card validation is completed.",
      state: completed ? "done" as const : "pending" as const,
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
      <div className="mb-3 flex justify-center">
        {completed ? (
          <iframe
            src="https://lottiefiles.com/free-animation/check-jSOmPyr6eH"
            title="Card deposit completed animation"
            className="h-24 w-24 border-0"
            scrolling="no"
            loading="eager"
          />
        ) : (
          <img
            src="https://assets-v2.lottiefiles.com/a/32092c6a-1187-11ee-82df-37dd938d41eb/9rtrQDUjoJ.gif"
            alt="Card deposit is being reviewed"
            className="h-24 w-24 object-contain"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="mb-5 text-center">
        <p className="text-base font-semibold text-white">
          {completed ? "Deposit completed" : "Card deposit is being reviewed"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {playerId} · {Number(amount).toFixed(2)} {method.currency} · {cardCount} card{cardCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="relative pl-1">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;

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
                        : "border-slate-700 bg-slate-800 text-slate-500",
                  )}
                >
                  {stage.state === "done" ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>

                <div className="min-w-0 pt-0.5">
                  <p className={cn("text-sm font-medium", stage.state === "pending" ? "text-slate-500" : "text-white")}>
                    {stage.title}
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
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{stage.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CardDepositFlow({
  method,
  playerRequestStatus,
  openRequest,
  onViewRequest,
  onOpenTracking,
  onRequestCreated,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  onOpenTracking: () => void;
  onRequestCreated: () => DepositRequest;
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
  const [cardRecognition, setCardRecognition] = React.useState<Record<number, CardRecognitionStatus>>({});
  const recognitionTimers = React.useRef<Record<number, number>>({});
  const recognitionKeys = React.useRef<Record<number, string>>({});
  const [cardReviewStatus, setCardReviewStatus] = React.useState<"reviewing" | "completed">("reviewing");
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const [secondsLeft, setSecondsLeft] = React.useState(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);

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

  React.useEffect(() => {
    Object.values(recognitionTimers.current).forEach((timer) => window.clearTimeout(timer));
    recognitionTimers.current = {};
    recognitionKeys.current = {};

    setStep(1);
    setError("");
    setCardNumbers([""]);
    setProofFile(null);
    setOcrStatus("idle");
    setDetectedCards([]);
    setCardRecognition({});
    setCardReviewStatus("reviewing");
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);

    return () => {
      Object.values(recognitionTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, [method.id]);

  React.useEffect(() => {
    if (!proofFile || portalBuilderSettings?.features?.aiRecognition === false) {
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
  }, [proofFile, portalBuilderSettings?.features?.aiRecognition]);

  React.useEffect(() => {
    if (step !== 2) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const usedCardIndexes = React.useMemo(
    () => cardNumbers
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
      const existing = new Set(current.map((value) => normalizeCardNumber(value)).filter(Boolean));
      const next = [...current];
      let insertAt = next.findIndex((value) => !normalizeCardNumber(value));
      if (insertAt < 0) insertAt = next.length;

      for (const value of normalizedIncoming) {
        const normalized = normalizeCardNumber(value);
        if (!normalized || existing.has(normalized)) continue;
        if (insertAt >= next.length) next.push("");
        next[insertAt] = formatCardNumber(normalized);
        existing.add(normalized);
        insertAt += 1;
      }

      if (normalizeCardNumber(next[next.length - 1])) next.push("");
      return next;
    });
  };

  const updateCard = (index: number, value: string) => {
    const formatted = formatCardNumber(value);
    const normalized = normalizeCardNumber(formatted);

    const previousTimer = recognitionTimers.current[index];
    if (previousTimer) {
      window.clearTimeout(previousTimer);
      delete recognitionTimers.current[index];
    }

    recognitionKeys.current[index] = normalized;

    setCardRecognition((current) => ({
      ...current,
      [index]: normalized.length === 16 ? "checking" : "idle",
    }));

    if (normalized.length === 16) {
      recognitionTimers.current[index] = window.setTimeout(() => {
        // Ignore an old lookup result if the player has edited this input.
        if (recognitionKeys.current[index] !== normalized) return;

        const registered = recognizeRegisteredCard(normalized);

        setCardRecognition((current) => ({
          ...current,
          [index]: registered ? "duplicate" : "available",
        }));

        delete recognitionTimers.current[index];
      }, 1350);
    }

    setCardNumbers((current) => {
      const next = [...current];
      next[index] = formatted;
      if (formatted && normalizeCardNumber(next[next.length - 1])) next.push("");
      return next;
    });
  };

  const addCardInput = () => setCardNumbers((current) => [...current, ""]);

  const deleteCardInput = (index: number) => {
    if (index === 0) return;
    setCardNumbers((current) =>
      current.length <= 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  const continueToCards = () => {
    if (playerRequestStatus !== "available") {
      setError(
        playerRequestStatus === "open"
          ? "You already have an open deposit request. View it before starting another deposit."
          : "Checking your player request. Please wait a moment and try again.",
      );
      return;
    }

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
        "Total card amount must be between " +
          method.min.toLocaleString("en-US") +
          " and " +
          method.max.toLocaleString("en-US") +
          " " +
          method.currency +
          ".",
      );
      return;
    }

    setError("");
    onRequestCreated();
    setCardNumbers([""]);
    setProofFile(null);
    setOcrStatus("idle");
    setDetectedCards([]);
    setCardReviewStatus("reviewing");
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
    setStep(2);
  };

  const confirmCards = () => {
    const firstCard = normalizeCardNumber(cardNumbers[0] ?? "");
    const enteredCards = cardNumbers.map(normalizeCardNumber).filter(Boolean);

    if (expired) {
      setError("This payment session has expired. Go back and start a new deposit.");
      setStep(3);
      return;
    }

    if (!firstCard) {
      setError("Enter the first card number.");
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
    onOpenTracking();
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
          <div className="mb-4 flex items-center justify-center">
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
              expired ? "border-red-400/30 bg-red-500/5" : "border-emerald-400/20 bg-slate-900/70",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md border",
                expired ? "border-red-400/30 bg-red-500/10 text-red-300" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
              )}>
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
              <div className={cn(
                "shrink-0 rounded-md border px-2.5 py-1 text-sm font-semibold tabular-nums tracking-[0.08em]",
                expired ? "border-red-400/30 bg-red-500/10 text-red-300" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
              )}>
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
              playerRequestStatus={playerRequestStatus}
              openRequest={openRequest}
              onViewRequest={onViewRequest}
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
                    {cardNumbers.filter((value) => normalizeCardNumber(value)).length} cards entered
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <FieldLabel>Card numbers</FieldLabel>
                    <span className="text-[10px] text-slate-500">16 digits · XXXX XXXX XXXX XXXX</span>
                  </div>

                  <div className="space-y-2">
                    {cardNumbers.map((value, index) => {
                      const isUsed = cardRecognition[index] === "duplicate";

                      return (
                        <div key={index} className="flex items-start gap-2">
                          <div className="relative min-w-0 flex-1">
                            <Input
                              value={value}
                              onChange={(event) => updateCard(index, event.target.value)}
                              placeholder="0000 0000 0000 0000"
                              title={index === 0 ? "First card number" : "Card number " + (index + 1)}
                              autoComplete="off"
                              maxLength={19}
                              className={cn(
                                "h-12 border-slate-700 bg-slate-700/50 px-3 pr-11 text-sm text-slate-100 placeholder:text-slate-500",
                                cardRecognition[index] === "checking" && "border-cyan-300/40 bg-slate-700/60",
                                cardRecognition[index] === "available" && "border-emerald-400/45 bg-emerald-400/5 focus-visible:border-emerald-400/60",
                                cardRecognition[index] === "duplicate" && "border-red-400/60 bg-red-500/10",
                              )}
                            />
                            <CardRecognitionIndicator status={cardRecognition[index]} />
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
                    Enter exactly 16 digits. The AI recognizer checks the card against registered cards before submission.
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
                          Optional · OCR can recognize one or more card numbers from the photo
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
                          <p className="text-xs font-semibold text-cyan-100">{detectedCards.length} cards detected</p>
                          <p className="text-[10px] text-slate-500">
                            Use one or all detected cards. Manual and OCR entries can be mixed; duplicate numbers are ignored.
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
                  title={"Confirm " + method.name + " card numbers"}
                  className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="size-4" />
                  Confirm cards
                </Button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <CardDepositTimeline
              method={method}
              playerId={playerId}
              amount={amount}
              status={cardReviewStatus}
              cardCount={cardNumbers.filter((value) => normalizeCardNumber(value)).length}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout
          <ExternalLink className="size-3" />
        </div>
      </div>
    </main>
  );
}


function EDinarStepOne({
  method,
  playerId,
  playerRequestStatus,
  openRequest,
  onViewRequest,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  playerLookupType: PlayerLookupType;
  setPlayerLookupType: React.Dispatch<React.SetStateAction<PlayerLookupType>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  onContinue: () => void;
}) {
  const portalButtonLabel = React.useContext(PortalButtonLabelContext);
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const presets = portalBuilderSettings?.configs?.presetAmounts?.length ? portalBuilderSettings.configs.presetAmounts : [20, 50, 100, 200, 500, 1000];

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
                    ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your player ID")
                    : playerLookupType === "username"
                      ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your username")
                      : (portalBuilderSettings?.blocks?.email?.placeholder || "Enter your email address")
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
            {method.min.toLocaleString("en-US")} - {method.max.toLocaleString("en-US")} {method.currency}
          </span>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <PlayerRequestStatusNote
          status={playerRequestStatus}
          openRequest={openRequest}
        />
        {playerRequestStatus === "open" && openRequest ? (
          <Link
            to="/portal/tracking-depoist"
            search={{ request: openRequest.id }}
            title="View your open deposit request"
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-amber-300 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-200"
          >
            <CircleDollarSign className="size-4" />
            <span>View Request</span>
          </Link>
        ) : (
          <Button
            type="submit"
            disabled={playerRequestStatus === "idle" || playerRequestStatus === "checking"}
            title={"Continue to " + method.name + " payment"}
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
          >
            <CircleDollarSign className="size-4" />
            <span>
              {portalButtonLabel}
              <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                Net Amount: {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"} TND
              </span>
            </span>
          </Button>
        )}
      </form>
    </section>
  );
}

function EDinarCardPreview() {
  const cardHolder = "MOHAMED TRABELSI";

  return (
    <div className="relative h-52 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-2xl sm:h-56">
      <div
        className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="flex items-start justify-between">
          <img
            src="https://i0.wp.com/learning.symphony.tn/wp-content/uploads/2018/07/e-dinar.png?ssl=1"
            alt="e-Dinar"
            className="h-9 w-auto max-w-[120px] object-contain"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/72/MasterCard_early_1990s_logo.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original"
            alt="Mastercard"
            className="h-9 w-auto max-w-[72px] rounded-sm object-contain"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex overflow-hidden rounded-lg bg-slate-700/90">
          <Input
            readOnly
            value="6034 2112 4567 8901"
            title="E-Dinar card number"
            className="h-14 flex-1 border-0 bg-transparent px-3 font-mono text-lg font-semibold tracking-[0.1em] text-slate-100 shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard?.writeText("6034211245678901")}
            title="Copy E-Dinar card number"
            className="mr-1 my-1 size-12 rounded-md text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <Copy className="size-4.5" />
          </Button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.12em] text-primary-foreground/60">
              Card holder
            </span>
            <span className="text-xs font-medium uppercase tracking-wide">{cardHolder}</span>
          </div>
          <span className="text-xs tabular-nums">09/28</span>
        </div>
      </div>
    </div>
  );
}

function EDinarStepTwo({
  method,
  playerId,
  amount,
  secondsLeft,
  transactionId,
  setTransactionId,
  proofFile,
  setProofFile,
  aiStatus,
  detectedTransactionId,
  onUseDetectedTransactionId,
  error,
  onConfirm,
}: {
  method: PaymentMethod;
  playerId: string;
  amount: string;
  secondsLeft: number;
  transactionId: string;
  setTransactionId: React.Dispatch<React.SetStateAction<string>>;
  proofFile: File | null;
  setProofFile: React.Dispatch<React.SetStateAction<File | null>>;
  aiStatus: FlouciAiStatus;
  detectedTransactionId: string;
  onUseDetectedTransactionId: () => void;
  error: string;
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProofFile(event.target.files?.[0] ?? null);
  };

  return (
    <>
      <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
        <div className="space-y-4">
          <div className="flex justify-center">
            <EDinarCardPreview />
          </div>

          <div>
            <FieldLabel>Transaction ID</FieldLabel>
            <div className="flex items-stretch gap-2">
              <Input
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Enter your E-Dinar transaction ID"
                title="E-Dinar transaction ID"
                autoComplete="off"
                disabled={expired}
                className="h-12 border-slate-700 bg-slate-700/50 px-3 text-sm text-slate-100 placeholder:text-slate-500"
              />

              {proofFile && aiStatus === "matched" && !transactionId.trim() && detectedTransactionId ? (
                <Button
                  type="button"
                  onClick={onUseDetectedTransactionId}
                  disabled={expired}
                  title="Use the transaction ID detected by AI OCR"
                  className="group relative h-12 shrink-0 overflow-hidden rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)] transition-all hover:border-cyan-200/60 hover:bg-cyan-300/15"
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
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/5 px-3 py-2.5">
                <ScanText className="mt-0.5 size-3.5 shrink-0 text-cyan-200" />
                <p className="text-[11px] leading-relaxed text-cyan-100/90">
                  <span className="font-semibold text-cyan-100">AI OCR detected the transaction ID from your payment photo.</span>{" "}
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
                    JPG, PNG or WEBP · photo of the completed E-Dinar payment
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
                    alt="Uploaded E-Dinar payment"
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
                    <p className="mt-1 text-[10px] text-slate-500">AI OCR will inspect the visible payment details</p>
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-slate-300">
            <p className="flex gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
              Pay the exact amount of {Number(amount).toFixed(2)} {method.currency} using the E-Dinar card shown above.
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
            title="Confirm E-Dinar payment"
            className="h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Confirm payment
          </Button>
        </div>
      </section>

      <div className="mt-3 px-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
        <p>
          After you confirm, your E-Dinar payment will stay under verification for up to 8 hours.
        </p>
      </div>
    </>
  );
}

function EDinarWaitingTimeline({
  method,
  playerId,
  playerLookupType,
  amount,
  transactionId,
}: {
  method: PaymentMethod;
  playerId: string;
  playerLookupType: PlayerLookupType;
  amount: string;
  transactionId: string;
}) {
  const stages = [
    {
      title: "Payment submitted",
      description: "Your E-Dinar payment proof and transaction reference were submitted successfully.",
      icon: CheckCircle2,
      state: "done",
    },
    {
      title: "E-Dinar verification",
      description: "The payment is being reviewed. Verification can take up to 8 hours.",
      icon: ShieldCheck,
      state: "active",
    },
    {
      title: "Deposit credit",
      description: "After verification, the deposit amount will be credited to your player balance.",
      icon: CircleDollarSign,
      state: "pending",
    },
  ] as const;

  return (
    <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
      <div className="mb-3 flex justify-center">
        <img
          src="https://assets-v2.lottiefiles.com/a/32092c6a-1187-11ee-82df-37dd938d41eb/9rtrQDUjoJ.gif"
          alt="E-Dinar payment is being reviewed"
          className="h-24 w-24 object-contain"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="mb-5 text-center">
        <p className="text-base font-semibold text-white">E-Dinar payment is being reviewed</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {playerLookupType === "playerId"
            ? "Player ID"
            : playerLookupType === "username"
              ? "Username"
              : "Email"}
          : {playerId} · {Number(amount).toFixed(2)} {method.currency}
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2.5">
        <div className="flex items-center gap-2 text-amber-100">
          <Clock3 className="size-3.5" />
          <span className="text-xs font-semibold">Verification window: up to 8 hours</span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
          Transaction ID: <span className="text-slate-300">{transactionId}</span>
        </p>
      </div>

      <div className="relative pl-1">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;

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
                    {stage.title}
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
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{stage.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EDinarDepositFlow({
  method,
  playerRequestStatus,
  openRequest,
  onViewRequest,
  onOpenTracking,
  onRequestCreated,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
  onViewRequest: (request: DepositRequest) => void;
  onOpenTracking: () => void;
  onRequestCreated: () => DepositRequest;
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
  const [transactionId, setTransactionId] = React.useState("");
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [aiStatus, setAiStatus] = React.useState<FlouciAiStatus>("idle");
  const [detectedTransactionId, setDetectedTransactionId] = React.useState("");
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const [secondsLeft, setSecondsLeft] = React.useState(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft <= 0;

  React.useEffect(() => {
    setStep(1);
    setError("");
    setTransactionId("");
    setProofFile(null);
    setAiStatus("idle");
    setDetectedTransactionId("");
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
  }, [method.id]);

  React.useEffect(() => {
    if (!proofFile || portalBuilderSettings?.features?.aiRecognition === false) {
      setAiStatus("idle");
      setDetectedTransactionId("");
      return;
    }

    setAiStatus("analyzing");
    setDetectedTransactionId("");

    const timer = window.setTimeout(() => {
      setAiStatus("matched");
      setDetectedTransactionId("ED-4289176035");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [proofFile, portalBuilderSettings?.features?.aiRecognition]);

  React.useEffect(() => {
    if (step !== 2) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const continueToPayment = () => {
    if (playerRequestStatus !== "available") {
      setError(
        playerRequestStatus === "open"
          ? "You already have an open deposit request. View it before starting another deposit."
          : "Checking your player request. Please wait a moment and try again.",
      );
      return;
    }

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
        "Amount must be between " +
          method.min.toLocaleString("en-US") +
          " and " +
          method.max.toLocaleString("en-US") +
          " " +
          method.currency +
          ".",
      );
      return;
    }

    setError("");
    onRequestCreated();
    setAiStatus("idle");
    setDetectedTransactionId("");
    setSecondsLeft(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);
    setStep(2);
  };

  const confirmPayment = () => {
    if (expired) {
      setError("This payment session has expired. Go back and start a new deposit.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Enter the E-Dinar transaction ID.");
      return;
    }

    if (!proofFile) {
      setError("Upload your payment proof before confirming.");
      return;
    }

    setError("");
    onOpenTracking();
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
                    : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
                )}
              >
                {minutes}:{seconds}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mb-4 flex items-center justify-center">
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

        <div className="flex-1">
          {step === 1 ? (
            <EDinarStepOne
              method={method}
              playerId={playerId}
              playerRequestStatus={playerRequestStatus}
              openRequest={openRequest}
              onViewRequest={onViewRequest}
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
            <EDinarStepTwo
              method={method}
              playerId={playerId}
              amount={amount}
              secondsLeft={secondsLeft}
              transactionId={transactionId}
              setTransactionId={setTransactionId}
              proofFile={proofFile}
              setProofFile={setProofFile}
              aiStatus={aiStatus}
              detectedTransactionId={detectedTransactionId}
              onUseDetectedTransactionId={() => setTransactionId(detectedTransactionId)}
              error={error}
              onConfirm={confirmPayment}
            />
          ) : null}

          {step === 3 ? (
            <EDinarWaitingTimeline
              method={method}
              playerId={playerId}
              playerLookupType={playerLookupType}
              amount={amount}
              transactionId={transactionId}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout
          <ExternalLink className="size-3" />
        </div>
      </div>
    </main>
  );
}

function BinancePayFlow({
  method,
  playerRequestStatus,
  openRequest,
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
  playerRequestStatus: PlayerRequestLookupStatus;
  openRequest: DepositRequest | null;
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
  const [step, setStep] = React.useState<1 | 2>(1);
  const [error, setError] = React.useState("");
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const presets = portalBuilderSettings?.configs?.presetAmounts?.length ? portalBuilderSettings.configs.presetAmounts : [10, 20, 50, 100, 200, 500];

  React.useEffect(() => {
    setStep(1);
    setError("");
  }, [method.id]);

  const continueToCheckout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (playerRequestStatus !== "available") {
      setError(
        playerRequestStatus === "open"
          ? "You already have an open deposit request. View it before starting another deposit."
          : "Checking your player request. Please wait a moment and try again.",
      );
      return;
    }

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
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < method.min ||
      numericAmount > method.max
    ) {
      setError(
        "Amount must be between " +
          method.min.toLocaleString("en-US") +
          " and " +
          method.max.toLocaleString("en-US") +
          " " +
          method.currency +
          ".",
      );
      return;
    }

    setError("");
    setStep(2);
  };

  const formattedAmount =
    Number(amount) > 0 ? Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) : "0.00";

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col">
        {step === 1 ? (
          <>
            <div className="mb-4">
              <PaymentMethodSelector
                method={method}
                open={openMethods}
                onToggle={onToggleMethods}
                onSelect={onSelectMethod}
              />
            </div>

            <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-700/80 pb-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F0B90B] text-slate-950">
                  <span className="text-sm font-black">B</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Binance Pay</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Enter your player details and deposit amount
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[9px] font-semibold text-emerald-200">
                  Automatic
                </span>
              </div>

              <form onSubmit={continueToCheckout} className="space-y-4">
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
                        onChange={(event) => {
                          setPlayerId(event.target.value);
                          setError("");
                        }}
                        placeholder={
                          playerLookupType === "playerId"
                            ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your player ID")
                            : playerLookupType === "username"
                              ? (portalBuilderSettings?.blocks?.playerId?.placeholder || "Enter your username")
                              : (portalBuilderSettings?.blocks?.email?.placeholder || "Enter your email address")
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
                              setError("");
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
                </div>

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
                      className="h-12 border-0 bg-transparent p-0 text-sm text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:ring-0"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(String(preset));
                          setError("");
                        }}
                        title="Select preset deposit amount"
                        className={cn(
                          "rounded-md border px-2.5 py-2 text-xs font-medium tabular-nums transition-colors",
                          Number(amount) === preset
                            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                            : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800",
                        )}
                      >
                        {preset} {method.currency}
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

                <PlayerRequestStatusNote
                  status={playerRequestStatus}
                  openRequest={openRequest}
                />

                {playerRequestStatus === "open" && openRequest ? (
                  <Link
                    to="/portal/tracking-depoist"
                    search={{ request: openRequest.id }}
                    title="View your open deposit request"
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-amber-300 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-200"
                  >
                    <CircleDollarSign className="size-4" />
                    <span>View Request</span>
                  </Link>
                ) : (
                  <Button
                    type="submit"
                    disabled={playerRequestStatus === "idle" || playerRequestStatus === "checking"}
                    title="Continue to Binance Pay checkout preview"
                    className="h-10 w-full rounded-md bg-[#F0B90B] text-sm font-semibold text-slate-950 hover:bg-[#F8D33A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to Binance Pay
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </form>
            </section>

            <p className="mt-3 px-1 text-xs leading-relaxed text-slate-400">
              Choose the player identifier linked to your gaming account. The amount is shown in USDT.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="px-0 text-slate-300 hover:bg-transparent hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to deposit
              </Button>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-100">
                Checkout preview
              </span>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-700/80 px-4 py-4 sm:px-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F0B90B] text-slate-950">
                  <span className="text-base font-black">B</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Binance Pay</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Merchant payment page</p>
                </div>
                <ShieldCheck className="size-5 text-emerald-300" />
              </div>

              <div className="px-4 py-5 sm:px-5">
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-400">Pay with Binance Pay</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {formattedAmount} <span className="text-base font-medium text-slate-400">{method.currency}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Deposit to your player account</p>
                </div>

                <div className="mt-5 rounded-xl bg-white p-4 text-slate-900">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-[#F0B90B]/15 text-slate-900">
                      <QrCode className="size-12" strokeWidth={1.5} />
                    </div>
                    <p className="mt-3 text-sm font-semibold">Payment QR code unavailable</p>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                      A real checkout QR code will be provided by Binance after the merchant API is connected.
                    </p>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-slate-700/80 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between gap-4 px-3 py-3">
                    <span className="text-xs text-slate-400">Merchant</span>
                    <span className="text-xs font-medium text-slate-100">iPayCash</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-3">
                    <span className="text-xs text-slate-400">
                      {playerLookupType === "playerId"
                        ? "Player ID"
                        : playerLookupType === "username"
                          ? "Username"
                          : "Email"}
                    </span>
                    <span className="max-w-[60%] truncate text-xs font-medium text-slate-100">
                      {playerId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-3">
                    <span className="text-xs text-slate-400">Payment method</span>
                    <span className="text-xs font-medium text-slate-100">Binance Pay</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-3">
                    <span className="text-xs text-slate-400">Order status</span>
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-medium text-amber-100">
                      Awaiting API connection
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/25 bg-amber-300/5 px-3 py-2.5">
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-200" />
                  <p className="text-[11px] leading-relaxed text-amber-100/90">
                    Preview only. Binance Pay is not connected yet, so no payment order was created and no funds have been requested.
                  </p>
                </div>

                <Button
                  type="button"
                  disabled
                  title="Connect Binance Pay server-side before enabling checkout"
                  className="mt-4 h-11 w-full rounded-lg bg-[#F0B90B] text-sm font-semibold text-slate-950 opacity-60"
                >
                  Binance Pay is not connected
                </Button>
              </div>
            </section>
          </>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <ShieldCheck className="size-3.5" />
          Secure checkout design preview
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
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const [secondsLeft, setSecondsLeft] = React.useState(portalBuilderSettings?.configs?.timerSeconds ?? 15 * 60);

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

export function CustomerPortal({
  initialMethodId,
  formSlug,
  preview = false,
}: {
  initialMethodId?: string;
  formSlug?: string;
  preview?: boolean;
} = {}) {
  const [clientForm, setClientForm] = React.useState<ClientPortalForm | null>(() => getClientPortalFormForSlug(formSlug ?? initialMethodId, preview));
  const availableMethods = React.useMemo(
    () => clientForm ? getMethodsForClientForm(clientForm) : [],
    [clientForm?.methods],
  );

  React.useEffect(() => {
    const refresh = () => setClientForm(getClientPortalFormForSlug(formSlug ?? initialMethodId, preview));
    window.addEventListener(CLIENT_PORTAL_FORMS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CLIENT_PORTAL_FORMS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [initialMethodId, formSlug, preview]);

  if (!clientForm) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-5 py-10 text-slate-100">
        <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
          <ShieldAlert className="mx-auto size-8 text-slate-400" />
          <h1 className="mt-4 text-lg font-semibold">Checkout unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">This checkout form is not published or the link is no longer active. Please contact the merchant for a valid payment link.</p>
        </section>
      </main>
    );
  }

  const builderSettings = (clientForm as ClientPortalForm & { builder?: PortalBuilderSettingsRuntime }).builder ?? null;
  if (builderSettings?.configs?.scheduleEnabled && !isPortalWithinSchedule(builderSettings.configs.scheduleStart, builderSettings.configs.scheduleEnd)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-5 py-10 text-slate-100">
        <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
          <Clock3 className="mx-auto size-8 text-slate-400" />
          <h1 className="mt-4 text-lg font-semibold">Deposits are currently unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">This checkout is active from {builderSettings.configs.scheduleStart} to {builderSettings.configs.scheduleEnd} in your current local time.</p>
        </section>
      </main>
    );
  }

  const style = {
    "--portal-page-background": clientForm.appearance.backgroundColor,
    "--portal-surface": clientForm.appearance.surfaceColor,
    "--portal-accent": clientForm.appearance.primaryColor,
    "--portal-border": clientForm.appearance.theme === "dark" ? "#334155" : "#e2e8f0",
    "--portal-radius": clientForm.appearance.radius === "small" ? "8px" : clientForm.appearance.radius === "large" ? "22px" : "14px",
    "--portal-content-width": clientForm.appearance.width === "wide" ? "72rem" : "48rem",
    fontFamily: clientForm.appearance.fontFamily === "serif" ? 'Georgia, "Times New Roman", serif' : clientForm.appearance.fontFamily === "system" ? "system-ui, sans-serif" : "Inter, ui-sans-serif, system-ui, sans-serif",
  } as React.CSSProperties;

  return (
    <PortalBuilderSettingsContext.Provider value={builderSettings}>
    <PortalPaymentMethodsContext.Provider value={availableMethods}>
      <PortalButtonLabelContext.Provider value={clientForm.appearance.buttonLabel || "Do Deposit"}>
      <PortalFormSlugContext.Provider value={clientForm.slug}>
      <PortalPreviewContext.Provider value={preview}>
      <div id="ipaycash-client-portal" data-theme={clientForm.appearance.theme} data-width={clientForm.appearance.width} data-radius={clientForm.appearance.radius} data-template={builderSettings?.template ?? "stripe"} data-button-shape={builderSettings?.buttonShape ?? "rounded"} data-supervisor-rating={builderSettings?.features?.supervisorRating === false ? "false" : "true"} data-ai-recognition={builderSettings?.features?.aiRecognition === false ? "false" : "true"} data-player-rating={builderSettings?.features?.playerRating === false ? "false" : "true"} data-player-id-mode={builderSettings?.configs?.playerIdMode ?? "both"} data-method-display={builderSettings?.configs?.methodDisplay ?? "cards"} style={style}>
        <style>{'#ipaycash-client-portal [class~="bg-slate-950"]{background-color:var(--portal-page-background)!important;}' +
          '#ipaycash-client-portal [class~="bg-slate-900"],#ipaycash-client-portal [class~="bg-slate-900/80"],#ipaycash-client-portal [class~="bg-slate-900/90"],#ipaycash-client-portal [class~="bg-slate-800"],#ipaycash-client-portal [class~="bg-slate-800/80"],#ipaycash-client-portal [class~="bg-slate-800/60"],#ipaycash-client-portal [class~="bg-slate-700/90"]{background-color:var(--portal-surface)!important;}' +
          '#ipaycash-client-portal [class~="bg-emerald-400"],#ipaycash-client-portal [class~="bg-emerald-300"]{background-color:var(--portal-accent)!important;}' +
          '#ipaycash-client-portal [class~="text-emerald-300"]{color:var(--portal-accent)!important;}' +
          '#ipaycash-client-portal [class~="border-slate-700"],#ipaycash-client-portal [class~="border-white/10"],#ipaycash-client-portal [class~="border-white/8"]{border-color:var(--portal-border)!important;}' +
          '#ipaycash-client-portal [class~="max-w-3xl"]{max-width:var(--portal-content-width)!important;}' +
          '#ipaycash-client-portal [class~="rounded-xl"],#ipaycash-client-portal [class~="rounded-2xl"]{border-radius:var(--portal-radius)!important;}' +
          '#ipaycash-client-portal [class~="min-h-dvh"]{min-height:max(560px,calc(100dvh - 4.5rem))!important;}' +
          '#ipaycash-client-portal[data-theme="light"] [class~="text-slate-100"],#ipaycash-client-portal[data-theme="light"] [class~="text-slate-200"],#ipaycash-client-portal[data-theme="light"] [class~="text-slate-300"]{color:#0f172a!important;}' +
          '#ipaycash-client-portal[data-theme="light"] [class~="text-slate-400"],#ipaycash-client-portal[data-theme="light"] [class~="text-slate-500"]{color:#64748b!important;}' +
          '#ipaycash-client-portal[data-supervisor-rating="false"] button[title="Review supervisor"]{display:none!important;}' +
          '#ipaycash-client-portal[data-ai-recognition="false"] [data-ai-recognition-ui="true"]{display:none!important;}' +
          '#ipaycash-client-portal[data-player-id-mode="userId"] button[aria-label="Email"],#ipaycash-client-portal[data-player-id-mode="userId"] button[aria-label="Username"],#ipaycash-client-portal[data-player-id-mode="email"] button[aria-label="Player ID"],#ipaycash-client-portal[data-player-id-mode="email"] button[aria-label="Username"],#ipaycash-client-portal[data-player-id-mode="both"] button[aria-label="Username"]{display:none!important;}' +
          '#ipaycash-client-portal[data-button-shape="pill"] button{border-radius:999px!important;}' +
          '#ipaycash-client-portal[data-button-shape="rounded"] button{border-radius:12px!important;}' +
          '#ipaycash-client-portal[data-button-shape="rectangle"] button{border-radius:4px!important;}' +
          '#ipaycash-client-portal[data-template="minimal"] [class~="shadow-2xl"]{box-shadow:none!important;}' +
          '#ipaycash-client-portal[data-template="classic"] section{border-radius:4px!important;}'}</style>
        <div style={{ backgroundColor: clientForm.appearance.backgroundColor, fontFamily: style.fontFamily }}>
          <PortalBrandHeader form={clientForm} />
          <div className="mx-auto w-full" style={{ maxWidth: clientForm.appearance.width === "wide" ? "80rem" : "64rem" }}>
            <div className="px-4 pb-2 pt-4 sm:px-6">
              <h1 className="text-lg font-semibold" style={{ color: clientForm.appearance.theme === "dark" ? "#f8fafc" : "#0f172a" }}>{clientForm.appearance.title || clientForm.name}</h1>
              <p className="mt-1 text-xs leading-5" style={{ color: clientForm.appearance.theme === "dark" ? "#94a3b8" : "#64748b" }}>{clientForm.appearance.description}</p>
            </div>
            <CustomerPortalExperience initialMethodId={initialMethodId} clientForm={clientForm} availableMethods={availableMethods} />
          </div>
          {clientForm.appearance.showPlatformBranding ? <p className="px-4 py-3 text-center text-[10px]" style={{ color: clientForm.appearance.theme === "dark" ? "#64748b" : "#94a3b8" }}>Powered by iPayCash</p> : null}
        </div>
      </div>
      </PortalPreviewContext.Provider>
      </PortalFormSlugContext.Provider>
      </PortalButtonLabelContext.Provider>
    </PortalPaymentMethodsContext.Provider>
    </PortalBuilderSettingsContext.Provider>
  );
}

function CustomerPortalExperience({
  initialMethodId,
  clientForm,
  availableMethods,
}: {
  initialMethodId?: string;
  clientForm: ClientPortalForm;
  availableMethods: PaymentMethod[];
}) {
  const portalBuilderSettings = React.useContext(PortalBuilderSettingsContext);
  const initialMethod = availableMethods.find((item) => item.id === initialMethodId) ?? availableMethods[0] ?? paymentMethods[0];
  const [method, setMethod] = React.useState<PaymentMethod>(initialMethod);
  const [amount, setAmount] = React.useState(() => String(initialMethod.min));
  const navigate = useNavigate();
  const [playerId, setPlayerId] = React.useState("");
  const [playerLookupType, setPlayerLookupType] = React.useState<PlayerLookupType>(() => portalBuilderSettings?.configs?.playerIdMode === "email" ? "email" : "playerId");
  const [openMethods, setOpenMethods] = React.useState(false);
  const [depositStarted, setDepositStarted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [requestLookupRefresh, setRequestLookupRefresh] = React.useState(0);
  React.useEffect(() => {
    const mode = portalBuilderSettings?.configs?.playerIdMode;
    if (mode === "email" && playerLookupType !== "email") setPlayerLookupType("email");
    else if (mode === "userId" && playerLookupType !== "playerId") setPlayerLookupType("playerId");
  }, [portalBuilderSettings?.configs?.playerIdMode]);
  const { status: playerRequestStatus, openRequest } = usePlayerRequestLookup(
    playerId,
    playerLookupType,
    requestLookupRefresh,
  );
  const minLabel = method.min.toLocaleString("en-US");
  const maxLabel = method.max.toLocaleString("en-US");
  const availableMethodIds = availableMethods.map((item) => item.id).join("|");

  React.useEffect(() => {
    const routeMethod = availableMethods.find((item) => item.id === initialMethodId);
    if (routeMethod && routeMethod.id !== method.id) {
      setMethod(routeMethod);
      setAmount(String(routeMethod.min));
      setError("");
      setDepositStarted(false);
      return;
    }
    if (!availableMethods.some((item) => item.id === method.id) && availableMethods[0]) {
      setMethod(availableMethods[0]);
      setAmount(String(availableMethods[0].min));
      setError("");
      setDepositStarted(false);
    }
  }, [initialMethodId, availableMethodIds, method.id]);

  const openTrackingPage = (request: DepositRequest) => {
    void navigate({
      to: "/portal/tracking-depoist",
      search: { request: request.id },
    });
  };

  const openCurrentRequestTracking = () => {
    const request = findOpenDepositRequest(playerId, playerLookupType);
    if (request) {
      openTrackingPage(request);
    }
  };

  const createCurrentPlayerRequest = () => {
    const request = createOpenDepositRequest({
      playerId,
      playerLookupType,
      method,
      amount,
    });

    setRequestLookupRefresh((current) => current + 1);
    return request;
  };

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

    if (method.automatic) {
      setError("Binance Pay is marked as an automatic method, but its API connection is not configured yet. Connect the provider server-side before accepting deposits.");
      return;
    }

    setError("");
    setDepositStarted(true);
  };

  if (method.id === "binance-pay") {
    return (
      <BinancePayFlow
        method={method}
        playerRequestStatus={playerRequestStatus}
        openRequest={openRequest}
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

  if (isEDinarMethod(method)) {
    return (
      <EDinarDepositFlow
        method={method}
        playerRequestStatus={playerRequestStatus}
        openRequest={openRequest}
        onViewRequest={openTrackingPage}
        onOpenTracking={openCurrentRequestTracking}
        onRequestCreated={createCurrentPlayerRequest}
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

  if (isCardDepositMethod(method)) {
    return (
      <CardDepositFlow
        method={method}
        playerRequestStatus={playerRequestStatus}
        openRequest={openRequest}
        onViewRequest={openTrackingPage}
        onOpenTracking={openCurrentRequestTracking}
        onRequestCreated={createCurrentPlayerRequest}
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

  if (isManualTransferMethod(method)) {
    return (
      <FlouciDepositFlow
        method={method}
        playerRequestStatus={playerRequestStatus}
        openRequest={openRequest}
        onViewRequest={openTrackingPage}
        onOpenTracking={openCurrentRequestTracking}
        onRequestCreated={createCurrentPlayerRequest}
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
                  {clientForm.appearance.buttonLabel || "Do Deposit"}
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
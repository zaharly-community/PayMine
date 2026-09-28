export type PaymentLinkStatus = "active" | "used" | "expired" | "archived";

export type PaymentLink = {
  id: number;
  playerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentMethodImage: string;
  account: string;
  durationMinutes: number;
  createdAt: string;
  expiresAt: string;
  status: PaymentLinkStatus;
  usedAt?: string;
  archivedAt?: string;
};

export type PaymentLinkDeposit = {
  id: string;
  name: string;
  email: string;
  date: string;
  paymentMethod: string;
  paymentMethodImage: string;
  verificationStatus: string;
  amount: number;
  feePercent: number;
  feeAmount: number;
  depositStatus: string;
  processedBy: {
    name: string;
    image: string;
  };
  indicatorStatus: string;
};

export const paymentLinksStorageKey = "paymine-payment-links-v1";
export const paymentLinkDepositsStorageKey = "paymine-payment-link-deposits-v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readPaymentLinks() {
  if (!canUseStorage()) return [] as PaymentLink[];
  return parseJson<PaymentLink[]>(
    window.localStorage.getItem(paymentLinksStorageKey),
    [],
  );
}

export function writePaymentLinks(links: PaymentLink[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(paymentLinksStorageKey, JSON.stringify(links));
}

export function readPaymentLinkDeposits() {
  if (!canUseStorage()) return [] as PaymentLinkDeposit[];
  return parseJson<PaymentLinkDeposit[]>(
    window.localStorage.getItem(paymentLinkDepositsStorageKey),
    [],
  );
}

export function writePaymentLinkDeposits(rows: PaymentLinkDeposit[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    paymentLinkDepositsStorageKey,
    JSON.stringify(rows),
  );
}

export function getPaymentLinkStatus(link: PaymentLink): PaymentLinkStatus {
  if (link.status === "archived") return "archived";
  if (link.status === "used") return "used";

  return Date.now() >= new Date(link.expiresAt).getTime()
    ? "expired"
    : "active";
}

export function nextPaymentLinkId(links: PaymentLink[]) {
  return links.reduce((highest, link) => Math.max(highest, Number(link.id) || 0), 0) + 1;
}

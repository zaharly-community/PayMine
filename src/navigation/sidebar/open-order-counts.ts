import { readPaymentLinkDeposits } from "@/lib/payment-links";
import {
  deposits as seededDeposits,
  type DepositRow,
} from "@/routes/(main)/dashboard/deposits/-components/data";
import {
  withdrawls as seededWithdrawls,
  type WithdrawlRow,
} from "@/routes/(main)/dashboard/withdrawls/-components/data";

export const OPEN_ORDER_COUNTS_EVENT = "ipaycash:open-order-counts";

export type OpenOrderCountSection = "deposits" | "withdrawls";

export type OpenOrderCountDetail = {
  section: OpenOrderCountSection;
  count: number;
};

export type OpenOrderCounts = Record<OpenOrderCountSection, number>;

export function countOpenDeposits(rows: readonly Pick<DepositRow, "depositStatus">[]) {
  return rows.filter(
    (row) => row.depositStatus !== "Completed" && row.depositStatus !== "Canceled",
  ).length;
}

export function countOpenWithdrawls(rows: readonly Pick<WithdrawlRow, "status">[]) {
  return rows.filter((row) => row.status !== "Completed").length;
}

export function getInitialOpenOrderCounts(): OpenOrderCounts {
  const linkedDeposits = readPaymentLinkDeposits() as DepositRow[];
  const seededIds = new Set(seededDeposits.map((row) => row.id));
  const mergedDeposits = [
    ...linkedDeposits.filter((row) => !seededIds.has(row.id)),
    ...seededDeposits,
  ];

  return {
    deposits: countOpenDeposits(mergedDeposits),
    withdrawls: countOpenWithdrawls(seededWithdrawls),
  };
}

export function publishOpenOrderCount(detail: OpenOrderCountDetail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<OpenOrderCountDetail>(OPEN_ORDER_COUNTS_EVENT, { detail }),
  );
}

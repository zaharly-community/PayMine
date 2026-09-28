import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Receipt,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { deposits } from "../deposits/-components/data";
import type { DepositRow } from "../deposits/-components/data";
import { withdrawls } from "../withdrawls/-components/data";
import type { WithdrawlRow } from "../withdrawls/-components/data";
import { readPaymentLinkDeposits } from "@/lib/payment-links";

type TransactionStatus = "Completed" | "Pending" | "Processing" | "Canceled" | "Waiting Correction";
type TransactionType = "Deposit" | "Withdrawl";

type Transaction = {
  id: string;
  type: TransactionType;
  customer: string;
  email: string;
  amount: number;
  fee: number;
  provider: string;
  providerImage: string;
  status: TransactionStatus;
  date: string;
};

const statusClass: Record<TransactionStatus, string> = {
  Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Pending: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Processing: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Canceled: "border-destructive/25 bg-destructive/10 text-destructive",
  "Waiting Correction": "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

function depositTransaction(row: DepositRow): Transaction {
  return {
    id: row.id,
    type: "Deposit",
    customer: row.name,
    email: row.email,
    amount: row.amount,
    fee: row.feeAmount,
    provider: row.paymentMethod,
    providerImage: row.paymentMethodImage,
    status: row.depositStatus === "Processing" ? "Processing" : row.depositStatus,
    date: row.date,
  };
}

function withdrawlTransaction(row: WithdrawlRow): Transaction {
  return {
    id: row.id,
    type: "Withdrawl",
    customer: row.name,
    email: row.email,
    amount: -row.amount,
    fee: row.commissionAmount,
    provider: row.withdrawlMethod,
    providerImage: row.withdrawlMethodImage,
    status: row.status,
    date: row.date,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function amountLabel(amount: number) {
  return (amount >= 0 ? "+" : "-") + "$" + Math.abs(amount).toFixed(2);
}

function iconForStatus(status: TransactionStatus) {
  if (status === "Completed") return <CheckCircle2 className="size-3.5" />;
  if (status === "Canceled") return <XCircle className="size-3.5" />;
  return <Clock3 className="size-3.5" />;
}

function parseDate(date: string) {
  const value = Date.parse(date);
  return Number.isNaN(value) ? 0 : value;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: "primary" | "success" | "warning" | "danger";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex min-h-[112px] items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className={"flex size-10 shrink-0 items-center justify-center rounded-xl border " + tones[tone]}>
          {icon}
        </div>
        <div className={"absolute inset-x-0 bottom-0 h-1 " + tones[tone]} />
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/(main)/dashboard/transactions/")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | TransactionType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TransactionStatus>("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paymentLinkRows, setPaymentLinkRows] = useState<Transaction[]>([]);

  useEffect(() => {
    const syncPaymentLinks = () => {
      const linkRows = readPaymentLinkDeposits() as DepositRow[];
      setPaymentLinkRows(linkRows.map(depositTransaction));
    };

    syncPaymentLinks();
    window.addEventListener("storage", syncPaymentLinks);
    window.addEventListener("focus", syncPaymentLinks);
    return () => {
      window.removeEventListener("storage", syncPaymentLinks);
      window.removeEventListener("focus", syncPaymentLinks);
    };
  }, []);

  const rows = useMemo(() => {
    const seeded = [
      ...deposits.map(depositTransaction),
      ...withdrawls.map(withdrawlTransaction),
    ];
    const seededIds = new Set(seeded.map((row) => row.id));
    const all = [
      ...paymentLinkRows.filter((row) => !seededIds.has(row.id)),
      ...seeded,
    ];
    const text = query.trim().toLowerCase();

    return all
      .filter((row) => {
        if (typeFilter !== "All" && row.type !== typeFilter) return false;
        if (statusFilter !== "All" && row.status !== statusFilter) return false;
        if (providerFilter !== "All" && row.provider !== providerFilter) return false;
        if (!text) return true;
        return [row.id, row.customer, row.email, row.provider, row.type]
          .join(" ")
          .toLowerCase()
          .includes(text);
      })
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [paymentLinkRows, providerFilter, query, statusFilter, typeFilter]);

  const providers = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.provider)))],
    [rows],
  );

  const stats = useMemo(() => {
    const completed = rows.filter((row) => row.status === "Completed").length;
    const pending = rows.filter(
      (row) =>
        row.status === "Pending" ||
        row.status === "Processing" ||
        row.status === "Waiting Correction",
    ).length;
    const failed = rows.filter((row) => row.status === "Canceled").length;
    return {
      total: rows.length,
      completed,
      pending,
      failed,
      rate: rows.length ? ((completed / rows.length) * 100).toFixed(1) : "0.0",
    };
  }, [rows]);

  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleRows = rows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));

  const resetPage = () => setPage(0);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleRows.forEach((row) => next.delete(row.id));
      else visibleRows.forEach((row) => next.add(row.id));
      return next;
    });
  };

  const exportCsv = () => {
    const header = ["Transaction", "Customer", "Type", "Amount", "Fee", "Provider", "Status", "Date"];
    const lines = rows.map((row) =>
      [
        row.id,
        row.customer,
        row.type,
        row.amount.toFixed(2),
        row.fee.toFixed(2),
        row.provider,
        row.status,
        row.date,
      ]
        .map((value) => """ + value.replaceAll(""", """") + """)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "paymine-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
              <Receipt className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Finance</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Transactions</h1>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Every deposit and withdrawl recorded across player wallets.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <CalendarDays />
              Aug 30, 2026 — Sep 28, 2026
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={stats.total.toLocaleString()} sub="All matching transactions" icon={<WalletCards className="size-5" />} tone="primary" />
        <StatCard label="Completed" value={stats.completed.toLocaleString()} sub={stats.rate + "% completion rate"} icon={<CheckCircle2 className="size-5" />} tone="success" />
        <StatCard label="Pending" value={stats.pending.toLocaleString()} sub="Awaiting processing or correction" icon={<Clock3 className="size-5" />} tone="warning" />
        <StatCard label="Failed" value={stats.failed.toLocaleString()} sub="Canceled transactions" icon={<XCircle className="size-5" />} tone="danger" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 xl:max-w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              className="h-9 pl-9"
              placeholder="Search name, transaction ID, provider..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as "All" | TransactionType);
                resetPage();
              }}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
            >
              <option value="All">Transaction Type</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawl">Withdrawl</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "All" | TransactionStatus);
                resetPage();
              }}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
            >
              <option value="All">Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Waiting Correction">Waiting Correction</option>
              <option value="Canceled">Canceled</option>
            </select>

            <select
              value={providerFilter}
              onChange={(event) => {
                setProviderFilter(event.target.value);
                resetPage();
              }}
              className="h-9 max-w-[180px] rounded-md border bg-background px-3 text-sm outline-none"
            >
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider === "All" ? "Provider" : provider}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setTypeFilter("All");
                setStatusFilter("All");
                setProviderFilter("All");
                resetPage();
              }}
            >
              <Filter />
              Reset
            </Button>
          </div>

          <span className="text-xs text-muted-foreground xl:ml-auto">
            {rows.length.toLocaleString()} transactions
          </span>
        </div>

        {selected.size > 0 ? (
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 text-xs">
            <span><strong>{selected.size}</strong> selected</span>
            <button
              type="button"
              className="font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          </div>
        ) : null}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="w-11 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible transactions"
                  />
                </th>
                <th className="px-3 py-3 text-left font-medium">Transaction</th>
                <th className="px-3 py-3 text-left font-medium">Customer</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3 text-left font-medium">Provider</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="group border-b last:border-0">
                  <td className="px-3 py-3 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      aria-label={"Select " + row.id}
                    />
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border " +
                          (row.type === "Deposit"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
                        }
                      >
                        {row.type === "Deposit" ? (
                          <ArrowDownRight className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{row.type}</div>
                        <code className="mt-0.5 block max-w-[190px] truncate text-xs text-muted-foreground">
                          {row.id}
                        </code>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                        {initials(row.customer)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{row.customer}</div>
                        <div className="truncate text-xs text-muted-foreground">{row.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right align-middle">
                    <div
                      className={
                        "font-semibold tabular-nums " +
                        (row.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400")
                      }
                    >
                      {amountLabel(row.amount)}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {"Fee $" + row.fee.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
                        {row.providerImage ? (
                          <img src={row.providerImage} alt="" className="size-5 object-contain" />
                        ) : (
                          <WalletCards className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{row.provider}</div>
                        <div className="text-xs text-muted-foreground">{row.type}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <Badge variant="outline" className={"gap-1.5 " + statusClass[row.status]}>
                      {iconForStatus(row.status)}
                      {row.status}
                    </Badge>
                  </td>

                  <td className="px-3 py-3 text-right align-middle">
                    <div className="font-medium tabular-nums">
                      {row.date.split(", ")[1] || row.date}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.date.split(", ")[0] || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {visibleRows.length ? (
            <div className="divide-y">
              {visibleRows.map((row) => (
                <div key={row.id} className="flex items-center gap-3 px-3 py-3">
                  <div
                    className={
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border " +
                      (row.type === "Deposit"
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
                    }
                  >
                    {row.type === "Deposit" ? (
                      <ArrowDownRight className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{row.customer}</span>
                      <span
                        className={
                          "shrink-0 font-semibold tabular-nums " +
                          (row.amount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400")
                        }
                      >
                        {amountLabel(row.amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="truncate text-xs text-muted-foreground">
                        {row.type} · {row.provider}
                      </span>
                      <Badge variant="outline" className={"shrink-0 gap-1 " + statusClass[row.status]}>
                        {iconForStatus(row.status)}
                        {row.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">
              No transactions found.
            </div>
          )}
        </div>

        {visibleRows.length === 0 ? (
          <div className="hidden min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground md:flex">
            No transactions found.
          </div>
        ) : null}

        <footer className="flex flex-col gap-3 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {rows.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, rows.length)} of {rows.length}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-xs tabular-nums text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            >
              Next
            </Button>
          </div>
        </footer>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
        <Receipt className="size-3.5 shrink-0" />
        Transactions are consolidated from the current Deposits and Withdrawls data.
      </div>
    </section>
  );
}

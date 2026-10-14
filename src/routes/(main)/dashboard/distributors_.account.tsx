import * as React from "react";

import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  FileText,
  Gauge,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Settings2,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { parse } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "cn";

import { distributors, type DistributorRow } from "./distributors/-components/data";
import { deposits } from "./deposits/-components/data";
import { withdrawls } from "./withdrawls/-components/data";
import {
  readDistributorReports,
  subscribeToDistributorReports,
  type DistributorReport,
} from "@/lib/distributor-reports";

export const Route = createFileRoute("/(main)/dashboard/distributors_/account")({
  component: Page,
});

type LeftTab = "Details" | "Contacts" | "Notes";
type MainTab = "Transactions" | "Analytics" | "Reviews" | "Score" | "Activity" | "Complaints" | "Settings";

const billedMonths = [
  { month: "Aug", paid: 62000, open: 0, overdue: 0 },
  { month: "Sep", paid: 76000, open: 0, overdue: 0 },
  { month: "Oct", paid: 89000, open: 0, overdue: 0 },
  { month: "Nov", paid: 42000, open: 0, overdue: 0 },
  { month: "Dec", paid: 97000, open: 0, overdue: 0 },
  { month: "Jan", paid: 52000, open: 0, overdue: 0 },
  { month: "Feb", paid: 89000, open: 0, overdue: 0 },
  { month: "Mar", paid: 76000, open: 0, overdue: 0 },
  { month: "Apr", paid: 39000, open: 0, overdue: 0 },
  { month: "May", paid: 86000, open: 0, overdue: 0 },
  { month: "Jun", paid: 94000, open: 18000, overdue: 72000 },
  { month: "Jul", paid: 82000, open: 18000, overdue: 66000 },
];

const contacts = [
  ["IS", "Ingrid Sandoval", "Account manager", "ingrid@paymine.tn", true],
  ["MP", "Maya Patel", "Head of Product", "maya@paymine.tn", false],
  ["SM", "Sofia Martins", "Finance lead", "finance@paymine.tn", false],
] as const;

const notes = [
  ["12 Jun 2026", "Quarterly settlement review completed. Distributor volume is tracking above plan and no unreconciled balance remains."],
  ["28 Apr 2026", "Finance confirmed every statement should include the distributor reference ID to avoid matching delays."],
  ["15 Feb 2026", "Adjusted the commission plan after a duplicate payout was identified and corrected."],
] as const;

const chartConfig = {
  paid: { label: "Paid", color: "var(--foreground)" },
  open: { label: "Open", color: "var(--muted-foreground)" },
  overdue: {
    label: "Overdue",
    color: "color-mix(in oklch, var(--muted-foreground) 55%, transparent)",
  },
} satisfies ChartConfig;

function Page() {
  const distributor = distributors[0];
  const [leftTab, setLeftTab] = React.useState<LeftTab>("Details");
  const [mainTab, setMainTab] = React.useState<MainTab>("Transactions");

  const totalBilled = billedMonths.reduce(
    (total, item) => total + item.paid + item.open + item.overdue,
    0,
  );

  return (
    <section
      data-content-padding="false"
      className="flex min-h-full min-w-0 flex-col bg-background text-foreground"
    >
      <div className="grid min-w-0 xl:grid-cols-[414px_minmax(0,1fr)]">
        <aside className="border-b xl:border-b-0 xl:border-r">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-14 shrink-0">
                <AvatarImage
                  src={distributor.avatarUrl || undefined}
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-base">
                  {getInitials(distributor.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {distributor.name}
                </h1>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {distributor.email}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <FileText />
                New invoice
              </Button>
              <Button size="sm" variant="outline">
                <Mail />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare />
                Add note
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Lifetime volume" value="$2.41M" />
              <Metric label="On-time rate" value="96%" />
              <Metric label="Avg days to pay" value="18 days" />
            </div>
          </div>

          <div className="flex border-y">
            {(["Details", "Contacts", "Notes"] as LeftTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={cn(
                  "flex h-11 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground transition-colors",
                  leftTab === tab && "border-foreground text-foreground",
                )}
              >
                {tab === "Details" ? (
                  <FileText className="size-4" />
                ) : tab === "Contacts" ? (
                  <Users className="size-4" />
                ) : (
                  <Pencil className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {leftTab === "Details" ? (
              <>
                <div className="space-y-5">
                  <DetailRow icon={Building2} label="Legal name" value={distributor.name} />
                  <DetailRow icon={Mail} label="Billing email" value={distributor.email} />
                  <DetailRow icon={MapPin} label="Location" value="Tunis, Tunisia" />
                  <DetailRow icon={CalendarDays} label="Customer since" value={distributor.joinedDate} />
                  <DetailRow icon={UserRound} label="Account manager" value="Ingrid Sandoval" />
                  <DetailRow icon={CreditCard} label="Tax ID" value="TN 74 612 893 204" />
                  <DetailRow
                    icon={CreditCard}
                    label="Payment terms"
                    value="Net 30"
                  />
                  <DetailRow
                    icon={Users}
                    label="Licensed players"
                    value={String(distributor.players) + " active"}
                  />
                </div>

                <div className="mt-7 border-t pt-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">About the account</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {distributor.name} uses the full PayMine distribution workspace across
                    settlement, payment routing, player operations, and account controls.
                    This enterprise-style account currently tracks {distributor.players} linked players.
                  </p>
                </div>
              </>
            ) : null}

            {leftTab === "Contacts" ? (
              <div className="space-y-0">
                {contacts.map(([initials, name, role, email, primary]) => (
                  <div
                    key={name}
                    className="flex items-start gap-3 border-b py-4 first:pt-0"
                  >
                    <Avatar size="sm" className="shrink-0">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{name}</p>
                        {primary ? (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            Primary
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {leftTab === "Notes" ? (
              <div className="space-y-0">
                {notes.map(([date, note]) => (
                  <div key={date} className="border-b py-4 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{distributor.name}</p>
                      <span className="text-xs text-muted-foreground">{date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Billed volume · last 12 months</p>
                <div className="mt-1 text-3xl font-semibold tracking-tight">
                  {formatCompactCurrency(totalBilled)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <Legend label="Paid" value="$858K" tone="dark" />
                <Legend label="Open" value="$18K" tone="medium" />
                <Legend label="Overdue" value="$184K" tone="light" />
              </div>
            </div>

            <div className="mt-5">
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <BarChart
                  data={billedMonths}
                  margin={{ top: 2, right: 4, left: 0, bottom: 0 }}
                  barCategoryGap="48%"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={42}
                    ticks={[0, 100000, 200000]}
                    tickFormatter={(value) => (value === 0 ? "0" : value / 1000 + "k")}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => String(value)}
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === "paid" ? "Paid" : name === "open" ? "Open" : "Overdue",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="overdue"
                    stackId="volume"
                    fill="var(--color-overdue)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive
                    animationBegin={240}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="open"
                    stackId="volume"
                    fill="var(--color-open)"
                    isAnimationActive
                    animationBegin={140}
                    animationDuration={980}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="paid"
                    stackId="volume"
                    fill="var(--color-paid)"
                    isAnimationActive
                    animationDuration={820}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="flex overflow-x-auto border-b">
            {(
              [
                "Transactions",
                "Analytics",
                "Reviews",
                "Score",
                "Activity",
                "Complaints",
                "Settings",
              ] as MainTab[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMainTab(tab)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground transition-colors",
                  mainTab === tab && "border-foreground text-foreground",
                )}
              >
                {tab === "Transactions" ? (
                  <CreditCard className="size-4" />
                ) : tab === "Analytics" ? (
                  <BarChart3 className="size-4" />
                ) : tab === "Reviews" ? (
                  <Star className="size-4" />
                ) : tab === "Score" ? (
                  <Gauge className="size-4" />
                ) : tab === "Activity" ? (
                  <Activity className="size-4" />
                ) : tab === "Complaints" ? (
                  <CircleAlert className="size-4" />
                ) : (
                  <Settings2 className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className={mainTab === "Transactions" ? "p-0" : "p-5"}>
            {mainTab === "Transactions" ? <TransactionsPanel distributor={distributor} /> : null}
            {mainTab === "Analytics" ? <AnalyticsPanel /> : null}
            {mainTab === "Reviews" ? <ReviewsPanel /> : null}
            {mainTab === "Score" ? <ScorePanel distributor={distributor} /> : null}
            {mainTab === "Activity" ? <ActivityPanel distributor={distributor} /> : null}
            {mainTab === "Complaints" ? <ComplaintsPanel distributor={distributor} /> : null}
            {mainTab === "Settings" ? <SettingsPanel distributor={distributor} /> : null}
          </div>
        </main>
      </div>
    </section>
  );
}


type AccountTransaction = {
  id: string;
  kind: "Deposit" | "Withdrawal";
  player: string;
  method: string;
  methodImage: string;
  date: string;
  amount: number;
  feeLabel: string;
  status: string;
};

function TransactionsPanel({ distributor }: { distributor: DistributorRow }) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);

  // This account page intentionally uses isolated mock transactions. They are not
  // copied back into the global Deposits / Withdrawals datasets.
  const rows = React.useMemo<AccountTransaction[]>(() => {
    const depositRows: AccountTransaction[] = deposits.slice(0, 12).map((row, index) => ({
      id: `${distributor.id}-DEP-${String(index + 1).padStart(3, "0")}`,
      kind: "Deposit",
      player: row.name,
      method: row.paymentMethod,
      methodImage: row.paymentMethodImage,
      date: row.date,
      amount: row.amount,
      feeLabel: row.feePercent > 0
        ? `${row.feePercent}% · ${formatCurrency(row.feeAmount)}`
        : "Not concerned",
      status: row.depositStatus,
    }));

    const withdrawalRows: AccountTransaction[] = withdrawls.slice(0, 12).map((row, index) => ({
      id: `${distributor.id}-WDL-${String(index + 1).padStart(3, "0")}`,
      kind: "Withdrawal",
      player: row.name,
      method: row.withdrawlMethod,
      methodImage: row.withdrawlMethodImage,
      date: row.date,
      amount: row.amount,
      feeLabel: row.commissionPercent > 0
        ? `${row.commissionPercent}% · ${formatCurrency(row.commissionAmount)}`
        : "Not concerned",
      status: row.status,
    }));

    return [...depositRows, ...withdrawalRows].sort(
      (left, right) =>
        parse(right.date, "dd MMM yyyy, hh:mm a", new Date()).getTime() -
        parse(left.date, "dd MMM yyyy, hh:mm a", new Date()).getTime(),
    );
  }, [distributor.id, distributor.name]);

  const visibleRows = rows;

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const pagedRows = visibleRows.slice(currentPageIndex * pageSize, (currentPageIndex + 1) * pageSize);
  const from = visibleRows.length === 0 ? 0 : currentPageIndex * pageSize + 1;
  const to = Math.min((currentPageIndex + 1) * pageSize, visibleRows.length);

  const getRowIndicator = (row: AccountTransaction) => {
    if (["Canceled", "Failed"].includes(row.status)) {
      return "shadow-[inset_5px_0_0_var(--color-red-500)]";
    }
    if (["Pending", "Processing", "Waiting Correction", "In Process"].includes(row.status)) {
      return "shadow-[inset_5px_0_0_var(--color-amber-400)]";
    }
    return "shadow-[inset_5px_0_0_var(--color-emerald-500)]";
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0">
      <div className="hidden md:block">
        <Table className="w-full border-collapse **:data-[slot='table-cell']:border-b **:data-[slot='table-cell']:border-border/70 **:data-[slot='table-cell']:px-2 **:data-[slot='table-head']:border-b **:data-[slot='table-head']:border-border/70 **:data-[slot='table-head']:px-2">
          <TableHeader className="[&_tr]:border-t">
            <TableRow className="hover:bg-transparent">
              {["Type", "Transaction ID", "Player", "Payment Method", "Date", "Amount", "Fees", "Status"].map((heading) => (
                <TableHead key={heading} className="h-10 whitespace-nowrap py-2.5 text-xs font-medium text-muted-foreground">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length ? pagedRows.map((row) => (
              <TableRow key={row.kind + row.id} className={cn("relative h-7 border-border/60 transition-colors hover:bg-muted/35", getRowIndicator(row))}>
                <TableCell className="px-2 py-0 align-middle leading-none">
                  <Badge
                    variant="outline"
                    className={row.kind === "Deposit"
                      ? "gap-1 rounded-4xl border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                      : "gap-1 rounded-4xl border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[11px] font-medium text-orange-700 dark:text-orange-300"}
                  >
                    {row.kind === "Deposit" ? <ArrowDownToLine className="size-3" /> : <ArrowUpFromLine className="size-3" />}
                    {row.kind}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 py-0 font-mono text-xs leading-none">{row.id}</TableCell>
                <TableCell className="px-2 py-0 align-middle leading-none">
                  <div className="flex min-w-36 items-center gap-2.5">
                    <Avatar size="sm" className="size-7 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-medium">{getInitials(row.player)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{row.player}</span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-0 align-middle leading-none">
                  <div className="flex min-w-32 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-xs border bg-background">
                      {row.methodImage ? <img src={row.methodImage} alt="" className="size-full object-contain p-0.5" loading="lazy" referrerPolicy="no-referrer" /> : <span className="text-[10px] font-semibold">{row.method.slice(0, 1)}</span>}
                    </span>
                    <span className="truncate text-sm">{row.method}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 py-0 text-sm tabular-nums leading-none">{row.date}</TableCell>
                <TableCell className="whitespace-nowrap px-2 py-0 text-right text-sm font-medium tabular-nums leading-none">
                  <span className={row.kind === "Deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {row.kind === "Deposit" ? "+" : "−"}{formatCurrency(row.amount)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 py-0 text-sm tabular-nums leading-none text-muted-foreground">{row.feeLabel}</TableCell>
                <TableCell className="px-2 py-0 align-middle leading-none">
                  <Badge variant="outline" className={cn("h-5 rounded-4xl px-1.5 py-0.5 text-[11px] font-medium", getTransactionStatusClass(row.status))}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border/70 md:hidden">
        {pagedRows.length ? pagedRows.map((row) => (
          <article key={row.kind + row.id} className={cn("relative min-w-0 px-2 py-2 transition-colors hover:bg-muted/30", getRowIndicator(row))}>
            <div className="flex min-w-0 items-start gap-3">
              <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border", row.kind === "Deposit" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400")}>
                {row.kind === "Deposit" ? <ArrowDownToLine className="size-4" /> : <ArrowUpFromLine className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{row.player}</span>
                  <span className={cn("shrink-0 text-right text-sm font-semibold tabular-nums", row.kind === "Deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {row.kind === "Deposit" ? "+" : "−"}{formatCurrency(row.amount)}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">{row.kind} · {row.method}</span>
                  <Badge variant="outline" className={cn("h-5 rounded-4xl px-1.5 py-0.5 text-[10px]", getTransactionStatusClass(row.status))}>{row.status}</Badge>
                </div>
                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] leading-4 text-muted-foreground">
                  <span className="shrink-0 font-mono">{row.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="min-w-0 truncate">{row.date}</span>
                </div>
                <div className="mt-1.5 text-right text-[10px] text-muted-foreground">{row.feeLabel}</div>
              </div>
            </div>
          </article>
        )) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">No results.</div>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <span><span className="sm:hidden">Rows</span><span className="hidden sm:inline">Rows per page</span></span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="account-transactions-rows-per-page">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 25, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <span>Page {currentPageIndex + 1} of {pageCount}</span>
          <span>Showing {from}–{to} of {visibleRows.length}</span>
        </div>
        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text=""
                className={currentPageIndex === 0 ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setPageIndex((page) => Math.max(0, Math.min(page, pageCount - 1) - 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border bg-background px-3 text-sm">{currentPageIndex + 1}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                text=""
                className={currentPageIndex >= pageCount - 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setPageIndex((page) => Math.min(pageCount - 1, page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <p className="text-[11px] text-muted-foreground">Mock transactions for {distributor.name} only. These records are isolated demo data, not live payment records.</p>
    </div>
  );
}

function getTransactionStatusClass(status: string) {
  if (["Completed", "Approved"].includes(status)) {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (["Processing", "In Process"].includes(status)) {
    return "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
  if (["Canceled", "Failed"].includes(status)) {
    return "border-destructive/25 bg-destructive/10 text-destructive";
  }
  if (["Waiting Correction"].includes(status)) {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-border bg-muted/40 text-muted-foreground";
}

type AccountActivityEvent = {
  id: string;
  timestamp: string;
  dateLabel: string;
  type: "login" | "logout" | "withdrawal" | "deposit" | "settings" | "review" | "complaint" | "score" | "security";
  title: string;
  description: string;
  actor: string;
  reference?: string;
  amount?: string;
  badge?: string;
  badgeTone?: "success" | "warning" | "danger" | "info" | "neutral";
};

function ActivityPanel({ distributor }: { distributor: (typeof distributors)[number] }) {
  const events = React.useMemo<AccountActivityEvent[]>(() => [
    {
      id: "ACT-014",
      timestamp: "2026-10-14T10:42:00+01:00",
      dateLabel: "14 Oct 2026 · 10:42",
      type: "withdrawal",
      title: "Withdrawal processed",
      description: "Withdrawal request was marked as completed for the linked player.",
      actor: distributor.name,
      reference: `WDL-${distributor.id}-10482`,
      amount: "$420.00",
      badge: "Completed",
      badgeTone: "success",
    },
    {
      id: "ACT-013",
      timestamp: "2026-10-14T10:18:00+01:00",
      dateLabel: "14 Oct 2026 · 10:18",
      type: "deposit",
      title: "Deposit verified",
      description: "A player's deposit was checked and confirmed successfully.",
      actor: distributor.name,
      reference: `DEP-${distributor.id}-20831`,
      amount: "$150.00",
      badge: "Verified",
      badgeTone: "success",
    },
    {
      id: "ACT-012",
      timestamp: "2026-10-14T09:57:00+01:00",
      dateLabel: "14 Oct 2026 · 09:57",
      type: "login",
      title: "Successful sign-in",
      description: "A new account session was opened using valid credentials.",
      actor: distributor.name,
      badge: "Signed in",
      badgeTone: "info",
    },
    {
      id: "ACT-011",
      timestamp: "2026-10-13T18:21:00+01:00",
      dateLabel: "13 Oct 2026 · 18:21",
      type: "logout",
      title: "Signed out",
      description: "The account session ended normally.",
      actor: distributor.name,
      badge: "Session ended",
      badgeTone: "neutral",
    },
    {
      id: "ACT-010",
      timestamp: "2026-10-13T16:06:00+01:00",
      dateLabel: "13 Oct 2026 · 16:06",
      type: "settings",
      title: "Payment method settings updated",
      description: "The Flouci processing limit was changed from 50 to 75 requests per day.",
      actor: distributor.name,
      reference: "CFG-FLOUCI-075",
      badge: "Settings changed",
      badgeTone: "info",
    },
    {
      id: "ACT-009",
      timestamp: "2026-10-13T14:32:00+01:00",
      dateLabel: "13 Oct 2026 · 14:32",
      type: "withdrawal",
      title: "Withdrawal sent for correction",
      description: "The request needs additional verification before it can be processed.",
      actor: "Risk & Operations",
      reference: `WDL-${distributor.id}-10467`,
      amount: "$275.00",
      badge: "Needs correction",
      badgeTone: "warning",
    },
    {
      id: "ACT-008",
      timestamp: "2026-10-13T11:48:00+01:00",
      dateLabel: "13 Oct 2026 · 11:48",
      type: "review",
      title: "Customer review received",
      description: "A player submitted a 5-star rating after a successful transaction.",
      actor: "Player feedback",
      badge: "5-star review",
      badgeTone: "success",
    },
    {
      id: "ACT-007",
      timestamp: "2026-10-12T17:02:00+01:00",
      dateLabel: "12 Oct 2026 · 17:02",
      type: "complaint",
      title: "Complaint resolved in the player's favor",
      description: "The review confirmed a processing error. The outcome was recorded and 10 points were deducted from the account score.",
      actor: "Support review",
      reference: "CMP-882",
      badge: "Resolved · −10 pts",
      badgeTone: "danger",
    },
    {
      id: "ACT-006",
      timestamp: "2026-10-12T15:34:00+01:00",
      dateLabel: "12 Oct 2026 · 15:34",
      type: "score",
      title: "Performance score increased",
      description: "15 points were awarded for positive customer feedback.",
      actor: "System",
      reference: "SCR-2026-008",
      badge: "+15 points",
      badgeTone: "success",
    },
    {
      id: "ACT-005",
      timestamp: "2026-10-11T12:18:00+01:00",
      dateLabel: "11 Oct 2026 · 12:18",
      type: "security",
      title: "Account password changed",
      description: "Account security credentials were updated successfully.",
      actor: distributor.name,
      badge: "Security update",
      badgeTone: "info",
    },
    {
      id: "ACT-004",
      timestamp: "2026-10-10T09:10:00+01:00",
      dateLabel: "10 Oct 2026 · 09:10",
      type: "deposit",
      title: "Deposit processed",
      description: "A deposit request passed review and was marked as completed.",
      actor: distributor.name,
      reference: `DEP-${distributor.id}-20796`,
      amount: "$80.00",
      badge: "Completed",
      badgeTone: "success",
    },
    {
      id: "ACT-003",
      timestamp: "2026-10-09T22:03:00+01:00",
      dateLabel: "09 Oct 2026 · 22:03",
      type: "login",
      title: "Sign-in attempt blocked",
      description: "An authentication attempt was rejected because the provided credentials were invalid.",
      actor: "Security monitor",
      badge: "Blocked",
      badgeTone: "danger",
    },
  ].sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp)), [distributor.id, distributor.name]);

  const badgeClass: Record<NonNullable<AccountActivityEvent["badgeTone"]>, string> = {
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
    info: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    neutral: "border-border bg-muted/50 text-muted-foreground",
  };

  const activityIcon = (type: AccountActivityEvent["type"]) => {
    if (type === "login") return <LogIn className="size-4" />;
    if (type === "logout") return <LogOut className="size-4" />;
    if (type === "withdrawal") return <ArrowUpFromLine className="size-4" />;
    if (type === "deposit") return <ArrowDownToLine className="size-4" />;
    if (type === "settings") return <Settings2 className="size-4" />;
    if (type === "review") return <Star className="size-4" />;
    if (type === "complaint") return <CircleAlert className="size-4" />;
    if (type === "score") return <Gauge className="size-4" />;
    return <ShieldCheck className="size-4" />;
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Account activity timeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Authentication, transaction processing, reviews, and account changes.
          </p>
        </div>
        <Badge variant="outline" className="w-fit">Demo activity</Badge>
      </div>

      <div className="pl-0">
        {events.map((event, index) => (
          <article key={event.id} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 pb-6 last:pb-0 sm:grid-cols-[28px_minmax(0,1fr)] sm:gap-4">
            <div className="relative flex justify-center">
              {index < events.length - 1 ? (
                <span className="absolute bottom-[-2px] top-5 w-px bg-border" aria-hidden="true" />
              ) : null}
              <span className="relative z-10 flex size-5 items-center justify-center bg-background text-muted-foreground sm:size-6">
                {activityIcon(event.type)}
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-medium">{event.title}</p>
                {event.badge ? (
                  <Badge variant="outline" className={cn("h-5 shrink-0 px-1.5 text-[10px] font-normal", badgeClass[event.badgeTone ?? "neutral"])}>
                    {event.badge}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm leading-5 text-muted-foreground">{event.description}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span className="whitespace-nowrap tabular-nums">{event.dateLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{event.actor}</span>
                {event.reference ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{event.reference}</span>
                  </>
                ) : null}
                {event.amount ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium tabular-nums text-foreground">{event.amount}</span>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        These are sample events for this account, not live audit records. In production, populate this timeline from a server-side audit log that records the actor, timestamp, action, outcome, and related transaction reference.
      </p>
    </section>
  );
}

function AnalyticsPanel() {
  const metrics = [
    ["Processed volume", "$2.41M"],
    ["Success rate", "96.4%"],
    ["Avg. processing", "3m 18s"],
    ["Transactions", "12,842"],
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Processing trend</p>
            <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <BarChart3 className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-6 grid h-28 grid-cols-12 items-end gap-2">
          {[42, 58, 46, 71, 64, 82, 68, 76, 88, 69, 91, 84].map((height, index) => (
            <div key={index} className="rounded-t bg-foreground/80" style={{ height: height + "%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsPanel() {
  const reviews = [
    ["Payment handling", "Excellent", "Clear processing and reliable settlement handling."],
    ["Communication", "Good", "Responses are consistent across operational requests."],
    ["Account support", "Excellent", "Fast resolution for account-level questions."],
  ] as const;

  return (
    <div className="space-y-3">
      {reviews.map(([title, rating, detail]) => (
        <div key={title} className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{title}</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium">
              <Star className="size-3.5 fill-current" />
              {rating}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function ScorePanel({ distributor }: { distributor: (typeof distributors)[number] }) {
  const scoreHistory = [
    {
      id: "SCR-2026-014",
      date: "12 Oct 2026",
      reason: "Complaint upheld in the player's favor",
      details: "The investigation confirmed a processing error by the distributor.",
      change: -10,
      balance: 80,
      type: "Complaint",
    },
    {
      id: "SCR-2026-011",
      date: "08 Oct 2026",
      reason: "Late request processing",
      details: "Requests exceeded the expected processing-time target.",
      change: -5,
      balance: 90,
      type: "Service quality",
    },
    {
      id: "SCR-2026-008",
      date: "02 Oct 2026",
      reason: "Positive customer rating",
      details: "A customer left a 5-star review after a smooth transaction.",
      change: 15,
      balance: 95,
      type: "Customer review",
    },
  ] as const;

  const score = scoreHistory[0]?.balance ?? 80;
  const pointsAdded = scoreHistory
    .filter((entry) => entry.change > 0)
    .reduce((total, entry) => total + entry.change, 0);
  const pointsDeducted = Math.abs(
    scoreHistory
      .filter((entry) => entry.change < 0)
      .reduce((total, entry) => total + entry.change, 0),
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl border p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Performance score</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {distributor.name} · points are adjusted based on service quality and verified outcomes.
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span className="text-3xl font-semibold tabular-nums">{score}</span>
              <span className="text-sm text-muted-foreground">/ 100 points</span>
            </div>
            <Badge variant="outline" className="mt-1 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Good standing
            </Badge>
          </div>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Distributor performance score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <div className="h-full rounded-full bg-foreground transition-[width]" style={{ width: `${score}%` }} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Current score</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{score}<span className="ml-1 text-xs font-normal text-muted-foreground">pts</span></p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Points awarded</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{pointsAdded}<span className="ml-1 text-xs font-normal text-muted-foreground">pts</span></p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Points deducted</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">−{pointsDeducted}<span className="ml-1 text-xs font-normal text-muted-foreground">pts</span></p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border">
        <div className="flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Score history</p>
            <p className="text-xs text-muted-foreground">A record of rewards and deductions applied to this account.</p>
          </div>
          <Badge variant="secondary" className="w-fit">{scoreHistory.length} adjustments</Badge>
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 whitespace-nowrap">Date</TableHead>
                <TableHead className="min-w-52">Reason</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-28 whitespace-nowrap">Points</TableHead>
                <TableHead className="w-28 whitespace-nowrap text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{entry.date}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{entry.reason}</p>
                      <Badge variant="outline" className="text-[10px] font-normal">{entry.type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm text-sm leading-5 text-muted-foreground">{entry.details}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={entry.change > 0
                        ? "border-emerald-500/25 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300"
                        : "border-red-500/25 bg-red-500/10 font-semibold text-red-700 dark:text-red-300"}
                    >
                      {entry.change > 0 ? "+" : "−"}{Math.abs(entry.change)} pts
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">{entry.balance} / 100</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="border-t px-4 py-2.5 text-[11px] text-muted-foreground">
          Demo score history for this account. In production, each adjustment should retain its reviewer, evidence, and timestamp.
        </p>
      </section>
    </div>
  );
}

function ComplaintsPanel({ distributor }: { distributor: DistributorRow }) {
  const [complaints, setComplaints] = React.useState<DistributorReport[]>([]);

  React.useEffect(() => {
    const refresh = () => {
      setComplaints(
        readDistributorReports()
          .filter((report) => report.distributorId === distributor.id)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      );
    };

    refresh();
    return subscribeToDistributorReports(refresh);
  }, [distributor.id]);

  const statusClasses: Record<DistributorReport["status"], string> = {
    Open: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    "In progress": "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    "Waiting for player": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {complaints.length} {complaints.length === 1 ? "report" : "reports"} against {distributor.name}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => window.location.assign("/dashboard/disagreements")}
        >
          Open ticket queue
        </Button>
      </div>

      {complaints.map((complaint) => (
        <div key={complaint.id} className="flex items-start gap-4 rounded-xl border p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CircleAlert className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{complaint.reason}</p>
              <Badge variant="outline" className={statusClasses[complaint.status]}>
                {complaint.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {complaint.id} · Reported by {complaint.reporterReference} · {complaint.paymentMethod}
            </p>
            {complaint.details ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-muted-foreground">
                {complaint.details}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Submitted {new Date(complaint.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0">{complaint.priority}</Badge>
        </div>
      ))}

      {complaints.length === 0 ? (
        <div className="rounded-xl border border-dashed px-5 py-10 text-center">
          <CircleAlert className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No reports against this distributor</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Player reports will appear here and in the Disagreements ticket queue.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PaymentMethodsPanel({
  distributor,
}: {
  distributor: (typeof distributors)[number];
}) {
  const methods = distributor.configuration?.paymentMethods ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {methods.slice(0, 6).map((method) => (
        <div key={method.id} className="rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {method.category === "Wallet" ? (
                <WalletCards className="size-5 text-muted-foreground" />
              ) : (
                <CreditCard className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">{method.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {method.category} · {method.providerAccountRef ?? method.id}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Request limit: {method.requestLimit ?? "—"} · Amount limit:{" "}
                {method.amountLimit ? formatCurrency(method.amountLimit) : "—"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({
  distributor,
}: {
  distributor: (typeof distributors)[number];
}) {
  const config = distributor.configuration;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Processing settings</p>
        <div className="mt-4 divide-y">
          <SettingRow
            label="Processing scope"
            value={config?.processingScope ?? "Deposits & Withdrawals"}
          />
          <SettingRow label="Fee mode" value={config?.feeMode ?? "Commission"} />
          <SettingRow
            label="Deposit commission"
            value={
              config?.defaultDepositCommissionRate != null
                ? config.defaultDepositCommissionRate + "%"
                : "—"
            }
          />
          <SettingRow
            label="Withdrawal commission"
            value={
              config?.defaultWithdrawalCommissionRate != null
                ? config.defaultWithdrawalCommissionRate + "%"
                : "—"
            }
          />
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Account controls</p>
        <div className="mt-4 space-y-2">
          <SettingAction
            icon={Check}
            title="Account verified"
            detail="Identity and business details confirmed"
          />
          <SettingAction
            icon={Users}
            title="Linked players"
            detail={String(distributor.players) + " active players"}
          />
          <SettingAction
            icon={WalletCards}
            title="Wallet model"
            detail={distributor.walletModel ?? "Transaction ledger"}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <span className="min-w-0 text-sm font-medium">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Legend({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "dark" | "medium" | "light";
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "dark"
            ? "bg-foreground"
            : tone === "medium"
              ? "bg-muted-foreground"
              : "bg-muted-foreground/50",
        )}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function SettingAction({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </button>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return "$" + Math.round(value / 1_000) + "K";
  return formatCurrency(value);
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

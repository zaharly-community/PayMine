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
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Settings2,
  Search,
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

const activities = [
  ["Invoice INV-2081 passed its due date", "$96,000.00 · first reminder sent", "12 days ago", "warning"],
  ["Invoice INV-2074 issued", "$88,000.00 · September settlement", "18 days ago", "invoice"],
  ["Payment received for INV-2055", "$88,000.00 · bank transfer cleared", "14 May 2026", "success"],
  ["Wallet reconciliation completed", "$28,450.75 · ledger matched", "12 May 2026", "wallet"],
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

          <div className="p-5">
            {mainTab === "Transactions" ? <TransactionsPanel distributor={distributor} /> : null}
            {mainTab === "Analytics" ? <AnalyticsPanel /> : null}
            {mainTab === "Reviews" ? <ReviewsPanel /> : null}
            {mainTab === "Score" ? <ScorePanel distributor={distributor} /> : null}
            {mainTab === "Activity" ? <ActivityPanel /> : null}
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
  processedBy: { name: string; image: string };
};

type TransactionFilter = "All" | "Deposit" | "Withdrawal";

function TransactionsPanel({ distributor }: { distributor: DistributorRow }) {
  const [filter, setFilter] = React.useState<TransactionFilter>("All");
  const [query, setQuery] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);

  // This account page intentionally uses isolated mock transactions. They are not
  // copied back into the global Deposits / Withdrawals datasets.
  const rows = React.useMemo<AccountTransaction[]>(() => {
    const processor = {
      name: distributor.name,
      image: distributor.avatarUrl ?? "",
    };

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
      processedBy: processor,
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
      processedBy: processor,
    }));

    return [...depositRows, ...withdrawalRows].sort(
      (left, right) =>
        parse(right.date, "dd MMM yyyy, hh:mm a", new Date()).getTime() -
        parse(left.date, "dd MMM yyyy, hh:mm a", new Date()).getTime(),
    );
  }, [distributor.avatarUrl, distributor.id, distributor.name]);

  const visibleRows = rows.filter((row) => {
    if (filter !== "All" && row.kind !== filter) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [row.id, row.player, row.method, row.status, row.kind]
      .some((value) => value.toLowerCase().includes(term));
  });

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);
  const pagedRows = visibleRows.slice(currentPageIndex * pageSize, (currentPageIndex + 1) * pageSize);
  const depositCount = rows.filter((row) => row.kind === "Deposit").length;
  const withdrawalCount = rows.filter((row) => row.kind === "Withdrawal").length;
  const from = visibleRows.length === 0 ? 0 : currentPageIndex * pageSize + 1;
  const to = Math.min((currentPageIndex + 1) * pageSize, visibleRows.length);

  const setTransactionFilter = (next: TransactionFilter) => {
    setFilter(next);
    setPageIndex(0);
  };

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
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-3 border-b px-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1">
          {(["All", "Deposit", "Withdrawal"] as TransactionFilter[]).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setTransactionFilter(item)}
              aria-pressed={filter === item}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === item
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item === "Deposit" ? `Deposits · ${depositCount}` : item === "Withdrawal" ? `Withdrawals · ${withdrawalCount}` : `All · ${rows.length}`}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search transactions"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPageIndex(0);
            }}
            placeholder="Search ID, player or method..."
            className="h-8 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="hidden md:block">
        <Table className="w-full border-collapse **:data-[slot='table-cell']:border-b **:data-[slot='table-cell']:border-border/70 **:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:border-b **:data-[slot='table-head']:border-border/70 **:data-[slot='table-head']:px-4">
          <TableHeader className="[&_tr]:border-t">
            <TableRow className="hover:bg-transparent">
              {["Type", "Transaction ID", "Player", "Payment Method", "Date", "Amount", "Fees", "Status", "Processed By"].map((heading) => (
                <TableHead key={heading} className="h-10 whitespace-nowrap py-2.5 text-xs font-medium text-muted-foreground">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length ? pagedRows.map((row) => (
              <TableRow key={row.kind + row.id} className={cn("relative h-7 border-border/60 transition-colors hover:bg-muted/35", getRowIndicator(row))}>
                <TableCell className="px-4 py-0 align-middle leading-none">
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
                <TableCell className="whitespace-nowrap px-4 py-0 font-mono text-xs leading-none">{row.id}</TableCell>
                <TableCell className="px-4 py-0 align-middle leading-none">
                  <div className="flex min-w-36 items-center gap-2.5">
                    <Avatar size="sm" className="size-7 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-medium">{getInitials(row.player)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{row.player}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-0 align-middle leading-none">
                  <div className="flex min-w-32 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-xs border bg-background">
                      {row.methodImage ? <img src={row.methodImage} alt="" className="size-full object-contain p-0.5" loading="lazy" referrerPolicy="no-referrer" /> : <span className="text-[10px] font-semibold">{row.method.slice(0, 1)}</span>}
                    </span>
                    <span className="truncate text-sm">{row.method}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-0 text-sm tabular-nums leading-none">{row.date}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-0 text-right text-sm font-medium tabular-nums leading-none">
                  <span className={row.kind === "Deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {row.kind === "Deposit" ? "+" : "−"}{formatCurrency(row.amount)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-0 text-sm tabular-nums leading-none text-muted-foreground">{row.feeLabel}</TableCell>
                <TableCell className="px-4 py-0 align-middle leading-none">
                  <Badge variant="outline" className={cn("h-5 rounded-4xl px-1.5 py-0.5 text-[11px] font-medium", getTransactionStatusClass(row.status))}>{row.status}</Badge>
                </TableCell>
                <TableCell className="px-4 py-0 align-middle leading-none">
                  <div className="flex min-w-36 items-center gap-2">
                    <Avatar size="sm" className="size-7 shrink-0">
                      <AvatarImage src={row.processedBy.image} alt="" referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-muted text-[10px] font-medium">{getInitials(row.processedBy.name)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{row.processedBy.name}</span>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border/70 md:hidden">
        {pagedRows.length ? pagedRows.map((row) => (
          <article key={row.kind + row.id} className={cn("relative min-w-0 px-3 py-3 transition-colors hover:bg-muted/30", getRowIndicator(row))}>
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
                <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span className="truncate">Processed by {row.processedBy.name}</span>
                  <span className="shrink-0">{row.feeLabel}</span>
                </div>
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

function ActivityPanel() {
  return (
    <div className="space-y-0">
      {activities.map(([title, detail, date, tone]) => (
        <div key={title} className="flex items-start gap-4 border-b py-4 first:pt-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {tone === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : tone === "invoice" ? (
              <FileText className="size-4" />
            ) : tone === "wallet" ? (
              <WalletCards className="size-4" />
            ) : (
              <CreditCard className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
        </div>
      ))}
    </div>
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
  let seed = 0;
  for (const char of distributor.email) seed += char.charCodeAt(0);
  const score = Number(((seed % 101) / 10).toFixed(1));
  const filled = Math.min(10, Math.max(0, Math.round(score)));

  return (
    <div className="max-w-2xl rounded-xl border p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold">Distributor score</p>
          <p className="mt-1 text-xs text-muted-foreground">Operational score for this distributor account.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums">{score.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">out of 10</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-1.5">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-6 w-2 rounded-full",
              index < filled ? "bg-foreground" : "bg-muted",
            )}
          />
        ))}
      </div>
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

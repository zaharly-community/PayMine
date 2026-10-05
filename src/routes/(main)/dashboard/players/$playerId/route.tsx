import * as React from "react";

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Flag,
  Gamepad2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";
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
import { cn } from "cn";

import { players, type PlayerRow } from "../-components/data";

export const Route = createFileRoute("/(main)/dashboard/players/$playerId")({
  component: Page,
});

type LeftTab = "Details" | "Access" | "Notes";
type MainTab = "Transactions" | "Analytics" | "Activity" | "Reports" | "Security";

type PlayerMeta = {
  playerId: string;
  identifier: string;
  score: number;
  deposits: number;
  withdrawals: number;
  location: string;
};

const locations = [
  "Tunis, Tunisia",
  "Sousse, Tunisia",
  "Sfax, Tunisia",
  "Monastir, Tunisia",
  "Bizerte, Tunisia",
  "Nabeul, Tunisia",
] as const;

const chartConfig = {
  deposits: {
    label: "Deposits",
    color: "var(--foreground)",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function Page() {
  const { playerId } = Route.useParams();
  const player = players.find((item) => getPlayerId(item) === playerId) ?? players[0];
  const meta = getPlayerMeta(player);
  const [leftTab, setLeftTab] = React.useState<LeftTab>("Details");
  const [mainTab, setMainTab] = React.useState<MainTab>("Transactions");

  const status = meta.score > 8.5 ? "Suspended" : player.status === "Active" ? "Active" : player.status;

  if (!player) {
    return null;
  }

  const monthlyActivity = buildMonthlyActivity(meta.deposits, meta.withdrawals, player.email);
  const netVolume = meta.deposits - meta.withdrawals;

  return (
    <section
      data-content-padding="false"
      className="flex min-h-full min-w-0 flex-col bg-background text-foreground"
    >
      <div className="grid min-w-0 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="border-b xl:border-b-0 xl:border-r">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <Link
                to="/dashboard/players"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Back to </span>
                Players
              </Link>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground"
                aria-label="More player actions"
                title="More actions"
              >
                <MoreHorizontal />
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <Avatar size="lg" className="size-14 shrink-0">
                <AvatarFallback className="text-base">
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight">{player.name}</h1>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{player.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-xs text-muted-foreground">{player.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant={status === "Suspended" ? "outline" : "destructive"}>
                {status === "Suspended" ? <ShieldCheck /> : <Ban />}
                {status === "Suspended" ? "Restore access" : "Suspend"}
              </Button>
              <Button size="sm" variant="outline">
                <Mail />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Flag />
                Report
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Balance" value={formatCurrency(Math.max(0, netVolume / 2))} />
              <Metric label="Deposits" value={formatCompactCurrency(meta.deposits)} />
              <Metric label="Withdrawals" value={formatCompactCurrency(meta.withdrawals)} />
            </div>
          </div>

          <div className="flex border-y overflow-x-auto">
            {(["Details", "Access", "Notes"] as LeftTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground transition-colors",
                  leftTab === tab && "border-foreground text-foreground",
                )}
              >
                {tab === "Details" ? (
                  <UserRound className="size-4" />
                ) : tab === "Access" ? (
                  <LockKeyhole className="size-4" />
                ) : (
                  <MessageSquare className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {leftTab === "Details" ? (
              <>
                <div className="space-y-5">
                  <DetailRow icon={UserRound} label="Player ID" value={meta.playerId} mono />
                  <DetailRow icon={Gamepad2} label="Identifier" value={meta.identifier} mono />
                  <DetailRow icon={Mail} label="Email" value={player.email} />
                  <DetailRow icon={Globe2} label="Location" value={meta.location} />
                  <DetailRow icon={CalendarDays} label="Joined" value={player.joinedDate} />
                  <DetailRow icon={Activity} label="Last active" value={formatLastActive(player.lastActive)} />
                  <DetailRow icon={Users} label="Team" value={player.team} />
                  <DetailRow icon={CreditCard} label="Workspace" value={player.workspace.join(", ")} />
                </div>

                <div className="mt-7 border-t pt-5">
                  <div className="flex items-center gap-2">
                    <WalletCards className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Account summary</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {player.name} joined {player.workspace.join(" and ")} on {player.joinedDate}. The account
                    currently has a score of {meta.score.toFixed(1)} out of 10 and has processed{" "}
                    {formatCompactCurrency(meta.deposits + meta.withdrawals)} in combined deposits and withdrawals.
                  </p>
                </div>
              </>
            ) : null}

            {leftTab === "Access" ? (
              <div className="space-y-3">
                <AccessItem icon={ShieldCheck} title="Account status" detail={status} positive={status === "Active"} />
                <AccessItem
                  icon={LockKeyhole}
                  title="Account access"
                  detail={status === "Suspended" ? "Access is currently restricted." : "Normal player access is enabled."}
                  positive={status !== "Suspended"}
                />
                <AccessItem
                  icon={Users}
                  title="Assigned team"
                  detail={player.team + " · " + player.role}
                  positive
                />
                <AccessItem
                  icon={Check}
                  title="Workspace membership"
                  detail={player.workspace.join(" · ")}
                  positive
                />
              </div>
            ) : null}

            {leftTab === "Notes" ? (
              <div className="space-y-0">
                {[
                  ["Account created", player.joinedDate],
                  ["Current workspace", player.workspace.join(" · ")],
                  ["Risk score", meta.score.toFixed(1) + " / 10"],
                ].map(([title, detail]) => (
                  <div key={title} className="border-b py-4 first:pt-0">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
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
                <p className="text-xs text-muted-foreground">Payment volume · account lifetime</p>
                <div className="mt-1 text-3xl font-semibold tracking-tight">
                  {formatCompactCurrency(meta.deposits + meta.withdrawals)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Net movement {formatCurrency(netVolume)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 text-left sm:text-right">
                <Metric label="Score" value={meta.score.toFixed(1) + " / 10"} />
                <Metric label="Deposits" value={formatCompactCurrency(meta.deposits)} />
                <Metric label="Withdrawals" value={formatCompactCurrency(meta.withdrawals)} />
              </div>
            </div>

            <div className="mt-5">
              <ChartContainer config={chartConfig} className="h-[160px] w-full">
                <BarChart
                  data={monthlyActivity}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barCategoryGap="42%"
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
                    width={40}
                    tickFormatter={(value) => (value === 0 ? "0" : value >= 1000 ? value / 1000 + "k" : String(value))}
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
                          name === "deposits" ? "Deposits" : "Withdrawals",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="withdrawals"
                    fill="var(--color-withdrawals)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive
                    animationBegin={140}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="deposits"
                    fill="var(--color-deposits)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive
                    animationDuration={820}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="flex overflow-x-auto border-b">
            {(["Transactions", "Analytics", "Activity", "Reports", "Security"] as MainTab[]).map((tab) => (
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
                ) : tab === "Activity" ? (
                  <Activity className="size-4" />
                ) : tab === "Reports" ? (
                  <Flag className="size-4" />
                ) : (
                  <LockKeyhole className="size-4" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {mainTab === "Transactions" ? (
              <TransactionsPanel meta={meta} player={player} />
            ) : null}
            {mainTab === "Analytics" ? (
              <AnalyticsPanel meta={meta} player={player} />
            ) : null}
            {mainTab === "Activity" ? (
              <ActivityPanel player={player} meta={meta} />
            ) : null}
            {mainTab === "Reports" ? (
              <ReportsPanel player={player} status={status} />
            ) : null}
            {mainTab === "Security" ? (
              <SecurityPanel player={player} status={status} />
            ) : null}
          </div>
        </main>
      </div>
    </section>
  );
}

function TransactionsPanel({ meta, player }: { meta: PlayerMeta; player: PlayerRow }) {
  const rows = [
    ["DEP-" + meta.playerId.slice(-4), "Deposit", meta.deposits * 0.18, "Completed", "Today"],
    ["DEP-" + meta.playerId.slice(-5), "Deposit", meta.deposits * 0.11, "Completed", "3 days ago"],
    ["WDR-" + meta.playerId.slice(-4), "Withdrawal", meta.withdrawals * 0.13, "Completed", "6 days ago"],
    ["WDR-" + meta.playerId.slice(-5), "Withdrawal", meta.withdrawals * 0.08, "Completed", "11 days ago"],
  ] as const;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Recent transactions</p>
          <p className="mt-1 text-xs text-muted-foreground">{player.name}'s latest payment activity.</p>
        </div>
        <Button size="sm" variant="outline">
          View all
        </Button>
      </div>

      <div className="divide-y border-y">
        {rows.map(([id, type, amount, status, date]) => (
          <div key={id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 md:grid-cols-[1.1fr_0.8fr_1fr_auto]">
            <div className="min-w-0">
              <p className="text-sm font-medium">{id}</p>
              <p className="mt-1 text-xs text-muted-foreground">{date}</p>
            </div>
            <span className="text-sm text-muted-foreground">{type}</span>
            <span className="text-right text-sm font-medium tabular-nums">{formatCurrency(amount)}</span>
            <Badge variant="outline" className="hidden md:inline-flex">
              {status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPanel({ meta, player }: { meta: PlayerMeta; player: PlayerRow }) {
  const metrics = [
    ["Deposit success", "96.8%"],
    ["Withdrawal success", "94.1%"],
    ["Average deposit", formatCurrency(meta.deposits / 42)],
    ["Average withdrawal", formatCurrency(meta.withdrawals / 18)],
  ];

  return (
    <div className="space-y-4">
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
            <p className="text-sm font-semibold">Account analytics</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {player.name}'s activity split across deposits and withdrawals.
            </p>
          </div>
          <BarChart3 className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-5 flex items-center gap-6 text-xs">
          <Legend label="Deposits" value={formatCurrency(meta.deposits)} />
          <Legend label="Withdrawals" value={formatCurrency(meta.withdrawals)} />
        </div>
      </div>
    </div>
  );
}

function ActivityPanel({ player, meta }: { player: PlayerRow; meta: PlayerMeta }) {
  const activities = [
    ["Account activity", player.lastActive === 0 ? "Active now" : formatLastActive(player.lastActive), Activity],
    ["Deposit activity", formatCompactCurrency(meta.deposits) + " total deposits", WalletCards],
    ["Withdrawal activity", formatCompactCurrency(meta.withdrawals) + " total withdrawals", CreditCard],
    ["Workspace", player.workspace.join(" · "), Users],
  ] as const;

  return (
    <div className="space-y-0">
      {activities.map(([title, detail, Icon]) => (
        <div key={title} className="flex items-start gap-4 border-b py-4 first:pt-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel({ player, status }: { player: PlayerRow; status: string }) {
  const reports = [
    ["Player review", status === "Suspended" ? "Requires attention" : "No open issues", status],
    ["Account checks", "Identity and account checks available", "Ready"],
    ["Operational notes", "No manual notes recorded", "Clear"],
  ] as const;

  return (
    <div className="space-y-2">
      {reports.map(([title, detail, state]) => (
        <div key={title} className="flex items-center gap-4 rounded-xl border p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            {state === "Requires attention" ? (
              <XCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {state}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function SecurityPanel({ player, status }: { player: PlayerRow; status: string }) {
  const controls = [
    {
      title: "Account access",
      detail: status === "Suspended" ? "Suspended" : "Normal access",
      icon: LockKeyhole,
    },
    {
      title: "Workspace membership",
      detail: player.workspace.join(" · "),
      icon: Users,
    },
    {
      title: "Role",
      detail: player.role,
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {controls.map(({ title, detail, icon: Icon }) => (
        <div key={title} className="rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccessItem({
  icon: Icon,
  title,
  detail,
  positive,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      {positive ? <Check className="size-4 shrink-0" /> : null}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <span className={cn("min-w-0 text-sm font-medium", mono && "font-mono text-xs")}>{value}</span>
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

function Legend({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="size-2 rounded-full bg-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "Active";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-sm px-2 py-0.5 font-medium",
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-orange-500")} />
      {status}
    </Badge>
  );
}

function getPlayerId(player: PlayerRow) {
  return "PLR" + player.email.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
}

function getPlayerMeta(player: PlayerRow): PlayerMeta {
  let seed = 0;

  for (const char of player.email) {
    seed += char.charCodeAt(0);
  }

  return {
    playerId: getPlayerId(player),
    identifier:
      seed % 2 === 0
        ? getPlayerId(player)
        : player.name.toLowerCase().replace(/[^a-z0-9]+/g, ".") + "-" + String(seed % 90 + 10),
    score: Number(((seed % 101) / 10).toFixed(1)),
    deposits: 250 + (seed % 18500),
    withdrawals: 120 + (seed % 9200),
    location: locations[seed % locations.length] ?? locations[0],
  };
}

function buildMonthlyActivity(deposits: number, withdrawals: number, email: string) {
  let seed = 0;

  for (const char of email) {
    seed += char.charCodeAt(0);
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return months.map((month, index) => {
    const depositWeight = 0.45 + ((seed + index * 13) % 20) / 100;
    const withdrawalWeight = 0.35 + ((seed + index * 7) % 16) / 100;

    return {
      month,
      deposits: Math.round((deposits / 12) * depositWeight),
      withdrawals: Math.round((withdrawals / 12) * withdrawalWeight),
    };
  });
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

function formatLastActive(minutes: number) {
  if (minutes === 0) return "Active now";
  if (minutes < 60) return minutes + " min ago";

  const days = Math.floor(minutes / (60 * 24));
  if (days > 0) return days + (days === 1 ? " day ago" : " days ago");

  const hours = Math.floor(minutes / 60);
  return hours + (hours === 1 ? " hour ago" : " hours ago");
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

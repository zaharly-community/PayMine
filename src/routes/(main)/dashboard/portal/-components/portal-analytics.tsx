
import { ArrowDownRight, ArrowUpRight, CreditCard, Globe2, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const revenue = [
  { label: "Sep 1", value: 18400 },
  { label: "Sep 4", value: 21200 },
  { label: "Sep 7", value: 19800 },
  { label: "Sep 10", value: 25600 },
  { label: "Sep 13", value: 28900 },
  { label: "Sep 16", value: 31800 },
  { label: "Sep 19", value: 30100 },
  { label: "Sep 22", value: 35600 },
  { label: "Sep 25", value: 39200 },
];

const countries = [
  { name: "Tanzania", value: 42, customers: "1,840" },
  { name: "Kenya", value: 24, customers: "1,052" },
  { name: "Uganda", value: 15, customers: "658" },
  { name: "Rwanda", value: 10, customers: "439" },
  { name: "Other", value: 9, customers: "395" },
];

const funnel = [
  { label: "Checkout sessions", value: 100, count: "5,240" },
  { label: "Payment method selected", value: 82, count: "4,297" },
  { label: "Payment details submitted", value: 68, count: "3,563" },
  { label: "Payment completed", value: 61, count: "3,191" },
];

const channels = [
  { name: "Mobile Money", share: 46, amount: "TZS 182.4M" },
  { name: "Cards", share: 31, amount: "TZS 123.0M" },
  { name: "Bank Transfer", share: 15, amount: "TZS 59.5M" },
  { name: "Other", share: 8, amount: "TZS 31.7M" },
];

export function PortalAnalytics() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Portal analytics</h2>
          <p className="text-xs text-muted-foreground">
            Checkout performance, customer distribution, revenue and payment channel mix.
          </p>
        </div>
        <Badge variant="outline">Last 25 days</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,.8fr)]">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm">Revenue over time (TZS)</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Gross processed value through hosted checkout.</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">TZS 275.6M</p>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3.5" />
                  14.8% vs previous period
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm">Customers by Country</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Unique checkout customers by market.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {countries.map((country) => (
              <div key={country.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium">{country.name}</span>
                  <span className="tabular-nums text-muted-foreground">{country.customers}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: country.value + "%" }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-1 text-[11px] text-muted-foreground">
              Top markets represent {countries.slice(0, 4).reduce((sum, item) => sum + item.value, 0)}% of active customers.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm">Checkout Funnel</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Drop-off across the hosted checkout journey.</p>
              </div>
              <WalletCards className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {funnel.map((step, index) => (
              <div key={step.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-xs">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted/30 text-[10px] font-semibold">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">{step.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    <span className="font-medium tabular-nums">{step.count}</span>
                    <span className="text-muted-foreground tabular-nums">{step.value}%</span>
                  </div>
                </div>
                <div className="ml-7 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: step.value + "%" }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-start gap-2 rounded-lg border bg-muted/20 px-3 py-2.5 text-xs">
              <ArrowDownRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Overall checkout completion is <span className="font-semibold text-foreground">61%</span> from session start to successful payment.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm">Payment Channels</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Processed volume split by channel.</p>
              </div>
              <CreditCard className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              {channels.map((channel, index) => (
                <div
                  key={channel.name}
                  className={
                    index === 0
                      ? "h-full bg-primary"
                      : index === 1
                        ? "h-full bg-primary/75"
                        : index === 2
                          ? "h-full bg-primary/50"
                          : "h-full bg-primary/30"
                  }
                  style={{ width: channel.share + "%" }}
                  title={channel.name + " " + channel.share + "%"}
                />
              ))}
            </div>

            <div className="space-y-3">
              {channels.map((channel, index) => (
                <div key={channel.name} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={
                        index === 0
                          ? "size-2.5 rounded-full bg-primary"
                          : index === 1
                            ? "size-2.5 rounded-full bg-primary/75"
                            : index === 2
                              ? "size-2.5 rounded-full bg-primary/50"
                              : "size-2.5 rounded-full bg-primary/30"
                      }
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{channel.name}</p>
                      <p className="text-[11px] text-muted-foreground">{channel.amount}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{channel.share}%</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
              <Globe2 className="size-3.5 shrink-0" />
              Channel mix is calculated from successful checkout transactions only.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function RevenueChart() {
  const values = revenue.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 860;
  const height = 280;
  const paddingX = 32;
  const paddingY = 20;
  const points = values.map((value, index) => {
    const x = paddingX + (index / (values.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((value - min) / Math.max(max - min, 1)) * (height - paddingY * 2);
    return { x, y };
  });
  const path = points.map((point, index) => (index === 0 ? "M " : "L ") + point.x + " " + point.y).join(" ");
  const areaPath =
    path +
    " L " +
    points[points.length - 1]?.x +
    " " +
    (height - paddingY) +
    " L " +
    points[0]?.x +
    " " +
    (height - paddingY) +
    " Z";

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-muted/10 p-2">
        <svg viewBox={"0 0 " + width + " " + height} className="h-[260px] w-full" role="img" aria-label="Revenue over time">
          <defs>
            <linearGradient id="portal-revenue-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line / 3) * (height - paddingY * 2);
            return (
              <line
                key={line}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.10"
                strokeDasharray="4 6"
              />
            );
          })}
          <path d={areaPath} fill="url(#portal-revenue-area)" className="text-primary" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
          {points.map((point, index) => (
            <circle
              key={revenue[index]?.label}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-primary"
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground sm:grid-cols-5 lg:grid-cols-9">
        {revenue.map((item) => (
          <div key={item.label} className="text-center">
            <div className="font-medium tabular-nums text-foreground">
              {(item.value / 1000).toFixed(1)}K
            </div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

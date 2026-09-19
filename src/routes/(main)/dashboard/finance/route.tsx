import { ArrowRight, BarChart3, CircleDollarSign, Landmark, ReceiptText, WalletCards } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const operations = [
  { title: "Transactions", description: "Unified financial ledger for deposits and withdrawals.", href: "/dashboard/finance/transactions", icon: ReceiptText },
  { title: "Treasury", description: "Current provider balances, reserves and reconciliation state.", href: "/dashboard/finance/treasury", icon: Landmark },
  { title: "Settlements", description: "Settlement history and settlement control records.", href: "/dashboard/finance/settlements", icon: CircleDollarSign },
  { title: "Reports", description: "Central library of financial analysis reports.", href: "/dashboard/finance/reports", icon: BarChart3 },
] as const;

const kpis = [
  ["Gross volume", "$428,640", "Today"],
  ["Net flow", "$86,920", "Today"],
  ["Fees", "$5,842", "Today"],
  ["Net retained", "$1,002", "Today"],
];

export const Route = createFileRoute("/(main)/dashboard/finance")({
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";

function Page() {
  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Financial control center for platform transactions, treasury, settlements and reporting.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, period]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <span className="text-xl font-semibold tabular-nums">{value}</span>
              <span className="text-[10px] text-muted-foreground">{period}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div><h2 className="text-sm font-semibold">Finance operations</h2><p className="text-xs text-muted-foreground">Each area owns one financial responsibility.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operations.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="pt-2 text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm leading-6 text-muted-foreground">{item.description}</p></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Financial control notes</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          <div><p className="font-medium text-foreground">Transactions</p><p className="mt-1">The source ledger; deposits and withdrawals stay operationally separate.</p></div>
          <div><p className="font-medium text-foreground">Treasury</p><p className="mt-1">Shows current provider position and blocks settlement when reconciliation is not clean.</p></div>
          <div><p className="font-medium text-foreground">Reports</p><p className="mt-1">Analysis only. Reports do not replace operational pages or change balances.</p></div>
        </CardContent>
      </Card>
      <p className="text-[11px] text-muted-foreground">Frontend-only mockup for PayMine. No provider, wallet or settlement operation is executed.</p>
    </section>
  );
}

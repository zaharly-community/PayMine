import { createFileRoute } from "@tanstack/react-router";
import { Check, Package, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  { name: "Starter", price: "$29", users: "Up to 5 users", subscriptions: "312 active", revenue: "$9.0K MRR", features: ["Core payment operations", "Basic reports", "Email support"] },
  { name: "Growth", price: "$79", users: "Up to 25 users", subscriptions: "1,204 active", revenue: "$95.1K MRR", features: ["Advanced analytics", "Automation", "Priority support"] },
  { name: "Scale", price: "$199", users: "Unlimited users", subscriptions: "524 active", revenue: "$104.3K MRR", features: ["Custom limits", "Dedicated controls", "Advanced reports"] },
] as const;

export const Route = createFileRoute("/(main)/dashboard/packages" as any)({
  component: Page,
});

function Page() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Define the commercial plans offered to brands and measure their contribution.</p>
        </div>
        <Button><Plus /> New package</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan, index) => (
          <Card key={plan.name} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Package className="size-4" /></div>
                {index === 1 ? <Badge>Most popular</Badge> : <Button variant="ghost" size="icon-sm"><Pencil /></Button>}
              </div>
              <h2 className="pt-3 text-lg font-semibold">{plan.name}</h2>
              <p className="text-3xl font-semibold tracking-tight">{plan.price}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 border-y py-4 text-sm">
                <div><p className="text-muted-foreground">Subscribers</p><p className="mt-1 font-medium">{plan.subscriptions}</p></div>
                <div><p className="text-muted-foreground">Revenue</p><p className="mt-1 font-medium">{plan.revenue}</p></div>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">{plan.users}</p>
              <div className="mt-3 space-y-2">
                {plan.features.map((feature) => <div key={feature} className="flex items-center gap-2 text-sm"><Check className="size-4" /><span>{feature}</span></div>)}
              </div>
              <Button variant="outline" className="mt-5 w-full">Manage package</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

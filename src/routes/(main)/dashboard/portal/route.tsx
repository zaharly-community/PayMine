import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Link2, Palette, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PaymentFormBuilder } from "./-components/payment-form-builder";
import { defaultPaymentForms } from "./-components/portal-data";

export const Route = createFileRoute("/(main)/dashboard/portal")({ component: Page });

function Page() {
  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight">Portal</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Create and manage hosted payment forms for deposits, then preview the player checkout before publishing.</p></div>
      <Badge variant="secondary"><ShieldCheck className="size-3.5" /> Payment portal</Badge>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {[["Hosted forms", "3 templates", Link2], ["Custom branding", "Enabled", Palette], ["Checkout domain", "pay.paymine.test", Globe2]].map(([label, value, Icon]) =>
        <Card key={String(label)}><CardHeader className="pb-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</div></CardHeader><CardContent><p className="text-sm font-semibold">{value}</p></CardContent></Card>)}
    </div>

    <PaymentFormBuilder initialForms={defaultPaymentForms} />
    <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">Default mock data is provided for UI preview only. Publishing, payment processing and credential storage are not connected to a backend.</div>
  </section>;
}

import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingCard, SettingsShell } from "../-components/settings-shell";
import { billingInvoices } from "../-components/settings-data";

export const Route = createFileRoute("/(main)/dashboard/settings/billing")({ component: Page });

function Page() {
  return <SettingsShell active="billing" title="Billing" description="Plan, invoice history and billing contact configuration.">
    <div className="grid gap-4 xl:grid-cols-3">
      <SettingCard title="Current plan">
        <div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-semibold">$1,480<span className="text-sm font-normal text-muted-foreground">/month</span></p><p className="mt-1 text-xs text-muted-foreground">Business · Annual billing cycle</p></div><Badge>Active</Badge></div>
        <Button className="mt-4" size="sm">Manage plan</Button>
      </SettingCard>
      <SettingCard title="Billing contact">
        <p className="text-sm font-medium">finance@paymine.example</p><p className="mt-1 text-xs text-muted-foreground">Invoices and payment notices are sent to this address.</p>
        <Button className="mt-4" variant="outline" size="sm">Edit contact</Button>
      </SettingCard>
      <SettingCard title="Payment method">
        <p className="text-sm font-medium">Visa ending 4242</p><p className="mt-1 text-xs text-muted-foreground">Next charge · 30 Sep 2026</p>
        <Button className="mt-4" variant="outline" size="sm">Update method</Button>
      </SettingCard>
    </div>
    <div className="mt-4"><SettingCard title="Invoices" description="Default mock invoice history."><div className="divide-y">{billingInvoices.map((invoice) =>
      <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><ReceiptText className="size-4" /></div><div><p className="text-sm font-medium">{invoice.id}</p><p className="text-xs text-muted-foreground">{invoice.period} · Due {invoice.due}</p></div></div>
        <div className="flex items-center gap-3"><span className="text-sm font-medium">{invoice.amount}</span><Badge variant={invoice.status === "Paid" ? "secondary" : "outline"}>{invoice.status === "Paid" ? <CheckCircle2 className="size-3.5" /> : null}{invoice.status}</Badge><Button variant="ghost" size="icon"><Download className="size-4" /></Button></div>
      </div>)}</div></SettingCard></div>
  </SettingsShell>;
}

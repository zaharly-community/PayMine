import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Package, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type PackageFeature = {
  id: string;
  label: string;
  enabled: boolean;
};

type PackagePlan = {
  name: string;
  priceType: "one-time" | "monthly" | "yearly";
  price: number;
  annualDiscountPercent: number;
  users: string;
  subscriptions: string;
  revenue: string;
  transactionLimitType: "number" | "turnover";
  transactionLimit: number;
  depositFeePercent: number;
  withdrawalFeePercent: number;
  paymentMethodAccounts: number;
  customDomain: boolean;
  integrations: boolean;
  features: PackageFeature[];
};

const defaultFeatures: PackageFeature[] = [
  { id: "analytics", label: "Advanced analytics", enabled: true },
  { id: "automation", label: "Automation", enabled: true },
  { id: "reports", label: "Advanced reports", enabled: true },
  { id: "reconciliation", label: "Reconciliation", enabled: false },
  { id: "settlements", label: "Settlements", enabled: false },
  { id: "api", label: "API access", enabled: false },
  { id: "priority", label: "Priority support", enabled: false },
];

const initialPlans: PackagePlan[] = [
  {
    name: "Starter",
    priceType: "monthly",
    price: 29,
    annualDiscountPercent: 15,
    users: "Up to 5 users",
    subscriptions: "312 active",
    revenue: "$9.0K MRR",
    transactionLimitType: "number",
    transactionLimit: 1000,
    depositFeePercent: 0.5,
    withdrawalFeePercent: 1,
    paymentMethodAccounts: 2,
    customDomain: false,
    integrations: false,
    features: defaultFeatures.map((feature) => ({ ...feature, enabled: ["analytics", "reports"].includes(feature.id) })),
  },
  {
    name: "Growth",
    priceType: "monthly",
    price: 79,
    annualDiscountPercent: 15,
    users: "Up to 25 users",
    subscriptions: "1,204 active",
    revenue: "$95.1K MRR",
    transactionLimitType: "turnover",
    transactionLimit: 250000,
    depositFeePercent: 0.35,
    withdrawalFeePercent: 0.75,
    paymentMethodAccounts: 5,
    customDomain: true,
    integrations: true,
    features: defaultFeatures.map((feature) => ({ ...feature, enabled: ["analytics", "automation", "reports", "reconciliation", "priority"].includes(feature.id) })),
  },
  {
    name: "Scale",
    priceType: "yearly",
    price: 1990,
    annualDiscountPercent: 0,
    users: "Unlimited users",
    subscriptions: "524 active",
    revenue: "$104.3K MRR",
    transactionLimitType: "turnover",
    transactionLimit: 1000000,
    depositFeePercent: 0.2,
    withdrawalFeePercent: 0.5,
    paymentMethodAccounts: 10,
    customDomain: true,
    integrations: true,
    features: defaultFeatures.map((feature) => ({ ...feature, enabled: true })),
  },
];

const featureCatalog = [
  { id: "analytics", label: "Advanced analytics" },
  { id: "automation", label: "Automation" },
  { id: "reports", label: "Advanced reports" },
  { id: "reconciliation", label: "Reconciliation" },
  { id: "settlements", label: "Settlements" },
  { id: "api", label: "API access" },
  { id: "priority", label: "Priority support" },
] as const;

export const Route = createFileRoute("/(main)/dashboard/packages")({
  component: Page,
});

function Page() {
  const [plans, setPlans] = React.useState<PackagePlan[]>(initialPlans);
  const [createOpen, setCreateOpen] = React.useState(false);

  const addPlan = React.useCallback((plan: PackagePlan) => {
    setPlans((current) => [...current, plan]);
    setCreateOpen(false);
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Define the commercial plans offered to brands and control their platform limits.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New package
        </Button>
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
              <PricingSummary plan={plan} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 border-y py-4 text-sm">
                <div><p className="text-muted-foreground">Subscribers</p><p className="mt-1 font-medium">{plan.subscriptions}</p></div>
                <div><p className="text-muted-foreground">Revenue</p><p className="mt-1 font-medium">{plan.revenue}</p></div>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">{plan.users}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border px-3 py-2">
                  <p className="text-muted-foreground">Transaction limit</p>
                  <p className="mt-1 font-medium">{plan.transactionLimit.toLocaleString()} {plan.transactionLimitType}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-muted-foreground">Payment accounts</p>
                  <p className="mt-1 font-medium">{plan.paymentMethodAccounts} / method</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {plan.features.filter((feature) => feature.enabled).slice(0, 4).map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2 text-sm"><Check className="size-4" /><span>{feature.label}</span></div>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <span className={plan.customDomain ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>{plan.customDomain ? "✓" : "×"} Custom domain</span>
                  <span className={plan.integrations ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>{plan.integrations ? "✓" : "×"} Integrations</span>
                </div>
              </div>
              <Button variant="outline" className="mt-5 w-full">Manage package</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreatePackageModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={addPlan}
      />
    </section>
  );
}

function PricingSummary({ plan }: { plan: PackagePlan }) {
  if (plan.priceType === "one-time") {
    return (
      <div>
        <p className="text-3xl font-semibold tracking-tight">${plan.price.toLocaleString()}</p>
        <p className="mt-1 text-sm font-medium">One-time payment</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Paid once · access remains valid indefinitely</p>
      </div>
    );
  }

  if (plan.priceType === "yearly") {
    return (
      <div>
        <p className="text-3xl font-semibold tracking-tight">${plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / year</span></p>
        <p className="mt-1 text-xs text-muted-foreground">Billed once every year</p>
      </div>
    );
  }

  const yearlyPrice = plan.price * 12 * (1 - plan.annualDiscountPercent / 100);

  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight">${plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
      <p className="mt-1 text-xs text-muted-foreground">
        ${yearlyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} / year
        {plan.annualDiscountPercent > 0 ? <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">({plan.annualDiscountPercent}% off)</span> : null}
      </p>
    </div>
  );
}

function CreatePackageModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (plan: PackagePlan) => void;
}) {
  const [name, setName] = React.useState("");
  const [priceType, setPriceType] = React.useState<PackagePlan["priceType"]>("monthly");
  const [price, setPrice] = React.useState("");
  const [annualDiscountPercent, setAnnualDiscountPercent] = React.useState("0");
  const [usersLimit, setUsersLimit] = React.useState("");
  const [transactionLimitType, setTransactionLimitType] = React.useState<PackagePlan["transactionLimitType"]>("number");
  const [transactionLimit, setTransactionLimit] = React.useState("");
  const [depositFeePercent, setDepositFeePercent] = React.useState("");
  const [withdrawalFeePercent, setWithdrawalFeePercent] = React.useState("");
  const [paymentMethodAccounts, setPaymentMethodAccounts] = React.useState("1");
  const [customDomain, setCustomDomain] = React.useState(false);
  const [integrations, setIntegrations] = React.useState(false);
  const [features, setFeatures] = React.useState<Record<string, boolean>>(
    Object.fromEntries(featureCatalog.map((feature) => [feature.id, false])),
  );

  const reset = () => {
    setName("");
    setPriceType("monthly");
    setPrice("");
    setAnnualDiscountPercent("0");
    setUsersLimit("");
    setTransactionLimitType("number");
    setTransactionLimit("");
    setDepositFeePercent("");
    setWithdrawalFeePercent("");
    setPaymentMethodAccounts("1");
    setCustomDomain(false);
    setIntegrations(false);
    setFeatures(Object.fromEntries(featureCatalog.map((feature) => [feature.id, false])));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const annualPricePreview =
    priceType === "monthly" && Number(price) > 0
      ? Number(price) * 12 * (1 - Math.min(100, Math.max(0, Number(annualDiscountPercent) || 0)) / 100)
      : 0;

  const canCreate =
    name.trim().length > 0 &&
    Number(price) > 0 &&
    (priceType !== "monthly" || (Number(annualDiscountPercent) >= 0 && Number(annualDiscountPercent) <= 100)) &&
    Number(transactionLimit) > 0 &&
    Number(usersLimit) >= 0 &&
    Number(paymentMethodAccounts) > 0 &&
    Number(depositFeePercent) >= 0 &&
    Number(withdrawalFeePercent) >= 0;

  const handleCreate = () => {
    if (!canCreate) return;

    const plan: PackagePlan = {
      name: name.trim(),
      priceType,
      price: Number(price),
      annualDiscountPercent: priceType === "monthly" ? Number(annualDiscountPercent) : 0,
      users: usersLimit.trim() ? "Up to " + Number(usersLimit).toLocaleString() + " users" : "Unlimited users",
      subscriptions: "0 active",
      revenue: priceType === "monthly" ? "$0 MRR" : "$0 revenue",
      transactionLimitType,
      transactionLimit: Number(transactionLimit),
      depositFeePercent: Number(depositFeePercent),
      withdrawalFeePercent: Number(withdrawalFeePercent),
      paymentMethodAccounts: Number(paymentMethodAccounts),
      customDomain,
      integrations,
      features: featureCatalog.map((feature) => ({
        id: feature.id,
        label: feature.label,
        enabled: Boolean(features[feature.id]),
      })),
    };

    onCreate(plan);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,1180px)] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-lg">Create new package</DialogTitle>
          <DialogDescription>Configure pricing, transaction limits, transfer fees, payment method access, and package features.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-10">
            <section className="space-y-4">
              <SectionHeading title="General" description="Set the package identity and user capacity." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Package name">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Enterprise" />
                </Field>
                <Field label="User limit">
                  <Input type="number" min="0" step="1" value={usersLimit} onChange={(event) => setUsersLimit(event.target.value)} placeholder="Unlimited" />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading title="Pricing" description="Choose how the package is billed. One-time plans never expire." />
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["monthly", "Monthly"],
                  ["yearly", "Yearly"],
                  ["one-time", "One-time"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriceType(value)}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left transition-colors",
                      priceType === value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50",
                    )}
                    aria-pressed={priceType === value}
                  >
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {value === "monthly" ? "Recurring every month" : value === "yearly" ? "Recurring every year" : "Pay once, valid forever"}
                    </span>
                  </button>
                ))}
              </div>

              {priceType === "monthly" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Monthly price">
                    <Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="79" />
                  </Field>
                  <Field label="Annual discount (%)">
                    <Input type="number" min="0" max="100" step="0.5" value={annualDiscountPercent} onChange={(event) => setAnnualDiscountPercent(event.target.value)} placeholder="15" />
                  </Field>
                  <div className="sm:col-span-2 rounded-lg border bg-muted/20 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Annual billing preview</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Same plan, billed once per year with the discount above.</p>
                      </div>
                      <p className="text-right text-lg font-semibold tabular-nums">
                        {annualPricePreview > 0 ? "$" + annualPricePreview.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                        <span className="text-xs font-normal text-muted-foreground"> / year</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {priceType === "yearly" ? (
                <Field label="Yearly price">
                  <Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="790" />
                </Field>
              ) : null}

              {priceType === "one-time" ? (
                <div className="grid gap-4">
                  <Field label="One-time price">
                    <Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="499" />
                  </Field>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Permanent access</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">The customer pays once. The package has no renewal date and remains valid indefinitely.</p>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-4">
              <SectionHeading title="Transaction limits" description="Limit usage by transaction count or monthly turnover." />
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <Field label="Limit type">
                  <Select value={transactionLimitType} onValueChange={(value) => setTransactionLimitType(value as PackagePlan["transactionLimitType"])}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number of transactions</SelectItem>
                      <SelectItem value="turnover">Monthly turnover</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={transactionLimitType === "number" ? "Maximum transactions / month" : "Maximum turnover / month"}>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={transactionLimit}
                    onChange={(event) => setTransactionLimit(event.target.value)}
                    placeholder={transactionLimitType === "number" ? "10,000" : "500,000"}
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading title="Monthly transfer fees" description="Set the percentage charged on deposits and withdrawals each month." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Deposit fee (%)">
                  <Input type="number" min="0" max="100" step="0.01" value={depositFeePercent} onChange={(event) => setDepositFeePercent(event.target.value)} placeholder="0.35" />
                </Field>
                <Field label="Withdrawal fee (%)">
                  <Input type="number" min="0" max="100" step="0.01" value={withdrawalFeePercent} onChange={(event) => setWithdrawalFeePercent(event.target.value)} placeholder="0.75" />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading title="Payment methods" description="Control how many provider accounts a brand may configure per payment method." />
              <Field label="Allowed accounts per payment method">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={paymentMethodAccounts}
                  onChange={(event) => setPaymentMethodAccounts(event.target.value)}
                  className="max-w-xs"
                  placeholder="5"
                />
              </Field>
            </section>

            <section className="space-y-4">
              <SectionHeading title="Access & features" description="Enable optional platform capabilities for this package." />
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleRow label="Custom domain" description="Allow the brand to use its own domain." checked={customDomain} onCheckedChange={setCustomDomain} />
                <ToggleRow label="Integrations" description="Allow access to external integrations and connectors." checked={integrations} onCheckedChange={setIntegrations} />
                {featureCatalog.map((feature) => (
                  <ToggleRow
                    key={feature.id}
                    label={feature.label}
                    description="Enable this capability for subscribers on the package."
                    checked={Boolean(features[feature.id])}
                    onCheckedChange={(checked) => setFeatures((current) => ({ ...current, [feature.id]: checked }))}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button disabled={!canCreate} onClick={handleCreate}>
            <Plus />
            Create package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

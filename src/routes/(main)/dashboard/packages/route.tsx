import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Package, Pencil, Plus } from "lucide-react";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  description: string;
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
    description: "Essential payment operations for small brands.",
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
    description: "Advanced controls, automation, and reporting for growing brands.",
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
    description: "Full platform access with advanced controls and enterprise capabilities.",
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
              <p className="mt-4 text-sm leading-5 text-muted-foreground">{plan.description}</p>
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
  const [description, setDescription] = React.useState("");
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
    setDescription("");
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
      description: description.trim(),
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
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:w-[min(92vw,1100px)] sm:!max-w-[1100px]">
        <DialogHeader className="border-b px-7 py-5">
          <div className="pr-8">
            <DialogTitle className="text-lg">Create new package</DialogTitle>
            <DialogDescription className="mt-1 max-w-2xl">
              Build the commercial plan, usage limits, wallet fees, payment access, and available features.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto bg-muted/10 px-4 py-4 sm:px-7 sm:py-6">
          <div className="space-y-5">
            <FormSection
              step="01"
              title="Package details"
              description="Set the package name and a short description that explains who it is for."
            >
              <div className="space-y-4">
                <Field label="Package name">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Enterprise"
                    className="h-9"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the package, its target customer, or the main value it provides."
                    rows={3}
                    className="min-h-20 resize-none"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              step="02"
              title="Pricing & billing"
              description="Choose one billing model. Monthly plans can also offer a discounted annual option."
            >
              <div className="grid gap-2 md:grid-cols-3">
                {([
                  ["monthly", "Monthly", "Recurring every month"],
                  ["yearly", "Yearly", "Recurring every year"],
                  ["one-time", "One-time", "Pay once · valid forever"],
                ] as const).map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriceType(value)}
                    className={cn(
                      "rounded-lg border bg-background px-4 py-3 text-left transition-all",
                      "hover:border-foreground/20 hover:bg-muted/30",
                      priceType === value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/80",
                    )}
                    aria-pressed={priceType === value}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold">{label}</span>
                      {priceType === value ? <span className="mt-0.5 size-2 rounded-full bg-primary" /> : null}
                    </div>
                    <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>

              {priceType === "monthly" ? (
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
                  <Field label="Monthly price">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="79"
                      className="h-9"
                    />
                  </Field>
                  <Field label="Annual discount">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={annualDiscountPercent}
                        onChange={(event) => setAnnualDiscountPercent(event.target.value)}
                        placeholder="15"
                        className="h-9 pr-9"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">%</span>
                    </div>
                  </Field>
                  <div className="md:col-span-2 flex flex-col gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">Annual billing</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Same plan billed yearly with the discount above.
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-semibold tabular-nums">
                        {annualPricePreview > 0 ? "$" + annualPricePreview.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        / year {annualDiscountPercent !== "0" && Number(annualDiscountPercent) > 0 ? "· " + annualDiscountPercent + "% off" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {priceType === "yearly" ? (
                <div className="mt-4">
                  <Field label="Yearly price">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="790"
                      className="h-9 max-w-xs"
                    />
                  </Field>
                </div>
              ) : null}

              {priceType === "one-time" ? (
                <div className="mt-4 grid gap-3">
                  <Field label="One-time price">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="499"
                      className="h-9 max-w-xs"
                    />
                  </Field>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Permanent access</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      The customer pays once. There is no renewal date, and access remains valid indefinitely.
                    </p>
                  </div>
                </div>
              ) : null}
            </FormSection>

            <div className="grid gap-5 lg:grid-cols-2">
              <FormSection
                step="03"
                title="Transaction limits"
                description="Choose whether the monthly cap is based on transaction count or turnover."
              >
                <div className="grid gap-4">
                  <Field label="Limit type">
                    <Select
                      value={transactionLimitType}
                      onValueChange={(value) =>
                        setTransactionLimitType(value as PackagePlan["transactionLimitType"])
                      }
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number of transactions</SelectItem>
                        <SelectItem value="turnover">Monthly turnover</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label={
                      transactionLimitType === "number"
                        ? "Maximum transactions / month"
                        : "Maximum turnover / month"
                    }
                  >
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={transactionLimit}
                      onChange={(event) => setTransactionLimit(event.target.value)}
                      placeholder={transactionLimitType === "number" ? "10,000" : "500,000"}
                      className="h-9"
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                step="04"
                title="Transfer fees"
                description="Set the percentage charged on deposits and withdrawals."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Deposit">
                    <PercentInput value={depositFeePercent} onChange={setDepositFeePercent} placeholder="0.35" />
                  </Field>
                  <Field label="Withdrawal">
                    <PercentInput value={withdrawalFeePercent} onChange={setWithdrawalFeePercent} placeholder="0.75" />
                  </Field>
                </div>
              </FormSection>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <FormSection
                step="05"
                title="Payment methods"
                description="Limit the number of provider accounts allowed per payment method."
              >
                <Field label="Accounts per method">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentMethodAccounts}
                    onChange={(event) => setPaymentMethodAccounts(event.target.value)}
                    placeholder="5"
                    className="h-9 max-w-xs"
                  />
                </Field>
              </FormSection>

              <FormSection
                step="06"
                title="Access & features"
                description="Control optional platform capabilities included with the package."
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <ToggleRow
                    label="Custom domain"
                    description="Use a custom brand domain."
                    checked={customDomain}
                    onCheckedChange={setCustomDomain}
                  />
                  <ToggleRow
                    label="Integrations"
                    description="Access external integrations."
                    checked={integrations}
                    onCheckedChange={setIntegrations}
                  />
                  {featureCatalog.map((feature) => (
                    <ToggleRow
                      key={feature.id}
                      label={feature.label}
                      description="Available to package subscribers."
                      checked={Boolean(features[feature.id])}
                      onCheckedChange={(checked) =>
                        setFeatures((current) => ({ ...current, [feature.id]: checked }))
                      }
                    />
                  ))}
                </div>
              </FormSection>
            </div>
          </div>
        </div>

        <DialogFooter className="!mx-0 !mb-0 border-t bg-background px-4 py-4 sm:px-7">
          <div className="mr-auto hidden text-xs text-muted-foreground sm:block">
            Changes apply to new subscriptions for this package.
          </div>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canCreate} onClick={handleCreate}>
            <Plus />
            Create package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-none">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold tabular-nums text-muted-foreground">
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PercentInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 pr-9"
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">%</span>
    </div>
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

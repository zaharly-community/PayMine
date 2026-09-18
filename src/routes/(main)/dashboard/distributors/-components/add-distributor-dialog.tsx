import * as React from "react";

import {
  BadgeDollarSign,
  Check,
  ImagePlus,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  WalletCards,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import type {
  CompensationMode,
  DistributorConfiguration,
  DistributorPaymentMethod,
  DistributorRow,
  DistributorType,
  FixedFeePeriod,
  MethodLimitMode,
  PaymentMethodCategory,
  ProcessingScope,
} from "./data";

type FormState = {
  role: DistributorType;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  processingScope: ProcessingScope;
  paymentMethods: DistributorPaymentMethod[];
  feeMode: CompensationMode;
  fixedFee: string;
  fixedFeePeriod: FixedFeePeriod;
  commissionTransactions: "Deposits" | "Withdrawals" | "Deposits & Withdrawals";
  defaultCommissionRate: string;
  perCompletedOperationFee: string;
};

type AddDistributorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (distributor: DistributorRow) => void;
};

const ownerPaymentMethods: Array<{
  name: string;
  category: PaymentMethodCategory;
}> = [
  { name: "Flouci", category: "Wallet" },
  { name: "D17", category: "Wallet" },
  { name: "Kashy", category: "Wallet" },
  { name: "Visa", category: "Top-ups Cards" },
  { name: "Mastercard", category: "Top-ups Cards" },
  { name: "e-Dinar", category: "Top-ups Cards" },
];

const systemDefaults = {
  requestLimit: 50,
  amountLimit: 10000,
  amountLimitPeriod: "Daily" as FixedFeePeriod,
  commissionRate: 5,
  fixedFee: 25,
  fixedFeePeriod: "Monthly" as FixedFeePeriod,
  perCompletedOperationFee: 1.5,
};

function createOwnerMethods(enabledCount = 2): DistributorPaymentMethod[] {
  return ownerPaymentMethods.map((method, index) => ({
    id: "owner-" + method.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: method.name,
    category: method.category,
    enabled: index < enabledCount,
    limitMode: "Requests & Amount",
    requestLimit: systemDefaults.requestLimit,
    amountLimit: systemDefaults.amountLimit,
    amountLimitPeriod: systemDefaults.amountLimitPeriod,
    commissionRate: systemDefaults.commissionRate,
  }));
}

function createInitialForm(): FormState {
  return {
    role: "Agent",
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
    processingScope: "Deposits & Withdrawals",
    paymentMethods: [],
    feeMode: "Commission",
    fixedFee: String(systemDefaults.fixedFee),
    fixedFeePeriod: systemDefaults.fixedFeePeriod,
    commissionTransactions: "Deposits & Withdrawals",
    defaultCommissionRate: String(systemDefaults.commissionRate),
    perCompletedOperationFee: String(systemDefaults.perCompletedOperationFee),
  };
}

function Section({
  step,
  icon,
  title,
  description,
  children,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background shadow-xs">
      <div className="flex items-start gap-3 border-b px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <span className="font-semibold text-muted-foreground text-[11px]">{step}</span>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="mt-0.5 text-muted-foreground text-xs leading-5">{description}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-[11px] leading-4">{hint}</p> : null}
    </div>
  );
}

function MethodBadge({ category }: { category: PaymentMethodCategory }) {
  return (
    <span className="rounded-full border bg-muted/50 px-2 py-0.5 text-muted-foreground text-[10px] font-medium">
      {category}
    </span>
  );
}

export function AddDistributorDialog({
  open,
  onOpenChange,
  onCreate,
}: AddDistributorDialogProps) {
  const [form, setForm] = React.useState<FormState>(createInitialForm);
  const [avatarPreview, setAvatarPreview] = React.useState("");
  const [newMethodName, setNewMethodName] = React.useState("");
  const [newMethodCategory, setNewMethodCategory] = React.useState<PaymentMethodCategory>("Wallet");

  const reset = React.useCallback(() => {
    setForm(createInitialForm());
    setAvatarPreview("");
    setNewMethodName("");
    setNewMethodCategory("Wallet");
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePaymentMethod = (
    id: string,
    updateMethod: (method: DistributorPaymentMethod) => DistributorPaymentMethod,
  ) => {
    setForm((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((method) =>
        method.id === id ? updateMethod(method) : method,
      ),
    }));
  };

  const togglePaymentMethod = (id: string) => {
    updatePaymentMethod(id, (method) => ({ ...method, enabled: !method.enabled }));
  };

  const addAgentPaymentMethod = () => {
    const name = newMethodName.trim();
    if (!name) return;

    const id = "agent-" + Date.now();
    const method: DistributorPaymentMethod = {
      id,
      name,
      category: newMethodCategory,
      enabled: true,
      limitMode: "Requests & Amount",
      requestLimit: systemDefaults.requestLimit,
      amountLimit: systemDefaults.amountLimit,
      amountLimitPeriod: systemDefaults.amountLimitPeriod,
      commissionRate: Number(form.defaultCommissionRate) || systemDefaults.commissionRate,
    };

    setForm((current) => ({
      ...current,
      paymentMethods: [...current.paymentMethods, method],
    }));
    setNewMethodName("");
  };

  const removePaymentMethod = (id: string) => {
    setForm((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.filter((method) => method.id !== id),
    }));
  };

  const handleDefaultCommissionChange = (value: string) => {
    setForm((current) => {
      const previousDefault = Number(current.defaultCommissionRate) || 0;
      const nextDefault = value;
      return {
        ...current,
        defaultCommissionRate: nextDefault,
        paymentMethods: current.paymentMethods.map((method) =>
          method.commissionRate === previousDefault
            ? { ...method, commissionRate: Number(nextDefault) || 0 }
            : method,
        ),
      };
    });
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    update("avatarUrl", url);
  };

  const handleRoleChange = (role: DistributorType) => {
    setForm((current) => ({
      ...current,
      role,
      paymentMethods: role === "Supervisor" ? createOwnerMethods() : [],
    }));
    setNewMethodName("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return;

    const now = new Date();
    const sequence = Math.floor(100000 + Math.random() * 899999);
    const id = form.role === "Agent" ? "AGT-" + sequence : "SUP-" + sequence;

    const configuration: DistributorConfiguration = {
      processingScope: form.processingScope,
      paymentMethods: form.paymentMethods,
      feeMode: form.feeMode,
      fixedFeeAmount: form.feeMode === "Fixed" ? Number(form.fixedFee) || 0 : undefined,
      fixedFeePeriod: form.feeMode === "Fixed" ? form.fixedFeePeriod : undefined,
      commissionTransactions:
        form.feeMode === "Commission" ? form.commissionTransactions : undefined,
      defaultCommissionRate:
        form.feeMode === "Commission"
          ? Number(form.defaultCommissionRate) || 0
          : undefined,
      perCompletedOperationFee:
        form.feeMode === "Per completed operation"
          ? Number(form.perCompletedOperationFee) || 0
          : undefined,
    };

    onCreate({
      avatarUrl: form.avatarUrl || undefined,
      name: form.name.trim(),
      email: form.email.trim(),
      type: form.role,
      status: "Active",
      players: 0,
      balance: 0,
      joinedDate: now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      lastActive: 0,
      id,
      configuration,
    });

    reset();
    onOpenChange(false);
  };

  const enabledMethods = form.paymentMethods.filter((method) => method.enabled);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-6xl gap-0 overflow-hidden p-0 sm:max-w-6xl" showCloseButton>
        <DialogHeader className="border-b bg-background px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Add Distributor</DialogTitle>
              <DialogDescription>
                Create a {form.role} account, define processing access, payment methods, limits, and compensation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="max-h-[calc(90vh-145px)] space-y-4 overflow-y-auto bg-muted/20 p-5">
            <Section
              step="01"
              icon={<ShieldCheck className="size-4" />}
              title="Account"
              description="Basic identity, credentials, and role."
            >
              <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" className="size-20 rounded-2xl">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={form.name || "Distributor"} />
                    ) : null}
                    <AvatarFallback className="rounded-2xl">
                      {form.name ? form.name.slice(0, 2).toUpperCase() : <ImagePlus className="size-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <label className="cursor-pointer text-primary text-xs font-semibold">
                    Upload photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Role">
                    <Select value={form.role} onValueChange={(value) => handleRoleChange(value as DistributorType)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Agent">Agent</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Full name" htmlFor="distributor-name">
                    <Input
                      id="distributor-name"
                      required
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="e.g. Ahmed Ben Salem"
                    />
                  </Field>

                  <Field label="Email" htmlFor="distributor-email">
                    <Input
                      id="distributor-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="name@example.com"
                    />
                  </Field>

                  <Field label="Password" htmlFor="distributor-password" hint="Minimum 8 characters.">
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="distributor-password"
                        required
                        minLength={8}
                        type="password"
                        className="pl-8"
                        value={form.password}
                        onChange={(event) => update("password", event.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </Section>

            <Section
              step="02"
              icon={<WalletCards className="size-4" />}
              title="Processing access"
              description="Choose whether this account can handle deposits only or both deposits and withdrawals."
            >
              <Field label="Processing scope">
                <Select
                  value={form.processingScope}
                  onValueChange={(value) => update("processingScope", value as ProcessingScope)}
                >
                  <SelectTrigger className="w-full sm:max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Deposits">Deposits only</SelectItem>
                      <SelectItem value="Deposits & Withdrawals">Deposits & Withdrawals</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <Section
              step="03"
              icon={<WalletCards className="size-4" />}
              title="Payment methods & limits"
              description={
                form.role === "Supervisor"
                  ? "Supervisor uses the project owner's payment methods. Select which owner methods this Supervisor may process."
                  : "Agent uses its own payment methods. Add the methods it will manage from its dedicated payment-methods panel."
              }
            >
              {form.role === "Agent" ? (
                <div className="mb-5 rounded-lg border border-dashed bg-muted/20 p-4">
                  <div className="mb-3">
                    <p className="font-medium text-sm">Add Agent payment method</p>
                    <p className="text-muted-foreground text-xs">
                      These methods belong to the Agent and are not copied from the project owner's methods.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                    <Field label="Method name" htmlFor="agent-method-name">
                      <Input
                        id="agent-method-name"
                        value={newMethodName}
                        onChange={(event) => setNewMethodName(event.target.value)}
                        placeholder="e.g. Agent Wallet"
                      />
                    </Field>
                    <Field label="Category">
                      <Select
                        value={newMethodCategory}
                        onValueChange={(value) => setNewMethodCategory(value as PaymentMethodCategory)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Wallet">Wallet</SelectItem>
                            <SelectItem value="Top-ups Cards">Top-ups Cards</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" className="w-full sm:w-auto" onClick={addAgentPaymentMethod}>
                        <Plus className="size-3.5" />
                        Add method
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {form.paymentMethods.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background px-4 py-8 text-center">
                  <p className="font-medium text-sm">No payment methods added yet</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Add at least one Agent payment method to configure its limits and commission rate.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.role === "Supervisor" ? (
                    <div className="mb-4 grid gap-2 sm:grid-cols-2">
                      {form.paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                              <WalletCards className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-sm">{method.name}</span>
                                <MethodBadge category={method.category} />
                              </div>
                              <p className="text-muted-foreground text-[11px]">
                                {method.enabled ? "Allowed to process" : "Not assigned"}
                              </p>
                            </div>
                          </div>
                          <Switch checked={method.enabled} onCheckedChange={() => togglePaymentMethod(method.id)} />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {enabledMethods.length > 0 ? (
                    <div className="space-y-3">
                      {enabledMethods.map((method) => (
                        <div key={method.id} className="rounded-lg border bg-background p-4">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-sm">{method.name}</span>
                                <MethodBadge category={method.category} />
                              </div>
                              <p className="mt-1 text-muted-foreground text-xs">
                                {form.role === "Supervisor"
                                  ? "Owner-provided method"
                                  : "Agent-owned method"}
                              </p>
                            </div>
                            {form.role === "Agent" ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={"Remove " + method.name}
                                onClick={() => removePaymentMethod(method.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            ) : null}
                          </div>

                          <div className="grid gap-4 lg:grid-cols-4">
                            <Field label="Limit type">
                              <Select
                                value={method.limitMode}
                                onValueChange={(value) =>
                                  updatePaymentMethod(method.id, (current) => ({
                                    ...current,
                                    limitMode: value as MethodLimitMode,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Requests">Requests only</SelectItem>
                                    <SelectItem value="Amount">Amount only</SelectItem>
                                    <SelectItem value="Requests & Amount">Requests & Amount</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </Field>

                            {method.limitMode !== "Amount" ? (
                              <Field
                                label="Max requests / day"
                                htmlFor={"requests-" + method.id}
                              >
                                <Input
                                  id={"requests-" + method.id}
                                  type="number"
                                  min="0"
                                  value={method.requestLimit ?? systemDefaults.requestLimit}
                                  onChange={(event) =>
                                    updatePaymentMethod(method.id, (current) => ({
                                      ...current,
                                      requestLimit: Number(event.target.value) || 0,
                                    }))
                                  }
                                />
                              </Field>
                            ) : null}

                            {method.limitMode !== "Requests" ? (
                              <>
                                <Field
                                  label="Max total amount"
                                  htmlFor={"amount-" + method.id}
                                >
                                  <Input
                                    id={"amount-" + method.id}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={method.amountLimit ?? systemDefaults.amountLimit}
                                    onChange={(event) =>
                                      updatePaymentMethod(method.id, (current) => ({
                                        ...current,
                                        amountLimit: Number(event.target.value) || 0,
                                      }))
                                    }
                                  />
                                </Field>
                                <Field label="Amount period">
                                  <Select
                                    value={method.amountLimitPeriod ?? systemDefaults.amountLimitPeriod}
                                    onValueChange={(value) =>
                                      updatePaymentMethod(method.id, (current) => ({
                                        ...current,
                                        amountLimitPeriod: value as FixedFeePeriod,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </Field>
                              </>
                            ) : null}

                            {form.feeMode === "Commission" ? (
                              <Field
                                label="Commission"
                                hint={"System default: " + form.defaultCommissionRate + "%"}
                              >
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="pr-8"
                                    value={method.commissionRate ?? (Number(form.defaultCommissionRate) || 0)}
                                    onChange={(event) =>
                                      updatePaymentMethod(method.id, (current) => ({
                                        ...current,
                                        commissionRate: Number(event.target.value) || 0,
                                      }))
                                    }
                                  />
                                  <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                                    %
                                  </span>
                                </div>
                              </Field>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {form.role === "Supervisor" && enabledMethods.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-background px-4 py-8 text-center">
                      <p className="font-medium text-sm">No owner methods selected</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Enable the payment methods this Supervisor is allowed to process.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            <Section
              step="04"
              icon={<BadgeDollarSign className="size-4" />}
              title="Compensation"
              description="Choose how this distributor is paid. System defaults can be overridden during creation and changed later."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Compensation type">
                  <Select
                    value={form.feeMode}
                    onValueChange={(value) => update("feeMode", value as CompensationMode)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Fixed">Fixed fee</SelectItem>
                        <SelectItem value="Commission">Commission</SelectItem>
                        <SelectItem value="Per completed operation">Per completed operation</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                {form.feeMode === "Fixed" ? (
                  <>
                    <Field label="Fixed fee amount" htmlFor="fixed-fee">
                      <Input
                        id="fixed-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.fixedFee}
                        onChange={(event) => update("fixedFee", event.target.value)}
                      />
                    </Field>
                    <Field label="Fee period">
                      <Select
                        value={form.fixedFeePeriod}
                        onValueChange={(value) => update("fixedFeePeriod", value as FixedFeePeriod)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                ) : null}

                {form.feeMode === "Commission" ? (
                  <>
                    <Field label="Commission applies to">
                      <Select
                        value={form.commissionTransactions}
                        onValueChange={(value) =>
                          update(
                            "commissionTransactions",
                            value as FormState["commissionTransactions"],
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Deposits">Deposits only</SelectItem>
                            <SelectItem value="Withdrawals">Withdrawals only</SelectItem>
                            <SelectItem value="Deposits & Withdrawals">Deposits & Withdrawals</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      label="System default commission"
                      htmlFor="default-commission-rate"
                      hint="Applied as the starting rate for new payment methods."
                    >
                      <div className="relative">
                        <Input
                          id="default-commission-rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="pr-8"
                          value={form.defaultCommissionRate}
                          onChange={(event) => handleDefaultCommissionChange(event.target.value)}
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                          %
                        </span>
                      </div>
                    </Field>
                  </>
                ) : null}

                {form.feeMode === "Per completed operation" ? (
                  <Field
                    label="Fee per completed operation"
                    htmlFor="completed-operation-fee"
                    hint="Fixed amount paid for every successfully completed transaction."
                  >
                    <Input
                      id="completed-operation-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.perCompletedOperationFee}
                      onChange={(event) => update("perCompletedOperationFee", event.target.value)}
                    />
                  </Field>
                ) : null}
              </div>

              {form.feeMode === "Commission" && form.paymentMethods.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-muted-foreground text-xs">
                  Add payment methods above to set a different commission percentage for each method.
                </div>
              ) : null}

              {form.feeMode === "Commission" ? (
                <div className="mt-4 rounded-lg border bg-muted/20 px-4 py-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Method-level commission</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Each enabled method can override the system default independently.
                      </p>
                    </div>
                    <span className="rounded-full border bg-background px-2.5 py-1 font-semibold text-foreground">
                      {enabledMethods.length} enabled
                    </span>
                  </div>
                </div>
              ) : null}
            </Section>

            <div className="rounded-xl border border-dashed bg-background px-4 py-3 text-xs">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <p className="text-muted-foreground leading-5">
                  <strong className="font-medium text-foreground">
                    {form.role === "Supervisor" ? "Supervisor setup:" : "Agent setup:"}
                  </strong>{" "}
                  {form.role === "Supervisor"
                    ? "uses only payment methods supplied by the project owner, with individual processing permissions, limits, and commission rates."
                    : "uses payment methods owned and managed by the Agent; owner payment methods are never assigned to the Agent."}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-background px-5 py-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Check className="size-3.5" />
              Create {form.role}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

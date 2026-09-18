import * as React from "react";

import {
  BadgeDollarSign,
  Check,
  ChevronDown,
  ImagePlus,
  KeyRound,
  Layers3,
  ShieldCheck,
  UserPlus,
  WalletCards,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  DistributorProgram,
  DistributorProgramMode,
  DistributorPaymentMethod,
  DistributorRow,
  DistributorType,
  FixedFeePeriod,
  MethodLimitMode,
  PaymentMethodCategory,
  ProcessingScope,
} from "./data";

type CommissionTransactions = "Deposits" | "Withdrawals" | "Deposits & Withdrawals";

type ProgramTemplate = DistributorProgram & {
  configuration: Omit<DistributorConfiguration, "programMode" | "programId" | "programName">;
};

type FormState = {
  role: DistributorType;
  programMode: DistributorProgramMode;
  programId: string;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  processingScope: ProcessingScope;
  accountOpeningMethods: string[];
  paymentMethods: DistributorPaymentMethod[];
  agentDefaultRequestLimit: string;
  agentDefaultAmountLimit: string;
  agentDefaultAmountPeriod: FixedFeePeriod;
  feeMode: CompensationMode;
  fixedFee: string;
  fixedFeePeriod: FixedFeePeriod;
  commissionTransactions: CommissionTransactions;
  defaultDepositCommissionRate: string;
  defaultWithdrawalCommissionRate: string;
  perCompletedOperationFee: string;
};

type AddDistributorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (distributor: DistributorRow) => void;
};

const ownerPaymentMethods: Array<{ name: string; category: PaymentMethodCategory }> = [
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
  depositCommissionRate: 5,
  withdrawalCommissionRate: 3,
  fixedFee: 25,
  fixedFeePeriod: "Monthly" as FixedFeePeriod,
  perCompletedOperationFee: 1.5,
};

function makeMethodId(name: string) {
  return "method-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function createSupervisorMethods(): DistributorPaymentMethod[] {
  return ownerPaymentMethods.map((method) => ({
    id: makeMethodId(method.name),
    name: method.name,
    category: method.category,
    enabled: false,
    limitMode: "Requests & Amount",
    requestLimit: systemDefaults.requestLimit,
    amountLimit: systemDefaults.amountLimit,
    amountLimitPeriod: systemDefaults.amountLimitPeriod,
    depositCommissionRate: systemDefaults.depositCommissionRate,
    withdrawalCommissionRate: systemDefaults.withdrawalCommissionRate,
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
    accountOpeningMethods: [],
    paymentMethods: [],
    agentDefaultRequestLimit: String(systemDefaults.requestLimit),
    agentDefaultAmountLimit: String(systemDefaults.amountLimit),
    agentDefaultAmountPeriod: systemDefaults.amountLimitPeriod,
    feeMode: "Commission",
    fixedFee: String(systemDefaults.fixedFee),
    fixedFeePeriod: systemDefaults.fixedFeePeriod,
    commissionTransactions: "Deposits & Withdrawals",
    defaultDepositCommissionRate: String(systemDefaults.depositCommissionRate),
    defaultWithdrawalCommissionRate: String(systemDefaults.withdrawalCommissionRate),
    perCompletedOperationFee: String(systemDefaults.perCompletedOperationFee),
  };
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
      {hint ? <p className="text-[11px] leading-4 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SectionHeader({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b pb-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">{step}</span>
        <span className="text-primary">{icon}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="mt-1 pl-7 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

function MethodRow({
  method,
  open,
  onOpenChange,
  onToggle,
  onUpdate,
  onRemove,
  showSwitch,
  commissionEnabled,
}: {
  method: DistributorPaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: () => void;
  onUpdate: (update: (method: DistributorPaymentMethod) => DistributorPaymentMethod) => void;
  onRemove?: () => void;
  showSwitch: boolean;
  commissionEnabled: boolean;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-3 py-3">
        <CollapsibleTrigger
          render={<button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" />}
        >
          <ChevronDown
            className={"size-4 shrink-0 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-sm">{method.name}</span>
              <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {method.category}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {method.enabled ? "Processing enabled" : "Processing disabled"}
            </p>
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              aria-label={"Remove " + method.name}
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
          {showSwitch ? <Switch checked={method.enabled} onCheckedChange={onToggle} /> : null}
        </div>
      </div>

      <CollapsibleContent className="pb-4 pl-7">
        <div className="grid gap-4 rounded-lg bg-muted/25 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Limit type">
            <Select
              value={method.limitMode}
              onValueChange={(value) =>
                onUpdate((current) => ({ ...current, limitMode: value as MethodLimitMode }))
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
            <Field label="Max requests / day">
              <Input
                type="number"
                min="0"
                value={method.requestLimit ?? systemDefaults.requestLimit}
                onChange={(event) =>
                  onUpdate((current) => ({
                    ...current,
                    requestLimit: Number(event.target.value) || 0,
                  }))
                }
              />
            </Field>
          ) : null}

          {method.limitMode !== "Requests" ? (
            <Field label="Max total amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={method.amountLimit ?? systemDefaults.amountLimit}
                onChange={(event) =>
                  onUpdate((current) => ({
                    ...current,
                    amountLimit: Number(event.target.value) || 0,
                  }))
                }
              />
            </Field>
          ) : null}

          {method.limitMode !== "Requests" ? (
            <Field label="Amount period">
              <Select
                value={method.amountLimitPeriod ?? systemDefaults.amountLimitPeriod}
                onValueChange={(value) =>
                  onUpdate((current) => ({
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
          ) : null}

          {commissionEnabled ? (
            <>
              <Field label="Deposit commission">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="pr-8"
                    value={method.depositCommissionRate ?? systemDefaults.depositCommissionRate}
                    onChange={(event) =>
                      onUpdate((current) => ({
                        ...current,
                        depositCommissionRate: Number(event.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </Field>

              <Field label="Withdrawal commission">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="pr-8"
                    value={method.withdrawalCommissionRate ?? systemDefaults.withdrawalCommissionRate}
                    onChange={(event) =>
                      onUpdate((current) => ({
                        ...current,
                        withdrawalCommissionRate: Number(event.target.value) || 0,
                      }))
                    }
                  />
                  <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </Field>
            </>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AddDistributorDialog({ open, onOpenChange, onCreate }: AddDistributorDialogProps) {
  const [form, setForm] = React.useState<FormState>(createInitialForm);
  const [avatarPreview, setAvatarPreview] = React.useState("");
  const [openMethodId, setOpenMethodId] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setForm(createInitialForm());
    setAvatarPreview("");
    setOpenMethodId(null);
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePaymentMethod = (
    id: string,
    transform: (method: DistributorPaymentMethod) => DistributorPaymentMethod,
  ) => {
    setForm((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((method) =>
        method.id === id ? transform(method) : method,
      ),
    }));
  };

  const togglePaymentMethod = (id: string) => {
    updatePaymentMethod(id, (method) => ({ ...method, enabled: !method.enabled }));
  };

  const toggleAccountOpeningMethod = (name: string) => {
    setForm((current) => ({
      ...current,
      accountOpeningMethods: current.accountOpeningMethods.includes(name)
        ? current.accountOpeningMethods.filter((item) => item !== name)
        : [...current.accountOpeningMethods, name],
    }));
  };

  const handleDefaultDepositCommissionChange = (value: string) => {
    setForm((current) => {
      const previous = Number(current.defaultDepositCommissionRate) || 0;
      const next = Number(value) || 0;
      return {
        ...current,
        defaultDepositCommissionRate: value,
        paymentMethods: current.paymentMethods.map((method) =>
          method.depositCommissionRate === previous
            ? { ...method, depositCommissionRate: next }
            : method,
        ),
      };
    });
  };

  const handleDefaultWithdrawalCommissionChange = (value: string) => {
    setForm((current) => {
      const previous = Number(current.defaultWithdrawalCommissionRate) || 0;
      const next = Number(value) || 0;
      return {
        ...current,
        defaultWithdrawalCommissionRate: value,
        paymentMethods: current.paymentMethods.map((method) =>
          method.withdrawalCommissionRate === previous
            ? { ...method, withdrawalCommissionRate: next }
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
      accountOpeningMethods: [],
      paymentMethods: role === "Supervisor" ? createSupervisorMethods() : [],
    }));
    setOpenMethodId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return;

    const now = new Date();
    const sequence = Math.floor(100000 + Math.random() * 899999);
    const id = form.role === "Agent" ? "AGT-" + sequence : "SUP-" + sequence;

    const configuration: DistributorConfiguration = {
      processingScope: form.processingScope,
      accountOpeningMethods: form.accountOpeningMethods,
      paymentMethods: form.role === "Supervisor" ? form.paymentMethods.filter((method) => method.enabled) : form.paymentMethods,
      defaultRequestLimit:
        form.role === "Agent" ? Number(form.agentDefaultRequestLimit) || 0 : undefined,
      defaultAmountLimit:
        form.role === "Agent" ? Number(form.agentDefaultAmountLimit) || 0 : undefined,
      defaultAmountLimitPeriod:
        form.role === "Agent" ? form.agentDefaultAmountPeriod : undefined,
      feeMode: form.feeMode,
      fixedFeeAmount: form.feeMode === "Fixed" ? Number(form.fixedFee) || 0 : undefined,
      fixedFeePeriod: form.feeMode === "Fixed" ? form.fixedFeePeriod : undefined,
      commissionTransactions:
        form.feeMode === "Commission" ? form.commissionTransactions : undefined,
      defaultDepositCommissionRate:
        form.feeMode === "Commission" ? Number(form.defaultDepositCommissionRate) || 0 : undefined,
      defaultWithdrawalCommissionRate:
        form.feeMode === "Commission" ? Number(form.defaultWithdrawalCommissionRate) || 0 : undefined,
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

  const isCommission = form.feeMode === "Commission";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-w-5xl" showCloseButton>
        <DialogHeader className="border-b bg-background px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Add Distributor</DialogTitle>
              <DialogDescription>
                Configure the {form.role.toLowerCase()} account, processing access, payment permissions, limits, and compensation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="max-h-[calc(90vh-145px)] overflow-y-auto bg-background px-5">
            <div className="border-b py-5">
              <SectionHeader
                step="01"
                icon={<ShieldCheck className="size-4" />}
                title="Account"
                description="Create the credentials used by this distributor to access the dashboard."
              />

              <div className="mt-4 grid gap-5 sm:grid-cols-[120px_1fr]">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" className="size-20 rounded-2xl">
                    {avatarPreview ? <AvatarImage src={avatarPreview} alt={form.name || "Distributor"} /> : null}
                    <AvatarFallback className="rounded-2xl">
                      {form.name ? form.name.slice(0, 2).toUpperCase() : <ImagePlus className="size-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <label className="cursor-pointer text-xs font-semibold text-primary">
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
                    <Input id="distributor-name" required value={form.name} onChange={(event) => update("name", event.target.value)} />
                  </Field>

                  <Field label="Email" htmlFor="distributor-email">
                    <Input id="distributor-email" required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
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
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            <div className="border-b py-5">
              <SectionHeader
                step="02"
                icon={<WalletCards className="size-4" />}
                title="Processing access"
                description="Define the transaction types this account is allowed to process."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([
                  ["Deposits", "Deposit processing only", "The distributor can process deposit requests."],
                  ["Deposits & Withdrawals", "Deposits + withdrawals", "The distributor can process both transaction flows."],
                ] as const).map(([value, title, description]) => {
                  const selected = form.processingScope === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => update("processingScope", value)}
                      className={
                        "flex items-start gap-3 border px-4 py-3 text-left transition-colors " +
                        (selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:bg-muted/40")
                      }
                    >
                      <span
                        className={
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border " +
                          (selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")
                        }
                      >
                        {selected ? <Check className="size-2.5" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-sm">{title}</span>
                        <span className="mt-1 block text-xs leading-4 text-muted-foreground">{description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b py-5">
              <SectionHeader
                step="03"
                icon={<WalletCards className="size-4" />}
                title="Payment methods & limits"
                description={
                  form.role === "Supervisor"
                    ? "Use only payment methods supplied by the project owner. Select the methods this Supervisor may process, then open each row to configure its limits."
                    : "The Agent will add and manage its own payment methods from its dashboard. The project owner only controls which owner methods the Agent may use for account opening."
                }
              />

              {form.role === "Agent" ? (
                <div className="mt-4 space-y-5">
                  <div>
                    <CategoryLabel>Owner methods allowed for account opening</CategoryLabel>
                    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {ownerPaymentMethods.map((method) => {
                        const selected = form.accountOpeningMethods.includes(method.name);
                        return (
                          <label key={method.name} className="flex cursor-pointer items-center justify-between border-b py-2.5">
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{method.name}</span>
                              <span className="text-[10px] text-muted-foreground">{method.category}</span>
                            </span>
                            <Switch
                              checked={selected}
                              onCheckedChange={() => toggleAccountOpeningMethod(method.name)}
                            />
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                      These are permission gates only. They do not become the Agent's payment methods.
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <CategoryLabel>Defaults for Agent-owned payment methods</CategoryLabel>
                    <p className="mb-3 text-xs text-muted-foreground">
                      These defaults are applied when the Agent adds its own payment methods later. Method-specific settings can be changed from the Agent dashboard.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Max requests / day">
                        <Input
                          type="number"
                          min="0"
                          value={form.agentDefaultRequestLimit}
                          onChange={(event) => update("agentDefaultRequestLimit", event.target.value)}
                        />
                      </Field>
                      <Field label="Max total amount">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.agentDefaultAmountLimit}
                          onChange={(event) => update("agentDefaultAmountLimit", event.target.value)}
                        />
                      </Field>
                      <Field label="Amount period">
                        <Select
                          value={form.agentDefaultAmountPeriod}
                          onValueChange={(value) => update("agentDefaultAmountPeriod", value as FixedFeePeriod)}
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <CategoryLabel>Owner payment methods</CategoryLabel>
                  <div className="divide-y">
                    {form.paymentMethods.map((method) => (
                      <MethodRow
                        key={method.id}
                        method={method}
                        open={openMethodId === method.id}
                        onOpenChange={(next) => setOpenMethodId(next ? method.id : null)}
                        onToggle={() => togglePaymentMethod(method.id)}
                        onUpdate={(transform) => updatePaymentMethod(method.id, transform)}
                        showSwitch
                        commissionEnabled={isCommission}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
                    Enable a method to grant this Supervisor permission to process it. The arrow opens its request, amount, and commission settings.
                  </p>
                </div>
              )}
            </div>

            <div className="border-b py-5">
              <SectionHeader
                step={form.role === "Agent" ? "05" : "04"}
                icon={<BadgeDollarSign className="size-4" />}
                title="Compensation"
                description="Set the earning model. System defaults are editable here and can be changed later."
              />

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Field label="Compensation type">
                  <Select value={form.feeMode} onValueChange={(value) => update("feeMode", value as CompensationMode)}>
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
                    <Field label="Fixed fee amount">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.fixedFee}
                        onChange={(event) => update("fixedFee", event.target.value)}
                      />
                    </Field>
                    <Field label="Fee period">
                      <Select value={form.fixedFeePeriod} onValueChange={(value) => update("fixedFeePeriod", value as FixedFeePeriod)}>
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

                {isCommission ? (
                  <>
                    <Field label="Commission applies to">
                      <Select
                        value={form.commissionTransactions}
                        onValueChange={(value) => update("commissionTransactions", value as CommissionTransactions)}
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

                    <Field label="Deposit commission">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="pr-8"
                          value={form.defaultDepositCommissionRate}
                          onChange={(event) => handleDefaultDepositCommissionChange(event.target.value)}
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </Field>

                    <Field label="Withdrawal commission">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="pr-8"
                          value={form.defaultWithdrawalCommissionRate}
                          onChange={(event) => handleDefaultWithdrawalCommissionChange(event.target.value)}
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </Field>
                  </>
                ) : null}

                {form.feeMode === "Per completed operation" ? (
                  <Field label="Fee per completed operation">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.perCompletedOperationFee}
                      onChange={(event) => update("perCompletedOperationFee", event.target.value)}
                    />
                  </Field>
                ) : null}
              </div>

              <div className="mt-4 border-t pt-3 text-[11px] leading-4 text-muted-foreground">
                {isCommission
                  ? "The deposit and withdrawal percentages are the system defaults for the distributor. Payment-method rows can override these values where applicable."
                  : form.feeMode === "Fixed"
                    ? "The fixed fee is paid on the selected daily or monthly schedule."
                    : "The fixed amount is paid only for successfully completed operations."}
              </div>
            </div>

            <div className="py-4 text-xs leading-5 text-muted-foreground">
              <strong className="font-medium text-foreground">
                {form.role === "Supervisor" ? "Supervisor:" : "Agent:"}
              </strong>{" "}
              {form.role === "Supervisor"
                ? "processes only the project owner's selected payment methods."
                : "owns and manages its payment methods in its own dashboard; owner-controlled methods here are only account-opening permissions."}
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

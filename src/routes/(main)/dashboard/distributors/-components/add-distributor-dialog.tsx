import * as React from "react";

import {
  BadgeDollarSign,
  Check,
  ImagePlus,
  KeyRound,
  ShieldCheck,
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
  DistributorRow,
  DistributorType,
  FixedFeePeriod,
  ProcessingScope,
} from "./data";

type CommissionRateMap = Record<string, string>;
type FormState = {
  role: DistributorType;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  processingScope: ProcessingScope;
  limitMode: "Requests" | "Amount" | "Requests & Amount";
  dailyRequestsLimit: string;
  amountLimit: string;
  amountLimitPeriod: FixedFeePeriod;
  permittedPaymentMethods: string[];
  perMethodRequestLimits: Record<string, string>;
  perMethodAmountLimits: Record<string, string>;
  feeMode: CompensationMode;
  fixedFee: string;
  fixedFeePeriod: FixedFeePeriod;
  commissionTransactions: "Deposits" | "Withdrawals" | "Deposits & Withdrawals";
  defaultCommissionRate: string;
  commissionByMethod: CommissionRateMap;
  perCompletedOperationFee: string;
};

type AddDistributorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (distributor: DistributorRow) => void;
};

const ownerWalletMethods = ["Flouci", "D17", "Kashy"];
const ownerTopUpCardMethods = ["Visa", "Mastercard", "e-Dinar"];
const ownerPaymentMethods = [...ownerWalletMethods, ...ownerTopUpCardMethods];

const systemDefaults = {
  dailyRequestsLimit: "50",
  amountLimit: "10000",
  amountLimitPeriod: "Daily" as FixedFeePeriod,
  fixedFee: "25",
  fixedFeePeriod: "Monthly" as FixedFeePeriod,
  defaultCommissionRate: "5",
  perCompletedOperationFee: "1.5",
};

const createInitialForm = (): FormState => ({
  role: "Agent",
  name: "",
  email: "",
  password: "",
  avatarUrl: "",
  processingScope: "Deposits & Withdrawals",
  limitMode: "Requests & Amount",
  dailyRequestsLimit: systemDefaults.dailyRequestsLimit,
  amountLimit: systemDefaults.amountLimit,
  amountLimitPeriod: systemDefaults.amountLimitPeriod,
  permittedPaymentMethods: ownerPaymentMethods.slice(0, 2),
  perMethodRequestLimits: Object.fromEntries(
    ownerPaymentMethods.map((method) => [method, systemDefaults.dailyRequestsLimit]),
  ),
  perMethodAmountLimits: Object.fromEntries(
    ownerPaymentMethods.map((method) => [method, systemDefaults.amountLimit]),
  ),
  feeMode: "Commission",
  fixedFee: systemDefaults.fixedFee,
  fixedFeePeriod: systemDefaults.fixedFeePeriod,
  commissionTransactions: "Deposits & Withdrawals",
  defaultCommissionRate: systemDefaults.defaultCommissionRate,
  commissionByMethod: Object.fromEntries(
    ownerPaymentMethods.map((method) => [method, systemDefaults.defaultCommissionRate]),
  ),
  perCompletedOperationFee: systemDefaults.perCompletedOperationFee,
});

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-background">
      <div className="flex items-start gap-3 border-b px-4 py-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
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
      {hint ? <p className="text-muted-foreground text-[11px]">{hint}</p> : null}
    </div>
  );
}

function MethodSwitch({
  method,
  enabled,
  onToggle,
}: {
  method: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2 transition-colors hover:bg-muted/50">
      <span className="flex items-center gap-2">
        <span
          className={`flex size-5 items-center justify-center rounded border ${enabled ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
        >
          {enabled ? <Check className="size-3.5" /> : null}
        </span>
        <span className="text-sm">{method}</span>
      </span>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

export function AddDistributorDialog({
  open,
  onOpenChange,
  onCreate,
}: AddDistributorDialogProps) {
  const [form, setForm] = React.useState<FormState>(createInitialForm);
  const [avatarPreview, setAvatarPreview] = React.useState("");

  const reset = React.useCallback(() => {
    setForm(createInitialForm());
    setAvatarPreview("");
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePaymentMethod = (method: string) => {
    setForm((current) => ({
      ...current,
      permittedPaymentMethods: current.permittedPaymentMethods.includes(method)
        ? current.permittedPaymentMethods.filter((item) => item !== method)
        : [...current.permittedPaymentMethods, method],
    }));
  };

  const updateMethodLimit = (
    key: "perMethodRequestLimits" | "perMethodAmountLimits",
    method: string,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [method]: value,
      },
    }));
  };

  const updateMethodCommission = (method: string, value: string) => {
    setForm((current) => ({
      ...current,
      commissionByMethod: {
        ...current.commissionByMethod,
        [method]: value,
      },
    }));
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    update("avatarUrl", url);
  };

  const handleRoleChange = (role: DistributorType) => {
    update("role", role);
    if (role === "Supervisor") {
      setForm((current) => ({
        ...current,
        role,
        permittedPaymentMethods:
          current.permittedPaymentMethods.length > 0
            ? current.permittedPaymentMethods
            : ownerPaymentMethods.slice(0, 2),
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return;

    const now = new Date();
    const sequence = Math.floor(100000 + Math.random() * 899999);
    const id = form.role === "Agent" ? `AGT-${sequence}` : `SUP-${sequence}`;

    const configuration: DistributorConfiguration = {
      processingScope: form.processingScope,
      dailyRequestsLimit:
        form.limitMode === "Amount" ? undefined : Number(form.dailyRequestsLimit) || 0,
      amountLimit:
        form.limitMode === "Requests" ? undefined : Number(form.amountLimit) || 0,
      amountLimitPeriod: form.amountLimitPeriod,
      limitMode: form.limitMode,
      permittedPaymentMethods:
        form.role === "Supervisor" ? form.permittedPaymentMethods : undefined,
      feeMode: form.feeMode,
      fixedFeeAmount: form.feeMode === "Fixed" ? Number(form.fixedFee) || 0 : undefined,
      fixedFeePeriod: form.feeMode === "Fixed" ? form.fixedFeePeriod : undefined,
      commissionTransactions: form.feeMode === "Commission" ? form.commissionTransactions : undefined,
      defaultCommissionRate:
        form.feeMode === "Commission" ? Number(form.defaultCommissionRate) || 0 : undefined,
      commissionByPaymentMethod:
        form.feeMode === "Commission" && form.role === "Supervisor"
          ? Object.fromEntries(
              form.permittedPaymentMethods.map((method) => [
                method,
                Number(form.commissionByMethod[method]) || 0,
              ]),
            )
          : undefined,
      perCompletedOperationFee:
        form.feeMode === "Per completed operation"
          ? Number(form.perCompletedOperationFee) || 0
          : undefined,
    };

    onCreate({
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

  const renderOwnerPaymentMethods = (methods: string[]) => (
    <div className="grid gap-2 sm:grid-cols-2">
      {methods.map((method) => (
        <MethodSwitch
          key={method}
          method={method}
          enabled={form.permittedPaymentMethods.includes(method)}
          onToggle={() => togglePaymentMethod(method)}
        />
      ))}
    </div>
  );

  const activeMethods = form.permittedPaymentMethods;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-w-5xl" showCloseButton>
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div>
              <DialogTitle>Add Distributor</DialogTitle>
              <DialogDescription>
                Create an Agent or Supervisor and define processing, limits, and compensation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="max-h-[calc(90vh-145px)] space-y-4 overflow-y-auto bg-muted/20 p-5">
            <Section
              icon={<ShieldCheck className="size-4" />}
              title="Account"
              description="Identity, credentials, and role."
            >
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" className="size-16 rounded-xl">
                    {avatarPreview ? <AvatarImage src={avatarPreview} alt={form.name || "Distributor"} /> : null}
                    <AvatarFallback className="rounded-xl">
                      {form.name ? form.name.slice(0, 2).toUpperCase() : <ImagePlus className="size-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <label className="cursor-pointer text-primary text-xs font-medium">
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
                      placeholder="agent@example.com"
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
              icon={<WalletCards className="size-4" />}
              title="Processing & Limits"
              description={
                form.role === "Supervisor"
                  ? "Choose what this Supervisor can process using the payment methods provided by the project owner."
                  : "Set processing limits for this Agent. Payment methods are managed by the Agent in its own payment-methods panel."
              }
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Processing scope">
                  <Select
                    value={form.processingScope}
                    onValueChange={(value) => update("processingScope", value as ProcessingScope)}
                  >
                    <SelectTrigger className="w-full">
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

                <Field label="Limit type">
                  <Select value={form.limitMode} onValueChange={(value) => update("limitMode", value as FormState["limitMode"])}>
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

                <Field label="Amount period">
                  <Select
                    value={form.amountLimitPeriod}
                    onValueChange={(value) => update("amountLimitPeriod", value as FixedFeePeriod)}
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

              {form.limitMode !== "Amount" ? (
                <div className="mt-4">
                  <Field
                    label="Daily requests limit"
                    htmlFor="daily-requests-limit"
                    hint="Maximum number of requests that can be processed."
                  >
                    <Input
                      id="daily-requests-limit"
                      type="number"
                      min="0"
                      value={form.dailyRequestsLimit}
                      onChange={(event) => update("dailyRequestsLimit", event.target.value)}
                    />
                  </Field>
                </div>
              ) : null}

              {form.limitMode !== "Requests" ? (
                <div className="mt-4">
                  <Field
                    label={`Total amount limit (${form.amountLimitPeriod.toLowerCase()})`}
                    htmlFor="amount-limit"
                    hint="Maximum aggregate amount processed during the selected period."
                  >
                    <Input
                      id="amount-limit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amountLimit}
                      onChange={(event) => update("amountLimit", event.target.value)}
                    />
                  </Field>
                </div>
              ) : null}

              {form.role === "Supervisor" ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-3">
                      <p className="font-medium text-sm">Owner payment methods</p>
                      <p className="text-muted-foreground text-xs">
                        Only selected methods will be available to this Supervisor.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 font-medium text-xs">Wallet</p>
                        {renderOwnerPaymentMethods(ownerWalletMethods)}
                      </div>
                      <div>
                        <p className="mb-2 font-medium text-xs">Top-ups cards</p>
                        {renderOwnerPaymentMethods(ownerTopUpCardMethods)}
                      </div>
                    </div>
                  </div>

                  {activeMethods.length > 0 ? (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-3">
                        <p className="font-medium text-sm">Per-method limits</p>
                        <p className="text-muted-foreground text-xs">
                          System defaults can be overridden for each payment method during creation.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {activeMethods.map((method) => (
                          <div
                            key={method}
                            className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1.1fr_1fr_1fr]"
                          >
                            <div className="flex items-center text-sm font-medium">{method}</div>
                            <Field label="Max requests" htmlFor={`request-limit-${method}`}>
                              <Input
                                id={`request-limit-${method}`}
                                type="number"
                                min="0"
                                value={form.perMethodRequestLimits[method] ?? systemDefaults.dailyRequestsLimit}
                                onChange={(event) =>
                                  updateMethodLimit("perMethodRequestLimits", method, event.target.value)
                                }
                              />
                            </Field>
                            <Field label="Max amount" htmlFor={`amount-limit-${method}`}>
                              <Input
                                id={`amount-limit-${method}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.perMethodAmountLimits[method] ?? systemDefaults.amountLimit}
                                onChange={(event) =>
                                  updateMethodLimit("perMethodAmountLimits", method, event.target.value)
                                }
                              />
                            </Field>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed px-3 py-2 text-muted-foreground text-xs">
                      Select at least one owner payment method to configure its limits.
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-muted-foreground text-xs">
                  <strong className="font-medium text-foreground">Agent payment methods:</strong> these are not assigned
                  here. The Agent manages its own Wallet and Top-up Card methods from its dedicated payment-methods panel.
                </div>
              )}
            </Section>

            <Section
              icon={<BadgeDollarSign className="size-4" />}
              title="Compensation"
              description="Set a fixed fee, percentage commission, or a fixed amount for every completed transaction."
            >
              <div className="grid gap-4 sm:grid-cols-2">
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
                ) : null}
              </div>

              {form.feeMode === "Fixed" ? (
                <div className="mt-4 max-w-sm">
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
                </div>
              ) : null}

              {form.feeMode === "Commission" ? (
                <div className="mt-4 space-y-4">
                  <Field
                    label="Commission applies to"
                    hint="Choose whether the distributor earns commission from deposits, withdrawals, or both."
                  >
                    <Select
                      value={form.commissionTransactions}
                      onValueChange={(value) =>
                        update(
                          "commissionTransactions",
                          value as FormState["commissionTransactions"],
                        )
                      }
                    >
                      <SelectTrigger className="w-full sm:max-w-sm">
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

                  {form.role === "Supervisor" ? (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-3">
                        <p className="font-medium text-sm">Commission by payment method</p>
                        <p className="text-muted-foreground text-xs">
                          System defaults are editable now and can also be changed later.
                        </p>
                      </div>
                      {activeMethods.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {activeMethods.map((method) => (
                            <Field
                              key={method}
                              label={method}
                              hint={`System default: ${systemDefaults.defaultCommissionRate}%`}
                            >
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  className="pr-8"
                                  value={form.commissionByMethod[method] ?? systemDefaults.defaultCommissionRate}
                                  onChange={(event) => updateMethodCommission(method, event.target.value)}
                                />
                                <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                                  %
                                </span>
                              </div>
                            </Field>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">Select payment methods above to configure rates.</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <Field
                        label="Default commission rate for Agent methods"
                        htmlFor="default-commission-rate"
                        hint={`System default: ${systemDefaults.defaultCommissionRate}%. Method-specific overrides can be configured after the Agent adds its own payment methods.`}
                      >
                        <div className="relative max-w-sm">
                          <Input
                            id="default-commission-rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="pr-8"
                            value={form.defaultCommissionRate}
                            onChange={(event) => update("defaultCommissionRate", event.target.value)}
                          />
                          <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                        </div>
                      </Field>
                    </div>
                  )}
                </div>
              ) : null}

              {form.feeMode === "Per completed operation" ? (
                <div className="mt-4 max-w-sm">
                  <Field
                    label="Fee per completed operation"
                    htmlFor="per-completed-operation-fee"
                    hint="Fixed amount paid for each successfully completed transaction."
                  >
                    <Input
                      id="per-completed-operation-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.perCompletedOperationFee}
                      onChange={(event) => update("perCompletedOperationFee", event.target.value)}
                    />
                  </Field>
                </div>
              ) : null}
            </Section>

            <div className="rounded-lg border border-dashed bg-background px-4 py-3 text-muted-foreground text-xs">
              <strong className="font-medium text-foreground">
                {form.role === "Supervisor" ? "Supervisor:" : "Agent:"}
              </strong>{" "}
              {form.role === "Supervisor"
                ? "uses the payment methods supplied by the project owner; only the selected methods and processing scope are granted."
                : "uses payment methods configured in its own dedicated panel; this creation flow does not assign owner payment methods."}
            </div>
          </div>

          <DialogFooter className="px-5 py-3">
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

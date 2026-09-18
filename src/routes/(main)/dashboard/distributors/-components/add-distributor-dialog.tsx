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

import type { DistributorRow, DistributorType } from "./data";

type FeeMode = "Fixed" | "Commission";
type CommissionBasis = "Payment method" | "Transaction type";

type AddDistributorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (distributor: DistributorRow) => void;
};

const walletMethods = ["Flouci", "D17", "Kashy"];
const topUpCardMethods = ["Visa", "Mastercard", "e-Dinar"];

const initialForm = {
  role: "Agent" as DistributorType,
  name: "",
  email: "",
  password: "",
  avatarUrl: "",
  dailyRequestsLimit: "50",
  amountLimit: "10000",
  amountLimitPeriod: "Daily",
  paymentMethods: ["Flouci", "D17"] as string[],
  feeMode: "Commission" as FeeMode,
  fixedFee: "25",
  commissionBasis: "Payment method" as CommissionBasis,
  commissionByMethod: {
    Flouci: "1.5",
    D17: "1.5",
    Kashy: "1.5",
    Visa: "2",
    Mastercard: "2",
    "e-Dinar": "1.75",
  } as Record<string, string>,
  depositCommission: "1.5",
  withdrawalCommission: "1",
};

type FormState = typeof initialForm;

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

export function AddDistributorDialog({
  open,
  onOpenChange,
  onCreate,
}: AddDistributorDialogProps) {
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [avatarPreview, setAvatarPreview] = React.useState("");

  const reset = React.useCallback(() => {
    setForm(initialForm);
    setAvatarPreview("");
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePaymentMethod = (method: string) => {
    setForm((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.includes(method)
        ? current.paymentMethods.filter((item) => item !== method)
        : [...current.paymentMethods, method],
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;

    const now = new Date();
    const sequence = Math.floor(100000 + Math.random() * 899999);
    const id = form.role === "Agent" ? `AGT-${sequence}` : `SUP-${sequence}`;

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
    });

    reset();
    onOpenChange(false);
  };

  const renderPaymentMethods = (methods: string[]) => (
    <div className="grid gap-2 sm:grid-cols-3">
      {methods.map((method) => {
        const enabled = form.paymentMethods.includes(method);
        return (
          <button
            type="button"
            key={method}
            onClick={() => togglePaymentMethod(method)}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-2">
              <span
                className={`flex size-5 items-center justify-center rounded border ${enabled ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
              >
                {enabled ? <Check className="size-3.5" /> : null}
              </span>
              <span className="text-sm">{method}</span>
            </span>
            <Switch checked={enabled} onCheckedChange={() => togglePaymentMethod(method)} />
          </button>
        );
      })}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl" showCloseButton>
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div>
              <DialogTitle>Create Distributor</DialogTitle>
              <DialogDescription>
                Create an Agent or Supervisor account and configure its operational permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <div className="max-h-[calc(90vh-145px)] space-y-4 overflow-y-auto bg-muted/20 p-5">
            <Section
              icon={<ShieldCheck className="size-4" />}
              title="Account"
              description="Basic credentials and the role that controls which configuration is available."
            >
              <div className="space-y-4">
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
                      <Select value={form.role} onValueChange={(value) => update("role", value as DistributorType)}>
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

                    <Field label="Password" htmlFor="distributor-password" hint="Use at least 8 characters.">
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
              </div>
            </Section>

            {form.role === "Agent" ? (
              <>
                <Section
                  icon={<WalletCards className="size-4" />}
                  title="Configuration"
                  description="Set processing limits and the payment methods this Agent can handle."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="Daily requests limit"
                      htmlFor="daily-requests-limit"
                      hint="Maximum requests the Agent can process in one day."
                    >
                      <Input
                        id="daily-requests-limit"
                        type="number"
                        min="0"
                        value={form.dailyRequestsLimit}
                        onChange={(event) => update("dailyRequestsLimit", event.target.value)}
                      />
                    </Field>

                    <Field label="Amount limit" htmlFor="amount-limit">
                      <Input
                        id="amount-limit"
                        type="number"
                        min="0"
                        value={form.amountLimit}
                        onChange={(event) => update("amountLimit", event.target.value)}
                      />
                    </Field>

                    <Field label="Amount period">
                      <Select
                        value={form.amountLimitPeriod}
                        onValueChange={(value) => update("amountLimitPeriod", value)}
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

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="font-medium text-sm">Wallet</p>
                      <p className="mb-2 text-muted-foreground text-xs">Wallet methods available to this Agent.</p>
                      {renderPaymentMethods(walletMethods)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Top-ups cards</p>
                      <p className="mb-2 text-muted-foreground text-xs">Card-based top-up methods.</p>
                      {renderPaymentMethods(topUpCardMethods)}
                    </div>
                  </div>
                </Section>
              </>
            ) : null}

            <Section
              icon={<BadgeDollarSign className="size-4" />}
              title="Compensation"
              description="Choose a fixed fee or commission model for this distributor."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fee type">
                  <Select value={form.feeMode} onValueChange={(value) => update("feeMode", value as FeeMode)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Fixed">Fixed fee</SelectItem>
                        <SelectItem value="Commission">Commission</SelectItem>
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
                ) : (
                  <Field label="Commission basis">
                    <Select
                      value={form.commissionBasis}
                      onValueChange={(value) => update("commissionBasis", value as CommissionBasis)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Payment method">By payment method</SelectItem>
                          <SelectItem value="Transaction type">By transaction type</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>

              {form.feeMode === "Commission" ? (
                form.commissionBasis === "Payment method" ? (
                  <div className="mt-4 rounded-lg border bg-muted/20 p-3">
                    <div className="mb-3">
                      <p className="font-medium text-sm">Commission by payment method</p>
                      <p className="text-muted-foreground text-xs">
                        Configure the percentage independently for each enabled Agent payment method.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(form.role === "Agent" ? form.paymentMethods : ["All transactions"]).map((method) => (
                        <Field key={method} label={method}>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="pr-8"
                              value={
                                form.role === "Agent"
                                  ? form.commissionByMethod[method] ?? ""
                                  : form.commissionByMethod["Flouci"] ?? ""
                              }
                              onChange={(event) =>
                                form.role === "Agent"
                                  ? updateMethodCommission(method, event.target.value)
                                  : setForm((current) => ({
                                      ...current,
                                      commissionByMethod: {
                                        ...current.commissionByMethod,
                                        Flouci: event.target.value,
                                      },
                                    }))
                              }
                            />
                            <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                          </div>
                        </Field>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                    <Field label="Deposit commission" htmlFor="deposit-commission">
                      <div className="relative">
                        <Input
                          id="deposit-commission"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pr-8"
                          value={form.depositCommission}
                          onChange={(event) => update("depositCommission", event.target.value)}
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                      </div>
                    </Field>
                    <Field label="Withdrawal commission" htmlFor="withdrawal-commission">
                      <div className="relative">
                        <Input
                          id="withdrawal-commission"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pr-8"
                          value={form.withdrawalCommission}
                          onChange={(event) => update("withdrawalCommission", event.target.value)}
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                      </div>
                    </Field>
                  </div>
                )
              ) : null}
            </Section>

            <div className="rounded-lg border border-dashed bg-background px-4 py-3 text-muted-foreground text-xs">
              <strong className="font-medium text-foreground">Supervisor permissions:</strong> Supervisors use the same
              account and compensation setup, while payment-method configuration is intentionally hidden.
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

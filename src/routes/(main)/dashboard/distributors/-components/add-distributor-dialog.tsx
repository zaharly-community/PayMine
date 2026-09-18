import * as React from "react";

import {
  BadgeDollarSign,
  Check,
  ChevronDown,
  ImagePlus,
  KeyRound,
  Layers3,
  Search,
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
  ProcessingScope,
} from "./data";
import { ownerPaymentMethods } from "./data";

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

function createSupervisorMethods(enabledNames: string[] = []): DistributorPaymentMethod[] {
  return ownerPaymentMethods.map((method) => ({
    id: makeMethodId(method.name),
    name: method.name,
    category: method.category,
    enabled: enabledNames.includes(method.name),
    limitMode: "Requests & Amount",
    requestLimit: systemDefaults.requestLimit,
    amountLimit: systemDefaults.amountLimit,
    amountLimitPeriod: systemDefaults.amountLimitPeriod,
    depositCommissionRate: systemDefaults.depositCommissionRate,
    withdrawalCommissionRate: systemDefaults.withdrawalCommissionRate,
  }));
}

const programTemplates: ProgramTemplate[] = [
  {
    id: "agent-standard",
    name: "Standard Agent",
    description: "Balanced limits and system commission defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Deposits & Withdrawals",
    feeMode: "Commission",
    feeSummary: "5% deposit · 3% withdrawal",
    configuration: {
      processingScope: "Deposits & Withdrawals",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Deposits & Withdrawals",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "agent-deposit-only",
    name: "Deposit Agent",
    description: "Deposit-only processing using the system defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Deposits",
    feeMode: "Commission",
    feeSummary: "5% deposit · withdrawals disabled",
    configuration: {
      processingScope: "Deposits",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Deposits",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 0,
    },
  },
  {
    id: "agent-withdrawal-only",
    name: "Withdrawal Agent",
    description: "Withdrawal-only processing using the system defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Withdrawals",
    feeMode: "Commission",
    feeSummary: "3% withdrawal · deposits disabled",
    configuration: {
      processingScope: "Withdrawals",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Withdrawals",
      defaultDepositCommissionRate: 0,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-standard",
    name: "Standard Supervisor",
    description: "Owner-provided payment methods with balanced processing permissions.",
    role: "Supervisor",
    processingScope: "Deposits & Withdrawals",
    feeMode: "Commission",
    feeSummary: "5% deposit · 3% withdrawal",
    configuration: {
      processingScope: "Deposits & Withdrawals",
      paymentMethods: createSupervisorMethods(ownerPaymentMethods.map((method) => method.name)),
      feeMode: "Commission",
      commissionTransactions: "Deposits & Withdrawals",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-withdrawal-only",
    name: "Withdrawal Supervisor",
    description: "Supervisor limited to withdrawal processing using owner-provided methods.",
    role: "Supervisor",
    processingScope: "Withdrawals",
    feeMode: "Commission",
    feeSummary: "3% withdrawal · deposits disabled",
    configuration: {
      processingScope: "Withdrawals",
      paymentMethods: createSupervisorMethods(ownerPaymentMethods.map((method) => method.name)),
      feeMode: "Commission",
      commissionTransactions: "Withdrawals",
      defaultDepositCommissionRate: 0,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-deposit-only",
    name: "Deposit Supervisor",
    description: "Supervisor limited to deposit processing using owner-provided methods.",
    role: "Supervisor",
    processingScope: "Deposits",
    feeMode: "Commission",
    feeSummary: "5% deposit · withdrawals disabled",
    configuration: {
      processingScope: "Deposits",
      paymentMethods: createSupervisorMethods(),
      feeMode: "Commission",
      commissionTransactions: "Deposits",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 0,
    },
  },
];

function createInitialForm(): FormState {
  return {
    role: "Agent",
    programMode: "Program",
    programId: "agent-standard",
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
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b pb-3">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
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
  showSwitch,
  commissionEnabled,
}: {
  method: DistributorPaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: () => void;
  onUpdate: (update: (method: DistributorPaymentMethod) => DistributorPaymentMethod) => void;
  showSwitch: boolean;
  commissionEnabled: boolean;
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-sm data-[open]:shadow-sm"
    >
      <div className="flex items-center gap-3 px-3.5 py-3.5">
        <CollapsibleTrigger
          render={<button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" />}
        >
          <ChevronDown
            className={"size-4 shrink-0 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-3 pr-0.5">
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
          {showSwitch ? <Switch checked={method.enabled} onCheckedChange={onToggle} /> : null}
        </div>
      </div>

      <CollapsibleContent className="border-t bg-muted/20 px-3.5 py-3.5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                }              />
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
                </SelectContent>              </Select>            </Field>          ) : null}

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
  const [programSearch, setProgramSearch] = React.useState("");

  const reset = React.useCallback(() => {
    setForm(createInitialForm());
    setAvatarPreview("");
    setOpenMethodId(null);
    setProgramSearch("");
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

  const availablePrograms = React.useMemo(
    () => programTemplates.filter((program) => program.role === form.role),
    [form.role],
  );
  const selectedProgram = availablePrograms.find((program) => program.id === form.programId) ?? availablePrograms[0];
  const filteredPrograms = React.useMemo(() => {
    const query = programSearch.trim().toLowerCase();
    if (!query) return availablePrograms;
    return availablePrograms.filter((program) =>
      [program.name, program.description, program.feeSummary].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [availablePrograms, programSearch]);

  const setProgramMode = (mode: DistributorProgramMode) => {
    setForm((current) => ({
      ...current,
      programMode: mode,
      programId: availablePrograms[0]?.id ?? current.programId,
    }));
    setOpenMethodId(null);
    setProgramSearch("");
  };

  const selectProgram = (programId: string) => {
    setForm((current) => ({
      ...current,
      programId,
    }));
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
      programMode: "Program",
      programId: role === "Agent" ? "agent-standard" : "supervisor-standard",
      accountOpeningMethods: [],
      paymentMethods: role === "Supervisor"
        ? createSupervisorMethods(ownerPaymentMethods.map((method) => method.name))
        : [],
    }));
    setOpenMethodId(null);
    setProgramSearch("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return;

    const now = new Date();
    const sequence = Math.floor(100000 + Math.random() * 899999);
    const id = form.role === "Agent" ? "AGT-" + sequence : "SUP-" + sequence;
    const username = form.name.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");

    const customConfiguration: DistributorConfiguration = {
      processingScope: form.processingScope,
      accountOpeningMethods: form.accountOpeningMethods,
      paymentMethods:
        form.role === "Supervisor"
          ? form.paymentMethods.filter((method) => method.enabled)
          : undefined,
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

    const baseProgramConfiguration = selectedProgram?.configuration ?? {};
    const configuration: DistributorConfiguration = {
      ...(form.programMode === "Program" ? baseProgramConfiguration : customConfiguration),
      programMode: form.programMode,
      ...(form.programMode === "Program" && selectedProgram
        ? {
            programId: selectedProgram.id,
            programName: selectedProgram.name,
          }
        : {
            programId: undefined,
            programName: undefined,
          }),
    };

    onCreate({
      avatarUrl: form.avatarUrl || undefined,
      name: form.name.trim(),
      username,
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
                icon={<Layers3 className="size-4" />}
                title="Program"
                description="Choose a predefined program or switch to Custom Program for full manual configuration."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([
                  ["Program", "Apply a Program", "Use a predefined setup for this role. Processing, limits, payment permissions, and compensation come from the selected program."],
                  ["Custom Program", "Build a Custom Program", "Open the full configuration below and define every setting for this account."],
                ] as const).map(([mode, title, description]) => {
                  const selected = form.programMode === mode;
                  return (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setProgramMode(mode)}
                      className={
                        "flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all " +
                        (selected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/15"
                          : "border-border bg-background hover:border-primary/40 hover:bg-muted/20")
                      }
                    >
                      <span
                        className={
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border " +
                          (selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40")
                        }
                      >
                        {selected ? <Check className="size-2.5" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-sm">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {form.programMode === "Program" ? (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={programSearch}
                      onChange={(event) => setProgramSearch(event.target.value)}
                      placeholder={"Search " + form.role.toLowerCase() + " programs..."}
                      className="h-9 pl-9"
                    />
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {filteredPrograms.length > 0 ? (
                      filteredPrograms.map((program) => {
                        const selected = program.id === form.programId;
                        return (
                          <button
                            key={program.id}
                            type="button"
                            onClick={() => selectProgram(program.id)}
                            className={
                              "w-full rounded-xl border px-4 py-3 text-left transition-all " +
                              (selected
                                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/15"
                                : "border-border bg-background hover:border-primary/40 hover:bg-muted/20")
                            }
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-semibold">{program.name}</span>
                                  {selected ? (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                      <Check className="size-3" />
                                      Selected
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {program.description}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-[10px] text-muted-foreground">
                                <span className="rounded-md bg-muted/50 px-2 py-1">
                                  {program.processingScope}
                                </span>
                                <span className="rounded-md bg-muted/50 px-2 py-1">
                                  {program.feeSummary}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
                        No {form.role.toLowerCase()} programs match your search.
                      </div>
                    )}
                  </div>

                  {selectedProgram ? (
                    <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
                      The selected program will be stored on the distributor account and its configuration will be applied at creation.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {form.programMode === "Custom Program" ? (
            <>
            <div className="border-b py-5">
              <SectionHeader
                icon={<WalletCards className="size-4" />}
                title="Processing access"
                description="Define the transaction types this account is allowed to process."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {([
                  ["Deposits", "Deposit processing only", "The distributor can process deposit requests."],
                  ["Withdrawals", "Withdrawal processing only", "The distributor can process withdrawal requests."],
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
                  <div className="space-y-2.5">
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

            </>
            ) : null}

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
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Gauge,
  Info,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type AccountType = "Wallet" | "Voucher";
type AccountStatus = "Active" | "Disabled";
type AccountMethod = "D17" | "Flouci" | "Kashy" | "e-Dinar" | "Voucher";

type SupervisorMode = "Include" | "Exclude" | "Not set";

type SupervisorRule = {
  id: string;
  name: string;
  mode: SupervisorMode;
};

type AccountConfig = {
  ownerName: string;
  cardNumber: string;
  expiry: string;
  walletNumber: string;
  walletName: string;
  pin: string;
  voucherCode: string;
  issuer: string;
  denomination: string;
  maxTransactions: string;
  maxAmount: string;
  supervisors: SupervisorRule[];
  scheduleEnabled: boolean;
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  openingBalance: number;
};

type PaymentAccount = {
  id: string;
  accountName: string;
  method: AccountMethod;
  type: AccountType;
  identifier: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  lastActivity: string;
  change: number;
  config: AccountConfig;
};

const supervisors = [
  { id: "sup-001", name: "Maya Chen" },
  { id: "sup-002", name: "Aiy Ben Salah" },
  { id: "sup-003", name: "Omar Ben Ali" },
  { id: "sup-004", name: "Koray Okumus" },
] as const;

const walletMethods: AccountMethod[] = ["D17", "Flouci", "Kashy", "e-Dinar"];

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function createDefaultConfig(method: AccountMethod): AccountConfig {
  const supervisorRules = supervisors.map((supervisor) => ({
    id: supervisor.id,
    name: supervisor.name,
    mode: "Not set" as SupervisorMode,
  }));

  return {
    ownerName: "",
    cardNumber: "",
    expiry: "",
    walletNumber: "",
    walletName: "",
    pin: "",
    voucherCode: "",
    issuer: "",
    denomination: "",
    maxTransactions: "",
    maxAmount: "",
    supervisors: supervisorRules,
    scheduleEnabled: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "08:00",
    endTime: "22:00",
    timezone: "Africa/Tunis",
    openingBalance: 0,
  };
}

const initialAccounts: PaymentAccount[] = [
  {
    id: "ACC-001",
    accountName: "D17 Primary",
    method: "D17",
    type: "Wallet",
    identifier: "WLT-D17-4589",
    balance: 24850.42,
    currency: "TND",
    status: "Active",
    lastActivity: "Today",
    change: 1240,
    config: {
      ...createDefaultConfig("D17"),
      ownerName: "PayMine Operations",
      cardNumber: "**** **** **** 4589",
      expiry: "12 / 28",
      walletNumber: "D17-4589-01",
      walletName: "D17 Primary",
      pin: "••••",
      maxTransactions: "250",
      maxAmount: "50000",
      supervisors: [
        { id: "sup-001", name: "Maya Chen", mode: "Include" },
        { id: "sup-002", name: "Aiy Ben Salah", mode: "Include" },
        { id: "sup-003", name: "Omar Ben Ali", mode: "Exclude" },
        { id: "sup-004", name: "Koray Okumus", mode: "Not set" },
      ],
      scheduleEnabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startTime: "07:00",
      endTime: "23:00",
      openingBalance: 24850.42,
    },
  },
  {
    id: "ACC-002",
    accountName: "Flouci Main",
    method: "Flouci",
    type: "Wallet",
    identifier: "WLT-FLC-2201",
    balance: 35200,
    currency: "TND",
    status: "Active",
    lastActivity: "Yesterday",
    change: 880.5,
    config: {
      ...createDefaultConfig("Flouci"),
      ownerName: "PayMine Treasury",
      walletNumber: "+216 20 481 220",
      walletName: "Flouci Main",
      pin: "••••",
      maxTransactions: "180",
      maxAmount: "35000",
      supervisors: [
        { id: "sup-001", name: "Maya Chen", mode: "Include" },
        { id: "sup-002", name: "Aiy Ben Salah", mode: "Not set" },
        { id: "sup-003", name: "Omar Ben Ali", mode: "Include" },
        { id: "sup-004", name: "Koray Okumus", mode: "Exclude" },
      ],
      scheduleEnabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "09:00",
      endTime: "21:00",
      openingBalance: 35200,
    },
  },
  {
    id: "ACC-003",
    accountName: "Kashy Reserve",
    method: "Kashy",
    type: "Wallet",
    identifier: "WLT-KSH-9007",
    balance: 18450.8,
    currency: "TND",
    status: "Active",
    lastActivity: "2 hours ago",
    change: -620.3,
    config: {
      ...createDefaultConfig("Kashy"),
      ownerName: "PayMine Operations",
      walletNumber: "KSH-9007",
      walletName: "Kashy Reserve",
      pin: "••••",
      maxTransactions: "120",
      maxAmount: "25000",
      scheduleEnabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startTime: "00:00",
      endTime: "23:59",
      openingBalance: 18450.8,
    },
  },
  {
    id: "ACC-004",
    accountName: "e-Dinar Treasury",
    method: "e-Dinar",
    type: "Wallet",
    identifier: "WLT-ED-7732",
    balance: 61450,
    currency: "TND",
    status: "Active",
    lastActivity: "Today",
    change: 2840,
    config: {
      ...createDefaultConfig("e-Dinar"),
      ownerName: "PayMine Treasury",
      cardNumber: "**** **** **** 7732",
      expiry: "06 / 29",
      walletNumber: "ED-7732",
      walletName: "e-Dinar Treasury",
      pin: "••••",
      maxTransactions: "400",
      maxAmount: "75000",
      scheduleEnabled: false,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "08:00",
      endTime: "20:00",
      openingBalance: 61450,
    },
  },
  {
    id: "ACC-005",
    accountName: "Cash Voucher Stock",
    method: "Voucher",
    type: "Voucher",
    identifier: "VCH-CASH-001",
    balance: 8750,
    currency: "TND",
    status: "Active",
    lastActivity: "Today",
    change: 320,
    config: {
      ...createDefaultConfig("Voucher"),
      ownerName: "PayMine Voucher Desk",
      voucherCode: "CASH-TND",
      issuer: "PayMine Voucher Desk",
      denomination: "50",
      maxTransactions: "300",
      maxAmount: "15000",
      scheduleEnabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startTime: "08:00",
      endTime: "22:00",
      openingBalance: 8750,
    },
  },
];

const emptyConfig = (method: AccountMethod) => createDefaultConfig(method);

export const Route = createFileRoute("/(main)/dashboard/accounts")({ component: Page });

function Page() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [typeFilter, setTypeFilter] = useState<"All" | AccountType>("All");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<PaymentAccount | null>(null);

  const filteredAccounts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesType = typeFilter === "All" || account.type === typeFilter;
      const matchesSearch =
        !needle ||
        [account.id, account.accountName, account.method, account.identifier].some((value) =>
          value.toLowerCase().includes(needle),
        );
      return matchesType && matchesSearch;
    });
  }, [accounts, query, typeFilter]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalChange = accounts.reduce((sum, account) => sum + account.change, 0);
  const linkedAccounts = accounts.length;

  function handleCreate(account: PaymentAccount) {
    setAccounts((current) => [account, ...current]);
    setAddOpen(false);
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard icon={<WalletCards className="size-4" />} label="Total Balance" value={formatMoney(totalBalance)} />
        <SummaryCard
          icon={<Activity className="size-4" />}
          label="Total Change"
          value={(totalChange >= 0 ? "+" : "-") + formatMoney(Math.abs(totalChange))}
          positive={totalChange >= 0}
        />
        <SummaryCard icon={<Link2 className="size-4" />} label="Linked Accounts" value={String(linkedAccounts)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["All", "Wallet", "Voucher"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                typeFilter === filter
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              ].join(" ")}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search accounts..." />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAccounts.map((account) => (
          <AccountCard key={account.id} account={account} onView={() => setViewAccount(account)} />
        ))}

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="group flex min-h-[178px] items-center justify-center rounded-2xl border border-dashed bg-background transition-colors hover:bg-muted/20"
        >
          <span className="flex flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">Link New Account</span>
              <span className="mt-1 block text-xs text-muted-foreground">Wallet or voucher account</span>
            </span>
          </span>
        </button>
      </div>

      {!filteredAccounts.length ? (
        <div className="rounded-2xl border px-5 py-12 text-center text-sm text-muted-foreground">
          No accounts match the current filter.
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground">
        Account data and balances are mock UI data in this frontend template. The creation flow is ready for backend persistence when connected.
      </p>

      <AccountWizard open={addOpen} onOpenChange={setAddOpen} onCreate={handleCreate} />
      <AccountDetailsDialog account={viewAccount} open={Boolean(viewAccount)} onOpenChange={(open) => !open && setViewAccount(null)} />
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <span className={positive === undefined ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground" : positive ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600" : "flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600"}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountCard({ account, onView }: { account: PaymentAccount; onView: () => void }) {
  const positive = account.change >= 0;

  return (
    <Card className="relative overflow-hidden rounded-2xl border shadow-none">
      <div className={positive ? "absolute inset-y-0 left-0 w-1 bg-emerald-500" : "absolute inset-y-0 left-0 w-1 bg-rose-500"} />
      <CardHeader className="pb-2 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              {account.type === "Voucher" ? <CreditCard className="size-4" /> : <WalletCards className="size-4" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{account.method}</p>
              <CardTitle className="mt-1 truncate text-sm">{account.accountName}</CardTitle>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{account.identifier}</p>
            </div>
          </div>
          <Badge variant={account.status === "Active" ? "secondary" : "outline"}>{account.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pl-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Available balance</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatMoney(account.balance)}</p>
          </div>
          <button type="button" onClick={onView} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={"View " + account.accountName}>
            <Eye className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span className={positive ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-600" : "inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 font-medium text-rose-600"}>
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {positive ? "+" : "-"}{formatMoney(Math.abs(account.change))} today
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock3 className="size-3.5" />
            {account.lastActivity}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountWizard({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (account: PaymentAccount) => void;
}) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AccountType>("Wallet");
  const [method, setMethod] = useState<AccountMethod>("D17");
  const [accountName, setAccountName] = useState("");
  const [config, setConfig] = useState<AccountConfig>(() => emptyConfig("D17"));

  function reset(methodValue: AccountMethod = "D17", typeValue: AccountType = "Wallet") {
    setStep(1);
    setType(typeValue);
    setMethod(methodValue);
    setAccountName("");
    setConfig(emptyConfig(methodValue));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function changeType(nextType: AccountType) {
    const nextMethod: AccountMethod = nextType === "Wallet" ? "D17" : "Voucher";
    setType(nextType);
    setMethod(nextMethod);
    setConfig(emptyConfig(nextMethod));
  }

  function changeMethod(nextMethod: AccountMethod) {
    setMethod(nextMethod);
    setConfig((current) => ({ ...emptyConfig(nextMethod), openingBalance: current.openingBalance }));
  }

  function updateConfig(patch: Partial<AccountConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function toggleDay(day: string) {
    const days = config.days.includes(day) ? config.days.filter((item) => item !== day) : [...config.days, day];
    updateConfig({ days });
  }

  function setSupervisorMode(id: string, mode: SupervisorMode) {
    updateConfig({
      supervisors: config.supervisors.map((item) => (item.id === id ? { ...item, mode } : item)),
    });
  }

  function canContinue() {
    if (step === 1) {
      if (!accountName.trim()) return false;
      if (!config.ownerName.trim()) return false;
      if (type === "Wallet" && !config.walletNumber.trim()) return false;
      if (type === "Wallet" && method === "D17" && (!config.cardNumber.trim() || !config.expiry.trim() || !config.walletName.trim() || !config.pin.trim())) return false;
      if (type === "Wallet" && method === "Flouci" && !config.pin.trim()) return false;
      if (type === "Voucher" && (!config.voucherCode.trim() || !config.issuer.trim() || !config.denomination.trim())) return false;
    }
    if (step === 2) {
      const hasSupervisorRule = config.supervisors.some((item) => item.mode !== "Not set");
      if (!hasSupervisorRule) return false;
    }
    if (step === 3) {
      if (config.scheduleEnabled && (config.days.length === 0 || !config.startTime || !config.endTime)) return false;
    }
    if (step === 4) {
      if (Number.isNaN(config.openingBalance) || config.openingBalance < 0) return false;
    }
    return true;
  }

  function createAccount() {
    const identifier =
      type === "Voucher"
        ? config.voucherCode || accountName
        : config.walletNumber || accountName;

    onCreate({
      id: "ACC-" + String(Date.now()).slice(-6),
      accountName: accountName.trim(),
      method,
      type,
      identifier,
      balance: config.openingBalance,
      currency: "TND",
      status: "Active",
      lastActivity: "Just now",
      change: 0,
      config,
    });

    reset();
  }

  const titleByStep = ["Account details", "Supervisors & limits", "Schedule", "Opening balance & review"];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle>Link new account</DialogTitle>
              <DialogDescription>Create a Wallet or Voucher account using a method-specific configuration.</DialogDescription>
            </div>
            <Badge variant="outline">Step {step} of 4</Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2 sm:grid-cols-4">
            {titleByStep.map((title, index) => {
              const number = index + 1;
              const done = number < step;
              const active = number === step;
              return (
                <div key={title} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className={done || active ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background" : "flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"}>
                    {done ? <Check className="size-3.5" /> : number}
                  </span>
                  <span className={active ? "text-xs font-semibold text-foreground" : "text-xs text-muted-foreground"}>{title}</span>
                </div>
              );
            })}
          </div>

          {step === 1 ? (
            <StepAccountDetails
              type={type}
              method={method}
              accountName={accountName}
              config={config}
              onTypeChange={changeType}
              onMethodChange={changeMethod}
              onAccountNameChange={setAccountName}
              onConfigChange={updateConfig}
            />
          ) : null}

          {step === 2 ? (
            <StepSupervisors
              config={config}
              onModeChange={setSupervisorMode}
              onConfigChange={updateConfig}
            />
          ) : null}

          {step === 3 ? (
            <StepSchedule config={config} onConfigChange={updateConfig} onToggleDay={toggleDay} />
          ) : null}

          {step === 4 ? (
            <StepReview
              type={type}
              method={method}
              accountName={accountName}
              config={config}
              onConfigChange={updateConfig}
            />
          ) : null}
        </div>

        <DialogFooter className="flex-col-reverse justify-between gap-2 sm:flex-row">
          <div>
            {step === 4 ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="size-3.5" />
                Opening balance is captured before activation to keep transaction balances aligned.
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                <ChevronLeft />
                Back
              </Button>
            ) : null}
            {step < 4 ? (
              <Button disabled={!canContinue()} onClick={() => setStep((current) => current + 1)}>
                Continue
                <ChevronRight />
              </Button>
            ) : (
              <Button disabled={!canContinue()} onClick={createAccount}>
                <CheckCircle2 />
                Confirm & add account
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepAccountDetails({
  type,
  method,
  accountName,
  config,
  onTypeChange,
  onMethodChange,
  onAccountNameChange,
  onConfigChange,
}: {
  type: AccountType;
  method: AccountMethod;
  accountName: string;
  config: AccountConfig;
  onTypeChange: (value: AccountType) => void;
  onMethodChange: (value: AccountMethod) => void;
  onAccountNameChange: (value: string) => void;
  onConfigChange: (patch: Partial<AccountConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(value) => onTypeChange(value as AccountType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Wallet">Wallet</SelectItem>
              <SelectItem value="Voucher">Voucher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{type === "Wallet" ? "Wallet method" : "Voucher method"}</Label>
          <Select value={method} onValueChange={(value) => onMethodChange(value as AccountMethod)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(type === "Wallet" ? walletMethods : ["Voucher" as const]).map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <WalletCards className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{method} account</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Fields are driven by the selected method, so two Wallet accounts can have different data and configuration.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label>Account display name</Label>
          <Input value={accountName} onChange={(event) => onAccountNameChange(event.target.value)} placeholder={"Example: " + method + " Primary"} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label>Account holder name</Label>
          <Input value={config.ownerName} onChange={(event) => onConfigChange({ ownerName: event.target.value })} placeholder="Full name" />
        </div>

        {type === "Wallet" && method === "D17" ? (
          <>
            <Field label="Card Number" value={config.cardNumber} onChange={(value) => onConfigChange({ cardNumber: value })} placeholder="0000 0000 0000 0000" />
            <Field label="Exp" value={config.expiry} onChange={(value) => onConfigChange({ expiry: value })} placeholder="MM / YY" />
            <Field label="Wallet Number" value={config.walletNumber} onChange={(value) => onConfigChange({ walletNumber: value })} placeholder="D17-XXXXXX" />
            <Field label="Wallet Name" value={config.walletName} onChange={(value) => onConfigChange({ walletName: value })} placeholder="D17 Primary" />
            <Field label="PIN" type="password" value={config.pin} onChange={(value) => onConfigChange({ pin: value })} placeholder="••••" />
          </>
        ) : null}

        {type === "Wallet" && method === "Flouci" ? (
          <>
            <Field label="Wallet Number" value={config.walletNumber} onChange={(value) => onConfigChange({ walletNumber: value })} placeholder="+216 20 000 000" />
            <Field label="Wallet Name" value={config.walletName} onChange={(value) => onConfigChange({ walletName: value })} placeholder="Flouci Main" />
            <Field label="PIN" type="password" value={config.pin} onChange={(value) => onConfigChange({ pin: value })} placeholder="••••" />
          </>
        ) : null}

        {type === "Wallet" && method === "Kashy" ? (
          <>
            <Field label="Wallet Number" value={config.walletNumber} onChange={(value) => onConfigChange({ walletNumber: value })} placeholder="KSH-000000" />
            <Field label="Wallet Name" value={config.walletName} onChange={(value) => onConfigChange({ walletName: value })} placeholder="Kashy Reserve" />
            <Field label="PIN" type="password" value={config.pin} onChange={(value) => onConfigChange({ pin: value })} placeholder="••••" />
          </>
        ) : null}

        {type === "Wallet" && method === "e-Dinar" ? (
          <>
            <Field label="Card Number" value={config.cardNumber} onChange={(value) => onConfigChange({ cardNumber: value })} placeholder="0000 0000 0000 0000" />
            <Field label="Exp" value={config.expiry} onChange={(value) => onConfigChange({ expiry: value })} placeholder="MM / YY" />
            <Field label="Wallet Number" value={config.walletNumber} onChange={(value) => onConfigChange({ walletNumber: value })} placeholder="ED-XXXXXX" />
            <Field label="Wallet Name" value={config.walletName} onChange={(value) => onConfigChange({ walletName: value })} placeholder="e-Dinar Treasury" />
            <Field label="PIN" type="password" value={config.pin} onChange={(value) => onConfigChange({ pin: value })} placeholder="••••" />
          </>
        ) : null}

        {type === "Voucher" ? (
          <>
            <Field label="Voucher code / series" value={config.voucherCode} onChange={(value) => onConfigChange({ voucherCode: value })} placeholder="CASH-TND" />
            <Field label="Issuer" value={config.issuer} onChange={(value) => onConfigChange({ issuer: value })} placeholder="Voucher issuer" />
            <Field label="Denomination" value={config.denomination} onChange={(value) => onConfigChange({ denomination: value })} placeholder="50" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function StepSupervisors({
  config,
  onModeChange,
  onConfigChange,
}: {
  config: AccountConfig;
  onModeChange: (id: string, mode: SupervisorMode) => void;
  onConfigChange: (patch: Partial<AccountConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <UsersRound className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Supervisors responsible for this account</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Use Include to assign a supervisor, Exclude to explicitly block one, or leave Not set for no account-specific rule.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-[minmax(0,1fr)_132px] border-b bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Supervisor</span>
          <span>Rule</span>
        </div>
        {config.supervisors.map((supervisor) => (
          <div key={supervisor.id} className="grid grid-cols-[minmax(0,1fr)_132px] items-center gap-3 border-b px-4 py-3 last:border-b-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {supervisor.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </span>
              <span className="text-sm">{supervisor.name}</span>
            </div>
            <Select value={supervisor.mode} onValueChange={(value) => onModeChange(supervisor.id, value as SupervisorMode)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Include">Include</SelectItem>
                <SelectItem value="Exclude">Exclude</SelectItem>
                <SelectItem value="Not set">Not set</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LimitField
          icon={<Activity className="size-4" />}
          label="Maximum transactions"
          description="Leave blank for unlimited."
          value={config.maxTransactions}
          onChange={(value) => onConfigChange({ maxTransactions: value })}
          placeholder="250"
          suffix="transactions"
        />
        <LimitField
          icon={<Gauge className="size-4" />}
          label="Maximum amount"
          description="Leave blank for unlimited."
          value={config.maxAmount}
          onChange={(value) => onConfigChange({ maxAmount: value })}
          placeholder="50000"
          suffix="TND / day"
        />
      </div>
    </div>
  );
}

function StepSchedule({
  config,
  onConfigChange,
  onToggleDay,
}: {
  config: AccountConfig;
  onConfigChange: (patch: Partial<AccountConfig>) => void;
  onToggleDay: (day: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Scheduled activation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Define when this account is available to the portal.</p>
          </div>
        </div>
        <Switch checked={config.scheduleEnabled} onCheckedChange={(checked) => onConfigChange({ scheduleEnabled: checked })} />
      </div>

      <div className={config.scheduleEnabled ? "space-y-4" : "pointer-events-none opacity-50 space-y-4"}>
        <div className="grid gap-2">
          <Label>Active days</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {dayOptions.map((day) => {
              const selected = config.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggleDay(day)}
                  className={[
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    selected ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Start time</Label>
            <Input type="time" value={config.startTime} onChange={(event) => onConfigChange({ startTime: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>End time</Label>
            <Input type="time" value={config.endTime} onChange={(event) => onConfigChange({ endTime: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select value={config.timezone} onValueChange={(value) => onConfigChange({ timezone: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Tunis">Africa/Tunis</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReview({
  type,
  method,
  accountName,
  config,
  onConfigChange,
}: {
  type: AccountType;
  method: AccountMethod;
  accountName: string;
  config: AccountConfig;
  onConfigChange: (patch: Partial<AccountConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-amber-600" />
          <div>
            <p className="text-sm font-medium">Opening balance required before activation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the real balance currently visible in the account. This becomes the opening balance so the transaction ledger starts from the same amount.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
        <div className="grid gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Account summary</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <ReviewItem label="Name" value={accountName || "—"} />
              <ReviewItem label="Type" value={type} />
              <ReviewItem label="Method" value={method} />
              <ReviewItem label="Owner" value={config.ownerName || "—"} />
              <ReviewItem label="Identifier" value={config.walletNumber || config.voucherCode || "—"} />
              <ReviewItem label="Supervisors" value={String(config.supervisors.filter((item) => item.mode === "Include").length) + " included"} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Rules & schedule</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <ReviewItem label="Max transactions" value={config.maxTransactions || "Unlimited"} />
              <ReviewItem label="Max amount" value={config.maxAmount ? config.maxAmount + " TND / day" : "Unlimited"} />
              <ReviewItem label="Schedule" value={config.scheduleEnabled ? config.startTime + " – " + config.endTime : "Always available"} />
              <ReviewItem label="Active days" value={config.scheduleEnabled ? config.days.join(", ") : "All days"} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Current account balance</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label>Available balance now</Label>
              <div className="flex items-center rounded-lg border bg-background pl-3">
                <span className="text-sm text-muted-foreground">TND</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(config.openingBalance)}
                  onChange={(event) => {
                    const numeric = Number(event.target.value);
                    onConfigChange({ openingBalance: Number.isNaN(numeric) ? 0 : numeric });
                  }}
                  className="border-0 pl-2 shadow-none focus-visible:ring-0"
                />
              </div>
              <p className="text-[11px] leading-5 text-muted-foreground">Use the actual balance from the wallet/voucher account at the moment you connect it.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function LimitField({
  icon,
  label,
  description,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        <span className="shrink-0 text-[11px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function AccountDetailsDialog({
  account,
  open,
  onOpenChange,
}: {
  account: PaymentAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!account) return null;

  const included = account.config.supervisors.filter((item) => item.mode === "Include");
  const excluded = account.config.supervisors.filter((item) => item.mode === "Exclude");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>{account.accountName}</DialogTitle>
              <DialogDescription>{account.id} · {account.method} · {account.type}</DialogDescription>
            </div>
            <Badge variant={account.status === "Active" ? "secondary" : "outline"}>{account.status}</Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Balance</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{formatMoney(account.balance)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Opening balance recorded at account creation.</p>
              </div>
              <Badge variant="outline">{account.identifier}</Badge>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Account-specific configuration</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <ReviewItem label="Owner" value={account.config.ownerName || "—"} />
                <ReviewItem label="Max transactions" value={account.config.maxTransactions || "Unlimited"} />
                <ReviewItem label="Max amount" value={account.config.maxAmount ? account.config.maxAmount + " TND / day" : "Unlimited"} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Included supervisors</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {included.length ? included.map((item) => <Badge key={item.id} variant="secondary">{item.name}</Badge>) : <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Excluded supervisors</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {excluded.length ? excluded.map((item) => <Badge key={item.id} variant="outline">{item.name}</Badge>) : <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium">Schedule</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.config.scheduleEnabled
                    ? account.config.days.join(", ") + " · " + account.config.startTime + "–" + account.config.endTime + " · " + account.config.timezone
                    : "Always available"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            Credentials are shown as masked placeholders in this UI template.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TND";
}

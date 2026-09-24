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
  Sparkles,
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
import { distributors } from "../distributors/-components/data";

type AccountType = "Wallet" | "Voucher";
type AccountStatus = "Active" | "Disabled";
type AccountMethod = "D17" | "Flouci" | "Kashy" | "e-Dinar" | "Voucher";

type SupervisorPolicy = "All" | "Include only" | "Exclude selected";

type SupervisorRule = {
  id: string;
  name: string;
  avatarUrl: string;
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
  supervisorPolicy: SupervisorPolicy;
  selectedSupervisorIds: string[];
  supervisors: SupervisorRule[];
  scheduleEnabled: boolean;
  days: string[];
  startTime: string;
  endTime: string;
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

const supervisorDirectory: SupervisorRule[] = distributors
  .filter((distributor) => distributor.type === "Supervisor" && distributor.status === "Active")
  .slice(0, 6)
  .map((distributor) => ({
    id: distributor.id,
    name: distributor.name,
    avatarUrl: distributor.avatarUrl ?? "",
  }));

const walletMethods: AccountMethod[] = ["D17", "Flouci", "Kashy", "e-Dinar"];

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function createDefaultConfig(method: AccountMethod): AccountConfig {
  const supervisorRules = supervisorDirectory.map((supervisor) => ({
    id: supervisor.id,
    name: supervisor.name,
    avatarUrl: supervisor.avatarUrl,
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
    supervisorPolicy: "All",
    selectedSupervisorIds: [],
    supervisors: supervisorRules,
    scheduleEnabled: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "08:00",
    endTime: "22:00",
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
      supervisorPolicy: "Exclude selected",
      selectedSupervisorIds: ["SUP-000221"],
      supervisors: supervisorDirectory.map((supervisor) => ({ ...supervisor })),
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
      supervisorPolicy: "Include only",
      selectedSupervisorIds: ["SUP-000184", "SUP-000221"],
      supervisors: supervisorDirectory.map((supervisor) => ({ ...supervisor })),
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

  function setSupervisorPolicy(policy: SupervisorPolicy) {
    updateConfig({ supervisorPolicy: policy, selectedSupervisorIds: [] });
  }

  function toggleSupervisor(id: string) {
    updateConfig({
      selectedSupervisorIds: config.selectedSupervisorIds.includes(id)
        ? config.selectedSupervisorIds.filter((item) => item !== id)
        : [...config.selectedSupervisorIds, id],
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
      if (config.supervisorPolicy !== "All" && config.selectedSupervisorIds.length === 0) return false;
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
              onPolicyChange={setSupervisorPolicy}
              onToggleSupervisor={toggleSupervisor}
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
      <div>
        <Label className="text-sm">Account type</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[
            { value: "Wallet" as const, title: "Wallet", description: "Live wallet balance used for deposits and withdrawals.", icon: WalletCards },
            { value: "Voucher" as const, title: "Voucher", description: "Code / inventory based payment account.", icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            const active = type === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onTypeChange(item.value)}
                className={[
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                  active ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
                ].join(" ")}
              >
                <span className={active ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background" : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-sm">{type === "Wallet" ? "Wallet method" : "Voucher method"}</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {(type === "Wallet" ? walletMethods : ["Voucher" as const]).map((item) => {
            const active = method === item;
            const descriptions: Record<string, string> = {
              D17: "Card, wallet number and PIN based wallet.",
              Flouci: "Wallet number and PIN based wallet.",
              Kashy: "Wallet number and PIN based wallet.",
              "e-Dinar": "Card, wallet number and PIN based wallet.",
              Voucher: "Code, issuer and denomination based account.",
            };
            return (
              <button
                key={item}
                type="button"
                onClick={() => onMethodChange(item)}
                className={[
                  "rounded-xl border p-3 text-left transition-colors",
                  active ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-bold">{item === "e-Dinar" ? "ED" : item === "Voucher" ? "V" : item.slice(0, 1)}</span>
                  {active ? <Check className="size-4" /> : null}
                </span>
                <span className="mt-2 block text-sm font-semibold">{item}</span>
                <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">{descriptions[item]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <WalletCards className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{method} account details</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">The fields below change with the selected method. Each linked account keeps its own configuration.</p>
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
  onPolicyChange,
  onToggleSupervisor,
  onConfigChange,
}: {
  config: AccountConfig;
  onPolicyChange: (policy: SupervisorPolicy) => void;
  onToggleSupervisor: (id: string) => void;
  onConfigChange: (patch: Partial<AccountConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <UsersRound className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Who can operate this account?</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Start with all supervisors, include only selected people, or exclude selected people. This is easier to scan than setting a rule one row at a time.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { value: "All" as const, title: "All supervisors", description: "Everyone active can operate the account." },
          { value: "Include only" as const, title: "Include selected", description: "Only the people you choose can operate it." },
          { value: "Exclude selected" as const, title: "Exclude selected", description: "Everyone can operate it except the people you choose." },
        ].map((item) => {
          const active = config.supervisorPolicy === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onPolicyChange(item.value)}
              className={[
                "rounded-xl border p-4 text-left transition-colors",
                active ? "border-foreground bg-muted/40" : "hover:bg-muted/30",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{item.title}</p>
                {active ? <Check className="size-4" /> : null}
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.description}</p>
            </button>
          );
        })}
      </div>

      {config.supervisorPolicy === "All" ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <div>
            <p className="text-sm font-medium">All active supervisors are enabled</p>
            <p className="mt-0.5 text-xs text-muted-foreground">No individual selection is required.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {config.supervisors.map((supervisor) => {
            const selected = config.selectedSupervisorIds.includes(supervisor.id);
            return (
              <button
                key={supervisor.id}
                type="button"
                onClick={() => onToggleSupervisor(supervisor.id)}
                className={[
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected ? "border-foreground bg-muted/30" : "hover:bg-muted/20",
                ].join(" ")}
              >
                <img src={supervisor.avatarUrl} alt="" className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{supervisor.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {selected ? (config.supervisorPolicy === "Include only" ? "Included" : "Excluded") : "Not selected"}
                  </span>
                </span>
                <span className={selected ? "flex size-7 items-center justify-center rounded-full bg-foreground text-background" : "flex size-7 items-center justify-center rounded-full border text-muted-foreground"}>
                  {selected ? <Check className="size-3.5" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <LimitField
          icon={<Activity className="size-4" />}
          label="Maximum transactions"
          description="Leave blank for unlimited."
          value={config.maxTransactions}
          onChange={(value) => onConfigChange({ maxTransactions: value })}
          placeholder="250"
          suffix="transactions / day"
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
  const allDays = config.days.length === dayOptions.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Scheduled activation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose whether this account follows a weekly schedule or stays available all the time.</p>
          </div>
        </div>
        <Switch checked={config.scheduleEnabled} onCheckedChange={(checked) => onConfigChange({ scheduleEnabled: checked })} />
      </div>

      {!config.scheduleEnabled ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="size-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Always available</p>
              <p className="mt-0.5 text-xs text-muted-foreground">The account is available 24/7 and does not use day or time restrictions.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Active days</Label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{allDays ? "All days" : config.days.join(", ") || "No days selected"}</p>
              </div>
              <Button type="button" size="sm" variant={allDays ? "default" : "outline"} onClick={() => onConfigChange({ days: allDays ? [] : [...dayOptions] })}>
                {allDays ? "All days" : "Use all days"}
              </Button>
            </div>

            {!allDays ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
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
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Start time</Label>
              <Input type="time" value={config.startTime} onChange={(event) => onConfigChange({ startTime: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>End time</Label>
              <Input type="time" value={config.endTime} onChange={(event) => onConfigChange({ endTime: event.target.value })} />
            </div>
          </div>
        </div>
      )}
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
  const supervisorSummary =
    config.supervisorPolicy === "All"
      ? "All active supervisors"
      : config.selectedSupervisorIds.length + (config.supervisorPolicy === "Include only" ? " included" : " excluded");

  const accountIdentifier = config.walletNumber || config.voucherCode || "—";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-amber-600" />
          <div>
            <p className="text-sm font-medium">Confirm the current balance before activation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the exact balance shown in the wallet right now. It becomes the opening balance for this account and keeps the starting ledger aligned with the provider.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Review</p>
                <CardTitle className="mt-1 text-base">Account summary</CardTitle>
              </div>
              <Badge variant="outline">{type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <SummaryRow label="Account name" value={accountName || "—"} />
              <SummaryRow label="Method" value={method} />
              <SummaryRow label="Account holder" value={config.ownerName || "—"} />
              <SummaryRow label="Identifier" value={accountIdentifier} />
              <SummaryRow label="Supervisors" value={supervisorSummary} />
              <SummaryRow label="Limits" value={(config.maxTransactions || "Unlimited") + " transactions · " + (config.maxAmount ? config.maxAmount + " TND" : "Unlimited amount")} />
              <SummaryRow label="Schedule" value={config.scheduleEnabled ? (config.days.length === dayOptions.length ? "All days" : config.days.join(", ") || "No days") + " · " + config.startTime + "–" + config.endTime : "Always available"} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Required</p>
            <CardTitle className="mt-1 text-base">Opening balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Current balance in provider</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="pb-1 text-xs font-medium text-muted-foreground">TND</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(config.openingBalance)}
                  onChange={(event) => {
                    const numeric = Number(event.target.value);
                    onConfigChange({ openingBalance: Number.isNaN(numeric) ? 0 : numeric });
                  }}
                  className="h-11 border-0 bg-transparent px-0 text-2xl font-semibold tabular-nums shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
              This amount is recorded as the account opening balance when you confirm.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ReviewStat icon={<UsersRound className="size-4" />} label="Supervisors" value={supervisorSummary} />
        <ReviewStat icon={<Clock3 className="size-4" />} label="Availability" value={config.scheduleEnabled ? "Scheduled" : "Always on"} />
        <ReviewStat icon={<WalletCards className="size-4" />} label="Opening balance" value={formatMoney(config.openingBalance)} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ReviewStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-medium">{value}</p>
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

  const selectedSupervisors = account.config.supervisors.filter((item) => account.config.selectedSupervisorIds.includes(item.id));

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

              <div className="rounded-lg border p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Supervisor policy</p>
                <p className="mt-1 text-sm font-medium">{account.config.supervisorPolicy}</p>
                {account.config.supervisorPolicy !== "All" ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedSupervisors.length ? selectedSupervisors.map((item) => <Badge key={item.id} variant={account.config.supervisorPolicy === "Include only" ? "secondary" : "outline"}>{item.name}</Badge>) : <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium">Schedule</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.config.scheduleEnabled
                    ? (account.config.days.length === dayOptions.length ? "All days" : account.config.days.join(", ")) + " · " + account.config.startTime + "–" + account.config.endTime
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

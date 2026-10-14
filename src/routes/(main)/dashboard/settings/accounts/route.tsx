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
  Plus,
  PlugZap,
  Sparkles,
  TicketCheck,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { distributors } from "../../distributors/-components/data";

type AccountType = "Wallet" | "Voucher" | "Payment Gateway";
type AccountStatus = "Active" | "Disabled" | "Not connected";
type GatewayMode = "Test" | "Live";
type LimitCurrency = "TND" | "USD" | "EUR" | "USDT";
type AccountMethod =
  | "D17"
  | "Flouci"
  | "Kashy"
  | "e-Dinar"
  | "Voucher"
  | "Binance Pay"
  | "Stripe"
  | "PayPal"
  | "Coinbase Commerce"
  | "NOWPayments";

type SupervisorPolicy = "All" | "Include only" | "Exclude selected";

type SupervisorRule = {
  id: string;
  name: string;
  avatarUrl: string;
};

type GatewayCredentialKey = "apiKey" | "apiSecret" | "webhookPublicKey" | "publishableKey" | "webhookSecret" | "clientId" | "clientSecret" | "webhookId" | "ipnSecret" | "appToken" | "appSecret";
type GatewayCredentialField = { key: GatewayCredentialKey; label: string; placeholder: string; secret?: boolean };

type AccountConfig = {
  ownerName: string;
  merchantAccountId: string;
  integrationMode: GatewayMode;
  limitCurrency: LimitCurrency;
  apiKey: string;
  apiSecret: string;
  webhookPublicKey: string;
  publishableKey: string;
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
  webhookId: string;
  ipnSecret: string;
  appToken: string;
  appSecret: string;
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
  source: "admin" | "rented";
  rentalExpiresAt?: string;
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
const gatewayMethods: AccountMethod[] = [
  "Binance Pay",
  "Stripe",
  "PayPal",
  "Coinbase Commerce",
  "NOWPayments",
  "Flouci",
];

const gatewayCredentialFields: Partial<Record<AccountMethod, GatewayCredentialField[]>> = {
  "Binance Pay": [
    { key: "apiKey", label: "API Identity Key", placeholder: "Paste Binance Pay API identity key", secret: true },
    { key: "apiSecret", label: "API Secret", placeholder: "Paste Binance Pay API secret", secret: true },
    { key: "webhookPublicKey", label: "Webhook verification public key", placeholder: "Paste Binance Pay webhook public key" },
  ],
  Stripe: [
    { key: "publishableKey", label: "Publishable key", placeholder: "pk_test_… or pk_live_…" },
    { key: "apiSecret", label: "Secret key", placeholder: "sk_test_… or sk_live_…", secret: true },
    { key: "webhookSecret", label: "Webhook signing secret", placeholder: "whsec_…", secret: true },
  ],
  PayPal: [
    { key: "clientId", label: "Client ID", placeholder: "Paste PayPal app client ID" },
    { key: "clientSecret", label: "Client Secret", placeholder: "Paste PayPal app client secret", secret: true },
    { key: "webhookId", label: "Webhook ID", placeholder: "Paste the registered webhook ID" },
  ],
  "Coinbase Commerce": [
    { key: "apiKey", label: "API Key", placeholder: "Paste Coinbase Commerce API key", secret: true },
    { key: "webhookSecret", label: "Webhook shared secret", placeholder: "Paste the webhook shared secret", secret: true },
  ],
  NOWPayments: [
    { key: "apiKey", label: "API Key", placeholder: "Paste NOWPayments API key", secret: true },
    { key: "ipnSecret", label: "IPN Secret", placeholder: "Paste the IPN secret", secret: true },
  ],
  Flouci: [
    { key: "appToken", label: "Application token", placeholder: "Paste Flouci application token", secret: true },
    { key: "appSecret", label: "Application secret", placeholder: "Paste Flouci application secret", secret: true },
    { key: "webhookSecret", label: "Callback verification secret", placeholder: "Paste callback verification secret", secret: true },
  ],
};
const requiredGatewayCredentials: Partial<Record<AccountMethod, GatewayCredentialKey[]>> = {
  "Binance Pay": ["apiKey", "apiSecret", "webhookPublicKey"],
  Stripe: ["publishableKey", "apiSecret", "webhookSecret"],
  PayPal: ["clientId", "clientSecret", "webhookId"],
  "Coinbase Commerce": ["apiKey", "webhookSecret"],
  NOWPayments: ["apiKey", "ipnSecret"],
  Flouci: ["appToken", "appSecret", "webhookSecret"],
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function createDefaultConfig(method: AccountMethod): AccountConfig {
  const supervisorRules = supervisorDirectory.map((supervisor) => ({
    id: supervisor.id,
    name: supervisor.name,
    avatarUrl: supervisor.avatarUrl,
  }));

  return {
    ownerName: "",
    merchantAccountId: "",
    integrationMode: "Test",
    limitCurrency: "TND",
    apiKey: "",
    apiSecret: "",
    webhookPublicKey: "",
    publishableKey: "",
    webhookSecret: "",
    clientId: "",
    clientSecret: "",
    webhookId: "",
    ipnSecret: "",
    appToken: "",
    appSecret: "",
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
    source: "admin",
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
    source: "admin",
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
    source: "admin",
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
    source: "admin",
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
    source: "admin",
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

export const Route = createFileRoute("/(main)/dashboard/settings/accounts")({ component: Page });

function Page() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [rentedOffers, setRentedOffers] = useState<Record<string, string>>({});
  const [claimOfferId, setClaimOfferId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"All" | AccountType>("All");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<PaymentAccount | null>(null);
  const [rentOpen, setRentOpen] = useState(false);

  const filteredAccounts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesType = typeFilter === "All" || account.type === typeFilter;
      const matchesSearch =
        !needle ||
        [account.id, account.accountName, account.method, account.identifier, account.source].some((value) =>
          value.toLowerCase().includes(needle),
        );
      return matchesType && matchesSearch;
    });
  }, [accounts, query, typeFilter]);

  function handleCreate(account: PaymentAccount) {
    setAccounts((current) => [account, ...current]);
    setAddOpen(false);
  }

  function toggleAccountStatus(accountId: string) {
    setAccounts((current) => current.map((account) => {
      if (account.id !== accountId) return account;
      if (account.type === "Payment Gateway" && account.status === "Not connected") return account;
      return { ...account, status: account.status === "Active" ? "Disabled" : "Active" };
    }));
  }

  function handleRent(offerId: string) {
    setRentedOffers((current) =>
      current[offerId] ? current : { ...current, [offerId]: getRentalExpiryDate() },
    );
    setRentOpen(false);
  }

  const rentedOfferRecords = rentalOffers.flatMap((offer) => {
    const rentalExpiresAt = rentedOffers[offer.id];
    return rentalExpiresAt ? [{ ...offer, rentalExpiresAt }] : [];
  });

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["All", "Wallet", "Voucher", "Payment Gateway"] as const).map((filter) => (
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

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search accounts..." />
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-2 bg-primary px-3 font-semibold shadow-sm"
            onClick={() => setRentOpen(true)}
          >
            <TicketCheck className="size-4" />
            Rent Card
          </Button>
        </div>
      </div>

      {rentedOfferRecords.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Rented cards & wallets</p>
              <p className="text-xs text-muted-foreground">Rental accounts are shown here until they are claimed into your account list.</p>
            </div>
            <Badge variant="outline">{rentedOfferRecords.length} rented</Badge>
          </div>
          <div className="grid gap-2 xl:grid-cols-2">
            {rentedOfferRecords.map((offer) => (
              <RentedAccountCard key={offer.id} offer={offer} onClaim={() => setClaimOfferId(offer.id)} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAccounts.map((account) => (
          <AccountCard key={account.id} account={account} onView={() => setViewAccount(account)} onToggleStatus={() => toggleAccountStatus(account.id)} />
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
              <span className="mt-1 block text-xs text-muted-foreground">Wallet, voucher or payment gateway</span>
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
      <RentCardDialog
        open={rentOpen}
        onOpenChange={setRentOpen}
        rentedOffers={rentedOffers}
        onRent={handleRent}
      />
      <RentalClaimDialog
        offer={rentalOffers.find((item) => item.id === claimOfferId) ?? null}
        open={Boolean(claimOfferId)}
        onOpenChange={(open) => !open && setClaimOfferId(null)}
        onClaim={(offer, config) => {
          const rentalExpiresAt = rentedOffers[offer.id] ?? getRentalExpiryDate();
          const rentedAccount = buildRentedAccount(offer, config, rentalExpiresAt);
          handleCreate(rentedAccount);
          setRentedOffers((current) => {
            const next = { ...current };
            delete next[offer.id];
            return next;
          });
          setClaimOfferId(null);
        }}
      />
    </section>
  );
}

const accountMethodImages: Partial<Record<AccountMethod, string>> = {
  D17: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0ypBwHv3CfREaQhqna5sVwpNdMVutnTBwADkF_mOLxw&s=10",
  Flouci: "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY=s0-br30",
  Kashy: "https://play-lh.googleusercontent.com/pTtXnbOlZa8LXuvgdkvNb00J34wEPpDOHcEnBQiJYPV8zN5OQUBezMlosM0iO_KX5pLIbml45uvH-5MyUy1LQqI=w240-h480-rw",
  "e-Dinar": "https://www.ama-business.com/wp-content/uploads/2023/05/E-Dinar.jpg",
};

function AccountCard({ account, onView, onToggleStatus }: { account: PaymentAccount; onView: () => void; onToggleStatus: () => void }) {
  const positive = account.change >= 0;
  const isGateway = account.type === "Payment Gateway";
  const rentalExpired = account.source === "rented" && account.rentalExpiresAt
    ? getRentalTimeRemaining(account.rentalExpiresAt) === "Expired"
    : false;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-none transition-colors hover:border-border hover:shadow-sm">
      <CardHeader className="gap-3 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-0.5">
              {accountMethodImages[account.method] ? (
                <img src={accountMethodImages[account.method]} alt={account.method} className="size-full rounded-md object-cover" />
              ) : (
                <CreditCard className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm font-semibold">{account.accountName}</CardTitle>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{account.identifier}</p>
            </div>
          </div>
          <AccountStatusSwitch account={account} onToggle={onToggleStatus} />
        </div>


        {account.source === "rented" && account.rentalExpiresAt ? (
          <div className={rentalExpired ? "flex items-center justify-between gap-2 rounded-lg bg-rose-500/5 px-2.5 py-2" : "flex items-center justify-between gap-2 rounded-lg bg-amber-500/5 px-2.5 py-2"}>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock3 className="size-3.5" />
              Ends {formatRentalDate(account.rentalExpiresAt)}
            </span>
            <span className={rentalExpired ? "text-[11px] font-semibold text-rose-600" : "text-[11px] font-semibold text-amber-700 dark:text-amber-400"}>
              {getRentalTimeRemaining(account.rentalExpiresAt)}
            </span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-4 pb-4 pt-0">
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{isGateway ? "Daily amount limit" : "Available balance"}</p>
            <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular-nums">
              {isGateway
                ? account.config.maxAmount
                  ? Number(account.config.maxAmount).toLocaleString("en-US") + " " + account.config.limitCurrency
                  : "Unlimited"
                : formatMoney(account.balance)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={onView} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={"View " + account.accountName} title="View account">
              <Eye className="size-4" />
            </button>
            <button type="button" onClick={onView} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={"Configure " + account.accountName} title="Configure account">
              <Settings2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{isGateway ? "Daily transaction limit" : "Today"}</p>
            {isGateway ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                {account.config.maxTransactions ? account.config.maxTransactions + " transactions" : "Unlimited"}
              </p>
            ) : (
              <span className={positive ? "mt-0.5 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-emerald-600" : "mt-0.5 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-rose-600"}>
                {positive ? <ArrowUpRight className="size-3 shrink-0" /> : <ArrowDownRight className="size-3 shrink-0" />}
                <span className="truncate tabular-nums">{positive ? "+" : "-"}{formatMoney(Math.abs(account.change))}</span>
              </span>
            )}
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] text-muted-foreground">{isGateway ? "Integration" : "Last activity"}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-foreground">{isGateway ? account.status : account.lastActivity}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountStatusSwitch({ account, onToggle }: { account: PaymentAccount; onToggle: () => void }) {
  const isActive = account.status === "Active";
  const requiresConnection = account.type === "Payment Gateway" && account.status === "Not connected";
  return (
    <div className="flex shrink-0 items-center gap-2">
      {requiresConnection ? <span className="text-[10px] font-medium text-amber-600">Not connected</span> : null}
      <button type="button" role="switch" aria-checked={isActive} aria-label={(isActive ? "Disable " : "Enable ") + account.accountName}
        disabled={requiresConnection}
        title={requiresConnection ? "Connect the gateway before enabling it" : isActive ? "Turn account off" : "Turn account on"}
        onClick={onToggle}
        className={["relative inline-flex h-7 w-[58px] shrink-0 items-center rounded-full border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80",
          isActive ? "border-emerald-600 bg-emerald-600" : "border-border bg-muted-foreground/25"].join(" ")}>
        <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center text-white/90" aria-hidden="true"><Check className="size-3.5" /></span>
        <span className="pointer-events-none absolute right-1.5 flex size-4 items-center justify-center text-foreground/70" aria-hidden="true"><X className="size-3.5" /></span>
        <span className={["relative z-10 flex size-5 items-center justify-center rounded-full bg-background shadow-sm transition-transform", isActive ? "translate-x-[30px]" : "translate-x-0"].join(" ")} aria-hidden="true" />
      </button>
    </div>
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
    const nextMethod: AccountMethod =
      nextType === "Wallet" ? "D17" : nextType === "Voucher" ? "Voucher" : "Binance Pay";
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
      if (type === "Payment Gateway") {
        if (!config.merchantAccountId.trim()) return false;
        if (!(requiredGatewayCredentials[method] ?? []).every((key) => config[key].trim())) return false;
      }
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
      type === "Payment Gateway"
        ? config.merchantAccountId || method
        : type === "Voucher"
          ? config.voucherCode || accountName
          : config.walletNumber || accountName;

    onCreate({
      id: "ACC-" + String(Date.now()).slice(-6),
      source: "admin",
      accountName: accountName.trim(),
      method,
      type,
      identifier,
      balance: type === "Payment Gateway" ? 0 : config.openingBalance,
      currency: config.limitCurrency,
      status: type === "Payment Gateway" ? "Not connected" : "Active",
      lastActivity: "Just now",
      change: 0,
      config,
    });

    reset();
  }

  const titleByStep = [
    "Account details",
    "Supervisors & limits",
    "Schedule",
    type === "Payment Gateway" ? "Integration review" : "Opening balance & review",
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.25rem)] max-w-[1200px] overflow-y-auto sm:w-[min(96vw,1200px)] sm:max-w-[1200px]">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle>Link new account</DialogTitle>
              <DialogDescription>Choose a wallet, voucher or payment gateway, then configure its own limits and access rules.</DialogDescription>
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
              type={type}
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
        <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { value: "Wallet" as const, title: "Wallet", description: "Local wallet balance used for manual deposit and withdrawal operations.", icon: WalletCards },
            { value: "Voucher" as const, title: "Voucher", description: "Code / inventory based payment account.", icon: CreditCard },
            { value: "Payment Gateway" as const, title: "Payment Gateway", description: "Prepare an automated provider account with transaction and amount limits.", icon: PlugZap },
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
        <Label className="text-sm">
          {type === "Wallet" ? "Wallet method" : type === "Voucher" ? "Voucher method" : "Payment gateway provider"}
        </Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {(type === "Wallet" ? walletMethods : type === "Voucher" ? (["Voucher"] as const) : gatewayMethods).map((item) => {
            const active = method === item;
            const descriptions: Record<string, string> = {
              D17: "Card, wallet number and PIN based wallet.",
              Flouci: "Wallet number and PIN based wallet.",
              Kashy: "Wallet number and PIN based wallet.",
              "e-Dinar": "Card, wallet number and PIN based wallet.",
              Voucher: "Code, issuer and denomination based account.",
              "Binance Pay": "Crypto checkout for Binance Pay merchant accounts.",
              Stripe: "Card and wallet checkout for supported regions.",
              PayPal: "PayPal checkout and eligible wallet payments.",
              "Coinbase Commerce": "Crypto checkout using hosted payment sessions.",
              NOWPayments: "Multi-asset crypto payment processing.",
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
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {type === "Payment Gateway"
                ? "This creates a gateway account record only. Secure server-side credentials and provider webhooks must be connected before accepting real payments."
                : "The fields below change with the selected method. Each linked account keeps its own configuration."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label>Account display name</Label>
          <Input value={accountName} onChange={(event) => onAccountNameChange(event.target.value)} placeholder={"Example: " + method + " Primary"} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label>{type === "Payment Gateway" ? "Merchant / business name" : "Account holder name"}</Label>
          <Input value={config.ownerName} onChange={(event) => onConfigChange({ ownerName: event.target.value })} placeholder={type === "Payment Gateway" ? "Registered merchant or business name" : "Full name"} />
        </div>

        {type === "Payment Gateway" ? (
          <>
            <Field label="Merchant account ID" value={config.merchantAccountId} onChange={(value) => onConfigChange({ merchantAccountId: value })} placeholder="Enter the provider merchant / account ID" />
            <div className="grid gap-2">
              <Label>Integration mode</Label>
              <select value={config.integrationMode} onChange={(event) => onConfigChange({ integrationMode: event.target.value as GatewayMode })} className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
                <option value="Test">Test / sandbox</option>
                <option value="Live">Live mode (not activated)</option>
              </select>
              <p className="text-[11px] leading-4 text-muted-foreground">Mode is saved as a setup preference only; this screen does not connect to the provider.</p>
            </div>
            <div className="space-y-3 border-t pt-4 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="text-sm font-semibold">API credentials</h3><p className="mt-1 text-xs text-muted-foreground">Fields are specific to {method}; secret values are masked while typing.</p></div>
                <Badge variant="outline">Required fields marked *</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(gatewayCredentialFields[method] ?? []).map((field) => (
                  <div key={field.key} className="grid min-w-0 gap-2">
                    <Label htmlFor={"gateway-" + field.key}>{field.label} <span className="text-rose-500">*</span></Label>
                    <Input id={"gateway-" + field.key} name={field.key} type={field.secret ? "password" : "text"} autoComplete="off" spellCheck={false}
                      value={config[field.key]} onChange={(event) => onConfigChange({ [field.key]: event.target.value } as Partial<AccountConfig>)}
                      placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p>Prototype only: these values remain in in-memory page state and are not sent to a backend or encrypted vault. Do not use production credentials until server-side secret storage is connected.</p>
              </div>
            </div>
          </>
        ) : null}

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
  type,
  config,
  onPolicyChange,
  onToggleSupervisor,
  onConfigChange,
}: {
  type: AccountType;
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

      {type === "Payment Gateway" ? (
        <div className="grid gap-2 sm:max-w-xs">
          <Label>Limit currency</Label>
          <select
            value={config.limitCurrency}
            onChange={(event) => onConfigChange({ limitCurrency: event.target.value as LimitCurrency })}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="TND">TND · Tunisian dinar</option>
            <option value="USD">USD · US dollar</option>
            <option value="EUR">EUR · Euro</option>
            <option value="USDT">USDT · Tether</option>
          </select>
          <p className="text-[11px] text-muted-foreground">Daily amount limits use the currency selected here.</p>
        </div>
      ) : null}

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
          suffix={config.limitCurrency + " / day"}
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

  const accountIdentifier = config.merchantAccountId || config.walletNumber || config.voucherCode || "—";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-amber-600" />
          <div>
            <p className="text-sm font-medium">
              {type === "Payment Gateway" ? "Review gateway settings before connecting" : "Confirm the current balance before activation"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {type === "Payment Gateway"
                ? "This adds a local account record with its own limits. API credentials, signed webhooks and live activation will be implemented server-side in a later integration step."
                : "Enter the exact balance shown in the wallet right now. It becomes the opening balance for this account and keeps the starting ledger aligned with the provider."}
            </p>
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
              <SummaryRow label={type === "Payment Gateway" ? "Merchant / business" : "Account holder"} value={config.ownerName || "—"} />
              <SummaryRow label={type === "Payment Gateway" ? "Merchant account ID" : "Identifier"} value={accountIdentifier} />
              {type === "Payment Gateway" ? <SummaryRow label="Integration mode" value={config.integrationMode + " · Not connected"} /> : null}
              <SummaryRow label="Supervisors" value={supervisorSummary} />
              <SummaryRow label="Limits" value={(config.maxTransactions || "Unlimited") + " transactions/day · " + (config.maxAmount ? config.maxAmount + " " + config.limitCurrency + "/day" : "Unlimited amount")} />
              <SummaryRow label="Schedule" value={config.scheduleEnabled ? (config.days.length === dayOptions.length ? "All days" : config.days.join(", ") || "No days") + " · " + config.startTime + "–" + config.endTime : "Always available"} />
            </div>
          </CardContent>
        </Card>

        {type === "Payment Gateway" ? (
          <Card className="shadow-none">
            <CardHeader className="border-b pb-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Connection</p>
              <CardTitle className="mt-1 text-base">Gateway setup status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <PlugZap className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Not connected</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">The provider is registered in Accounts, but no API request or payment is enabled yet.</p>
                </div>
              </div>
              <SummaryRow label="Provider" value={method} />
              <SummaryRow label="Mode" value={config.integrationMode} />
              <SummaryRow label="Limit currency" value={config.limitCurrency} />
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ReviewStat icon={<UsersRound className="size-4" />} label="Supervisors" value={supervisorSummary} />
        <ReviewStat icon={<Clock3 className="size-4" />} label="Availability" value={config.scheduleEnabled ? "Scheduled" : "Always on"} />
        <ReviewStat
          icon={type === "Payment Gateway" ? <PlugZap className="size-4" /> : <WalletCards className="size-4" />}
          label={type === "Payment Gateway" ? "Connection status" : "Opening balance"}
          value={type === "Payment Gateway" ? "Not connected" : formatMoney(config.openingBalance)}
        />
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

const rentalOffers = [
  {
    id: "rent-edinar-01",
    title: "E-Dinar Card",
    type: "Card",
    identifier: "**** **** **** 4821",
    description: "Ready-to-use E-Dinar card account for portal payment operations.",
    image: "https://www.ama-business.com/wp-content/uploads/2023/05/E-Dinar.jpg",
  },
  {
    id: "rent-edinar-02",
    title: "E-Dinar Card",
    type: "Card",
    identifier: "**** **** **** 7732",
    description: "Separate E-Dinar card account with its own balance and configuration.",
    image: "https://www.ama-business.com/wp-content/uploads/2023/05/E-Dinar.jpg",
  },
  {
    id: "rent-flouci-01",
    title: "Flouci Account",
    type: "Wallet",
    identifier: "+216 ** *** 1220",
    description: "Flouci wallet account available for portal transactions.",
    image: "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY=s0-br30",
  },
  {
    id: "rent-flouci-02",
    title: "Flouci Account",
    type: "Wallet",
    identifier: "+216 ** *** 9041",
    description: "Independent Flouci wallet account with separate operating limits.",
    image: "https://play-lh.googleusercontent.com/eKwfMMr86vhBxUG6cGGVwXYR_fZqzLIJCTFXTI_JDD6VsBfYvvUHSuz-M9BC8Oy1cU5AXq4PkLre0bre3rmY=s0-br30",
  },
] as const;

type RentedOfferRecord = (typeof rentalOffers)[number] & { rentalExpiresAt: string };

function RentedAccountCard({ offer, onClaim }: { offer: RentedOfferRecord; onClaim: () => void }) {
  const expired = getRentalTimeRemaining(offer.rentalExpiresAt) === "Expired";

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/50 p-0.5">
            <img src={offer.image} alt={offer.title} className="size-full rounded-[10px] object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold">{offer.title}</p>
              <Badge variant="secondary" className="text-[10px]">Rented</Badge>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{offer.identifier}</p>
            <div className={expired ? "mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-rose-600" : "mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400"}>
              <Clock3 className="size-3.5" />
              Expires {formatRentalDate(offer.rentalExpiresAt)} <span className="text-muted-foreground">·</span> {getRentalTimeRemaining(offer.rentalExpiresAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-3 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <div className="sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Monthly rental</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">100 TND <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
          </div>
          <Button type="button" size="sm" onClick={onClaim} className="shrink-0">
            <CheckCircle2 className="size-4" />
            Claim account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function buildRentedAccount(
  offer: (typeof rentalOffers)[number],
  config: AccountConfig,
  rentalExpiresAt: string,
): PaymentAccount {
  const method: AccountMethod = offer.title.startsWith("E-Dinar") ? "e-Dinar" : "Flouci";

  return {
    id: "ACC-" + String(Date.now()).slice(-6),
    source: "rented",
    rentalExpiresAt,
    accountName: offer.title,
    method,
    type: "Wallet",
    identifier: offer.identifier,
    balance: config.openingBalance,
    currency: "TND",
    status: "Active",
    lastActivity: "Just now",
    change: 0,
    config,
  };
}

function RentCardDialog({
  open,
  onOpenChange,
  rentedOffers,
  onRent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentedOffers: Record<string, string>;
  onRent: (offerId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Rent a payment account</DialogTitle>
          <DialogDescription>
            Choose an available E-Dinar card or Flouci account. The rental price is 100 TND per month with no commission.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {rentalOffers.map((offer) => {
            const rented = Boolean(rentedOffers[offer.id]);
            return (
              <Card key={offer.id} className={rented ? "flex h-full flex-col overflow-hidden rounded-2xl border-primary/30 bg-muted/20 shadow-sm" : "flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:border-primary/30 hover:shadow-md"}>
                <CardContent className="flex h-full flex-col p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted/50 p-0.5">
                      <img src={offer.image} alt={offer.title} className="size-full rounded-[14px] object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{offer.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{offer.type} <span className="px-1">·</span> {offer.identifier}</p>
                      <div className="mt-2">
                        <Badge variant={rented ? "secondary" : "outline"} className="text-[10px]">
                          <span className={rented ? "mr-1 size-1.5 rounded-full bg-amber-500" : "mr-1 size-1.5 rounded-full bg-emerald-500"} />
                          {rented ? "Already rented" : "Available to rent"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 min-h-10 text-xs leading-5 text-muted-foreground">{offer.description}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Monthly rental</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">100 TND<span className="ml-1 text-xs font-normal text-muted-foreground">/ month</span></p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">No transaction commission</p>
                    </div>
                    <Button type="button" size="sm" disabled={rented} onClick={() => onRent(offer.id)}>
                      {rented ? "Rented" : "Rent now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Simple rental</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                100 TND monthly, zero transaction commission. Rental availability and activation are represented as UI mock data in this template.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RentalClaimDialog({
  offer,
  open,
  onOpenChange,
  onClaim,
}: {
  offer: (typeof rentalOffers)[number] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: (offer: (typeof rentalOffers)[number], config: AccountConfig) => void;
}) {
  const [step, setStep] = useState(1);
  const [maxTransactions, setMaxTransactions] = useState("200");
  const [maxAmount, setMaxAmount] = useState("30000");
  const [supervisorPolicy, setSupervisorPolicy] = useState<SupervisorPolicy>("All");
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("22:00");
  const [openingBalance, setOpeningBalance] = useState("0");

  if (!offer) return null;

  const method: AccountMethod = offer.title.startsWith("E-Dinar") ? "e-Dinar" : "Flouci";
  const isEdinar = method === "e-Dinar";
  const allDays = days.length === dayOptions.length;

  const reset = () => {
    setStep(1);
    setMaxTransactions(isEdinar ? "200" : "150");
    setMaxAmount(isEdinar ? "30000" : "20000");
    setSupervisorPolicy("All");
    setSelectedSupervisorIds([]);
    setScheduleEnabled(true);
    setDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    setStartTime("08:00");
    setEndTime("22:00");
    setOpeningBalance("0");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const supervisorNames = supervisorDirectory.filter((item) => selectedSupervisorIds.includes(item.id));
  const supervisorSummary =
    supervisorPolicy === "All"
      ? "All active supervisors"
      : selectedSupervisorIds.length + (supervisorPolicy === "Include only" ? " included" : " excluded");

  const createConfig = () => {
    const config = createDefaultConfig(method);
    config.ownerName = "Rental account";
    config.walletNumber = offer.identifier;
    config.walletName = offer.title;
    config.cardNumber = isEdinar ? offer.identifier : "";
    config.pin = "••••";
    config.maxTransactions = maxTransactions;
    config.maxAmount = maxAmount;
    config.supervisorPolicy = supervisorPolicy;
    config.selectedSupervisorIds = selectedSupervisorIds;
    config.scheduleEnabled = scheduleEnabled;
    config.days = days;
    config.startTime = startTime;
    config.endTime = endTime;
    config.openingBalance = Number(openingBalance) || 0;
    config.supervisors = supervisorDirectory.map((supervisor) => ({ ...supervisor }));
    return config;
  };

  function finishClaim() {
    onClaim(offer, createConfig());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>Claim rented account</DialogTitle>
              <DialogDescription>{offer.title} · 100 TND / month · no transaction commission</DialogDescription>
            </div>
            <Badge variant="outline">Step {step} of 4</Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-4">
          {["Account details", "Supervisors & limits", "Schedule", "Opening balance & review"].map((title, index) => (
            <div key={title} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <span className={index + 1 <= step ? "flex size-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold" : "flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs"}>
                {index + 1}
              </span>
              <span className={index + 1 === step ? "text-xs font-semibold" : "text-xs text-muted-foreground"}>{title}</span>
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium">Provided account details</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">These values come with the rented account and are ready to use. You do not need to enter them again.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewItem label="Account type" value="Wallet" />
              <ReviewItem label="Wallet method" value={method} />
              <ReviewItem label="Account / wallet" value={offer.identifier} />
              <ReviewItem label="Wallet name" value={offer.title} />
              <ReviewItem label="Account holder" value="Rental account" />
              <ReviewItem label="PIN" value="••••" />
              {isEdinar ? <ReviewItem label="Card / Exp" value={offer.identifier + " · provided"} /> : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "All" as const, title: "All supervisors" },
                { value: "Include only" as const, title: "Include selected" },
                { value: "Exclude selected" as const, title: "Exclude selected" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => { setSupervisorPolicy(item.value); setSelectedSupervisorIds([]); }}
                  className={["rounded-xl border p-3 text-left", supervisorPolicy === item.value ? "border-foreground bg-muted/40" : "hover:bg-muted/30"].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {supervisorPolicy === item.value ? <Check className="size-4" /> : null}
                  </div>
                </button>
              ))}
            </div>
            {supervisorPolicy !== "All" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {supervisorDirectory.map((supervisor) => {
                  const selected = selectedSupervisorIds.includes(supervisor.id);
                  return (
                    <button key={supervisor.id} type="button" onClick={() => setSelectedSupervisorIds((ids) => selected ? ids.filter((id) => id !== supervisor.id) : [...ids, supervisor.id])} className={["flex items-center gap-3 rounded-xl border p-3 text-left", selected ? "border-foreground bg-muted/30" : "hover:bg-muted/20"].join(" ")}>
                      <img src={supervisor.avatarUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-border" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{supervisor.name}</span>
                      {selected ? <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background"><Check className="size-3.5" /></span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <LimitField icon={<Activity className="size-4" />} label="Maximum transactions" description="Suggested starting limit; editable." value={maxTransactions} onChange={setMaxTransactions} placeholder="200" suffix="transactions / day" />
              <LimitField icon={<Gauge className="size-4" />} label="Maximum amount" description="Suggested starting limit; editable." value={maxAmount} onChange={setMaxAmount} placeholder="30000" suffix="TND / day" />
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              Recommended starting limits: {isEdinar ? "200 transactions and 30,000 TND/day" : "150 transactions and 20,000 TND/day"}; adjust them to your operating volume.
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium">Scheduled availability</p>
                <p className="mt-1 text-xs text-muted-foreground">Uses the platform timezone automatically.</p>
              </div>
              <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
            </div>
            {scheduleEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Active days</Label>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{allDays ? "All days" : days.join(", ") || "No days selected"}</p>
                  </div>
                  <Button type="button" size="sm" variant={allDays ? "default" : "outline"} onClick={() => setDays(allDays ? [] : [...dayOptions])}>
                    {allDays ? "All days" : "Use all days"}
                  </Button>
                </div>
                {!allDays ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                    {dayOptions.map((day) => (
                      <button key={day} type="button" onClick={() => setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])} className={["rounded-lg border px-2 py-2 text-xs font-medium", days.includes(day) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"].join(" ")}>
                        {day}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Start time</Label><Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>
                  <div className="grid gap-2"><Label>End time</Label><Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">Always available</div>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="shadow-none">
                <CardHeader className="border-b pb-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Review</p>
                  <CardTitle className="mt-1 text-base">{offer.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <SummaryRow label="Account type" value="Wallet" />
                    <SummaryRow label="Method" value={method} />
                    <SummaryRow label="Account details" value={offer.identifier + " · provided"} />
                    <SummaryRow label="Supervisors" value={supervisorSummary} />
                    <SummaryRow label="Limits" value={maxTransactions + " transactions · " + maxAmount + " TND/day"} />
                    <SummaryRow label="Schedule" value={scheduleEnabled ? (allDays ? "All days" : days.join(", ")) + " · " + startTime + "–" + endTime : "Always available"} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5 shadow-none">
                <CardHeader className="border-b pb-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Required</p>
                  <CardTitle className="mt-1 text-base">Opening balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label>Current balance in provider</Label>
                  <div className="flex items-end gap-2 rounded-xl border bg-background px-3">
                    <span className="pb-2 text-xs font-medium text-muted-foreground">TND</span>
                    <Input type="number" min="0" step="0.01" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} className="h-12 border-0 bg-transparent px-0 text-2xl font-semibold tabular-nums shadow-none focus-visible:ring-0" />
                  </div>
                  <p className="text-[11px] leading-5 text-muted-foreground">Enter the actual balance shown by the rented provider account before claiming it.</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ReviewStat icon={<UsersRound className="size-4" />} label="Supervisors" value={supervisorSummary} />
              <ReviewStat icon={<Clock3 className="size-4" />} label="Availability" value={scheduleEnabled ? "Scheduled" : "Always on"} />
              <ReviewStat icon={<WalletCards className="size-4" />} label="Opening balance" value={formatMoney(Number(openingBalance) || 0)} />
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div className="text-xs text-muted-foreground">Rental: 100 TND/month · no transaction commission</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            {step > 1 ? <Button variant="outline" onClick={() => setStep((current) => current - 1)}><ChevronLeft />Back</Button> : null}
            {step < 4 ? (
              <Button onClick={() => setStep((current) => current + 1)}>
                Continue <ChevronRight />
              </Button>
            ) : (
              <Button onClick={finishClaim}><CheckCircle2 />Claim & add account</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
            <div className="flex flex-wrap justify-end gap-1.5">
              <Badge variant={account.status === "Active" ? "secondary" : "outline"}>{account.status}</Badge>
              <Badge variant={account.source === "rented" ? "default" : "outline"}>
                {account.source === "rented" ? "Rented" : "Admin-added"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          {account.type === "Payment Gateway" ? (
            <Card className="shadow-none">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Gateway limits & connection</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <ReviewItem label="Daily amount limit" value={account.config.maxAmount ? Number(account.config.maxAmount).toLocaleString("en-US") + " " + account.config.limitCurrency : "Unlimited"} />
                <ReviewItem label="Daily transaction limit" value={account.config.maxTransactions ? account.config.maxTransactions + " transactions" : "Unlimited"} />
                <ReviewItem label="Integration mode" value={account.config.integrationMode} />
                <ReviewItem label="Connection status" value={account.status} />
                <div className="sm:col-span-2"><ReviewItem label="Merchant account ID" value={account.config.merchantAccountId || account.identifier} /></div>
              </CardContent>
            </Card>
          ) : (
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
          )}

          <Card className="shadow-none">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Account-specific configuration</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <ReviewItem label="Owner" value={account.config.ownerName || "—"} />
                <ReviewItem label="Max transactions" value={account.config.maxTransactions || "Unlimited"} />
                <ReviewItem label="Max amount" value={account.config.maxAmount ? account.config.maxAmount + " " + account.config.limitCurrency + " / day" : "Unlimited"} />
                {account.type === "Payment Gateway" ? <ReviewItem label="Merchant account ID" value={account.config.merchantAccountId || "—"} /> : null}
                {account.type === "Payment Gateway" ? <ReviewItem label="Integration mode" value={account.config.integrationMode + " · " + account.status} /> : null}
                {account.source === "rented" && account.rentalExpiresAt ? (
                  <ReviewItem label="Rental expires" value={formatRentalDate(account.rentalExpiresAt) + " · " + getRentalTimeRemaining(account.rentalExpiresAt)} />
                ) : (
                  <ReviewItem label="Account source" value="Added by admin" />
                )}
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
            {account.type === "Payment Gateway"
              ? "Gateway API secrets will be managed securely on the server when the real integration is implemented. This account is not connected yet."
              : "Credentials are shown as masked placeholders in this UI template."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getRentalExpiryDate() {
  const now = new Date();
  const expiry = new Date(now);
  const originalDay = now.getDate();
  expiry.setDate(1);
  expiry.setMonth(expiry.getMonth() + 1);
  const lastDayOfMonth = new Date(expiry.getFullYear(), expiry.getMonth() + 1, 0).getDate();
  expiry.setDate(Math.min(originalDay, lastDayOfMonth));
  return expiry.toISOString();
}

function formatRentalDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRentalTimeRemaining(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(value);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return String(days) + " day" + (days === 1 ? "" : "s") + " left";
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TND";
}

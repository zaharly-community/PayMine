import { useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  PlugZap,
  ShieldCheck,
  WalletCards,
  Webhook,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsShell } from "../-components/settings-shell";

type GatewayStatus = "Not configured" | "Draft saved";
type GatewayMode = "Test" | "Live";

type GatewayField = {
  name: string;
  label: string;
  placeholder: string;
  secret?: boolean;
};

type Gateway = {
  id: string;
  name: string;
  initials: string;
  category: "Crypto" | "Cards & wallets" | "Local payments";
  description: string;
  accent: string;
  fields: GatewayField[];
  docsUrl: string;
  status: GatewayStatus;
  mode: GatewayMode;
  enabledInCheckout: boolean;
  deposits: boolean;
  refunds: boolean;
  payouts: boolean;
};

const initialGateways: Gateway[] = [
  {
    id: "binance-pay",
    name: "Binance Pay",
    initials: "B",
    category: "Crypto",
    description: "Accept crypto payments through the Binance Pay checkout flow and confirm payment status with signed webhooks.",
    accent: "bg-[#F0B90B]/15 text-[#B88600]",
    fields: [
      { name: "merchantId", label: "Merchant ID", placeholder: "Enter your Binance Pay merchant ID" },
      { name: "apiKey", label: "API identity key", placeholder: "Paste the API identity key", secret: true },
      { name: "apiSecret", label: "API secret key", placeholder: "Enter the API secret", secret: true },
    ],
    docsUrl: "https://developers.binance.com/en/docs/products/binance-pay-merchant/api-common",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    initials: "S",
    category: "Cards & wallets",
    description: "Card checkout and eligible digital-wallet payment methods, depending on your Stripe account and region.",
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    fields: [
      { name: "publishableKey", label: "Publishable key", placeholder: "pk_test_…" },
      { name: "secretKey", label: "Secret key", placeholder: "sk_test_…", secret: true },
      { name: "webhookSecret", label: "Webhook signing secret", placeholder: "whsec_…", secret: true },
    ],
    docsUrl: "https://docs.stripe.com/keys",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
  {
    id: "paypal",
    name: "PayPal",
    initials: "P",
    category: "Cards & wallets",
    description: "Wallet checkout with server-side order creation and payment capture confirmation.",
    accent: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    fields: [
      { name: "clientId", label: "Client ID", placeholder: "Enter your PayPal client ID" },
      { name: "clientSecret", label: "Client secret", placeholder: "Enter the client secret", secret: true },
      { name: "webhookId", label: "Webhook ID", placeholder: "Enter your webhook ID" },
    ],
    docsUrl: "https://developer.paypal.com/docs/api/overview/",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
  {
    id: "coinbase-commerce",
    name: "Coinbase Commerce",
    initials: "C",
    category: "Crypto",
    description: "Crypto checkout with asynchronous payment status updates from provider callbacks.",
    accent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    fields: [
      { name: "apiKey", label: "API key", placeholder: "Paste the API key", secret: true },
      { name: "webhookSecret", label: "Webhook shared secret", placeholder: "Enter the webhook shared secret", secret: true },
    ],
    docsUrl: "https://docs.cdp.coinbase.com/commerce-onchain/docs",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
  {
    id: "nowpayments",
    name: "NOWPayments",
    initials: "NP",
    category: "Crypto",
    description: "Multi-asset crypto payments with server-side invoice creation and IPN status verification.",
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    fields: [
      { name: "apiKey", label: "API key", placeholder: "Paste the API key", secret: true },
      { name: "ipnSecret", label: "IPN secret", placeholder: "Enter the IPN secret", secret: true },
    ],
    docsUrl: "https://nowpayments.io/doc",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
  {
    id: "flouci",
    name: "Flouci",
    initials: "F",
    category: "Local payments",
    description: "Local mobile-wallet checkout for supported Tunisian merchants and payment flows.",
    accent: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    fields: [
      { name: "appToken", label: "Application token", placeholder: "Enter the application token", secret: true },
      { name: "appSecret", label: "Application secret", placeholder: "Enter the application secret", secret: true },
      { name: "webhookSecret", label: "Callback verification secret", placeholder: "Enter the callback verification secret", secret: true },
    ],
    docsUrl: "https://docs.flouci.com/",
    status: "Not configured",
    mode: "Test",
    enabledInCheckout: false,
    deposits: true,
    refunds: false,
    payouts: false,
  },
];

const categories = ["All providers", "Crypto", "Cards & wallets", "Local payments"] as const;
type GatewayFilter = (typeof categories)[number];

export const Route = createFileRoute("/(main)/dashboard/settings/payment-gateways")({
  component: Page,
});

function Page() {
  const [gateways, setGateways] = useState(initialGateways);
  const [filter, setFilter] = useState<GatewayFilter>("All providers");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const selectedGateway = gateways.find((gateway) => gateway.id === selectedId) ?? null;
  const configuredDrafts = gateways.filter((gateway) => gateway.status === "Draft saved").length;
  const checkoutQueued = gateways.filter((gateway) => gateway.status === "Draft saved" && gateway.enabledInCheckout).length;
  const filteredGateways = gateways.filter((gateway) => filter === "All providers" || gateway.category === filter);

  const handleSaveDraft = (id: string, values: Pick<Gateway, "mode" | "enabledInCheckout" | "deposits" | "refunds" | "payouts">) => {
    setGateways((current) =>
      current.map((gateway) =>
        gateway.id === id ? { ...gateway, ...values, status: "Draft saved" } : gateway,
      ),
    );
    setSelectedId(null);
    setNotice("Configuration draft saved in this page session. No provider API was called and no credentials were stored.");
  };

  return (
    <SettingsShell
      active="payment-gateways"
      title="Payment Gateways"
      description="Set up automated checkout providers for deposits, cards, wallets and crypto payments."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Providers" value={String(gateways.length)} detail="Available to configure" icon={WalletCards} />
          <SummaryMetric label="Setup drafts" value={String(configuredDrafts)} detail="Saved in this session" icon={PlugZap} />
          <SummaryMetric label="Live connections" value="0" detail="Backend connection required" icon={ShieldCheck} />
        </div>

        <div className="flex items-start gap-3 border-l-2 border-amber-500 bg-muted/25 px-4 py-3">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Security before activation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              This page is a frontend setup console. Credentials are never saved by this demo. A live integration needs server-side secret storage, signed webhook verification, idempotent event handling and transaction reconciliation.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">Available providers</h3>
            <p className="mt-1 text-sm text-muted-foreground">Choose a provider to prepare its checkout and callback settings.</p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-muted/30 p-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={[
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === category ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                aria-pressed={filter === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {filteredGateways.map((gateway) => (
            <GatewayCard
              key={gateway.id}
              gateway={gateway}
              onConfigure={() => setSelectedId(gateway.id)}
            />
          ))}
        </div>

        {notice ? (
          <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="ml-auto shrink-0 text-current/70 hover:text-current">
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        <div className="flex items-start gap-3 border-t pt-4 text-xs leading-5 text-muted-foreground">
          <Webhook className="mt-0.5 size-4 shrink-0" />
          <p>
            Each provider needs its own webhook/callback handler. Never mark a deposit as paid based only on the customer returning to the checkout page; confirm the provider notification server-side first.
          </p>
        </div>
      </div>

      {selectedGateway ? (
        <GatewaySetupDialog
          key={selectedGateway.id}
          gateway={selectedGateway}
          onOpenChange={(open) => !open && setSelectedId(null)}
          onSave={handleSaveDraft}
        />
      ) : null}
    </SettingsShell>
  );
}

function SummaryMetric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b pb-3 sm:border-b-0 sm:border-r sm:pr-3 last:border-r-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-xl font-semibold tabular-nums">{value}</span>
          <span className="truncate text-[11px] text-muted-foreground">{detail}</span>
        </div>
      </div>
    </div>
  );
}

function GatewayCard({ gateway, onConfigure }: { gateway: Gateway; onConfigure: () => void }) {
  const statusLabel = gateway.status === "Draft saved" ? "Draft saved" : "Not configured";
  const showCheckoutBadge = gateway.status === "Draft saved" && gateway.enabledInCheckout;

  return (
    <Card className="group flex h-full flex-col overflow-hidden shadow-none transition-colors hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold " + gateway.accent}>
            {gateway.initials}
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <Badge variant={gateway.status === "Draft saved" ? "secondary" : "outline"}>{statusLabel}</Badge>
            {showCheckoutBadge ? <Badge variant="outline">Checkout enabled · draft</Badge> : null}
          </div>
        </div>
        <div className="pt-2">
          <CardTitle className="text-base">{gateway.name}</CardTitle>
          <CardDescription className="mt-1 text-xs">{gateway.category}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="min-h-[60px] text-sm leading-5 text-muted-foreground">{gateway.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <CircleDollarSign className="size-3.5 shrink-0" />
            {gateway.deposits ? "Deposits" : "No operations selected"}
            {gateway.refunds ? " · Refunds" : ""}
            {gateway.payouts ? " · Payouts" : ""}
          </span>
          <Button size="sm" variant="outline" className="shrink-0" onClick={onConfigure}>
            <PlugZap className="size-3.5" />
            Configure
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GatewaySetupDialog({
  gateway,
  onOpenChange,
  onSave,
}: {
  gateway: Gateway;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, values: Pick<Gateway, "mode" | "enabledInCheckout" | "deposits" | "refunds" | "payouts">) => void;
}) {
  const [mode, setMode] = useState<GatewayMode>(gateway.mode);
  const [enabledInCheckout, setEnabledInCheckout] = useState(gateway.enabledInCheckout);
  const [deposits, setDeposits] = useState(gateway.deposits);
  const [refunds, setRefunds] = useState(gateway.refunds);
  const [payouts, setPayouts] = useState(gateway.payouts);
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://YOUR_API_DOMAIN/webhooks/payment-gateways/" + gateway.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This screen deliberately saves only a configuration draft. Secret values are not read or persisted.
    event.currentTarget.reset();
    onSave(gateway.id, { mode, enabledInCheckout, deposits, refunds, payouts });
  };

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
    } catch {
      setCopied(false);
      // Clipboard access can be unavailable on non-secure/local browser contexts.
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.25rem)] max-w-2xl overflow-y-auto p-0 sm:w-full">
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 pr-7">
            <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold " + gateway.accent}>
              {gateway.initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{gateway.name}</DialogTitle>
                <Badge variant="outline">{gateway.status}</Badge>
              </div>
              <DialogDescription className="mt-1 text-xs leading-5">{gateway.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <section className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">API credentials</h3>
                <a href={gateway.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  Provider documentation <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use credentials issued by your provider. This prototype clears credential fields after save and does not send them anywhere.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {gateway.fields.map((field) => (
                <div key={field.name} className="grid min-w-0 gap-2">
                  <Label htmlFor={gateway.id + "-" + field.name}>{field.label}</Label>
                  <Input
                    id={gateway.id + "-" + field.name}
                    name={field.name}
                    type={field.secret ? "password" : "text"}
                    autoComplete="off"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t pt-4">
            <div>
              <h3 className="text-sm font-semibold">Checkout & operations</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Select the intended behavior. Availability depends on provider approval, region and account permissions.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
                <div className="min-w-0"><p className="text-sm font-medium">Accept deposits</p><p className="mt-0.5 text-xs text-muted-foreground">Checkout payments</p></div>
                <Switch checked={deposits} onCheckedChange={setDeposits} aria-label="Accept deposits" />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
                <div className="min-w-0"><p className="text-sm font-medium">Automate refunds</p><p className="mt-0.5 text-xs text-muted-foreground">Where supported</p></div>
                <Switch checked={refunds} onCheckedChange={setRefunds} aria-label="Automate refunds" />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3 sm:col-span-2">
                <div className="min-w-0"><p className="text-sm font-medium">Payouts / withdrawals</p><p className="mt-0.5 text-xs text-muted-foreground">Only if your provider account permits payouts</p></div>
                <Switch checked={payouts} onCheckedChange={setPayouts} aria-label="Payouts and withdrawals" />
              </div>
            </div>
            <div className="grid gap-2 sm:max-w-xs">
              <Label htmlFor={gateway.id + "-mode"}>Integration mode</Label>
              <select
                id={gateway.id + "-mode"}
                value={mode}
                onChange={(event) => setMode(event.target.value as GatewayMode)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="Test">Test / staging intent</option>
                <option value="Live">Live intent</option>
              </select>
              <p className="text-[11px] leading-4 text-muted-foreground">Test or sandbox availability differs by provider; live mode must not be activated until server-side verification is in place.</p>
            </div>
          </section>

          <section className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Webhook className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Webhook endpoint template</h3>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all rounded-md bg-muted px-3 py-2 text-[11px]">{webhookUrl}</code>
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleCopyWebhook}>{copied ? <CheckCircle2 className="size-3.5" /> : null}{copied ? "Copied" : "Copy template"}</Button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Replace YOUR_API_DOMAIN with your deployed HTTPS API. Implement signature verification and deduplicate event IDs on the server before changing a transaction status.
            </p>
          </section>

          <section className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Saving creates a local setup draft only. It does not connect to {gateway.name}, verify credentials, receive webhooks or enable real payments.
            </p>
          </section>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}><X className="size-4" /> Cancel</Button>
            <Button type="submit"><KeyRound className="size-4" /> Save setup draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

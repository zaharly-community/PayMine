import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  Plus,
  Search,
  TicketPercent,
  Wallet,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaymentCategory = "Wallet" | "Vouchers";
type PaymentMethodId =
  | "flouci"
  | "d17"
  | "kashy"
  | "e-dinar"
  | "cash-voucher"
  | "gift-voucher"
  | "gaming-voucher"
  | "promo-voucher";

type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  category: PaymentCategory;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: "text" | "password";
  }>;
};

type PaymentAccount = {
  id: string;
  name: string;
  methodId: PaymentMethodId;
  category: PaymentCategory;
  identifier: string;
  balance: number;
  currency: string;
  status: "Active" | "Disabled";
  details: Record<string, string>;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "flouci",
    name: "Flouci",
    category: "Wallet",
    description: "Mobile wallet account used for deposits and withdrawals.",
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+216 20 000 000" },
      { key: "accountName", label: "Account holder", placeholder: "Full name" },
      { key: "walletAlias", label: "Wallet alias", placeholder: "flouci-primary" },
    ],
  },
  {
    id: "d17",
    name: "D17",
    category: "Wallet",
    description: "D17 wallet account with wallet and owner identifiers.",
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+216 20 000 000" },
      { key: "walletId", label: "Wallet ID", placeholder: "D17-XXXXXX" },
      { key: "pinLabel", label: "PIN reference", placeholder: "Stored securely outside UI" },
    ],
  },
  {
    id: "kashy",
    name: "Kashy",
    category: "Wallet",
    description: "Kashy wallet connection with wallet and contact data.",
    fields: [
      { key: "walletNumber", label: "Wallet number", placeholder: "KSH-000000" },
      { key: "phone", label: "Phone number", placeholder: "+216 20 000 000" },
      { key: "country", label: "Country", placeholder: "Tunisia" },
    ],
  },
  {
    id: "e-dinar",
    name: "e-Dinar",
    category: "Wallet",
    description: "e-Dinar payment wallet with card-holder details.",
    fields: [
      { key: "cardNumber", label: "Card / wallet number", placeholder: "0000 0000 0000 0000" },
      { key: "holder", label: "Card holder", placeholder: "Full name" },
      { key: "expiry", label: "Expiry", placeholder: "MM / YY" },
    ],
  },
  {
    id: "cash-voucher",
    name: "Cash Voucher",
    category: "Vouchers",
    description: "Voucher inventory account for cash-style top-ups.",
    fields: [
      { key: "issuer", label: "Issuer", placeholder: "Voucher issuer" },
      { key: "denomination", label: "Default denomination", placeholder: "50.00" },
      { key: "serialPrefix", label: "Serial prefix", placeholder: "CV-" },
    ],
  },
  {
    id: "gift-voucher",
    name: "Gift Voucher",
    category: "Vouchers",
    description: "Gift voucher account with code and expiry rules.",
    fields: [
      { key: "issuer", label: "Issuer", placeholder: "Voucher issuer" },
      { key: "codePattern", label: "Code pattern", placeholder: "XXXX-XXXX-XXXX" },
      { key: "expiration", label: "Expiration policy", placeholder: "90 days" },
    ],
  },
  {
    id: "gaming-voucher",
    name: "Gaming Voucher",
    category: "Vouchers",
    description: "Gaming voucher account mapped to an inventory source.",
    fields: [
      { key: "brand", label: "Brand", placeholder: "Gaming brand" },
      { key: "serialPrefix", label: "Serial prefix", placeholder: "GV-" },
      { key: "denomination", label: "Default denomination", placeholder: "25.00" },
    ],
  },
  {
    id: "promo-voucher",
    name: "Promo Voucher",
    category: "Vouchers",
    description: "Promotional voucher account with campaign-level controls.",
    fields: [
      { key: "campaignCode", label: "Campaign code", placeholder: "PAYMINE10" },
      { key: "valueType", label: "Value type", placeholder: "Fixed credit / Percentage" },
      { key: "maxRedemptions", label: "Max redemptions", placeholder: "1000" },
    ],
  },
];

const initialAccounts: PaymentAccount[] = [
  { id: "ACC-001", name: "Flouci Primary", methodId: "flouci", category: "Wallet", identifier: "+216 20 481 220", balance: 18420, currency: "TND", status: "Active", details: { phone: "+216 20 481 220", accountName: "PayMine Operations", walletAlias: "flouci-primary" } },
  { id: "ACC-002", name: "D17 Shared 01", methodId: "d17", category: "Wallet", identifier: "D17-SHARED-01", balance: 11875, currency: "TND", status: "Active", details: { phone: "+216 25 118 902", walletId: "D17-SHARED-01", pinLabel: "Configured" } },
  { id: "ACC-003", name: "Kashy Operations", methodId: "kashy", category: "Wallet", identifier: "KSH-OPS-01", balance: 8640, currency: "TND", status: "Active", details: { walletNumber: "KSH-OPS-01", phone: "+216 22 991 041", country: "Tunisia" } },
  { id: "ACC-004", name: "e-Dinar Primary", methodId: "e-dinar", category: "Wallet", identifier: "ED-PRIMARY", balance: 6750, currency: "TND", status: "Active", details: { cardNumber: "**** **** **** 4821", holder: "PayMine Treasury", expiry: "12 / 28" } },
  { id: "ACC-005", name: "Cash Voucher Stock", methodId: "cash-voucher", category: "Vouchers", identifier: "CV-STOCK-01", balance: 15000, currency: "TND", status: "Active", details: { issuer: "PayMine Voucher Desk", denomination: "50.00", serialPrefix: "CV-" } },
  { id: "ACC-006", name: "Gift Voucher Campaigns", methodId: "gift-voucher", category: "Vouchers", identifier: "GV-CAMPAIGN-01", balance: 8200, currency: "TND", status: "Active", details: { issuer: "PayMine Rewards", codePattern: "XXXX-XXXX-XXXX", expiration: "90 days" } },
];

const categoryMeta = {
  Wallet: { icon: Wallet, label: "Wallets", description: "Wallet-based payment accounts and operational balances." },
  Vouchers: { icon: TicketPercent, label: "Vouchers", description: "Voucher inventories and code-based payment accounts." },
} as const;

export const Route = createFileRoute("/(main)/dashboard/accounts")({ component: Page });

function MethodIcon({ category }: { category: PaymentCategory }) {
  const Icon = categoryMeta[category].icon;
  return <div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></div>;
}

function Page() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [category, setCategory] = useState<"All" | PaymentCategory>("All");
  const [methodId, setMethodId] = useState<PaymentMethodId | "all">("all");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<PaymentAccount | null>(null);
  const [formCategory, setFormCategory] = useState<PaymentCategory>("Wallet");
  const [formMethodId, setFormMethodId] = useState<PaymentMethodId>("flouci");
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const filteredMethods = useMemo(
    () => paymentMethods.filter((method) => category === "All" || method.category === category),
    [category],
  );

  const filteredAccounts = accounts.filter((account) => {
    const matchesCategory = category === "All" || account.category === category;
    const matchesMethod = methodId === "all" || account.methodId === methodId;
    const needle = query.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      [account.id, account.name, account.identifier, paymentMethods.find((method) => method.id === account.methodId)?.name ?? ""]
        .some((value) => value.toLowerCase().includes(needle));
    return matchesCategory && matchesMethod && matchesSearch;
  });

  const selectedFormMethod = paymentMethods.find((method) => method.id === formMethodId) ?? paymentMethods[0];

  function openAdd(method?: PaymentMethod) {
    const nextMethod =
      method ??
      paymentMethods.find((item) => item.category === formCategory) ??
      paymentMethods[0];
    setFormCategory(nextMethod.category);
    setFormMethodId(nextMethod.id);
    setFormName("");
    setFormValues({});
    setAddOpen(true);
  }

  function changeFormCategory(nextCategory: PaymentCategory) {
    const nextMethod = paymentMethods.find((method) => method.category === nextCategory) ?? paymentMethods[0];
    setFormCategory(nextCategory);
    setFormMethodId(nextMethod.id);
    setFormValues({});
  }

  function createAccount() {
    if (!formName.trim()) return;
    const identifier = formValues[selectedFormMethod.fields[0]?.key] || formName;
    const newAccount: PaymentAccount = {
      id: `ACC-${String(accounts.length + 1).padStart(3, "0")}`,
      name: formName.trim(),
      methodId: selectedFormMethod.id,
      category: selectedFormMethod.category,
      identifier,
      balance: 0,
      currency: "TND",
      status: "Active",
      details: formValues,
    };
    setAccounts((current) => [newAccount, ...current]);
    setAddOpen(false);
  }

  return (
    <section className="flex min-h-full flex-col gap-6 bg-background">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Payment infrastructure</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Payment methods are organized into Wallets and Vouchers, and every method exposes its own account data model.
          </p>
        </div>
        <Button onClick={() => openAdd()}>
          <Plus className="size-4" />
          Add account
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(Object.keys(categoryMeta) as PaymentCategory[]).map((item) => {
          const meta = categoryMeta[item];
          const count = accounts.filter((account) => account.category === item).length;
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => { setCategory(item); setMethodId("all"); }}
              className={"flex items-center justify-between rounded-xl border p-4 text-left transition-colors " + (active ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40")}
            >
              <div className="flex items-center gap-3">
                <MethodIcon category={item} />
                <div>
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.description}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{count} accounts</span>
            </button>
          );
        })}
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Payment methods</h2>
            <p className="text-xs text-muted-foreground">Select a method to see only its linked accounts.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setCategory("All"); setMethodId("all"); }}>
            Show all
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredMethods.map((method) => {
            const count = accounts.filter((account) => account.methodId === method.id).length;
            const selected = methodId === method.id;
            return (
              <Card
                key={method.id}
                className={"cursor-pointer transition-colors " + (selected ? "border-primary/40 bg-primary/5" : "hover:bg-muted/20")}
                onClick={() => { setCategory(method.category); setMethodId(method.id); }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <MethodIcon category={method.category} />
                      <div>
                        <CardTitle className="text-sm">{method.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-[10px]">{method.category}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-5 text-muted-foreground">{method.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{count} linked accounts</span>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={(event) => { event.stopPropagation(); openAdd(method); }}>
                      <Plus className="size-3.5" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Payment accounts</CardTitle>
              <p className="text-xs text-muted-foreground">{filteredAccounts.length} accounts in the current view.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search accounts..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Payment method</th>
                  <th className="px-4 py-3 font-medium">Identifier</th>
                  <th className="px-4 py-3 text-right font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const method = paymentMethods.find((item) => item.id === account.methodId)!;
                  return (
                    <tr key={account.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{account.name}</p>
                        <p className="text-[11px] text-muted-foreground">{account.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-md bg-muted"><WalletCards className="size-3.5" /></span>
                          <div><p className="font-medium">{method.name}</p><p className="text-[11px] text-muted-foreground">{account.category}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{account.identifier}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{account.balance.toLocaleString()} {account.currency}</td>
                      <td className="px-4 py-3">
                        <Badge variant={account.status === "Active" ? "default" : "secondary"}>{account.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewAccount(account)} aria-label={"View " + account.name}>
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!filteredAccounts.length ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No accounts match the current filters.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">Frontend-only template. Account balances and fields are mock data and are not persisted or sent to providers.</p>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add payment account</DialogTitle>
            <DialogDescription>Choose a category and method. The form below changes to match that method's data requirements.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={(value) => changeFormCategory(value as PaymentCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wallet">Wallet</SelectItem>
                    <SelectItem value="Vouchers">Vouchers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Payment method</Label>
                <Select value={formMethodId} onValueChange={(value) => { setFormMethodId(value as PaymentMethodId); setFormValues({}); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.filter((method) => method.category === formCategory).map((method) => (
                      <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Account name</Label>
              <Input value={formName} onChange={(event) => setFormName(event.target.value)} placeholder={"Example: " + selectedFormMethod.name + " Primary"} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedFormMethod.fields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type ?? "text"}
                    value={formValues[field.key] ?? ""}
                    onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={createAccount}><Plus className="size-4" />Create account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewAccount)} onOpenChange={(open) => !open && setViewAccount(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{viewAccount?.name}</DialogTitle>
            <DialogDescription>
              {viewAccount?.id} · {viewAccount ? paymentMethods.find((method) => method.id === viewAccount.methodId)?.name : ""} · {viewAccount?.category}
            </DialogDescription>
          </DialogHeader>
          {viewAccount ? (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Balance</p><p className="mt-1 font-semibold">{viewAccount.balance.toLocaleString()} {viewAccount.currency}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Identifier</p><p className="mt-1 font-semibold">{viewAccount.identifier}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Status</p><div className="mt-1"><Badge>{viewAccount.status}</Badge></div></div>
              </div>
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium"><CreditCard className="size-4" /> Method-specific data</div>
                <div className="grid gap-0 sm:grid-cols-2">
                  {Object.entries(viewAccount.details).map(([key, value]) => (
                    <div key={key} className="border-b p-3 last:border-b-0 sm:even:border-l">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{key}</p>
                      <p className="mt-1 text-sm">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 shrink-0" /> Account configuration is represented locally for this frontend template.
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

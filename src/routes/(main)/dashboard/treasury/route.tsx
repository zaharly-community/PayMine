import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight, BadgeCheck, Banknote, Building2, Check, CheckCircle2,
  CircleAlert, ClipboardList, Coins, CreditCard, Globe2, MapPin, Pencil,
  Plus, Search, ShieldCheck, Smartphone, WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type PayoutMethodId = "bank_account" | "mobile_wallet" | "cash_pickup" | "debit_card" | "wallet_credit";
type Gateway = "manual" | "bitnob" | "stripe_connect";
type Country = { code: string; name: string; flag: string };
type Currency = { code: string; symbol: string };
type CorridorDraft = {
  name: string;
  sourceCountry: string;
  sourceCurrency: string;
  destinationCountry: string;
  destinationCurrency: string;
  payoutMethods: PayoutMethodId[];
  payoutGateway: Gateway;
  requiredKycTier: string;
  fxSpreadPercent: string;
  fixedFee: string;
  percentFee: string;
  minAmount: string;
  maxAmount: string;
  quoteTtlMinutes: string;
  active: boolean;
};
type Corridor = CorridorDraft & { id: string; updatedAt: string };

const countryCodes = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SL SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW`
  .trim()
  .split(/\\s+/);
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries: Country[] = countryCodes
  .map((code) => ({
    code,
    name: countryNames.of(code) || code,
    flag: Array.from(code).map((letter) => String.fromCodePoint(letter.charCodeAt(0) + 127397)).join(""),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const currencies: Currency[] = [
  { code: "USD", symbol: "$" }, { code: "EUR", symbol: "€" }, { code: "GBP", symbol: "£" },
  { code: "TND", symbol: "د.ت" }, { code: "BDT", symbol: "৳" }, { code: "TZS", symbol: "TSh" },
  { code: "KES", symbol: "KSh" }, { code: "NGN", symbol: "₦" }, { code: "GHS", symbol: "₵" },
  { code: "ZAR", symbol: "R" }, { code: "EGP", symbol: "E£" }, { code: "MAD", symbol: "د.م." },
  { code: "AED", symbol: "د.إ" }, { code: "SAR", symbol: "﷼" }, { code: "INR", symbol: "₹" },
  { code: "PKR", symbol: "₨" }, { code: "PHP", symbol: "₱" }, { code: "IDR", symbol: "Rp" },
  { code: "MYR", symbol: "RM" }, { code: "SGD", symbol: "S$" }, { code: "THB", symbol: "฿" },
  { code: "VND", symbol: "₫" }, { code: "CNY", symbol: "¥" }, { code: "JPY", symbol: "¥" },
  { code: "KRW", symbol: "₩" }, { code: "AUD", symbol: "A$" }, { code: "NZD", symbol: "NZ$" },
  { code: "CAD", symbol: "C$" }, { code: "MXN", symbol: "$" }, { code: "BRL", symbol: "R$" },
  { code: "TRY", symbol: "₺" }, { code: "CHF", symbol: "CHF" }, { code: "PLN", symbol: "zł" },
  { code: "XOF", symbol: "CFA" }, { code: "XAF", symbol: "FCFA" }, { code: "USDT", symbol: "₮" },
  { code: "USDC", symbol: "$" },
];

const payoutMethods: Array<{ id: PayoutMethodId; name: string; hint: string; icon: ReactNode }> = [
  { id: "bank_account", name: "Bank Account", hint: "Direct bank transfer to recipient", icon: <Building2 className="size-4" /> },
  { id: "mobile_wallet", name: "Mobile Wallet", hint: "bKash, M-Pesa, GCash and more", icon: <Smartphone className="size-4" /> },
  { id: "cash_pickup", name: "Cash Pickup", hint: "Collection from a payout partner", icon: <Banknote className="size-4" /> },
  { id: "debit_card", name: "Debit Card", hint: "Push-to-card delivery", icon: <CreditCard className="size-4" /> },
  { id: "wallet_credit", name: "Wallet Credit", hint: "Internal wallet balance credit", icon: <WalletCards className="size-4" /> },
];

const gateways: Array<{ id: Gateway; name: string; description: string }> = [
  { id: "manual", name: "Manual", description: "Admin approved payouts" },
  { id: "bitnob", name: "Bitnob", description: "Automated payout integration" },
  { id: "stripe_connect", name: "Stripe Connect", description: "Connected bank payouts" },
];

const emptyDraft: CorridorDraft = {
  name: "",
  sourceCountry: "US",
  sourceCurrency: "USD",
  destinationCountry: "BD",
  destinationCurrency: "BDT",
  payoutMethods: ["bank_account", "mobile_wallet"],
  payoutGateway: "manual",
  requiredKycTier: "1",
  fxSpreadPercent: "0.75",
  fixedFee: "1.99",
  percentFee: "0.5",
  minAmount: "5",
  maxAmount: "5000",
  quoteTtlMinutes: "15",
  active: true,
};

const initialCorridors: Corridor[] = [
  { ...emptyDraft, id: "COR-0001", name: "USD → BDT (Bangladesh)", updatedAt: "16 Oct 2026", payoutMethods: ["bank_account", "mobile_wallet"], active: true },
  { ...emptyDraft, id: "COR-0002", name: "EUR → TND (Tunisia)", sourceCountry: "FR", sourceCurrency: "EUR", destinationCountry: "TN", destinationCurrency: "TND", fixedFee: "2.50", fxSpreadPercent: "0.85", payoutMethods: ["bank_account", "mobile_wallet", "cash_pickup"], updatedAt: "15 Oct 2026", active: true },
  { ...emptyDraft, id: "COR-0003", name: "USD → KES (Kenya)", destinationCountry: "KE", destinationCurrency: "KES", payoutMethods: ["mobile_wallet", "bank_account"], payoutGateway: "bitnob", requiredKycTier: "2", updatedAt: "14 Oct 2026", active: false },
  { ...emptyDraft, id: "COR-0004", name: "GBP → TZS (Tanzania)", sourceCountry: "GB", sourceCurrency: "GBP", destinationCountry: "TZ", destinationCurrency: "TZS", payoutMethods: ["bank_account", "cash_pickup", "wallet_credit"], payoutGateway: "manual", updatedAt: "12 Oct 2026", active: true },
];

const countryFor = (code: string) => countries.find((country) => country.code === code);

export const Route = createFileRoute("/(main)/dashboard/treasury")({ component: RemittancePage });

function RemittancePage() {
  const [corridors, setCorridors] = useState<Corridor[]>(initialCorridors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CorridorDraft>(emptyDraft);
  const [formError, setFormError] = useState("");

  const visibleCorridors = useMemo(() => corridors.filter((corridor) => {
    const haystack = [
      corridor.id, corridor.name, corridor.sourceCountry, corridor.sourceCurrency,
      corridor.destinationCountry, corridor.destinationCurrency, corridor.payoutGateway,
      ...corridor.payoutMethods,
    ].join(" ").toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? corridor.active : !corridor.active);
    return matchesSearch && matchesStatus;
  }), [corridors, search, statusFilter]);

  const activeCount = corridors.filter((corridor) => corridor.active).length;
  const disabledCount = corridors.length - activeCount;
  const payoutMethodCount = corridors.reduce((total, corridor) => total + corridor.payoutMethods.length, 0);
  const averageSpread = corridors.length
    ? corridors.reduce((total, corridor) => total + Number(corridor.fxSpreadPercent || 0), 0) / corridors.length
    : 0;

  function patchDraft(patch: Partial<CorridorDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setFormError("");
  }

  function startCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft, payoutMethods: [...emptyDraft.payoutMethods] });
    setFormError("");
    setOpen(true);
  }

  function startEdit(corridor: Corridor) {
    setEditingId(corridor.id);
    setDraft({ ...corridor, payoutMethods: [...corridor.payoutMethods] });
    setFormError("");
    setOpen(true);
  }

  function saveCorridor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.payoutMethods.length === 0) {
      setFormError("Select at least one payout method before saving this corridor.");
      return;
    }
    const cleanName = draft.name.trim();
    if (!cleanName) {
      setFormError("Enter a display name for this corridor.");
      return;
    }
    const updatedAt = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    if (editingId) {
      setCorridors((current) => current.map((corridor) =>
        corridor.id === editingId ? { ...draft, name: cleanName, id: editingId, updatedAt } : corridor
      ));
    } else {
      const nextNumber = Math.max(0, ...corridors.map((corridor) => Number(corridor.id.split("-")[1]) || 0)) + 1;
      const next: Corridor = { ...draft, name: cleanName, id: "COR-" + String(nextNumber).padStart(4, "0"), updatedAt };
      setCorridors((current) => [next, ...current]);
    }
    setOpen(false);
  }

  function togglePayoutMethod(id: PayoutMethodId, checked: boolean) {
    patchDraft({
      payoutMethods: checked
        ? [...draft.payoutMethods, id].filter((value, index, list) => list.indexOf(value) === index)
        : draft.payoutMethods.filter((value) => value !== id),
    });
  }

  function updateStatus(corridor: Corridor) {
    setCorridors((current) => current.map((item) =>
      item.id === corridor.id ? { ...item, active: !item.active, updatedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) } : item
    ));
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><Globe2 className="size-5" /></div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Finance / Remittance</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Remittance</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Configure cross-border corridors, allowed payout methods, compliance requirements, FX pricing and transfer limits.</p>
            </div>
          </div>
          <Button onClick={startCreate}><Plus className="mr-1 size-4" /> Create corridor</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total corridors" value={String(corridors.length)} caption="Configured source → destination routes" icon={<ArrowLeftRight className="size-5" />} />
        <Metric label="Active corridors" value={String(activeCount)} caption="Available for new quotes" icon={<CheckCircle2 className="size-5" />} />
        <Metric label="Disabled corridors" value={String(disabledCount)} caption="Historical records retained" icon={<ShieldCheck className="size-5" />} />
        <Metric label="Average FX spread" value={averageSpread.toFixed(2) + "%"} caption={payoutMethodCount + " payout-method assignments"} icon={<Coins className="size-5" />} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(92dvh,980px)] w-[min(96vw,1280px)] max-w-[1280px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1280px)] xl:max-w-[1280px]">
          <DialogHeader className="shrink-0 border-b bg-background/95 px-6 py-5 text-left backdrop-blur sm:px-8">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Globe2 className="size-5" /></span>
              <div className="min-w-0">
                <DialogTitle className="text-lg">{editingId ? "Edit remittance corridor" : "Create remittance corridor"}</DialogTitle>
                <DialogDescription className="mt-1">Define where funds are sent, how recipients are paid, and which pricing and compliance rules apply.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={saveCorridor} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8">
              <section className="rounded-xl border p-4 sm:p-5">
                <SectionTitle number="1" icon={<MapPin className="size-4" />} title="Identity" description="Where does the money go from and to? Choose the country and currency on each side." />
                <div className="space-y-4">
                  <Field label="Display name" hint="Shown to users in the corridor picker.">
                    <Input value={draft.name} onChange={(event) => patchDraft({ name: event.target.value })} placeholder="e.g. USD → BDT (Bangladesh)" required className="h-10" />
                  </Field>
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border bg-muted/15 p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ArrowLeftRight className="size-4" /></span> Source <span className="text-xs font-normal text-muted-foreground">(where sender pays from)</span></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(120px,1fr)]">
                        <Field label="Country">
                          <select value={draft.sourceCountry} onChange={(event) => patchDraft({ sourceCountry: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                            {countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name} ({country.code})</option>)}
                          </select>
                        </Field>
                        <Field label="Currency">
                          <select value={draft.sourceCurrency} onChange={(event) => patchDraft({ sourceCurrency: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                            {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.symbol}</option>)}
                          </select>
                        </Field>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/15 p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><MapPin className="size-4" /></span> Destination <span className="text-xs font-normal text-muted-foreground">(where recipient is paid)</span></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(120px,1fr)]">
                        <Field label="Country">
                          <select value={draft.destinationCountry} onChange={(event) => patchDraft({ destinationCountry: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                            {countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name} ({country.code})</option>)}
                          </select>
                        </Field>
                        <Field label="Currency">
                          <select value={draft.destinationCurrency} onChange={(event) => patchDraft({ destinationCurrency: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                            {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.symbol}</option>)}
                          </select>
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <SectionTitle number="2" icon={<WalletCards className="size-4" />} title="Payout methods" description="Choose how a recipient can receive the money on this corridor. Select at least one." />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {payoutMethods.map((method) => {
                    const selected = draft.payoutMethods.includes(method.id);
                    return (
                      <label key={method.id} className={"relative flex min-h-[100px] cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors " + (selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30")}>
                        <input type="checkbox" checked={selected} onChange={(event) => togglePayoutMethod(method.id, event.target.checked)} className="sr-only" />
                        <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{method.icon}</span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{method.name}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{method.hint}</span></span>
                        <span className={"flex size-5 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30")}>{selected && <Check className="size-3.5" />}</span>
                      </label>
                    );
                  })}
                </div>
                {draft.payoutMethods.length === 0 && <p className="mt-3 text-xs font-medium text-destructive">Select at least one payout method.</p>}
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <SectionTitle number="3" icon={<ShieldCheck className="size-4" />} title="Routing & compliance" description="Choose the payout partner and minimum KYC tier required before money can be delivered." />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)]">
                  <Field label="Payout gateway driver" hint="Manual routes require admin review; integrated drivers can be automated when configured.">
                    <select value={draft.payoutGateway} onChange={(event) => patchDraft({ payoutGateway: event.target.value as Gateway })} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                      {gateways.map((gateway) => <option key={gateway.id} value={gateway.id}>{gateway.name}</option>)}
                    </select>
                    <span className="text-xs text-muted-foreground">{gateways.find((gateway) => gateway.id === draft.payoutGateway)?.description}</span>
                  </Field>
                  <Field label="Required KYC tier" hint="Tier 0 means no verification requirement. Higher tiers can apply stricter checks.">
                    <div className="relative">
                      <Input type="number" min="0" max="5" step="1" value={draft.requiredKycTier} onChange={(event) => patchDraft({ requiredKycTier: event.target.value })} className="h-10 pr-24" required />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Tier 0–5</span>
                    </div>
                  </Field>
                </div>
                {draft.payoutGateway !== "manual" && <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200"><CircleAlert className="size-4 shrink-0" /> This setting records the intended driver. Automated payouts remain unavailable until the relevant provider integration is configured and verified.</p>}
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <SectionTitle number="4" icon={<Coins className="size-4" />} title="Pricing" description="Set the foreign-exchange margin and transfer fees charged on this corridor." />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="FX spread" hint="Margin added to the mid-market exchange rate.">
                    <div className="relative"><Input type="number" min="0" max="100" step="0.0001" value={draft.fxSpreadPercent} onChange={(event) => patchDraft({ fxSpreadPercent: event.target.value })} className="h-10 pr-10" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div>
                  </Field>
                  <Field label="Fixed fee" hint="Flat fee per transfer in the source currency.">
                    <div className="relative"><Input type="number" min="0" step="0.01" value={draft.fixedFee} onChange={(event) => patchDraft({ fixedFee: event.target.value })} className="h-10 pr-16" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{draft.sourceCurrency}</span></div>
                  </Field>
                  <Field label="Percent fee" hint="Percentage of the send amount, in addition to the fixed fee.">
                    <div className="relative"><Input type="number" min="0" max="100" step="0.0001" value={draft.percentFee} onChange={(event) => patchDraft({ percentFee: event.target.value })} className="h-10 pr-10" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div>
                  </Field>
                </div>
                <div className="mt-4 grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-3">
                  <SummaryValue label="Example send amount" value={draft.sourceCurrency + " " + (Number(draft.minAmount) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                  <SummaryValue label="Fixed + percentage fee" value={draft.sourceCurrency + " " + ((Number(draft.fixedFee) || 0) + (Number(draft.minAmount) || 0) * (Number(draft.percentFee) || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                  <SummaryValue label="FX margin" value={(Number(draft.fxSpreadPercent) || 0).toFixed(4) + "%"} />
                </div>
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <SectionTitle number="5" icon={<ClipboardList className="size-4" />} title="Limits & quote lifetime" description="Set per-transaction send limits in the source currency and how long a quote remains valid." />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="Minimum amount">
                    <div className="relative"><Input type="number" min="0.01" step="0.01" value={draft.minAmount} onChange={(event) => patchDraft({ minAmount: event.target.value })} className="h-10 pr-16" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{draft.sourceCurrency}</span></div>
                  </Field>
                  <Field label="Maximum amount">
                    <div className="relative"><Input type="number" min={Math.max(0.01, Number(draft.minAmount) || 0.01)} step="0.01" value={draft.maxAmount} onChange={(event) => patchDraft({ maxAmount: event.target.value })} className="h-10 pr-16" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{draft.sourceCurrency}</span></div>
                  </Field>
                  <Field label="Quote TTL" hint="1 to 1440 minutes.">
                    <div className="relative"><Input type="number" min="1" max="1440" step="1" value={draft.quoteTtlMinutes} onChange={(event) => patchDraft({ quoteTtlMinutes: event.target.value })} className="h-10 pr-16" required /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">minutes</span></div>
                  </Field>
                </div>
                {Number(draft.maxAmount) < Number(draft.minAmount) && <p className="mt-3 text-xs font-medium text-destructive">Maximum amount must be greater than or equal to the minimum amount.</p>}
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle number="6" icon={<BadgeCheck className="size-4" />} title="Corridor status" description="Disabled corridors are hidden from new quotes while existing history remains available." />
                  <label className="inline-flex cursor-pointer items-center gap-3 self-start rounded-full border px-3 py-2 sm:self-center">
                    <input type="checkbox" checked={draft.active} onChange={(event) => patchDraft({ active: event.target.checked })} className="size-4 accent-primary" />
                    <span className="text-sm font-medium">{draft.active ? "Active" : "Disabled"}</span>
                  </label>
                </div>
              </section>
              {formError && <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">{formError}</p>}
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Changes are saved in this UI preview only; production requires server-side validation and persistence.</p>
              <div className="flex shrink-0 justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={Number(draft.maxAmount) < Number(draft.minAmount)}><Check className="mr-1 size-4" /> {editingId ? "Save changes" : "Save corridor"}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-semibold">Remittance corridors</h2><p className="mt-1 text-xs text-muted-foreground">Manage source and destination combinations, payout options and corridor rules.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[300px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search corridors, countries, currencies…" className="pl-9" /></div>
            <div className="flex rounded-lg border p-1">
              {([{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }] as const).map((item) => <button key={item.value} type="button" onClick={() => setStatusFilter(item.value)} className={"rounded-md px-3 py-1.5 text-xs font-medium transition-colors " + (statusFilter === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{item.label}</button>)}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>{["Corridor", "Source", "Destination", "Payout methods", "Pricing", "Limits", "Status", ""].map((heading) => <th key={heading || "actions"} className="whitespace-nowrap px-4 py-3 text-left font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {visibleCorridors.map((corridor) => (
                <tr key={corridor.id} className="align-top transition-colors hover:bg-muted/20">
                  <td className="min-w-[210px] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary"><ArrowLeftRight className="size-4" /></span>
                      <div className="min-w-0"><p className="font-semibold">{corridor.name}</p><p className="mt-1 text-xs text-muted-foreground">{corridor.id} · Updated {corridor.updatedAt}</p></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4"><p className="font-medium">{countryFor(corridor.sourceCountry)?.flag} {corridor.sourceCurrency}</p><p className="mt-1 text-xs text-muted-foreground">{countryFor(corridor.sourceCountry)?.name || corridor.sourceCountry}</p></td>
                  <td className="whitespace-nowrap px-4 py-4"><p className="font-medium">{countryFor(corridor.destinationCountry)?.flag} {corridor.destinationCurrency}</p><p className="mt-1 text-xs text-muted-foreground">{countryFor(corridor.destinationCountry)?.name || corridor.destinationCountry}</p></td>
                  <td className="min-w-[170px] px-4 py-4"><div className="flex flex-wrap gap-1.5">{corridor.payoutMethods.map((methodId) => <Badge key={methodId} variant="outline" className="font-normal">{payoutMethods.find((method) => method.id === methodId)?.name || methodId}</Badge>)}</div><p className="mt-2 text-xs text-muted-foreground">{gateways.find((gateway) => gateway.id === corridor.payoutGateway)?.name} · KYC {corridor.requiredKycTier}</p></td>
                  <td className="whitespace-nowrap px-4 py-4"><p className="font-medium">{corridor.fxSpreadPercent}% FX</p><p className="mt-1 text-xs text-muted-foreground">{corridor.fixedFee} {corridor.sourceCurrency} + {corridor.percentFee}%</p></td>
                  <td className="whitespace-nowrap px-4 py-4"><p className="font-medium">{Number(corridor.minAmount).toLocaleString("en-US")} – {Number(corridor.maxAmount).toLocaleString("en-US")}</p><p className="mt-1 text-xs text-muted-foreground">{corridor.sourceCurrency} · Quote {corridor.quoteTtlMinutes} min</p></td>
                  <td className="px-4 py-4"><Badge variant="outline" className={corridor.active ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-muted-foreground/25 bg-muted text-muted-foreground"}>{corridor.active ? "Active" : "Disabled"}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-4"><div className="flex items-center gap-1.5"><Button variant="outline" size="sm" onClick={() => startEdit(corridor)}><Pencil className="mr-1 size-3.5" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => updateStatus(corridor)}>{corridor.active ? "Disable" : "Enable"}</Button></div></td>
                </tr>
              ))}
              {visibleCorridors.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No corridors match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p><span className="font-medium text-foreground">Prototype note:</span> corridor changes currently remain in page state and reset on refresh. Production should persist rules server-side, validate corridor limits, verify FX quotes, and enforce KYC/compliance decisions before a transfer can be initiated.</p>
      </div>
    </section>
  );
}

function SectionTitle({ number, icon, title, description }: { number: string; icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground">{number}</span>
      <div className="min-w-0"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground"><span>{label}</span>{children}{hint && <span className="text-xs font-normal leading-5 text-muted-foreground">{hint}</span>}</label>;
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p></div>;
}

function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: ReactNode }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 truncate text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  Bitcoin,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Coins,
  FileUp,
  Landmark,
  Plus,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Method = "USDT purchase" | "P2P settlement" | "Internal transfer";
type Status = "Draft" | "Awaiting receipt" | "Under review" | "Completed" | "Limit reached";

type Collection = {
  id: string;
  source: string;
  supervisor: string;
  method: Method;
  sourceAmount: number;
  sourceCurrency: string;
  receivedAmount: number;
  receivedCurrency: string;
  destination: string;
  fee: number;
  status: Status;
  date: string;
  receipt?: string;
  reference?: string;
  notes?: string;
};

const initialCollections: Collection[] = [
  { id: "TRS-261016-004", source: "Flouci · Wallet 01", supervisor: "Supervisor A", method: "USDT purchase", sourceAmount: 4200, sourceCurrency: "TND", receivedAmount: 1338.85, receivedCurrency: "USDT", destination: "Company treasury · TRC20", fee: 22.5, status: "Completed", date: "16 Oct 2026, 09:12", receipt: "receipt-004.jpg" },
  { id: "TRS-261016-003", source: "D17 · Wallet 02", supervisor: "Supervisor B", method: "P2P settlement", sourceAmount: 1800, sourceCurrency: "TND", receivedAmount: 1710, receivedCurrency: "TND", destination: "Recipient · Bank transfer", fee: 90, status: "Under review", date: "16 Oct 2026, 08:47", receipt: "p2p-proof-003.png" },
  { id: "TRS-261016-002", source: "Kashy · Wallet 03", supervisor: "Supervisor C", method: "Internal transfer", sourceAmount: 950, sourceCurrency: "TND", receivedAmount: 950, receivedCurrency: "TND", destination: "Company bank · TND", fee: 0, status: "Awaiting receipt", date: "16 Oct 2026, 08:20" },
  { id: "TRS-261016-001", source: "Flouci · Wallet 04", supervisor: "Supervisor A", method: "USDT purchase", sourceAmount: 3000, sourceCurrency: "TND", receivedAmount: 0, receivedCurrency: "USDT", destination: "Company treasury · TRC20", fee: 0, status: "Limit reached", date: "16 Oct 2026, 07:55" },
];

const statusStyles: Record<Status, string> = {
  Draft: "border-muted-foreground/25 bg-muted text-muted-foreground",
  "Awaiting receipt": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Under review": "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Limit reached": "border-destructive/25 bg-destructive/10 text-destructive",
};

const money = (amount: number, currency: string) => {
  if (currency === "USDT") {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
};

export const Route = createFileRoute("/(main)/dashboard/treasury")({
  component: TreasuryManagementPage,
});

function TreasuryManagementPage() {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [method, setMethod] = useState<Method>("USDT purchase");
  const [source, setSource] = useState("Flouci · Wallet 01");
  const [supervisor, setSupervisor] = useState("Supervisor A");
  const [sourceAmount, setSourceAmount] = useState("2500");
  const [sourceCurrency, setSourceCurrency] = useState("TND");
  const [destination, setDestination] = useState("Company treasury");
  const [network, setNetwork] = useState("TRC20");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState("TND");
  const [payoutMethod, setPayoutMethod] = useState("Bank transfer");
  const [recipient, setRecipient] = useState("");
  const [exchangeRate, setExchangeRate] = useState("3.15");
  const [platformFee, setPlatformFee] = useState("0");
  const [providerFee, setProviderFee] = useState("0");
  const [p2pFee, setP2pFee] = useState("0");
  const [dailyLimit, setDailyLimit] = useState("5000");
  const [usedToday, setUsedToday] = useState("3500");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptName, setReceiptName] = useState("");

  const sourceValue = Math.max(0, Number(sourceAmount) || 0);
  const totalFees = Math.max(0, Number(platformFee) || 0) + Math.max(0, Number(providerFee) || 0) + Math.max(0, Number(p2pFee) || 0);
  const remainingLimit = Math.max(0, (Number(dailyLimit) || 0) - (Number(usedToday) || 0));
  const estimatedReceived = method === "USDT purchase"
    ? Math.max(0, sourceValue - totalFees) / Math.max(0.000001, Number(exchangeRate) || 1)
    : method === "P2P settlement"
      ? Math.max(0, sourceValue - totalFees) * (Number(exchangeRate) || 1)
      : Math.max(0, sourceValue - totalFees);

  const visibleCollections = useMemo(() => collections.filter((row) =>
    [row.id, row.source, row.supervisor, row.method, row.destination, row.status].join(" ").toLowerCase().includes(search.toLowerCase())
  ), [collections, search]);

  const totalInFlight = collections.filter((row) => row.status !== "Completed").reduce((sum, row) => sum + row.sourceAmount, 0);
  const totalCompleted = collections.filter((row) => row.status === "Completed").reduce((sum, row) => sum + row.sourceAmount, 0);
  const reviewCount = collections.filter((row) => row.status === "Under review" || row.status === "Awaiting receipt").length;

  function handleReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReceiptName(file ? file.name : "");
  }

  function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const overLimit = sourceValue > remainingLimit;
    const row: Collection = {
      id: `TRS-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${String(collections.length + 1).padStart(3, "0")}`,
      source,
      supervisor,
      method,
      sourceAmount: sourceValue,
      sourceCurrency,
      receivedAmount: method === "Internal transfer" ? Math.max(0, sourceValue - totalFees) : estimatedReceived,
      receivedCurrency: method === "USDT purchase" ? "USDT" : method === "P2P settlement" ? payoutCurrency : sourceCurrency,
      destination: method === "USDT purchase" ? `${destination} · ${network}` : method === "P2P settlement" ? `${recipient || "Recipient not set"} · ${payoutMethod}` : destination,
      fee: totalFees,
      status: overLimit ? "Limit reached" : receiptName ? "Under review" : "Awaiting receipt",
      date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      receipt: receiptName || undefined,
      reference: reference.trim(),
      notes: notes.trim() || undefined,
    };
    setCollections((current) => [row, ...current]);
    setShowCreate(false);
    setReference("");
    setNotes("");
    setReceiptName("");
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><Landmark className="size-5" /></div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Finance / Treasury</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Treasury Management</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Consolidate wallet funds, manage daily provider limits, record USDT purchases and P2P settlements, and reconcile every transfer with proof.</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate((value) => !value)}><Plus className="mr-1 size-4" /> New collection</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Completed source funds" value={money(totalCompleted, "TND")} caption="Source-currency total" icon={<CheckCircle2 className="size-5" />} />
        <Metric label="In progress" value={money(totalInFlight, "TND")} caption="Awaiting completion or review" icon={<ArrowLeftRight className="size-5" />} />
        <Metric label="Need review" value={String(reviewCount)} caption="Receipts or settlement checks" icon={<ClipboardList className="size-5" />} />
        <Metric label="Daily limit remaining" value={money(remainingLimit, "TND")} caption="Selected wallet · example values" icon={<CalendarClock className="size-5" />} />
      </div>

      {showCreate && (
        <Card>
          <div className="flex items-start justify-between gap-3 border-b p-4">
            <div><h2 className="font-semibold">Create collection instruction</h2><p className="mt-1 text-sm text-muted-foreground">Record the source wallet, destination, exchange details, fees and proof. This demo does not move money automatically.</p></div>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Close</Button>
          </div>
          <form onSubmit={createCollection} className="space-y-5 p-4">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Wallet className="size-4 text-muted-foreground" /> Source & daily limit</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Collection method"><select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>USDT purchase</option><option>P2P settlement</option><option>Internal transfer</option></select></Field>
                <Field label="Source wallet"><select value={source} onChange={(e) => setSource(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>Flouci · Wallet 01</option><option>D17 · Wallet 02</option><option>Kashy · Wallet 03</option><option>Tunisie Telecom · Wallet 04</option><option>Other wallet</option></select></Field>
                <Field label="Responsible supervisor"><select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>Supervisor A</option><option>Supervisor B</option><option>Supervisor C</option><option>Unassigned</option></select></Field>
                <Field label="Amount to collect"><Input type="number" min="0.01" step="0.01" required value={sourceAmount} onChange={(e) => setSourceAmount(e.target.value)} /></Field>
                <Field label="Source currency"><select value={sourceCurrency} onChange={(e) => setSourceCurrency(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>TND</option><option>USD</option><option>EUR</option><option>TZS</option><option>USDT</option></select></Field>
                <Field label="Daily provider limit"><Input type="number" min="0" step="0.01" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} /></Field>
                <Field label="Already used today"><Input type="number" min="0" step="0.01" value={usedToday} onChange={(e) => setUsedToday(e.target.value)} /></Field>
                <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2 lg:col-span-1"><p className="text-xs text-muted-foreground">Remaining daily limit</p><p className={`mt-1 text-lg font-semibold tabular-nums ${sourceValue > remainingLimit ? "text-destructive" : ""}`}>{money(remainingLimit, sourceCurrency)}</p><p className="mt-1 text-xs text-muted-foreground">{sourceValue > remainingLimit ? "Amount exceeds the entered limit." : "Within the entered limit."}</p></div>
              </div>
            </div>

            {method === "USDT purchase" && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Bitcoin className="size-4 text-muted-foreground" /> USDT destination</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Destination account"><select value={destination} onChange={(e) => setDestination(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>Company treasury</option><option>Company exchange account</option><option>External approved wallet</option></select></Field>
                  <Field label="Blockchain network"><select value={network} onChange={(e) => setNetwork(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>TRC20</option><option>ERC20</option><option>BEP20</option><option>Other — verify manually</option></select></Field>
                  <Field label="Receiving wallet address"><Input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Paste and verify the USDT address" required /></Field>
                  <Field label="Indicative exchange rate (TND per USDT)"><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required /></Field>
                </div>
                <p className="mt-2 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300"><CircleAlert className="mt-0.5 size-4 shrink-0" /> Verify the network and destination address independently before sending. Network selection and the address must match the receiving service.</p>
              </div>
            )}

            {method === "P2P settlement" && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Banknote className="size-4 text-muted-foreground" /> P2P recipient & payout</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Recipient / counterparty"><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Verified recipient or merchant name" required /></Field>
                  <Field label="Recipient payout currency"><select value={payoutCurrency} onChange={(e) => setPayoutCurrency(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>TND</option><option>USD</option><option>EUR</option><option>TZS</option><option>USDT</option></select></Field>
                  <Field label="Recipient payment method"><select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>Bank transfer</option><option>Mobile wallet</option><option>Cash deposit</option><option>Licensed payment provider</option><option>Other — document manually</option></select></Field>
                  <Field label="Exchange rate (recipient currency per source unit)"><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required /></Field>
                  <Field label="Recipient account / wallet reference"><Input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="IBAN, wallet number or masked reference" required /></Field>
                </div>
              </div>
            )}

            {method === "Internal transfer" && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Landmark className="size-4 text-muted-foreground" /> Transfer destination</h3>
                <div className="grid gap-3 sm:grid-cols-2"><Field label="Destination account"><select value={destination} onChange={(e) => setDestination(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>Company bank · TND</option><option>Company treasury wallet</option><option>Approved settlement account</option></select></Field><Field label="Destination account reference"><Input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Account or wallet reference" required /></Field></div>
              </div>
            )}

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Coins className="size-4 text-muted-foreground" /> Rate, fees & estimate</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Platform fee (source currency)"><Input type="number" min="0" step="0.01" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} /></Field>
                <Field label="Provider / network fee"><Input type="number" min="0" step="0.01" value={providerFee} onChange={(e) => setProviderFee(e.target.value)} /></Field>
                <Field label="P2P / exchange fee"><Input type="number" min="0" step="0.01" value={p2pFee} onChange={(e) => setP2pFee(e.target.value)} /></Field>
                <div className="rounded-lg border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Estimated received</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(estimatedReceived, method === "USDT purchase" ? "USDT" : method === "P2P settlement" ? payoutCurrency : sourceCurrency)}</p><p className="mt-1 text-xs text-muted-foreground">Total recorded fees: {money(totalFees, sourceCurrency)}</p></div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileUp className="size-4 text-muted-foreground" /> Proof & audit details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Transaction / platform reference"><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Provider reference, P2P order ID or blockchain TXID" required /></Field>
                <Field label="Transfer receipt / proof"><Input type="file" accept="image/*,.pdf" onChange={handleReceipt} className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" /><span className="text-xs text-muted-foreground">{receiptName || "Upload a receipt image or PDF. Demo records the filename only."}</span></Field>
                <div className="sm:col-span-2"><Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Rate source, order details, reviewer instructions, exceptions…" /></Field></div>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">A request above the entered daily limit is flagged; the app never bypasses a provider limit.</p>
              <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit"><Plus className="mr-1 size-4" /> Save collection record</Button></div>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-semibold">Collection activity</h2><p className="mt-1 text-xs text-muted-foreground">Sample records for interface preview — not live wallet balances.</p></div>
          <div className="relative w-full md:max-w-[340px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, wallet, supervisor…" className="pl-9" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Collection ID", "Source / supervisor", "Method", "Source amount", "Received", "Fees", "Destination", "Status", "Proof"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-medium">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {visibleCollections.map((row) => <tr key={row.id} className="hover:bg-muted/20">
                <td className="whitespace-nowrap px-4 py-3"><div className="font-medium">{row.id}</div><div className="text-xs text-muted-foreground">{row.date}</div></td>
                <td className="px-4 py-3"><div className="font-medium">{row.source}</div><div className="text-xs text-muted-foreground">{row.supervisor}</div></td>
                <td className="whitespace-nowrap px-4 py-3">{row.method}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(row.sourceAmount, row.sourceCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(row.receivedAmount, row.receivedCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">{money(row.fee, row.sourceCurrency)}</td>
                <td className="min-w-[180px] px-4 py-3 text-xs">{row.destination}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={statusStyles[row.status]}>{row.status}</Badge></td>
                <td className="px-4 py-3">{row.receipt ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="size-4 text-emerald-600" /> Attached</span> : <span className="text-xs text-muted-foreground">Missing</span>}</td>
              </tr>)}
              {visibleCollections.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No collection records match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p><span className="font-medium text-foreground">Control note:</span> this page is a UI prototype with sample data. Production collection requires provider APIs or approved manual transfers, server-side limit enforcement, verified recipient ownership, secure receipt storage, audit logs, and reconciliation against actual account statements. Do not treat an uploaded filename or entered rate as proof of payment.</p>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">{label}{children}</label>;
}

function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 truncate text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

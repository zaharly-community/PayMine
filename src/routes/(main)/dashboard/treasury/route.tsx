import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight, BadgeCheck, Banknote, Bitcoin, CheckCircle2, CircleAlert,
  ClipboardList, Coins, FileUp, Landmark, Plus, Search, ShieldCheck, Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Method = "Binance P2P" | "Crypto transfer" | "Exchange wallet transfer" | "Bank / mobile wallet";
type Status = "Draft" | "Awaiting receipt" | "Under review" | "Completed" | "Limit reached";
type Collection = {
  id: string; source: string; method: Method; sourceAmount: number; sourceCurrency: string;
  receivedAmount: number; receivedCurrency: string; destination: string; fee: number;
  status: Status; date: string; receipt?: string; reference?: string; notes?: string;
  transactionPurpose: string; platform?: string; network?: string; orderId?: string;
  txHash?: string; senderPlatform?: string; recipientName?: string; recipientAccount?: string;
};

const initialCollections: Collection[] = [
  { id: "TRS-261016-004", source: "Flouci · Wallet 01", method: "Crypto transfer", sourceAmount: 4200, sourceCurrency: "TND", receivedAmount: 1338.85, receivedCurrency: "USDT", destination: "Binance · USDT · TRC20", fee: 22.5, status: "Completed", date: "16 Oct 2026, 09:12", receipt: "receipt-004.jpg", transactionPurpose: "Owner withdrawal / treasury settlement", platform: "Binance", network: "TRC20", txHash: "0x8f…demo" },
  { id: "TRS-261016-003", source: "D17 · Wallet 02", method: "Binance P2P", sourceAmount: 1800, sourceCurrency: "TND", receivedAmount: 1710, receivedCurrency: "TND", destination: "Binance P2P · recipient account", fee: 90, status: "Under review", date: "16 Oct 2026, 08:47", receipt: "p2p-proof-003.png", transactionPurpose: "Owner withdrawal / treasury settlement", platform: "Binance", orderId: "P2P-DEMO-003", recipientName: "Demo recipient", recipientAccount: "recipient-demo" },
  { id: "TRS-261016-002", source: "Kashy · Wallet 03", method: "Exchange wallet transfer", sourceAmount: 950, sourceCurrency: "TND", receivedAmount: 950, receivedCurrency: "TND", destination: "Company exchange account", fee: 0, status: "Awaiting receipt", date: "16 Oct 2026, 08:20", transactionPurpose: "Owner withdrawal / treasury settlement", platform: "Binance" },
  { id: "TRS-261016-001", source: "Flouci · Wallet 04", method: "Crypto transfer", sourceAmount: 3000, sourceCurrency: "TND", receivedAmount: 0, receivedCurrency: "USDT", destination: "Trust Wallet · USDT · TRC20", fee: 0, status: "Limit reached", date: "16 Oct 2026, 07:55", transactionPurpose: "Owner withdrawal / treasury settlement", platform: "Trust Wallet", network: "TRC20" },
];

const statusStyles: Record<Status, string> = {
  Draft: "border-muted-foreground/25 bg-muted text-muted-foreground",
  "Awaiting receipt": "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Under review": "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Limit reached": "border-destructive/25 bg-destructive/10 text-destructive",
};
const money = (amount: number, currency: string) => {
  const value = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (["USDT", "USDC", "BTC", "ETH", "TRX"].includes(currency)) return `${value} ${currency}`;
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount); }
  catch { return `${value} ${currency}`; }
};

export const Route = createFileRoute("/(main)/dashboard/treasury")({ component: TreasuryManagementPage });

function TreasuryManagementPage() {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [method, setMethod] = useState<Method>("Crypto transfer");
  const [source, setSource] = useState("Flouci · Wallet 01");
  const [sourceAmount, setSourceAmount] = useState("2500");
  const [sourceCurrency, setSourceCurrency] = useState("TND");
  const [dailyLimit, setDailyLimit] = useState("5000");
  const [usedToday, setUsedToday] = useState("3500");
  const [platform, setPlatform] = useState("Binance");
  const [network, setNetwork] = useState("TRC20");
  const [senderPlatform, setSenderPlatform] = useState("Flouci");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [orderId, setOrderId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [reference, setReference] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState("USDT");
  const [exchangeRate, setExchangeRate] = useState("3.15");
  const [platformFee, setPlatformFee] = useState("0");
  const [providerFee, setProviderFee] = useState("0");
  const [p2pFee, setP2pFee] = useState("0");
  const [notes, setNotes] = useState("");
  const [receiptName, setReceiptName] = useState("");

  const sourceValue = Math.max(0, Number(sourceAmount) || 0);
  const totalFees = [platformFee, providerFee, p2pFee].reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const remainingLimit = Math.max(0, (Number(dailyLimit) || 0) - (Number(usedToday) || 0));
  const rate = Math.max(0.000001, Number(exchangeRate) || 1);
  const estimatedReceived = method === "Crypto transfer" ? Math.max(0, sourceValue - totalFees) / rate
    : method === "Binance P2P" ? Math.max(0, sourceValue - totalFees) * rate
    : Math.max(0, sourceValue - totalFees);

  const visibleCollections = useMemo(() => collections.filter((row) =>
    [row.id, row.source, row.method, row.destination, row.status, row.platform, row.orderId, row.txHash].join(" ").toLowerCase().includes(search.toLowerCase())
  ), [collections, search]);
  const totalInFlight = collections.filter((row) => row.status !== "Completed").reduce((sum, row) => sum + row.sourceAmount, 0);
  const totalCompleted = collections.filter((row) => row.status === "Completed").reduce((sum, row) => sum + row.sourceAmount, 0);
  const reviewCount = collections.filter((row) => row.status === "Under review" || row.status === "Awaiting receipt").length;

  function handleReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReceiptName(file ? file.name : "");
  }

  function resetForm() {
    setReference(""); setNotes(""); setReceiptName(""); setOrderId(""); setTxHash("");
    setRecipientName(""); setRecipientAccount("");
  }

  function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const overLimit = sourceValue > remainingLimit;
    const destination = method === "Binance P2P"
      ? `${platform} P2P · ${recipientAccount || "recipient not set"}`
      : method === "Crypto transfer"
        ? `${platform} · ${payoutCurrency} · ${network}`
        : method === "Exchange wallet transfer"
          ? `${platform} account · ${recipientAccount || "account not set"}`
          : `${platform} · ${recipientAccount || "account not set"}`;
    const row: Collection = {
      id: `TRS-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${String(collections.length + 1).padStart(3, "0")}`,
      source, method, sourceAmount: sourceValue, sourceCurrency,
      receivedAmount: method === "Crypto transfer" ? Math.max(0, sourceValue - totalFees) / rate : method === "Binance P2P" ? Math.max(0, sourceValue - totalFees) * rate : Math.max(0, sourceValue - totalFees),
      receivedCurrency: method === "Crypto transfer" ? payoutCurrency : method === "Binance P2P" ? sourceCurrency : payoutCurrency,
      destination, fee: totalFees, status: overLimit ? "Limit reached" : receiptName ? "Under review" : "Awaiting receipt",
      date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      receipt: receiptName || undefined, reference: reference.trim(), notes: notes.trim() || undefined,
      transactionPurpose: "Owner withdrawal / treasury settlement", platform, network: method === "Crypto transfer" ? network : undefined,
      orderId: method === "Binance P2P" ? orderId.trim() : undefined,
      txHash: method === "Crypto transfer" ? txHash.trim() : undefined,
      senderPlatform: method === "Crypto transfer" ? senderPlatform : undefined,
      recipientName: recipientName.trim() || undefined, recipientAccount: recipientAccount.trim() || undefined,
    };
    setCollections((current) => [row, ...current]);
    setShowCreate(false);
    resetForm();
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
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Record owner withdrawals and treasury settlements from your collection wallets to exchanges, crypto wallets, or P2P recipients.</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus className="mr-1 size-4" /> Record withdrawal</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Completed source funds" value={money(totalCompleted, "TND")} caption="Source-currency total" icon={<CheckCircle2 className="size-5" />} />
        <Metric label="In progress" value={money(totalInFlight, "TND")} caption="Awaiting completion or receipt" icon={<ArrowLeftRight className="size-5" />} />
        <Metric label="Need follow-up" value={String(reviewCount)} caption="Records awaiting receipt or checks" icon={<ClipboardList className="size-5" />} />
        <Metric label="Daily limit remaining" value={money(remainingLimit, "TND")} caption="Example values for selected wallet" icon={<Wallet className="size-5" />} />
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[92vh] w-[min(96vw,1040px)] max-w-[1040px] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 border-b bg-background/95 px-5 py-4 text-left backdrop-blur sm:px-6">
            <DialogTitle className="text-lg">Record owner withdrawal</DialogTitle>
            <DialogDescription>Record the transaction details and evidence. This form does not send funds or connect to an exchange.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createCollection} className="space-y-6 px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
            <div>
              <SectionTitle icon={<Wallet className="size-4" />} title="1. Source wallet & limit" description="Where the funds are coming from." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Source wallet"><select value={source} onChange={(e) => setSource(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>Flouci · Wallet 01</option><option>D17 · Wallet 02</option><option>Kashy · Wallet 03</option><option>Tunisie Telecom · Wallet 04</option><option>Other wallet</option></select></Field>
                <Field label="Amount withdrawn"><Input type="number" min="0.01" step="0.01" required value={sourceAmount} onChange={(e) => setSourceAmount(e.target.value)} className="h-10" /></Field>
                <Field label="Source currency"><select value={sourceCurrency} onChange={(e) => setSourceCurrency(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>TND</option><option>USD</option><option>EUR</option><option>TZS</option><option>USDT</option></select></Field>
                <Field label="Daily provider limit"><Input type="number" min="0" step="0.01" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} className="h-10" /></Field>
                <Field label="Already used today"><Input type="number" min="0" step="0.01" value={usedToday} onChange={(e) => setUsedToday(e.target.value)} className="h-10" /></Field>
                <div className="rounded-lg border bg-muted/30 px-3 py-2.5"><p className="text-xs text-muted-foreground">Remaining daily limit</p><p className={`mt-1 text-base font-semibold tabular-nums ${sourceValue > remainingLimit ? "text-destructive" : ""}`}>{money(remainingLimit, sourceCurrency)}</p><p className="mt-1 text-xs text-muted-foreground">{sourceValue > remainingLimit ? "Withdrawal exceeds entered limit." : "Within entered limit."}</p></div>
              </div>
            </div>

            <div>
              <SectionTitle icon={<ArrowLeftRight className="size-4" />} title="2. Transfer route" description="Choose exactly how the money was sent or will be sent." />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  ["Binance P2P", "P2P order and counterparty details", <Banknote className="size-4" />],
                  ["Crypto transfer", "Blockchain transaction / TXID", <Bitcoin className="size-4" />],
                  ["Exchange wallet transfer", "Transfer between exchange accounts", <Landmark className="size-4" />],
                  ["Bank / mobile wallet", "Bank account or mobile wallet", <Wallet className="size-4" />],
                ] as const).map(([value, description, icon]) => (
                  <button key={value} type="button" onClick={() => setMethod(value)} className={`flex min-h-[88px] items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40 ${method === value ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border"}`}>
                    <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${method === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{icon}</span>
                    <span className="min-w-0"><span className="block text-sm font-medium">{value}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{description}</span></span>
                  </button>
                ))}
              </div>
            </div>

            {method === "Binance P2P" && <div className="rounded-xl border p-4">
              <SectionTitle icon={<Banknote className="size-4" />} title="3. Binance P2P order details" description="Use the exact order and recipient information shown in Binance P2P." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Platform"><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>Binance</option><option>Bybit</option><option>OKX</option><option>Other P2P platform</option></select></Field>
                <Field label="P2P order ID"><Input required value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Paste the order number" className="h-10" /></Field>
                <Field label="Recipient / counterparty name"><Input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Name shown on the order" className="h-10" /></Field>
                <Field label="Recipient platform UID / account"><Input required value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} placeholder="UID or receiving account" className="h-10" /></Field>
                <Field label="Settlement currency"><select value={payoutCurrency} onChange={(e) => setPayoutCurrency(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>TND</option><option>USDT</option><option>USD</option><option>EUR</option><option>TZS</option></select></Field>
                <Field label="Rate (settlement units per source unit)"><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required className="h-10" /></Field>
              </div>
            </div>}

            {method === "Crypto transfer" && <div className="rounded-xl border p-4">
              <SectionTitle icon={<Bitcoin className="size-4" />} title="3. Blockchain transfer details" description="Record both wallet platforms, the network and the transaction hash." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Sending wallet / platform"><select value={senderPlatform} onChange={(e) => setSenderPlatform(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>Flouci</option><option>Binance</option><option>Trust Wallet</option><option>MetaMask</option><option>Bybit</option><option>OKX</option><option>Other platform</option></select></Field>
                <Field label="Receiving wallet / platform"><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>Binance</option><option>Trust Wallet</option><option>MetaMask</option><option>Bybit</option><option>OKX</option><option>Company wallet</option><option>Other platform</option></select></Field>
                <Field label="Asset"><select value={payoutCurrency} onChange={(e) => setPayoutCurrency(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>USDT</option><option>USDC</option><option>BTC</option><option>ETH</option><option>TRX</option><option>Other crypto</option></select></Field>
                <Field label="Blockchain network"><select value={network} onChange={(e) => setNetwork(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>TRC20</option><option>ERC20</option><option>BEP20 / BNB Smart Chain</option><option>Bitcoin</option><option>Ethereum</option><option>Solana</option><option>Polygon</option><option>Other — verify manually</option></select></Field>
                <Field label="Transaction hash (TXID)"><Input required value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Paste blockchain transaction hash" className="h-10" /></Field>
                <Field label="Receiving wallet address / account"><Input required value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} placeholder="Receiving address or account reference" className="h-10" /></Field>
                <Field label="Exchange rate (source currency per asset unit)"><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required className="h-10" /></Field>
              </div>
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200"><CircleAlert className="size-4 shrink-0" /> Verify the destination network and address before sending. A TXID is recorded for reconciliation; this prototype does not verify it on-chain.</p>
            </div>}

            {(method === "Exchange wallet transfer" || method === "Bank / mobile wallet") && <div className="rounded-xl border p-4">
              <SectionTitle icon={<Landmark className="size-4" />} title="3. Receiving account details" description="Record the destination platform and account that receives the funds." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Receiving platform / provider"><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{(method === "Exchange wallet transfer" ? ["Binance", "Bybit", "OKX", "Trust Wallet", "Company exchange account", "Other platform"] : ["Bank transfer", "Flouci", "D17", "Kashy", "Tunisie Telecom", "Other provider"]).map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Account holder / recipient"><Input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Verified account holder" className="h-10" /></Field>
                <Field label="Receiving account / wallet reference"><Input required value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} placeholder="UID, IBAN, phone or wallet number" className="h-10" /></Field>
                <Field label="Settlement currency"><select value={payoutCurrency} onChange={(e) => setPayoutCurrency(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option>TND</option><option>USDT</option><option>USD</option><option>EUR</option><option>TZS</option></select></Field>
                <Field label="Exchange rate (settlement units per source unit)"><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required className="h-10" /></Field>
              </div>
            </div>}

            <div>
              <SectionTitle icon={<Coins className="size-4" />} title="4. Fees & settlement estimate" description="Enter actual fees from the provider or exchange." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={`Owner / platform fee (${sourceCurrency})`}><Input type="number" min="0" step="0.01" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="h-10" /></Field>
                <Field label={`Provider / network fee (${sourceCurrency})`}><Input type="number" min="0" step="0.01" value={providerFee} onChange={(e) => setProviderFee(e.target.value)} className="h-10" /></Field>
                <Field label={`P2P / exchange fee (${sourceCurrency})`}><Input type="number" min="0" step="0.01" value={p2pFee} onChange={(e) => setP2pFee(e.target.value)} className="h-10" /></Field>
                <div className="rounded-lg border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Estimated settlement</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(estimatedReceived, method === "Crypto transfer" ? payoutCurrency : method === "Binance P2P" ? payoutCurrency : payoutCurrency)}</p><p className="mt-1 text-xs text-muted-foreground">Total fees: {money(totalFees, sourceCurrency)}</p></div>
              </div>
            </div>

            <div>
              <SectionTitle icon={<FileUp className="size-4" />} title="5. Transaction record & proof" description="Keep the reference and evidence attached to this withdrawal transaction." />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Provider reference (optional if TXID / order ID supplied)"><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Provider transfer reference" className="h-10" /></Field>
                <Field label="Receipt / screenshot / PDF"><Input type="file" accept="image/*,.pdf" onChange={handleReceipt} className="h-10 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" /><span className="text-xs text-muted-foreground">{receiptName || "Demo stores the filename only, not the file itself."}</span></Field>
                <div className="sm:col-span-2"><Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Purpose, exchange rate source, exceptions or reconciliation notes…" /></Field></div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><span>This creates a transaction record only. {sourceValue > remainingLimit ? <span className="font-semibold text-destructive">Amount exceeds the entered daily limit.</span> : "Check the provider limit and destination before transferring."}</span></div>
              <div className="flex shrink-0 justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit"><Plus className="mr-1 size-4" /> Save transaction</Button></div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="font-semibold">Treasury transactions</h2><p className="mt-1 text-xs text-muted-foreground">Sample records for interface preview — not live balances or verified transfers.</p></div>
          <div className="relative w-full md:max-w-[340px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, wallet, platform, TXID…" className="pl-9" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr>{["Transaction ID", "Source wallet", "Transfer type", "Source amount", "Settlement", "Fees", "Destination / platform", "Status", "Proof"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-medium">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {visibleCollections.map((row) => <tr key={row.id} className="hover:bg-muted/20">
                <td className="whitespace-nowrap px-4 py-3"><div className="font-medium">{row.id}</div><div className="text-xs text-muted-foreground">{row.date}</div></td>
                <td className="px-4 py-3"><div className="font-medium">{row.source}</div><div className="text-xs text-muted-foreground">Owner withdrawal</div></td>
                <td className="whitespace-nowrap px-4 py-3">{row.method}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(row.sourceAmount, row.sourceCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(row.receivedAmount, row.receivedCurrency)}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">{money(row.fee, row.sourceCurrency)}</td>
                <td className="min-w-[190px] px-4 py-3"><div>{row.destination}</div>{row.orderId && <div className="mt-1 text-xs text-muted-foreground">Order: {row.orderId}</div>}{row.txHash && <div className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground" title={row.txHash}>TXID: {row.txHash}</div>}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={statusStyles[row.status]}>{row.status}</Badge></td>
                <td className="px-4 py-3">{row.receipt ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="size-4 text-emerald-600" /> Attached</span> : <span className="text-xs text-muted-foreground">Missing</span>}</td>
              </tr>)}
              {visibleCollections.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No transactions match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p><span className="font-medium text-foreground">Prototype note:</span> records currently live in page state and reset on refresh; selected receipts store only the filename. Production should persist transactions server-side, securely store evidence, verify exchange/P2P/chain references where APIs allow, enforce daily limits server-side, and reconcile actual statements. No funds are transferred by this form.</p>
      </div>
    </section>
  );
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="mb-3 flex items-start gap-2.5"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">{label}{children}</label>;
}
function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 truncate text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

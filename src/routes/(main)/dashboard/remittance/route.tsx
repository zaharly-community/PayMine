import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft, ArrowLeftRight, BadgeCheck, Banknote, Bitcoin, Building2,
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert,
  ClipboardCheck, Coins, FileImage, Globe2, Landmark, Link2, Pencil, Plus,
  Search, ShieldCheck, Smartphone, Trash2, Wallet, WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type SourceKind = "wallet" | "voucher_gateway";
type DestinationKind = "exchange" | "mobile_wallet" | "bank_account";
type TransferMode = "p2p" | "chain" | "wallet_transfer" | "bank_transfer";
type RecordStatus = "Completed" | "Missing Informations";
type RemittanceDraft = {
  sourceKind: SourceKind;
  sourceProvider: string;
  sourceAccount: string;
  sourceCurrency: string;
  sourceAmount: string;
  destinationKind: DestinationKind;
  destinationProvider: string;
  destinationCurrency: string;
  destinationAccount: string;
  transferMode: TransferMode;
  merchantName: string;
  transactionId: string;
  transactionDate: string;
  proofName: string;
  chainTxId: string;
  txHash: string;
  txLink: string;
  network: string;
  recipientName: string;
  recipientAccount: string;
  bankName: string;
  bankAccount: string;
  bankReference: string;
  sourceFee: string;
  networkFee: string;
  exchangeRate: string;
  receivedAmount: string;
  notes: string;
};
type RemittanceRecord = RemittanceDraft & {
  id: string;
  createdAt: string;
  status: RecordStatus;
  missingFields: string[];
};

const sourceProviders: Record<SourceKind, string[]> = {
  wallet: ["Flouci", "D17", "Kashy", "Tunisie Telecom", "Other wallet"],
  voucher_gateway: ["VoucherPayment Gateway", "Other voucher gateway"],
};
const destinationProviders: Record<DestinationKind, string[]> = {
  exchange: ["Binance", "Bybit", "OKX", "Trust Wallet", "MetaMask", "Other exchange / crypto wallet"],
  mobile_wallet: ["D17", "Flouci", "Kashy", "Tunisie Telecom", "Other mobile wallet"],
  bank_account: ["Bank account"],
};
const currencies = [
  "TND", "USD", "EUR", "GBP", "TZS", "KES", "NGN", "GHS", "ZAR", "EGP",
  "MAD", "AED", "SAR", "BDT", "INR", "PKR", "PHP", "IDR", "MYR", "SGD",
  "THB", "VND", "CNY", "JPY", "KRW", "AUD", "NZD", "CAD", "MXN", "BRL",
  "TRY", "CHF", "PLN", "XOF", "XAF", "USDT", "USDC", "BTC", "ETH", "TRX",
];
const networkOptions = ["TRC20", "ERC20", "BEP20 / BNB Smart Chain", "Bitcoin", "Ethereum", "Solana", "Polygon", "Other"];
const today = () => new Date().toISOString().slice(0, 10);
const currentDateLabel = () => new Date().toLocaleString("en-GB", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const formatAmount = (value: string | number, currency: string) => {
  const amount = typeof value === "number" ? value : Number(value);
  return (Number.isFinite(amount) ? amount : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }) + " " + currency;
};

const emptyDraft: RemittanceDraft = {
  sourceKind: "wallet",
  sourceProvider: "Flouci",
  sourceAccount: "",
  sourceCurrency: "TND",
  sourceAmount: "2500",
  destinationKind: "exchange",
  destinationProvider: "Binance",
  destinationCurrency: "USDT",
  destinationAccount: "",
  transferMode: "p2p",
  merchantName: "",
  transactionId: "",
  transactionDate: "",
  proofName: "",
  chainTxId: "",
  txHash: "",
  txLink: "",
  network: "TRC20",
  recipientName: "",
  recipientAccount: "",
  bankName: "",
  bankAccount: "",
  bankReference: "",
  sourceFee: "",
  networkFee: "",
  exchangeRate: "",
  receivedAmount: "",
  notes: "",
};

function getMissingFields(draft: RemittanceDraft): string[] {
  const missing: string[] = [];
  const requireText = (value: string, label: string) => {
    if (!value.trim()) missing.push(label);
  };
  const requirePositive = (value: string, label: string) => {
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) <= 0) missing.push(label);
  };
  const requireNonNegative = (value: string, label: string) => {
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0) missing.push(label);
  };

  requireText(draft.sourceProvider, "Source wallet / gateway");
  requireText(draft.sourceAccount, "Source account / wallet reference");
  requirePositive(draft.sourceAmount, "Source amount");
  requireText(draft.sourceCurrency, "Source currency");
  requireText(draft.destinationProvider, "Destination provider");
  requireText(draft.destinationCurrency, "Destination currency");

  if (draft.destinationKind === "exchange" && !draft.destinationAccount.trim()) {
    missing.push("Destination exchange account / UID");
  }

  if (draft.destinationKind === "exchange" && draft.transferMode === "p2p") {
    requireText(draft.merchantName, "P2P merchant name");
    requireText(draft.transactionId, "P2P transaction / order ID");
    requireText(draft.transactionDate, "P2P transaction date");
    requireText(draft.proofName, "P2P transfer screenshot");
    requireNonNegative(draft.sourceFee, "Source wallet commission");
    requirePositive(draft.exchangeRate, "P2P exchange rate");
  } else if (draft.destinationKind === "exchange" && draft.transferMode === "chain") {
    requireText(draft.network, "Blockchain network");
    requireText(draft.chainTxId, "TRX ID");
    requireText(draft.txHash, "Transaction hash");
    requireText(draft.txLink, "TRX explorer link");
    requireText(draft.destinationAccount, "Destination wallet address");
    requireNonNegative(draft.sourceFee, "Source wallet commission");
    requireNonNegative(draft.networkFee, "Blockchain network fee");
    requirePositive(draft.receivedAmount, "Amount received");
  } else if (draft.destinationKind === "mobile_wallet") {
    requireText(draft.recipientName, "Recipient name");
    requireText(draft.recipientAccount, "Recipient wallet / phone number");
    requireText(draft.transactionId, "Wallet transaction ID");
    requireText(draft.transactionDate, "Transfer date");
    requireText(draft.proofName, "Transfer screenshot");
    requireNonNegative(draft.sourceFee, "Source wallet commission");
    requirePositive(draft.receivedAmount, "Amount received");
  } else if (draft.destinationKind === "bank_account") {
    requireText(draft.bankName, "Destination bank name");
    requireText(draft.recipientName, "Account holder");
    requireText(draft.bankAccount, "Bank account / IBAN");
    requireText(draft.bankReference, "Bank transfer reference");
    requireText(draft.transactionDate, "Transfer date");
    requireText(draft.proofName, "Bank transfer receipt");
    requireNonNegative(draft.sourceFee, "Source wallet commission");
    requirePositive(draft.receivedAmount, "Amount received");
  }
  return missing;
}

function makeRecord(id: string, createdAt: string, draft: RemittanceDraft): RemittanceRecord {
  const missingFields = getMissingFields(draft);
  return {
    ...draft,
    id,
    createdAt,
    status: missingFields.length === 0 ? "Completed" : "Missing Informations",
    missingFields,
  };
}

const initialRecords: RemittanceRecord[] = [
  makeRecord("RMT-261016-004", "16 Oct 2026, 09:12", {
    ...emptyDraft,
    sourceKind: "wallet",
    sourceProvider: "Flouci",
    sourceAccount: "Wallet 01",
    sourceCurrency: "TND",
    sourceAmount: "2500",
    destinationKind: "exchange",
    destinationProvider: "Binance",
    destinationCurrency: "USDT",
    destinationAccount: "Binance UID 88421",
    transferMode: "p2p",
    merchantName: "USDT Merchant 884",
    transactionId: "P2P-20261016-0912",
    transactionDate: "2026-10-16",
    proofName: "binance-p2p-receipt.png",
    sourceFee: "15",
    exchangeRate: "3.15",
    notes: "Demo record",
  }),
  makeRecord("RMT-261016-003", "16 Oct 2026, 08:47", {
    ...emptyDraft,
    sourceKind: "wallet",
    sourceProvider: "D17",
    sourceAccount: "Wallet 02",
    sourceCurrency: "TND",
    sourceAmount: "1800",
    destinationKind: "mobile_wallet",
    destinationProvider: "Flouci",
    destinationCurrency: "TND",
    destinationAccount: "",
    transferMode: "wallet_transfer",
    recipientName: "Demo recipient",
    recipientAccount: "Flouci phone / account",
    transactionId: "",
    transactionDate: "",
    proofName: "",
    sourceFee: "",
    receivedAmount: "",
    notes: "Demo record with missing transfer evidence",
  }),
];

export const Route = createFileRoute("/(main)/dashboard/remittance")({ component: RemittancePage });

function RemittancePage() {
  const [records, setRecords] = useState<RemittanceRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "missing">("all");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RemittanceDraft>({ ...emptyDraft });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const visibleRecords = useMemo(() => records.filter((record) => {
    const haystack = [
      record.id, record.sourceProvider, record.sourceAccount, record.destinationProvider,
      record.destinationAccount, record.transactionId, record.chainTxId, record.txHash,
      record.merchantName, record.recipientName, record.status,
    ].join(" ").toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "completed" ? record.status === "Completed" : record.status === "Missing Informations");
    return matchesSearch && matchesStatus;
  }), [records, search, statusFilter]);

  const completedCount = records.filter((record) => record.status === "Completed").length;
  const missingCount = records.length - completedCount;
  const proofsCount = records.filter((record) => record.proofName.trim()).length;
  const totalSourceFees = records.reduce((sum, record) => sum + (Number(record.sourceFee) || 0), 0);
  const missingFields = getMissingFields(draft);
  const sentAmount = Math.max(0, Number(draft.sourceAmount) || 0);
  const sourceFee = Math.max(0, Number(draft.sourceFee) || 0);
  const networkFee = Math.max(0, Number(draft.networkFee) || 0);
  const exchangeRate = Number(draft.exchangeRate);
  const receivedEstimate = draft.destinationKind === "exchange" && draft.transferMode === "p2p" && exchangeRate > 0
    ? Math.max(0, sentAmount - sourceFee) / exchangeRate
    : Math.max(0, Number(draft.receivedAmount) || 0);
  const steps = [
    { id: 1, title: "Source & destination", description: "Where funds start and end" },
    { id: 2, title: "Transfer details", description: "Method, reference and evidence" },
    { id: 3, title: "Costs & confirm", description: "Commission and final check" },
  ] as const;

  function patchDraft(patch: Partial<RemittanceDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function startCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setStep(1);
    setOpen(true);
  }

  function startEdit(record: RemittanceRecord) {
    const {
      sourceKind, sourceProvider, sourceAccount, sourceCurrency, sourceAmount,
      destinationKind, destinationProvider, destinationCurrency, destinationAccount,
      transferMode, merchantName, transactionId, transactionDate, proofName,
      chainTxId, txHash, txLink, network, recipientName, recipientAccount,
      bankName, bankAccount, bankReference, sourceFee, networkFee, exchangeRate,
      receivedAmount, notes,
    } = record;
    setDraft({
      sourceKind, sourceProvider, sourceAccount, sourceCurrency, sourceAmount,
      destinationKind, destinationProvider, destinationCurrency, destinationAccount,
      transferMode, merchantName, transactionId, transactionDate, proofName,
      chainTxId, txHash, txLink, network, recipientName, recipientAccount,
      bankName, bankAccount, bankReference, sourceFee, networkFee, exchangeRate,
      receivedAmount, notes,
    });
    setEditingId(record.id);
    setStep(1);
    setOpen(true);
  }

  function selectSourceKind(sourceKind: SourceKind) {
    patchDraft({
      sourceKind,
      sourceProvider: sourceProviders[sourceKind][0],
      sourceAccount: "",
    });
  }

  function selectDestinationKind(destinationKind: DestinationKind) {
    const destinationProvider = destinationProviders[destinationKind][0];
    patchDraft({
      destinationKind,
      destinationProvider,
      destinationAccount: "",
      transferMode: destinationKind === "exchange" ? "p2p" : destinationKind === "mobile_wallet" ? "wallet_transfer" : "bank_transfer",
      destinationCurrency: destinationKind === "exchange" ? "USDT" : "TND",
      merchantName: "",
      transactionId: "",
      transactionDate: "",
      proofName: "",
      chainTxId: "",
      txHash: "",
      txLink: "",
      recipientName: "",
      recipientAccount: "",
      bankName: "",
      bankAccount: "",
      bankReference: "",
      sourceFee: "",
      networkFee: "",
      exchangeRate: "",
      receivedAmount: "",
    });
  }

  function changeDestinationProvider(destinationProvider: string) {
    patchDraft({
      destinationProvider,
      transferMode: destinationProvider === "Trust Wallet" || destinationProvider === "MetaMask"
        ? "chain"
        : draft.destinationKind === "exchange" ? draft.transferMode : draft.transferMode,
    });
  }

  function handleProofFile(file?: File) {
    patchDraft({ proofName: file?.name || "" });
  }

  function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalDraft = {
      ...draft,
      sourceAmount: String(Number(draft.sourceAmount) || 0),
      sourceFee: draft.sourceFee.trim(),
      networkFee: draft.networkFee.trim(),
      receivedAmount: draft.destinationKind === "exchange" && draft.transferMode === "p2p" && exchangeRate > 0
        ? String(receivedEstimate)
        : draft.receivedAmount.trim(),
    };
    const missing = getMissingFields(finalDraft);
    if (editingId) {
      setRecords((current) => current.map((record) =>
        record.id === editingId
          ? { ...finalDraft, id: editingId, createdAt: record.createdAt, status: missing.length ? "Missing Informations" : "Completed", missingFields: missing }
          : record
      ));
    } else {
      const nextId = Math.max(0, ...records.map((record) => Number(record.id.split("-").at(-1)) || 0)) + 1;
      const nextRecord = makeRecord("RMT-" + today().replaceAll("-", "").slice(2) + "-" + String(nextId).padStart(3, "0"), currentDateLabel(), finalDraft);
      setRecords((current) => [nextRecord, ...current]);
    }
    setOpen(false);
    setStep(1);
    setEditingId(null);
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setConfirmDelete(null);
  }

  function changeStep(direction: -1 | 1) {
    setStep((current) => Math.min(3, Math.max(1, current + direction)) as 1 | 2 | 3);
  }

  function currencyOptions() {
    return currencies.map((currency) => <option key={currency}>{currency}</option>);
  }

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <header className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary"><ArrowLeftRight className="size-5" /></div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Finance / Remittance</div>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Remittance</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Record transfers from collection wallets or voucher gateways to exchange accounts, mobile wallets and bank accounts.</p>
            </div>
          </div>
          <Button onClick={startCreate}><Plus className="mr-1 size-4" /> Record remittance</Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Transfer records" value={String(records.length)} caption="All recorded remittance transactions" icon={<ClipboardCheck className="size-5" />} />
        <Metric label="Completed" value={String(completedCount)} caption="All required information is present" icon={<CheckCircle2 className="size-5" />} />
        <Metric label="Missing informations" value={String(missingCount)} caption="Records that still need details or proof" icon={<CircleAlert className="size-5" />} />
        <Metric label="Proofs attached" value={String(proofsCount)} caption="Screenshots and receipts selected" icon={<FileImage className="size-5" />} />
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) { setStep(1); setEditingId(null); } }}>
        <DialogContent className="flex h-[min(92dvh,940px)] w-[min(96vw,1120px)] max-w-[1120px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1120px)] xl:max-w-[1120px]">
          <DialogHeader className="shrink-0 border-b bg-background/95 px-6 py-4 text-left backdrop-blur sm:px-8">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ArrowLeftRight className="size-5" /></span>
              <div className="min-w-0">
                <DialogTitle className="text-lg">{editingId ? "Edit remittance record" : "Record remittance"}</DialogTitle>
                <DialogDescription className="mt-1">Step {step} of 3 · {steps[step - 1].description}. Incomplete records can be saved and completed later.</DialogDescription>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {steps.map((item) => (
                <button key={item.id} type="button" onClick={() => setStep(item.id)} className="group min-w-0 text-left">
                  <span className={"mb-2 block h-1 rounded-full " + (step >= item.id ? "bg-primary" : "bg-muted")} />
                  <span className="flex items-center gap-2">
                    <span className={"flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold " + (step === item.id ? "border-primary bg-primary text-primary-foreground" : step > item.id ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground")}>{step > item.id ? <Check className="size-3.5" /> : item.id}</span>
                    <span className={"truncate text-xs font-medium " + (step === item.id ? "text-foreground" : "text-muted-foreground")}>{item.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </DialogHeader>

          <form onSubmit={submitRecord} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              {step === 1 && (
                <div className="space-y-5">
                  <StepHeading number="1" title="Source & destination" description="Choose the wallet or gateway funds come from, then the actual account receiving them." />
                  <div className="grid gap-5 xl:grid-cols-2">
                    <section className="rounded-xl border p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Wallet className="size-4" /></span><div><h3 className="text-sm font-semibold">Source</h3><p className="text-xs text-muted-foreground">Wallet or VoucherPayment Gateway</p></div></div>
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {([{ value: "wallet", title: "Wallet", desc: "Flouci, D17, Kashy" }, { value: "voucher_gateway", title: "VoucherPayment Gateway", desc: "Voucher collection provider" }] as const).map((item) => (
                          <button key={item.value} type="button" onClick={() => selectSourceKind(item.value)} className={"rounded-lg border p-3 text-left transition-colors " + (draft.sourceKind === item.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30")}>
                            <span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <Field label={draft.sourceKind === "wallet" ? "Source wallet" : "Source gateway"}>
                          <select value={draft.sourceProvider} onChange={(event) => patchDraft({ sourceProvider: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                            {sourceProviders[draft.sourceKind].map((provider) => <option key={provider}>{provider}</option>)}
                          </select>
                        </Field>
                        <Field label={draft.sourceKind === "wallet" ? "Wallet name / account reference" : "Gateway account / merchant reference"} hint="Select the exact account used for this transfer.">
                          <Input value={draft.sourceAccount} onChange={(event) => patchDraft({ sourceAccount: event.target.value })} placeholder={draft.sourceKind === "wallet" ? "e.g. Wallet 01 / registered phone" : "e.g. merchant ID or gateway account"} className="h-10" />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Amount sent">
                            <Input type="number" min="0" step="0.01" value={draft.sourceAmount} onChange={(event) => patchDraft({ sourceAmount: event.target.value })} className="h-10" />
                          </Field>
                          <Field label="Source currency">
                            <select value={draft.sourceCurrency} onChange={(event) => patchDraft({ sourceCurrency: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{currencyOptions()}</select>
                          </Field>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-xl border p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ArrowDownLeft className="size-4" /></span><div><h3 className="text-sm font-semibold">Destination</h3><p className="text-xs text-muted-foreground">The final account receiving the funds</p></div></div>
                      <div className="mb-4 grid gap-2 sm:grid-cols-3">
                        {([
                          { value: "exchange", title: "Exchange", icon: <Bitcoin className="size-4" /> },
                          { value: "mobile_wallet", title: "Mobile wallet", icon: <Smartphone className="size-4" /> },
                          { value: "bank_account", title: "Bank account", icon: <Building2 className="size-4" /> },
                        ] as const).map((item) => (
                          <button key={item.value} type="button" onClick={() => selectDestinationKind(item.value)} className={"flex min-h-[72px] flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors " + (draft.destinationKind === item.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30")}>
                            <span className={draft.destinationKind === item.value ? "text-primary" : "text-muted-foreground"}>{item.icon}</span><span className="text-xs font-semibold">{item.title}</span>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <Field label="Destination provider / platform">
                          <select value={draft.destinationProvider} onChange={(event) => changeDestinationProvider(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                            {destinationProviders[draft.destinationKind].map((provider) => <option key={provider}>{provider}</option>)}
                          </select>
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Destination currency">
                            <select value={draft.destinationCurrency} onChange={(event) => patchDraft({ destinationCurrency: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{currencyOptions()}</select>
                          </Field>
                          {draft.destinationKind === "exchange" && (
                            <Field label="Destination account / UID / address">
                              <Input value={draft.destinationAccount} onChange={(event) => patchDraft({ destinationAccount: event.target.value })} placeholder="Exchange UID or receiving address" className="h-10" />
                            </Field>
                          )}
                        </div>
                        {draft.destinationKind === "exchange" && (
                          <div className="rounded-lg bg-muted/35 p-3">
                            <p className="text-xs font-semibold">Transfer method is selected in Step 2</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">For Binance, Bybit and OKX choose P2P or Chain Transfer. Trust Wallet and MetaMask generally use Chain Transfer.</p>
                          </div>
                        )}
                        {draft.destinationKind === "mobile_wallet" && <p className="rounded-lg bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">Recipient phone, holder name, wallet transaction ID and screenshot are captured in Step 2.</p>}
                        {draft.destinationKind === "bank_account" && <p className="rounded-lg bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">Bank, beneficiary, account / IBAN, transfer reference and bank receipt are captured in Step 2.</p>}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <StepHeading number="2" title="Transfer details & evidence" description="Fields adapt to the destination and the method used to send the money." />
                  {draft.destinationKind === "exchange" && (
                    <section className="rounded-xl border p-4 sm:p-5">
                      <Field label="Transfer method">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            { value: "p2p", title: "P2P transfer", description: "Merchant, order reference, transfer date and payment screenshot", icon: <Banknote className="size-5" /> },
                            { value: "chain", title: "Chain Transfer", description: "Blockchain network, TRX ID, transaction hash and explorer link", icon: <Bitcoin className="size-5" /> },
                          ] as const).map((item) => (
                            <button key={item.value} type="button" onClick={() => patchDraft({ transferMode: item.value })} className={"flex min-h-[94px] items-start gap-3 rounded-xl border p-4 text-left transition-colors " + (draft.transferMode === item.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30")}>
                              <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (draft.transferMode === item.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{item.icon}</span>
                              <span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span></span>
                            </button>
                          ))}
                        </div>
                      </Field>
                    </section>
                  )}

                  {draft.destinationKind === "exchange" && draft.transferMode === "p2p" && (
                    <section className="rounded-xl border p-4 sm:p-5">
                      <StepHeading number="P2P" title="P2P merchant & transaction" description="Enter the details matching the exchange order, then attach the transfer screenshot." />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Merchant name">
                          <Input value={draft.merchantName} onChange={(event) => patchDraft({ merchantName: event.target.value })} placeholder="Name of the P2P merchant" className="h-10" />
                        </Field>
                        <Field label="P2P transaction / order ID">
                          <Input value={draft.transactionId} onChange={(event) => patchDraft({ transactionId: event.target.value })} placeholder="Exchange order ID" className="h-10" />
                        </Field>
                        <Field label="Transaction date">
                          <Input type="date" value={draft.transactionDate} onChange={(event) => patchDraft({ transactionDate: event.target.value })} className="h-10" />
                        </Field>
                        <Field label="Merchant account / note (optional)">
                          <Input value={draft.recipientAccount} onChange={(event) => patchDraft({ recipientAccount: event.target.value })} placeholder="Merchant UID or payment note" className="h-10" />
                        </Field>
                        <Field label="Transfer screenshot / receipt" hint={draft.proofName || "Attach the P2P paid-order screenshot."}>
                          <Input type="file" accept="image/*,.pdf" onChange={(event) => handleProofFile(event.target.files?.[0])} className="h-10 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" />
                        </Field>
                      </div>
                    </section>
                  )}

                  {draft.destinationKind === "exchange" && draft.transferMode === "chain" && (
                    <section className="rounded-xl border p-4 sm:p-5">
                      <StepHeading number="CHAIN" title="Blockchain transaction details" description="Record identifiers that let the transfer be traced in the correct explorer." />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Blockchain network">
                          <select value={draft.network} onChange={(event) => patchDraft({ network: event.target.value })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{networkOptions.map((network) => <option key={network}>{network}</option>)}</select>
                        </Field>
                        <Field label="TRX ID / transaction ID">
                          <Input value={draft.chainTxId} onChange={(event) => patchDraft({ chainTxId: event.target.value })} placeholder="Network transaction identifier" className="h-10" />
                        </Field>
                        <Field label="Transaction hash">
                          <Input value={draft.txHash} onChange={(event) => patchDraft({ txHash: event.target.value })} placeholder="Full transaction hash" className="h-10" />
                        </Field>
                        <Field label="TRX link / blockchain explorer URL">
                          <Input type="url" value={draft.txLink} onChange={(event) => patchDraft({ txLink: event.target.value })} placeholder="https://tronscan.org/#/transaction/..." className="h-10" />
                        </Field>
                        <Field label="Receiving wallet address">
                          <Input value={draft.destinationAccount} onChange={(event) => patchDraft({ destinationAccount: event.target.value })} placeholder="Destination address" className="h-10" />
                        </Field>
                        <Field label="Screenshot / additional proof (optional)" hint={draft.proofName || "TX link is required; supporting proof is optional."}>
                          <Input type="file" accept="image/*,.pdf" onChange={(event) => handleProofFile(event.target.files?.[0])} className="h-10 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" />
                        </Field>
                      </div>
                    </section>
                  )}

                  {draft.destinationKind === "mobile_wallet" && (
                    <section className="rounded-xl border p-4 sm:p-5">
                      <StepHeading number="WALLET" title="Mobile wallet transfer" description="Capture the recipient account and the provider reference for the transfer." />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Recipient name"><Input value={draft.recipientName} onChange={(event) => patchDraft({ recipientName: event.target.value })} placeholder="Name registered to the wallet" className="h-10" /></Field>
                        <Field label="Recipient wallet / phone number"><Input value={draft.recipientAccount} onChange={(event) => patchDraft({ recipientAccount: event.target.value })} placeholder="Wallet number or registered phone" className="h-10" /></Field>
                        <Field label="Provider transaction ID"><Input value={draft.transactionId} onChange={(event) => patchDraft({ transactionId: event.target.value })} placeholder="D17 / Flouci / provider reference" className="h-10" /></Field>
                        <Field label="Transfer date"><Input type="date" value={draft.transactionDate} onChange={(event) => patchDraft({ transactionDate: event.target.value })} className="h-10" /></Field>
                        <Field label="Transfer screenshot / receipt" hint={draft.proofName || "Attach a screenshot or receipt from the destination provider."}><Input type="file" accept="image/*,.pdf" onChange={(event) => handleProofFile(event.target.files?.[0])} className="h-10 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" /></Field>
                      </div>
                    </section>
                  )}

                  {draft.destinationKind === "bank_account" && (
                    <section className="rounded-xl border p-4 sm:p-5">
                      <StepHeading number="BANK" title="Bank transfer details" description="Record beneficiary and bank references to make reconciliation possible." />
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Bank name"><Input value={draft.bankName} onChange={(event) => patchDraft({ bankName: event.target.value })} placeholder="Receiving bank" className="h-10" /></Field>
                        <Field label="Account holder / beneficiary"><Input value={draft.recipientName} onChange={(event) => patchDraft({ recipientName: event.target.value })} placeholder="Full beneficiary name" className="h-10" /></Field>
                        <Field label="Account number / IBAN"><Input value={draft.bankAccount} onChange={(event) => patchDraft({ bankAccount: event.target.value })} placeholder="Destination account or IBAN" className="h-10" /></Field>
                        <Field label="Bank transfer reference"><Input value={draft.bankReference} onChange={(event) => patchDraft({ bankReference: event.target.value })} placeholder="Reference on the bank receipt" className="h-10" /></Field>
                        <Field label="Transfer date"><Input type="date" value={draft.transactionDate} onChange={(event) => patchDraft({ transactionDate: event.target.value })} className="h-10" /></Field>
                        <Field label="Bank receipt / proof" hint={draft.proofName || "Attach a bank transfer receipt or confirmation."}><Input type="file" accept="image/*,.pdf" onChange={(event) => handleProofFile(event.target.files?.[0])} className="h-10 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs" /></Field>
                      </div>
                    </section>
                  )}
                  <p className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs leading-5 text-muted-foreground"><CircleAlert className="mt-0.5 size-4 shrink-0" /> You can continue with incomplete information. The record will be marked Missing Informations until the required details and proof are supplied.</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <StepHeading number="3" title="Costs & confirmation" description="Record the fee charged by the source wallet and, for P2P, the actual exchange rate." />
                  <section className="rounded-xl border p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Coins className="size-4" /></span><div><h3 className="text-sm font-semibold">Transfer costs</h3><p className="text-xs text-muted-foreground">Amounts below use the source currency unless stated otherwise.</p></div></div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <Field label={"Source wallet / gateway commission (" + draft.sourceCurrency + ")"} hint="The commission deducted by the originating wallet or VoucherPayment Gateway.">
                        <Input type="number" min="0" step="0.01" value={draft.sourceFee} onChange={(event) => patchDraft({ sourceFee: event.target.value })} placeholder="0.00" className="h-10" />
                      </Field>
                      {draft.destinationKind === "exchange" && draft.transferMode === "chain" && (
                        <Field label={"Blockchain network fee (" + draft.sourceCurrency + ")"} hint="Network fee paid in the source currency equivalent.">
                          <Input type="number" min="0" step="0.01" value={draft.networkFee} onChange={(event) => patchDraft({ networkFee: event.target.value })} placeholder="0.00" className="h-10" />
                        </Field>
                      )}
                      {draft.destinationKind === "exchange" && draft.transferMode === "p2p" && (
                        <Field label={"Exchange rate (" + draft.sourceCurrency + " per 1 " + draft.destinationCurrency + ")"} hint="Example: 3.15 means 1 USDT = 3.15 TND.">
                          <Input type="number" min="0.000001" step="0.000001" value={draft.exchangeRate} onChange={(event) => patchDraft({ exchangeRate: event.target.value })} placeholder="e.g. 3.15" className="h-10" />
                        </Field>
                      )}
                      {(draft.destinationKind !== "exchange" || draft.transferMode === "chain") && (
                        <Field label={"Amount received (" + draft.destinationCurrency + ")"} hint="Enter the net amount actually delivered to the destination.">
                          <Input type="number" min="0" step="0.000001" value={draft.receivedAmount} onChange={(event) => patchDraft({ receivedAmount: event.target.value })} placeholder="0.00" className="h-10" />
                        </Field>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 rounded-xl bg-muted/35 p-4 sm:grid-cols-3">
                      <SummaryValue label="Amount sent" value={formatAmount(draft.sourceAmount, draft.sourceCurrency)} />
                      <SummaryValue label="Source + network fee" value={formatAmount(sourceFee + (draft.destinationKind === "exchange" && draft.transferMode === "chain" ? networkFee : 0), draft.sourceCurrency)} />
                      <SummaryValue label="Expected net received" value={draft.destinationKind === "exchange" && draft.transferMode === "p2p" && exchangeRate > 0 ? formatAmount(receivedEstimate, draft.destinationCurrency) : formatAmount(draft.receivedAmount, draft.destinationCurrency)} />
                    </div>
                  </section>

                  <section className="rounded-xl border p-4 sm:p-5">
                    <StepHeading number="CHECK" title="Review this remittance" description="The status is determined automatically from the data entered in the previous steps." />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewLine label="Source" value={draft.sourceProvider + " · " + draft.sourceAccount} />
                      <ReviewLine label="Destination" value={draft.destinationProvider + (draft.destinationAccount ? " · " + draft.destinationAccount : "")} />
                      <ReviewLine label="Method" value={draft.destinationKind === "exchange" ? (draft.transferMode === "p2p" ? "P2P transfer" : "Chain Transfer") : draft.destinationKind === "mobile_wallet" ? "Mobile wallet transfer" : "Bank transfer"} />
                      <ReviewLine label="Reference" value={draft.destinationKind === "exchange" && draft.transferMode === "chain" ? (draft.chainTxId || "Not entered") : (draft.transactionId || draft.bankReference || "Not entered")} />
                    </div>
                    {missingFields.length === 0 ? (
                      <p className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> All required information is present. This record will be marked Completed.</p>
                    ) : (
                      <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
                        <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200"><CircleAlert className="size-4" /> Missing Informations ({missingFields.length})</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">You may still confirm and save this record. You can complete it later from the table using Edit.</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">{missingFields.map((field) => <Badge key={field} variant="outline" className="border-amber-500/30 font-normal">{field}</Badge>)}</div>
                      </div>
                    )}
                    <Field label="Internal notes (optional)">
                      <textarea value={draft.notes} onChange={(event) => patchDraft({ notes: event.target.value })} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Reconciliation notes or additional context…" />
                    </Field>
                  </section>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> UI prototype only; it does not send money or verify transactions with providers.</p>
              <div className="flex shrink-0 justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); setStep(1); setEditingId(null); }}>Cancel</Button>
                {step > 1 && <Button type="button" variant="outline" onClick={() => changeStep(-1)}><ChevronLeft className="mr-1 size-4" /> Back</Button>}
                {step < 3 ? (
                  <Button type="button" onClick={() => changeStep(1)}>Next <ChevronRight className="ml-1 size-4" /></Button>
                ) : (
                  <Button type="submit"><Check className="mr-1 size-4" /> Confirm</Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="font-semibold">Remittance records</h2><p className="mt-1 text-xs text-muted-foreground">Status is based on the required transaction data and evidence for each destination type.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[310px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, wallet, destination, TXID…" className="pl-9" /></div>
            <div className="flex rounded-lg border p-1">
              {([{ value: "all", label: "All" }, { value: "completed", label: "Completed" }, { value: "missing", label: "Missing info" }] as const).map((item) => <button key={item.value} type="button" onClick={() => setStatusFilter(item.value)} className={"rounded-md px-3 py-1.5 text-xs font-medium transition-colors " + (statusFilter === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{item.label}</button>)}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>{["Remittance ID", "Source", "Destination", "Method", "Amount sent", "Source fee", "Reference / evidence", "Status", "Actions"].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 text-left font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {visibleRecords.map((record) => (
                <tr key={record.id} className="align-top transition-colors hover:bg-muted/20">
                  <td className="whitespace-nowrap px-4 py-4"><p className="font-semibold">{record.id}</p><p className="mt-1 text-xs text-muted-foreground">{record.createdAt}</p></td>
                  <td className="min-w-[175px] px-4 py-4"><p className="font-medium">{record.sourceProvider}</p><p className="mt-1 text-xs text-muted-foreground">{record.sourceKind === "wallet" ? "Wallet" : "VoucherPayment Gateway"} · {record.sourceAccount || "Account not set"}</p></td>
                  <td className="min-w-[175px] px-4 py-4"><p className="font-medium">{record.destinationProvider}</p><p className="mt-1 text-xs text-muted-foreground">{record.destinationKind === "exchange" ? "Exchange / crypto wallet" : record.destinationKind === "mobile_wallet" ? "Mobile wallet" : "Bank account"}{record.destinationAccount ? " · " + record.destinationAccount : ""}</p></td>
                  <td className="whitespace-nowrap px-4 py-4">{record.destinationKind === "exchange" ? record.transferMode === "p2p" ? "P2P" : "Chain Transfer" : record.destinationKind === "mobile_wallet" ? "Wallet transfer" : "Bank transfer"}</td>
                  <td className="whitespace-nowrap px-4 py-4 tabular-nums"><p className="font-medium">{formatAmount(record.sourceAmount, record.sourceCurrency)}</p>{record.destinationKind === "exchange" && record.transferMode === "p2p" && Number(record.exchangeRate) > 0 && <p className="mt-1 text-xs text-muted-foreground">Rate {record.exchangeRate}</p>}</td>
                  <td className="whitespace-nowrap px-4 py-4 tabular-nums">{record.sourceFee.trim() ? formatAmount(record.sourceFee, record.sourceCurrency) : <span className="text-xs text-muted-foreground">Not entered</span>}{record.destinationKind === "exchange" && record.transferMode === "chain" && record.networkFee.trim() && <p className="mt-1 text-xs text-muted-foreground">Network {formatAmount(record.networkFee, record.sourceCurrency)}</p>}</td>
                  <td className="min-w-[190px] px-4 py-4">
                    <p className="max-w-[230px] truncate font-medium" title={record.destinationKind === "exchange" && record.transferMode === "chain" ? record.txHash : record.transactionId}>{record.destinationKind === "exchange" && record.transferMode === "chain" ? record.chainTxId || record.txHash || "No TRX ID" : record.transactionId || record.bankReference || "No reference"}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{record.proofName ? <><BadgeCheck className="size-3.5 text-emerald-600" /> {record.proofName}</> : record.txLink ? <><Link2 className="size-3.5 text-emerald-600" /> Explorer link added</> : "Evidence missing"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={record.status === "Completed" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"}>{record.status}</Badge>
                    {record.missingFields.length > 0 && <p className="mt-2 max-w-[190px] text-xs text-muted-foreground" title={record.missingFields.join(", ")}>{record.missingFields.length} item(s) missing</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4"><div className="flex items-center gap-1"><Button variant="outline" size="sm" onClick={() => startEdit(record)}><Pencil className="mr-1 size-3.5" /> Edit</Button><Button variant="ghost" size="icon" onClick={() => setConfirmDelete(record.id)} aria-label={"Delete " + record.id} title="Delete record"><Trash2 className="size-4 text-destructive" /></Button></div></td>
                </tr>
              ))}
              {visibleRecords.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No remittance records match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={confirmDelete !== null} onOpenChange={(nextOpen) => { if (!nextOpen) setConfirmDelete(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete remittance record?</DialogTitle><DialogDescription>This removes the selected record from this UI preview. This action cannot be undone here.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button variant="destructive" onClick={() => confirmDelete && deleteRecord(confirmDelete)}><Trash2 className="mr-1 size-4" /> Delete record</Button></div>
        </DialogContent>
      </Dialog>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p><span className="font-medium text-foreground">Prototype note:</span> records and receipt filenames currently stay in page state and reset on refresh. The browser file picker selects a file but does not upload or persist its contents. Production should store records and evidence securely on a backend and validate balances, fees and transfer references before treating a remittance as financially settled.</p>
      </div>
    </section>
  );
}

function StepHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="mb-4 flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">{number}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground"><span>{label}</span>{children}{hint && <span className="text-xs font-normal leading-5 text-muted-foreground">{hint}</span>}</label>;
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p></div>;
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-lg border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-medium" title={value}>{value || "Not entered"}</p></div>;
}

function Metric({ label, value, caption, icon }: { label: string; value: string; caption: string; icon: ReactNode }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 truncate text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">{icon}</div></CardContent></Card>;
}

import * as React from "react";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  Info,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type Asset = {
  id: string;
  symbol: string;
  network: string;
  label: string;
  min: number;
  max: number;
  iconClass: string;
  address: string;
  note: string;
};

const assets: Asset[] = [
  {
    id: "usdt-trc20",
    symbol: "USDT",
    network: "TRC20",
    label: "USDT TRC20",
    min: 1,
    max: 10000,
    iconClass: "bg-emerald-500/15 text-emerald-400",
    address: "TSSFKbS9fAPF5VvUF9MqEVCMfeNhsPXA13",
    note: "Please send only USDT_TRC20 coins to this address on the official TRC20 network.",
  },
  {
    id: "usdt-erc20",
    symbol: "USDT",
    network: "ERC20",
    label: "USDT ERC20",
    min: 1,
    max: 10000,
    iconClass: "bg-emerald-500/15 text-emerald-400",
    address: "0x83e7f5b4b0D6fA0E2D8C7F8E9A0b1C2D3E4F5A6B",
    note: "Please send only USDT_ERC20 coins to this address on the official ERC20 network.",
  },
  {
    id: "usdt-bep20",
    symbol: "USDT",
    network: "BEP20",
    label: "USDT BEP20",
    min: 1,
    max: 10000,
    iconClass: "bg-emerald-500/15 text-emerald-400",
    address: "0x4E9A2FfD61b4aE92cB18E1D0a8F0D43dE5aC77B1",
    note: "Please send only USDT_BEP20 coins to this address on the official BEP20 network.",
  },
  {
    id: "bnb",
    symbol: "BNB",
    network: "BSC",
    label: "BNB BEP20",
    min: 0.01,
    max: 500,
    iconClass: "bg-amber-400/15 text-amber-300",
    address: "0x2f6c2e3C4B7D8a9E0F1a2B3C4D5E6F7A8B9C0D1E",
    note: "Please send only BNB on the official BSC network to this address.",
  },
  {
    id: "eth",
    symbol: "ETH",
    network: "Ethereum",
    label: "Ethereum",
    min: 0.001,
    max: 50,
    iconClass: "bg-sky-400/15 text-sky-300",
    address: "0x0A3bF1b2c4d5E6f708192A3b4C5d6E7f8091a2B3C",
    note: "Please send only ETH on the official Ethereum network to this address.",
  },
  {
    id: "ltc",
    symbol: "LTC",
    network: "Litecoin",
    label: "Litecoin",
    min: 0.01,
    max: 250,
    iconClass: "bg-blue-400/15 text-blue-300",
    address: "ltc1q9p2n8z8l3m9h7f6s5d4a3c2v1b0n9m8k7j6h5",
    note: "Please send only LTC on the official Litecoin network to this address.",
  },
  {
    id: "trx",
    symbol: "TRX",
    network: "TRON",
    label: "TRON",
    min: 1,
    max: 100000,
    iconClass: "bg-red-500/15 text-red-400",
    address: "TQx4B4o1vY2m6K8N9P0R3S5D7F1G2H4J6K8L9M0N",
    note: "Please send only TRX on the official TRON network to this address.",
  },
];

function AssetMark({ asset }: { asset: Asset }) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center rounded-full border border-white/5 text-[10px] font-semibold tracking-tight",
        asset.iconClass,
      )}
    >
      {asset.symbol}
    </span>
  );
}

function NetworkSelector({
  asset,
  open,
  onToggle,
  onSelect,
}: {
  asset: Asset;
  open: boolean;
  onToggle: () => void;
  onSelect: (asset: Asset) => void;
}) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {assets.map((item) => {
          const selected = item.id === asset.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "group flex min-w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors",
                selected
                  ? "border-white/25 bg-slate-800/80"
                  : "border-white/8 bg-slate-900/60 hover:border-white/15 hover:bg-slate-800/60",
              )}
              aria-pressed={selected}
            >
              <AssetMark asset={item} />
              <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-slate-300">
                {item.network}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Show all payment networks"
          className="flex min-w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-slate-900/60 px-2 text-slate-400 hover:bg-slate-800/60"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {assets.map((item) => (
              <button
                key={item.id + "-menu"}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onToggle();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  item.id === asset.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/70",
                )}
              >
                <AssetMark asset={item} />
                <span className="min-w-0 truncate">
                  {item.symbol} <span className="text-slate-500">{item.network}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QrCodePreview({ value }: { value: string }) {
  const size = 25;

  const isFinderCell = (row: number, col: number, top: number, left: number) => {
    if (row < top || row >= top + 7 || col < left || col >= left + 7) return false;
    const r = row - top;
    const c = col - left;
    return r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
  };

  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const finder =
      isFinderCell(row, col, 0, 0) ||
      isFinderCell(row, col, 0, size - 7) ||
      isFinderCell(row, col, size - 7, 0);

    const seed =
      value.charCodeAt((row * 11 + col * 7) % value.length) +
      row * 17 +
      col * 31 +
      row * col;

    return finder || seed % 5 !== 0;
  });

  return (
    <div className="relative size-44 rounded-lg border border-slate-300 bg-white p-2 shadow-[0_0_0_4px_rgba(255,255,255,0.04)] sm:size-48">
      <div
        className="grid size-full overflow-hidden rounded-[2px]"
        style={{ gridTemplateColumns: "repeat(" + size + ", minmax(0, 1fr))" }}
        aria-label="Payment QR code"
      >
        {cells.map((filled, index) => (
          <span key={index} className={filled ? "bg-black" : "bg-white"} />
        ))}
      </div>
    </div>
  );
}

function DepositSummary({
  asset,
  amount,
  onBack,
}: {
  asset: Asset;
  amount: string;
  onBack: () => void;
}) {
  const numericAmount = Number(amount) || asset.min;
  const displayAmount = numericAmount.toFixed(8);
  const [secondsLeft, setSecondsLeft] = React.useState(60 * 60);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be unavailable in a restricted browser context.
    }
  };

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft /> Back
          </Button>
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Deposit
          </span>
        </div>

        <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 sm:p-6">
          <div className="flex flex-col items-center gap-5">
            <QrCodePreview value={asset.address + displayAmount} />

            <div className="w-full space-y-4">
              <div>
                <p className="text-sm font-medium text-white">One-time wallet address</p>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-700/90 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Address</p>
                    <p className="truncate text-sm text-slate-200">{asset.address}</p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Copy wallet address"
                    title="Copy wallet address"
                    onClick={() => void copy(asset.address)}
                    className="text-slate-200 hover:bg-slate-600"
                  >
                    <Copy />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white">Transfer this amount to one-time wallet address</p>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-700/90 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Amount</p>
                    <p className="text-sm tabular-nums text-slate-200">{displayAmount}</p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Copy amount"
                    title="Copy amount"
                    onClick={() => void copy(displayAmount)}
                    className="text-slate-200 hover:bg-slate-600"
                  >
                    <Copy />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                <p className="flex gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
                  {asset.note}
                </p>
                <p className="flex gap-2">
                  <Clock3 className="mt-0.5 size-3.5 shrink-0 text-slate-200" />
                  Awaiting payment <span className="font-medium tabular-nums text-white">{minutes}:{seconds}</span>
                </p>
                <p className="text-slate-400">
                  Please deposit only once to the address displayed above and no later than the timer expires.
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-slate-400">
                Network fee is not included in the deposit amount. The payment will be credited after the required confirmations are detected.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function CustomerPortal() {
  const [asset, setAsset] = React.useState(assets[0]);
  const [amount, setAmount] = React.useState("1");
  const [openNetworks, setOpenNetworks] = React.useState(false);
  const [depositStarted, setDepositStarted] = React.useState(false);
  const [error, setError] = React.useState("");

  const minLabel = asset.min >= 1 ? asset.min.toLocaleString("en-US") : asset.min.toFixed(3);
  const maxLabel = asset.max.toLocaleString("en-US");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (numericAmount < asset.min || numericAmount > asset.max) {
      setError("Amount must be between " + minLabel + " and " + maxLabel + " " + asset.symbol + ".");
      return;
    }

    setError("");
    setDepositStarted(true);
  };

  if (depositStarted) {
    return <DepositSummary asset={asset} amount={amount} onBack={() => setDepositStarted(false)} />;
  }

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl sm:p-5">
          <div className="space-y-4">
            <NetworkSelector
              asset={asset}
              open={openNetworks}
              onToggle={() => setOpenNetworks((current) => !current)}
              onSelect={(nextAsset) => {
                setAsset(nextAsset);
                setAmount(String(nextAsset.min));
                setError("");
              }}
            />

            <form onSubmit={submit} className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 sm:p-5">
              <div className="rounded-lg bg-slate-700/90 px-3 py-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError("");
                  }}
                  aria-label="Deposit amount"
                  className="h-8 border-0 bg-transparent p-0 text-base text-slate-100 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-400">Min/Max</span>
                <span className="font-medium tabular-nums text-slate-100">
                  {minLabel} - {maxLabel} {asset.symbol}
                </span>
              </div>

              {error ? (
                <div className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="mt-4 h-10 w-full rounded-md bg-emerald-400 text-sm font-medium text-slate-950 hover:bg-emerald-300"
              >
                <CircleDollarSign className="size-4" />
                <span>
                  Do Deposit
                  <span className="ml-2 block text-[11px] font-normal text-slate-900/80">
                    Net Amount: {Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00"} {asset.symbol}
                  </span>
                </span>
              </Button>
            </form>

            <div className="space-y-2 px-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
              <p>
                To make a deposit, please fill in all the required fields below.
              </p>
              <p>
                Note* Make sure to select the correct network ({asset.network}) in order to successfully complete the transaction. Please note that funds sent via a wrong network will be non-refundable. Also take into account the network fee, required to complete the transaction.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <QrCode className="size-3.5" />
              Secure checkout
              <ExternalLink className="size-3" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

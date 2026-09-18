import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  FileText,
  Mail,
  MessageSquare,
  MoreVertical,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DepositRow } from "./data";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="shrink-0 text-lg font-semibold tracking-tight">{children}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("truncate text-sm font-medium", mono && "font-mono text-xs")}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ deposit }: { deposit: DepositRow }) {
  const canceled = deposit.depositStatus === "Canceled";
  const completed = deposit.depositStatus === "Completed";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 text-xs font-medium",
        canceled &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        completed &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        !canceled &&
          !completed &&
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      <span
        className={cn(
          "mr-1.5 size-1.5 rounded-full",
          canceled && "bg-destructive",
          completed && "bg-emerald-500",
          !canceled && !completed && "bg-amber-500",
        )}
      />
      {canceled ? "Canceled" : completed ? "Completed" : "Pending review"}
    </Badge>
  );
}

function SummaryCard({ deposit }: { deposit: DepositRow }) {
  const net = deposit.amount - deposit.feeAmount;
  const canceled = deposit.depositStatus === "Canceled";

  return (
    <aside className="overflow-hidden rounded-lg border bg-background">
      <div className="space-y-5 p-5">
        <div className="text-amber-600 dark:text-amber-400">
          <StatusPill deposit={deposit} />
        </div>

        <div>
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(deposit.amount)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Processor fee</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(deposit.feeAmount)}
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Net after fees</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(net)}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {canceled ? <RotateCcw className="size-4" /> : <AlertTriangle className="size-4" />}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">
                {canceled ? "Deposit canceled" : "Manual verification required"}
              </div>
              <div className="text-sm leading-5 text-muted-foreground">
                {canceled
                  ? "The transaction has been canceled and cannot proceed until it is enabled again."
                  : "Confirm the payment evidence, processor routing, and verification state before release."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-none border-r text-sm"
          onClick={() => navigator.clipboard?.writeText(deposit.id)}
        >
          <Copy />
          Copy ID
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-none text-sm"
          onClick={() => {
            const content = [
              "Deposit Receipt",
              `Transaction: ${deposit.id}`,
              `Player: ${deposit.name}`,
              `Amount: ${deposit.amount}`,
              `Payment method: ${deposit.paymentMethod}`,
              `Status: ${deposit.depositStatus}`,
            ].join("\n");
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${deposit.id}-receipt.txt`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
          }}
        >
          <Download />
          Receipt
        </Button>
      </div>
    </aside>
  );
}

function DocumentCard({
  icon: Icon,
  name,
  meta,
}: {
  icon: typeof FileText;
  name: string;
  meta: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        </div>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${name}`}>
        <MoreVertical />
      </Button>
    </div>
  );
}

function HistoryItem({
  time,
  title,
  actor,
  description,
  accent = false,
}: {
  time: string;
  title: string;
  actor: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="grid grid-cols-[72px_16px_1fr] gap-3">
      <div className="pt-0.5 text-right text-xs text-muted-foreground">{time}</div>
      <div className="relative flex justify-center">
        <span
          className={cn(
            "mt-1.5 size-2.5 rounded-full border-2 bg-background",
            accent
              ? "border-amber-500 bg-amber-500"
              : "border-muted-foreground/40",
          )}
        />
        <span className="absolute top-4 bottom-0 w-px bg-border" />
      </div>
      <div className="pb-6">
        <div className="text-sm">
          <span className="font-semibold">{title}</span>
          <span className="ml-1 text-muted-foreground">by {actor}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

export function TransactionDetail({ deposit }: { deposit: DepositRow }) {
  const verification = deposit.verificationStatus;
  const feeLabel =
    deposit.feePercent > 0
      ? `${deposit.feePercent}% - ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(deposit.feeAmount)}`
      : "Not concerned";

  return (
    <section className="min-h-full bg-background">
      <header className="border-b px-6 py-5">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusPill deposit={deposit} />
                <span className="font-mono text-xs text-muted-foreground">{deposit.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Transaction {deposit.id}
                </h1>
                <Button variant="outline" size="icon-sm" aria-label="Edit transaction">
                  <ReceiptText />
                </Button>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Review payment evidence, processor routing, verification status, and audit changes before releasing the deposit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" className="h-9">
                <Check />
                Approve
              </Button>
              <Button type="button" variant="outline" className="h-9">
                <RotateCcw />
                Refund
              </Button>
              <Button type="button" variant="outline" size="icon-sm" aria-label="More transaction actions">
                <MoreVertical />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 xl:grid-cols-[minmax(0,1fr)_304px]">
        <main className="min-w-0 space-y-10">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
                This deposit is inside a manual review window. Confirm the payment evidence, processor routing, and verification state before approving the transaction.
              </p>
            </div>
          </div>

          <section className="space-y-5">
            <SectionHeading>Transaction Details</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Transaction ID" value={deposit.id} mono />
              <Field label="Amount" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(deposit.amount)} />
              <Field label="Customer" value={deposit.name} />
              <Field label="Payment method" value={deposit.paymentMethod} />
              <Field label="Processor" value={deposit.processedBy.name} />
              <Field label="Source" value="Hosted checkout" />
              <Field label="Currency" value="USD" />
              <Field label="Created" value={deposit.date} />
              <Field label="Settlement" value={deposit.depositStatus === "Completed" ? "Settled" : "On review"} />
              <Field label="Ledger account" value="Operating balance" />
              <Field label="Fees" value={feeLabel} />
              <Field label="Verification" value={verification} />
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <SectionHeading>Supporting documents</SectionHeading>
              <Button variant="ghost" size="sm">
                <Download />
                Download all
              </Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <DocumentCard
                icon={FileText}
                name="payment-receipt.pdf"
                meta={`Uploaded ${deposit.date}`}
              />
              <DocumentCard
                icon={ShieldCheck}
                name="verification-note.txt"
                meta={`Reviewed by ${deposit.processedBy.name}`}
              />
              <DocumentCard
                icon={ReceiptText}
                name="transaction-evidence.pdf"
                meta="Generated from processor record"
              />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>Processor Context</SectionHeading>
            <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Merchant route" value={`${deposit.paymentMethod} / Wallet`} />
              <Field label="Invoice" value={`INV-${deposit.id.slice(-5)}`} mono />
              <Field label="Player" value={deposit.name} />
              <Field label="Capture mode" value="Automatic after processor confirmation" />
              <Field label="Verification" value={verification} />
              <Field label="Location" value="Tunisia" />
              <Field label="Payment channel" value="Online cashier" />
              <Field label="Webhook delivery" value="2 delivered, 1 retry scheduled" />
              <Field label="Processor reference" value={`PRC-${deposit.id.replaceAll("-", "")}`} mono />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>Operational Notes</SectionHeading>
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <ShieldCheck className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Risk posture</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Processor verification required before funds are released.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <WalletCards className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Funds movement</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Deposit is routed through the selected payment processor.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <MessageSquare className="size-5 text-muted-foreground" />
                <div className="mt-5 text-sm font-semibold">Customer thread</div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  Customer communication and review notes are attached to this transaction.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading>History</SectionHeading>
            <div>
              <HistoryItem
                time={deposit.date.split(", ")[1] ?? deposit.date}
                title="Review window opened"
                actor="Risk engine"
                description="Transaction entered a manual payment review state before release."
                accent
              />
              <HistoryItem
                time="09:18"
                title="Internal note added"
                actor={deposit.processedBy.name}
                description="Payment evidence was matched with the processor reference."
              />
              <HistoryItem
                time="09:03"
                title="Payment method verified"
                actor={deposit.processedBy.name}
                description={`${deposit.paymentMethod} verification completed for the transaction.`}
              />
            </div>
          </section>
        </main>

        <div className="min-w-0">
          <div className="xl:sticky xl:top-6">
            <SummaryCard deposit={deposit} />
            <Button variant="outline" className="mt-4 w-full">
              <Mail />
              Email customer
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-4">
        <div className="mx-auto max-w-[1500px]">
          <Button asChild variant="ghost" size="sm">
            <a href="/dashboard/deposits">
              <ArrowLeft />
              Back to deposits
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}


import * as React from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Hourglass,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";
import {
  type ImportedRecord,
  makeTransactionDuplicateKey,
  readTransactionImportFile,
} from "@/lib/transaction-import";

export type AddTransactionFieldValues = Record<string, string>;

type AddTransactionDialogProps<T extends Record<string, unknown>> = {
  kind: "deposit" | "withdrawl";
  title: string;
  description: string;
  existingRows: T[];
  methods: readonly string[];
  statuses: readonly string[];
  verificationStatuses?: readonly string[];
  initialValues?: AddTransactionFieldValues;
  onCreateSingle: (values: AddTransactionFieldValues) => void;
  buildImportedRow: (record: ImportedRecord, index: number) => T;
  onImport: (rows: T[]) => void;
};

const FLOUCI_TRANSFER_NUMBERS = [
  "24 500 000",
  "20 445 991",
  "29 318 702",
] as const;

const FLOUCI_PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000] as const;

export function AddTransactionDialog<T extends Record<string, unknown>>({
  kind,
  title,
  description,
  existingRows,
  methods,
  statuses,
  verificationStatuses = [],
  initialValues,
  onCreateSingle,
  buildImportedRow,
  onImport,
}: AddTransactionDialogProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"single" | "bulk">("single");
  const [values, setValues] = React.useState<AddTransactionFieldValues>(() => ({
    player: "",
    email: "",
    amount: "",
    feePercent: "0",
    method: methods[0] ?? "",
    date: toDateTimeLocal(new Date()),
    status: statuses[0] ?? "Pending",
    verificationStatus: verificationStatuses[0] ?? "Pending",
    processedBy: "",
    ...initialValues,
  }));
  const [submitError, setSubmitError] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [records, setRecords] = React.useState<ImportedRecord[]>([]);
  const [duplicateIndexes, setDuplicateIndexes] = React.useState<Set<number>>(
    new Set(),
  );
  const [reading, setReading] = React.useState(false);
  const [bulkError, setBulkError] = React.useState("");

  const [flouciStep, setFlouciStep] = React.useState<1 | 2 | 3>(1);
  const [flouciSeconds, setFlouciSeconds] = React.useState(10 * 60);
  const [flouciTransferIndex, setFlouciTransferIndex] = React.useState(0);
  const [flouciTransactionId, setFlouciTransactionId] = React.useState("");
  const [flouciProof, setFlouciProof] = React.useState<File | null>(null);

  const reset = () => {
    setMode("single");
    setValues({
      player: "",
      email: "",
      amount: "",
      feePercent: "0",
      method: methods[0] ?? "",
      date: toDateTimeLocal(new Date()),
      status: statuses[0] ?? "Pending",
      verificationStatus: verificationStatuses[0] ?? "Pending",
      processedBy: "",
      ...initialValues,
    });
    setSubmitError("");
    setFileName("");
    setRecords([]);
    setDuplicateIndexes(new Set());
    setReading(false);
    setBulkError("");
    setFlouciStep(1);
    setFlouciSeconds(10 * 60);
    setFlouciTransferIndex(0);
    setFlouciTransactionId("");
    setFlouciProof(null);
  };

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError("");
  };

  const handleMethodChange = (value: string) => {
    updateValue("method", value);

    if (kind === "deposit" && value === "Flouci") {
      setFlouciStep(1);
      setFlouciSeconds(10 * 60);
      setSubmitError("");
    }
  };

  React.useEffect(() => {
    if (
      !open ||
      mode !== "single" ||
      kind !== "deposit" ||
      values.method !== "Flouci" ||
      flouciStep !== 2 ||
      flouciSeconds <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setFlouciSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [flouciSeconds, flouciStep, kind, mode, open, values.method]);

  const handleSingleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const player = values.player.trim();
    const amount = Number(values.amount);

    if (!player) {
      setSubmitError("Player is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Enter an amount greater than 0.");
      return;
    }

    onCreateSingle({
      ...values,
      player,
      email: values.email.trim(),
      amount: String(amount),
      feePercent: String(Number(values.feePercent) || 0),
      processedBy: values.processedBy.trim() || "Unassigned",
    });
    close(false);
  };

  const handleFlouciStepOne = () => {
    const player = values.player.trim();
    const amount = Number(values.amount);

    if (!player) {
      setSubmitError("Enter the player identifier.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Enter an amount greater than 0.");
      return;
    }

    setSubmitError("");
    setFlouciStep(2);
    setFlouciSeconds(10 * 60);
    setFlouciTransactionId("");
    setFlouciProof(null);
  };

  const requestFlouciNumberChange = () => {
    setFlouciTransferIndex(
      (current) => (current + 1) % FLOUCI_TRANSFER_NUMBERS.length,
    );
    setFlouciSeconds(10 * 60);
    setSubmitError("");
  };

  const confirmFlouciPayment = () => {
    if (flouciSeconds <= 0) {
      setSubmitError("This payment instruction has expired. Request a new transfer number.");
      return;
    }

    if (!flouciTransactionId.trim()) {
      setSubmitError("Enter the transfer transaction ID.");
      return;
    }

    if (!flouciProof) {
      setSubmitError("Upload the transfer proof before confirming.");
      return;
    }

    const amount = Number(values.amount);
    onCreateSingle({
      ...values,
      player: values.player.trim(),
      amount: String(amount),
      method: "Flouci",
      feePercent: "0",
      status: "Pending",
      verificationStatus: "Pending",
      processedBy: "Unassigned",
      transactionId: flouciTransactionId.trim(),
      paymentProof: flouciProof.name,
      transferAccount: FLOUCI_TRANSFER_NUMBERS[flouciTransferIndex] ?? "",
    });
    setSubmitError("");
    setFlouciStep(3);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setReading(true);
    setBulkError("");
    setFileName(file.name);

    try {
      const imported = await readTransactionImportFile(file);
      if (imported.length === 0) {
        throw new Error("The file is empty or has no data rows.");
      }

      const existingKeys = new Set(
        existingRows.map((row) => makeTransactionDuplicateKey(row, kind)),
      );
      const seen = new Set(existingKeys);
      const duplicates = new Set<number>();

      imported.forEach((record, index) => {
        const key = makeTransactionDuplicateKey(record, kind);
        if (seen.has(key)) {
          duplicates.add(index);
          return;
        }
        seen.add(key);
      });

      setRecords(imported);
      setDuplicateIndexes(duplicates);
    } catch (caught) {
      setRecords([]);
      setDuplicateIndexes(new Set());
      setBulkError(
        caught instanceof Error
          ? caught.message
          : "The file could not be imported.",
      );
    } finally {
      setReading(false);
    }
  };

  const newRecords = records.filter(
    (_, index) => !duplicateIndexes.has(index),
  );

  const importRows = () => {
    if (newRecords.length === 0) return;

    onImport(
      newRecords.map((record, index) => buildImportedRow(record, index)),
    );
    close(false);
  };

  const transactionName = kind === "deposit" ? "Deposit" : "Withdrawl";
  const isFlouciDeposit =
    kind === "deposit" && values.method === "Flouci" && mode === "single";
  const flouciExpired = flouciSeconds <= 0;
  const formattedFlouciTimer = formatCountdown(flouciSeconds);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus /> Add {transactionName}
      </Button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add {transactionName}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "single"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setMode("single");
                setSubmitError("");
              }}
            >
              Single transaction
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === "bulk"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setMode("bulk");
                setBulkError("");
              }}
            >
              Bulk
            </button>
          </div>

          {mode === "single" ? (
            <>
              {kind === "deposit" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment Method</Label>
                  <Select
                    value={values.method}
                    onValueChange={(value) => handleMethodChange(String(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {isFlouciDeposit ? (
                <FlouciDepositFlow
                  step={flouciStep}
                  values={values}
                  seconds={flouciSeconds}
                  expired={flouciExpired}
                  transferNumber={
                    FLOUCI_TRANSFER_NUMBERS[flouciTransferIndex] ??
                    FLOUCI_TRANSFER_NUMBERS[0]
                  }
                  transactionId={flouciTransactionId}
                  proof={flouciProof}
                  error={submitError}
                  onPlayerChange={(value) => updateValue("player", value)}
                  onAmountChange={(value) => updateValue("amount", value)}
                  onPresetAmount={(amount) => updateValue("amount", String(amount))}
                  onContinue={handleFlouciStepOne}
                  onRequestNumberChange={requestFlouciNumberChange}
                  onTransactionIdChange={(value) => {
                    setFlouciTransactionId(value);
                    setSubmitError("");
                  }}
                  onProofChange={(file) => {
                    setFlouciProof(file);
                    setSubmitError("");
                  }}
                  onConfirm={confirmFlouciPayment}
                  onBack={() => {
                    setSubmitError("");
                    setFlouciStep(1);
                  }}
                  onClose={() => close(false)}
                />
              ) : (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Player</Label>
                      <Input
                        value={values.player}
                        onChange={(event) =>
                          updateValue("player", event.target.value)
                        }
                        placeholder="Enter player name"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Email</Label>
                      <Input
                        type="email"
                        value={values.email}
                        onChange={(event) =>
                          updateValue("email", event.target.value)
                        }
                        placeholder="Enter player email"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Amount</Label>
                      <Input
                        inputMode="decimal"
                        value={values.amount}
                        onChange={(event) =>
                          updateValue("amount", event.target.value)
                        }
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        {kind === "deposit" ? "Fee %" : "Commission %"}
                      </Label>
                      <Input
                        inputMode="decimal"
                        value={values.feePercent}
                        onChange={(event) =>
                          updateValue("feePercent", event.target.value)
                        }
                        placeholder="Enter fee percentage"
                      />
                    </div>
                    {kind !== "deposit" ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
                          Withdrawl Method
                        </Label>
                        <Select
                          value={values.method}
                          onValueChange={(value) =>
                            handleMethodChange(String(value))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a withdrawal method" />
                          </SelectTrigger>
                          <SelectContent>
                            {methods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Date</Label>
                      <Input
                        type="datetime-local"
                        value={values.date}
                        onChange={(event) =>
                          updateValue("date", event.target.value)
                        }
                        placeholder="Select transaction date and time"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Processed By</Label>
                      <Input
                        value={values.processedBy}
                        onChange={(event) =>
                          updateValue("processedBy", event.target.value)
                        }
                        placeholder="Enter operator name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {verificationStatuses.length > 0 ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
                          Verification Status
                        </Label>
                        <Select
                          value={values.verificationStatus}
                          onValueChange={(value) =>
                            updateValue(
                              "verificationStatus",
                              String(value),
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select verification status" />
                          </SelectTrigger>
                          <SelectContent>
                            {verificationStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        {kind === "deposit" ? "Deposit Status" : "Status"}
                      </Label>
                      <Select
                        value={values.status}
                        onValueChange={(value) =>
                          updateValue("status", String(value))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {submitError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  ) : null}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => close(false)}
                    >
                      <X /> Cancel
                    </Button>
                    <Button type="submit">
                      <Plus /> Create {transactionName}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <label
                htmlFor={"transaction-bulk-" + kind}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
                  "bg-muted/30 hover:bg-muted/50",
                  reading && "pointer-events-none opacity-60",
                )}
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background">
                  <FileSpreadsheet className="size-5 text-muted-foreground" />
                </span>
                <span className="font-medium">Choose a file</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {fileName || "Excel .xlsx, CSV, or TSV"}
                </span>
                <input
                  id={"transaction-bulk-" + kind}
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls,.csv,.tsv,text/csv,text/tab-separated-values"
                  onChange={(event) => {
                    void handleFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              <div className="rounded-lg border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">
                  Expected columns
                </div>
                <div className="mt-1">
                  ID, Player, Email, Date,{" "}
                  {kind === "deposit"
                    ? "Payment Method, Amount, Fee Percent, Verification Status, Deposit Status"
                    : "Withdrawl Method, Amount, Commission Percent, Status"}
                  , Processed By
                </div>
              </div>

              {bulkError ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              ) : null}

              {records.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <BulkMetric label="Rows found" value={records.length} />
                    <BulkMetric
                      label="Ready to add"
                      value={newRecords.length}
                      positive
                    />
                    <BulkMetric
                      label="Duplicates"
                      value={duplicateIndexes.size}
                      warning={duplicateIndexes.size > 0}
                    />
                  </div>

                  <div className="max-h-56 overflow-auto rounded-lg border">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-muted/70 text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Row</th>
                          <th className="px-3 py-2 font-medium">
                            ID / Reference
                          </th>
                          <th className="px-3 py-2 font-medium">Player</th>
                          <th className="px-3 py-2 text-right font-medium">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.slice(0, 12).map((record, index) => {
                          const duplicate = duplicateIndexes.has(index);
                          return (
                            <tr
                              key={"preview-" + index}
                              className={cn(
                                "border-t",
                                duplicate && "bg-destructive/5",
                              )}
                            >
                              <td className="px-3 py-2 tabular-nums">
                                {index + 2}
                              </td>
                              <td className="px-3 py-2 font-mono">
                                {record.id ||
                                  record.TransactionId ||
                                  record.Reference ||
                                  record.ref ||
                                  "—"}
                              </td>
                              <td className="px-3 py-2">
                                {record.name ||
                                  record.Name ||
                                  record.Player ||
                                  record["Player Name"] ||
                                  "—"}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">
                                {record.amount ||
                                  record.Amount ||
                                  record.Value ||
                                  "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Duplicate transaction IDs/references are skipped
                      automatically. When no ID exists, player, email, date,
                      method, and amount are compared.
                    </span>
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => close(false)}
                >
                  <X /> Cancel
                </Button>
                <Button
                  type="button"
                  disabled={reading || newRecords.length === 0}
                  onClick={importRows}
                >
                  <Upload /> Add{" "}
                  {newRecords.length > 0
                    ? newRecords.length + " transactions"
                    : "transactions"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FlouciDepositFlow({
  step,
  values,
  seconds,
  expired,
  transferNumber,
  transactionId,
  proof,
  error,
  onPlayerChange,
  onAmountChange,
  onPresetAmount,
  onContinue,
  onRequestNumberChange,
  onTransactionIdChange,
  onProofChange,
  onConfirm,
  onBack,
  onClose,
}: {
  step: 1 | 2 | 3;
  values: AddTransactionFieldValues;
  seconds: number;
  expired: boolean;
  transferNumber: string;
  transactionId: string;
  proof: File | null;
  error: string;
  onPlayerChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onPresetAmount: (amount: number) => void;
  onContinue: () => void;
  onRequestNumberChange: () => void;
  onTransactionIdChange: (value: string) => void;
  onProofChange: (file: File | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <FlowSteps currentStep={step} />

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Player Identifier</Label>
              <Input
                value={values.player}
                onChange={(event) => onPlayerChange(event.target.value)}
                placeholder="Enter player identifier"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount</Label>
              <Input
                inputMode="decimal"
                value={values.amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="Enter amount in TND"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Quick Amount</Label>
            <div className="flex flex-wrap gap-2">
              {FLOUCI_PRESET_AMOUNTS.map((amount) => {
                const active = values.amount === String(amount);
                return (
                  <button
                    key={amount}
                    type="button"
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-background hover:bg-muted",
                    )}
                    onClick={() => onPresetAmount(amount)}
                  >
                    {amount} TND
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <FlowError message={error} /> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X /> Cancel
            </Button>
            <Button type="button" onClick={onContinue}>
              Continue
            </Button>
          </DialogFooter>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Transfer destination
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {transferNumber}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Send exactly {values.amount || "0"} TND to this Flouci number.
                </p>
              </div>

              <div className="rounded-lg border bg-background px-3 py-2 text-right">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Time remaining
                </div>
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1.5 font-mono text-sm font-semibold tabular-nums",
                    expired
                      ? "text-destructive"
                      : seconds <= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-foreground",
                  )}
                >
                  {expired ? (
                    <>
                      <Hourglass className="size-3.5" />
                      Expired
                    </>
                  ) : (
                    <>
                      <Clock3 className="size-3.5" />
                      {formatCountdown(seconds)}
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRequestNumberChange}
            >
              <RefreshCw /> Request another number
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flouci-transfer-transaction-id" className="text-xs font-medium">
              Transfer Transaction ID
            </Label>
            <Input
              id="flouci-transfer-transaction-id"
              value={transactionId}
              onChange={(event) => onTransactionIdChange(event.target.value)}
              placeholder="Enter the Flouci transfer transaction ID"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flouci-transfer-proof" className="text-xs font-medium">
              Transfer Proof
            </Label>
            <label
              htmlFor="flouci-transfer-proof"
              className={cn(
                "flex min-h-20 cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed bg-background px-3 py-3 transition-colors hover:bg-muted/40",
                expired && "cursor-not-allowed opacity-60",
              )}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {proof ? proof.name : "Upload transfer screenshot"}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {proof
                    ? "Proof selected"
                    : "Placeholder: choose a JPG, PNG, or PDF proof file"}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium">
                <Upload className="size-3.5" />
                Choose file
              </span>
              <input
                id="flouci-transfer-proof"
                type="file"
                className="sr-only"
                accept="image/*,.pdf"
                disabled={expired}
                onChange={(event) => {
                  onProofChange(event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {error ? <FlowError message={error} /> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="button" disabled={expired} onClick={onConfirm}>
              <CheckCircle2 /> Confirm transfer
            </Button>
          </DialogFooter>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <div className="font-medium">Deposit request submitted</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your transfer proof has been submitted and the deposit is now waiting for supervisor verification.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-0">
            <WaitingTimelineItem
              icon={ShieldCheck}
              title="Order verification by supervisor"
              description="Waiting for the assigned Supervisor to review the request and payment proof."
              active
            />
            <WaitingTimelineItem
              icon={CheckCircle2}
              title="Order confirmation"
              description="The deposit will be confirmed after the supervisor completes verification."
            />
            <WaitingTimelineItem
              icon={Hourglass}
              title="Transfer received"
              description="The deposit balance will be released after the payment is confirmed as received."
            />
          </div>

          <DialogFooter>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </DialogFooter>
        </div>
      ) : null}
    </div>
  );
}

function FlowSteps({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const items = [
    "Player & amount",
    "Transfer details",
    "Waiting for verification",
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => {
        const step = index + 1;
        const active = step === currentStep;
        const completed = step < currentStep;
        return (
          <div key={item} className="space-y-1.5">
            <div
              className={cn(
                "h-1 rounded-full bg-muted",
                active && "bg-primary",
                completed && "bg-emerald-500",
              )}
            />
            <div
              className={cn(
                "text-[11px]",
                active || completed
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step}. {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WaitingTimelineItem({
  icon: Icon,
  title,
  description,
  active = false,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      <div className="relative flex w-7 shrink-0 justify-center">
        <span
          className={cn(
            "z-10 flex size-7 items-center justify-center rounded-full border bg-background",
            active
              ? "border-primary text-primary"
              : "border-muted-foreground/20 text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="absolute top-7 bottom-0 w-px bg-border last:hidden" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm font-medium", !active && "text-muted-foreground")}>
            {title}
          </span>
          {active ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
              <Clock3 className="size-3" />
              Waiting
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FlowError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function BulkMetric({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          positive && "text-emerald-600 dark:text-emerald-400",
          warning && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

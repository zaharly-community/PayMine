
import * as React from "react";

import { AlertTriangle, CheckCircle2, FileSpreadsheet, Plus, Upload, X } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [duplicateIndexes, setDuplicateIndexes] = React.useState<Set<number>>(new Set());
  const [reading, setReading] = React.useState(false);
  const [bulkError, setBulkError] = React.useState("");

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
  };

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError("");
  };

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
        caught instanceof Error ? caught.message : "The file could not be imported.",
      );
    } finally {
      setReading(false);
    }
  };

  const newRecords = records.filter((_, index) => !duplicateIndexes.has(index));

  const importRows = () => {
    if (newRecords.length === 0) return;

    onImport(newRecords.map((record, index) => buildImportedRow(record, index)));
    close(false);
  };

  const transactionName = kind === "deposit" ? "Deposit" : "Withdrawl";

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus /> Add {transactionName}
      </Button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-2xl">
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
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Player</Label>
                  <Input
                    value={values.player}
                    onChange={(event) => updateValue("player", event.target.value)}
                    placeholder="Player name"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    value={values.email}
                    onChange={(event) => updateValue("email", event.target.value)}
                    placeholder="player@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Amount</Label>
                  <Input
                    inputMode="decimal"
                    value={values.amount}
                    onChange={(event) => updateValue("amount", event.target.value)}
                    placeholder="0.00"
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
                    onChange={(event) => updateValue("feePercent", event.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {kind === "deposit" ? "Payment Method" : "Withdrawl Method"}
                  </Label>
                  <Select
                    value={values.method}
                    onValueChange={(value) => updateValue("method", String(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Date</Label>
                  <Input
                    type="datetime-local"
                    value={values.date}
                    onChange={(event) => updateValue("date", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Processed By</Label>
                  <Input
                    value={values.processedBy}
                    onChange={(event) => updateValue("processedBy", event.target.value)}
                    placeholder="Operator name"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {verificationStatuses.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Verification Status</Label>
                    <Select
                      value={values.verificationStatus}
                      onValueChange={(value) =>
                        updateValue("verificationStatus", String(value))
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
                    onValueChange={(value) => updateValue("status", String(value))}
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
                <Button type="button" variant="outline" onClick={() => close(false)}>
                  <X /> Cancel
                </Button>
                <Button type="submit">
                  <Plus /> Create {transactionName}
                </Button>
              </DialogFooter>
            </form>
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
                <div className="font-medium text-foreground">Expected columns</div>
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
                    <BulkMetric label="Ready to add" value={newRecords.length} positive />
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
                          <th className="px-3 py-2 font-medium">ID / Reference</th>
                          <th className="px-3 py-2 font-medium">Player</th>
                          <th className="px-3 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.slice(0, 12).map((record, index) => {
                          const duplicate = duplicateIndexes.has(index);
                          return (
                            <tr
                              key={"preview-" + index}
                              className={cn("border-t", duplicate && "bg-destructive/5")}
                            >
                              <td className="px-3 py-2 tabular-nums">{index + 2}</td>
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
                                {record.amount || record.Amount || record.Value || "—"}
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
                      Duplicate transaction IDs/references are skipped automatically. When no ID exists, player, email, date, method, and amount are compared.
                    </span>
                  </div>
                </div>
              ) : null}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => close(false)}>
                  <X /> Cancel
                </Button>
                <Button
                  type="button"
                  disabled={reading || newRecords.length === 0}
                  onClick={importRows}
                >
                  <Upload /> Add{" "}
                  {newRecords.length > 0 ? newRecords.length + " transactions" : "transactions"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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

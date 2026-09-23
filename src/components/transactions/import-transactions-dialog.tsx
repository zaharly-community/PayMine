import * as React from "react";

import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
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
import { cn } from "cn";
import {
  type ImportedRecord,
  makeTransactionDuplicateKey,
  readTransactionImportFile,
} from "@/lib/transaction-import";

type ImportKind = "deposit" | "withdrawl";

type TransactionImportDialogProps<T extends Record<string, unknown>> = {
  kind: ImportKind;
  existingRows: T[];
  onImport: (rows: T[]) => void;
  buildRow: (record: ImportedRecord, index: number) => T;
  title: string;
};

export function TransactionImportDialog<T extends Record<string, unknown>>({
  kind,
  existingRows,
  onImport,
  buildRow,
  title,
}: TransactionImportDialogProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [records, setRecords] = React.useState<ImportedRecord[]>([]);
  const [duplicateIndexes, setDuplicateIndexes] = React.useState<Set<number>>(
    new Set(),
  );
  const [error, setError] = React.useState("");
  const [reading, setReading] = React.useState(false);

  const reset = () => {
    setFileName("");
    setRecords([]);
    setDuplicateIndexes(new Set());
    setError("");
    setReading(false);
  };

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) reset();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setReading(true);
    setError("");
    setFileName(file.name);

    try {
      const imported = await readTransactionImportFile(file);
      if (imported.length === 0) {
        throw new Error("The file is empty or has no data rows.");
      }

      const existingKeys = new Set(
        existingRows.map((row) =>
          makeTransactionDuplicateKey(row, kind),
        ),
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
      setError(
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

    const rows = newRecords.map((record, index) => buildRow(record, index));
    onImport(rows);
    close(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Upload /> Import
      </Button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import {title}</DialogTitle>
            <DialogDescription>
              Upload an Excel workbook (.xlsx), CSV, or TSV file. Duplicate
              transactions are detected automatically and skipped.
            </DialogDescription>
          </DialogHeader>

          <label
            htmlFor={`transaction-import-${kind}`}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
              "bg-muted/30 hover:bg-muted/50",
              reading && "pointer-events-none opacity-60",
            )}
          >
            <span className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background">
              <FileSpreadsheet className="size-5 text-muted-foreground" />
            </span>
            <span className="font-medium">Choose a file to import</span>
            <span className="mt-1 text-xs text-muted-foreground">
              {fileName || "Excel .xlsx, CSV, or TSV"}
            </span>
            <input
              id={`transaction-import-${kind}`}
              type="file"
              className="sr-only"
              accept=".xlsx,.xls,.csv,.tsv,text/csv,text/tab-separated-values"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {records.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <ImportMetric label="Rows found" value={records.length} />
                <ImportMetric
                  label="New rows"
                  value={newRecords.length}
                  positive
                />
                <ImportMetric
                  label="Duplicates"
                  value={duplicateIndexes.size}
                  warning={duplicateIndexes.size > 0}
                />
              </div>

              <div className="rounded-lg border">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <div className="text-sm font-medium">Duplicate check</div>
                  <div className="text-xs text-muted-foreground">
                    {duplicateIndexes.size > 0
                      ? "Duplicates will be skipped"
                      : "No duplicates detected"}
                  </div>
                </div>

                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/60 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Row</th>
                        <th className="px-3 py-2 font-medium">ID / Reference</th>
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
                            key={`row-${index}`}
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
                                record["Transaction ID"] ||
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
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Matching transaction IDs/references are treated as
                  duplicates. When no ID exists, the importer compares player,
                  email, date, method, and amount.
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
              <Upload />
              Import {newRecords.length > 0 ? `${newRecords.length} new` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImportMetric({
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

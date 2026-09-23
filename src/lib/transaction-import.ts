export type ImportedRecord = Record<string, string>;

const HEADER_ALIASES = {
  id: ["id", "transactionid", "depositid", "withdrawlid", "withdrawalid", "reference", "ref", "externalid"],
  name: ["name", "player", "playername", "username", "customer", "customername"],
  email: ["email", "playeremail", "customeremail"],
  date: ["date", "datetime", "createdat", "timestamp", "transactiondate"],
  method: ["paymentmethod", "withdrawlmethod", "withdrawalmethod", "method", "channel", "provider"],
  amount: ["amount", "value", "total", "transactionamount"],
  feePercent: ["feepercent", "commissionpercent", "feepercentage", "commissionpercentage"],
  feeAmount: ["feeamount", "commissionamount", "fees", "commission"],
  verificationStatus: ["verificationstatus", "verification", "reviewstatus"],
  depositStatus: ["depositstatus", "status"],
  withdrawlStatus: ["withdrawlstatus", "withdrawalstatus", "status"],
  processor: ["processedby", "processor", "operator", "handledby"],
} as const;

export function normalizeImportedHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function pickImportedField(
  row: Record<string, unknown>,
  aliases: readonly string[],
) {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const normalizedAlias = normalizeImportedHeader(alias);
    const entry = entries.find(
      ([key]) => normalizeImportedHeader(key) === normalizedAlias,
    );

    if (entry && String(entry[1] ?? "").trim()) {
      return String(entry[1]).trim();
    }
  }

  return "";
}

export function importedNumber(value: string) {
  if (!value) return 0;
  const cleaned = value
    .replace(/[^0-9.,-]/g, "")
    .replace(/,(?=\\d{3}(?:\\D|$))/g, "");

  const parsed = Number.parseFloat(cleaned.replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function importedDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const serial = Number(trimmed);
  if (Number.isFinite(serial) && serial > 1 && serial < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })
      .format(date)
      .replace(",", "");
  }

  return trimmed;
}

export function makeTransactionDuplicateKey(
  row: Record<string, unknown>,
  kind: "deposit" | "withdrawl",
) {
  const id = pickImportedField(row, HEADER_ALIASES.id);
  const normalizedId = normalizeImportedHeader(id);

  if (normalizedId && !normalizedId.startsWith("imp")) {
    return `${kind}:id:${normalizedId}`;
  }

  const name = pickImportedField(row, HEADER_ALIASES.name);
  const email = pickImportedField(row, HEADER_ALIASES.email);
  const date = pickImportedField(row, HEADER_ALIASES.date);
  const method = pickImportedField(row, HEADER_ALIASES.method);
  const amount = importedNumber(pickImportedField(row, HEADER_ALIASES.amount));

  return [
    kind,
    "composite",
    normalizeImportedHeader(name),
    normalizeImportedHeader(email),
    normalizeImportedHeader(importedDate(date)),
    normalizeImportedHeader(method),
    amount.toFixed(2),
  ].join(":");
}

export function parseDelimitedText(text: string, delimiter = ",") {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const source = text.replace(/^\\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      cell = "";

      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function detectDelimiter(text: string) {
  const sample = text.split(/\\r?\\n/).find((line) => line.trim()) ?? "";
  const candidates = [",", "\\t", ";"];

  return candidates
    .map((candidate) => ({
      candidate,
      score: sample.split(candidate).length - 1,
    }))
    .sort((a, b) => b.score - a.score)[0]?.candidate ?? ",";
}

function rowsToRecords(rows: string[][]) {
  const headers = rows[0] ?? [];
  const safeHeaders = headers.map((header, index) =>
    header.trim() || `Column ${index + 1}`,
  );

  return rows.slice(1).map((values) =>
    safeHeaders.reduce<ImportedRecord>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {}),
  );
}

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  localOffset: number;
};

function readU16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readU32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function findEndOfCentralDirectory(view: DataView) {
  const start = Math.max(0, view.byteLength - 65557);

  for (let offset = view.byteLength - 22; offset >= start; offset -= 1) {
    if (readU32(view, offset) === 0x06054b50) return offset;
  }

  throw new Error("The Excel file is not a valid ZIP workbook.");
}

function readZipEntries(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const eocd = findEndOfCentralDirectory(view);
  const count = readU16(view, eocd + 10);
  const centralDirectoryOffset = readU32(view, eocd + 16);
  const entries: ZipEntry[] = [];

  let cursor = centralDirectoryOffset;

  for (let index = 0; index < count; index += 1) {
    if (readU32(view, cursor) !== 0x02014b50) {
      throw new Error("The Excel workbook contains an unsupported ZIP structure.");
    }

    const compression = readU16(view, cursor + 10);
    const compressedSize = readU32(view, cursor + 20);
    const nameLength = readU16(view, cursor + 28);
    const extraLength = readU16(view, cursor + 30);
    const commentLength = readU16(view, cursor + 32);
    const localOffset = readU32(view, cursor + 42);
    const nameBytes = new Uint8Array(buffer, cursor + 46, nameLength);
    const name = new TextDecoder().decode(nameBytes);

    entries.push({
      name,
      compression,
      compressedSize,
      localOffset,
    });

    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function readZipEntry(buffer: ArrayBuffer, entry: ZipEntry) {
  const view = new DataView(buffer);
  const offset = entry.localOffset;

  if (readU32(view, offset) !== 0x04034b50) {
    throw new Error("The Excel workbook contains an invalid local ZIP entry.");
  }

  const nameLength = readU16(view, offset + 26);
  const extraLength = readU16(view, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const compressed = new Uint8Array(buffer, start, entry.compressedSize);

  if (entry.compression === 0) return compressed;
  if (entry.compression !== 8) {
    throw new Error("This Excel workbook uses an unsupported compression method.");
  }

  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot read compressed Excel workbooks.");
  }

  const stream = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function xmlText(bytes: Uint8Array) {
  return new TextDecoder("utf-8").decode(bytes);
}

function findWorksheetPath(workbook: Document, relationships: Document) {
  const sheet = workbook.querySelector("sheet");
  const relationshipId = sheet?.getAttribute("r:id");

  if (!relationshipId) {
    throw new Error("The Excel workbook has no readable worksheet.");
  }

  const relationship = Array.from(
    relationships.getElementsByTagName("Relationship"),
  ).find((item) => item.getAttribute("Id") === relationshipId);

  const target = relationship?.getAttribute("Target");
  if (!target) {
    throw new Error("The Excel workbook worksheet relationship is invalid.");
  }

  return target.replace(/^\\//, "").startsWith("xl/")
    ? target.replace(/^\\//, "")
    : `xl/${target.replace(/^\\//, "")}`;
}

function cellColumnIndex(reference: string) {
  const match = reference.match(/[A-Z]+/i);
  if (!match) return 0;

  return match[0]
    .toUpperCase()
    .split("")
    .reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function sharedStringValue(item: Element) {
  return Array.from(item.getElementsByTagName("t"))
    .map((text) => text.textContent ?? "")
    .join("");
}

function worksheetRecords(document: Document, sharedStrings: string[]) {
  return Array.from(document.getElementsByTagName("row"))
    .map((row) => {
      const values: string[] = [];

      for (const cell of Array.from(row.getElementsByTagName("c"))) {
        const reference = cell.getAttribute("r") ?? "";
        const column = cellColumnIndex(reference);
        const type = cell.getAttribute("t");
        const value = cell.getElementsByTagName("v")[0]?.textContent ?? "";

        let resolved = value;

        if (type === "s") {
          resolved = sharedStrings[Number(value)] ?? "";
        } else if (type === "inlineStr") {
          resolved = sharedStringValue(cell);
        }

        values[column] = resolved;
      }

      return values.map((value) => value ?? "");
    })
    .filter((values) => values.some((value) => value.trim().length > 0));
}

async function parseXlsx(buffer: ArrayBuffer) {
  const entries = readZipEntries(buffer);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));

  const workbookEntry = byName.get("xl/workbook.xml");
  const relationshipsEntry = byName.get("xl/_rels/workbook.xml.rels");

  if (!workbookEntry || !relationshipsEntry) {
    throw new Error("This file is not a standard .xlsx workbook.");
  }

  const workbook = new DOMParser().parseFromString(
    xmlText(await readZipEntry(buffer, workbookEntry)),
    "application/xml",
  );
  const relationships = new DOMParser().parseFromString(
    xmlText(await readZipEntry(buffer, relationshipsEntry)),
    "application/xml",
  );

  const worksheetPath = findWorksheetPath(workbook, relationships);
  const worksheetEntry = byName.get(worksheetPath);

  if (!worksheetEntry) {
    throw new Error("The first worksheet could not be read.");
  }

  const sharedStringsEntry = byName.get("xl/sharedStrings.xml");
  const sharedStrings = sharedStringsEntry
    ? Array.from(
        new DOMParser()
          .parseFromString(
            xmlText(await readZipEntry(buffer, sharedStringsEntry)),
            "application/xml",
          )
          .getElementsByTagName("si"),
      ).map(sharedStringValue)
    : [];

  const worksheet = new DOMParser().parseFromString(
    xmlText(await readZipEntry(buffer, worksheetEntry)),
    "application/xml",
  );

  return rowsToRecords(worksheetRecords(worksheet, sharedStrings));
}

export async function readTransactionImportFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || extension === "tsv") {
    const text = await file.text();
    return rowsToRecords(
      parseDelimitedText(text, extension === "tsv" ? "\\t" : detectDelimiter(text)),
    );
  }

  if (extension === "xlsx") {
    return parseXlsx(await file.arrayBuffer());
  }

  if (extension === "xls") {
    throw new Error(
      "Legacy .xls files are not supported in-browser. Save the sheet as .xlsx or CSV and import it again.",
    );
  }

  throw new Error("Choose an Excel .xlsx file, CSV, or TSV file.");
}

export { HEADER_ALIASES };

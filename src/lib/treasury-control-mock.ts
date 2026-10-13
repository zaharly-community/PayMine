export type TreasuryAccount = {
  id: string;
  internalId: string;
  name: string;
  provider: string;
  maskedReference: string;
  currency: "TND";
  openingBalance: number;
  deposits: number;
  withdrawals: number;
  providerFees: number;
  adjustments: number;
  expectedBalance: number;
  actualBalance: number;
  supervisors: string[];
  lastVerified: string;
};

export type LedgerEntry = {
  id: string;
  reference: string;
  date: string;
  accountId: string;
  accountName: string;
  kind: string;
  amount: number;
  direction: "In" | "Out" | "Neutral";
  debitAccount: string;
  creditAccount: string;
  actor: string;
  shiftId: string;
  evidence: "Verified" | "Attached" | "Missing";
  state: "Posted" | "Pending";
  note: string;
};

export type ShiftStatus = "Open" | "Closed · matched" | "Variance found" | "Awaiting review";

export type TreasuryShift = {
  id: string;
  accountId: string;
  accountName: string;
  provider: string;
  supervisor: string;
  start: string;
  end: string | null;
  openingBalance: number;
  expectedBalance: number;
  actualBalance: number | null;
  transactionCount: number;
  status: ShiftStatus;
  reviewer: string;
  note: string;
};

export type HandoverStatus = "Accepted" | "Disputed" | "Pending confirmation" | "Escalated";

export type TreasuryHandover = {
  id: string;
  accountId: string;
  accountName: string;
  outgoing: string;
  incoming: string;
  timestamp: string;
  expectedBalance: number;
  receivedBalance: number | null;
  variance: number | null;
  status: HandoverStatus;
  evidence: string;
  note: string;
};

export type IncidentStatus = "Open" | "Investigating" | "Awaiting evidence" | "Resolved · approved";

export type TreasuryIncident = {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  shiftId: string;
  handoverId: string;
  supervisor: string;
  reviewer: string;
  variance: number;
  severity: "Critical" | "High" | "Medium";
  status: IncidentStatus;
  category: string;
  summary: string;
  evidenceCount: number;
  lastAction: string;
};

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Evidence requested";

export type TreasuryApproval = {
  id: string;
  createdAt: string;
  accountId: string;
  accountName: string;
  kind: string;
  amount: number;
  requester: string;
  approver: string;
  reason: string;
  evidenceCount: number;
  status: ApprovalStatus;
  risk: "High" | "Medium" | "Low";
};

export const treasuryAccounts: TreasuryAccount[] = [
  {
    id: "ACCT-TN-002",
    internalId: "ACC-001",
    name: "D17 Primary",
    provider: "D17",
    maskedReference: "•••• 4589",
    currency: "TND",
    openingBalance: 10000,
    deposits: 4000,
    withdrawals: 1180,
    providerFees: 40,
    adjustments: 0,
    expectedBalance: 12780,
    actualBalance: 12694,
    supervisors: ["Sami Ben Salah", "Koray Okumus"],
    lastVerified: "28 Sep 2026, 16:04",
  },
  {
    id: "ACCT-TN-001",
    internalId: "ACC-002",
    name: "Flouci Clearing",
    provider: "Flouci",
    maskedReference: "•••• 2201",
    currency: "TND",
    openingBalance: 10000,
    deposits: 10000,
    withdrawals: 1500,
    providerFees: 80,
    adjustments: 0,
    expectedBalance: 18420,
    actualBalance: 18420,
    supervisors: ["Youssef Trabelsi", "Koray Okumus"],
    lastVerified: "28 Sep 2026, 15:58",
  },
  {
    id: "ACCT-TN-003",
    internalId: "ACC-003",
    name: "Kashy Reserve",
    provider: "Kashy",
    maskedReference: "•••• 9007",
    currency: "TND",
    openingBalance: 5000,
    deposits: 3000,
    withdrawals: 500,
    providerFees: 90,
    adjustments: 0,
    expectedBalance: 7410,
    actualBalance: 7410,
    supervisors: ["Sami Ben Salah", "Youssef Trabelsi"],
    lastVerified: "28 Sep 2026, 15:40",
  },
  {
    id: "ACCT-TT-004",
    internalId: "ACC-004",
    name: "Tunisie Telecom Float",
    provider: "Tunisie Telecom",
    maskedReference: "•••• 1004",
    currency: "TND",
    openingBalance: 8000,
    deposits: 2000,
    withdrawals: 350,
    providerFees: 20,
    adjustments: 0,
    expectedBalance: 9630,
    actualBalance: 9712,
    supervisors: ["Nicolas Martin"],
    lastVerified: "27 Sep 2026, 23:59",
  },
  {
    id: "ACCT-TN-005",
    internalId: "ACC-005",
    name: "Ooredoo Float",
    provider: "Ooredoo",
    maskedReference: "•••• 0505",
    currency: "TND",
    openingBalance: 4000,
    deposits: 1500,
    withdrawals: 250,
    providerFees: 40,
    adjustments: 0,
    expectedBalance: 5210,
    actualBalance: 5190,
    supervisors: ["Nicolas Martin", "Sami Ben Salah"],
    lastVerified: "27 Sep 2026, 22:18",
  },
  {
    id: "ACCT-TN-006",
    internalId: "ACC-006",
    name: "Orange Float",
    provider: "Orange",
    maskedReference: "•••• 6006",
    currency: "TND",
    openingBalance: 9000,
    deposits: 3000,
    withdrawals: 500,
    providerFees: 160,
    adjustments: 0,
    expectedBalance: 11340,
    actualBalance: 11340,
    supervisors: ["Koray Okumus"],
    lastVerified: "27 Sep 2026, 23:42",
  },
];

export const initialLedgerEntries: LedgerEntry[] = [
  { id: "LED-260928-001", reference: "OPEN-SHF-019", date: "28 Sep 2026, 08:00", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Opening balance", amount: 10000, direction: "Neutral", debitAccount: "Payment account · D17", creditAccount: "Opening balance equity", actor: "System", shiftId: "SHF-260928-019", evidence: "Verified", state: "Posted", note: "Opening balance accepted at shift start" },
  { id: "LED-260928-002", reference: "DEP-02026022", date: "28 Sep 2026, 09:14", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Deposit collection", amount: 4000, direction: "In", debitAccount: "Payment account · D17", creditAccount: "Player funds clearing", actor: "Koray Okumus", shiftId: "SHF-260928-019", evidence: "Attached", state: "Posted", note: "Batch of approved deposits" },
  { id: "LED-260928-003", reference: "WDR-260928-104", date: "28 Sep 2026, 11:42", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Withdrawal payout", amount: 1180, direction: "Out", debitAccount: "Player withdrawal payable", creditAccount: "Payment account · D17", actor: "Sami Ben Salah", shiftId: "SHF-260928-019", evidence: "Attached", state: "Posted", note: "Approved payout batch" },
  { id: "LED-260928-004", reference: "FEE-260928-007", date: "28 Sep 2026, 12:05", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Provider fee", amount: 40, direction: "Out", debitAccount: "Provider fee expense", creditAccount: "Payment account · D17", actor: "Maya Chen", shiftId: "SHF-260928-019", evidence: "Verified", state: "Posted", note: "Approved fee with attached evidence" },
  { id: "LED-260928-005", reference: "DEP-02026025", date: "28 Sep 2026, 13:24", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", kind: "Deposit collection", amount: 10000, direction: "In", debitAccount: "Payment account · Flouci", creditAccount: "Player funds clearing", actor: "Youssef Trabelsi", shiftId: "SHF-260928-018", evidence: "Attached", state: "Posted", note: "Approved deposit batch" },
  { id: "LED-260928-006", reference: "WDR-260928-098", date: "28 Sep 2026, 14:02", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", kind: "Withdrawal payout", amount: 1500, direction: "Out", debitAccount: "Player withdrawal payable", creditAccount: "Payment account · Flouci", actor: "Koray Okumus", shiftId: "SHF-260928-018", evidence: "Attached", state: "Posted", note: "Withdrawal batch confirmed" },
  { id: "LED-260928-007", reference: "FEE-260928-009", date: "28 Sep 2026, 14:05", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", kind: "Provider fee", amount: 80, direction: "Out", debitAccount: "Provider fee expense", creditAccount: "Payment account · Flouci", actor: "Maya Chen", shiftId: "SHF-260928-018", evidence: "Verified", state: "Posted", note: "Approved provider cost" },
  { id: "LED-260928-008", reference: "REQ-APR-006", date: "28 Sep 2026, 16:12", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Requested fee reclassification", amount: 86, direction: "Out", debitAccount: "Unapproved adjustment · not posted", creditAccount: "Not posted", actor: "Sami Ben Salah", shiftId: "SHF-260928-019", evidence: "Missing", state: "Pending", note: "Request to classify the unexplained variance as a provider fee; evidence missing" },
  { id: "LED-260928-009", reference: "ADJ-260927-003", date: "27 Sep 2026, 23:58", accountId: "ACCT-TN-005", accountName: "Ooredoo Float", kind: "Reconciliation variance", amount: 20, direction: "Out", debitAccount: "Unresolved variance · not posted", creditAccount: "Not posted", actor: "System", shiftId: "SHF-260927-017", evidence: "Missing", state: "Pending", note: "Open variance; adjustment prohibited until investigation" },
];

export const initialShifts: TreasuryShift[] = [
  { id: "SHF-260928-019", accountId: "ACCT-TN-002", accountName: "D17 Primary", provider: "D17", supervisor: "Sami Ben Salah", start: "28 Sep 2026, 08:00", end: "28 Sep 2026, 16:00", openingBalance: 10000, expectedBalance: 12780, actualBalance: 12694, transactionCount: 142, status: "Variance found", reviewer: "Maya Chen", note: "Closing balance is short by 86 TND; review requested" },
  { id: "SHF-260928-018", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", provider: "Flouci", supervisor: "Koray Okumus", start: "28 Sep 2026, 08:00", end: "28 Sep 2026, 16:00", openingBalance: 10000, expectedBalance: 18420, actualBalance: 18420, transactionCount: 87, status: "Closed · matched", reviewer: "Maya Chen", note: "Closing evidence reviewed and matched" },
  { id: "SHF-260928-021", accountId: "ACCT-TN-004", accountName: "E-Dinar Treasury", provider: "e-Dinar", supervisor: "Nicolas Martin", start: "28 Sep 2026, 16:00", end: null, openingBalance: 61450, expectedBalance: 61450, actualBalance: null, transactionCount: 42, status: "Open", reviewer: "Unassigned", note: "Live shift; closing balance not submitted yet" },
  { id: "SHF-260927-017", accountId: "ACCT-TN-003", accountName: "Kashy Reserve", provider: "Kashy", supervisor: "Youssef Trabelsi", start: "27 Sep 2026, 16:00", end: "28 Sep 2026, 00:00", openingBalance: 5000, expectedBalance: 7410, actualBalance: 7410, transactionCount: 61, status: "Closed · matched", reviewer: "Maya Chen", note: "Handover acknowledged by incoming supervisor" },
];

export const initialHandovers: TreasuryHandover[] = [
  { id: "HDV-260928-008", accountId: "ACCT-TN-002", accountName: "D17 Primary", outgoing: "Koray Okumus", incoming: "Sami Ben Salah", timestamp: "28 Sep 2026, 16:00", expectedBalance: 12780, receivedBalance: 12694, variance: -86, status: "Disputed", evidence: "Outgoing count recorded · incoming confirmation differs", note: "Recipient reported 86 TND less than the expected balance" },
  { id: "HDV-260928-007", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", outgoing: "Youssef Trabelsi", incoming: "Koray Okumus", timestamp: "28 Sep 2026, 08:00", expectedBalance: 18420, receivedBalance: 18420, variance: 0, status: "Accepted", evidence: "Both confirmations present", note: "Opening and receiving balances match" },
  { id: "HDV-260927-006", accountId: "ACCT-TN-003", accountName: "Kashy Reserve", outgoing: "Sami Ben Salah", incoming: "Youssef Trabelsi", timestamp: "27 Sep 2026, 16:00", expectedBalance: 7410, receivedBalance: 7410, variance: 0, status: "Accepted", evidence: "Dual confirmation recorded", note: "No variance at handover" },
  { id: "HDV-260928-009", accountId: "ACCT-TN-004", accountName: "E-Dinar Treasury", outgoing: "—", incoming: "Nicolas Martin", timestamp: "28 Sep 2026, 16:00", expectedBalance: 61450, receivedBalance: null, variance: null, status: "Pending confirmation", evidence: "Recipient count not submitted", note: "Awaiting opening balance confirmation" },
];

export const initialIncidents: TreasuryIncident[] = [
  { id: "INC-260928-014", date: "28 Sep 2026, 16:04", accountId: "ACCT-TN-002", accountName: "D17 Primary", shiftId: "SHF-260928-019", handoverId: "HDV-260928-008", supervisor: "Sami Ben Salah", reviewer: "Maya Chen", variance: -86, severity: "High", status: "Investigating", category: "Unexplained debit / possible unrecorded fee", summary: "Expected balance is 12,780 TND, while the reported actual balance is 12,694 TND. A request to reclassify the difference as provider fees has no evidence attached.", evidenceCount: 1, lastAction: "Finance review opened at 16:12" },
  { id: "INC-260927-013", date: "27 Sep 2026, 23:59", accountId: "ACCT-TN-005", accountName: "Ooredoo Float", shiftId: "SHF-260927-017", handoverId: "—", supervisor: "Nicolas Martin", reviewer: "Maya Chen", variance: -20, severity: "Medium", status: "Awaiting evidence", category: "Unexplained balance shortage", summary: "The closing amount is 20 TND below expected. No provider-fee receipt or approved payout currently explains this variance.", evidenceCount: 0, lastAction: "Evidence requested from account supervisor" },
  { id: "INC-260927-012", date: "27 Sep 2026, 23:59", accountId: "ACCT-TT-004", accountName: "Tunisie Telecom Float", shiftId: "SHF-260927-016", handoverId: "—", supervisor: "Nicolas Martin", reviewer: "Maya Chen", variance: 82, severity: "Low", status: "Open", category: "Unexpected balance surplus", summary: "Reported balance is 82 TND higher than the ledger. Possible settlement timing difference; hold any adjustment until the source is confirmed.", evidenceCount: 1, lastAction: "Incident created automatically by reconciliation" },
];

export const initialApprovals: TreasuryApproval[] = [
  { id: "APR-260928-006", createdAt: "28 Sep 2026, 16:12", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Provider-fee reclassification", amount: 86, requester: "Sami Ben Salah", approver: "Maya Chen", reason: "Classify the unexplained shortage as provider fee", evidenceCount: 0, status: "Pending", risk: "High" },
  { id: "APR-260928-005", createdAt: "28 Sep 2026, 15:10", accountId: "ACCT-TN-001", accountName: "Flouci Clearing", kind: "Customer refund", amount: 35, requester: "Koray Okumus", approver: "Maya Chen", reason: "Duplicate player deposit; receipt and original transaction attached", evidenceCount: 2, status: "Pending", risk: "Medium" },
  { id: "APR-260928-004", createdAt: "28 Sep 2026, 14:44", accountId: "ACCT-TN-003", accountName: "Kashy Reserve", kind: "Provider-fee adjustment", amount: 12.5, requester: "Youssef Trabelsi", approver: "Maya Chen", reason: "Monthly fee correction supported by provider statement", evidenceCount: 1, status: "Pending", risk: "Low" },
  { id: "APR-260928-003", createdAt: "28 Sep 2026, 13:20", accountId: "ACCT-TN-002", accountName: "D17 Primary", kind: "Manual balance adjustment", amount: 120, requester: "Sami Ben Salah", approver: "Maya Chen", reason: "Correct opening balance; requires dual review and source evidence", evidenceCount: 0, status: "Evidence requested", risk: "High" },
];

export function formatTnd(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TND";
}

export function signedTnd(value: number) {
  return (value > 0 ? "+" : value < 0 ? "−" : "") + formatTnd(Math.abs(value));
}

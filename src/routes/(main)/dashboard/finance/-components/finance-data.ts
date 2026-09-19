export type FinanceReportKey =
  | "financial-performance"
  | "provider-performance"
  | "distributor-performance"
  | "fees-compensation"
  | "settlement-report"
  | "reconciliation-report";

export const financeReportCards = [
  { key: "financial-performance" as const, title: "Financial Performance", description: "Volume, net flow, fees and revenue trends across the platform." },
  { key: "provider-performance" as const, title: "Provider Performance", description: "Compare provider accounts, processing activity and operational quality." },
  { key: "distributor-performance" as const, title: "Distributor Performance", description: "Review Agent and Supervisor processing volume and compensation." },
  { key: "fees-compensation" as const, title: "Fees & Compensation", description: "Track provider fees and distributor compensation by model and method." },
  { key: "settlement-report" as const, title: "Settlement Report", description: "Review historical treasury settlements and their approval status." },
  { key: "reconciliation-report" as const, title: "Reconciliation Report", description: "Review expected versus provider balances across reconciliation cycles." },
];

export const financeTransactions = [
  { id: "DEP-02026025", type: "Deposit", player: "Nico Arendt", distributor: "Agent K-104", provider: "Kashy", amount: 89.99, fee: 0.90, compensation: 0.45, status: "Completed", date: "18 Sep 2026, 09:42" },
  { id: "WDL-02026024", type: "Withdrawal", player: "Lena Owens", distributor: "Supervisor S-203", provider: "D17", amount: 420, fee: 4.2, compensation: 2.1, status: "Processing", date: "18 Sep 2026, 09:37" },
  { id: "DEP-02026024", type: "Deposit", player: "Mia Romberg", distributor: "Supervisor S-184", provider: "D17", amount: 125.5, fee: 1.26, compensation: 0.63, status: "Pending", date: "18 Sep 2026, 08:51" },
  { id: "WDL-02026022", type: "Withdrawal", player: "Noah Pierre", distributor: "Agent A-118", provider: "Flouci", amount: 250, fee: 2.5, compensation: 1.25, status: "Completed", date: "18 Sep 2026, 08:14" },
  { id: "DEP-02026021", type: "Deposit", player: "Sienna Hewitt", distributor: "Supervisor S-221", provider: "Kashy", amount: 763.99, fee: 7.64, compensation: 3.82, status: "Completed", date: "18 Sep 2026, 07:43" },
  { id: "WDL-02026021", type: "Withdrawal", player: "Drew Cano", distributor: "Supervisor S-203", provider: "Visa", amount: 655.07, fee: 6.55, compensation: 3.28, status: "Completed", date: "18 Sep 2026, 06:58" },
  { id: "DEP-02026020", type: "Deposit", player: "Olivia Rhye", distributor: "Agent A-104", provider: "Flouci", amount: 185.23, fee: 1.85, compensation: 0.93, status: "Completed", date: "18 Sep 2026, 06:31" },
  { id: "DEP-02026019", type: "Deposit", player: "Ariana Decker", distributor: "Supervisor S-184", provider: "D17", amount: 48.17, fee: 0.48, compensation: 0.24, status: "Processing", date: "18 Sep 2026, 05:49" },
];

export const treasuryAccounts = [
  { provider: "Flouci", account: "FL-PRIMARY", expected: 18420, actual: 18420, reserved: 820, available: 17600, variance: 0, status: "Reconciled" },
  { provider: "D17", account: "D17-SHARED-01", expected: 12950, actual: 11875, reserved: 950, available: 12000, variance: -1075, status: "Mismatch" },
  { provider: "Kashy", account: "KSH-OPS-01", expected: 8640, actual: 8640, reserved: 640, available: 8000, variance: 0, status: "Reconciled" },
  { provider: "Visa", account: "VISA-OPS-02", expected: 42300, actual: 41950, reserved: 2300, available: 40000, variance: -350, status: "Mismatch" },
  { provider: "Mastercard", account: "MC-OPS-01", expected: 27580, actual: 27580, reserved: 1180, available: 26400, variance: 0, status: "Reconciled" },
  { provider: "e-Dinar", account: "ED-PRIMARY", expected: 6750, actual: 6750, reserved: 450, available: 6300, variance: 0, status: "Reconciled" },
];

export const settlementRows = [
  { id: "SET-0018", provider: "Flouci", amount: 2500, before: 20100, after: 17600, status: "Completed", initiatedBy: "Finance Admin", date: "17 Sep 2026, 18:00" },
  { id: "SET-0017", provider: "Mastercard", amount: 1800, before: 29380, after: 27580, status: "Completed", initiatedBy: "Finance Admin", date: "17 Sep 2026, 16:20" },
  { id: "SET-0016", provider: "Kashy", amount: 1200, before: 9840, after: 8640, status: "Completed", initiatedBy: "Finance Admin", date: "17 Sep 2026, 17:30" },
  { id: "SET-0015", provider: "D17", amount: 0, before: 12950, after: 12950, status: "Blocked", initiatedBy: "System", date: "18 Sep 2026, 16:42" },
  { id: "SET-0014", provider: "Visa", amount: 0, before: 42300, after: 42300, status: "Blocked", initiatedBy: "System", date: "18 Sep 2026, 16:21" },
];

export const reportData = {
  "financial-performance": {
    title: "Financial Performance",
    description: "Platform-level performance without duplicating the transaction ledger.",
    metrics: [["Gross volume", "$428,640", "+12.4%"], ["Net flow", "$86,920", "+8.1%"], ["Total fees", "$5,842", "+6.9%"], ["Net revenue", "$3,916", "+5.8%"]],
    headers: ["Period", "Deposit volume", "Withdrawal volume", "Fees", "Net flow"],
    rows: [
      ["18 Sep", "$31,842", "$24,930", "$742", "$6,912"],
      ["17 Sep", "$28,420", "$25,180", "$701", "$3,240"],
      ["16 Sep", "$26,390", "$22,810", "$654", "$3,580"],
      ["15 Sep", "$25,780", "$21,940", "$622", "$3,840"],
      ["14 Sep", "$23,920", "$20,510", "$588", "$3,410"],
      ["13 Sep", "$22,610", "$19,804", "$557", "$2,806"],
    ],
  },
  "provider-performance": {
    title: "Provider Performance",
    description: "Provider-level operational and financial performance.",
    metrics: [["Provider volume", "$428,640", "6 providers"], ["Successful operations", "97.4%", "+0.8%"], ["Provider fees", "$2,914", "+4.6%"], ["Average processing", "4m 18s", "-12s"]],
    headers: ["Provider", "Volume", "Operations", "Success rate", "Fees", "Avg. processing"],
    rows: [
      ["Flouci", "$98,420", "1,842", "98.3%", "$842", "3m 41s"],
      ["D17", "$92,610", "1,625", "96.1%", "$731", "5m 08s"],
      ["Kashy", "$84,330", "1,401", "97.8%", "$648", "4m 02s"],
      ["Visa", "$78,920", "1,224", "96.9%", "$421", "4m 27s"],
      ["Mastercard", "$51,240", "892", "98.8%", "$183", "3m 14s"],
      ["e-Dinar", "$23,120", "404", "97.6%", "$89", "4m 11s"],
    ],
  },
  "distributor-performance": {
    title: "Distributor Performance",
    description: "Agent and Supervisor processing contribution without duplicating distributor management.",
    metrics: [["Processed volume", "$412,380", "+9.2%"], ["Active distributors", "42", "31 Agents · 11 Supervisors"], ["Compensation", "$1,926", "+5.1%"], ["Success rate", "98.1%", "+0.6%"]],
    headers: ["Distributor", "Type", "Volume", "Operations", "Compensation", "Success"],
    rows: [
      ["Sami Ben Salah", "Supervisor", "$64,420", "312", "$322", "98.7%"],
      ["Koray Okumus", "Agent", "$58,610", "428", "$286", "98.4%"],
      ["Nicolas Martin", "Supervisor", "$55,280", "261", "$276", "97.9%"],
      ["Youssef Trabelsi", "Agent", "$49,730", "392", "$249", "98.2%"],
      ["Amina Jaziri", "Supervisor", "$44,980", "208", "$225", "97.5%"],
      ["Mehdi Kacem", "Agent", "$38,620", "315", "$193", "98.0%"],
    ],
  },
  "fees-compensation": {
    title: "Fees & Compensation",
    description: "Fee economics across providers and distributor compensation models.",
    metrics: [["Gross fees", "$5,842", "+6.9%"], ["Distributor compensation", "$1,926", "+5.1%"], ["Provider fees", "$2,914", "+4.6%"], ["Net retained", "$1,002", "+8.7%"]],
    headers: ["Source", "Gross fees", "Compensation", "Provider cost", "Net retained"],
    rows: [
      ["Flouci", "$1,210", "$390", "$842", "-$22"],
      ["D17", "$1,148", "$392", "$731", "$25"],
      ["Kashy", "$1,026", "$376", "$648", "$2"],
      ["Visa", "$891", "$337", "$421", "$133"],
      ["Mastercard", "$978", "$288", "$183", "$507"],
      ["e-Dinar", "$589", "$143", "$89", "$357"],
    ],
  },
  "settlement-report": {
    title: "Settlement Report",
    description: "Historical settlement activity; current provider balances remain in Treasury.",
    metrics: [["Settled volume", "$14,280", "Last 30 days"], ["Completed settlements", "18", "+3"], ["Blocked settlements", "2", "Reconciliation"], ["Average settlement", "$793", "Per completed"]],
    headers: ["Settlement", "Provider", "Amount", "Status", "Initiated by", "Date"],
    rows: settlementRows.map((row) => [row.id, row.provider, row.amount ? "$" + row.amount.toLocaleString() : "—", row.status, row.initiatedBy, row.date]),
  },
  "reconciliation-report": {
    title: "Reconciliation Report",
    description: "Historical expected-versus-provider balance checks; investigation belongs to the future unified Issues system.",
    metrics: [["Accounts checked", "184", "+14"], ["Reconciled", "179", "97.3%"], ["Mismatches", "5", "2.7%"], ["Open variance", "$1,425", "D17 + Visa"]],
    headers: ["Check", "Provider", "Expected", "Actual", "Variance", "Status"],
    rows: [
      ["REC-2026-0918-01", "D17", "$12,950", "$11,875", "-$1,075", "Mismatch"],
      ["REC-2026-0918-02", "Visa", "$42,300", "$41,950", "-$350", "Mismatch"],
      ["REC-2026-0918-03", "Flouci", "$18,420", "$18,420", "$0", "Reconciled"],
      ["REC-2026-0918-04", "Kashy", "$8,640", "$8,640", "$0", "Reconciled"],
      ["REC-2026-0918-05", "Mastercard", "$27,580", "$27,580", "$0", "Reconciled"],
      ["REC-2026-0918-06", "e-Dinar", "$6,750", "$6,750", "$0", "Reconciled"],
    ],
  },
} satisfies Record<FinanceReportKey, { title: string; description: string; metrics: string[][]; headers: string[]; rows: string[][] }>;

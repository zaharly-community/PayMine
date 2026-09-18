export type DistributorType = "Agent" | "Supervisor";
export type DistributorProgramMode = "Program" | "Custom Program";
export type DistributorStatus = "Active" | "Pending invite" | "Suspended" | "Deactivated";
export type ProcessingScope = "Deposits" | "Withdrawals" | "Deposits & Withdrawals";
export type MethodLimitMode = "Requests" | "Amount" | "Requests & Amount";
export type PaymentMethodCategory = "Wallet" | "Top-ups Cards";
export type DistributorWalletModel = "Prefunded fee wallet" | "Transaction ledger";

export type DistributorWalletAuditEntry = {
  id: string;
  action: "Credit" | "Debit";
  amount: number;
  reason: string;
  createdAt: string;
};


export type TreasuryAccount = {
  id: string;
  name: string;
  category: PaymentMethodCategory;
  currency: string;
  balance: number;
  shared: boolean;
};

export const treasuryAccounts: TreasuryAccount[] = [
  { id: "treasury-flouci", name: "Flouci", category: "Wallet", currency: "USD", balance: 18420, shared: true },
  { id: "treasury-d17", name: "D17", category: "Wallet", currency: "USD", balance: 12950, shared: true },
  { id: "treasury-kashy", name: "Kashy", category: "Wallet", currency: "USD", balance: 8640, shared: true },
  { id: "treasury-visa", name: "Visa", category: "Top-ups Cards", currency: "USD", balance: 42300, shared: true },
  { id: "treasury-mastercard", name: "Mastercard", category: "Top-ups Cards", currency: "USD", balance: 27580, shared: true },
  { id: "treasury-e-dinar", name: "e-Dinar", category: "Top-ups Cards", currency: "USD", balance: 6750, shared: true },
];

export const ownerPaymentMethods = treasuryAccounts.map(({ name, category }) => ({ name, category }));
export type CompensationMode = "Fixed" | "Commission" | "Per completed operation";
export type FixedFeePeriod = "Daily" | "Monthly";
export type CommissionTransactions = "Deposits" | "Withdrawals" | "Deposits & Withdrawals";

export type DistributorPaymentMethod = {
  id: string;
  name: string;
  category: PaymentMethodCategory;
  enabled: boolean;
  limitMode: MethodLimitMode;
  requestLimit?: number;
  amountLimit?: number;
  amountLimitPeriod?: FixedFeePeriod;
  depositCommissionRate?: number;
  withdrawalCommissionRate?: number;
  accessGranted?: boolean;
  providerAccountRef?: string;
};

export type DistributorProgram = {
  id: string;
  name: string;
  description: string;
  role: DistributorType;
  processingScope: ProcessingScope;
  feeMode: CompensationMode;
  feeSummary: string;
};

export type DistributorConfiguration = {
  programMode?: DistributorProgramMode;
  programId?: string;
  programName?: string;

  processingScope?: ProcessingScope;
  accountOpeningMethods?: string[];
  paymentMethods?: DistributorPaymentMethod[];
  defaultRequestLimit?: number;
  defaultAmountLimit?: number;
  defaultAmountLimitPeriod?: FixedFeePeriod;
  feeMode?: CompensationMode;
  fixedFeeAmount?: number;
  fixedFeePeriod?: FixedFeePeriod;
  commissionTransactions?: CommissionTransactions;
  defaultDepositCommissionRate?: number;
  defaultWithdrawalCommissionRate?: number;
  perCompletedOperationFee?: number;
};

export type DistributorRow = {
  avatarUrl?: string;
  verified?: boolean;
  username?: string;
  name: string;
  email: string;
  type: DistributorType;
  status: DistributorStatus;
  players: number;
  balance: number;
  joinedDate: string;
  lastActive: number;
  id: string;
  walletModel: DistributorWalletModel;
  walletAudit?: DistributorWalletAuditEntry[];
  configuration?: DistributorConfiguration;
};

const distributorSeedData: DistributorRow[] = [
  { name: "Ahmed Ben Salem", email: "ahmed.bensalem@paymine.tn", type: "Supervisor", status: "Active", players: 184, balance: 28450.75, joinedDate: "12 Jun 2024, 9:15 AM", lastActive: 2, id: "SUP-000184" },
  { name: "Yassine Trabelsi", email: "yassine.trabelsi@paymine.tn", type: "Agent", status: "Active", players: 76, balance: 12680.4, joinedDate: "18 Jun 2024, 11:20 AM", lastActive: 8, id: "AGT-000276" },
  { name: "Mohamed Gharbi", email: "mohamed.gharbi@paymine.tn", type: "Agent", status: "Active", players: 54, balance: 8425.25, joinedDate: "24 Jun 2024, 3:05 PM", lastActive: 15, id: "AGT-000291" },
  { name: "Sami Jaziri", email: "sami.jaziri@paymine.tn", type: "Supervisor", status: "Active", players: 231, balance: 35180.9, joinedDate: "02 Jul 2024, 10:40 AM", lastActive: 23, id: "SUP-000203" },
  { name: "Karim Ayari", email: "karim.ayari@paymine.tn", type: "Agent", status: "Pending invite", players: 0, balance: 0, joinedDate: "07 Jul 2024, 1:35 PM", lastActive: 90 * 24 * 60, id: "AGT-000308" },
  { name: "Wassim Kallel", email: "wassim.kallel@paymine.tn", type: "Agent", status: "Active", players: 91, balance: 15420.6, joinedDate: "14 Jul 2024, 8:55 AM", lastActive: 31, id: "AGT-000315" },
  { name: "Hatem Chaabane", email: "hatem.chaabane@paymine.tn", type: "Supervisor", status: "Active", players: 312, balance: 48750.35, joinedDate: "19 Jul 2024, 12:10 PM", lastActive: 46, id: "SUP-000221" },
  { name: "Nader Mejri", email: "nader.mejri@paymine.tn", type: "Agent", status: "Suspended", players: 43, balance: 5210.8, joinedDate: "26 Jul 2024, 4:25 PM", lastActive: 6 * 60, id: "AGT-000329" },
  { name: "Fares Haddad", email: "fares.haddad@paymine.tn", type: "Agent", status: "Active", players: 68, balance: 9360.15, joinedDate: "03 Aug 2024, 9:30 AM", lastActive: 61, id: "AGT-000341" },
  { name: "Anis Mansour", email: "anis.mansour@paymine.tn", type: "Supervisor", status: "Active", players: 205, balance: 31820.45, joinedDate: "09 Aug 2024, 2:50 PM", lastActive: 75, id: "SUP-000236" },
  { name: "Bilel Saidi", email: "bilel.saidi@paymine.tn", type: "Agent", status: "Deactivated", players: 37, balance: 1840.25, joinedDate: "15 Aug 2024, 11:15 AM", lastActive: 2 * 24 * 60, id: "AGT-000356" },
  { name: "Oussama Dridi", email: "oussama.dridi@paymine.tn", type: "Agent", status: "Active", players: 112, balance: 17925.7, joinedDate: "21 Aug 2024, 6:05 PM", lastActive: 91, id: "AGT-000367" },
  { name: "Malek Ben Amor", email: "malek.benamor@paymine.tn", type: "Supervisor", status: "Active", players: 278, balance: 42640.9, joinedDate: "28 Aug 2024, 10:05 AM", lastActive: 120, id: "SUP-000249" },
  { name: "Hamza Bouzid", email: "hamza.bouzid@paymine.tn", type: "Agent", status: "Pending invite", players: 0, balance: 0, joinedDate: "01 Sep 2024, 3:40 PM", lastActive: 14 * 24 * 60, id: "AGT-000381" },
  { name: "Rami Tlili", email: "rami.tlili@paymine.tn", type: "Agent", status: "Active", players: 84, balance: 11360.3, joinedDate: "05 Sep 2024, 7:45 PM", lastActive: 145, id: "AGT-000395" },
  { name: "Aymen Rekik", email: "aymen.rekik@paymine.tn", type: "Supervisor", status: "Active", players: 167, balance: 26210.65, joinedDate: "11 Sep 2024, 1:25 PM", lastActive: 180, id: "SUP-000258" },
  { name: "Chokri Ferjani", email: "chokri.ferjani@paymine.tn", type: "Agent", status: "Suspended", players: 29, balance: 3275.45, joinedDate: "16 Sep 2024, 9:10 AM", lastActive: 7 * 60, id: "AGT-000404" },
  { name: "Walid Ben Youssef", email: "walid.benyoussef@paymine.tn", type: "Agent", status: "Active", players: 73, balance: 10840.2, joinedDate: "22 Sep 2024, 5:15 PM", lastActive: 240, id: "AGT-000417" },
  { name: "Sofiane Khemiri", email: "sofiane.khemiri@paymine.tn", type: "Supervisor", status: "Active", players: 246, balance: 39125.55, joinedDate: "30 Sep 2024, 11:55 AM", lastActive: 310, id: "SUP-000271" },
  { name: "Marwen Sassi", email: "marwen.sassi@paymine.tn", type: "Agent", status: "Deactivated", players: 18, balance: 920.35, joinedDate: "04 Oct 2024, 2:30 PM", lastActive: 4 * 24 * 60, id: "AGT-000429" },
  { name: "Seif Eddine Nasri", email: "seif.nasri@paymine.tn", type: "Agent", status: "Active", players: 95, balance: 14880.75, joinedDate: "09 Oct 2024, 8:35 AM", lastActive: 380, id: "AGT-000438" },
  { name: "Mehdi Ayari", email: "mehdi.ayari@paymine.tn", type: "Supervisor", status: "Active", players: 194, balance: 29760.4, joinedDate: "15 Oct 2024, 4:10 PM", lastActive: 450, id: "SUP-000284" },
  { name: "Rayen Cherif", email: "rayen.cherif@paymine.tn", type: "Agent", status: "Pending invite", players: 0, balance: 0, joinedDate: "19 Oct 2024, 12:45 PM", lastActive: 21 * 24 * 60, id: "AGT-000451" },
  { name: "Tarek Baccouche", email: "tarek.baccouche@paymine.tn", type: "Agent", status: "Active", players: 61, balance: 7925.9, joinedDate: "24 Oct 2024, 6:20 PM", lastActive: 510, id: "AGT-000463" },
  { name: "Salah Jlassi", email: "salah.jlassi@paymine.tn", type: "Supervisor", status: "Active", players: 223, balance: 34550.1, joinedDate: "29 Oct 2024, 10:20 AM", lastActive: 600, id: "SUP-000296" },
];

const processorAvatarImages = [
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6dfc72b9-8c86-438a-aada-8d3530e13a68/d2c9cgs-69217879-a8d4-438a-b98d-baa29baf98d8.jpg/v1/fill/w_900,h_1126,q_75,strp/this_random_guy_by_inxonic_d2c9cgs-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZDJjOWNncy02OTIxNzg3OS1hOGQ0LTQzOGEtYjk4ZC1iYWEyOWJhZjk4ZDguanBnIiwiaGVpZ2h0IjoiPD0xMTI2Iiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiLCJvd20iOnsicGF0aCI6Ii93bS82ZGZjNzJiOS04Yzg2LTQzOGEtYWFkYS04ZDM1MzBlMTNhNjgvZ2V0Iiwib3BhY2l0eSI6OTV9fX0.oLUUOQ0Apg_6Gq1gPPuVu9DXt6494FP4rbUTeN4h-wA",
  "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
  "https://img.magnific.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHy922UMR9X9MNgNutdRRnbRe0eklCXLAe_nagnpquGQ&s",
] as const;

const verifiedDistributorNames = new Set([
  "Ahmed Ben Salem",
  "Yassine Trabelsi",
  "Sami Jaziri",
  "Hatem Chaabane",
  "Anis Mansour",
  "Oussama Dridi",
  "Aymen Rekik",
  "Sofiane Khemiri",
]);

function distributorUsername(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
}

export const distributors: DistributorRow[] = distributorSeedData.map((row, index) => ({
  ...row,
  username: row.username ?? distributorUsername(row.name),
  avatarUrl: row.avatarUrl ?? processorAvatarImages[index % processorAvatarImages.length],
  verified: verifiedDistributorNames.has(row.name),
  status: row.status === "Suspended" ? "Suspended" : "Active",
  walletModel: row.type === "Agent" ? "Prefunded fee wallet" : "Transaction ledger",
}));

const distributorTypes: DistributorType[] = ["Agent", "Supervisor"];
const statuses: DistributorStatus[] = ["Active", "Suspended"];

export const filters = {
  type: ["All", ...distributorTypes],
  status: ["All", ...statuses],
};

export const statusMeta: Record<DistributorStatus, { badgeClass: string; dotClass: string }> = {
  Active: {
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  "Pending invite": {
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  Suspended: {
    badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dotClass: "bg-orange-500",
  },
  Deactivated: {
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
};

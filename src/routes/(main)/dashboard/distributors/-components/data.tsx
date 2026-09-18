export type DistributorType = "Agent" | "Supervisor";
export type DistributorStatus = "Active" | "Pending invite" | "Suspended" | "Deactivated";
export type ProcessingScope = "Deposits" | "Deposits & Withdrawals";
export type MethodLimitMode = "Requests" | "Amount" | "Requests & Amount";
export type PaymentMethodCategory = "Wallet" | "Top-ups Cards";
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
  commissionRate?: number;
};

export type DistributorConfiguration = {
  processingScope?: ProcessingScope;
  paymentMethods?: DistributorPaymentMethod[];
  feeMode?: CompensationMode;
  fixedFeeAmount?: number;
  fixedFeePeriod?: FixedFeePeriod;
  commissionTransactions?: CommissionTransactions;
  defaultCommissionRate?: number;
  perCompletedOperationFee?: number;
};

export type DistributorRow = {
  name: string;
  email: string;
  type: DistributorType;
  status: DistributorStatus;
  players: number;
  balance: number;
  joinedDate: string;
  lastActive: number;
  id: string;
  configuration?: DistributorConfiguration;
};

export const distributors: DistributorRow[] = [
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

const distributorTypes: DistributorType[] = ["Agent", "Supervisor"];
const statuses: DistributorStatus[] = ["Active", "Pending invite", "Suspended", "Deactivated"];

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

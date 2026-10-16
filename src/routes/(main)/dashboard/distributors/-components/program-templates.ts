import { ownerPaymentMethods, type DistributorConfiguration, type DistributorProgram, type DistributorPaymentMethod, type FixedFeePeriod } from "./data";

export type ProgramTemplate = DistributorProgram & {
  configuration: Omit<DistributorConfiguration, "programMode" | "programId" | "programName">;
};

export const systemDefaults = {
  requestLimit: 50,
  amountLimit: 10000,
  amountLimitPeriod: "Daily" as FixedFeePeriod,
  depositCommissionRate: 5,
  withdrawalCommissionRate: 3,
  fixedFee: 25,
  fixedFeePeriod: "Monthly" as FixedFeePeriod,
  perCompletedOperationFee: 1.5,
};

function makeMethodId(name: string) {
  return "method-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function createSupervisorMethods(enabledNames: string[] = []): DistributorPaymentMethod[] {
  return ownerPaymentMethods.map((method) => ({
    id: makeMethodId(method.name),
    name: method.name,
    category: method.category,
    enabled: enabledNames.includes(method.name),
    accessGranted: enabledNames.includes(method.name),
    providerAccountRef: "treasury-" + method.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    limitMode: "Requests & Amount",
    requestLimit: systemDefaults.requestLimit,
    amountLimit: systemDefaults.amountLimit,
    amountLimitPeriod: systemDefaults.amountLimitPeriod,
    depositCommissionRate: systemDefaults.depositCommissionRate,
    withdrawalCommissionRate: systemDefaults.withdrawalCommissionRate,
  }));
}

export const defaultProgramTemplates: ProgramTemplate[] = [
  {
    id: "agent-standard",
    name: "Standard Agent",
    description: "Balanced limits and system commission defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Deposits & Withdrawals",
    feeMode: "Commission",
    feeSummary: "5% deposit · 3% withdrawal",
    configuration: {
      processingScope: "Deposits & Withdrawals",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Deposits & Withdrawals",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "agent-deposit-only",
    name: "Deposit Agent",
    description: "Deposit-only processing using the system defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Deposits",
    feeMode: "Commission",
    feeSummary: "5% deposit · withdrawals disabled",
    configuration: {
      processingScope: "Deposits",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Deposits",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 0,
    },
  },
  {
    id: "agent-withdrawal-only",
    name: "Withdrawal Agent",
    description: "Withdrawal-only processing using the system defaults. Payment methods remain Agent-owned.",
    role: "Agent",
    processingScope: "Withdrawals",
    feeMode: "Commission",
    feeSummary: "3% withdrawal · deposits disabled",
    configuration: {
      processingScope: "Withdrawals",
      accountOpeningMethods: ["Flouci", "D17"],
      defaultRequestLimit: 50,
      defaultAmountLimit: 10000,
      defaultAmountLimitPeriod: "Daily",
      feeMode: "Commission",
      commissionTransactions: "Withdrawals",
      defaultDepositCommissionRate: 0,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-standard",
    name: "Standard Supervisor",
    description: "Owner-provided payment methods with balanced processing permissions.",
    role: "Supervisor",
    processingScope: "Deposits & Withdrawals",
    feeMode: "Commission",
    feeSummary: "5% deposit · 3% withdrawal",
    configuration: {
      processingScope: "Deposits & Withdrawals",
      paymentMethods: createSupervisorMethods(ownerPaymentMethods.map((method) => method.name)),
      feeMode: "Commission",
      commissionTransactions: "Deposits & Withdrawals",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-withdrawal-only",
    name: "Withdrawal Supervisor",
    description: "Supervisor limited to withdrawal processing using owner-provided methods.",
    role: "Supervisor",
    processingScope: "Withdrawals",
    feeMode: "Commission",
    feeSummary: "3% withdrawal · deposits disabled",
    configuration: {
      processingScope: "Withdrawals",
      paymentMethods: createSupervisorMethods(ownerPaymentMethods.map((method) => method.name)),
      feeMode: "Commission",
      commissionTransactions: "Withdrawals",
      defaultDepositCommissionRate: 0,
      defaultWithdrawalCommissionRate: 3,
    },
  },
  {
    id: "supervisor-deposit-only",
    name: "Deposit Supervisor",
    description: "Supervisor limited to deposit processing using owner-provided methods.",
    role: "Supervisor",
    processingScope: "Deposits",
    feeMode: "Commission",
    feeSummary: "5% deposit · withdrawals disabled",
    configuration: {
      processingScope: "Deposits",
      paymentMethods: createSupervisorMethods(),
      feeMode: "Commission",
      commissionTransactions: "Deposits",
      defaultDepositCommissionRate: 5,
      defaultWithdrawalCommissionRate: 0,
    },
  },
];

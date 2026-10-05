import type { UserRole } from "@/stores/auth/auth-provider";

export const roleNavigation: Record<UserRole, Record<string, boolean>> = {
  "SaaS Owner": {
    dashboard: true,
    players: true,
    distributors: true,
    deposits: true,
    withdrawls: true,
    analytics: true,
    disagreements: true,
    transactions: true,
    settlements: true,
    reconciliation: true,
    "fees-revenue": true,
    settings: true,
    portal: true,
  },
  "Brand Admin": {
    dashboard: true,
    players: true,
    distributors: true,
    deposits: true,
    withdrawls: true,
    analytics: true,
    disagreements: true,
    transactions: true,
    settlements: true,
    reconciliation: true,
    "fees-revenue": true,
    settings: true,
    portal: true,
  },
  Supervisor: {
    dashboard: true,
    players: true,
    distributors: true,
    deposits: true,
    withdrawls: true,
    analytics: true,
    disagreements: true,
    transactions: true,
    settlements: true,
    reconciliation: false,
    "fees-revenue": false,
    settings: false,
    portal: false,
  },
  Agent: {
    dashboard: true,
    players: true,
    distributors: false,
    deposits: true,
    withdrawls: true,
    analytics: false,
    disagreements: true,
    transactions: true,
    settlements: false,
    reconciliation: false,
    "fees-revenue": false,
    settings: false,
    portal: false,
  },
  Assistant: {
    dashboard: true,
    players: true,
    distributors: true,
    deposits: true,
    withdrawls: false,
    analytics: false,
    disagreements: false,
    transactions: true,
    settlements: false,
    reconciliation: false,
    "fees-revenue": false,
    settings: false,
    portal: false,
  },
};

const routeKeys: Array<{ prefix: string; id: string }> = [
  { prefix: "/dashboard/players", id: "players" },
  { prefix: "/dashboard/distributors", id: "distributors" },
  { prefix: "/dashboard/deposits", id: "deposits" },
  { prefix: "/dashboard/withdrawls", id: "withdrawls" },
  { prefix: "/dashboard/analytics/disagreements", id: "disagreements" },
  { prefix: "/dashboard/analytics", id: "analytics" },
  { prefix: "/dashboard/transactions/settlements", id: "settlements" },
  { prefix: "/dashboard/transactions/reconciliation", id: "reconciliation" },
  { prefix: "/dashboard/transactions/fees-revenue", id: "fees-revenue" },
  { prefix: "/dashboard/transactions", id: "transactions" },
  { prefix: "/dashboard/settings", id: "settings" },
  { prefix: "/dashboard/portal", id: "portal" },
];

export function filterSidebarItemsForRole<T extends { id: string }>(
  groups: Array<{ id: number; label?: string; items: T[] }>,
  role: UserRole | null | undefined,
) {
  if (!role) {
    return [];
  }

  const access = roleNavigation[role];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => access[item.id] !== false),
    }))
    .filter((group) => group.items.length > 0);
}

export function isRoleAllowedPath(role: UserRole, path: string) {
  if (path === "/dashboard" || path === "/dashboard/") {
    return true;
  }

  const match = routeKeys.find(({ prefix }) => path.startsWith(prefix));
  return match ? roleNavigation[role][match.id] !== false : true;
}

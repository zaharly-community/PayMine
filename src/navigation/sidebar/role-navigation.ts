import type { UserRole } from "@/stores/auth/auth-provider";

export const roleNavigation: Record<UserRole, Record<string, boolean>> = {
  "SaaS Owner": {
    dashboard: true,
    users: true,
    packages: true,
    subscriptions: true,
    reports: true,
    settings: true,
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
  },
  Agent: {
    dashboard: true,
    players: true,
    deposits: true,
    withdrawls: true,
    disagreements: true,
    transactions: true,
  },
  Assistant: {
    dashboard: true,
    players: true,
    distributors: true,
    deposits: true,
    transactions: true,
  },
};

const routeKeys: Array<{ prefix: string; id: string }> = [
  { prefix: "/dashboard/users", id: "users" },
  { prefix: "/dashboard/packages", id: "packages" },
  { prefix: "/dashboard/subscriptions", id: "subscriptions" },
  { prefix: "/dashboard/reports", id: "reports" },
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
      label: role === "SaaS Owner" && group.id === 4 ? undefined : group.label,
      items: group.items.filter((item) => access[item.id] === true),
    }))
    .filter((group) => group.items.length > 0);
}

export function isRoleAllowedPath(role: UserRole, path: string) {
  if (path === "/dashboard" || path === "/dashboard/") {
    return true;
  }

  const match = routeKeys.find(({ prefix }) => path.startsWith(prefix));
  return match ? roleNavigation[role][match.id] === true : true;
}

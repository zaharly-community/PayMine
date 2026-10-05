import {
  BarChart3,
  CreditCard,
  Layers3,
  PanelsTopLeft,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { FileRoutesByTo } from "@/routeTree.gen";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  Landmark,
  Network,
  RefreshCcw,
  Scale,
  WalletCards,
} from "lucide-react";

export type NavBadge = "new" | "soon";
export type AppPath = keyof FileRoutesByTo;

export interface NavSubItem {
  id: string;
  title: string;
  url: AppPath;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: AppPath;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 0,
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard/",
        icon: PanelsTopLeft,
      },
    ],
  },
  {
    id: 1,
    label: "Platform",
    items: [
      {
        id: "users",
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "packages",
        title: "Packages",
        url: "/dashboard/packages",
        icon: Layers3,
      },
      {
        id: "subscriptions",
        title: "Subscriptions",
        url: "/dashboard/subscriptions",
        icon: CreditCard,
      },
      {
        id: "reports",
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
      },
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
      },
    ],
  },
  {
    id: 2,
    label: "Operations",
    items: [
      {
        id: "players",
        title: "Players",
        url: "/dashboard/players",
        icon: Users,
      },
      {
        id: "distributors",
        title: "Distributors",
        url: "/dashboard/distributors",
        icon: Network,
      },
      {
        id: "deposits",
        title: "Deposits",
        url: "/dashboard/deposits",
        icon: ArrowDownToLine,
      },
      {
        id: "withdrawls",
        title: "Withdrawls",
        url: "/dashboard/withdrawls",
        icon: ArrowUpFromLine,
      },
      {
        id: "analytics",
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        id: "disagreements",
        title: "Disagreements",
        url: "/dashboard/analytics/disagreements",
        icon: Scale,
      },
    ],
  },
  {
    id: 3,
    label: "Finance",
    items: [
      {
        id: "transactions",
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: WalletCards,
      },
      {
        id: "settlements",
        title: "Settlements",
        url: "/dashboard/transactions/settlements",
        icon: Landmark,
      },
      {
        id: "reconciliation",
        title: "Reconciliation",
        url: "/dashboard/transactions/reconciliation",
        icon: RefreshCcw,
      },
      {
        id: "fees-revenue",
        title: "Fees & Revenue",
        url: "/dashboard/transactions/fees-revenue",
        icon: CircleDollarSign,
      },
    ],
  },
];


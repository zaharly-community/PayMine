import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CircleDollarSign,
  Clock3,
  CreditCard,
  CalendarDays,
  FileText,
  Landmark,
  Layers3,
  Network,
  PanelsTopLeft,
  RefreshCcw,
  Scale,
  Settings2,
  Users,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { FileRoutesByTo } from "@/routeTree.gen";

export type NavBadge = "new" | "soon";
export type NavCountBadge = { count: number; tone: "green" | "red" };
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
  countBadge?: NavCountBadge;
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
        url: "/dashboard/users" as AppPath,
        icon: Users,
      },
      {
        id: "packages",
        title: "Packages",
        url: "/dashboard/packages" as AppPath,
        icon: Layers3,
      },
      {
        id: "subscriptions",
        title: "Subscriptions",
        url: "/dashboard/subscriptions" as AppPath,
        icon: CreditCard,
      },
      {
        id: "reports",
        title: "Reports",
        url: "/dashboard/reports" as AppPath,
        icon: BarChart3,
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
        url: "/dashboard/disagreements",
        icon: Scale,
      },
    ],
  },
  {
    id: 3,
    label: "Finance",
    items: [
      {
        id: "remittance",
        title: "Remittance",
        url: "/dashboard/remittance" as AppPath,
        icon: Landmark,
      },
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
        url: "/dashboard/transactions/fees-revenue" as AppPath,
        icon: CircleDollarSign,
      },
      {
        id: "financial-reports",
        title: "Financial Reports",
        url: "/dashboard/transactions/fees-revenue/financial-reports" as AppPath,
        icon: BarChart3,
      },
    ],
  },
  {
    id: 4,
    label: "Configs",
    items: [
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
      },
      {
        id: "client-portal",
        title: "Client Portal",
        url: "/dashboard/client-portal" as AppPath,
        icon: PanelsTopLeft,
      },
    ],
  },
  {
    id: 5,
    label: "HR",
    items: [
      { id: "hr-programs", title: "Programs", url: "/dashboard/hr/programs" as AppPath, icon: FileText },
      { id: "hr-shift-time", title: "Shift Time", url: "/dashboard/hr/shift-time" as AppPath, icon: Clock3 },
      { id: "hr-attendance", title: "Attendance", url: "/dashboard/hr/attendance" as AppPath, icon: CalendarDays },
      { id: "hr-payroll", title: "Payroll", url: "/dashboard/hr/payroll" as AppPath, icon: Wallet },
    ],
  },
];

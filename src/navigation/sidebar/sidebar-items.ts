import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChartBar,
  Network,
  PanelsTopLeft,
  Settings2,
  PlugZap,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { FileRoutesByTo } from "@/routeTree.gen";

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
    id: 1,
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
        icon: ChartBar,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings/general",
        icon: Settings2,
      },
      {
        id: "integrations",
        title: "Integrations",
        url: "/dashboard/integrations",
        icon: PlugZap,
      },
      {
        id: "portal",
        title: "Portal",
        url: "/dashboard/portal",
        icon: PanelsTopLeft,
      },
      {
        id: "accounts",
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: WalletCards,
      },
    ],
  },
];

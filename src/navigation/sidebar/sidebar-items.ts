import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  CircleDollarSign,
  Landmark,
  Calendar,
  ChartBar,
  CheckSquare,
  Fingerprint,
  FolderOpen,
  Forklift,
  Gauge,
  GraduationCap,
  HeartPulse,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Lock,
  Settings2,
  Languages,
  LockKeyhole,
  Bell,
  FileClock,
  CreditCard,
  SlidersHorizontal,
  PlugZap,
  PanelsTopLeft,
  type LucideIcon,
  Mail,
  MessageSquare,
  Network,
  ReceiptText,
  Server,
  ShoppingBag,
  SquareArrowUpRight,
  UserRound,
  Users,
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
    label: "Dashboards",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
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
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        id: "finance",
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
      {
        id: "finance-transactions",
        title: "Transactions",
        url: "/dashboard/finance/transactions",
        icon: ReceiptText,
      },
      {
        id: "finance-treasury",
        title: "Treasury",
        url: "/dashboard/finance/treasury",
        icon: Landmark,
      },
      {
        id: "finance-settlements",
        title: "Settlements",
        url: "/dashboard/finance/settlements",
        icon: CircleDollarSign,
      },
      {
        id: "finance-reports",
        title: "Reports",
        url: "/dashboard/finance/reports",
        icon: ChartBar,
      },
      {
        id: "settings",
        title: "Settings",
        icon: Settings2,
        subItems: [
          { id: "settings-general", title: "General", url: "/dashboard/settings/general", icon: Settings2 },
          { id: "settings-languages", title: "Languages", url: "/dashboard/settings/languages", icon: Languages },
          { id: "settings-security", title: "Security", url: "/dashboard/settings/security", icon: LockKeyhole },
          { id: "settings-notifications", title: "Notifications", url: "/dashboard/settings/notifications", icon: Bell },
          { id: "settings-audit-log", title: "Audit log", url: "/dashboard/settings/audit-log", icon: FileClock },
          { id: "settings-billing", title: "Billing", url: "/dashboard/settings/billing", icon: CreditCard },
          { id: "settings-features", title: "Features", url: "/dashboard/settings/features", icon: SlidersHorizontal },
        ],
      },
      {
        id: "integrations",
        title: "Integrations",
        url: "/dashboard/integrations",
        icon: PlugZap,
      },
      {
        id: "analytics",
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "portal",
        title: "Portal",
        url: "/dashboard/portal",
        icon: PanelsTopLeft,
      },
      {
        id: "dashboard-pages",
        title: "Dashboards",
        icon: LayoutDashboard,
        subItems: [
          { id: "email", title: "Email", url: "/dashboard/mail", icon: Mail },
          { id: "chat", title: "Chat", url: "/dashboard/chat", icon: MessageSquare },
          { id: "calendar", title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
          { id: "kanban", title: "Kanban", url: "/dashboard/kanban", icon: Kanban },
          { id: "tasks", title: "Tasks", url: "/dashboard/tasks", icon: CheckSquare },
          { id: "invoice", title: "Invoice", url: "/dashboard/invoice", icon: ReceiptText },
          { id: "profile", title: "Profile", url: "/dashboard/profile", icon: UserRound },
          { id: "users", title: "Users", url: "/dashboard/users", icon: Users },
          { id: "roles", title: "Roles", url: "/dashboard/roles", icon: Lock },
          { id: "authentication-default", title: "Authentication Default", url: "/auth/v1/login", icon: Fingerprint, newTab: true },
          { id: "default", title: "Default", url: "/dashboard/default", icon: LayoutDashboard },
          { id: "crm", title: "CRM", url: "/dashboard/crm", icon: ChartBar },
          { id: "analytics", title: "Analytics", url: "/dashboard/analytics", icon: Gauge },
          { id: "productivity", title: "Productivity", url: "/dashboard/productivity", icon: ListTodo },
          { id: "ecommerce", title: "E-commerce", url: "/dashboard/ecommerce", icon: ShoppingBag },
          { id: "academy", title: "Academy", url: "/dashboard/academy", icon: GraduationCap },
          { id: "logistics", title: "Logistics", url: "/dashboard/logistics", icon: Forklift },
          { id: "infrastructure", title: "Infrastructure", url: "/dashboard/infrastructure", icon: Server },
          { id: "file-manager", title: "File Manager", url: "/dashboard/file-manager", icon: FolderOpen },
          { id: "patient-monitoring", title: "Patient Monitoring", url: "/dashboard/patient-monitoring", icon: HeartPulse },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Misc",
    items: [
      {
        id: "others",
        title: "Others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        badge: "soon",
        disabled: true,
      },
    ],
  },
];

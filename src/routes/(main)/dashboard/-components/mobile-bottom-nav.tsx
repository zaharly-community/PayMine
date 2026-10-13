import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Layers3,
  PanelsTopLeft,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";

import type { AppPath } from "@/navigation/sidebar/sidebar-items";
import { roleNavigation } from "@/navigation/sidebar/role-navigation";
import { useAuth } from "@/stores/auth/auth-provider";

type MobileNavItem = {
  id: string;
  label: string;
  to: AppPath;
  icon: LucideIcon;
};

const operationalItems: MobileNavItem[] = [
  { id: "dashboard", label: "Home", to: "/dashboard/", icon: PanelsTopLeft },
  { id: "deposits", label: "Deposits", to: "/dashboard/deposits", icon: ArrowDownToLine },
  { id: "withdrawls", label: "Withdrawls", to: "/dashboard/withdrawls", icon: ArrowUpFromLine },
  { id: "transactions", label: "Transactions", to: "/dashboard/transactions", icon: WalletCards },
];

const ownerItems: MobileNavItem[] = [
  { id: "dashboard", label: "Home", to: "/dashboard/", icon: PanelsTopLeft },
  { id: "users", label: "Users", to: "/dashboard/users", icon: Users },
  { id: "packages", label: "Packages", to: "/dashboard/packages", icon: Layers3 },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: BarChart3 },
];

export function MobileBottomNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (state) => state.location.pathname });

  if (!user) return null;

  // Keep mobile destinations consistent with the current role's permissions.
  // The SaaS Owner has a separate platform workflow from payment operations.
  const items =
    user.role === "SaaS Owner"
      ? ownerItems
      : operationalItems.filter((item) => roleNavigation[user.role][item.id] === true);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-xl grid-cols-4 px-1">
        {items.map((item) => {
          const isHome = item.id === "dashboard";
          const isActive = isHome
            ? path === "/dashboard" || path === "/dashboard/"
            : path === item.to || path.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("size-5", isActive && "stroke-[2.25]")} />
              <span className="max-w-full truncate leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

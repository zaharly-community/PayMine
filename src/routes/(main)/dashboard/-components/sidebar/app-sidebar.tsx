import { Link } from "@tanstack/react-router";

import { Command } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { filterSidebarItemsForRole } from "@/navigation/sidebar/role-navigation";
import { useAuth } from "@/stores/auth/auth-provider";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { BrandSwitcher } from "./brand-switcher";
import { NavMain } from "./nav-main";
import { SupportCard } from "./support-card";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );
  const { user } = useAuth();

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;
  const visibleItems = filterSidebarItemsForRole(sidebarItems, user?.role);

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/dashboard/" />}>
              <Command />
              <span className="font-semibold text-base">{APP_CONFIG.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleItems} showQuickCreate={user?.role !== "SaaS Owner"} />
      </SidebarContent>
      <SidebarFooter className="gap-2">
        <SupportCard />
        {user?.role !== "SaaS Owner" ? <BrandSwitcher /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}

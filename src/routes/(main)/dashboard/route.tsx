import { useEffect, type CSSProperties } from "react";

import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { cn } from "cn";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardLayout } from "@/server/server-actions";
import { isRoleAllowedPath } from "@/navigation/sidebar/role-navigation";
import { useAuth } from "@/stores/auth/auth-provider";
import { BrandProvider } from "@/stores/brands/brand-provider";

import { AccountSwitcher } from "./-components/header/account-switcher";
import { LayoutControls } from "./-components/header/layout-controls";
import { NotificationsMenu } from "./-components/header/notifications-menu";
import { SearchDialog } from "./-components/header/search-dialog";
import { ThemeSwitcher } from "./-components/header/theme-switcher";
import { WalletMenu } from "./-components/header/wallet-menu";
import { AppSidebar } from "./-components/sidebar/app-sidebar";

export const Route = createFileRoute("/(main)/dashboard")({
  loader: () => getDashboardLayout(),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { defaultOpen, variant, collapsible } = Route.useLoaderData();
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      navigate({ to: "/auth/v2/login", replace: true });
      return;
    }

    if (!isRoleAllowedPath(user.role, path)) {
      navigate({ to: "/dashboard/", replace: true });
    }
  }, [isHydrated, user, path, navigate]);

  if (!isHydrated || !user || !isRoleAllowedPath(user.role, path)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm font-medium">
            {!isHydrated ? "Loading session…" : !user ? "Redirecting to login…" : "Checking access…"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">ipaycash</p>
        </div>
      </div>
    );
  }

  return (
    <BrandProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 68)",
          } as CSSProperties
        }
      >
        <AppSidebar variant={variant} collapsible={collapsible} />
        <SidebarInset
          className={cn(
            "[html[data-content-layout=centered]_&>*]:mx-auto",
            "[html[data-content-layout=centered]_&>*]:w-full",
            "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
            "peer-data-[variant=inset]:border",
            "[--dashboard-header-height:--spacing(12)]",
            "min-w-0 overflow-x-clip",
          )}
        >
          <header
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
              "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
          >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                />
                <SearchDialog />
              </div>
              <div className="flex items-center gap-2">
                <LayoutControls />
                <ThemeSwitcher />
                <NotificationsMenu />
                <WalletMenu />
                <AccountSwitcher />
              </div>
            </div>
          </header>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:has-data-[content-padding=false]:p-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BrandProvider>
  );
}

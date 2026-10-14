import * as React from "react";

import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "cn";
import { ChevronRight, MailIcon, PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type {
  AppPath,
  NavBadge,
  NavGroup,
  NavMainItem,
  NavMainLinkItem,
  NavMainParentItem,
} from "@/navigation/sidebar/sidebar-items";
import {
  getInitialOpenOrderCounts,
  OPEN_ORDER_COUNTS_EVENT,
  type OpenOrderCountDetail,
  type OpenOrderCounts,
} from "@/navigation/sidebar/open-order-counts";

interface NavMainProps {
  readonly items: readonly NavGroup[];
  readonly showQuickCreate?: boolean;
}

interface NavItemProps {
  readonly item: NavMainItem;
  readonly isItemActive: (item: NavMainItem) => boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
  readonly isSubmenuOpen: (item: NavMainParentItem) => boolean;
}

interface NavLinkItemProps {
  readonly item: NavMainLinkItem;
  readonly isActive: boolean;
  readonly showIconFallback: boolean;
}

interface NavLinkIconProps {
  readonly item: NavMainLinkItem;
  readonly showFallback: boolean;
}

interface NavDropdownItemProps {
  readonly item: NavMainParentItem;
  readonly isActive: boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
}

interface NavCollapsibleItemProps {
  readonly item: NavMainParentItem;
  readonly isActive: boolean;
  readonly defaultOpen: boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
}

function CollapsedIconFallback({ title }: { title: string }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-xs font-medium text-[10px] outline">
      {title.slice(0, 1)}
    </span>
  );
}

function hasSubItems(item: NavMainItem): item is NavMainParentItem {
  return Boolean(item.subItems?.length);
}

export function NavMain({ items, showQuickCreate = true }: NavMainProps) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [orderCounts, setOrderCounts] = React.useState<OpenOrderCounts>({
    deposits: 0,
    withdrawls: 0,
  });

  React.useEffect(() => {
    const syncInitialCounts = () => setOrderCounts(getInitialOpenOrderCounts());
    const handleOrderCountChange = (event: Event) => {
      const detail = (event as CustomEvent<OpenOrderCountDetail>).detail;
      if (!detail || (detail.section !== "deposits" && detail.section !== "withdrawls")) {
        return;
      }

      setOrderCounts((current) => ({
        ...current,
        [detail.section]: Math.max(0, detail.count),
      }));
    };

    syncInitialCounts();
    window.addEventListener(OPEN_ORDER_COUNTS_EVENT, handleOrderCountChange);
    window.addEventListener("storage", syncInitialCounts);

    return () => {
      window.removeEventListener(OPEN_ORDER_COUNTS_EVENT, handleOrderCountChange);
      window.removeEventListener("storage", syncInitialCounts);
    };
  }, []);

  const itemsWithCounts = items.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.id === "deposits") {
        return {
          ...item,
          countBadge: { count: orderCounts.deposits, tone: "green" as const },
        };
      }
      if (item.id === "withdrawls") {
        return {
          ...item,
          countBadge: { count: orderCounts.withdrawls, tone: "red" as const },
        };
      }
      return item;
    }),
  }));

  const isItemActive = (item: NavMainItem) => {
    if (hasSubItems(item)) {
      return item.subItems.some((sub) => path.startsWith(sub.url));
    }

    return path === item.url;
  };

  const isSubItemActive = (url: AppPath) => {
    return path === url;
  };

  const isSubmenuOpen = (item: NavMainParentItem) => {
    return item.subItems.some((sub) => path.startsWith(sub.url));
  };

  return (
    <>
      {showQuickCreate ? (
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusCircleIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                  variant="outline"
                >
                  <MailIcon />
                  <span className="sr-only">Inbox</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}
      {itemsWithCounts.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && (
            <SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isItemActive={isItemActive}
                  isSubItemActive={isSubItemActive}
                  isSubmenuOpen={isSubmenuOpen}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavItem({ item, isItemActive, isSubItemActive, isSubmenuOpen }: NavItemProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsedDesktop = state === "collapsed" && !isMobile;

  if (!hasSubItems(item)) {
    return <NavLinkItem item={item} isActive={isItemActive(item)} showIconFallback={isCollapsedDesktop} />;
  }

  if (isCollapsedDesktop) {
    return <NavDropdownItem item={item} isActive={isItemActive(item)} isSubItemActive={isSubItemActive} />;
  }

  return (
    <NavCollapsibleItem
      item={item}
      isActive={isItemActive(item)}
      defaultOpen={isSubmenuOpen(item)}
      isSubItemActive={isSubItemActive}
    />
  );
}

function NavLinkItem({ item, isActive, showIconFallback }: NavLinkItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <Link
            to={item.url}
            target={item.newTab ? "_blank" : undefined}
            rel={item.newTab ? "noreferrer" : undefined}
          />
        }
        aria-disabled={item.disabled}
        tooltip={item.title}
        isActive={isActive}
      >
        <NavLinkIcon item={item} showFallback={showIconFallback} />
        <span>{item.title}</span>
      </SidebarMenuButton>
      <NavItemBadge badge={item.badge} countBadge={item.countBadge} />
    </SidebarMenuItem>
  );
}

function NavLinkIcon({ item, showFallback }: NavLinkIconProps) {
  const Icon = item.icon;

  if (Icon) {
    return <Icon />;
  }

  if (showFallback) {
    return <CollapsedIconFallback title={item.title} />;
  }

  return null;
}

function NavDropdownItem({ item, isActive, isSubItemActive }: NavDropdownItemProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuButton tooltip={item.title} isActive={isActive} disabled={item.disabled} />}
        >
          {Icon ? <Icon /> : <CollapsedIconFallback title={item.title} />}
          <span>{item.title}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" sideOffset={12} className="w-48">
          <DropdownMenuGroup>
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;

              return (
                <DropdownMenuItem
                  key={subItem.id}
                  render={
                    <Link
                      to={subItem.url}
                      target={subItem.newTab ? "_blank" : undefined}
                      rel={subItem.newTab ? "noreferrer" : undefined}
                      aria-current={isSubItemActive(subItem.url) ? "page" : undefined}
                      className="flex items-center gap-2"
                    />
                  }
                  disabled={subItem.disabled}
                >
                  {SubIcon && <SubIcon />}
                  <span>{subItem.title}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function NavCollapsibleItem({ item, isActive, defaultOpen, isSubItemActive }: NavCollapsibleItemProps) {
  const Icon = item.icon;

  return (
    <Collapsible
      render={<li data-slot="sidebar-menu-item" data-sidebar="menu-item" className="group/menu-item relative" />}
      defaultOpen={defaultOpen}
      className="group/collapsible"
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={isActive} disabled={item.disabled} />}
      >
        {Icon && <Icon />}
        <span>{item.title}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open/menu-button:rotate-90" />
      </CollapsibleTrigger>
      <NavItemBadge badge={item.badge} />

      <CollapsibleContent>
        <SidebarMenuSub>
          {item.subItems.map((subItem) => {
            const SubIcon = subItem.icon;

            return (
              <SidebarMenuSubItem key={subItem.id}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      to={subItem.url}
                      target={subItem.newTab ? "_blank" : undefined}
                      rel={subItem.newTab ? "noreferrer" : undefined}
                    />
                  }
                  aria-disabled={subItem.disabled}
                  isActive={isSubItemActive(subItem.url)}
                >
                  {SubIcon && <SubIcon />}
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavItemBadge({
  badge,
  countBadge,
}: {
  badge?: NavBadge;
  countBadge?: { count: number; tone: "green" | "red" };
}) {
  const showCount = Boolean(countBadge && countBadge.count > 0);
  if (!badge && !showCount) {
    return null;
  }

  return (
    <>
      {badge ? (
        <SidebarMenuBadge
          className={cn(
            "rounded-sm border capitalize",
            badge === "new" &&
              "border-green-600 text-green-600 peer-hover/menu-button:text-green-600 peer-data-active/menu-button:text-green-600",
            badge === "soon" && "border-muted-foreground text-muted-foreground",
          )}
        >
          {badge}
        </SidebarMenuBadge>
      ) : null}
      {showCount && countBadge ? (
        <SidebarMenuBadge
          aria-label={countBadge.count + " open requests"}
          className={cn(
            "min-w-5 rounded-full border px-1 text-center text-[10px] font-semibold tabular-nums",
            countBadge.tone === "green" &&
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 peer-hover/menu-button:text-emerald-400 peer-data-active/menu-button:text-emerald-400",
            countBadge.tone === "red" &&
              "border-red-500/30 bg-red-500/10 text-red-400 peer-hover/menu-button:text-red-400 peer-data-active/menu-button:text-red-400",
          )}
        >
          {countBadge.count > 99 ? "99+" : countBadge.count}
        </SidebarMenuBadge>
      ) : null}
    </>
  );
}

import { Check, ChevronDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "cn";
import { useBrand } from "@/stores/brands/brand-provider";

function BrandLogo({
  initials,
  className,
}: {
  readonly initials: string;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary text-[11px] font-semibold tracking-tight",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function BrandSwitcher() {
  const { isMobile } = useSidebar();
  const { brands, activeBrand, setActiveBrand } = useBrand();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 border border-sidebar-border/70 bg-sidebar-accent/40 shadow-none data-open:bg-sidebar-accent"
                title="Switch brand"
                aria-label={`Switch brand. Current brand: ${activeBrand.name}`}
              />
            }
          >
            <BrandLogo initials={activeBrand.initials} />
            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-sm">{activeBrand.name}</span>
              <span className="truncate text-muted-foreground text-[11px]">{activeBrand.description}</span>
            </div>
            <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-72 rounded-xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={8}
          >
            <div className="px-2.5 pb-2 pt-1">
              <p className="text-xs font-semibold">Switch brand</p>
              <p className="mt-0.5 text-muted-foreground text-[11px]">
                Choose which brand you are managing.
              </p>
            </div>

            <div className="space-y-1">
              {brands.map((brand) => {
                const isActive = brand.id === activeBrand.id;

                return (
                  <DropdownMenuItem
                    key={brand.id}
                    className={cn(
                      "rounded-lg p-0",
                      isActive && "bg-accent/70",
                    )}
                    onClick={() => setActiveBrand(brand.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="flex w-full items-center gap-2.5 px-2 py-2">
                      <BrandLogo initials={brand.initials} />
                      <div className="grid min-w-0 flex-1 text-left leading-tight">
                        <span className="truncate text-sm font-medium">{brand.name}</span>
                        <span className="truncate text-muted-foreground text-[11px]">{brand.description}</span>
                      </div>
                      <Check
                        className={cn(
                          "size-4 shrink-0 text-primary",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator className="my-1.5" />

            <DropdownMenuItem className="rounded-lg">
              <Plus className="size-4" />
              <span>Add brand</span>
              <span className="ml-auto text-[10px] text-muted-foreground">Soon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

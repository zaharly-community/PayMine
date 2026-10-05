import { useState } from "react";

import { Check, ChevronDown, Plus, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
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
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary text-[11px] font-semibold tracking-tight",
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
  const { brands, activeBrand, setActiveBrand, addBrand } = useBrand();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetCreateForm = () => {
    setName("");
    setDescription("");
  };

  const handleCreateBrand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    addBrand({
      name: trimmedName,
      description,
    });
    resetCreateForm();
    setIsCreateOpen(false);
  };

  return (
    <>
      <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/25 p-1.5 shadow-xs group-data-[collapsible=icon]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 rounded-lg bg-transparent px-2.5 hover:bg-sidebar-accent/70 data-open:bg-sidebar-accent/70"
                aria-label={`Switch brand. Current brand: ${activeBrand.name}`}
              />
            }
          >
            <BrandLogo initials={activeBrand.initials} />
            <div className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Active brand
              </span>
              <span className="truncate text-sm font-semibold">{activeBrand.name}</span>
            </div>
            <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-72 rounded-xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <div className="px-2.5 pb-2 pt-1">
              <p className="text-xs font-semibold">Switch brand</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Choose the brand you want to manage.
              </p>
            </div>

            <div className="space-y-1">
              {brands.map((brand) => {
                const isActive = brand.id === activeBrand.id;

                return (
                  <DropdownMenuItem
                    key={brand.id}
                    className={cn("rounded-lg p-0", isActive && "bg-accent/70")}
                    onClick={() => setActiveBrand(brand.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="flex w-full items-center gap-2.5 px-2 py-2">
                      <BrandLogo initials={brand.initials} />
                      <div className="grid min-w-0 flex-1 text-left leading-tight">
                        <span className="truncate text-sm font-medium">{brand.name}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {brand.description}
                        </span>
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

            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              <span>Add brand</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
          <div className="border-b bg-muted/25 px-5 py-5">
            <DialogHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <DialogTitle className="text-lg">Create a new brand</DialogTitle>
              <DialogDescription>
                Add a brand to manage it from the dashboard switcher.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateBrand}>
            <div className="space-y-4 px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand name</Label>
                <Input
                  id="brand-name"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. PayMine Europe"
                  maxLength={60}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="brand-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. European payments"
                  maxLength={80}
                />
              </div>
            </div>

            <DialogFooter className="px-5 py-4 sm:-mx-0 sm:-mb-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Create brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

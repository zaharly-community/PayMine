import { useMemo, useState } from "react";

import { ArrowUpRight, Check, ChevronDown, Globe2, Link2, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "cn";
import { useBrand } from "@/stores/brands/brand-provider";

function BrandAvatar({
  initials,
  className,
}: {
  readonly initials: string;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-gradient-to-br from-primary/15 via-primary/5 to-background text-xs font-semibold text-foreground shadow-inner",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function formatUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isValidBrandUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function BrandSwitcher() {
  const { isMobile } = useSidebar();
  const { brands, activeBrand, setActiveBrand, addBrand } = useBrand();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const previewInitials = useMemo(() => {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "BR"
    );
  }, [name]);

  const canCreate = Boolean(name.trim()) && isValidBrandUrl(url.trim());

  const resetCreateForm = () => {
    setName("");
    setUrl("");
    setDescription("");
  };

  const handleCreateBrand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreate) {
      return;
    }

    addBrand({
      name,
      url,
      description,
    });

    resetCreateForm();
    setIsCreateOpen(false);
  };

  return (
    <>
      <SidebarMenu className="px-0">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "group h-auto min-h-14 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 px-2.5 py-2.5 shadow-sm transition-all",
                    "hover:-translate-y-px hover:bg-sidebar-accent/60 hover:shadow-md",
                    "data-open:bg-sidebar-accent/60 data-open:shadow-md",
                  )}
                  aria-label={`Switch brand. Current brand: ${activeBrand.name}`}
                  tooltip={activeBrand.name}
                />
              }
            >
              <BrandAvatar initials={activeBrand.initials} />
              <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Brand
                </span>
                <span className="truncate text-sm font-semibold tracking-tight">{activeBrand.name}</span>
                {activeBrand.url && (
                  <span className="truncate text-[11px] text-muted-foreground">
                    {formatUrl(activeBrand.url)}
                  </span>
                )}
              </div>
              <ChevronDown className="ml-1 size-4 shrink-0 text-muted-foreground transition-transform group-data-open/menu-button:rotate-180" />
            </SidebarMenuButton>
          }
        >
          <DropdownMenuContent
            className="w-80 rounded-2xl border-border/70 bg-popover/95 p-1.5 shadow-xl backdrop-blur"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "end"}
            sideOffset={10}
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Switch brand</p>
                  <p className="text-[11px] text-muted-foreground">
                    Choose the brand you want to manage.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {brands.map((brand) => {
                const isActive = brand.id === activeBrand.id;

                return (
                  <DropdownMenuItem
                    key={brand.id}
                    className={cn(
                      "group rounded-xl p-0 focus:bg-accent/70",
                      isActive && "bg-accent/60",
                    )}
                    onClick={() => setActiveBrand(brand.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="flex w-full items-center gap-3 px-2.5 py-2.5">
                      <BrandAvatar initials={brand.initials} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{brand.name}</span>
                          {isActive && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {brand.url ? formatUrl(brand.url) : brand.description}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "size-4 shrink-0 text-primary transition-opacity",
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
              className="group rounded-xl p-0"
              onClick={() => setIsCreateOpen(true)}
            >
              <div className="flex w-full items-center gap-3 px-2.5 py-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border border-dashed border-border bg-muted/50">
                  <Plus className="size-4 text-muted-foreground group-hover:text-foreground" />
                </span>
                <div className="flex-1">
                  <span className="block text-sm font-medium">Add a new brand</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Create and start managing another brand.
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-3xl border-border/70 bg-background p-0 shadow-2xl">
          <div className="grid md:grid-cols-[0.86fr_1.14fr]">
            <div className="relative overflow-hidden border-b bg-muted/35 p-6 md:border-b-0 md:border-r">
              <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 size-40 rounded-full bg-primary/5 blur-3xl" />

              <DialogHeader className="relative z-10">
                <div className="mb-5 flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 shadow-sm">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <DialogTitle className="text-xl tracking-tight">Create a new brand</DialogTitle>
                <DialogDescription className="max-w-xs text-sm leading-6">
                  Set up a brand once and switch between your brands directly from the dashboard.
                </DialogDescription>
              </DialogHeader>

              <div className="relative z-10 mt-8 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Live preview
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Ready
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <BrandAvatar initials={previewInitials} className="size-11 rounded-2xl" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {name.trim() || "Your brand"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {url.trim() ? formatUrl(url.trim()) : "your-brand.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateBrand} className="flex min-h-full flex-col">
              <div className="flex-1 space-y-5 px-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Brand name</Label>
                  <Input
                    id="brand-name"
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. PayMine Europe"
                    maxLength={60}
                    className="h-10 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-url">Brand URL</Label>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="brand-url"
                      type="url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder="https://yourbrand.com"
                      maxLength={200}
                      className="h-10 rounded-xl pl-9 pr-10"
                      required
                    />
                    {isValidBrandUrl(url.trim()) && (
                      <a
                        href={url.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Open brand website"
                      >
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Globe2 className="size-3.5" />
                    Add your public website so the brand is easy to recognize.
                  </p>
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
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter className="mx-0 mb-0 mt-auto border-t bg-muted/20 px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-5" disabled={!canCreate}>
                  <Plus className="size-4" />
                  Create brand
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

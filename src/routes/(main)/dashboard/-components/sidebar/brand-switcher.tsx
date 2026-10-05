import { useState } from "react";

import { Check, ChevronDown, ExternalLink, Globe2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
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
        "flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-[11px] font-semibold",
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

export function BrandSwitcher() {
  const { isMobile } = useSidebar();
  const { brands, activeBrand, setActiveBrand, addBrand } = useBrand();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const canCreate = Boolean(name.trim() && url.trim());

  const resetForm = () => {
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
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
    });

    resetForm();
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
                  className="h-11 rounded-lg px-2 transition-colors"
                  aria-label={`Switch brand. Current brand: ${activeBrand.name}`}
                  tooltip={activeBrand.name}
                />
              }
            >
              <BrandAvatar initials={activeBrand.initials} />
              <div className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">{activeBrand.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {activeBrand.url ? formatUrl(activeBrand.url) : activeBrand.description}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 p-1"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={6}
            >
              <div className="px-2.5 py-2">
                <p className="text-xs font-medium text-muted-foreground">Switch brand</p>
              </div>

              <div className="space-y-0.5">
                {brands.map((brand) => {
                  const isActive = brand.id === activeBrand.id;

                  return (
                    <DropdownMenuItem
                      key={brand.id}
                      className="rounded-lg px-2 py-2"
                      onClick={() => setActiveBrand(brand.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <BrandAvatar initials={brand.initials} />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{brand.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {brand.url ? formatUrl(brand.url) : brand.description}
                        </span>
                      </div>
                      {isActive && <Check className="size-4 text-foreground" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="rounded-lg px-2 py-2"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-4" />
                <span className="text-sm">Create brand</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create a new brand</DialogTitle>
            <DialogDescription>
              Add the basic details for the brand you want to manage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBrand} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand name</Label>
              <Input
                id="brand-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme"
                maxLength={60}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-url">Brand URL</Label>
              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="brand-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://acme.com"
                  maxLength={200}
                  className="pl-9 pr-9"
                  required
                />
                {url.trim() && (
                  <a
                    href={url.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Open brand website"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Use the public website for this brand.
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
                placeholder="Payments platform"
                maxLength={80}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canCreate}>
                <Plus className="size-4" />
                Create brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

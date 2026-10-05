import { useRef, useState } from "react";

import {
  Check,
  ChevronDown,
  ExternalLink,
  Globe2,
  ImagePlus,
  Plus,
  Upload,
  X,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
  logo,
  className,
}: {
  readonly initials: string;
  readonly logo?: string;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-[11px] font-semibold",
        className,
      )}
      aria-hidden="true"
    >
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const canCreate = Boolean(name.trim() && url.trim());

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setLogo("");
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };

    reader.readAsDataURL(file);
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
      logo,
    });

    resetForm();
    setIsCreateOpen(false);
  };

  return (
    <>
      <SidebarMenu className="rounded-lg border border-sidebar-border/70 px-0">
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
              <BrandAvatar
                initials={activeBrand.initials}
                logo={activeBrand.logo}
              />
              <div className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">
                  {activeBrand.name}
                </span>
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
                <p className="text-xs font-medium text-muted-foreground">
                  Switch brand
                </p>
              </div>

              <div className="space-y-0.5">
                {brands.map((brand) => {
                  const isActive = brand.id === activeBrand.id;
                  const secondaryText = brand.url
                    ? formatUrl(brand.url)
                    : brand.description;

                  return (
                    <DropdownMenuItem
                      key={brand.id}
                      className="rounded-lg px-2 py-2"
                      onClick={() => setActiveBrand(brand.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <BrandAvatar
                        initials={brand.initials}
                        logo={brand.logo}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {brand.name}
                        </span>
                        {brand.url ? (
                          <a
                            href={brand.url}
                            target="_blank"
                            rel="noreferrer"
                            title={brand.url}
                            className="block max-w-full truncate text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {brand.url}
                          </a>
                        ) : (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {secondaryText}
                          </span>
                        )}
                      </div>
                      {brand.url && (
                        <a
                          href={brand.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          View
                        </a>
                      )}
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
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create a new brand</DialogTitle>
            <DialogDescription>
              Add your brand details. The logo is optional and can be changed later.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBrand} className="space-y-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={cn(
                  "group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted transition-colors hover:bg-muted/70",
                  logo && "border-solid",
                )}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload brand logo"
              >
                {logo ? (
                  <>
                    <img
                      src={logo}
                      alt="Brand logo preview"
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="size-4 text-white" />
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="size-5" />
                    <span className="text-[10px]">Logo</span>
                  </div>
                )}
              </button>

              <div className="min-w-0">
                <Label htmlFor="brand-logo" className="text-sm">
                  Brand logo
                </Label>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  PNG, JPG, WEBP or SVG up to 2 MB.
                </p>
                <input
                  ref={fileInputRef}
                  id="brand-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={handleLogoChange}
                />
                {logo && (
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setLogo("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="size-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>

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
                Description{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="brand-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this brand is used for..."
                maxLength={180}
                rows={3}
                className="min-h-20 resize-none"
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

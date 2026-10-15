import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe2,
  LayoutTemplate,
  Monitor,
  Moon,
  Save,
  Smartphone,
  Sparkles,
  Sun,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  clientPortalMethodOptions,
  getClientPortalForms,
  normalizeClientPortalSlug,
  saveClientPortalForms,
  type ClientPortalAppearance,
  type ClientPortalForm,
} from "@/lib/client-portal-config";

type EditorSection = "general" | "methods" | "appearance";

const sectionOptions: Array<{ id: EditorSection; title: string; description: string }> = [
  { id: "general", title: "General", description: "Name, URL and checkout content" },
  { id: "methods", title: "Payment methods", description: "Choose the options shown to players" },
  { id: "appearance", title: "Appearance", description: "Branding, colors and layout" },
];

const portalColorOptions = [
  { key: "primaryColor" as const, label: "Accent / action color" },
  { key: "backgroundColor" as const, label: "Page background" },
  { key: "surfaceColor" as const, label: "Checkout surface" },
];

function makeId() {
  return "FORM-" + Date.now().toString(36).toUpperCase();
}

function uniqueSlug(input: string, forms: ClientPortalForm[], exceptId?: string) {
  const base = normalizeClientPortalSlug(input) || "checkout";
  let slug = base;
  let suffix = 2;
  while (forms.some((form) => form.id !== exceptId && form.slug === slug)) {
    slug = base + "-" + suffix;
    suffix += 1;
  }
  return slug;
}

function formatUpdated() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientPortalBuilder({
  initialSlug,
  onExit,
}: {
  initialSlug: string;
  onExit: () => void;
}) {
  const [forms, setForms] = useState<ClientPortalForm[]>(() => getClientPortalForms());
  const [selectedId, setSelectedId] = useState(() => {
    const initial = getClientPortalForms().find((form) => form.id === initialSlug || form.slug === initialSlug);
    return initial?.id ?? getClientPortalForms()[0]?.id ?? "";
  });
  const [section, setSection] = useState<EditorSection>("appearance");
  const [notice, setNotice] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showThemeSettings, setShowThemeSettings] = useState(true);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const latest = getClientPortalForms();
      setForms(latest);
      setSelectedId((current) => latest.some((form) => form.id === current)
        ? current
        : (latest.find((form) => form.id === initialSlug || form.slug === initialSlug)?.id ?? latest[0]?.id ?? ""));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("ipaycash-client-portal-forms-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ipaycash-client-portal-forms-changed", refresh);
    };
  }, [initialSlug]);

  const selected = forms.find((form) => form.id === selectedId) ?? forms[0];
  const liveUrl = useMemo(() => {
    const origin = typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;
    return origin + "/portal/" + (selected?.slug ?? "main-deposit");
  }, [selected?.slug]);
  const embedCode = '<iframe src="' + liveUrl + '" title="' + (selected?.name ?? "iPayCash checkout") + '" width="100%" height="680" loading="lazy" style="border:0;border-radius:16px"></iframe>';

  const updateSelected = (patch: Partial<ClientPortalForm>) => {
    if (!selected) return;
    setForms((current) => current.map((form) => form.id === selected.id
      ? { ...form, ...patch, updated: "Unsaved changes" }
      : form));
    setNotice("");
  };

  const updateAppearance = (patch: Partial<ClientPortalAppearance>) => {
    if (!selected) return;
    updateSelected({ appearance: { ...selected.appearance, ...patch } });
  };

  const save = () => {
    const usedSlugs = new Set<string>();
    let normalized = forms.map((form) => {
      const base = normalizeClientPortalSlug(form.slug) || "checkout";
      let slug = base;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = base + "-" + suffix;
        suffix += 1;
      }
      usedSlugs.add(slug);
      return { ...form, slug, updated: formatUpdated() };
    });
    const defaults = normalized.filter((form) => form.status === "Published" && form.isDefault);
    if (defaults.length > 1) {
      const keepId = defaults[0].id;
      normalized = normalized.map((form) => ({ ...form, isDefault: form.id === keepId }));
    }
    if (!normalized.some((form) => form.status === "Published" && form.isDefault)) {
      const firstPublished = normalized.find((form) => form.status === "Published");
      if (firstPublished) normalized = normalized.map((form) => ({ ...form, isDefault: form.id === firstPublished.id }));
    }
    saveClientPortalForms(normalized);
    setForms(normalized);
    setNotice("Saved in this browser. Connect backend persistence before using this configuration across devices.");
  };

  const toggleMethod = (method: string) => {
    if (!selected) return;
    const hasMethod = selected.methods.includes(method);
    if (hasMethod && selected.methods.length === 1) {
      setNotice("Keep at least one payment method enabled.");
      return;
    }
    updateSelected({ methods: hasMethod ? selected.methods.filter((item) => item !== method) : [...selected.methods, method] });
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy: ClientPortalForm = {
      ...selected,
      id: makeId(),
      name: selected.name + " copy",
      slug: uniqueSlug(selected.slug + "-copy", forms),
      status: "Draft",
      isDefault: false,
      sessions: 0,
      conversion: "—",
      updated: formatUpdated(),
      methods: [...selected.methods],
      appearance: { ...selected.appearance },
    };
    const updated = [copy, ...forms];
    saveClientPortalForms(updated);
    setForms(updated);
    setSelectedId(copy.id);
    setNotice("Duplicated as a new draft.");
  };

  if (!selected) return null;

  return (
    <section className="flex min-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-xl border bg-background">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}><ExternalLink className="size-3.5 rotate-180" /> Exit</Button>
          <span className="hidden h-6 w-px bg-border sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">{(selected.appearance.brandName || "iP").slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0"><p className="max-w-44 truncate text-sm font-semibold">{selected.appearance.brandName || "Your brand"}</p><p className="max-w-44 truncate text-[10px] text-muted-foreground">{selected.name}</p></div>
            <Badge variant={selected.status === "Published" ? "secondary" : "outline"} className="hidden sm:inline-flex">{selected.status === "Published" ? "LIVE" : "DRAFT"}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Select value={section} onValueChange={(value) => setSection(value as EditorSection)}>
            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Form content</SelectItem>
              <SelectItem value="methods">Payment methods</SelectItem>
              <SelectItem value="appearance">Theme settings</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="size-8" aria-label="Toggle theme" title="Toggle theme" onClick={() => updateAppearance({ theme: selected.appearance.theme === "dark" ? "light" : "dark" })}>{selected.appearance.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
          <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="icon" className="size-8" aria-label="Desktop preview" title="Desktop preview" onClick={() => setPreviewMode("desktop")}><Monitor className="size-4" /></Button>
          <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="icon" className="size-8" aria-label="Mobile preview" title="Mobile preview" onClick={() => setPreviewMode("mobile")}><Smartphone className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={duplicateSelected}><Copy className="size-3.5" /><span className="hidden md:inline">Duplicate</span></Button>
          <Button size="sm" onClick={save}><Save className="size-3.5" /> Save</Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-h-0 border-b bg-muted/10 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto xl:border-b-0 xl:border-r">
          <div className="border-b px-4 py-4">
            <div className="flex items-center gap-2"><LayoutTemplate className="size-4 text-primary" /><h2 className="text-sm font-semibold">Theme settings</h2></div>
            <p className="mt-1 text-xs text-muted-foreground">Customize this checkout without affecting other forms.</p>
          </div>
          <div className="space-y-3 p-3">
            <button type="button" onClick={() => setShowThemeSettings((value) => !value)} className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-left">
              <span><span className="block text-sm font-medium">Theme & layout</span><span className="text-[10px] text-muted-foreground">Colours, width and corners</span></span>
              <span className="text-muted-foreground">{showThemeSettings ? "−" : "+"}</span>
            </button>
            {showThemeSettings ? (
              <div className="space-y-4 rounded-lg border bg-background p-3">
                <div className="grid gap-2"><Label>Colours</Label>
                  {portalColorOptions.map((option) => <label key={option.key} className="flex items-center justify-between gap-2 py-1"><span className="text-xs">{option.label}</span><span className="flex items-center gap-2"><code className="text-[10px] text-muted-foreground">{selected.appearance[option.key]}</code><input type="color" aria-label={option.label} value={selected.appearance[option.key]} onChange={(event) => updateAppearance({ [option.key]: event.target.value } as Partial<ClientPortalAppearance>)} className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5" /></span></label>)}
                </div>
                <div className="grid gap-2"><Label>Theme</Label><Select value={selected.appearance.theme} onValueChange={(value) => updateAppearance({ theme: value as ClientPortalAppearance["theme"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Layout width</Label><Select value={selected.appearance.width} onValueChange={(value) => updateAppearance({ width: value as ClientPortalAppearance["width"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="wide">Wide</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Corner style</Label><Select value={selected.appearance.radius} onValueChange={(value) => updateAppearance({ radius: value as ClientPortalAppearance["radius"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Square / small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Rounded / large</SelectItem></SelectContent></Select></div>
              </div>
            ) : null}

            <button type="button" onClick={() => setSection("general")} className={"flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left " + (section === "general" ? "border-primary/40 bg-primary/5" : "bg-background hover:bg-muted/30")}>
              <span><span className="block text-sm font-medium">Checkout content</span><span className="text-[10px] text-muted-foreground">Heading, URL and currency</span></span><span className="text-muted-foreground">›</span>
            </button>
            <button type="button" onClick={() => setSection("methods")} className={"flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left " + (section === "methods" ? "border-primary/40 bg-primary/5" : "bg-background hover:bg-muted/30")}>
              <span><span className="block text-sm font-medium">Payment methods</span><span className="text-[10px] text-muted-foreground">{selected.methods.length} selected methods</span></span><span className="text-muted-foreground">›</span>
            </button>
            <button type="button" onClick={() => setShowHeaderSettings((value) => !value)} className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-left">
              <span><span className="block text-sm font-medium">Header & footer</span><span className="text-[10px] text-muted-foreground">Branding and attribution</span></span><span className="text-muted-foreground">{showHeaderSettings ? "−" : "+"}</span>
            </button>
            {showHeaderSettings ? <div className="space-y-3 rounded-lg border bg-background p-3"><div className="grid gap-2"><Label>Brand name</Label><Input value={selected.appearance.brandName} onChange={(event) => updateAppearance({ brandName: event.target.value })} /></div><div className="grid gap-2"><Label>Logo URL</Label><Input value={selected.appearance.logoUrl} onChange={(event) => updateAppearance({ logoUrl: event.target.value })} placeholder="https://example.com/logo.svg" /></div><ToggleSetting title="Show logo" description="Display your brand mark in the checkout header." checked={selected.appearance.showLogo} onChange={(checked) => updateAppearance({ showLogo: checked })} /><ToggleSetting title="Show iPayCash attribution" description="Show Powered by iPayCash in the footer." checked={selected.appearance.showPlatformBranding} onChange={(checked) => updateAppearance({ showPlatformBranding: checked })} /></div> : null}
            {section === "appearance" ? (
              <div className="space-y-4 rounded-lg border bg-background p-3">
                <div className="grid gap-2"><Label>Brand / merchant name</Label><Input value={selected.appearance.brandName} onChange={(event) => updateAppearance({ brandName: event.target.value })} placeholder="Your brand name" /></div>
                <div className="grid gap-2"><Label>Logo URL</Label><Input value={selected.appearance.logoUrl} onChange={(event) => updateAppearance({ logoUrl: event.target.value })} placeholder="https://example.com/logo.svg" /></div>
                <div className="grid gap-2"><Label>Button text</Label><Input value={selected.appearance.buttonLabel} onChange={(event) => updateAppearance({ buttonLabel: event.target.value })} placeholder="Continue securely" /></div>
                <ToggleSetting title="Show logo" description="Display your brand mark." checked={selected.appearance.showLogo} onChange={(checked) => updateAppearance({ showLogo: checked })} />
                <ToggleSetting title="Show iPayCash attribution" description="Display platform branding." checked={selected.appearance.showPlatformBranding} onChange={(checked) => updateAppearance({ showPlatformBranding: checked })} />
              </div>
            ) : null}
            {section === "general" ? (
              <div className="space-y-4 rounded-lg border bg-background p-3">
                <div><h3 className="text-sm font-semibold">Checkout content</h3><p className="mt-1 text-[10px] text-muted-foreground">The URL slug defines the public link.</p></div>
                <div className="grid gap-2"><Label>Form name</Label><Input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value, appearance: { ...selected.appearance, title: selected.appearance.title === selected.name ? event.target.value : selected.appearance.title } })} /></div>
                <div className="grid gap-2"><Label>Checkout URL</Label><Input value={selected.slug} onChange={(event) => updateSelected({ slug: normalizeClientPortalSlug(event.target.value) })} /><p className="text-[10px] text-muted-foreground">/portal/{selected.slug || "your-form"}</p></div>
                <div className="grid gap-2"><Label>Environment</Label><Select value={selected.environment} onValueChange={(value) => updateSelected({ environment: value as ClientPortalForm["environment"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sandbox">Sandbox</SelectItem><SelectItem value="Production">Production</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Currency</Label><Select value={selected.currency} onValueChange={(value) => updateSelected({ currency: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TND">TND — Tunisian dinar</SelectItem><SelectItem value="USD">USD — US dollar</SelectItem><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="USDT">USDT — Tether</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Checkout heading</Label><Input value={selected.appearance.title} onChange={(event) => updateAppearance({ title: event.target.value })} /></div>
                <div className="grid gap-2"><Label>Description</Label><textarea value={selected.appearance.description} onChange={(event) => updateAppearance({ description: event.target.value })} rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
              </div>
            ) : null}
            {section === "methods" ? (
              <div className="space-y-4 rounded-lg border bg-background p-3">
                <div><h3 className="text-sm font-semibold">Payment methods</h3><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Choose which options appear in this form.</p></div>
                {clientPortalMethodOptions.map((method) => {
                  const active = selected.methods.includes(method);
                  return <button type="button" key={method} aria-pressed={active} onClick={() => toggleMethod(method)} className={"flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors " + (active ? "border-primary/40 bg-primary/5" : "hover:bg-muted/30")}><span className="flex min-w-0 items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[9px] font-bold">{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 3)}</span><span className="truncate text-xs font-medium">{method}</span></span>{active ? <Check className="size-4 text-primary" /> : <span className="size-4 rounded border" />}</button>;
                })}
                <p className="text-[10px] leading-4 text-muted-foreground">Only payment methods configured and enabled for the brand and country can be offered in production.</p>
              </div>
            ) : null}
          </div>
          <div className="border-t px-4 py-3"><p className="text-[10px] leading-4 text-muted-foreground">{notice || (selected.updated === "Unsaved changes" ? "Unsaved changes" : "Changes apply to preview. Save to retain them in this browser.")}</p></div>
        </aside>

        <main className="min-w-0 bg-muted/20 p-3 sm:p-5 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h2 className="text-sm font-semibold">Live preview</h2><p className="mt-1 text-[11px] text-muted-foreground">Updates as you customize this checkout form.</p></div>
              <div className="flex items-center gap-2"><Badge variant="outline">{previewMode === "desktop" ? "Desktop" : "Mobile"}</Badge><Badge variant="outline">{selected.environment}</Badge></div>
            </div>
            <CheckoutPreview form={selected} previewMode={previewMode} />
            <div className="rounded-xl border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-xs font-semibold">Public checkout URL</h3><p className="mt-1 break-all text-[11px] text-muted-foreground">{liveUrl}</p></div><Button size="sm" variant="outline" render={<a href={liveUrl} target="_blank" rel="noreferrer" />}><Eye className="size-3.5" /> Open preview</Button></div>
              <div className="mt-3 grid gap-2"><Label>Embed snippet</Label><pre className="overflow-x-auto rounded-lg border bg-muted/20 p-2.5 text-[10px] leading-4 text-muted-foreground"><code>{embedCode}</code></pre></div>
            </div>
          </div>
        </main>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-3">
        <div className="text-[10px] text-muted-foreground">Frontend prototype · settings are stored locally, not published to a shared backend.</div>
        <div className="flex gap-2"><Button variant="outline" onClick={onExit}>Exit builder</Button><Button onClick={save}><Save className="size-3.5" /> Save changes</Button></div>
      </div>
    </section>
  );
}

function ToggleSetting({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><Switch checked={checked} onCheckedChange={onChange} /></div>;
}

function CheckoutPreview({
  form,
  previewMode = "desktop",
}: {
  form: ClientPortalForm;
  previewMode?: "desktop" | "mobile";
}) {
  const { appearance } = form;
  const dark = appearance.theme === "dark";
  const background = appearance.backgroundColor;
  const surface = appearance.surfaceColor;
  const foreground = dark ? "#f8fafc" : "#0f172a";
  const muted = dark ? "#94a3b8" : "#64748b";
  const border = dark ? "#334155" : "#e2e8f0";
  const radius = appearance.radius === "small" ? "8px" : appearance.radius === "large" ? "22px" : "14px";
  const frameWidth = previewMode === "mobile" ? "390px" : appearance.width === "wide" ? "100%" : "600px";

  return (
    <div className="mx-auto w-full transition-all duration-200" style={{ maxWidth: frameWidth }}>
      <div className="overflow-hidden border bg-background shadow-lg" style={{ borderRadius: "14px", borderColor: border }}>
        <div className="flex items-center gap-1.5 border-b bg-muted/30 px-3 py-2.5" style={{ borderColor: border }}>
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <div className="mx-auto flex h-6 min-w-0 max-w-[520px] flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 text-[10px] text-muted-foreground" style={{ borderColor: border }}>
            <Globe2 className="size-3 shrink-0" /><span className="truncate">{typeof window === "undefined" ? "checkout.local" : window.location.host}/portal/{form.slug}</span>
          </div>
          <span className="w-7" />
        </div>
        <div style={{ backgroundColor: background, color: foreground }}>
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ backgroundColor: surface, borderColor: border }}>
            <div className="flex min-w-0 items-center gap-2.5">
              {appearance.showLogo ? (appearance.logoUrl ? <img src={appearance.logoUrl} alt="" className="size-8 shrink-0 rounded-lg object-contain" /> : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold" style={{ backgroundColor: appearance.primaryColor, color: dark ? "#052e22" : "#fff" }}>{(appearance.brandName || "iP").slice(0, 2).toUpperCase()}</span>) : null}
              <div className="min-w-0"><p className="truncate text-xs font-semibold">{appearance.brandName || "Your brand"}</p><p className="mt-0.5 text-[9px]" style={{ color: muted }}>Secure checkout</p></div>
            </div>
            <div className="flex items-center gap-1 text-[9px]" style={{ color: appearance.primaryColor }}><Check className="size-3" /> Secure</div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mx-auto space-y-4" style={{ maxWidth: "450px" }}>
              <div><p className="text-base font-semibold">{appearance.title || form.name}</p><p className="mt-1 text-xs leading-5" style={{ color: muted }}>{appearance.description}</p></div>
              <div className="border p-4" style={{ backgroundColor: surface, borderColor: border, borderRadius: radius }}>
                <div className="flex items-center justify-between gap-2"><span className="text-[11px]" style={{ color: muted }}>Deposit amount</span><Badge variant="outline">{form.currency}</Badge></div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">250.00 <span className="text-xs font-medium" style={{ color: muted }}>{form.currency}</span></p>
              </div>
              <div><p className="mb-2 text-xs font-medium">Choose payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  {form.methods.slice(0, previewMode === "mobile" ? 4 : 6).map((method) => <div key={method} className="flex min-w-0 items-center gap-2 border p-2.5 text-[10px]" style={{ borderColor: border, backgroundColor: surface, borderRadius: radius }}><span className="flex size-6 shrink-0 items-center justify-center rounded-md text-[8px] font-bold" style={{ backgroundColor: appearance.primaryColor, color: dark ? "#052e22" : "#fff" }}>{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span className="truncate">{method}</span></div>)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-1.5"><span className="text-[10px]" style={{ color: muted }}>Player ID</span><div className="border px-3 py-2.5 text-[11px]" style={{ borderColor: border, backgroundColor: surface, borderRadius: radius }}>Enter your player ID</div></div>
                <div className="grid gap-1.5"><span className="text-[10px]" style={{ color: muted }}>Email (optional)</span><div className="border px-3 py-2.5 text-[11px]" style={{ borderColor: border, backgroundColor: surface, borderRadius: radius }}>you@example.com</div></div>
              </div>
              <Button className="w-full" style={{ backgroundColor: appearance.primaryColor, color: dark ? "#052e22" : "#fff", borderRadius: radius }}>{appearance.buttonLabel || "Continue securely"}</Button>
              {appearance.showPlatformBranding ? <p className="text-center text-[9px]" style={{ color: muted }}>Powered by iPayCash</p> : null}
              <div className="flex items-center justify-center gap-1.5 text-[9px]" style={{ color: muted }}><ShieldCheckIcon /> Protected checkout · {form.slug}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-1"><Monitor className="size-3" /> Desktop responsive</span>
        <span className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-1"><Smartphone className="size-3" /> Mobile responsive</span>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg border bg-background p-3 text-[10px] leading-4 text-muted-foreground"><Sparkles className="mt-0.5 size-3.5 shrink-0" /> This is a visual preview. Production checkout must use backend-published settings and verified payment-provider sessions.</div>
    </div>
  );
}

function ShieldCheckIcon() {
  return <Globe2 className="size-3.5" />;
}

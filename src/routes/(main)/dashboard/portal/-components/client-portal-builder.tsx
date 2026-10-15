import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe2,
  LayoutTemplate,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export function ClientPortalBuilder() {
  const [forms, setForms] = useState<ClientPortalForm[]>(() => getClientPortalForms());
  const [selectedId, setSelectedId] = useState(() => getClientPortalForms()[0]?.id ?? "");
  const [section, setSection] = useState<EditorSection>("general");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("New Checkout Form");
  const [newSlug, setNewSlug] = useState("new-checkout");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const latest = getClientPortalForms();
      setForms(latest);
      setSelectedId((current) => latest.some((form) => form.id === current) ? current : (latest[0]?.id ?? ""));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("ipaycash-client-portal-forms-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ipaycash-client-portal-forms-changed", refresh);
    };
  }, []);

  const selected = forms.find((form) => form.id === selectedId) ?? forms[0];
  const publishedCount = forms.filter((form) => form.status === "Published").length;
  const liveUrl = useMemo(() => {
    const origin = typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;
    return origin + "/portal/" + (selected?.slug ?? "main-deposit");
  }, [selected?.slug]);
  const embedCode = '<iframe src="' + liveUrl + '" title="' + (selected?.name ?? "iPayCash checkout") + '" width="100%" height="680" loading="lazy" style="border:0;border-radius:16px"></iframe>';

  const updateSelected = (patch: Partial<ClientPortalForm>) => {
    if (!selected) return;
    setForms((current) => current.map((form) => form.id === selected.id ? { ...form, ...patch, updated: "Unsaved changes" } : form));
    setNotice("");
  };

  const updateAppearance = (patch: Partial<ClientPortalAppearance>) => {
    if (!selected) return;
    updateSelected({ appearance: { ...selected.appearance, ...patch } });
  };

  const save = (nextForms = forms) => {
    const usedSlugs = new Set<string>();
    const normalized = nextForms.map((form) => {
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

  const createForm = () => {
    const slug = uniqueSlug(newSlug || newName, forms);
    const name = newName.trim() || "Untitled checkout";
    const next: ClientPortalForm = {
      id: makeId(),
      name,
      slug,
      environment: "Sandbox",
      methods: ["Flouci", "D17"],
      status: "Draft",
      isDefault: false,
      sessions: 0,
      conversion: "—",
      updated: formatUpdated(),
      currency: "TND",
      appearance: {
        brandName: "iPayCash",
        logoUrl: "",
        showLogo: true,
        showPlatformBranding: true,
        title: name,
        description: "Choose your preferred payment method and complete your checkout securely.",
        buttonLabel: "Continue securely",
        theme: "dark",
        width: "compact",
        radius: "medium",
        primaryColor: "#34d399",
        backgroundColor: "#020617",
        surfaceColor: "#0f172a",
      },
    };
    const updated = [next, ...forms];
    setForms(updated);
    setSelectedId(next.id);
    setSection("general");
    setCreateOpen(false);
    setNewName("New Checkout Form");
    setNewSlug("new-checkout");
    save(updated);
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
    setForms(updated);
    setSelectedId(copy.id);
    setSection("general");
    save(updated);
  };

  const publishSelected = () => {
    if (!selected) return;
    const publishing = selected.status !== "Published";
    const hasDefault = forms.some((form) => form.id !== selected.id && form.status === "Published" && form.isDefault);
    const updated = forms.map((form) => {
      if (form.id === selected.id) {
        return { ...form, status: publishing ? "Published" as const : "Draft" as const, isDefault: publishing && (!hasDefault || form.isDefault) };
      }
      if (publishing && !hasDefault) return { ...form, isDefault: false };
      if (!publishing && selected.isDefault && form.status === "Published") return { ...form, isDefault: true };
      return form;
    });
    save(updated);
    setNotice(publishing
      ? "Form published to the local demo configuration. Server-side payment processing is not activated by this action."
      : "Form moved to Draft. Existing public links will fall back to the default published form.");
  };

  const setAsDefault = () => {
    if (!selected) return;
    const updated = forms.map((form) => ({
      ...form,
      isDefault: form.id === selected.id,
      status: form.id === selected.id ? "Published" as const : form.status,
    }));
    save(updated);
    setNotice("Default checkout layout updated for this browser.");
  };

  const deleteSelected = () => {
    if (!selected || forms.length <= 1) {
      setNotice("At least one checkout form must remain.");
      return;
    }
    const remaining = forms.filter((form) => form.id !== selected.id);
    if (selected.isDefault) {
      const nextDefault = remaining.find((form) => form.status === "Published") ?? remaining[0];
      nextDefault.isDefault = true;
      nextDefault.status = "Published";
    }
    save(remaining);
    setSelectedId(remaining[0].id);
    setNotice("Checkout form deleted from the local demo configuration.");
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setNotice("Embed code copied.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNotice("Clipboard access was blocked. Select and copy the embed code manually.");
    }
  };

  if (!selected) return null;

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><LayoutTemplate className="size-4" /> Configs / Client Portal</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Client Portal</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Build multiple hosted checkout forms and customize each one independently, with an instant preview of the player-facing layout.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline"><WalletCards className="mr-1 size-3.5" /> {forms.length} forms</Badge>
          <Badge variant="secondary">{publishedCount} published</Badge>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="size-4" /> Create form</Button>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[260px_minmax(320px,1fr)_minmax(320px,0.9fr)]">
        <Card className="h-fit shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2"><CardTitle className="text-sm">Your checkout forms</CardTitle><Badge variant="outline">{forms.length}</Badge></div>
            <p className="text-xs text-muted-foreground">Select a form to edit its own settings.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {forms.map((form) => (
              <button
                key={form.id}
                type="button"
                onClick={() => { setSelectedId(form.id); setNotice(""); }}
                className={"w-full rounded-xl border p-3 text-left transition-colors " + (selected.id === form.id ? "border-primary bg-primary/5 ring-1 ring-primary/10" : "hover:bg-muted/40")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><WalletCards className="size-4" /></span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {form.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                    <Badge variant={form.status === "Published" ? "outline" : "secondary"}>{form.status}</Badge>
                  </div>
                </div>
                <p className="mt-3 truncate text-sm font-semibold">{form.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">/portal/{form.slug}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{form.methods.length} payment methods · {form.environment}</p>
              </button>
            ))}
            <Button className="w-full" variant="outline" size="sm" onClick={() => setCreateOpen(true)}><Plus className="size-3.5" /> Create another form</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0"><h2 className="truncate text-lg font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">Form ID: {selected.id} · Last update: {selected.updated}</p></div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={duplicateSelected}><Copy className="size-3.5" /> Duplicate</Button>
              <Button variant="outline" size="sm" onClick={deleteSelected} disabled={forms.length <= 1}><Trash2 className="size-3.5" /> Delete</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/30 p-1">
            {sectionOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => setSection(item.id)} className={"rounded-lg px-2 py-2 text-xs font-medium transition-colors " + (section === item.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {item.title}
              </button>
            ))}
          </div>

          <Card className="shadow-none">
            <CardContent className="space-y-5 p-4 sm:p-5">
              {section === "general" ? (
                <>
                  <div><h3 className="text-sm font-semibold">General information</h3><p className="mt-1 text-xs text-muted-foreground">The form name and slug determine how this checkout is identified.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Internal form name</Label><Input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value, appearance: { ...selected.appearance, title: selected.appearance.title === selected.name ? event.target.value : selected.appearance.title } })} /></div>
                    <div className="grid gap-2"><Label>Checkout URL slug</Label><Input value={selected.slug} onChange={(event) => updateSelected({ slug: normalizeClientPortalSlug(event.target.value) })} /><p className="text-[11px] text-muted-foreground">/portal/{selected.slug || "your-form"}</p></div>
                    <div className="grid gap-2"><Label>Environment</Label><Select value={selected.environment} onValueChange={(value) => updateSelected({ environment: value as ClientPortalForm["environment"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sandbox">Sandbox</SelectItem><SelectItem value="Production">Production</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Preview currency (visual only)</Label><Select value={selected.currency} onValueChange={(value) => updateSelected({ currency: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TND">TND — Tunisian dinar</SelectItem><SelectItem value="USD">USD — US dollar</SelectItem><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="USDT">USDT — Tether</SelectItem></SelectContent></Select><p className="text-[11px] text-muted-foreground">Actual currency and limits are determined by the selected payment provider. This field only changes the mock preview.</p></div>
                  </div>
                  <div className="grid gap-2"><Label>Checkout heading</Label><Input value={selected.appearance.title} onChange={(event) => updateAppearance({ title: event.target.value })} placeholder="Make a deposit" /></div>
                  <div className="grid gap-2"><Label>Checkout description</Label><textarea value={selected.appearance.description} onChange={(event) => updateAppearance({ description: event.target.value })} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
                </>
              ) : null}

              {section === "methods" ? (
                <div className="space-y-4">
                  <div><h3 className="text-sm font-semibold">Available payment methods</h3><p className="mt-1 text-xs text-muted-foreground">Only selected methods are shown in the checkout preview and this form's public checkout.</p></div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {clientPortalMethodOptions.map((method) => {
                      const active = selected.methods.includes(method);
                      return <button type="button" key={method} aria-pressed={active} onClick={() => toggleMethod(method)} className={"flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors " + (active ? "border-primary/50 bg-primary/5" : "hover:bg-muted/30")}><span className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-bold">{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 3)}</span><span className="truncate text-sm font-medium">{method}</span></span>{active ? <Check className="size-4 shrink-0 text-primary" /> : <span className="size-4 shrink-0 rounded border" />}</button>;
                    })}
                  </div>
                  <p className="text-[11px] leading-5 text-muted-foreground">Provider availability and automated processing still depend on the actual backend integration and the countries/currencies enabled for that provider.</p>
                </div>
              ) : null}

              {section === "appearance" ? (
                <div className="space-y-5">
                  <div><h3 className="text-sm font-semibold">Checkout appearance</h3><p className="mt-1 text-xs text-muted-foreground">Customize the public portal layout independently for this form.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Brand / merchant name</Label><Input value={selected.appearance.brandName} onChange={(event) => updateAppearance({ brandName: event.target.value })} placeholder="Your brand name" /></div>
                    <div className="grid gap-2"><Label>Logo URL (optional)</Label><Input value={selected.appearance.logoUrl} onChange={(event) => updateAppearance({ logoUrl: event.target.value })} placeholder="https://example.com/logo.svg" /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Theme</Label><Select value={selected.appearance.theme} onValueChange={(value) => updateAppearance({ theme: value as ClientPortalAppearance["theme"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark">Dark</SelectItem><SelectItem value="light">Light</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Content width</Label><Select value={selected.appearance.width} onValueChange={(value) => updateAppearance({ width: value as ClientPortalAppearance["width"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="wide">Wide</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Corner radius</Label><Select value={selected.appearance.radius} onValueChange={(value) => updateAppearance({ radius: value as ClientPortalAppearance["radius"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Checkout button label</Label><Input value={selected.appearance.buttonLabel} onChange={(event) => updateAppearance({ buttonLabel: event.target.value })} placeholder="Continue securely" /></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {portalColorOptions.map((option) => (
                      <label key={option.key} className="grid gap-2 rounded-xl border p-3">
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="flex items-center gap-2"><input type="color" value={selected.appearance[option.key]} onChange={(event) => updateAppearance({ [option.key]: event.target.value } as Partial<ClientPortalAppearance>)} className="size-9 cursor-pointer rounded-md border bg-transparent p-1" /><code className="text-[11px] text-muted-foreground">{selected.appearance[option.key]}</code></span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <ToggleSetting title="Show logo / brand mark" description="Display the brand logo in the checkout header." checked={selected.appearance.showLogo} onChange={(checked) => updateAppearance({ showLogo: checked })} />
                    <ToggleSetting title="Show iPayCash attribution" description="Display a small Powered by iPayCash label." checked={selected.appearance.showPlatformBranding} onChange={(checked) => updateAppearance({ showPlatformBranding: checked })} />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">{notice || "Changes are not saved until you click Save changes."}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={setAsDefault}>Set as default</Button>
              <Button variant="outline" onClick={publishSelected}>{selected.status === "Published" ? "Move to draft" : "Publish form"}</Button>
              <Button onClick={() => save()}><Save className="size-4" /> Save changes</Button>
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="text-sm">Public checkout link</CardTitle><Badge variant="outline">{selected.environment}</Badge></div></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row"><Input value={liveUrl} readOnly /><Button variant="outline" onClick={() => void copyEmbed()} disabled={selected.status !== "Published"}><Copy className="size-3.5" /> Copy embed</Button><Button variant="outline" disabled={selected.status !== "Published"} render={<a href={liveUrl} target="_blank" rel="noreferrer" />}><ExternalLink className="size-3.5" /> Open</Button></div>
              <pre className="overflow-x-auto rounded-xl border bg-muted/30 p-3 text-[11px] leading-5 text-muted-foreground"><code>{embedCode}</code></pre>
              <p className="text-[11px] leading-5 text-muted-foreground">{selected.status === "Draft" ? "This form is a draft. Use the live preview above; publish it before opening the public URL or copying its embed code. " : ""}Demo behavior: form configuration is stored in this browser's localStorage. Publishing does not connect payment APIs, create provider sessions or persist settings to a server. A live multi-user product needs backend persistence and server-side payment validation.</p>
            </CardContent>
          </Card>
        </div>

        <CheckoutPreview form={selected} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create checkout form</DialogTitle><DialogDescription>Start with an independent draft and customize its payment methods and appearance.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Form name</Label><Input value={newName} onChange={(event) => { setNewName(event.target.value); if (!newSlug || newSlug === normalizeClientPortalSlug(newName)) setNewSlug(normalizeClientPortalSlug(event.target.value)); }} /></div>
            <div className="grid gap-2"><Label>URL slug</Label><Input value={newSlug} onChange={(event) => setNewSlug(normalizeClientPortalSlug(event.target.value))} /><p className="text-[11px] text-muted-foreground">/portal/{newSlug || "your-form"}</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={createForm}><Plus className="size-4" /> Create draft</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ToggleSetting({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><Switch checked={checked} onCheckedChange={onChange} /></div>;
}

function CheckoutPreview({ form }: { form: ClientPortalForm }) {
  const { appearance } = form;
  const bg = appearance.backgroundColor;
  const surface = appearance.surfaceColor;
  const foreground = appearance.theme === "dark" ? "#f8fafc" : "#0f172a";
  const muted = appearance.theme === "dark" ? "#94a3b8" : "#64748b";
  const radius = appearance.radius === "small" ? "8px" : appearance.radius === "large" ? "22px" : "14px";
  const width = appearance.width === "wide" ? "100%" : "100%";

  return (
    <div className="xl:sticky xl:top-4 xl:self-start">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Live checkout preview</h2><p className="text-xs text-muted-foreground">Updates as you customize the selected form.</p></div><Badge variant="outline"><Eye className="mr-1 size-3.5" /> Preview</Badge></div>
      <div className="overflow-hidden border shadow-sm" style={{ backgroundColor: bg, color: foreground, borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0", borderRadius: radius }}>
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ backgroundColor: surface, borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>
          <div className="flex min-w-0 items-center gap-2.5">
            {appearance.showLogo ? (appearance.logoUrl ? <img src={appearance.logoUrl} alt="" className="size-9 shrink-0 rounded-lg object-contain" /> : <div className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: appearance.primaryColor, color: appearance.theme === "dark" ? "#052e22" : "#ffffff" }}>{appearance.brandName.slice(0, 2).toUpperCase()}</div>) : null}
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{appearance.brandName || "Your brand"}</p><p className="text-[10px]" style={{ color: muted }}>Secure checkout</p></div>
          </div>
          {form.environment === "Sandbox" ? <Badge variant="outline">Test mode</Badge> : <span className="flex items-center gap-1 text-[10px]" style={{ color: appearance.primaryColor }}><Check className="size-3.5" /> Secure</span>}
        </div>
        <div className="p-4 sm:p-5">
          <div className="mx-auto space-y-4" style={{ maxWidth: width }}>
            <div><p className="text-lg font-semibold">{appearance.title || form.name}</p><p className="mt-1 text-xs leading-5" style={{ color: muted }}>{appearance.description}</p></div>
            <div className="rounded-xl border p-3" style={{ borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0", backgroundColor: surface, borderRadius: radius }}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs" style={{ color: muted }}>Amount</span><Badge variant="outline">{form.currency}</Badge></div>
              <p className="mt-2 text-2xl font-semibold">250.00 <span className="text-sm font-medium">{form.currency}</span></p>
            </div>
            <div><p className="mb-2 text-xs font-medium">Choose payment method</p><div className="grid grid-cols-2 gap-2">{form.methods.slice(0, 4).map((method) => <div key={method} className="flex items-center gap-2 rounded-lg border p-2.5 text-xs" style={{ borderColor: appearance.theme === "dark" ? "#334155" : "#e2e8f0", backgroundColor: surface, borderRadius: radius }}><span className="flex size-6 items-center justify-center rounded-md text-[9px] font-bold" style={{ backgroundColor: appearance.primaryColor, color: appearance.theme === "dark" ? "#052e22" : "#fff" }}>{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span className="truncate">{method}</span></div>)}</div></div>
            <Button className="w-full" style={{ backgroundColor: appearance.primaryColor, color: appearance.theme === "dark" ? "#052e22" : "#ffffff", borderRadius: radius }}>{appearance.buttonLabel || "Continue securely"}</Button>
            {appearance.showPlatformBranding ? <p className="text-center text-[10px]" style={{ color: muted }}>Powered by iPayCash</p> : null}
            <div className="flex items-center justify-center gap-1.5 text-[10px]" style={{ color: muted }}><ShieldCheckIcon /> Encrypted checkout · {form.slug}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2"><div className="flex items-center gap-2 rounded-lg border p-2.5 text-xs text-muted-foreground"><Monitor className="size-3.5" /> Desktop responsive</div><div className="flex items-center gap-2 rounded-lg border p-2.5 text-xs text-muted-foreground"><Smartphone className="size-3.5" /> Mobile responsive</div></div>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/30 p-3 text-[11px] leading-5 text-muted-foreground"><Sparkles className="size-4 shrink-0" /> Preview changes are local. Production checkout must use server-validated settings and provider sessions.</div>
    </div>
  );
}

function ShieldCheckIcon() {
  return <Globe2 className="size-3.5" />;
}

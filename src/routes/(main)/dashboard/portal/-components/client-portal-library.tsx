import { useEffect, useState } from "react";
import { Check, ExternalLink, Eye, Globe2, LayoutTemplate, Pencil, Plus, Power, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CLIENT_PORTAL_FORMS_CHANGE_EVENT,
  getClientPortalForms,
  normalizeClientPortalSlug,
  saveClientPortalForms,
  type ClientPortalForm,
} from "@/lib/client-portal-config";

type TemplateId = "stripe" | "classic" | "minimal";

const layoutPresets: Record<TemplateId, {
  label: string;
  description: string;
  theme: "dark" | "light";
  width: "compact" | "wide";
  radius: "small" | "medium" | "large";
  fontFamily: "system" | "sans" | "serif";
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
}> = {
  stripe: {
    label: "Stripe",
    description: "Modern dark checkout with green actions",
    theme: "dark",
    width: "compact",
    radius: "medium",
    fontFamily: "sans",
    primaryColor: "#34d399",
    backgroundColor: "#020617",
    surfaceColor: "#0f172a",
  },
  classic: {
    label: "Classic",
    description: "Warm light canvas and traditional typography",
    theme: "light",
    width: "wide",
    radius: "small",
    fontFamily: "serif",
    primaryColor: "#315b8a",
    backgroundColor: "#f7f3eb",
    surfaceColor: "#fffdf7",
  },
  minimal: {
    label: "Minimal",
    description: "Bright, spacious and teal-accented",
    theme: "light",
    width: "compact",
    radius: "large",
    fontFamily: "system",
    primaryColor: "#0f766e",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
  },
};

function currentTimestamp() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function safeSlug(value: string, forms: ClientPortalForm[]) {
  const base = normalizeClientPortalSlug(value) || "checkout";
  let slug = base;
  let count = 2;
  while (forms.some((form) => form.slug === slug)) {
    slug = base + "-" + count;
    count += 1;
  }
  return slug;
}

export function ClientPortalFormsLibrary({
  onCustomize,
}: {
  onCustomize: (slug: string) => void;
}) {
  const [forms, setForms] = useState<ClientPortalForm[]>(() => getClientPortalForms());
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("New Checkout Form");
  const [newSlug, setNewSlug] = useState("new-checkout");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("stripe");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setForms(getClientPortalForms());
    window.addEventListener("storage", refresh);
    window.addEventListener(CLIENT_PORTAL_FORMS_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CLIENT_PORTAL_FORMS_CHANGE_EVENT, refresh);
    };
  }, []);

  const persist = (next: ClientPortalForm[], message: string) => {
    const normalized = next.map((form) => ({ ...form, updated: currentTimestamp() }));
    saveClientPortalForms(normalized);
    setForms(normalized);
    setNotice(message);
  };

  const createForm = () => {
    const name = newName.trim() || "Untitled checkout";
    const slug = safeSlug(newSlug || name, forms);
    const layout = layoutPresets[newTemplate];
    const form: ClientPortalForm & { builder: { template: TemplateId } } = {
      id: "FORM-" + Date.now().toString(36).toUpperCase(),
      name,
      slug,
      environment: "Sandbox",
      methods: ["Flouci", "D17"],
      status: "Draft",
      isDefault: false,
      sessions: 0,
      conversion: "—",
      updated: currentTimestamp(),
      currency: "TND",
      appearance: {
        brandName: "iPayCash",
        logoUrl: "",
        showLogo: true,
        showPlatformBranding: true,
        title: name,
        description: "Choose your preferred payment method and complete your checkout securely.",
        buttonLabel: "Continue securely",
        theme: layout.theme,
        width: layout.width,
        radius: layout.radius,
        fontFamily: layout.fontFamily,
        primaryColor: layout.primaryColor,
        backgroundColor: layout.backgroundColor,
        surfaceColor: layout.surfaceColor,
      },
      builder: { template: newTemplate },
    };
    const next = [form, ...forms];
    persist(next, "Draft created. Customize it before publishing.");
    setNewName("New Checkout Form");
    setNewSlug("new-checkout");
    setNewTemplate("stripe");
    setCreateOpen(false);
    onCustomize(form.id);
  };

  const toggleStatus = (form: ClientPortalForm) => {
    const activating = form.status !== "Published";
    const activeDefault = forms.some((item) => item.id !== form.id && item.status === "Published" && item.isDefault);
    const next = forms.map((item) => {
      if (item.id === form.id) {
        return {
          ...item,
          status: activating ? "Published" as const : "Draft" as const,
          isDefault: activating && (!activeDefault || item.isDefault),
        };
      }
      if (activating && !activeDefault && !item.isDefault) return { ...item, isDefault: false };
      if (!activating && form.isDefault && item.status === "Published") return { ...item, isDefault: true };
      return item;
    });
    persist(next, activating
      ? "Form activated in this browser's demo configuration. Payment processing is not enabled by this action."
      : "Form deactivated. Its checkout configuration is no longer marked as published.");
  };

  const deleteForm = (form: ClientPortalForm) => {
    if (forms.length <= 1) {
      setNotice("At least one form must remain in the library.");
      return;
    }
    if (!window.confirm('Delete "' + form.name + '"? This removes the local demo configuration.')) return;
    const next = forms.filter((item) => item.id !== form.id);
    if (form.isDefault) {
      const replacement = next.find((item) => item.status === "Published") ?? next[0];
      replacement.isDefault = true;
      replacement.status = "Published";
    }
    persist(next, "Form deleted from the local demo configuration.");
  };

  const openPreview = (form: ClientPortalForm) => {
    const origin = window.location.origin;
    window.open(origin + "/portal/" + form.slug + "?preview=1", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="flex min-h-full flex-col gap-5 bg-background">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><LayoutTemplate className="size-4" /> Configs / Client Portal</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Client Portal</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Create multiple checkout experiences, customize each form independently, and control which forms are published.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" /> Create form</Button>
      </div>

      {notice ? <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{notice}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold">Your checkout forms</h2><p className="mt-1 text-xs text-muted-foreground">Choose a layout to preview, customize or manage its publication status.</p></div>
        <Badge variant="outline">{forms.length} forms</Badge>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {forms.map((form) => (
          <Card key={form.id} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border-slate-200 bg-card py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
            <div className="relative border-b border-slate-200 p-2.5" style={{ background: form.appearance.theme === "dark" ? "linear-gradient(145deg, #0f172a, #1e293b)" : "linear-gradient(145deg, #f1f5f9, #ffffff)" }}>
              <div className="overflow-hidden border shadow-md transition-transform duration-200 group-hover:shadow-lg" style={{ backgroundColor: form.appearance.surfaceColor, borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0", borderRadius: form.appearance.radius === "small" ? "6px" : form.appearance.radius === "large" ? "20px" : "12px" }}>
                <div className="flex h-7 items-center gap-1.5 border-b px-2.5" style={{ borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>
                  <span className="size-1.5 rounded-full bg-rose-400" /><span className="size-1.5 rounded-full bg-amber-300" /><span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 flex h-4 min-w-0 flex-1 items-center truncate rounded-full border px-2 text-[8px]" style={{ color: form.appearance.theme === "dark" ? "#94a3b8" : "#64748b", borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>checkout.ipaycash.test/{form.slug}</span>
                </div>
                <div className="min-h-[172px] p-3.5" style={{ color: form.appearance.theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {form.appearance.showLogo ? <span className="flex size-7 shrink-0 items-center justify-center rounded-md text-[9px] font-bold" style={{ backgroundColor: form.appearance.primaryColor, color: "#fff" }}>{(form.appearance.brandName || "IP").slice(0, 2).toUpperCase()}</span> : null}
                      <span className="truncate text-[10px] font-semibold">{form.appearance.brandName}</span>
                    </div>
                    <Globe2 className="size-3.5 shrink-0" style={{ color: form.appearance.primaryColor }} />
                  </div>
                  <div className="mx-auto mt-4 max-w-[310px]">
                    <p className="text-sm font-semibold">{form.appearance.title || form.name}</p>
                    <p className="mt-1 line-clamp-2 text-[9px] leading-4" style={{ color: form.appearance.theme === "dark" ? "#94a3b8" : "#64748b" }}>{form.appearance.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {form.methods.slice(0, 4).map((method) => <span key={method} className="rounded-md border px-2 py-2 text-[9px]" style={{ borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>{method}</span>)}
                    </div>
                    <div className="mt-3 rounded-md py-2 text-center text-[9px] font-semibold" style={{ backgroundColor: form.appearance.primaryColor, color: "#fff" }}>{form.appearance.buttonLabel}</div>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-3 p-3.5">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <Badge variant={form.status === "Published" ? "secondary" : "outline"} className={form.status === "Published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-slate-300 bg-slate-100 text-slate-600"}>{form.status === "Published" ? <><Check className="mr-1 size-3" /> Published</> : "Draft"}</Badge>
                {form.isDefault ? <Badge variant="outline" className="border-blue-500/20 bg-blue-500/5 text-blue-700">Default</Badge> : null}
                <span className="ml-auto text-[10px] text-muted-foreground">{form.currency}</span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight" title={form.name}>{form.name}</h3>
                <p className="mt-1 truncate text-[11px] text-muted-foreground" title={"/portal/" + form.slug}>/portal/{form.slug}</p>
              </div>

              <div className="grid grid-cols-3 divide-x rounded-lg border border-slate-200/80 bg-muted/30 py-2.5">
                <div className="min-w-0 px-2"><p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">Sessions</p><p className="mt-1 text-xs font-semibold tabular-nums">{form.sessions.toLocaleString()}</p></div>
                <div className="min-w-0 px-2"><p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">Conversion</p><p className="mt-1 text-xs font-semibold tabular-nums">{form.conversion}</p></div>
                <div className="min-w-0 px-2"><p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">Methods</p><p className="mt-1 text-xs font-semibold tabular-nums">{form.methods.length}</p></div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                <Button className="min-w-0 px-2" variant="outline" size="sm" onClick={() => openPreview(form)}><Eye className="size-3.5 shrink-0" /> Preview</Button>
                <Button className="min-w-0 px-2" size="sm" onClick={() => onCustomize(form.id)}><Pencil className="size-3.5 shrink-0" /> Customize</Button>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
                <Button className="flex-1" size="sm" variant={form.status === "Published" ? "outline" : "default"} onClick={() => toggleStatus(form)}><Power className="size-3.5 shrink-0" /> {form.status === "Published" ? "Deactivate" : "Activate"}</Button>
                <Button className="size-9 shrink-0" size="icon" variant="ghost" aria-label={"Delete " + form.name} title="Delete form" disabled={forms.length <= 1} onClick={() => deleteForm(form)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <button type="button" onClick={() => setCreateOpen(true)} className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/10 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
          <span className="flex size-12 items-center justify-center rounded-2xl border bg-background"><Plus className="size-5" /></span>
          <span className="text-sm font-semibold">Create another checkout</span>
          <span className="max-w-xs text-xs leading-5 text-muted-foreground">Start with a separate draft, then customize its theme, methods and content.</span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">Create form <ExternalLink className="size-3.5" /></span>
        </button>
      </div>

      <div className="rounded-xl border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">Prototype notice: form settings, activation and deletion are saved in this browser's localStorage only. Conversion and session values are demo data. Publishing is not a live payment integration; backend persistence and server-side activation controls are still required.</div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create checkout form</DialogTitle><DialogDescription>Each checkout has independent configuration and publication status.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Form name</Label><Input value={newName} onChange={(event) => { setNewName(event.target.value); if (!newSlug || newSlug === normalizeClientPortalSlug(newName)) setNewSlug(normalizeClientPortalSlug(event.target.value)); }} placeholder="VIP Deposit Checkout" /></div>
            <div className="grid gap-2"><Label>URL slug</Label><Input value={newSlug} onChange={(event) => setNewSlug(normalizeClientPortalSlug(event.target.value))} placeholder="vip-deposit" /><p className="text-[11px] text-muted-foreground">/portal/{newSlug || "your-form"}</p></div>
            <div className="grid gap-2">
              <div><Label>Choose a starting layout</Label><p className="mt-1 text-xs text-muted-foreground">You can change colors, fonts, layout and blocks later in the Builder.</p></div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.entries(layoutPresets) as [TemplateId, (typeof layoutPresets)[TemplateId]][]).map(([id, layout]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={newTemplate === id}
                    onClick={() => setNewTemplate(id)}
                    className={"rounded-xl border p-2.5 text-left transition " + (newTemplate === id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/30")}
                  >
                    <div className="mb-3 rounded-lg border p-2.5" style={{ backgroundColor: layout.backgroundColor, borderColor: layout.primaryColor, borderRadius: layout.radius === "small" ? 4 : layout.radius === "large" ? 14 : 8 }}>
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: layout.primaryColor }} />
                        <span className="h-1.5 w-12 rounded-full" style={{ backgroundColor: layout.theme === "dark" ? "#64748b" : "#cbd5e1" }} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-4 rounded border" style={{ backgroundColor: layout.surfaceColor, borderColor: layout.theme === "dark" ? "#334155" : "#e2e8f0" }} />
                        <div className="h-3 rounded" style={{ backgroundColor: layout.primaryColor, borderRadius: layout.radius === "large" ? 999 : layout.radius === "small" ? 2 : 6 }} />
                      </div>
                    </div>
                    <span className="flex items-center justify-between gap-1 text-xs font-semibold">{layout.label}{newTemplate === id ? <Check className="size-3.5 text-primary" /> : null}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{layout.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={createForm}><Plus className="size-4" /> Create & customize</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}


import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Check, ExternalLink, Eye, Globe2, LayoutTemplate, Pencil, Plus, Power, Trash2, WalletCards } from "lucide-react";

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

function currentTimestamp() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function conversionNumber(value: string) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
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

  const published = forms.filter((form) => form.status === "Published").length;
  const totalSessions = forms.reduce((sum, form) => sum + form.sessions, 0);
  const averageConversion = useMemo(() => {
    const values = forms.map((form) => conversionNumber(form.conversion)).filter((value): value is number => value !== null);
    return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) + "%" : "—";
  }, [forms]);

  const persist = (next: ClientPortalForm[], message: string) => {
    const normalized = next.map((form) => ({ ...form, updated: currentTimestamp() }));
    saveClientPortalForms(normalized);
    setForms(normalized);
    setNotice(message);
  };

  const createForm = () => {
    const name = newName.trim() || "Untitled checkout";
    const slug = safeSlug(newSlug || name, forms);
    const form: ClientPortalForm = {
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
        theme: "dark",
        width: "compact",
        radius: "medium",
        primaryColor: "#34d399",
        backgroundColor: "#020617",
        surfaceColor: "#0f172a",
      },
    };
    const next = [form, ...forms];
    persist(next, "Draft created. Customize it before publishing.");
    setNewName("New Checkout Form");
    setNewSlug("new-checkout");
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<LayoutTemplate className="size-4" />} label="Total forms" value={String(forms.length)} detail="Checkout layouts" />
        <Metric icon={<Power className="size-4" />} label="Published" value={String(published)} detail={forms.length ? Math.round(published / forms.length * 100) + "% of forms" : "No forms"} />
        <Metric icon={<Activity className="size-4" />} label="Checkout sessions" value={totalSessions.toLocaleString()} detail="Demo analytics" />
        <Metric icon={<ArrowUpRight className="size-4" />} label="Average conversion" value={averageConversion} detail="Across forms with data" />
      </div>

      {notice ? <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{notice}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold">Your checkout forms</h2><p className="mt-1 text-xs text-muted-foreground">Choose a layout to preview, customize or manage its publication status.</p></div>
        <Badge variant="outline">{forms.length} forms</Badge>
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="group flex h-full flex-col overflow-hidden rounded-xl py-0 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative border-b p-2" style={{ background: form.appearance.backgroundColor }}>
              <div className="overflow-hidden border shadow-sm" style={{ backgroundColor: form.appearance.surfaceColor, borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0", borderRadius: form.appearance.radius === "small" ? "6px" : form.appearance.radius === "large" ? "20px" : "12px" }}>
                <div className="flex h-7 items-center gap-1.5 border-b px-2.5" style={{ borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>
                  <span className="size-1.5 rounded-full bg-rose-400" /><span className="size-1.5 rounded-full bg-amber-300" /><span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 flex h-4 min-w-0 flex-1 items-center truncate rounded-full border px-2 text-[8px]" style={{ color: form.appearance.theme === "dark" ? "#94a3b8" : "#64748b", borderColor: form.appearance.theme === "dark" ? "#334155" : "#e2e8f0" }}>checkout.ipaycash.test/{form.slug}</span>
                </div>
                <div className="min-h-[180px] p-4 sm:p-5" style={{ color: form.appearance.theme === "dark" ? "#f8fafc" : "#0f172a" }}>
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
              <div className="absolute left-4 top-4 flex gap-1.5">
                <Badge variant={form.status === "Published" ? "secondary" : "outline"}>{form.status === "Published" ? <><Check className="mr-1 size-3" /> Active</> : "Draft / Inactive"}</Badge>
                {form.isDefault ? <Badge variant="outline">Default</Badge> : null}
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{form.environment}</Badge>
                <Badge variant="secondary">{form.currency}</Badge>
                <span className="ml-auto text-[10px] text-muted-foreground">Updated {form.updated}</span>
              </div>
              <div><h3 className="text-base font-semibold">{form.name}</h3><p className="mt-1 text-xs text-muted-foreground">/portal/{form.slug}</p></div>

              <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/20 py-3">
                <div className="px-2"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Sessions</p><p className="mt-1 text-sm font-semibold tabular-nums">{form.sessions.toLocaleString()}</p></div>
                <div className="px-2"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Conversion</p><p className="mt-1 text-sm font-semibold tabular-nums">{form.conversion}</p></div>
                <div className="px-2"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Methods</p><p className="mt-1 text-sm font-semibold tabular-nums">{form.methods.length}</p></div>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <Button className="flex-1" variant="outline" size="sm" onClick={() => openPreview(form)}><Eye className="size-3.5" /> Preview</Button>
                <Button className="flex-1" size="sm" onClick={() => onCustomize(form.id)}><Pencil className="size-3.5" /> Customize</Button>
              </div>
              <div className="flex items-center gap-2 border-t pt-3">
                <Button className="flex-1" size="sm" variant={form.status === "Published" ? "outline" : "default"} onClick={() => toggleStatus(form)}><Power className="size-3.5" /> {form.status === "Published" ? "Deactivate" : "Activate"}</Button>
                <Button size="icon" variant="ghost" aria-label={"Delete " + form.name} title="Delete form" disabled={forms.length <= 1} onClick={() => deleteForm(form)}><Trash2 className="size-4 text-destructive" /></Button>
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
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={createForm}><Plus className="size-4" /> Create & customize</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card className="shadow-none"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{detail}</p></div></CardContent></Card>;
}

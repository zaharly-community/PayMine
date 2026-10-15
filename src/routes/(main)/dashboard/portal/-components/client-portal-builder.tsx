import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CustomerPortal } from "../../../portal/-components/customer-portal";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Globe2,
  Hash,
  Mail,
  LayoutTemplate,
  Monitor,
  Save,
  Smartphone,
  Sparkles,
  Undo2,
  Redo2,
  Moon,
  Plus,
  X,
  AlertTriangle,
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

type EditorSection = "appearance" | "features" | "configs";
type TemplateId = "stripe" | "classic" | "minimal";
type FontId = "sans" | "system" | "serif";
type ButtonShape = "pill" | "rounded" | "rectangle";
type PlayerIdMode = "userId" | "email" | "both";
type MethodDisplay = "tabs" | "cards";

type BlockCopy = {
  label: string;
  placeholder: string;
  description: string;
};

type PortalBuilderSettings = {
  template: TemplateId;
  fontFamily: FontId;
  buttonShape: ButtonShape;
  colors: {
    websiteBackground: string;
    accent: string;
    brand: string;
    checkoutSurface: string;
  };
  features: {
    supervisorRating: boolean;
    playerRating: boolean;
    aiRecognition: boolean;
    autoConfirm: boolean;
  };
  configs: {
    paymentMethods: string[];
    methodDisplay: MethodDisplay;
    playerIdMode: PlayerIdMode;
    presetAmounts: number[];
    timerSeconds: number;
    scheduleEnabled: boolean;
    scheduleStart: string;
    scheduleEnd: string;
  };
  blocks: Record<string, BlockCopy>;
};

type BuilderForm = ClientPortalForm & { builder?: PortalBuilderSettings };
type EditableBuilderForm = ClientPortalForm & { builder: PortalBuilderSettings };

const templateOptions: { id: TemplateId; label: string; caption: string }[] = [
  { id: "stripe", label: "Stripe", caption: "Clean checkout layout" },
  { id: "classic", label: "Classic", caption: "Traditional form layout" },
  { id: "minimal", label: "Minimal", caption: "Compact and focused" },
];

function ThemeThumbnail({ id }: { id: TemplateId }) {
  return (
    <div className={"flex h-12 w-[74px] shrink-0 flex-col gap-1 rounded-md border p-1.5 " + (id === "stripe" ? "bg-slate-50" : id === "classic" ? "bg-stone-50" : "bg-white")}>
      {id === "stripe" ? (
        <><span className="h-1.5 w-8 rounded-sm bg-indigo-500" /><span className="h-1 w-full rounded-sm bg-slate-200" /><span className="h-1 w-4/5 rounded-sm bg-slate-200" /><span className="mt-auto h-2 w-full rounded-sm bg-indigo-500" /></>
      ) : id === "classic" ? (
        <><span className="h-1.5 w-full rounded-sm bg-slate-300" /><span className="h-1 w-4/5 rounded-sm bg-slate-200" /><span className="mt-auto h-2 w-2/3 rounded-sm bg-slate-400" /></>
      ) : (
        <><span className="mx-auto h-1.5 w-8 rounded-sm bg-emerald-500" /><span className="mx-auto h-1 w-4/5 rounded-sm bg-slate-200" /><span className="mt-auto h-2 w-full rounded-full bg-emerald-500" /></>
      )}
    </div>
  );
}

const fieldDefaults: Record<string, BlockCopy> = {
  heading: {
    label: "Make a deposit",
    placeholder: "",
    description: "Choose a payment method and follow the secure deposit instructions.",
  },
  playerId: {
    label: "Player ID",
    placeholder: "Enter your player ID",
    description: "",
  },
  email: {
    label: "Email address",
    placeholder: "name@example.com",
    description: "We may use this to send you a deposit update.",
  },
  amount: {
    label: "Deposit amount",
    placeholder: "Enter amount",
    description: "Choose one of the suggested amounts or use a custom amount.",
  },
  paymentMethods: {
    label: "Payment method",
    placeholder: "",
    description: "Choose the payment method you want to use.",
  },
  transferNumber: {
    label: "Transfer number",
    placeholder: "Enter the number used to send the transfer",
    description: "Use the sender number from the payment account.",
  },
  transactionId: {
    label: "Transaction ID",
    placeholder: "Enter transaction ID",
    description: "Copy the transaction reference from your payment receipt.",
  },
  evidence: {
    label: "Payment evidence",
    placeholder: "Upload transfer screenshot",
    description: "A clear screenshot helps the supervisor verify your transfer.",
  },
  continue: {
    label: "Continue securely",
    placeholder: "",
    description: "",
  },
  supervisorRating: {
    label: "Rate the supervisor",
    placeholder: "",
    description: "Share your experience after the request is resolved.",
  },
  playerRating: {
    label: "Rate your deposit experience",
    placeholder: "",
    description: "Tell us how the deposit flow worked for you.",
  },
};

function makeDefaultSettings(form: ClientPortalForm): PortalBuilderSettings {
  return {
    template: "stripe",
    fontFamily: form.appearance.fontFamily,
    buttonShape: form.appearance.radius === "small" ? "rectangle" : form.appearance.radius === "large" ? "pill" : "rounded",
    colors: {
      websiteBackground: form.appearance.backgroundColor || "#020617",
      accent: form.appearance.primaryColor || "#34d399",
      brand: "#e2e8f0",
      checkoutSurface: form.appearance.surfaceColor || "#0f172a",
    },
    features: {
      supervisorRating: true,
      playerRating: true,
      aiRecognition: false,
      autoConfirm: false,
    },
    configs: {
      paymentMethods: form.methods?.length ? [...form.methods] : ["Flouci", "D17"],
      methodDisplay: "cards",
      playerIdMode: "both",
      presetAmounts: [50, 100, 200, 500],
      timerSeconds: 300,
      scheduleEnabled: false,
      scheduleStart: "08:00",
      scheduleEnd: "23:00",
    },
    blocks: Object.fromEntries(Object.entries(fieldDefaults).map(([key, value]) => [
      key,
      key === "heading"
        ? { ...value, label: form.appearance.title || value.label, description: form.appearance.description || value.description }
        : key === "continue"
          ? { ...value, label: form.appearance.buttonLabel || value.label }
          : { ...value },
    ])),
  };
}

function hydrateBuilderForm(form: ClientPortalForm): EditableBuilderForm {
  const raw = (form as BuilderForm).builder as
    | (Partial<PortalBuilderSettings> & {
        colors?: Partial<PortalBuilderSettings["colors"]>;
        features?: Partial<PortalBuilderSettings["features"]>;
        configs?: Partial<PortalBuilderSettings["configs"]>;
        blocks?: Record<string, Partial<BlockCopy> | undefined>;
      })
    | undefined;
  const defaults = makeDefaultSettings(form);
  const blocks: Record<string, BlockCopy> = { ...defaults.blocks };
  for (const [key, value] of Object.entries(raw?.blocks ?? {})) {
    if (value) blocks[key] = { ...(blocks[key] ?? fieldDefaults.heading), ...value };
  }
  const allowedMethods = Array.isArray(raw?.configs?.paymentMethods)
    ? raw.configs.paymentMethods.filter((method): method is string => typeof method === "string" && clientPortalMethodOptions.includes(method as (typeof clientPortalMethodOptions)[number]))
    : defaults.configs.paymentMethods;
  const settings: PortalBuilderSettings = {
    ...defaults,
    ...raw,
    template: raw?.template === "classic" || raw?.template === "minimal" ? raw.template : "stripe",
    fontFamily: raw?.fontFamily === "system" || raw?.fontFamily === "serif" ? raw.fontFamily : "sans",
    buttonShape: raw?.buttonShape === "pill" || raw?.buttonShape === "rectangle" ? raw.buttonShape : "rounded",
    colors: { ...defaults.colors, ...(raw?.colors ?? {}) },
    features: { ...defaults.features, ...(raw?.features ?? {}) },
    configs: {
      ...defaults.configs,
      ...(raw?.configs ?? {}),
      paymentMethods: allowedMethods.length ? [...new Set(allowedMethods)] : [...defaults.configs.paymentMethods],
      methodDisplay: raw?.configs?.methodDisplay === "tabs" ? "tabs" : "cards",
      playerIdMode: raw?.configs?.playerIdMode === "userId" || raw?.configs?.playerIdMode === "email" ? raw.configs.playerIdMode : "both",
      presetAmounts: Array.isArray(raw?.configs?.presetAmounts) && raw.configs.presetAmounts.length
        ? raw.configs.presetAmounts.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0).slice(0, 8)
        : [...defaults.configs.presetAmounts],
      timerSeconds: Number.isFinite(raw?.configs?.timerSeconds) ? Math.max(30, Math.min(3600, Number(raw?.configs?.timerSeconds))) : defaults.configs.timerSeconds,
      scheduleEnabled: raw?.configs?.scheduleEnabled === true,
      scheduleStart: typeof raw?.configs?.scheduleStart === "string" ? raw.configs.scheduleStart : defaults.configs.scheduleStart,
      scheduleEnd: typeof raw?.configs?.scheduleEnd === "string" ? raw.configs.scheduleEnd : defaults.configs.scheduleEnd,
    },
    blocks,
  };
  return { ...form, builder: settings };
}

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
  const [forms, setForms] = useState<EditableBuilderForm[]>(() => getClientPortalForms().map(hydrateBuilderForm));
  const [selectedId, setSelectedId] = useState(() => {
    const initial = getClientPortalForms().find((form) => form.id === initialSlug || form.slug === initialSlug);
    return initial?.id ?? getClientPortalForms()[0]?.id ?? "";
  });
  const [section, setSection] = useState<EditorSection>("appearance");
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const latest = getClientPortalForms().map(hydrateBuilderForm);
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

  const updateSelected = (patch: Partial<EditableBuilderForm>) => {
    if (!selected) return;
    setForms((current) => current.map((form) => form.id === selected.id
      ? { ...form, ...patch, updated: "Unsaved changes" }
      : form));
    setNotice("");
  };

  const updateBuilder = (patch: Partial<PortalBuilderSettings>) => {
    if (!selected) return;
    const builder: PortalBuilderSettings = {
      ...selected.builder,
      ...patch,
      colors: { ...selected.builder.colors, ...(patch.colors ?? {}) },
      features: { ...selected.builder.features, ...(patch.features ?? {}) },
      configs: { ...selected.builder.configs, ...(patch.configs ?? {}) },
      blocks: { ...selected.builder.blocks, ...(patch.blocks ?? {}) },
    };
    updateSelected({ builder });
  };

  const updateBlock = (key: string, patch: Partial<BlockCopy>) => {
    if (!selected) return;
    updateBuilder({
      blocks: {
        ...selected.builder.blocks,
        [key]: { ...selected.builder.blocks[key], ...patch },
      },
    });
  };

  const updateConfig = (key: keyof PortalBuilderSettings["configs"], value: PortalBuilderSettings["configs"][typeof key]) => {
    if (!selected) return;
    const configs = { ...selected.builder.configs, [key]: value };
    const builder = { ...selected.builder, configs };
    const patch: Partial<EditableBuilderForm> = { builder };
    if (key === "paymentMethods") patch.methods = value as string[];
    updateSelected(patch);
  };

  const updateFeatures = (patch: Partial<PortalBuilderSettings["features"]>) => {
    if (!selected) return;
    const features = { ...selected.builder.features, ...patch };
    if (patch.aiRecognition === false) features.autoConfirm = false;
    updateBuilder({ features });
  };

  const save = () => {
    if (!selected) return;
    const usedSlugs = new Set<string>();
    const normalized = forms.map((form) => {
      const base = normalizeClientPortalSlug(form.slug) || "checkout";
      let slug = base;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = base + "-" + suffix;
        suffix += 1;
      }
      usedSlugs.add(slug);
      const appearance: ClientPortalAppearance = {
        ...form.appearance,
        backgroundColor: form.builder.colors.websiteBackground,
        primaryColor: form.builder.colors.accent,
        surfaceColor: form.builder.colors.checkoutSurface,
        fontFamily: form.builder.fontFamily,
        radius: form.appearance.radius,
        theme: isLightColor(form.builder.colors.websiteBackground) ? "light" : "dark",
        title: form.builder.blocks.heading?.label ?? form.appearance.title,
        description: form.builder.blocks.heading?.description ?? form.appearance.description,
        buttonLabel: form.builder.blocks.continue?.label ?? form.appearance.buttonLabel,
      };
      return {
        ...form,
        slug,
        methods: [...form.builder.configs.paymentMethods],
        appearance,
        updated: formatUpdated(),
      };
    });
    saveClientPortalForms(normalized);
    setForms(normalized);
    setNotice("Saved in this browser. Connect backend persistence before using this configuration across devices.");
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy: EditableBuilderForm = {
      ...selected,
      id: makeId(),
      name: selected.name + " copy",
      slug: uniqueSlug(selected.slug + "-copy", forms),
      status: "Draft",
      isDefault: false,
      sessions: 0,
      conversion: "—",
      updated: formatUpdated(),
      methods: [...selected.builder.configs.paymentMethods],
      appearance: { ...selected.appearance },
      builder: {
        ...selected.builder,
        colors: { ...selected.builder.colors },
        features: { ...selected.builder.features },
        configs: { ...selected.builder.configs, paymentMethods: [...selected.builder.configs.paymentMethods], presetAmounts: [...selected.builder.configs.presetAmounts] },
        blocks: Object.fromEntries(Object.entries(selected.builder.blocks).map(([key, value]) => [key, { ...value }])),
      },
    };
    const updated = [copy, ...forms];
    saveClientPortalForms(updated);
    setForms(updated);
    setSelectedId(copy.id);
    setNotice("Duplicated as a new draft.");
  };

  if (!selected) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">No checkout form exists yet.</div>;
  }

  const selectedCopy = selectedBlock ? selected.builder.blocks[selectedBlock] : null;
  const selectedTemplate = templateOptions.find((option) => option.id === selected.builder.template) ?? templateOptions[0];

  return (
    <main className="min-h-dvh w-full bg-muted/30 text-foreground">
      <header className="sticky top-0 z-40 flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-[#23436e] bg-[#102c58] px-3 py-2 text-white shadow-md lg:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="shrink-0 text-slate-100 hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-3.5 rotate-180" /> Exit
          </Button>
          <span className="hidden h-7 w-px bg-border sm:block" />
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-blue-300/30 bg-blue-500 text-sm font-bold text-white">
            A
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-white">{selected.appearance.brandName || "iPayCash"}</h1>
            <p className="truncate text-[10px] text-blue-200">{selected.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-8 w-[150px] max-w-[35vw] border border-white/20 bg-white/10 text-xs text-white [&_svg]:text-white"><SelectValue placeholder="Select checkout form" /></SelectTrigger>
            <SelectContent>
              {forms.map((form) => <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline" className={selected.status === "Published" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-300/30 bg-amber-300/10 text-amber-200"}>{selected.status === "Published" ? "● LIVE" : "DRAFT"}</Badge>
          <Button variant="ghost" size="icon" className="size-8 text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Appearance mode" title="Appearance mode" onClick={() => updateAppearance({ theme: selected.appearance.theme === "dark" ? "light" : "dark" })}><Moon className="size-4" /></Button>
          <div className="flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5">
            <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="icon" className="size-7" aria-label="Desktop preview" title="Desktop preview" onClick={() => setPreviewMode("desktop")}><Monitor className="size-3.5" /></Button>
            <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="icon" className="size-7" aria-label="Mobile preview" title="Mobile preview" onClick={() => setPreviewMode("mobile")}><Smartphone className="size-3.5" /></Button>
          </div>
          <Button variant="ghost" size="icon" className="size-8 text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Undo" title="Undo (coming soon)" disabled><Undo2 className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8 text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Redo" title="Redo (coming soon)" disabled><Redo2 className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={duplicateSelected} className="text-blue-100 hover:bg-white/10 hover:text-white"><Copy className="size-3.5" /> <span className="hidden sm:inline">Duplicate</span></Button>
          <Button size="sm" onClick={save} className="bg-blue-600 text-white hover:bg-blue-500"><Save className="size-3.5" /> Save</Button>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100dvh-48px)] max-w-[1900px] grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="min-h-0 bg-[#f2f5fa] xl:sticky xl:top-12 xl:h-[calc(100dvh-3rem)] xl:overflow-y-auto xl:border-r xl:border-slate-200">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{selectedBlock ? "Selected element" : "Theme settings"}</p>
              <h2 className="mt-1 text-base font-semibold">{selectedBlock ? (selectedCopy?.label || selectedBlock) : "Customize portal"}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{selectedBlock ? "Edit only the text content for this block." : "Appearance, optional features and checkout behavior."}</p>
            </div>
            {selectedBlock ? <Button variant="ghost" size="sm" onClick={() => setSelectedBlock(null)}>Theme settings</Button> : null}
          </div>

          {selectedBlock && selectedCopy ? (
            <div className="space-y-5 p-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-medium">Content block</p>
                <p className="mt-1 text-xs text-muted-foreground">Text settings only. Layout and field behavior stay controlled by the global settings.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="block-label">Label / title</Label>
                <Input id="block-label" value={selectedCopy.label} onChange={(event) => updateBlock(selectedBlock, { label: event.target.value })} placeholder="Enter label" />
              </div>
              {selectedBlock !== "heading" && selectedBlock !== "continue" && selectedBlock !== "paymentMethods" && selectedBlock !== "supervisorRating" && selectedBlock !== "playerRating" ? (
                <div className="grid gap-2">
                  <Label htmlFor="block-placeholder">Placeholder</Label>
                  <Input id="block-placeholder" value={selectedCopy.placeholder} onChange={(event) => updateBlock(selectedBlock, { placeholder: event.target.value })} placeholder="Text shown inside the field" />
                </div>
              ) : null}
              {selectedBlock !== "continue" ? (
                <div className="grid gap-2">
                  <Label htmlFor="block-description">Description below block</Label>
                  <textarea id="block-description" rows={4} value={selectedCopy.description} onChange={(event) => updateBlock(selectedBlock, { description: event.target.value })} placeholder="Optional supporting text shown below this block" className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/30" />
                  <p className="text-[11px] text-muted-foreground">Leave it empty if you do not want to show a description.</p>
                </div>
              ) : null}
              <Button variant="outline" className="w-full" onClick={() => setSelectedBlock(null)}>Done editing block</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 border-b border-slate-200 bg-white p-2">
                {([
                  ["appearance", "Appearance"],
                  ["features", "Features"],
                  ["configs", "Configs"],
                ] as [EditorSection, string][]).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setSection(value)} className={"rounded-md px-2 py-2 text-xs font-medium transition-colors " + (section === value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{label}</button>
                ))}
              </div>

              <div className="space-y-5 p-3">
                {section === "appearance" ? (
                  <>
                    <div className="space-y-3">
                      <div><h3 className="text-sm font-semibold">Theme</h3><p className="mt-1 text-xs text-muted-foreground">Choose a ready-made checkout layout.</p></div>
                      <div className="relative">
                        <button type="button" aria-haspopup="listbox" aria-expanded={themeDropdownOpen} onClick={() => setThemeDropdownOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-lg border bg-background p-2.5 text-left transition hover:bg-muted/40">
                          <ThemeThumbnail id={selected.builder.template} />
                          <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{selectedTemplate.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{selectedTemplate.caption}</span></span>
                          <ChevronDown className={"size-4 shrink-0 text-muted-foreground transition-transform " + (themeDropdownOpen ? "rotate-180" : "")} />
                        </button>
                        {themeDropdownOpen ? (
                          <div role="listbox" aria-label="Theme layout" className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border bg-background p-2 shadow-xl">
                            {templateOptions.map((option) => (
                              <button key={option.id} type="button" role="option" aria-selected={selected.builder.template === option.id} onClick={() => { updateBuilder({ template: option.id }); setThemeDropdownOpen(false); }} className={"flex w-full items-center gap-3 rounded-lg p-2 text-left transition " + (selected.builder.template === option.id ? "bg-primary/5 text-foreground" : "hover:bg-muted/40")}>
                                <ThemeThumbnail id={option.id} />
                                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{option.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{option.caption}</span></span>
                                {selected.builder.template === option.id ? <Check className="size-4 text-primary" /> : <span className="size-4 rounded-full border" />}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Typography</Label>
                      <Select value={selected.builder.fontFamily} onValueChange={(value) => updateBuilder({ fontFamily: value as FontId })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="sans">Modern sans-serif</SelectItem><SelectItem value="system">System default</SelectItem><SelectItem value="serif">Serif</SelectItem></SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Button shape</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          ["pill", "Pill"],
                          ["rounded", "Rounded"],
                          ["rectangle", "Rectangle"],
                        ] as [ButtonShape, string][]).map(([value, label]) => (
                          <button key={value} type="button" onClick={() => updateBuilder({ buttonShape: value })} className={"rounded-lg border px-2 py-2.5 text-xs font-medium transition " + (selected.builder.buttonShape === value ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/50")}>
                            <span className={"mx-auto mb-2 block h-5 w-12 border " + (value === "pill" ? "rounded-full" : value === "rounded" ? "rounded-md" : "rounded-none") + (selected.builder.buttonShape === value ? " border-primary bg-primary/10" : " bg-muted/40")} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div><h3 className="text-sm font-semibold">Colors</h3><p className="mt-1 text-xs text-muted-foreground">Change each layer of the checkout independently.</p></div>
                      {([
                        ["websiteBackground", "Website background"],
                        ["accent", "Accent / actions"],
                        ["brand", "Brand"],
                        ["checkoutSurface", "Checkout surface"],
                      ] as [keyof PortalBuilderSettings["colors"], string][]).map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
                          <span className="text-xs font-medium">{label}</span>
                          <span className="flex items-center gap-2">
                            <code className="text-[10px] text-muted-foreground">{selected.builder.colors[key]}</code>
                            <input aria-label={label} type="color" value={selected.builder.colors[key]} onChange={(event) => updateBuilder({ colors: { [key]: event.target.value } })} className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5" />
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}

                {section === "features" ? (
                  <>
                    <div><h3 className="text-sm font-semibold">Optional features</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Enable only the feedback and automation tools your payment flow needs.</p></div>
                    <ToggleSetting title="Supervisor rating" description="Let players rate the supervisor after a request is resolved." checked={selected.builder.features.supervisorRating} onChange={(checked) => updateFeatures({ supervisorRating: checked })} />
                    <ToggleSetting title="Player experience rating" description="Show a short feedback step after the player completes the flow." checked={selected.builder.features.playerRating} onChange={(checked) => updateFeatures({ playerRating: checked })} />
                    <ToggleSetting title="AI transfer recognition" description="Recognize transaction details from uploaded transfer evidence." checked={selected.builder.features.aiRecognition} onChange={(checked) => updateFeatures({ aiRecognition: checked })} />
                    <p className="rounded-lg border border-dashed p-3 text-[11px] leading-5 text-muted-foreground">The current checkout demonstrates simulated recognition only. Production OCR and confirmation require server-side processing and payment-provider verification.</p>
                    {selected.builder.features.aiRecognition ? (
                      <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3">
                        <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-sm font-semibold">High-risk automation</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Automatic confirmation can approve incorrect, duplicated or manipulated evidence. Keep supervisor review enabled until this is tested against trusted provider data.</p></div></div>
                        <ToggleSetting title="Automatic confirmation" description="Allow AI results to confirm a transfer without a supervisor review." checked={selected.builder.features.autoConfirm} onChange={(checked) => updateFeatures({ autoConfirm: checked })} />
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed p-3 text-xs leading-5 text-muted-foreground">Enable AI transfer recognition to configure the automatic-confirmation option.</p>
                    )}
                  </>
                ) : null}

                {section === "configs" ? (
                  <>
                    <div><h3 className="text-sm font-semibold">Checkout configuration</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Control available payment methods, player identification, preset amounts, timer and active hours.</p></div>

                    <div className="space-y-2">
                      <Label>Payment method presentation</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ["tabs", "Tabs"],
                          ["cards", "Cards"],
                        ] as [MethodDisplay, string][]).map(([value, label]) => <button key={value} type="button" onClick={() => updateConfig("methodDisplay", value)} className={"rounded-lg border px-3 py-3 text-sm font-medium transition " + (selected.builder.configs.methodDisplay === value ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/40")}>{label}<span className="mt-2 flex gap-1">{value === "tabs" ? <><span className="h-1.5 flex-1 rounded-full bg-muted-foreground/40" /><span className="h-1.5 flex-1 rounded-full bg-muted" /><span className="h-1.5 flex-1 rounded-full bg-muted" /></> : <><span className="h-5 flex-1 rounded border bg-muted/50" /><span className="h-5 flex-1 rounded border bg-muted/50" /></>}</span></button>)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment methods shown</Label>
                      <div className="space-y-1.5">
                        {clientPortalMethodOptions.map((method) => {
                          const active = selected.builder.configs.paymentMethods.includes(method);
                          return <button key={method} type="button" aria-pressed={active} onClick={() => {
                            const current = selected.builder.configs.paymentMethods;
                            if (active && current.length <= 1) {
                              setNotice("Keep at least one payment method enabled.");
                              return;
                            }
                            updateConfig("paymentMethods", active ? current.filter((item) => item !== method) : [...current, method]);
                          }} className={"flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition " + (active ? "border-primary/40 bg-primary/5" : "hover:bg-muted/30")}>
                            <span className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-md bg-muted text-[9px] font-bold">{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 3)}</span><span className="text-xs font-medium">{method}</span></span>
                            {active ? <Check className="size-4 text-primary" /> : <span className="size-4 rounded border" />}
                          </button>;
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Player identification</Label>
                      <Select value={selected.builder.configs.playerIdMode} onValueChange={(value) => updateConfig("playerIdMode", value as PlayerIdMode)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="userId">Player ID only</SelectItem><SelectItem value="email">Email only</SelectItem><SelectItem value="both">Player ID or email</SelectItem></SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2"><div><Label>Preset deposit amounts (TND)</Label><p className="mt-1 text-[11px] text-muted-foreground">These become the quick-select amount buttons.</p></div><Button size="icon" variant="outline" className="size-8 shrink-0" aria-label="Add amount" onClick={() => updateConfig("presetAmounts", [...selected.builder.configs.presetAmounts, (selected.builder.configs.presetAmounts[selected.builder.configs.presetAmounts.length - 1] ?? 0) + 50].slice(0, 8))} disabled={selected.builder.configs.presetAmounts.length >= 8}><Plus className="size-3.5" /></Button></div>
                      <div className="space-y-2">
                        {selected.builder.configs.presetAmounts.map((amount, index) => <div key={index} className="flex items-center gap-2"><Input aria-label={"Preset amount " + (index + 1)} type="number" min={1} value={amount} onChange={(event) => {
                          const next = [...selected.builder.configs.presetAmounts];
                          next[index] = Math.max(1, Number(event.target.value) || 1);
                          updateConfig("presetAmounts", next);
                        }} /><Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="Remove amount" disabled={selected.builder.configs.presetAmounts.length <= 1} onClick={() => updateConfig("presetAmounts", selected.builder.configs.presetAmounts.filter((_, itemIndex) => itemIndex !== index))}><X className="size-3.5" /></Button></div>)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Deposit session timer (seconds)</Label>
                      <Input type="number" min={30} max={3600} step={30} value={selected.builder.configs.timerSeconds} onChange={(event) => updateConfig("timerSeconds", Math.max(30, Math.min(3600, Number(event.target.value) || 30)))} />
                      <p className="text-[11px] text-muted-foreground">Allowed range: 30 seconds to 60 minutes.</p>
                    </div>

                    <div className="space-y-3 rounded-xl border p-3">
                      <ToggleSetting title="Schedule form availability" description="Keep the deposit form active only during configured hours." checked={selected.builder.configs.scheduleEnabled} onChange={(checked) => updateConfig("scheduleEnabled", checked)} />
                      {selected.builder.configs.scheduleEnabled ? <div className="grid grid-cols-2 gap-3"><div className="grid gap-1.5"><Label>Active from</Label><Input type="time" value={selected.builder.configs.scheduleStart} onChange={(event) => updateConfig("scheduleStart", event.target.value)} /></div><div className="grid gap-1.5"><Label>Active until</Label><Input type="time" value={selected.builder.configs.scheduleEnd} onChange={(event) => updateConfig("scheduleEnd", event.target.value)} /></div><p className="col-span-2 text-[11px] leading-5 text-muted-foreground">Uses the visitor's local browser time in this prototype. Use a server-defined timezone for production enforcement.</p></div> : null}
                    </div>
                  </>
                ) : null}
              </div>
            </>
          )}

          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] leading-5 text-muted-foreground">{notice || (selected.updated === "Unsaved changes" ? "Unsaved changes · Save to retain this configuration in the browser." : "Changes update the preview instantly. Save to retain them in this browser.")}</p>
          </div>
        </aside>
        <section className="min-w-0 min-h-0 bg-[#eaf0f8] bg-[radial-gradient(#c5d6ef_0.8px,transparent_0.8px)] [background-size:20px_20px] p-3 sm:p-5 lg:p-6">
          <div className="flex h-full min-h-[calc(100dvh-112px)] flex-col items-center">
            <div className="mb-3 flex w-full max-w-[1220px] flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Page canvas</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-800">{selected.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-300 bg-white/80 text-slate-600">{previewMode === "desktop" ? "Desktop" : "Mobile"}</Badge>
                <Button variant="outline" size="sm" className="h-8 border-slate-300 bg-white text-slate-700" onClick={() => window.open(liveUrl + "?preview=1", "_blank", "noopener,noreferrer")}><Eye className="size-3.5" /> Open saved portal</Button>
              </div>
            </div>

            <div
              className="mx-auto flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_18px_60px_rgba(29,48,80,0.16)]"
              style={{ width: previewMode === "mobile" ? "390px" : "100%", maxWidth: previewMode === "mobile" ? "100%" : "1220px" }}
            >
              <div className="z-10 flex h-10 shrink-0 items-center gap-2 border-b border-slate-200 bg-[#f7f8fa] px-3">
                <span className="size-2.5 rounded-full bg-[#ff6259]" />
                <span className="size-2.5 rounded-full bg-[#ffbd2f]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
                <div className="mx-auto flex h-6 min-w-0 w-[min(480px,70%)] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[10px] text-slate-500">
                  <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="truncate">{liveUrl.replace(/^https?:\/\//, "")}</span>
                </div>
                <span className="w-4 shrink-0" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
                <CustomerPortal
                  formOverride={selected}
                  preview
                  builderEditMode
                  onSelectBlock={setSelectedBlock}
                />
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}

function ToggleSetting({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PreviewBlock({
  blockId,
  selectedBlock,
  onSelectBlock,
  children,
  className = "",
}: {
  blockId: string;
  selectedBlock: string | null;
  onSelectBlock: (blockId: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const selected = selectedBlock === blockId;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={"Edit " + (fieldDefaults[blockId]?.label ?? blockId) + " block"}
      onClick={() => onSelectBlock(blockId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectBlock(blockId);
        }
      }}
      className={"group relative cursor-pointer rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-primary " + (selected ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "hover:ring-1 hover:ring-primary/50 ") + className}
    >
      {children}
      <span className={"pointer-events-none absolute right-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground opacity-0 transition group-hover:opacity-100 " + (selected ? "opacity-100" : "")}>Edit</span>
    </div>
  );
}

function isLightColor(color: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!match) return false;
  const r = Number.parseInt(match[1], 16);
  const g = Number.parseInt(match[2], 16);
  const b = Number.parseInt(match[3], 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

function isWithinSchedule(start: string, end: string) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startValue = startHour * 60 + startMinute;
  const endValue = endHour * 60 + endMinute;
  return startValue <= endValue
    ? current >= startValue && current <= endValue
    : current >= startValue || current <= endValue;
}

function CheckoutPreview({
  form,
  previewMode = "desktop",
  selectedBlock,
  onSelectBlock,
}: {
  form: EditableBuilderForm;
  previewMode?: "desktop" | "mobile";
  selectedBlock: string | null;
  onSelectBlock: (blockId: string) => void;
}) {
  const { appearance, builder } = form;
  const { colors, configs, features, blocks } = builder;
  const light = isLightColor(colors.websiteBackground);
  const foreground = light ? "#0f172a" : "#f8fafc";
  const muted = light ? "#64748b" : "#94a3b8";
  const border = light ? "#e2e8f0" : "#334155";
  const buttonRadius = builder.buttonShape === "pill" ? "999px" : builder.buttonShape === "rounded" ? "12px" : "4px";
  const inputRadius = appearance.radius === "small" ? "8px" : appearance.radius === "large" ? "22px" : "14px";
  const frameWidth = previewMode === "mobile" ? "390px" : builder.template === "minimal" ? "440px" : builder.template === "classic" ? "600px" : appearance.width === "wide" ? "100%" : "760px";
  const [amount, setAmount] = useState(configs.presetAmounts[0] ?? 50);
  const [identifierMode, setIdentifierMode] = useState<"userId" | "email">(configs.playerIdMode === "email" ? "email" : "userId");
  const identifierBlockId = configs.playerIdMode === "email" || (configs.playerIdMode === "both" && identifierMode === "email") ? "email" : "playerId";
  const identifierCopy = blocks[identifierBlockId];
  const scheduled = !configs.scheduleEnabled || isWithinSchedule(configs.scheduleStart, configs.scheduleEnd);
  const timerMinutes = Math.floor(configs.timerSeconds / 60).toString().padStart(2, "0");
  const timerRemainder = (configs.timerSeconds % 60).toString().padStart(2, "0");

  useEffect(() => {
    setAmount(configs.presetAmounts[0] ?? 50);
  }, [configs.presetAmounts.join(",")]);

  useEffect(() => {
    if (configs.playerIdMode === "email") setIdentifierMode("email");
    else if (configs.playerIdMode === "userId") setIdentifierMode("userId");
  }, [configs.playerIdMode]);

  const fontFamily = builder.fontFamily === "serif"
    ? 'Georgia, "Times New Roman", serif'
    : builder.fontFamily === "system"
      ? "system-ui, sans-serif"
      : "Inter, ui-sans-serif, system-ui, sans-serif";
  const baseSurface = colors.checkoutSurface;
  const buttonText = isLightColor(colors.accent) ? "#0f172a" : "#ffffff";

  return (
    <div className="mx-auto w-full transition-all duration-200" style={{ maxWidth: frameWidth, fontFamily }}>
      <div className="overflow-hidden border shadow-xl" style={{ borderRadius: builder.template === "minimal" ? "8px" : builder.template === "classic" ? "4px" : "14px", borderColor: border, backgroundColor: colors.websiteBackground }}>
        <div className="flex items-center gap-1.5 border-b px-3 py-2.5" style={{ borderColor: border, backgroundColor: light ? "#f8fafc" : "#0b1220" }}>
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <div className="mx-auto flex h-6 min-w-0 max-w-[520px] flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-2 text-[10px] text-muted-foreground" style={{ borderColor: border }}>
            <Globe2 className="size-3 shrink-0" /><span className="truncate">checkout.local/portal/{form.slug}</span>
          </div>
          <span className="w-7" />
        </div>

        <div style={{ backgroundColor: colors.websiteBackground, color: foreground }}>
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ backgroundColor: baseSurface, borderColor: border }}>
            <div className="flex min-w-0 items-center gap-2.5">
              {appearance.showLogo ? (
                appearance.logoUrl
                  ? <img src={appearance.logoUrl} alt="" className="size-8 shrink-0 rounded-lg object-contain" />
                  : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold" style={{ backgroundColor: colors.brand, color: isLightColor(colors.brand) ? "#0f172a" : "#fff" }}>{(appearance.brandName || "iP").slice(0, 2).toUpperCase()}</span>
              ) : null}
              <div className="min-w-0"><p className="truncate text-xs font-semibold">{appearance.brandName || "Your brand"}</p><p className="mt-0.5 text-[9px]" style={{ color: muted }}>Secure checkout</p></div>
            </div>
            <div className="flex items-center gap-1 text-[9px]" style={{ color: colors.accent }}><Check className="size-3" /> Secure</div>
          </div>

          <div className={"p-4 sm:p-6 " + (builder.template === "minimal" ? "sm:px-10" : "")}>
            <div className="mx-auto space-y-4" style={{ maxWidth: builder.template === "minimal" ? "390px" : "490px" }}>
              <PreviewBlock blockId="heading" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <p className="text-base font-semibold">{blocks.heading.label || form.name}</p>
                <p className="mt-1 text-xs leading-5" style={{ color: muted }}>{blocks.heading.description}</p>
              </PreviewBlock>

              {configs.scheduleEnabled && !scheduled ? (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs leading-5 text-amber-700">
                  This form is outside its active hours ({configs.scheduleStart}–{configs.scheduleEnd}). It will be available during the configured schedule.
                </div>
              ) : null}

              <PreviewBlock blockId={identifierBlockId} selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-[11px] font-medium">{identifierCopy.label}</label>
                  {configs.playerIdMode === "both" ? (
                    <div className="flex items-center gap-1">
                      <button type="button" title="Player ID" aria-label="Preview Player ID input" onClick={(event) => { event.stopPropagation(); setIdentifierMode("userId"); onSelectBlock("playerId"); }} className={"flex size-7 items-center justify-center rounded-md border " + (identifierMode === "userId" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}><Hash className="size-3.5" /></button>
                      <button type="button" title="Email" aria-label="Preview email input" onClick={(event) => { event.stopPropagation(); setIdentifierMode("email"); onSelectBlock("email"); }} className={"flex size-7 items-center justify-center rounded-md border " + (identifierMode === "email" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}><Mail className="size-3.5" /></button>
                    </div>
                  ) : null}
                </div>
                <div className="border px-3 py-2.5 text-[11px]" style={{ borderColor: border, backgroundColor: baseSurface, borderRadius: inputRadius, color: muted }}>{identifierCopy.placeholder || (identifierBlockId === "email" ? "name@example.com" : "Enter your player ID")}</div>
                {identifierCopy.description ? <p className="mt-1.5 text-[10px] leading-4" style={{ color: muted }}>{identifierCopy.description}</p> : null}
              </PreviewBlock>

              <PreviewBlock blockId="amount" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <div className="flex items-center justify-between gap-2"><label className="text-[11px] font-medium">{blocks.amount.label}</label><Badge variant="outline">{form.currency}</Badge></div>
                <div className="mt-2 border px-3 py-3" style={{ borderColor: border, backgroundColor: baseSurface, borderRadius: inputRadius }}>
                  <p className="text-2xl font-semibold tabular-nums">{Number(amount).toFixed(2)} <span className="text-xs font-medium" style={{ color: muted }}>{form.currency}</span></p>
                  {blocks.amount.description ? <p className="mt-1 text-[10px] leading-4" style={{ color: muted }}>{blocks.amount.description}</p> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {configs.presetAmounts.map((preset) => <button type="button" key={preset} onClick={(event) => { event.stopPropagation(); setAmount(preset); onSelectBlock("amount"); }} className="border px-3 py-1.5 text-[10px] font-semibold tabular-nums transition" style={{ borderColor: preset === amount ? colors.accent : border, backgroundColor: preset === amount ? colors.accent + "20" : baseSurface, borderRadius: buttonRadius }}>{preset} TND</button>)}
                </div>
              </PreviewBlock>

              <PreviewBlock blockId="paymentMethods" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <p className="mb-2 text-xs font-medium">{blocks.paymentMethods.label}</p>
                {configs.methodDisplay === "tabs" ? (
                  <div className="flex flex-wrap gap-1 border-b pb-2" style={{ borderColor: border }}>
                    {configs.paymentMethods.map((method, index) => <span key={method} className="border-b-2 px-2 py-1.5 text-[10px] font-medium" style={{ borderBottomColor: index === 0 ? colors.accent : "transparent", color: index === 0 ? colors.accent : muted }}>{method}</span>)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {configs.paymentMethods.map((method, index) => <div key={method} className="flex min-w-0 items-center gap-2 border p-2.5 text-[10px]" style={{ borderColor: index === 0 ? colors.accent : border, backgroundColor: baseSurface, borderRadius: inputRadius }}><span className="flex size-6 shrink-0 items-center justify-center rounded-md text-[8px] font-bold" style={{ backgroundColor: colors.accent, color: buttonText }}>{method.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span className="truncate">{method}</span></div>)}
                  </div>
                )}
                {blocks.paymentMethods.description ? <p className="mt-2 text-[10px] leading-4" style={{ color: muted }}>{blocks.paymentMethods.description}</p> : null}
              </PreviewBlock>

              <PreviewBlock blockId="transferNumber" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <label className="mb-1.5 block text-[11px] font-medium">{blocks.transferNumber.label}</label>
                <div className="border px-3 py-2.5 text-[11px]" style={{ borderColor: border, backgroundColor: baseSurface, borderRadius: inputRadius, color: muted }}>{blocks.transferNumber.placeholder}</div>
                {blocks.transferNumber.description ? <p className="mt-1.5 text-[10px] leading-4" style={{ color: muted }}>{blocks.transferNumber.description}</p> : null}
              </PreviewBlock>

              <PreviewBlock blockId="transactionId" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <label className="mb-1.5 block text-[11px] font-medium">{blocks.transactionId.label}</label>
                <div className="border px-3 py-2.5 text-[11px]" style={{ borderColor: border, backgroundColor: baseSurface, borderRadius: inputRadius, color: muted }}>{blocks.transactionId.placeholder}</div>
                {blocks.transactionId.description ? <p className="mt-1.5 text-[10px] leading-4" style={{ color: muted }}>{blocks.transactionId.description}</p> : null}
              </PreviewBlock>

              <PreviewBlock blockId="evidence" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <label className="mb-1.5 block text-[11px] font-medium">{blocks.evidence.label}</label>
                <div className="flex items-center gap-3 border border-dashed px-3 py-4" style={{ borderColor: border, backgroundColor: baseSurface, borderRadius: inputRadius }}>
                  <span className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.accent + "20", color: colors.accent }}><Sparkles className="size-4" /></span>
                  <span className="text-[11px]" style={{ color: muted }}>{blocks.evidence.placeholder || "Upload transfer screenshot"}</span>
                </div>
                {blocks.evidence.description ? <p className="mt-1.5 text-[10px] leading-4" style={{ color: muted }}>{blocks.evidence.description}</p> : null}
                {features.aiRecognition ? <div className="mt-2 flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/5 px-2.5 py-2 text-[10px]" style={{ color: muted }}><Sparkles className="size-3.5 text-sky-500" /> AI receipt recognition is enabled.</div> : null}
                {features.autoConfirm && features.aiRecognition ? <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-[10px] text-amber-700"><AlertTriangle className="size-3.5" /> Automatic confirmation is enabled — high risk.</div> : null}
              </PreviewBlock>

              <PreviewBlock blockId="continue" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="p-2">
                <div className="w-full px-4 py-3 text-center text-xs font-semibold" style={{ backgroundColor: colors.accent, color: buttonText, borderRadius: buttonRadius, opacity: scheduled ? 1 : 0.55 }}>{blocks.continue.label || "Continue securely"}</div>
              </PreviewBlock>

              {features.supervisorRating ? <PreviewBlock blockId="supervisorRating" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="border-t p-3"><p className="text-[11px] font-medium">{blocks.supervisorRating.label}</p><p className="mt-1 text-[10px]" style={{ color: muted }}>{blocks.supervisorRating.description}</p><p className="mt-2 text-sm tracking-[0.18em]" style={{ color: colors.accent }}>★ ★ ★ ★ ★</p></PreviewBlock> : null}
              {features.playerRating ? <PreviewBlock blockId="playerRating" selectedBlock={selectedBlock} onSelectBlock={onSelectBlock} className="border-t p-3"><p className="text-[11px] font-medium">{blocks.playerRating.label}</p><p className="mt-1 text-[10px]" style={{ color: muted }}>{blocks.playerRating.description}</p><p className="mt-2 text-sm tracking-[0.18em]" style={{ color: colors.accent }}>★ ★ ★ ★ ★</p></PreviewBlock> : null}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[9px]" style={{ borderColor: border, color: muted }}>
                <span className="flex items-center gap-1"><Check className="size-3" /> Protected checkout</span>
                <span>Session timer {timerMinutes}:{timerRemainder}</span>
                {appearance.showPlatformBranding ? <span>Powered by iPayCash</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-2 rounded-lg border bg-background p-3 text-[10px] leading-4 text-muted-foreground"><Sparkles className="mt-0.5 size-3.5 shrink-0" /> Click a visible block to edit its text in the inspector. Preview and browser-stored settings do not activate or verify real payment-provider transactions.</div>
    </div>
  );
}

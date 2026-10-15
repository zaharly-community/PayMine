import { useEffect, useMemo, useState } from "react";
import { CustomerPortal } from "../../../portal/-components/customer-portal";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  LockKeyhole,
  Monitor,
  Save,
  Smartphone,
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

type EditorSection = "appearance" | "features" | "configs" | "blocks";
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
  layout: {
    order: string[];
    hidden: string[];
  };
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
  cardDetails: {
    label: "Card numbers",
    placeholder: "0000 0000 0000 0000",
    description: "Enter the card numbers to be deposited.",
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
  securityNotice: {
    label: "Secure payment",
    placeholder: "",
    description: "Your payment details are handled through the selected payment method.",
  },
  supportInfo: {
    label: "Need help?",
    placeholder: "",
    description: "Contact support if you need help completing this deposit.",
  },
};

type BuilderBlockDefinition = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: "Structure" | "Form fields" | "After checkout";
};

const builderBlockCatalog: BuilderBlockDefinition[] = [
  { id: "heading", label: "Form heading", description: "Title and introduction", required: true, category: "Structure" },
  { id: "paymentMethods", label: "Payment methods", description: "Available ways to pay", required: true, category: "Form fields" },
  { id: "playerId", label: "Player ID", description: "Player identification field", required: true, category: "Form fields" },
  { id: "amount", label: "Deposit amount", description: "Custom amount and preset buttons", required: true, category: "Form fields" },
  { id: "transferNumber", label: "Transfer number", description: "Recipient / transfer account details", required: true, category: "Form fields" },
  { id: "transactionId", label: "Transaction ID", description: "Payment reference field", required: true, category: "Form fields" },
  { id: "cardDetails", label: "Card details", description: "Card numbers for card-based deposits", required: true, category: "Form fields" },
  { id: "evidence", label: "Payment evidence", description: "Upload a transfer or payment image", required: true, category: "Form fields" },
  { id: "continue", label: "Continue button", description: "Primary checkout action", required: true, category: "Form fields" },
  { id: "playerRating", label: "Player experience rating", description: "Collect feedback about checkout", required: false, category: "After checkout" },
  { id: "supervisorRating", label: "Supervisor rating", description: "Rating on the request tracking page", required: false, category: "After checkout" },
  { id: "securityNotice", label: "Secure payment notice", description: "Reassurance text below checkout details", required: false, category: "Structure" },
  { id: "supportInfo", label: "Support note", description: "Help text for players", required: false, category: "Structure" },
];

function makeDefaultSettings(form: ClientPortalForm): PortalBuilderSettings {
  return {
    template: "stripe",
    layout: {
      order: ["heading", "paymentMethods", "playerId", "amount", "cardDetails", "transferNumber", "transactionId", "evidence", "continue", "supervisorRating", "playerRating"],
      hidden: [],
    },
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
        layout?: { order?: string[]; hidden?: string[] };
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
  const normalizedBlockOrder = Array.isArray(raw?.layout?.order)
    ? [...new Set(raw.layout.order.filter((id): id is string => typeof id === "string" && id in fieldDefaults && builderBlockCatalog.some((block) => block.id === id)))]
    : [...defaults.layout.order];
  for (const block of builderBlockCatalog) {
    if (block.required && !normalizedBlockOrder.includes(block.id)) normalizedBlockOrder.push(block.id);
  }
  const settings: PortalBuilderSettings = {
    ...defaults,
    ...raw,
    template: raw?.template === "classic" || raw?.template === "minimal" ? raw.template : "stripe",
    fontFamily: raw?.fontFamily === "system" || raw?.fontFamily === "serif" ? raw.fontFamily : "sans",
    buttonShape: raw?.buttonShape === "pill" || raw?.buttonShape === "rectangle" ? raw.buttonShape : "rounded",
    colors: { ...defaults.colors, ...(raw?.colors ?? {}) },
    features: { ...defaults.features, ...(raw?.features ?? {}) },
    layout: {
      order: normalizedBlockOrder,
      hidden: Array.isArray(raw?.layout?.hidden)
        ? [...new Set(raw.layout.hidden.filter((id): id is string => typeof id === "string" && builderBlockCatalog.some((block) => block.id === id) && !builderBlockCatalog.find((block) => block.id === id)?.required))]
        : [],
    },
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
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [blockSearch, setBlockSearch] = useState("");
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
      layout: {
        order: patch.layout?.order ?? selected.builder.layout.order,
        hidden: patch.layout?.hidden ?? selected.builder.layout.hidden,
      },
    };
    updateSelected({ builder });
  };

  const updateBlockLayout = (patch: Partial<PortalBuilderSettings["layout"]>) => {
    if (!selected) return;
    updateBuilder({
      layout: {
        order: patch.order ?? selected.builder.layout.order,
        hidden: patch.hidden ?? selected.builder.layout.hidden,
      },
    });
  };

  const moveBlock = (fromId: string, toId: string) => {
    if (!selected || fromId === toId) return;
    const current = selected.builder.layout.order;
    const fromIndex = current.indexOf(fromId);
    const toIndex = current.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...current];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    updateBlockLayout({ order: next });
  };

  const toggleBlockHidden = (id: string) => {
    if (!selected) return;
    const definition = builderBlockCatalog.find((block) => block.id === id);
    if (!definition || definition.required) return;
    const hidden = selected.builder.layout.hidden.includes(id)
      ? selected.builder.layout.hidden.filter((item) => item !== id)
      : [...selected.builder.layout.hidden, id];
    updateBlockLayout({ hidden });
  };

  const removeBlock = (id: string) => {
    if (!selected) return;
    const definition = builderBlockCatalog.find((block) => block.id === id);
    if (!definition || definition.required) return;
    updateBlockLayout({
      order: selected.builder.layout.order.filter((item) => item !== id),
      hidden: selected.builder.layout.hidden.filter((item) => item !== id),
    });
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const addBlock = (id: string) => {
    if (!selected || !builderBlockCatalog.some((block) => block.id === id)) return;
    const order = selected.builder.layout.order.includes(id)
      ? selected.builder.layout.order
      : [...selected.builder.layout.order, id];
    updateBlockLayout({
      order,
      hidden: selected.builder.layout.hidden.filter((item) => item !== id),
    });
    setSelectedBlock(id);
    setSection("blocks");
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
        layout: { order: [...selected.builder.layout.order], hidden: [...selected.builder.layout.hidden] },
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
  const previewForm: EditableBuilderForm = {
    ...selected,
    methods: [...selected.builder.configs.paymentMethods],
    appearance: {
      ...selected.appearance,
      backgroundColor: selected.builder.colors.websiteBackground,
      primaryColor: selected.builder.colors.accent,
      surfaceColor: selected.builder.colors.checkoutSurface,
      fontFamily: selected.builder.fontFamily,
      theme: isLightColor(selected.builder.colors.websiteBackground) ? "light" : "dark",
      title: selected.builder.blocks.heading?.label ?? selected.appearance.title,
      description: selected.builder.blocks.heading?.description ?? selected.appearance.description,
      buttonLabel: selected.builder.blocks.continue?.label ?? selected.appearance.buttonLabel,
    },
  };

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
          <Button variant="ghost" size="icon" className="size-8 text-blue-100 hover:bg-white/10 hover:text-white" aria-label="Appearance mode" title="Appearance mode" onClick={() => updateBuilder({ colors: { websiteBackground: isLightColor(selected.builder.colors.websiteBackground) ? "#020617" : "#f8fafc" } })}><Moon className="size-4" /></Button>
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
              <div className="grid grid-cols-4 border-b border-slate-200 bg-white p-2">
                {([
                  ["appearance", "Appearance"],
                  ["features", "Features"],
                  ["configs", "Configs"],
                  ["blocks", "Blocks"],
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

                {section === "blocks" ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">Page blocks</h3>
                        <Badge variant="outline">{selected.builder.layout.order.length} active</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">Drag blocks to reorder the checkout flow. Select a block to edit its content. Required fields can move, but cannot be hidden or removed.</p>
                    </div>

                    <div className="rounded-xl border bg-white p-2">
                      <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Body</p>
                      <div className="space-y-1.5">
                        {selected.builder.layout.order.map((id) => {
                          const definition = builderBlockCatalog.find((block) => block.id === id);
                          if (!definition) return null;
                          const hidden = selected.builder.layout.hidden.includes(id);
                          const active = selectedBlock === id;
                          return (
                            <div
                              key={id}
                              draggable
                              onDragStart={(event) => {
                                setDraggingBlock(id);
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", id);
                              }}
                              onDragEnd={() => setDraggingBlock(null)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                const sourceId = event.dataTransfer.getData("text/plain") || draggingBlock;
                                if (sourceId) {
                                  if (selected.builder.layout.order.includes(sourceId)) {
                                    moveBlock(sourceId, id);
                                  } else if (builderBlockCatalog.some((block) => block.id === sourceId)) {
                                    const order = selected.builder.layout.order.filter((item) => item !== sourceId);
                                    const targetIndex = order.indexOf(id);
                                    order.splice(targetIndex < 0 ? order.length : targetIndex, 0, sourceId);
                                    updateBlockLayout({
                                      order,
                                      hidden: selected.builder.layout.hidden.filter((item) => item !== sourceId),
                                    });
                                    setSelectedBlock(sourceId);
                                  }
                                }
                                setDraggingBlock(null);
                              }}
                              className={"flex items-center gap-2 rounded-lg border p-2 transition " + (active ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100" : hidden ? "border-dashed border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-white hover:border-slate-300") + (draggingBlock === id ? " opacity-40" : "")}
                            >
                              <span className="cursor-grab text-slate-400" title="Drag to reorder" aria-hidden="true">⋮⋮</span>
                              <button type="button" onClick={() => { setSelectedBlock(id); setSection("blocks"); }} className="min-w-0 flex-1 text-left">
                                <span className="flex items-center gap-1.5">
                                  <span className="truncate text-xs font-medium text-slate-800">{definition.label}</span>
                                  {definition.required ? <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">Required</span> : null}
                                </span>
                                <span className="mt-0.5 block truncate text-[10px] text-slate-500">{hidden ? "Hidden" : definition.description}</span>
                              </button>
                              {definition.required ? (
                                <span title="Required block" className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400"><LockKeyhole className="size-3.5" /></span>
                              ) : (
                                <>
                                  <button type="button" title={hidden ? "Show block" : "Hide block"} aria-label={hidden ? "Show block" : "Hide block"} onClick={() => toggleBlockHidden(id)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">{hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
                                  <button type="button" title="Remove block" aria-label="Remove block" onClick={() => removeBlock(id)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"><X className="size-3.5" /></button>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold">Add a block</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">Restore a removed block or add extra content.</p>
                        </div>
                        <Badge variant="outline">{builderBlockCatalog.filter((block) => !selected.builder.layout.order.includes(block.id)).length} available</Badge>
                      </div>
                      <Input value={blockSearch} onChange={(event) => setBlockSearch(event.target.value)} placeholder="Search blocks…" className="h-9" />
                      <div className="space-y-1.5">
                        {builderBlockCatalog.filter((block) => !selected.builder.layout.order.includes(block.id) && (block.label + " " + block.description).toLowerCase().includes(blockSearch.toLowerCase())).map((block) => (
                          <button
                            key={block.id}
                            type="button"
                            draggable
                            onDragStart={(event) => {
                              setDraggingBlock(block.id);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", block.id);
                            }}
                            onDragEnd={() => setDraggingBlock(null)}
                            onClick={() => addBlock(block.id)}
                            className={"flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50" + (draggingBlock === block.id ? " opacity-40" : "")}
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Plus className="size-3.5" /></span>
                            <span className="min-w-0 flex-1"><span className="block text-xs font-medium text-slate-800">{block.label}</span><span className="block text-[10px] text-slate-500">{block.description}</span></span>
                          </button>
                        ))}
                        {builderBlockCatalog.every((block) => selected.builder.layout.order.includes(block.id)) ? <p className="py-2 text-center text-[11px] text-muted-foreground">All blocks are already on this page.</p> : null}
                      </div>
                    </div>
                  </div>
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
              className="mx-auto flex min-h-[calc(100dvh-170px)] flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_18px_60px_rgba(29,48,80,0.16)]"
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
                  formOverride={previewForm}
                  preview
                  builderEditMode
                  onSelectBlock={setSelectedBlock}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
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

function isLightColor(color: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!match) return false;
  const r = Number.parseInt(match[1], 16);
  const g = Number.parseInt(match[2], 16);
  const b = Number.parseInt(match[3], 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

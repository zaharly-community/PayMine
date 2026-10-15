export type ClientPortalEnvironment = "Production" | "Sandbox";
export type ClientPortalFormStatus = "Published" | "Draft";
export type ClientPortalTheme = "dark" | "light";
export type ClientPortalThemePreset = "stripe" | "minimal" | "editorial";
export type ClientPortalWidth = "compact" | "wide";
export type ClientPortalRadius = "small" | "medium" | "large";
export type ClientPortalShape = "pill" | "rounded" | "rectangle";
export type ClientPortalMethodLayout = "tabs" | "cards";
export type ClientPortalIdentifierMode = "playerId" | "email" | "both";
export type ClientPortalBlockKey = "playerIdentifier" | "amount" | "paymentMethods" | "paymentEvidence" | "submitButton";
export type ClientPortalBlockContent = {
  enabled: boolean;
  label: string;
  description: string;
  placeholder: string;
};
export type ClientPortalBlocks = Record<ClientPortalBlockKey, ClientPortalBlockContent>;

export type ClientPortalConfigs = {
  paymentMethodLayout: ClientPortalMethodLayout;
  playerIdentifier: ClientPortalIdentifierMode;
  presetAmounts: number[];
  timerEnabled: boolean;
  timerMinutes: number;
  scheduleEnabled: boolean;
  activeDays: string[];
  startTime: string;
  endTime: string;
};

export type ClientPortalFeatures = {
  supervisorRating: boolean;
  playerRating: boolean;
  aiRecognition: boolean;
  aiAutoConfirmation: boolean;
};

export const CLIENT_PORTAL_FORMS_STORAGE_KEY = "ipaycash-client-portal-forms-v1";
export const CLIENT_PORTAL_FORMS_CHANGE_EVENT = "ipaycash-client-portal-forms-changed";
export const CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY = "ipaycash-client-portal-active-form-v1";

export const clientPortalMethodOptions = [
  "Flouci",
  "Binance Pay",
  "D17",
  "Kashy",
  "e-Dinar",
  "Ooredoo",
  "Orange",
  "Tunisie Telecom",
] as const;

export type ClientPortalMethod = (typeof clientPortalMethodOptions)[number];

export type ClientPortalAppearance = {
  brandName: string;
  logoUrl: string;
  showLogo: boolean;
  showPlatformBranding: boolean;
  title: string;
  description: string;
  buttonLabel: string;
  theme: ClientPortalTheme;
  themePreset: ClientPortalThemePreset;
  width: ClientPortalWidth;
  radius: ClientPortalRadius;
  shape: ClientPortalShape;
  fontFamily: "system" | "sans" | "serif";
  primaryColor: string;
  brandColor: string;
  backgroundColor: string;
  surfaceColor: string;
};

export type ClientPortalForm = {
  id: string;
  name: string;
  slug: string;
  environment: ClientPortalEnvironment;
  methods: string[];
  status: ClientPortalFormStatus;
  isDefault: boolean;
  sessions: number;
  conversion: string;
  updated: string;
  currency: string;
  appearance: ClientPortalAppearance;
  configs: ClientPortalConfigs;
  features: ClientPortalFeatures;
  blocks: ClientPortalBlocks;
};

const defaultAppearance: ClientPortalAppearance = {
  brandName: "iPayCash",
  logoUrl: "",
  showLogo: true,
  showPlatformBranding: true,
  title: "Make a deposit",
  description: "Choose your preferred payment method and complete your deposit securely.",
  buttonLabel: "Continue securely",
  theme: "dark",
  themePreset: "stripe",
  width: "compact",
  radius: "medium",
  shape: "rounded",
  fontFamily: "sans",
  primaryColor: "#34d399",
  brandColor: "#2563eb",
  backgroundColor: "#020617",
  surfaceColor: "#0f172a",
};

export function createDefaultClientPortalConfigs(): ClientPortalConfigs {
  return {
    paymentMethodLayout: "cards",
    playerIdentifier: "both",
    presetAmounts: [20, 50, 100, 200, 500, 1000],
    timerEnabled: false,
    timerMinutes: 10,
    scheduleEnabled: false,
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startTime: "08:00",
    endTime: "22:00",
  };
}

export function createDefaultClientPortalFeatures(): ClientPortalFeatures {
  return {
    supervisorRating: true,
    playerRating: true,
    aiRecognition: false,
    aiAutoConfirmation: false,
  };
}

export function createDefaultClientPortalBlocks(title = "Make a deposit"): ClientPortalBlocks {
  return {
    playerIdentifier: {
      enabled: true,
      label: "Player ID",
      description: "Enter your player ID or the email associated with your account.",
      placeholder: "Enter your player ID or email",
    },
    amount: {
      enabled: true,
      label: "Deposit amount",
      description: "Choose how much you would like to deposit.",
      placeholder: "Enter deposit amount",
    },
    paymentMethods: {
      enabled: true,
      label: "Payment method",
      description: "Choose an available payment method to continue.",
      placeholder: "Select a payment method",
    },
    paymentEvidence: {
      enabled: true,
      label: "Payment evidence",
      description: "Upload a receipt or screenshot if this payment method requires manual verification.",
      placeholder: "Upload payment proof",
    },
    submitButton: {
      enabled: true,
      label: "Continue securely",
      description: "Continue to the next step of the checkout.",
      placeholder: "",
    },
  };
}

const defaultConfigs = createDefaultClientPortalConfigs();
const defaultFeatures = createDefaultClientPortalFeatures();

const defaultForms: ClientPortalForm[] = [
  {
    id: "FORM-DEP-001",
    name: "Main Deposit Checkout",
    slug: "main-deposit",
    environment: "Production",
    methods: ["Flouci", "D17", "Kashy", "e-Dinar"],
    status: "Published",
    isDefault: true,
    sessions: 18420,
    conversion: "68.4%",
    updated: "18 Sep 2026, 09:22",
    currency: "TND",
    appearance: { ...defaultAppearance },
    configs: { ...defaultConfigs, presetAmounts: [...defaultConfigs.presetAmounts] },
    features: { ...defaultFeatures },
    blocks: createDefaultClientPortalBlocks(),
  },
  {
    id: "FORM-DEP-002",
    name: "VIP Deposit",
    slug: "vip-deposit",
    environment: "Production",
    methods: ["Flouci", "Binance Pay", "Kashy"],
    status: "Published",
    isDefault: false,
    sessions: 6210,
    conversion: "74.1%",
    updated: "17 Sep 2026, 16:05",
    currency: "TND",
    appearance: {
      ...defaultAppearance,
      title: "VIP deposit",
      description: "A dedicated checkout experience for VIP players.",
      primaryColor: "#a78bfa",
      width: "wide",
      radius: "large",
      shape: "pill",
      themePreset: "editorial",
    },
    configs: { ...defaultConfigs, playerIdentifier: "playerId", presetAmounts: [50, 100, 250, 500, 1000], timerEnabled: true, timerMinutes: 8 },
    features: { ...defaultFeatures, aiRecognition: true, aiAutoConfirmation: false },
    blocks: createDefaultClientPortalBlocks("VIP deposit"),
  },
  {
    id: "FORM-DEP-003",
    name: "Mobile Wallet Checkout",
    slug: "wallet-mobile",
    environment: "Sandbox",
    methods: ["D17", "Flouci", "e-Dinar"],
    status: "Draft",
    isDefault: false,
    sessions: 842,
    conversion: "61.8%",
    updated: "16 Sep 2026, 11:44",
    currency: "TND",
    appearance: {
      ...defaultAppearance,
      title: "Mobile wallet deposit",
      description: "A compact checkout for mobile wallet payments.",
      width: "compact",
      themePreset: "minimal",
      theme: "light",
      shape: "rectangle",
      backgroundColor: "#f8fafc",
      surfaceColor: "#ffffff",
      primaryColor: "#2563eb",
      brandColor: "#1d4ed8",
    },
    configs: { ...defaultConfigs, paymentMethodLayout: "tabs", playerIdentifier: "email", presetAmounts: [10, 25, 50, 100, 200], scheduleEnabled: true, activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "08:00", endTime: "22:00" },
    features: { ...defaultFeatures, supervisorRating: false, playerRating: true },
    blocks: createDefaultClientPortalBlocks("Mobile wallet deposit"),
  },
];

function cloneBlocks(blocks: ClientPortalBlocks): ClientPortalBlocks {
  return {
    playerIdentifier: { ...blocks.playerIdentifier },
    amount: { ...blocks.amount },
    paymentMethods: { ...blocks.paymentMethods },
    paymentEvidence: { ...blocks.paymentEvidence },
    submitButton: { ...blocks.submitButton },
  };
}

function cloneForm(form: ClientPortalForm): ClientPortalForm {
  return {
    ...form,
    methods: [...form.methods],
    appearance: { ...form.appearance },
    configs: { ...form.configs, activeDays: [...form.configs.activeDays], presetAmounts: [...form.configs.presetAmounts] },
    features: { ...form.features },
    blocks: cloneBlocks(form.blocks),
  };
}

export function getDefaultClientPortalForms(): ClientPortalForm[] {
  return defaultForms.map(cloneForm);
}

function normalizeForm(value: unknown, index: number): ClientPortalForm | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<ClientPortalForm>;
  if (typeof input.id !== "string" || typeof input.name !== "string" || typeof input.slug !== "string") return null;

  const fallback = defaultForms.find((item) => item.id === input.id) ?? defaultForms[index % defaultForms.length];
  const rawAppearance = input.appearance && typeof input.appearance === "object"
    ? (input.appearance as Partial<ClientPortalAppearance>)
    : {};
  const rawConfigs = input.configs && typeof input.configs === "object" ? input.configs as Partial<ClientPortalConfigs> : {};
  const rawFeatures = input.features && typeof input.features === "object" ? input.features as Partial<ClientPortalFeatures> : {};
  const rawBlocks = input.blocks && typeof input.blocks === "object" ? input.blocks as Partial<ClientPortalBlocks> : {};
  const allowedMethods = Array.isArray(input.methods)
    ? input.methods.filter((item): item is string => typeof item === "string" && clientPortalMethodOptions.includes(item as ClientPortalMethod))
    : fallback.methods;
  const rawAmounts = Array.isArray(rawConfigs.presetAmounts)
    ? rawConfigs.presetAmounts.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0 && amount <= 1000000).slice(0, 8)
    : fallback.configs.presetAmounts;
  const validDays = Array.isArray(rawConfigs.activeDays)
    ? rawConfigs.activeDays.filter((day): day is string => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day))
    : fallback.configs.activeDays;

  const fallbackBlocks = createDefaultClientPortalBlocks();
  const blocks = {} as ClientPortalBlocks;
  (["playerIdentifier", "amount", "paymentMethods", "paymentEvidence", "submitButton"] as const).forEach((key) => {
    const candidate = rawBlocks[key];
    const base = fallbackBlocks[key];
    blocks[key] = {
      enabled: candidate?.enabled !== false,
      label: typeof candidate?.label === "string" ? candidate.label.slice(0, 100) : base.label,
      description: typeof candidate?.description === "string" ? candidate.description.slice(0, 240) : base.description,
      placeholder: typeof candidate?.placeholder === "string" ? candidate.placeholder.slice(0, 120) : base.placeholder,
    };
  });

  const shape = rawAppearance.shape === "pill" || rawAppearance.shape === "rectangle" ? rawAppearance.shape : "rounded";
  const preset = rawAppearance.themePreset === "minimal" || rawAppearance.themePreset === "editorial" ? rawAppearance.themePreset : "stripe";

  return {
    ...cloneForm(fallback),
    ...input,
    id: input.id,
    name: input.name,
    slug: input.slug,
    environment: input.environment === "Production" ? "Production" : "Sandbox",
    methods: allowedMethods.length ? [...new Set(allowedMethods)] : [...fallback.methods],
    status: input.status === "Published" ? "Published" : "Draft",
    isDefault: input.isDefault === true,
    sessions: Number.isFinite(input.sessions) ? Math.max(0, Number(input.sessions)) : 0,
    conversion: typeof input.conversion === "string" ? input.conversion : "—",
    updated: typeof input.updated === "string" ? input.updated : "Not saved",
    currency: typeof input.currency === "string" ? input.currency : fallback.currency,
    appearance: {
      ...defaultAppearance,
      ...rawAppearance,
      brandName: typeof rawAppearance.brandName === "string" ? rawAppearance.brandName : defaultAppearance.brandName,
      logoUrl: typeof rawAppearance.logoUrl === "string" ? rawAppearance.logoUrl.slice(0, 2048) : "",
      showLogo: rawAppearance.showLogo !== false,
      showPlatformBranding: rawAppearance.showPlatformBranding !== false,
      title: typeof rawAppearance.title === "string" ? rawAppearance.title.slice(0, 120) : defaultAppearance.title,
      description: typeof rawAppearance.description === "string" ? rawAppearance.description.slice(0, 300) : defaultAppearance.description,
      buttonLabel: typeof rawAppearance.buttonLabel === "string" ? rawAppearance.buttonLabel.slice(0, 80) : defaultAppearance.buttonLabel,
      theme: rawAppearance.theme === "light" ? "light" : "dark",
      themePreset: preset,
      width: rawAppearance.width === "wide" ? "wide" : "compact",
      radius: rawAppearance.radius === "small" || rawAppearance.radius === "large" ? rawAppearance.radius : "medium",
      shape,
      fontFamily: rawAppearance.fontFamily === "system" || rawAppearance.fontFamily === "serif" ? rawAppearance.fontFamily : "sans",
      primaryColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.primaryColor ?? "") ? rawAppearance.primaryColor! : defaultAppearance.primaryColor,
      brandColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.brandColor ?? "") ? rawAppearance.brandColor! : defaultAppearance.brandColor,
      backgroundColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.backgroundColor ?? "") ? rawAppearance.backgroundColor! : defaultAppearance.backgroundColor,
      surfaceColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.surfaceColor ?? "") ? rawAppearance.surfaceColor! : defaultAppearance.surfaceColor,
    },
    configs: {
      ...createDefaultClientPortalConfigs(),
      ...rawConfigs,
      paymentMethodLayout: rawConfigs.paymentMethodLayout === "tabs" ? "tabs" : "cards",
      playerIdentifier: rawConfigs.playerIdentifier === "playerId" || rawConfigs.playerIdentifier === "email" ? rawConfigs.playerIdentifier : "both",
      presetAmounts: rawAmounts.length ? [...rawAmounts] : [...fallback.configs.presetAmounts],
      timerEnabled: rawConfigs.timerEnabled === true,
      timerMinutes: Number.isFinite(rawConfigs.timerMinutes) ? Math.min(120, Math.max(1, Math.round(Number(rawConfigs.timerMinutes)))) : fallback.configs.timerMinutes,
      scheduleEnabled: rawConfigs.scheduleEnabled === true,
      activeDays: validDays.length ? [...new Set(validDays)] : [...fallback.configs.activeDays],
      startTime: typeof rawConfigs.startTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(rawConfigs.startTime) ? rawConfigs.startTime : fallback.configs.startTime,
      endTime: typeof rawConfigs.endTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(rawConfigs.endTime) ? rawConfigs.endTime : fallback.configs.endTime,
    },
    features: {
      supervisorRating: rawFeatures.supervisorRating !== false,
      playerRating: rawFeatures.playerRating !== false,
      aiRecognition: rawFeatures.aiRecognition === true,
      aiAutoConfirmation: rawFeatures.aiAutoConfirmation === true && rawFeatures.aiRecognition === true,
    },
    blocks,
  };
}

export function getClientPortalForms(): ClientPortalForm[] {
  if (typeof window === "undefined") return getDefaultClientPortalForms();
  try {
    const raw = window.localStorage.getItem(CLIENT_PORTAL_FORMS_STORAGE_KEY);
    if (!raw) return getDefaultClientPortalForms();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return getDefaultClientPortalForms();
    const forms = parsed.map(normalizeForm).filter((form): form is ClientPortalForm => form !== null);
    if (!forms.length) return getDefaultClientPortalForms();
    const publishedDefaults = forms.filter((form) => form.status === "Published" && form.isDefault);
    if (publishedDefaults.length > 1) {
      const keepId = publishedDefaults[0].id;
      return forms.map((form) => ({ ...form, isDefault: form.id === keepId }));
    }
    return forms;
  } catch {
    return getDefaultClientPortalForms();
  }
}

export function saveClientPortalForms(forms: ClientPortalForm[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIENT_PORTAL_FORMS_STORAGE_KEY, JSON.stringify(forms));
    window.dispatchEvent(new Event(CLIENT_PORTAL_FORMS_CHANGE_EVENT));
  } catch {
    // Local storage can be unavailable in restricted or private browser contexts.
  }
}

export function isClientPortalScheduleActive(configs: ClientPortalConfigs, now = new Date()) {
  if (!configs.scheduleEnabled) return true;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[now.getDay()];
  const previousDay = dayNames[(now.getDay() + 6) % 7];
  if (!configs.activeDays.length) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = configs.startTime.split(":").map(Number);
  const [endHour, endMinute] = configs.endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (start === end) return configs.activeDays.includes(day);
  if (start < end) return configs.activeDays.includes(day) && current >= start && current < end;
  if (current >= start) return configs.activeDays.includes(day);
  if (current < end) return configs.activeDays.includes(previousDay);
  return false;
}

export function getClientPortalFormForSlug(slug?: string, allowDraft = false): ClientPortalForm | null {
  const forms = getClientPortalForms();
  const knownMethodSlugs = ["flouci", "binance-pay", "d17", "kashy", "e-dinar", "ooredoo", "orange", "tunisie-telecom"];

  if (slug) {
    const bySlug = forms.find((form) => form.slug === slug);
    if (bySlug) {
      if (bySlug.status === "Published" || allowDraft) {
        try {
          if (typeof window !== "undefined") window.sessionStorage.setItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY, bySlug.slug);
        } catch {}
        return cloneForm(bySlug);
      }
      return null;
    }
    if (!knownMethodSlugs.includes(slug)) return null;
  }

  const activeSlug = (() => {
    try {
      return typeof window !== "undefined" ? window.sessionStorage.getItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY) : null;
    } catch {
      return null;
    }
  })();
  const fallback = forms.find((form) => form.status === "Published" && form.isDefault)
    ?? forms.find((form) => form.status === "Published" && form.slug === activeSlug)
    ?? forms.find((form) => form.status === "Published")
    ?? (allowDraft ? forms[0] : null)
    ?? (!forms.length ? defaultForms[0] : null);
  if (!fallback) return null;
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY, fallback.slug);
  } catch {}
  return cloneForm(fallback);
}

export function normalizeClientPortalSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

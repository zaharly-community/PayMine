export type ClientPortalEnvironment = "Production" | "Sandbox";
export type ClientPortalFormStatus = "Published" | "Draft";
export type ClientPortalTheme = "dark" | "light";
export type ClientPortalWidth = "compact" | "wide";
export type ClientPortalRadius = "small" | "medium" | "large";

export const CLIENT_PORTAL_FORMS_STORAGE_KEY = "ipaycash-client-portal-forms-v1";
export const CLIENT_PORTAL_FORMS_CHANGE_EVENT = "ipaycash-client-portal-forms-changed";

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
  width: ClientPortalWidth;
  radius: ClientPortalRadius;
  primaryColor: string;
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
  width: "compact",
  radius: "medium",
  primaryColor: "#34d399",
  backgroundColor: "#020617",
  surfaceColor: "#0f172a",
};

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
    },
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
    },
  },
];

function cloneForm(form: ClientPortalForm): ClientPortalForm {
  return {
    ...form,
    methods: [...form.methods],
    appearance: { ...form.appearance },
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
  const allowedMethods = Array.isArray(input.methods)
    ? input.methods.filter((item): item is string => typeof item === "string" && clientPortalMethodOptions.includes(item as ClientPortalMethod))
    : fallback.methods;

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
      logoUrl: typeof rawAppearance.logoUrl === "string" ? rawAppearance.logoUrl : "",
      showLogo: rawAppearance.showLogo !== false,
      showPlatformBranding: rawAppearance.showPlatformBranding !== false,
      title: typeof rawAppearance.title === "string" ? rawAppearance.title : defaultAppearance.title,
      description: typeof rawAppearance.description === "string" ? rawAppearance.description : defaultAppearance.description,
      buttonLabel: typeof rawAppearance.buttonLabel === "string" ? rawAppearance.buttonLabel : defaultAppearance.buttonLabel,
      theme: rawAppearance.theme === "light" ? "light" : "dark",
      width: rawAppearance.width === "wide" ? "wide" : "compact",
      radius: rawAppearance.radius === "small" || rawAppearance.radius === "large" ? rawAppearance.radius : "medium",
      primaryColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.primaryColor ?? "") ? rawAppearance.primaryColor! : defaultAppearance.primaryColor,
      backgroundColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.backgroundColor ?? "") ? rawAppearance.backgroundColor! : defaultAppearance.backgroundColor,
      surfaceColor: /^#[0-9a-f]{6}$/i.test(rawAppearance.surfaceColor ?? "") ? rawAppearance.surfaceColor! : defaultAppearance.surfaceColor,
    },
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

const CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY = "ipaycash-client-portal-active-form-v1";

export function getClientPortalFormForSlug(slug?: string): ClientPortalForm {
  const forms = getClientPortalForms();
  if (slug) {
    const bySlug = forms.find((form) => form.slug === slug && form.status === "Published");
    if (bySlug) {
      try {
        if (typeof window !== "undefined") window.sessionStorage.setItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY, bySlug.slug);
      } catch {
        // Session storage may be unavailable in restricted browser contexts.
      }
      return cloneForm(bySlug);
    }

    try {
      const activeSlug = typeof window !== "undefined" ? window.sessionStorage.getItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY) : null;
      const activeForm = activeSlug ? forms.find((form) => form.slug === activeSlug && form.status === "Published") : null;
      if (activeForm) return cloneForm(activeForm);
    } catch {
      // Fall back to the configured default if session storage is unavailable.
    }
  }

  const fallback = forms.find((form) => form.status === "Published" && form.isDefault)
    ?? forms.find((form) => form.status === "Published")
    ?? defaultForms[0];
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(CLIENT_PORTAL_ACTIVE_FORM_SESSION_KEY, fallback.slug);
  } catch {
    // Session storage may be unavailable in restricted browser contexts.
  }
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

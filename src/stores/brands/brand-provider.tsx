import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { APP_CONFIG } from "@/config/app-config";

export type DashboardBrand = {
  id: string;
  name: string;
  initials: string;
  description: string;
  url: string;
};

export const DASHBOARD_BRANDS: readonly DashboardBrand[] = [
  {
    id: "primary",
    name: APP_CONFIG.name,
    initials: APP_CONFIG.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    description: "Primary brand",
    url: "",
  },
  {
    id: "brand-two",
    name: "Brand Two",
    initials: "B2",
    description: "Secondary brand",
    url: "",
  },
  {
    id: "brand-three",
    name: "Brand Three",
    initials: "B3",
    description: "Secondary brand",
    url: "",
  },
];

const DEFAULT_BRAND = DASHBOARD_BRANDS[0] as DashboardBrand;
const BRANDS_STORAGE_KEY = "paymine_brands";
const ACTIVE_BRAND_STORAGE_KEY = "paymine_active_brand";

type BrandContextValue = {
  brands: readonly DashboardBrand[];
  activeBrand: DashboardBrand;
  setActiveBrand: (brandId: string) => void;
  addBrand: (input: { name: string; description?: string; url: string }) => DashboardBrand;
};

const BrandContext = createContext<BrandContextValue | null>(null);

function createBrandId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `brand-${Date.now()}`;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BR"
  );
}

function getBrandDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isStoredBrand(value: unknown): value is DashboardBrand {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const brand = value as Record<string, unknown>;

  return (
    typeof brand.id === "string" &&
    typeof brand.name === "string" &&
    typeof brand.initials === "string" &&
    typeof brand.description === "string" &&
    (typeof brand.url === "string" || brand.url === undefined)
  );
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<DashboardBrand[]>(() => [...DASHBOARD_BRANDS]);
  const [activeBrandId, setActiveBrandId] = useState(DEFAULT_BRAND.id);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedBrands = window.localStorage.getItem(BRANDS_STORAGE_KEY);
      const storedActiveBrandId = window.localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);

      if (storedBrands) {
        const parsedBrands: unknown = JSON.parse(storedBrands);

        if (Array.isArray(parsedBrands) && parsedBrands.length > 0 && parsedBrands.every(isStoredBrand)) {
          const restoredBrands = parsedBrands.map((brand) => ({
            ...brand,
            url: brand.url ?? "",
          }));

          setBrands(restoredBrands);

          if (storedActiveBrandId && restoredBrands.some((brand) => brand.id === storedActiveBrandId)) {
            setActiveBrandId(storedActiveBrandId);
          }
        }
      } else if (storedActiveBrandId && DASHBOARD_BRANDS.some((brand) => brand.id === storedActiveBrandId)) {
        setActiveBrandId(storedActiveBrandId);
      }
    } catch {
      // Ignore storage access errors and keep the defaults.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
      window.localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, activeBrandId);
    } catch {
      // Ignore storage access errors; switching still works in memory.
    }
  }, [activeBrandId, brands, isHydrated]);

  const setActiveBrand = useCallback(
    (brandId: string) => {
      if (brands.some((brand) => brand.id === brandId)) {
        setActiveBrandId(brandId);
      }
    },
    [brands],
  );

  const addBrand = useCallback((input: { name: string; description?: string; url: string }) => {
    const name = input.name.trim();
    const url = input.url.trim();
    const description = input.description?.trim() || getBrandDomain(url) || "Custom brand";
    const brand: DashboardBrand = {
      id: createBrandId(),
      name,
      initials: getInitials(name),
      description,
      url,
    };

    setBrands((current) => [...current, brand]);
    setActiveBrandId(brand.id);

    return brand;
  }, []);

  const activeBrand = useMemo(
    () => brands.find((brand) => brand.id === activeBrandId) ?? brands[0] ?? DEFAULT_BRAND,
    [activeBrandId, brands],
  );

  const value = useMemo<BrandContextValue>(
    () => ({
      brands,
      activeBrand,
      setActiveBrand,
      addBrand,
    }),
    [activeBrand, addBrand, brands, setActiveBrand],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const context = useContext(BrandContext);

  if (!context) {
    throw new Error("useBrand must be used within BrandProvider.");
  }

  return context;
}

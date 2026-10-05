import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { APP_CONFIG } from "@/config/app-config";

export type DashboardBrand = {
  id: string;
  name: string;
  initials: string;
  description: string;
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
  },
  {
    id: "brand-two",
    name: "Brand Two",
    initials: "B2",
    description: "Secondary brand",
  },
  {
    id: "brand-three",
    name: "Brand Three",
    initials: "B3",
    description: "Secondary brand",
  },
];

type BrandContextValue = {
  brands: readonly DashboardBrand[];
  activeBrand: DashboardBrand;
  setActiveBrand: (brandId: string) => void;
};

const BRAND_STORAGE_KEY = "paymine_active_brand";
const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [activeBrandId, setActiveBrandId] = useState(DASHBOARD_BRANDS[0]?.id ?? "");

  useEffect(() => {
    try {
      const storedBrandId = window.localStorage.getItem(BRAND_STORAGE_KEY);
      if (storedBrandId && DASHBOARD_BRANDS.some((brand) => brand.id === storedBrandId)) {
        setActiveBrandId(storedBrandId);
      }
    } catch {
      // Ignore storage access errors and keep the default brand.
    }
  }, []);

  useEffect(() => {
    if (!activeBrandId) return;

    try {
      window.localStorage.setItem(BRAND_STORAGE_KEY, activeBrandId);
    } catch {
      // Ignore storage access errors; switching still works in memory.
    }
  }, [activeBrandId]);

  const activeBrand = useMemo(
    () => DASHBOARD_BRANDS.find((brand) => brand.id === activeBrandId) ?? DASHBOARD_BRANDS[0],
    [activeBrandId],
  );

  const value = useMemo<BrandContextValue>(
    () => ({
      brands: DASHBOARD_BRANDS,
      activeBrand,
      setActiveBrand: setActiveBrandId,
    }),
    [activeBrand],
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

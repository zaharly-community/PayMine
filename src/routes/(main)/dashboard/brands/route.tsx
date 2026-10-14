import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(main)/dashboard/brands")({ component: BrandsPage });

type Brand = { id: string; name: string; country: string; plan: string; status: "Active" | "Onboarding" | "Suspended"; volume: number; commission: number; successRate: number; openIssues: number };
const brands: Brand[] = [
  { id: "BR-0018", name: "Betcon Demo", country: "Tunisia", plan: "Enterprise", status: "Active", volume: 382400, commission: 18432, successRate: 97.4, openIssues: 2 },
  { id: "BR-0017", name: "Atlas Payments", country: "Tunisia", plan: "Growth", status: "Active", volume: 248120, commission: 9124, successRate: 96.8, openIssues: 1 },
  { id: "BR-0016", name: "Northline Network", country: "Tunisia", plan: "Growth", status: "Active", volume: 187650, commission: 7348, successRate: 94.2, openIssues: 4 },
  { id: "BR-0015", name: "Cedar Play", country: "Expansion review", plan: "Starter", status: "Onboarding", volume: 0, commission: 0, successRate: 0, openIssues: 3 },
  { id: "BR-0014", name: "Delta Commerce", country: "Tunisia", plan: "Enterprise", status: "Suspended", volume: 52800, commission: 1810, successRate: 81.6, openIssues: 7 },
];

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function BrandsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = useMemo(() => brands.filter((brand) => [brand.id, brand.name, brand.country, brand.plan].join(" ").toLowerCase().includes(query.toLowerCase()) && (statusFilter === "All" || brand.status === statusFilter)), [query, statusFilter]);
  const active = brands.filter((brand) => brand.status === "Active").length;
  const volume = brands.reduce((sum, brand) => sum + brand.volume, 0);
  const issues = brands.reduce((sum, brand) => sum + brand.openIssues, 0);

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="size-4" /> Platform / Brands</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Brand portfolio</h1><p className="mt-1 text-sm text-muted-foreground">Compare tenant activity, subscription plans, transaction quality and open operational risks.</p></div><Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("All"); }}>Reset filters</Button></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Demo portfolio.</strong> Volumes and commissions are sample values for UI validation, not reported financial results.</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Brand records</p><p className="mt-2 text-2xl font-semibold">{brands.length}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active brands</p><p className="mt-2 text-2xl font-semibold">{active}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Illustrative payment volume</p><p className="mt-2 text-2xl font-semibold">{money(volume)}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Open issues</p><p className="mt-2 text-2xl font-semibold">{issues}</p></CardContent></Card></div>
    <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brand, ID, country or plan..." /></div><select aria-label="Brand status" className="h-9 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Active</option><option>Onboarding</option><option>Suspended</option></select></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr>{["Brand", "Country / Market", "Plan", "Payment volume*", "Commission*", "Success rate", "Open issues", "Status"].map((name) => <th key={name} className="px-3 py-3 font-medium whitespace-nowrap">{name}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((brand) => <tr key={brand.id} className="hover:bg-muted/20"><td className="px-3 py-3"><span className="block font-medium">{brand.name}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{brand.id}</span></td><td className="px-3 py-3 text-muted-foreground">{brand.country}</td><td className="px-3 py-3"><Badge variant="secondary">{brand.plan}</Badge></td><td className="px-3 py-3 tabular-nums">{money(brand.volume)}</td><td className="px-3 py-3 tabular-nums">{money(brand.commission)}</td><td className="px-3 py-3 tabular-nums">{brand.successRate ? brand.successRate.toFixed(1) + "%" : "—"}</td><td className="px-3 py-3"><Badge variant="outline" className={brand.openIssues > 3 ? "text-amber-700" : ""}>{brand.openIssues}</Badge></td><td className="px-3 py-3"><Badge variant="outline" className={brand.status === "Active" ? "text-emerald-700" : brand.status === "Suspended" ? "text-destructive" : "text-amber-700"}>{brand.status}</Badge></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No brands match these filters.</div>}</div>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">* Illustrative USD equivalent for presentation only. Production reports must group native amounts by currency or use a defined, auditable FX conversion.</div>
    </Card>
  </section>;
}

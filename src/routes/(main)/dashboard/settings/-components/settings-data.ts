export const settingsNav = [
  { key: "general", label: "General", description: "Workspace profile and regional defaults." },
  { key: "languages", label: "Languages", description: "Language, locale and timezone preferences." },
  { key: "security", label: "Security", description: "Authentication and access protection." },
  { key: "notifications", label: "Notifications", description: "Control operational alerts and channels." },
  { key: "audit-log", label: "Audit log", description: "Review administrative activity." },
  { key: "billing", label: "Billing", description: "Plan, invoices and payment settings." },
  { key: "features", label: "Features", description: "Enable and manage platform modules." },
  { key: "portal-routing", label: "Portal routing", description: "Control portal ordering priorities for distributors and wallets." },
  { key: "custom-domain", label: "Custom domain", description: "Branded dashboard and portal domains." },
  { key: "team-access", label: "Team & access", description: "Workspace members, roles and permissions." },
] as const;

export type SettingsKey = (typeof settingsNav)[number]["key"];

export const auditRows = [
  { id: "AUD-260918-041", actor: "Aiy", action: "Changed payout approval rule", target: "Withdrawals", ip: "172.16.24.18", date: "18 Sep 2026, 10:14" },
  { id: "AUD-260918-040", actor: "Maya Chen", action: "Updated payment method permissions", target: "Supervisor S-203", ip: "172.16.24.22", date: "18 Sep 2026, 09:48" },
  { id: "AUD-260918-039", actor: "Aiy", action: "Enabled D17 integration", target: "D17", ip: "172.16.24.18", date: "18 Sep 2026, 09:16" },
  { id: "AUD-260918-038", actor: "Omar Ben Ali", action: "Added distributor", target: "Agent A-121", ip: "172.16.24.30", date: "18 Sep 2026, 08:55" },
  { id: "AUD-260918-037", actor: "Aiy", action: "Changed default language", target: "English", ip: "172.16.24.18", date: "17 Sep 2026, 19:32" },
] as const;

export const billingInvoices = [
  { id: "INV-2026-09", period: "Sep 2026", amount: "$1,480.00", status: "Open", due: "30 Sep 2026" },
  { id: "INV-2026-08", period: "Aug 2026", amount: "$1,480.00", status: "Paid", due: "31 Aug 2026" },
  { id: "INV-2026-07", period: "Jul 2026", amount: "$1,250.00", status: "Paid", due: "31 Jul 2026" },
] as const;

export const featureRows = [
  { name: "Distributor network", description: "Agents, Supervisors and custom processing programs.", status: "Enabled", owner: "Operations" },
  { name: "Payment forms", description: "Hosted checkout forms for player deposits.", status: "Enabled", owner: "Portal" },
  { name: "Treasury reconciliation", description: "Expected versus actual provider account checks.", status: "Enabled", owner: "Finance" },
  { name: "Advanced risk rules", description: "Rule-based transaction review and holds.", status: "Preview", owner: "Risk" },
  { name: "White-label portals", description: "Brandable payment and account experiences.", status: "Disabled", owner: "Portal" },
] as const;

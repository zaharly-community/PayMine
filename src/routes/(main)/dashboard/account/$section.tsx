import { useState, type ReactNode } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";
import { useShallow } from "zustand/react/shallow";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Laptop,
  LockKeyhole,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import { type ContentLayout, type NavbarStyle, type SidebarCollapsible, type SidebarVariant } from "@/lib/preferences/layout";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { useAuth } from "@/stores/auth/auth-provider";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export const Route = createFileRoute("/(main)/dashboard/account/$section")({
  component: AccountSettingsPage,
});

const accountTabs = [
  { slug: "profile", label: "Profile", icon: UserRound },
  { slug: "security", label: "Security", icon: LockKeyhole },
  { slug: "notifications", label: "Notifications", icon: Bell },
  { slug: "billing", label: "Billing", icon: CreditCard },
  { slug: "apperance", label: "Appearance", icon: Palette },
] as const;

type AccountSection = (typeof accountTabs)[number]["slug"];

function AccountSettingsPage() {
  const { section } = Route.useParams();
  const { user } = useAuth();
  const activeSection: AccountSection =
    section === "appearance" || section === "apperance"
      ? "apperance"
      : accountTabs.some((tab) => tab.slug === section)
        ? (section as AccountSection)
        : "profile";

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col gap-5 md:flex-row md:gap-6" data-content-padding="false">
      <aside className="w-full shrink-0 md:w-[205px]">
        <nav aria-label="Account settings" className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
          {accountTabs.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              to={("/dashboard/account/" + slug) as any}
              className={
                "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors " +
                (activeSection === slug
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
              }
              aria-current={activeSection === slug ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        {activeSection === "profile" ? (
          <section className="rounded-2xl border bg-card p-4 sm:p-6">
            <div>
              <h1 className="text-base font-semibold tracking-tight">Profile Information</h1>
              <p className="mt-1 text-sm text-muted-foreground">Update your account profile details</p>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={user?.avatar || undefined} alt={name || "Profile photo"} />
                <AvatarFallback className="text-base">{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name || "Account user"}</p>
                <p className="truncate text-sm text-muted-foreground">{email}</p>
                {user?.role ? <Badge variant="outline" className="mt-2">{user.role}</Badge> : null}
              </div>
            </div>

            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                try {
                  window.localStorage.setItem("ipaycash_profile_settings", JSON.stringify({ name, email }));
                } catch {
                  // Keep the form usable if browser storage is unavailable.
                }
                setProfileSaved(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account-full-name">Full Name</Label>
                  <Input id="account-full-name" value={name} onChange={(event) => { setName(event.target.value); setProfileSaved(false); }} autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email Address</Label>
                  <Input id="account-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setProfileSaved(false); }} autoComplete="email" />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
                {profileSaved ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="size-3.5" /> Saved locally</span> : null}
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </section>
        ) : null}

        {activeSection === "apperance" ? <AppearancePanel /> : null}

        {activeSection === "security" ? (
          <SettingsPanel title="Security" description="Review account protection and sign-in preferences.">
            <SettingRow icon={ShieldCheck} title="Two-factor authentication" description="Add a second step when signing in to your account." defaultChecked={false} />
            <SettingRow icon={LockKeyhole} title="Login notifications" description="Get notified when a new device signs in." defaultChecked />
            <div className="flex items-start gap-3 border-t pt-4">
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">Active sessions</p><p className="mt-1 text-xs text-muted-foreground">Your current demo session is active on this browser.</p></div>
              <Badge variant="secondary">Current session</Badge>
            </div>
          </SettingsPanel>
        ) : null}

        {activeSection === "notifications" ? (
          <SettingsPanel title="Notifications" description="Choose which account and payment events should be surfaced to you.">
            <SettingRow icon={Bell} title="Payment alerts" description="Pending transactions, delays and failed payments." defaultChecked />
            <SettingRow icon={ShieldCheck} title="Player reports" description="New complaints and reports that require review." defaultChecked />
            <SettingRow icon={CreditCard} title="Card capacity alerts" description="Warn when a payment card approaches its configured limit." defaultChecked />
          </SettingsPanel>
        ) : null}

        {activeSection === "billing" ? (
          <SettingsPanel title="Billing" description="Review your account plan and billing information.">
            <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"><CreditCard className="size-5" /></span>
                <div><p className="text-sm font-semibold">Current demo plan</p><p className="mt-1 text-xs text-muted-foreground">Billing data is not connected to a payment provider yet.</p></div>
              </div>
              <Badge variant="outline">Demo</Badge>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Plan changes, invoices and payment methods will appear here after billing persistence is connected.</p>
          </SettingsPanel>
        ) : null}
      </main>
    </section>
  );
}

function AppearancePanel() {
  const { values, resolvedThemeMode, setPreference, resetPreferences } = usePreferencesStore(
    useShallow((state) => ({
      values: state.values,
      resolvedThemeMode: state.resolvedThemeMode,
      setPreference: state.setPreference,
      resetPreferences: state.resetPreferences,
    })),
  );

  const {
    theme_mode: themeMode,
    theme_preset: themePreset,
    content_layout: contentLayout,
    navbar_style: navbarStyle,
    sidebar_variant: variant,
    sidebar_collapsible: collapsible,
    font,
  } = values;

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-6">
      <div>
        <h1 className="text-base font-semibold tracking-tight">Appearance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize the theme, typography and layout of your workspace.</p>
      </div>

      <div className="mt-5 divide-y">
        <div className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Theme mode</Label><p className="mt-1 text-xs text-muted-foreground">Choose light, dark or follow your device.</p></div>
          <ToggleGroup size="sm" spacing={0} variant="outline" className="w-full" value={[themeMode]} onValueChange={([mode]) => { if (mode) setPreference("theme_mode", mode as ThemeMode); }}>
            <ToggleGroupItem value="light" className="flex-1" aria-label="Light theme"><Sun className="mr-1.5 size-3.5" />Light</ToggleGroupItem>
            <ToggleGroupItem value="dark" className="flex-1" aria-label="Dark theme"><Moon className="mr-1.5 size-3.5" />Dark</ToggleGroupItem>
            <ToggleGroupItem value="system" className="flex-1" aria-label="System theme"><Laptop className="mr-1.5 size-3.5" />System</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Theme preset</Label><p className="mt-1 text-xs text-muted-foreground">Set the accent colors used across the dashboard.</p></div>
          <Select value={themePreset} onValueChange={(value) => { if (value) setPreference("theme_preset", value as ThemePreset); }}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select a theme" /></SelectTrigger>
            <SelectContent><SelectGroup>{THEME_PRESET_OPTIONS.map((preset) => <SelectItem key={preset.value} value={preset.value}><span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: resolvedThemeMode === "dark" ? preset.primary.dark : preset.primary.light }} />{preset.label}</span></SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Font family</Label><p className="mt-1 text-xs text-muted-foreground">Choose a typeface for your workspace.</p></div>
          <Select value={font} onValueChange={(value) => { if (value) setPreference("font", value as FontKey); }}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select font" /></SelectTrigger>
            <SelectContent><SelectGroup>{fontOptions.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Page layout</Label><p className="mt-1 text-xs text-muted-foreground">Control the width of your page content.</p></div>
          <ToggleGroup size="sm" spacing={0} variant="outline" className="w-full" value={[contentLayout]} onValueChange={([layout]) => { if (layout) setPreference("content_layout", layout as ContentLayout); }}>
            <ToggleGroupItem value="centered" className="flex-1">Centered</ToggleGroupItem>
            <ToggleGroupItem value="full-width" className="flex-1">Full Width</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Navbar behavior</Label><p className="mt-1 text-xs text-muted-foreground">Choose whether the top bar stays visible while scrolling.</p></div>
          <ToggleGroup size="sm" spacing={0} variant="outline" className="w-full" value={[navbarStyle]} onValueChange={([style]) => { if (style) setPreference("navbar_style", style as NavbarStyle); }}>
            <ToggleGroupItem value="sticky" className="flex-1">Sticky</ToggleGroupItem>
            <ToggleGroupItem value="scroll" className="flex-1">Scroll</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Sidebar style</Label><p className="mt-1 text-xs text-muted-foreground">Set the visual treatment of the main navigation.</p></div>
          <ToggleGroup size="sm" spacing={0} variant="outline" className="w-full" value={[variant]} onValueChange={([next]) => { if (next) setPreference("sidebar_variant", next as SidebarVariant); }}>
            <ToggleGroupItem value="sidebar" className="flex-1">Sidebar</ToggleGroupItem>
            <ToggleGroupItem value="inset" className="flex-1">Inset</ToggleGroupItem>
            <ToggleGroupItem value="floating" className="flex-1">Floating</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] sm:items-center">
          <div><Label className="text-sm">Sidebar collapse mode</Label><p className="mt-1 text-xs text-muted-foreground">Choose how the navigation collapses on smaller screens.</p></div>
          <ToggleGroup size="sm" spacing={0} variant="outline" className="w-full" value={[collapsible]} onValueChange={([next]) => { if (next) setPreference("sidebar_collapsible", next as SidebarCollapsible); }}>
            <ToggleGroupItem value="icon" className="flex-1">Icon</ToggleGroupItem>
            <ToggleGroupItem value="offcanvas" className="flex-1">Off-canvas</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">Changes apply immediately to this browser.</p>
        <Button type="button" variant="outline" onClick={resetPreferences}>Restore Defaults</Button>
      </div>
    </section>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-6">
      <div><h1 className="text-base font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
      <div className="mt-5 divide-y">{children}</div>
    </section>
  );
}

function SettingRow({ icon: Icon, title, description, defaultChecked = false }: { icon: LucideIcon; title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
      <Switch defaultChecked={defaultChecked} aria-label={title} />
    </div>
  );
}

function getInitials(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
}

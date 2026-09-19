import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/languages")({ component: Page });

const languages = [
  { name: "English", code: "en", users: 28, status: "Default" },
  { name: "French", code: "fr", users: 9, status: "Enabled" },
  { name: "Arabic", code: "ar", users: 7, status: "Enabled" },
];

function Page() {
  return <SettingsShell active="languages" title="Languages" description="Manage supported dashboard languages and the default locale.">
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <SettingCard title="Supported languages">
        <div className="divide-y">{languages.map((language) =>
          <div key={language.code} className="flex items-center justify-between gap-4 py-3">
            <div><p className="text-sm font-medium">{language.name}</p><p className="text-xs text-muted-foreground">{language.code.toUpperCase()} · {language.users} users</p></div>
            <span className={"rounded-full px-2 py-1 text-[10px] font-medium " + (language.status === "Default" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{language.status}</span>
          </div>)}</div>
        <Button className="mt-4" size="sm">Add language</Button>
      </SettingCard>
      <SettingCard title="Locale preferences">
        <div className="grid gap-4 text-sm">
          <div className="flex items-center justify-between gap-4"><span>Default language</span><span className="font-medium">English (en)</span></div>
          <div className="flex items-center justify-between gap-4"><span>Number format</span><span className="font-medium">1,234.56</span></div>
          <div className="flex items-center justify-between gap-4"><span>First day of week</span><span className="font-medium">Monday</span></div>
          <div className="flex items-center justify-between gap-4"><span>Timezone</span><span className="font-medium">UTC+01:00</span></div>
        </div>
      </SettingCard>
    </div>
  </SettingsShell>;
}

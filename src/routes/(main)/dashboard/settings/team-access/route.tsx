import { createFileRoute } from "@tanstack/react-router";
import { Check, MoreHorizontal, Plus, ShieldCheck, UsersRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingCard, SettingsShell } from "../-components/settings-shell";

export const Route = createFileRoute("/(main)/dashboard/settings/team-access")({ component: Page });

const teamRows = [
  { name: "Aiy", email: "aiy@paymine.example", role: "Owner", access: "Full access", lastActive: "Now" },
  { name: "Maya Chen", email: "maya@paymine.example", role: "Finance Admin", access: "Finance + Treasury", lastActive: "8 min ago" },
  { name: "Omar Ben Ali", email: "omar@paymine.example", role: "Operations", access: "Players + Distributors", lastActive: "22 min ago" },
  { name: "Lina Haddad", email: "lina@paymine.example", role: "Support", access: "Players only", lastActive: "1h ago" },
];

function Page() {
  return (
    <SettingsShell active="team-access" title="Team & access" description="Manage workspace members, roles and which areas each team member can access.">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <SettingCard title="Team members" description="Default mock team for the PayMine workspace.">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Input className="max-w-sm" placeholder="Search team members..." /><Button size="sm"><Plus /> Invite member</Button></div>
          <div className="space-y-2">
            {teamRows.map((member) => (
              <div key={member.email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm"><AvatarFallback>{member.name.split(" ").map((part) => part[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></div>
                </div>
                <div className="flex items-center gap-2"><Badge variant="outline">{member.role}</Badge><span className="hidden text-xs text-muted-foreground lg:inline">{member.access}</span><Button size="icon-sm" variant="ghost"><MoreHorizontal /></Button></div>
              </div>
            ))}
          </div>
        </SettingCard>

        <SettingCard title="Access policy" description="Workspace-level defaults for new members.">
          <div className="space-y-3">
            {["Require MFA for staff", "Allow billing access", "Allow finance actions", "Allow user invitations"].map((label, index) =>
              <div key={label} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{label}</span><Badge variant={index === 2 ? "outline" : "secondary"}>{index === 2 ? "Restricted" : "Allowed"}<Check className="size-3.5" /></Badge></div>
            )}
          </div>
          <Button className="mt-4" size="sm" variant="outline"><ShieldCheck /> Review roles</Button>
        </SettingCard>
      </div>

      <Card className="border-dashed"><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><UsersRound className="size-4 shrink-0" />Role changes and invitations are frontend-only in this template.</CardContent></Card>
    </SettingsShell>
  );
}

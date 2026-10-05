import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const rows = [
  ["Omar Ben Salah", "Brand Admin", "Atlas Payments", "omar@atlas.demo", "Active", "2 days ago"],
  ["Nadia Trabelsi", "Supervisor", "ipaycash", "nadia@ipaycash.demo", "Active", "12 min ago"],
  ["Yassine Kallel", "Agent", "Atlas Payments", "yassine@atlas.demo", "Active", "Now"],
  ["Meriem Jaziri", "Assistant", "Northline Network", "meriem@northline.demo", "Invited", "—"],
  ["Sami Ben Amor", "Agent", "Delta Commerce", "sami@delta.demo", "Suspended", "4 days ago"],
] as const;

export const Route = createFileRoute("/(main)/dashboard/users" as any)({
  component: Page,
});

function Page() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage platform users, roles, access state, and brand assignment.</p>
        </div>
        <Button><UserPlus /> Invite user</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total users" value="11,640" icon={Users} />
        <MiniStat label="Active" value="9,420" icon={UserCheck} />
        <MiniStat label="Admins & supervisors" value="186" icon={ShieldCheck} />
        <MiniStat label="Pending invites" value="74" icon={UserPlus} />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div>
            <h2 className="text-sm font-semibold">Platform users</h2>
            <p className="mt-1 text-xs text-muted-foreground">The highest-impact users across your managed brands.</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  {["User", "Role", "Brand", "Email", "Status", "Last active", ""].map((label) => <th key={label} className="px-5 py-3 text-left font-medium">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(([name, role, brand, email, status, lastActive]) => (
                  <tr key={email} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium">{name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{role}</td>
                    <td className="px-5 py-3">{brand}</td>
                    <td className="px-5 py-3 text-muted-foreground">{email}</td>
                    <td className="px-5 py-3"><Badge variant={status === "Active" ? "secondary" : "outline"}>{status}</Badge></td>
                    <td className="px-5 py-3 text-muted-foreground">{lastActive}</td>
                    <td className="px-5 py-3 text-right"><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="size-4 text-muted-foreground" /></div><p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p></CardContent></Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, UserCheck, UserPlus, Users, Wallet } from "lucide-react";
import type { ComponentType } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const rows = [
  {
    id: "USR-10428",
    name: "Omar Ben Salah",
    email: "omar@atlas.demo",
    image: "https://i.pravatar.cc/96?img=12",
    joined: "Sep 24, 2026",
    package: "Scale",
    balance: "$18,420.50",
    status: "Active",
  },
  {
    id: "USR-10391",
    name: "Nadia Trabelsi",
    email: "nadia@ipaycash.demo",
    image: "https://i.pravatar.cc/96?img=47",
    joined: "Sep 18, 2026",
    package: "Growth",
    balance: "$7,845.20",
    status: "Active",
  },
  {
    id: "USR-10357",
    name: "Yassine Kallel",
    email: "yassine@atlas.demo",
    image: "https://i.pravatar.cc/96?img=68",
    joined: "Sep 11, 2026",
    package: "Growth",
    balance: "$4,230.00",
    status: "Active",
  },
  {
    id: "USR-10286",
    name: "Meriem Jaziri",
    email: "meriem@northline.demo",
    image: "https://i.pravatar.cc/96?img=32",
    joined: "Aug 29, 2026",
    package: "Starter",
    balance: "$1,285.75",
    status: "Pending",
  },
  {
    id: "USR-10194",
    name: "Sami Ben Amor",
    email: "sami@delta.demo",
    image: "https://i.pravatar.cc/96?img=15",
    joined: "Aug 14, 2026",
    package: "Growth",
    balance: "$0.00",
    status: "Disabled",
  },
] as const;

type UserStatus = (typeof rows)[number]["status"];

export const Route = createFileRoute("/(main)/dashboard/users")({
  component: Page,
});

function Page() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SaaS Owner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user plans, wallet balances, and account status.
          </p>
        </div>
        <Button>
          <UserPlus />
          Add user
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total users" value="11,640" icon={Users} />
        <MiniStat label="Active users" value="9,420" icon={UserCheck} />
        <MiniStat label="Wallet balance" value="$2.84M" icon={Wallet} />
        <MiniStat label="Pending users" value="74" icon={UserPlus} />
      </div>

      <Card className="overflow-hidden shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-y bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  {["User", "Joined", "Package", "Wallet Balance", "Status", "Action"].map((label) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-left font-medium ${label === "Action" ? "text-right" : ""}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex min-w-[250px] items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.id} · {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{user.joined}</td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="font-medium">{user.package}</Badge>
                    </td>
                    <td className="px-5 py-4 font-medium tabular-nums">{user.balance}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          Change Plan
                        </Button>
                        <Button size="sm" className="h-8">
                          <Wallet className="size-3.5" />
                          Fund wallet
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Fund wallet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {user.status === "Disabled" ? "Enable" : "Disable"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
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

function StatusBadge({ status }: { status: UserStatus }) {
  const variant = status === "Active" ? "secondary" : status === "Pending" ? "outline" : "destructive";

  return <Badge variant={variant}>{status}</Badge>;
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

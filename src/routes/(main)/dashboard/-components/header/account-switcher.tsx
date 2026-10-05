import { useNavigate } from "@tanstack/react-router";

import { cn } from "cn";
import { BadgeCheck, Bell, Check, CreditCard, LogOut, UserRoundCog } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { DEMO_USERS, USER_ROLES, useAuth, type UserRole } from "@/stores/auth/auth-provider";

export function AccountSwitcher() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  if (!user) {
    return null;
  }

  const switchRole = (role: UserRole) => {
    login(role);
    navigate({ to: "/dashboard/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton={false} render={<Avatar className="size-9 rounded-lg" />}>
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-72 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <div className="px-2 py-2">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-2">
            <span className="inline-flex rounded-md border px-2 py-1 text-[11px] font-medium">{user.role}</span>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <UserRoundCog />
            Switch demo role
          </DropdownMenuItem>
          {USER_ROLES.map((role) => (
            <DropdownMenuItem
              key={role}
              className={cn("pl-8", role === user.role && "bg-accent/50")}
              onClick={() => switchRole(role)}
            >
              <span className="truncate">{role}</span>
              <span
                className={cn(
                  "ml-auto flex size-5 items-center justify-center text-primary",
                  role !== user.role && "opacity-0",
                )}
              >
                <Check aria-hidden="true" />
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            navigate({ to: "/auth/v2/login", replace: true });
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Bell, CheckCircle2, Info, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  {
    title: "Withdrawal approved",
    description: "WDL-02026001 is ready for payout.",
    time: "2 min ago",
    icon: CheckCircle2,
  },
  {
    title: "Wallet balance is low",
    description: "Your available credit has dropped below the threshold.",
    time: "18 min ago",
    icon: WalletCards,
  },
  {
    title: "System update",
    description: "A new payment-processing update is available.",
    time: "1 hr ago",
    icon: Info,
  },
] as const;

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Open notifications"
          />
        }
      >
        <Bell />
        <Badge className="absolute -right-0.5 -top-0.5 size-4 rounded-full p-0 text-[9px] leading-4">
          3
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notifications</span>
          <span className="text-xs font-normal text-muted-foreground">3 new</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.map((notification) => {
          const Icon = notification.icon;

          return (
            <DropdownMenuItem
              key={notification.title}
              className="items-start gap-3 py-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {notification.title}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                  {notification.description}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {notification.time}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

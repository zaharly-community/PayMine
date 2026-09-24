import { ArrowDownToLine, ArrowUpFromLine, History, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletMenu() {
  const walletBalance = -2450.75;
  const packageLimit = 5000;
  const usedAmount = Math.abs(walletBalance);
  const usage = Math.min((usedAmount / packageLimit) * 100, 100);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-2 rounded-lg px-2.5"
            aria-label="Open wallet"
          />
        }
      >
        <WalletCards className="size-4" />
        <span className="hidden tabular-nums sm:inline">-$2,450.75</span>
        <Progress
          value={usage}
          className="hidden h-1.5 w-12 sm:flex"
          aria-label={`Package usage ${Math.round(usage)}%`}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="space-y-1">
              <div className="text-xs font-normal text-muted-foreground">Wallet</div>
              <div className="text-2xl font-semibold tabular-nums">-$2,450.75</div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <div className="px-2 pb-2">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Package consumption</span>
            <span className="font-medium tabular-nums">{Math.round(usage)}%</span>
          </div>
          <Progress value={usage} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Used $2,450.75</span>
            <span>Limit $5,000.00</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="grid grid-cols-3 gap-2 p-2">
          <Button type="button" size="sm" variant="outline">
            <ArrowDownToLine />
            Deposit
          </Button>
          <Button type="button" size="sm">
            <ArrowUpFromLine />
            Withdrawl
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            render={<Link to="/dashboard/finance/transactions" />}
          >
            <History />
            Activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

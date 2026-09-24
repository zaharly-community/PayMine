import { WalletMinimal } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

export function PrimaryAccount() {
  return (
    <div className="group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]">
      <div className="grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing)">
        <div className="font-heading text-base leading-snug font-medium">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <WalletMinimal className="size-5" />
            </span>
            Distributor Treasury
          </div>
        </div>
      </div>

      <div className="px-(--card-spacing)">
        <div className="space-y-0.5">
          <p className="font-medium text-xl tabular-nums">
            {formatCurrency(42680, { noDecimals: true })}
          </p>
          <p className="text-muted-foreground text-xs">
            Available for distributor operations
          </p>
        </div>
      </div>
    </div>
  );
}

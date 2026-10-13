import type { ReactNode } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function TreasuryPageHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Treasury control · Mock data</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function TreasuryMetric({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <Card className="shadow-none">
      <CardContent className="flex min-h-[100px] items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs leading-4 text-muted-foreground">{hint}</p>
        </div>
        <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + tones[tone]}>{icon}</span>
      </CardContent>
    </Card>
  );
}

export function TreasuryStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let classes = "border-border bg-muted/50 text-muted-foreground";
  if (normalized.includes("matched") || normalized === "accepted" || normalized === "approved" || normalized.includes("resolved") || normalized === "posted") {
    classes = "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  } else if (normalized.includes("variance") || normalized.includes("disput") || normalized.includes("critical") || normalized.includes("high") || normalized === "rejected") {
    classes = "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  } else if (normalized.includes("pending") || normalized.includes("evidence") || normalized.includes("open") || normalized.includes("review")) {
    classes = "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  } else if (normalized.includes("investigat") || normalized.includes("escalat")) {
    classes = "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}

export function MockDataNotice({ children = "Demonstration data only. State changes are local to this page and are not persisted or enforced by a server." }: { children?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <span>{children}</span>
    </div>
  );
}

export function ControlRule({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><ShieldCheck className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

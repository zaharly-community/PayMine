import { type DragEvent, useState } from "react";

import { GripVertical, ListFilter, RotateCcw, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingCard, SettingsShell } from "../-components/settings-shell";
import { Switch } from "@/components/ui/switch";

type PriorityRule = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const defaultDistributorRules: PriorityRule[] = [
  {
    id: "response-speed",
    label: "Fastest response",
    description: "Prioritize agents and supervisors with the shortest recent response time.",
    enabled: true,
  },
  {
    id: "rating",
    label: "Highest rating",
    description: "Prefer distributors with the strongest customer rating history.",
    enabled: true,
  },
  {
    id: "newest",
    label: "Newest distributors",
    description: "Give recently onboarded agents and supervisors higher placement.",
    enabled: false,
  },
  {
    id: "oldest",
    label: "Oldest distributors",
    description: "Prefer the longest-tenured agents and supervisors.",
    enabled: false,
  },
];

const defaultWalletRules: PriorityRule[] = [
  {
    id: "response-speed",
    label: "Fastest response",
    description: "Prefer wallets/providers with the fastest recent response time.",
    enabled: true,
  },
  {
    id: "rating",
    label: "Highest rating",
    description: "Prefer wallets/providers with the strongest customer rating history.",
    enabled: true,
  },
  {
    id: "newest",
    label: "Newest wallets",
    description: "Give recently added wallets higher placement.",
    enabled: false,
  },
  {
    id: "oldest",
    label: "Oldest wallets",
    description: "Prefer the longest-running wallets.",
    enabled: false,
  },
];

function cloneRules(rules: PriorityRule[]) {
  return rules.map((rule) => ({ ...rule }));
}

export const PortalRoutingSettings = () => {
  const [distributorRules, setDistributorRules] = useState(() => cloneRules(defaultDistributorRules));
  const [walletRules, setWalletRules] = useState(() => cloneRules(defaultWalletRules));
  const [saved, setSaved] = useState(true);

  const updateDistributors = (rules: PriorityRule[]) => {
    setDistributorRules(rules);
    setSaved(false);
  };

  const updateWallets = (rules: PriorityRule[]) => {
    setWalletRules(rules);
    setSaved(false);
  };

  const resetAll = () => {
    setDistributorRules(cloneRules(defaultDistributorRules));
    setWalletRules(cloneRules(defaultWalletRules));
    setSaved(true);
  };

  return (
    <SettingsShell
      active="portal-routing"
      title="Portal routing"
      description="Choose how eligible agents, supervisors and wallets are ordered when they are presented in the player portal."
    >
      <div className="space-y-4">
        <SettingCard
          title="Priority engine"
          description="The portal evaluates enabled rules from top to bottom. Rules set to Off are ignored completely."
        >
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <ListFilter className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Drag to reorder</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Position 01 is the strongest sorting criterion. Use the switch to exclude a criterion without deleting it.
                </p>
              </div>
            </div>
            <Badge variant={saved ? "secondary" : "outline"}>
              {saved ? "Saved" : "Unsaved changes"}
            </Badge>
          </div>
        </SettingCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <PriorityRuleList
            title="Agents & Supervisors"
            description="Sort distributor options shown in the portal."
            rules={distributorRules}
            onChange={updateDistributors}
          />
          <PriorityRuleList
            title="Wallets"
            description="Sort wallet/provider options available to the player."
            rules={walletRules}
            onChange={updateWallets}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            The UI template keeps these settings locally; backend persistence is not connected yet.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={resetAll}>
              <RotateCcw />
              Reset
            </Button>
            <Button type="button" size="sm" onClick={() => setSaved(true)}>
              <Save />
              Save routing
            </Button>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
};

function PriorityRuleList({
  title,
  description,
  rules,
  onChange,
}: {
  title: string;
  description: string;
  rules: PriorityRule[];
  onChange: (rules: PriorityRule[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveRule = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const sourceIndex = rules.findIndex((rule) => rule.id === sourceId);
    const targetIndex = rules.findIndex((rule) => rule.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const next = [...rules];
    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) return;
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggedId(id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (sourceId) moveRule(sourceId, targetId);
    setDraggedId(null);
  };

  return (
    <SettingCard title={title} description={description}>
      <div className="space-y-2" role="list" aria-label={title + " priority rules"}>
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            role="listitem"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, rule.id)}
            className={[
              "flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors",
              rule.enabled ? "bg-background" : "bg-muted/30 opacity-60",
              draggedId === rule.id ? "border-primary/50 shadow-sm" : "hover:border-primary/30",
            ].join(" ")}
          >
            <button
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, rule.id)}
              onDragEnd={() => setDraggedId(null)}
              className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-label={"Drag " + rule.label}
              title="Drag to reorder"
            >
              <GripVertical className="size-4" />
            </button>

            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{rule.label}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{rule.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground">{rule.enabled ? "On" : "Off"}</span>
              <Switch
                checked={rule.enabled}
                onCheckedChange={(enabled) => onChange(rules.map((item) => item.id === rule.id ? { ...item, enabled } : item))}
                aria-label={rule.label + (rule.enabled ? " On" : " Off")}
              />
            </div>
          </div>
        ))}
      </div>
    </SettingCard>
  );
}

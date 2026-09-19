import { useMemo, useState } from "react";
import { Check, Copy, Eye, Plus, Save, Smartphone, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const methodOptions = ["Visa", "Mastercard", "D17", "Flouci", "Kashy", "e-Dinar"];

type FormRow = {
  id: string;
  name: string;
  slug: string;
  environment: "Production" | "Sandbox";
  methods: string[];
  status: "Published" | "Draft";
  sessions: number;
  conversion: string;
  updated: string;
};

export function PaymentFormBuilder({ initialForms }: { initialForms: readonly FormRow[] }) {
  const [forms, setForms] = useState<FormRow[]>(initialForms.map((item) => ({ ...item, methods: [...item.methods] })));
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(forms[0]?.id ?? "");
  const [form, setForm] = useState({
    name: "New Deposit Form",
    slug: "new-deposit",
    environment: "Sandbox" as "Production" | "Sandbox",
    methods: ["Visa", "Mastercard"],
    mobile: true,
    showLogo: true,
  });

  const selected = forms.find((item) => item.id === selectedId) ?? forms[0];
  const embedCode = useMemo(() => '<form data-paymine-form="' + (selected?.slug ?? "main-deposit") + '"></form>', [selected]);

  const toggleMethod = (method: string) =>
    setForm((current) => ({
      ...current,
      methods: current.methods.includes(method) ? current.methods.filter((item) => item !== method) : [...current.methods, method],
    }));

  const createForm = () => {
    const next: FormRow = {
      id: "FORM-DEP-" + String(forms.length + 4).padStart(3, "0"),
      name: form.name || "Untitled payment form",
      slug: form.slug || "new-payment-form",
      environment: form.environment,
      methods: form.methods.length ? form.methods : ["Visa"],
      status: "Draft",
      sessions: 0,
      conversion: "—",
      updated: "Just now",
    };
    setForms((current) => [next, ...current]);
    setSelectedId(next.id);
    setOpen(false);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold">Payment forms</h2><p className="text-xs text-muted-foreground">Create hosted checkout forms and control the methods shown to players.</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Create payment form</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create payment form</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2"><Label>Form name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Form slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} /></div>
                <div className="grid gap-2"><Label>Environment</Label><Select value={form.environment} onValueChange={(value) => setForm({ ...form, environment: value as "Sandbox" | "Production" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sandbox">Sandbox</SelectItem><SelectItem value="Production">Production</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Payment methods</Label><div className="grid grid-cols-2 gap-2">{methodOptions.map((method) => <button type="button" key={method} onClick={() => toggleMethod(method)} className={"flex items-center justify-between rounded-md border px-3 py-2 text-sm " + (form.methods.includes(method) ? "border-primary bg-primary/5" : "hover:bg-muted/40")}><span>{method}</span>{form.methods.includes(method) ? <Check className="size-4 text-primary" /> : null}</button>)}</div></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Mobile optimized</p><p className="text-xs text-muted-foreground">Use compact fields on mobile devices.</p></div><Switch checked={form.mobile} onCheckedChange={(checked) => setForm({ ...form, mobile: checked })} /></div>
                <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Show PayMine branding</p><p className="text-xs text-muted-foreground">Display the default checkout mark.</p></div><Switch checked={form.showLogo} onCheckedChange={(checked) => setForm({ ...form, showLogo: checked })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={createForm}><Save /> Create draft</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/40"><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-2">Form</th><th className="px-3 py-2">Environment</th><th className="px-3 py-2">Methods</th><th className="px-3 py-2">Sessions</th><th className="px-3 py-2">Conversion</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead><tbody>{forms.map((item) => <tr key={item.id} className={"cursor-pointer border-b last:border-0 " + (selected?.id === item.id ? "bg-muted/30" : "")} onClick={() => setSelectedId(item.id)}><td className="px-3 py-3"><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.slug}</p></td><td className="px-3 py-3 text-xs">{item.environment}</td><td className="px-3 py-3"><div className="flex max-w-[260px] flex-wrap gap-1">{item.methods.map((method) => <Badge key={method} variant="outline">{method}</Badge>)}</div></td><td className="px-3 py-3 tabular-nums">{item.sessions.toLocaleString()}</td><td className="px-3 py-3">{item.conversion}</td><td className="px-3 py-3"><Badge variant={item.status === "Published" ? "secondary" : "outline"}>{item.status}</Badge></td><td className="px-3 py-3 text-right"><Button size="icon" variant="ghost"><Eye className="size-4" /></Button></td></tr>)}</tbody></table></div>
        </div>
      </div>
      <CardPreview form={selected} embedCode={embedCode} />
    </div>
  );
}

function CardPreview({ form, embedCode }: { form?: FormRow; embedCode: string }) {
  const [copied, setCopied] = useState(false);
  if (!form) return null;
  const copy = async () => { try { await navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Checkout preview</p><p className="text-xs text-muted-foreground">{form.name}</p></div><Badge variant="outline">{form.environment}</Badge></div>
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><WalletCards className="size-4" /></div><div><p className="text-sm font-semibold">Secure payment</p><p className="text-[11px] text-muted-foreground">Complete your deposit</p></div></div>
          <div className="mt-4 grid gap-3"><div><Label className="text-xs">Amount</Label><Input className="mt-1" defaultValue="250.00" /></div><div><Label className="text-xs">Payment method</Label><div className="mt-1 grid grid-cols-2 gap-2">{form.methods.slice(0, 4).map((method) => <div key={method} className="rounded-lg border px-3 py-2 text-xs">{method}</div>)}</div></div><div><Label className="text-xs">Card / wallet details</Label><Input className="mt-1" placeholder="•••• •••• •••• ••••" /></div><Button className="w-full"><Smartphone /> Continue payment</Button></div>
        </div>
      </div>
      <div className="rounded-xl border bg-muted/10 p-4"><p className="text-xs font-medium">Embed snippet</p><code className="mt-2 block rounded-lg border bg-background p-3 text-[11px] text-muted-foreground">{embedCode}</code><Button className="mt-3 w-full" variant="outline" size="sm" onClick={copy}>{copied ? <><Check /> Copied</> : <><Copy /> Copy embed code</>}</Button></div>
    </div>
  );
}

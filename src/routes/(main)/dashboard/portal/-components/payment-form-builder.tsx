import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, Eye, Globe2, MoreHorizontal, Plus, Save, ShieldCheck, Smartphone, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

function methodClass(method: string) {
  if (method === "Visa") return "border-blue-500/20 bg-blue-500/5 text-blue-600";
  if (method === "Mastercard") return "border-orange-500/20 bg-orange-500/5 text-orange-600";
  if (method === "D17") return "border-violet-500/20 bg-violet-500/5 text-violet-600";
  if (method === "Flouci") return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600";
  if (method === "Kashy") return "border-cyan-500/20 bg-cyan-500/5 text-cyan-600";
  return "border-slate-500/20 bg-slate-500/5 text-slate-600";
}

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold">Payment forms</h2><p className="text-xs text-muted-foreground">Card-based form library with a live player checkout preview.</p></div>
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
                <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Show PayMine branding</p><p className="text-xs text-muted-foreground">Display the checkout brand mark.</p></div><Switch checked={form.showLogo} onCheckedChange={(checked) => setForm({ ...form, showLogo: checked })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={createForm}><Save /> Create draft</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((item) => (
            <Card key={item.id} className={"cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-sm " + (selected?.id === item.id ? "border-primary/50 ring-1 ring-primary/10" : "")} onClick={() => setSelectedId(item.id)}>
              <div className="h-1 bg-primary/70" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/30 text-primary"><WalletCards className="size-4" /></div>
                  <Badge variant={item.status === "Published" ? "secondary" : "outline"}>{item.status}</Badge>
                </div>
                <CardTitle className="pt-2 text-sm">{item.name}</CardTitle>
                <p className="text-xs text-muted-foreground">/{item.slug}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1.5">{item.methods.map((method) => <span key={method} className={"rounded-md border px-2 py-1 text-[10px] font-medium " + methodClass(method)}>{method}</span>)}</div>
                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3">
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sessions</p><p className="mt-1 text-sm font-semibold">{item.sessions.toLocaleString()}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Conversion</p><p className="mt-1 text-sm font-semibold">{item.conversion}</p></div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground"><span>Updated {item.updated}</span><Button size="sm" variant="ghost"><MoreHorizontal /></Button></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CheckoutPreview form={selected} embedCode={embedCode} />
    </div>
  );
}

function CheckoutPreview({ form, embedCode }: { form?: FormRow; embedCode: string }) {
  const [copied, setCopied] = useState(false);
  if (!form) return null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };

  return (
    <div className="xl:sticky xl:top-4 xl:self-start">
      <div className="mb-3 flex items-center justify-between">
        <div><h2 className="text-sm font-semibold">Checkout preview</h2><p className="text-xs text-muted-foreground">Player-facing rendering · {form.environment}</p></div>
        <Button size="icon" variant="outline" aria-label="Preview"><Eye /></Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-muted/20 shadow-sm">
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">PM</div><div><p className="text-sm font-semibold">PayMine</p><p className="text-[10px] text-muted-foreground">Secure checkout</p></div></div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><ShieldCheck className="size-3.5" /> SSL secured</div>
        </div>

        <div className="bg-gradient-to-b from-background to-muted/30 p-4 sm:p-6">
          <div className="mx-auto max-w-sm">
            <div className="mb-4 flex items-center justify-between text-[10px] text-muted-foreground"><span>Deposit</span><span>1 of 2</span></div>
            <div className="mb-4 h-1 rounded-full bg-muted"><div className="h-1 w-2/3 rounded-full bg-primary" /></div>

            <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-base font-semibold">Add funds</p><p className="mt-1 text-xs text-muted-foreground">Choose a payment method to continue.</p></div>
                <Globe2 className="size-4 text-muted-foreground" />
              </div>

              <div className="mt-5 grid gap-3">
                <div><Label className="text-xs">Amount</Label><div className="mt-1 flex items-center rounded-lg border bg-muted/20 px-3"><span className="text-xs text-muted-foreground">$</span><Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" defaultValue="250.00" /></div></div>

                <div><Label className="text-xs">Payment method</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {form.methods.slice(0, 4).map((method) => <div key={method} className={"flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium " + methodClass(method)}><div className="flex size-6 items-center justify-center rounded-md bg-background text-[9px] font-bold">{method.slice(0, 2).toUpperCase()}</div>{method}</div>)}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label className="text-xs">First name</Label><Input className="mt-1" placeholder="John" /></div>
                  <div><Label className="text-xs">Last name</Label><Input className="mt-1" placeholder="Doe" /></div>
                  <div className="sm:col-span-2"><Label className="text-xs">Email</Label><Input className="mt-1" placeholder="john@example.com" /></div>
                  <div className="sm:col-span-2"><Label className="text-xs">Card or wallet details</Label><div className="mt-1 flex items-center gap-2 rounded-lg border px-3"><CreditCard className="size-4 text-muted-foreground" /><Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder="•••• •••• •••• 4242" /></div></div>
                </div>

                <Button className="w-full"><Smartphone /> Continue securely</Button>
                <p className="text-center text-[10px] text-muted-foreground">By continuing, you agree to the payment terms and privacy policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/10 p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium">Embed snippet</p><Badge variant="outline">HTML</Badge></div><code className="mt-2 block overflow-x-auto rounded-lg border bg-background p-3 text-[11px] text-muted-foreground">{embedCode}</code><Button className="mt-3 w-full" variant="outline" size="sm" onClick={copy}>{copied ? <><Check /> Copied</> : <><Copy /> Copy embed code</>}</Button></div>
    </div>
  );
}

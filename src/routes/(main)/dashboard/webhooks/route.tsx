import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock3, RotateCcw, Search, Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(main)/dashboard/webhooks")({ component: WebhooksPage });

type EventStatus = "Processed (demo)" | "Retry needed (demo)" | "Signature rejected (demo)";
type WebhookEvent = { id: string; provider: string; eventType: string; reference: string; receivedAt: string; status: EventStatus; attempts: number; signature: string; message: string };
const initialEvents: WebhookEvent[] = [
  { id: "EVT-90214", provider: "Flouci", eventType: "payment.succeeded", reference: "DEP-26010142", receivedAt: "14 Oct 2026, 10:42:18", status: "Processed (demo)", attempts: 1, signature: "Demo valid", message: "Event accepted and linked to a sample deposit." },
  { id: "EVT-90213", provider: "D17", eventType: "payment.updated", reference: "DEP-26010138", receivedAt: "14 Oct 2026, 10:39:04", status: "Retry needed (demo)", attempts: 4, signature: "Not checked", message: "Illustrative timeout while verifying the provider status." },
  { id: "EVT-90212", provider: "Kashy", eventType: "payment.confirmed", reference: "DEP-26010134", receivedAt: "14 Oct 2026, 10:33:41", status: "Processed (demo)", attempts: 1, signature: "Demo valid", message: "Event handled in the interface sample." },
  { id: "EVT-90211", provider: "Flouci", eventType: "payment.succeeded", reference: "DEP-26010131", receivedAt: "14 Oct 2026, 10:28:10", status: "Signature rejected (demo)", attempts: 1, signature: "Demo invalid", message: "Sample rejection. No transaction state was changed." },
  { id: "EVT-90210", provider: "e-Dinar", eventType: "settlement.updated", reference: "SET-26010081", receivedAt: "14 Oct 2026, 10:21:57", status: "Retry needed (demo)", attempts: 3, signature: "Not checked", message: "Sample event waiting for a verification retry." },
];

function eventTone(status: EventStatus) {
  if (status.startsWith("Processed")) return "text-emerald-700";
  if (status.startsWith("Signature")) return "text-destructive";
  return "text-amber-700";
}

function WebhooksPage() {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState("EVT-90214");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => events.filter((event) => [event.id, event.provider, event.eventType, event.reference].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "All" || event.status === status)), [events, query, status]);
  const selected = filtered.find((event) => event.id === selectedId) ?? filtered[0];
  const replayPreview = (event: WebhookEvent) => {
    setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: "Retry needed (demo)", attempts: item.attempts + 1, message: "A replay preview was requested. No worker or provider was called." } : item));
    setNotice("Demo only: replay preview recorded in local page state. No provider request or financial change was executed.");
  };

  return <section className="flex min-h-full flex-col gap-5 bg-background">
    <header><div className="flex items-center gap-2 text-sm text-muted-foreground"><Webhook className="size-4" /> Integrations / Webhooks</div><h1 className="mt-1 text-2xl font-semibold tracking-tight">Webhook event inbox</h1><p className="mt-1 text-sm text-muted-foreground">Inspect provider event delivery, signature checks, processing attempts and retry needs.</p></header>
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"><strong>Demo event stream.</strong> Events are illustrative. Production handling must verify signatures against the raw request, persist events idempotently and process them in a worker.</div>
    {notice && <div role="status" className="rounded-lg border px-4 py-3 text-sm">{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-3"><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Events shown</p><p className="mt-2 text-2xl font-semibold">{events.length}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Retry candidates</p><p className="mt-2 text-2xl font-semibold">{events.filter((event) => event.status.startsWith("Retry")).length}</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Signature rejections</p><p className="mt-2 text-2xl font-semibold">{events.filter((event) => event.status.startsWith("Signature")).length}</p></CardContent></Card></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
      <Card className="overflow-hidden shadow-none"><div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event, provider, type or reference..." /></div><select aria-label="Event status" className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Processed (demo)</option><option>Retry needed (demo)</option><option>Signature rejected (demo)</option></select></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr>{["Event / type", "Provider", "Received", "Attempts", "Status"].map((name) => <th key={name} className="px-3 py-3 font-medium whitespace-nowrap">{name}</th>)}</tr></thead><tbody className="divide-y">{filtered.map((event) => <tr key={event.id} className={selected?.id === event.id ? "bg-muted/40" : "hover:bg-muted/20"}><td className="px-3 py-3"><button className="text-left" onClick={() => setSelectedId(event.id)}><span className="block font-mono text-xs">{event.id}</span><span className="mt-1 block font-medium">{event.eventType}</span><span className="mt-1 block text-xs text-muted-foreground">{event.reference}</span></button></td><td className="px-3 py-3">{event.provider}</td><td className="px-3 py-3 whitespace-nowrap text-xs">{event.receivedAt}</td><td className="px-3 py-3 tabular-nums">{event.attempts}</td><td className="px-3 py-3"><Badge variant="outline" className={eventTone(event.status)}>{event.status}</Badge></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No events match this search.</div>}</div>
      </Card>
      {selected ? <Card className="h-fit shadow-none"><CardHeader><CardTitle className="text-base">Event details</CardTitle><p className="font-mono text-xs text-muted-foreground">{selected.id}</p></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between gap-2"><span className="text-sm text-muted-foreground">Processing</span><Badge variant="outline" className={eventTone(selected.status)}>{selected.status}</Badge></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Provider</p><p className="mt-1 font-medium">{selected.provider}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Attempts</p><p className="mt-1 font-medium">{selected.attempts}</p></div></div><div><p className="text-sm text-muted-foreground">Event type</p><p className="mt-1 font-mono text-sm">{selected.eventType}</p></div><div><p className="text-sm text-muted-foreground">Business reference</p><p className="mt-1 font-mono text-sm">{selected.reference}</p></div><div><p className="text-sm text-muted-foreground">Signature validation</p><p className="mt-1 text-sm">{selected.signature}</p></div><div className="rounded-lg bg-muted/40 p-3 text-sm leading-5">{selected.message}</div><Button className="w-full" variant="outline" onClick={() => replayPreview(selected)}><RotateCcw className="mr-2 size-4" />Preview retry (demo)</Button><p className="text-xs leading-5 text-muted-foreground">Replays must be idempotent and audited. The production action will be enabled only after an event worker and server-side permission checks exist.</p></CardContent></Card> : <Card className="min-h-48 shadow-none"><CardContent className="p-8 text-sm text-muted-foreground">Select an event to inspect processing details.</CardContent></Card>}
    </div>
  </section>;
}

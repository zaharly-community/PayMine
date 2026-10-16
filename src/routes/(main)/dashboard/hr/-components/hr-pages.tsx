import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarClock, CheckCircle2, Clock3, Copy, FileText, Plus, Printer, Search, Users, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Program = {
  id: string;
  name: string;
  audience: string;
  depositRate: number;
  withdrawalRate: number;
  handling: string;
  status: "Active" | "Draft";
};

type Shift = {
  id: string;
  name: string;
  start: string;
  end: string;
  days: string;
  supervisor: string;
  assistant: string;
  responseTarget: number;
};

type AttendanceStatus = "present" | "late" | "half" | "absent" | "leave" | "off" | "holiday" | "blank";

const PROGRAM_STORAGE = "ipaycash-hr-programs-v1";
const SHIFT_STORAGE = "ipaycash-hr-shifts-v1";
const ATTENDANCE_STORAGE = "ipaycash-hr-attendance-v1";
const PAYROLL_STORAGE = "ipaycash-hr-payroll-v1";

function readSaved<T,>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useSavedState<T,>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readSaved(key, fallback));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be disabled; the page remains usable for this session.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const initialPrograms: Program[] = [
  { id: "PRG-001", name: "Standard Distributor", audience: "All distributors", depositRate: 1, withdrawalRate: 0.5, handling: "Manual review · standard priority", status: "Active" },
  { id: "PRG-002", name: "High Volume", audience: "Selected distributors", depositRate: 1.25, withdrawalRate: 0.75, handling: "Fast lane · priority queue", status: "Active" },
  { id: "PRG-003", name: "New Distributor Trial", audience: "New distributors", depositRate: 0.5, withdrawalRate: 0.25, handling: "Extra verification · supervisor approval", status: "Draft" },
];

const teamMembers = [
  { name: "Amira Haddad", role: "Supervisor" },
  { name: "Daniel Okafor", role: "Supervisor" },
  { name: "Emma Rossi", role: "Assistant" },
  { name: "Grace Kim", role: "Assistant" },
  { name: "Hana Suzuki", role: "Supervisor" },
  { name: "Noah Patel", role: "Assistant" },
];

const initialShifts: Shift[] = [
  { id: "SH-01", name: "Morning", start: "07:00", end: "15:00", days: "Mon–Fri", supervisor: "Amira Haddad", assistant: "Emma Rossi", responseTarget: 10 },
  { id: "SH-02", name: "Evening", start: "15:00", end: "23:00", days: "Mon–Fri", supervisor: "Daniel Okafor", assistant: "Grace Kim", responseTarget: 10 },
  { id: "SH-03", name: "Night", start: "23:00", end: "07:00", days: "Daily", supervisor: "Hana Suzuki", assistant: "Noah Patel", responseTarget: 15 },
];

function PageHeading({ eyebrow = "Human Resources", title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Users }) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted"><Icon className="size-5 text-muted-foreground" /></div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgramsPage() {
  const [programs, setPrograms] = useSavedState<Program[]>(PROGRAM_STORAGE, initialPrograms);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("All distributors");
  const [depositRate, setDepositRate] = useState("1");
  const [withdrawalRate, setWithdrawalRate] = useState("0.5");
  const [handling, setHandling] = useState("Manual review · standard priority");

  const filtered = programs.filter((item) => [item.name, item.audience, item.handling].join(" ").toLowerCase().includes(query.toLowerCase()));

  const beginCreate = () => {
    setEditing(null); setName(""); setAudience("All distributors"); setDepositRate("1"); setWithdrawalRate("0.5"); setHandling("Manual review · standard priority"); setShowForm(true);
  };
  const beginEdit = (item: Program) => {
    setEditing(item.id); setName(item.name); setAudience(item.audience); setDepositRate(String(item.depositRate)); setWithdrawalRate(String(item.withdrawalRate)); setHandling(item.handling); setShowForm(true);
  };
  const saveProgram = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Program = { id: editing ?? `PRG-${Date.now().toString().slice(-6)}`, name: name.trim(), audience, depositRate: Math.max(0, Number(depositRate) || 0), withdrawalRate: Math.max(0, Number(withdrawalRate) || 0), handling: handling.trim(), status: "Active" };
    setPrograms((current) => editing ? current.map((item) => item.id === editing ? next : item) : [next, ...current]);
    setShowForm(false);
  };
  const duplicateProgram = (item: Program) => setPrograms((current) => [{ ...item, id: `PRG-${Date.now().toString().slice(-6)}`, name: `${item.name} copy`, status: "Draft" }, ...current]);

  return (
    <section className="space-y-6">
      <PageHeading title="Programs" description="Reusable commission and processing templates. Configure a policy once, then apply it to the relevant distributors instead of repeating the same setup." action={<Button onClick={beginCreate}><Plus className="mr-2 size-4" /> Create program</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total programs" value={String(programs.length)} note="Saved templates" icon={FileText} />
        <Stat label="Active programs" value={String(programs.filter((p) => p.status === "Active").length)} note="Available to assign" icon={CheckCircle2} />
        <Stat label="Commission models" value={String(new Set(programs.map((p) => `${p.depositRate}/${p.withdrawalRate}`)).size)} note="Distinct rate combinations" icon={Wallet} />
        <Stat label="Handling policies" value={String(new Set(programs.map((p) => p.handling)).size)} note="Reusable workflows" icon={CalendarClock} />
      </div>
      {showForm && (
        <Card className="shadow-none">
          <CardHeader><div><h2 className="text-sm font-semibold">{editing ? "Edit program" : "Create program"}</h2><p className="mt-1 text-xs text-muted-foreground">Set the default commission and the handling approach for this template.</p></div></CardHeader>
          <CardContent>
            <form onSubmit={saveProgram} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="grid gap-2"><Label>Program name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Preferred distributor" /></div>
              <div className="grid gap-2"><Label>Applies to</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}><option>All distributors</option><option>Selected distributors</option><option>New distributors</option><option>High-volume distributors</option></select></div>
              <div className="grid gap-2"><Label>Processing policy</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={handling} onChange={(e) => setHandling(e.target.value)}><option>Manual review · standard priority</option><option>Fast lane · priority queue</option><option>Extra verification · supervisor approval</option><option>Trusted distributor · simplified review</option></select></div>
              <div className="grid gap-2"><Label>Deposit commission (%)</Label><Input type="number" min="0" step="0.01" value={depositRate} onChange={(e) => setDepositRate(e.target.value)} required /></div>
              <div className="grid gap-2"><Label>Withdrawal commission (%)</Label><Input type="number" min="0" step="0.01" value={withdrawalRate} onChange={(e) => setWithdrawalRate(e.target.value)} required /></div>
              <div className="flex items-end gap-2"><Button type="submit">{editing ? "Save changes" : "Save program"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-none">
        <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Program templates</h2><p className="mt-1 text-xs text-muted-foreground">Edit, duplicate, or remove reusable distributor policies.</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programs…" className="pl-9" /></div></div></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Program</th><th className="px-4 py-3 font-medium">Audience</th><th className="px-4 py-3 font-medium">Deposit</th><th className="px-4 py-3 font-medium">Withdrawal</th><th className="px-4 py-3 font-medium">Handling policy</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody>{filtered.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-3"><div className="font-medium">{item.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{item.id}</div></td><td className="px-4 py-3 text-muted-foreground">{item.audience}</td><td className="px-4 py-3 tabular-nums">{item.depositRate}%</td><td className="px-4 py-3 tabular-nums">{item.withdrawalRate}%</td><td className="px-4 py-3"><span className="text-xs">{item.handling}</span></td><td className="px-4 py-3"><Badge variant={item.status === "Active" ? "default" : "outline"}>{item.status}</Badge></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => beginEdit(item)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => duplicateProgram(item)} title="Duplicate"><Copy className="size-4" /></Button><Button size="sm" variant="ghost" onClick={() => setPrograms((current) => current.filter((p) => p.id !== item.id))} className="text-destructive">Delete</Button></div></td></tr>)}</tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No programs match this search.</p>}
        </CardContent>
      </Card>
    </section>
  );
}

export function ShiftTimePage() {
  const [shifts, setShifts] = useSavedState<Shift[]>(SHIFT_STORAGE, initialShifts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("15:00");
  const [days, setDays] = useState("Mon–Fri");
  const [supervisor, setSupervisor] = useState(teamMembers[0].name);
  const [assistant, setAssistant] = useState(teamMembers[2].name);
  const [responseTarget, setResponseTarget] = useState("10");

  const saveShift = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShifts((current) => [...current, { id: `SH-${Date.now().toString().slice(-5)}`, name: name.trim(), start, end, days, supervisor, assistant, responseTarget: Math.max(1, Number(responseTarget) || 10) }]);
    setName(""); setShowForm(false);
  };

  return (
    <section className="space-y-6">
      <PageHeading title="Shift Time" description="Assign supervisors and assistants to coverage windows, with a named primary and backup for each shift." action={<Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-2 size-4" /> Add shift</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Shift templates" value={String(shifts.length)} note="Configured coverage windows" icon={CalendarClock} />
        <Stat label="Supervisors scheduled" value={String(new Set(shifts.map((s) => s.supervisor)).size)} note="Primary responsibility" icon={Users} />
        <Stat label="Assistants scheduled" value={String(new Set(shifts.map((s) => s.assistant)).size)} note="Backup / support coverage" icon={Users} />
        <Stat label="Coverage target" value="24/7" note="Across configured shifts" icon={Clock3} />
      </div>
      {showForm && <Card className="shadow-none"><CardHeader><div><h2 className="text-sm font-semibold">Add coverage shift</h2><p className="mt-1 text-xs text-muted-foreground">Every shift should have a primary supervisor and a backup assistant.</p></div></CardHeader><CardContent><form onSubmit={saveShift} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-2"><Label>Shift name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend daytime" required /></div>
        <div className="grid gap-2"><Label>Start time</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required /></div>
        <div className="grid gap-2"><Label>End time</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required /></div>
        <div className="grid gap-2"><Label>Days</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={days} onChange={(e) => setDays(e.target.value)}><option>Mon–Fri</option><option>Daily</option><option>Weekends</option><option>Custom rotation</option></select></div>
        <div className="grid gap-2"><Label>Primary supervisor</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={supervisor} onChange={(e) => setSupervisor(e.target.value)}>{teamMembers.filter((p) => p.role === "Supervisor").map((p) => <option key={p.name}>{p.name}</option>)}</select></div>
        <div className="grid gap-2"><Label>Backup assistant</Label><select className="h-9 rounded-md border bg-background px-3 text-sm" value={assistant} onChange={(e) => setAssistant(e.target.value)}>{teamMembers.filter((p) => p.role === "Assistant").map((p) => <option key={p.name}>{p.name}</option>)}</select></div>
        <div className="grid gap-2"><Label>Response target (minutes)</Label><Input type="number" min="1" max="120" value={responseTarget} onChange={(e) => setResponseTarget(e.target.value)} required /></div>
        <div className="flex items-end gap-2"><Button type="submit">Save shift</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
      </form></CardContent></Card>}
      <Card className="shadow-none">
        <CardHeader><h2 className="text-sm font-semibold">Coverage schedule</h2><p className="text-xs text-muted-foreground">Coverage ownership for each time window.</p></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Shift</th><th className="px-4 py-3 font-medium">Hours</th><th className="px-4 py-3 font-medium">Days</th><th className="px-4 py-3 font-medium">Supervisor</th><th className="px-4 py-3 font-medium">Assistant / backup</th><th className="px-4 py-3 font-medium">First response target</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{shifts.map((shift) => <tr key={shift.id} className="border-b last:border-0"><td className="px-4 py-3"><div className="font-medium">{shift.name}</div><div className="text-xs text-muted-foreground">{shift.id}</div></td><td className="whitespace-nowrap px-4 py-3 tabular-nums">{shift.start}–{shift.end}</td><td className="px-4 py-3">{shift.days}</td><td className="px-4 py-3">{shift.supervisor}<div className="text-xs text-muted-foreground">Primary</div></td><td className="px-4 py-3">{shift.assistant}<div className="text-xs text-muted-foreground">Backup</div></td><td className="px-4 py-3"><Badge variant="outline">{shift.responseTarget} min</Badge></td><td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setShifts((current) => current.filter((s) => s.id !== shift.id))}>Remove</Button></td></tr>)}</tbody></table></div>{shifts.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No shifts configured.</p>}</CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">A shift assigns responsibility; attendance below records whether the person actually showed up. A scheduled person should not be assumed present automatically.</p>
    </section>
  );
}

const attendancePeople = [
  { id: "EMP-001", name: "Amira Haddad", department: "Operations", role: "Supervisor" },
  { id: "EMP-002", name: "Daniel Okafor", department: "Operations", role: "Supervisor" },
  { id: "EMP-003", name: "Emma Rossi", department: "Support", role: "Assistant" },
  { id: "EMP-004", name: "Grace Kim", department: "Finance", role: "Assistant" },
  { id: "EMP-005", name: "Hana Suzuki", department: "Operations", role: "Supervisor" },
  { id: "EMP-006", name: "Noah Patel", department: "Support", role: "Assistant" },
];

function statusForDay(personIndex: number, day: number, month: string): AttendanceStatus {
  const date = new Date(`${month}-${String(day).padStart(2, "0")}T12:00:00`);
  const current = new Date();
  if (date > new Date(current.getFullYear(), current.getMonth(), current.getDate())) return "blank";
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 6) return "off";
  const seed = day + personIndex * 3;
  if (seed % 17 === 0) return "absent";
  if (seed % 7 === 0) return "late";
  if (seed % 23 === 0) return "leave";
  if (seed % 29 === 0) return "half";
  return "present";
}

const statusShort: Record<AttendanceStatus, string> = { present: "P", late: "L", half: "H", absent: "A", leave: "V", off: "–", holiday: "•", blank: "" };
const statusLabel: Record<AttendanceStatus, string> = { present: "Present", late: "Late", half: "Half day", absent: "Absent", leave: "On leave", off: "Day off", holiday: "Holiday", blank: "Not recorded" };
const statusClasses: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  late: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  half: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  absent: "bg-red-500/10 text-red-700 dark:text-red-300",
  leave: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  off: "bg-muted text-muted-foreground",
  holiday: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  blank: "text-muted-foreground",
};

export function AttendancePage() {
  const today = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [records, setRecords] = useSavedState<Record<string, AttendanceStatus>>(ATTENDANCE_STORAGE, {});
  const monthDate = new Date(`${month}-01T12:00:00`);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, index) => index + 1), [daysInMonth]);
  const keyFor = (employeeId: string, day: number) => `${employeeId}:${month}-${String(day).padStart(2, "0")}`;
  const getStatus = (personIndex: number, day: number): AttendanceStatus => records[keyFor(attendancePeople[personIndex].id, day)] ?? statusForDay(personIndex, day, month);
  const filteredPeople = attendancePeople.filter((person) => (department === "All departments" || person.department === department) && `${person.name} ${person.id} ${person.role}`.toLowerCase().includes(query.toLowerCase()));
  const isCurrentMonth = month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const todayDay = isCurrentMonth ? today.getDate() : -1;
  const todayStatuses = attendancePeople.map((_, i) => todayDay > 0 ? getStatus(i, todayDay) : "blank");
  const presentToday = todayStatuses.filter((status) => status === "present" || status === "late").length;
  const presentDays = attendancePeople.reduce((sum, _, i) => sum + days.filter((day) => ["present", "late", "half"].includes(getStatus(i, day))).length, 0);
  const absentDays = attendancePeople.reduce((sum, _, i) => sum + days.filter((day) => getStatus(i, day) === "absent").length, 0);
  const leaveDays = attendancePeople.reduce((sum, _, i) => sum + days.filter((day) => getStatus(i, day) === "leave").length, 0);
  const advanceStatus = (status: AttendanceStatus): AttendanceStatus => {
    const cycle: AttendanceStatus[] = ["present", "late", "half", "absent", "leave", "present"];
    const index = cycle.indexOf(status);
    return cycle[(index < 0 ? 0 : index + 1) % cycle.length];
  };

  return (
    <section className="space-y-6">
      <PageHeading title="Attendance" description="Monthly attendance overview for supervisors and assistants. Select a day cell to correct the recorded status." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Present today" value={todayDay > 0 ? `${Math.round((presentToday / attendancePeople.length) * 100)}%` : "—"} note={`${presentToday} of ${attendancePeople.length} team members`} icon={CheckCircle2} />
        <Stat label="Present days" value={String(presentDays)} note="Present, late, and half days" icon={CalendarClock} />
        <Stat label="Absent days" value={String(absentDays)} note={monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} icon={Users} />
        <Stat label="On leave" value={String(leaveDays)} note="Recorded leave days this month" icon={CalendarClock} />
      </div>
      <Card className="shadow-none">
        <CardHeader><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-sm font-semibold">Monthly attendance</h2><p className="mt-1 text-xs text-muted-foreground">P present · L late · H half day · A absent · V leave · – day off</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9 sm:w-60" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or employee code" /></div><select className="h-9 rounded-md border bg-background px-3 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}><option>All departments</option><option>Operations</option><option>Support</option><option>Finance</option></select><Input className="sm:w-40" type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} /></div>
        </div></CardHeader>
        <CardContent className="p-0">
          <div className="max-w-full overflow-auto">
            <table className="min-w-max border-collapse text-center text-xs">
              <thead><tr className="border-y bg-muted/30 text-muted-foreground"><th className="sticky left-0 z-20 min-w-56 bg-muted/95 px-4 py-3 text-left font-medium">Person</th>{days.map((day) => { const date = new Date(`${month}-${String(day).padStart(2, "0")}T12:00:00`); const off = date.getDay() === 0 || date.getDay() === 6; return <th key={day} className={`min-w-8 px-1 py-2 font-normal ${off ? "bg-muted/60" : ""} ${todayDay === day ? "text-primary" : ""}`} title={date.toLocaleDateString()}><div className="font-semibold">{day}</div><div>{date.toLocaleDateString("en-US", { weekday: "narrow" })}</div></th>; })}<th className="min-w-10 px-2 font-semibold text-emerald-700">P</th><th className="min-w-10 px-2 font-semibold text-amber-700">L</th><th className="min-w-10 px-2 font-semibold text-red-700">A</th></tr></thead>
              <tbody>{filteredPeople.map((person) => { const personIndex = attendancePeople.findIndex((p) => p.id === person.id); const counts = { present: 0, late: 0, absent: 0 }; return <tr key={person.id} className="border-b last:border-0"><td className="sticky left-0 z-10 bg-background px-4 py-3 text-left"><div className="font-medium">{person.name}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{person.role} · {person.department}</div></td>{days.map((day) => { const status = getStatus(personIndex, day); if (status === "present") counts.present++; if (status === "late") counts.late++; if (status === "absent") counts.absent++; const dayDate = new Date(`${month}-${String(day).padStart(2, "0")}T12:00:00`); const key = keyFor(person.id, day); return <td key={day} className={`p-0.5 ${dayDate.getDay() === 0 || dayDate.getDay() === 6 ? "bg-muted/20" : ""}`}><button type="button" aria-label={`${person.name}, ${dayDate.toDateString()}, ${statusLabel[status]}`} title={statusLabel[status]} disabled={status === "off" || status === "blank" || status === "holiday"} onClick={() => setRecords((current) => ({ ...current, [key]: advanceStatus(status) }))} className={`flex size-7 items-center justify-center rounded font-semibold transition-colors disabled:cursor-default ${statusClasses[status]}`}>{statusShort[status]}</button></td>; })}<td className="px-2 font-medium text-emerald-700">{counts.present}</td><td className="px-2 font-medium text-amber-700">{counts.late}</td><td className="px-2 font-medium text-red-700">{counts.absent}</td></tr>; })}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t p-4 text-xs text-muted-foreground">{(["present", "late", "half", "absent", "leave", "holiday", "off"] as AttendanceStatus[]).map((status) => <span key={status} className="inline-flex items-center gap-1.5"><span className={`flex size-5 items-center justify-center rounded text-[10px] font-semibold ${statusClasses[status]}`}>{statusShort[status]}</span>{statusLabel[status]}</span>)}<span className="ml-auto">Click a recorded day to cycle status.</span></div>
        </CardContent>
      </Card>
    </section>
  );
}

type PayrollRequest = { id: string; date: string; type: "Deposit" | "Withdrawal"; method: string; amount: number; rate: number; status: "Completed" | "Reversed" };
type Invoice = { id: string; person: string; role: "Supervisor" | "Assistant"; period: string; salary: number | null; status: "Ready" | "Paid"; requests: PayrollRequest[] };

const initialInvoices: Invoice[] = [
  { id: "PAY-2026-101", person: "Amira Haddad", role: "Supervisor", period: "October 2026", salary: 850, status: "Ready", requests: [{ id: "DEP-48219", date: "Oct 02, 2026", type: "Deposit", method: "Flouci", amount: 2400, rate: 1 }, { id: "DEP-48254", date: "Oct 04, 2026", type: "Deposit", method: "D17", amount: 1800, rate: 1 }, { id: "WDR-19028", date: "Oct 08, 2026", type: "Withdrawal", method: "Flouci", amount: 950, rate: 0.5 }, { id: "DEP-48301", date: "Oct 12, 2026", type: "Deposit", method: "Kashy", amount: 3100, rate: 1 }] },
  { id: "PAY-2026-102", person: "Daniel Okafor", role: "Supervisor", period: "October 2026", salary: null, status: "Ready", requests: [{ id: "DEP-48700", date: "Oct 03, 2026", type: "Deposit", method: "D17", amount: 1400, rate: 1.1 }, { id: "WDR-19112", date: "Oct 07, 2026", type: "Withdrawal", method: "Kashy", amount: 700, rate: 0.6 }, { id: "DEP-48812", date: "Oct 13, 2026", type: "Deposit", method: "Flouci", amount: 2200, rate: 1.1 }] },
  { id: "PAY-2026-103", person: "Emma Rossi", role: "Assistant", period: "October 2026", salary: 420, status: "Ready", requests: [{ id: "DEP-48377", date: "Oct 05, 2026", type: "Deposit", method: "Flouci", amount: 900, rate: 0.4 }, { id: "DEP-48601", date: "Oct 09, 2026", type: "Deposit", method: "D17", amount: 1250, rate: 0.4 }, { id: "WDR-19093", date: "Oct 11, 2026", type: "Withdrawal", method: "Kashy", amount: 500, rate: 0.25 }] },
  { id: "PAY-2026-104", person: "Grace Kim", role: "Assistant", period: "October 2026", salary: null, status: "Paid", requests: [{ id: "DEP-48011", date: "Oct 01, 2026", type: "Deposit", method: "D17", amount: 1700, rate: 0.5 }, { id: "WDR-18812", date: "Oct 06, 2026", type: "Withdrawal", method: "Flouci", amount: 800, rate: 0.3 }] },
];

const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const requestCommission = (request: PayrollRequest) => request.status === "Reversed" ? 0 : request.amount * request.rate / 100;

export function PayrollPage() {
  const [invoices, setInvoices] = useSavedState<Invoice[]>(PAYROLL_STORAGE, initialInvoices);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = invoices.find((invoice) => invoice.id === selectedId);
  const totalCommission = (invoice: Invoice) => invoice.requests.reduce((sum, request) => sum + requestCommission(request), 0);
  const payable = (invoice: Invoice) => totalCommission(invoice) + (invoice.salary ?? 0);
  const filtered = invoices.filter((invoice) => `${invoice.person} ${invoice.id} ${invoice.role}`.toLowerCase().includes(query.toLowerCase()));
  const totalReady = invoices.filter((invoice) => invoice.status === "Ready").reduce((sum, invoice) => sum + payable(invoice), 0);
  const totalPaid = invoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + payable(invoice), 0);
  const totalRequests = invoices.reduce((sum, invoice) => sum + invoice.requests.filter((request) => request.status === "Completed").length, 0);

  return (
    <section className="space-y-6">
      <PageHeading title="Payroll" description="Generate a detailed settlement invoice for each supervisor or assistant, including every processed request, earned commission, and any fixed salary." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ready to pay" value={money(totalReady)} note="Outstanding team payouts" icon={Wallet} />
        <Stat label="Commission earned" value={money(invoices.reduce((sum, invoice) => sum + totalCommission(invoice), 0))} note="From completed requests" icon={FileText} />
        <Stat label="Fixed salaries" value={money(invoices.reduce((sum, invoice) => sum + (invoice.salary ?? 0), 0))} note="Only where configured" icon={Users} />
        <Stat label="Processed requests" value={String(totalRequests)} note="Included in these sample invoices" icon={CheckCircle2} />
      </div>
      <Card className="shadow-none">
        <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Team payroll invoices</h2><p className="mt-1 text-xs text-muted-foreground">Open an invoice to review the source transactions and exact calculation.</p></div><Input className="sm:w-64" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search person or invoice…" /></div></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Invoice / Person</th><th className="px-4 py-3 font-medium">Period</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Requests</th><th className="px-4 py-3 font-medium">Commission</th><th className="px-4 py-3 font-medium">Fixed salary</th><th className="px-4 py-3 font-medium">Net payable</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Invoice</th></tr></thead><tbody>{filtered.map((invoice) => <tr key={invoice.id} className="border-b last:border-0"><td className="px-4 py-3"><div className="font-medium">{invoice.person}</div><div className="mt-0.5 text-xs text-muted-foreground">{invoice.id}</div></td><td className="whitespace-nowrap px-4 py-3">{invoice.period}</td><td className="px-4 py-3">{invoice.role}</td><td className="px-4 py-3">{invoice.requests.filter((r) => r.status === "Completed").length}</td><td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(totalCommission(invoice))}</td><td className="whitespace-nowrap px-4 py-3 tabular-nums">{invoice.salary == null ? <span className="text-muted-foreground">Not assigned</span> : money(invoice.salary)}</td><td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">{money(payable(invoice))}</td><td className="px-4 py-3"><Badge variant={invoice.status === "Paid" ? "default" : "outline"}>{invoice.status}</Badge></td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setSelectedId(invoice.id)}><FileText className="mr-2 size-4" />Open invoice</Button></td></tr>)}</tbody></table></div></CardContent>
      </Card>
      {selected && <Card className="shadow-none" id="payroll-invoice">
        <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payroll invoice</p><h2 className="mt-1 text-lg font-semibold">{selected.person}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.id} · {selected.role} · {selected.period}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 size-4" /> Print invoice</Button><Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button></div></div></CardHeader>
        <CardContent className="space-y-5">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground"><th className="px-3 py-3 font-medium">Request ID</th><th className="px-3 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Type</th><th className="px-3 py-3 font-medium">Method</th><th className="px-3 py-3 text-right font-medium">Processed amount</th><th className="px-3 py-3 text-right font-medium">Rate</th><th className="px-3 py-3 text-right font-medium">Commission</th><th className="px-3 py-3 font-medium">Status</th></tr></thead><tbody>{selected.requests.map((request) => <tr key={request.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{request.id}</td><td className="whitespace-nowrap px-3 py-3">{request.date}</td><td className="px-3 py-3">{request.type}</td><td className="px-3 py-3">{request.method}</td><td className="px-3 py-3 text-right tabular-nums">{money(request.amount)}</td><td className="px-3 py-3 text-right tabular-nums">{request.rate}%</td><td className="px-3 py-3 text-right font-medium tabular-nums">{money(requestCommission(request))}</td><td className="px-3 py-3"><Badge variant={request.status === "Completed" ? "outline" : "destructive"}>{request.status}</Badge></td></tr>)}</tbody></table></div>
          <div className="ml-auto max-w-sm space-y-3 rounded-lg border p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Completed request commissions</span><span className="font-medium tabular-nums">{money(totalCommission(selected))}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Fixed salary</span><span className="font-medium tabular-nums">{selected.salary == null ? "Not assigned" : money(selected.salary)}</span></div><div className="flex justify-between gap-4 border-t pt-3 text-base"><span className="font-semibold">Net payable</span><span className="font-semibold tabular-nums">{money(payable(selected))}</span></div><p className="text-xs text-muted-foreground">Reversed requests earn no commission. Amounts are demo data for the selected payroll period.</p></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">Invoice status: <span className="font-medium text-foreground">{selected.status}</span></p><div className="flex gap-2">{selected.status === "Ready" ? <Button onClick={() => setInvoices((current) => current.map((invoice) => invoice.id === selected.id ? { ...invoice, status: "Paid" } : invoice))}><CheckCircle2 className="mr-2 size-4" /> Mark as paid</Button> : <Badge>Payment recorded</Badge>}</div></div>
        </CardContent>
      </Card>}
      <div className="text-xs text-muted-foreground">Payroll in this screen is a front-end prototype with sample transactions. Final invoices should use approved transaction records, the distributor/supervisor program that was active when each request was processed, and the configured salary contract.</div>
    </section>
  );
}

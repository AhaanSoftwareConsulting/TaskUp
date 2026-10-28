import type { User } from "../../types/user.Types";

type Person = Pick<User, "id" | "full_name">;
export interface HoursSession { id: number; user: Person; startedAt: number; endedAt: number; duration: number }
export interface LegacyDay { user: Person; date: string; duration: number }
export interface RunningTimer { user: Person; startedAt: number }
export interface HoursReport { sessions: HoursSession[]; legacy: LegacyDay[]; running: RunningTimer[]; viewerSeesAll: boolean }
export interface HoursRow {
  key: string; dayKey: string; user: Person; duration: number;
  startedAt: number | null; endedAt: number | null; status: "Completed" | "Running" | "Logged";
}
export type Granularity = "daily" | "weekly" | "monthly";
export interface Bucket { key: string; label: string; ms: number }

const pad = (n: number) => String(n).padStart(2, "0");
export const dayKeyOf = (ms: number) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const parseDay = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };

export const fmtHours = (ms: number) => { const h = Number((ms / 3600000).toFixed(1)); return `${h.toFixed(1)} ${h === 1 ? "hr" : "hrs"}`; };
export const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const fmtDay = (key: string) => parseDay(key).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtWeekday = (key: string) => parseDay(key).toLocaleDateString("en-US", { weekday: "short" });
export const fmtRange = (r: HoursRow) =>
  r.startedAt === null ? "—"
  : r.endedAt === null ? `${fmtTime(r.startedAt)} – now`
  : `${fmtTime(r.startedAt)} – ${fmtTime(r.endedAt)}${dayKeyOf(r.endedAt) !== dayKeyOf(r.startedAt) ? " (next day)" : ""}`;

export function buildRows(report: HoursReport, now: number): HoursRow[] {
  const rows: HoursRow[] = [
    ...report.sessions.map((s): HoursRow => ({ key: `s${s.id}`, dayKey: dayKeyOf(s.startedAt), user: s.user, duration: s.duration, startedAt: s.startedAt, endedAt: s.endedAt, status: "Completed" })),
    ...report.legacy.map((l, i): HoursRow => ({ key: `l${i}`, dayKey: l.date, user: l.user, duration: l.duration, startedAt: null, endedAt: null, status: "Logged" })),
    ...report.running.map((r, i): HoursRow => ({ key: `r${i}`, dayKey: dayKeyOf(r.startedAt), user: r.user, duration: Math.max(0, now - r.startedAt), startedAt: r.startedAt, endedAt: null, status: "Running" })),
  ];
  return rows.sort((a, b) => (a.dayKey === b.dayKey ? (a.startedAt ?? 0) - (b.startedAt ?? 0) : a.dayKey < b.dayKey ? -1 : 1));
}

const weekStart = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }; // Monday
const keyFor = (g: Granularity, d: Date) =>
  g === "monthly" ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : dayKeyOf((g === "weekly" ? weekStart(d) : d).getTime());
const labelFor = (g: Granularity, key: string) =>
  g === "monthly" ? parseDay(`${key}-01`).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
  : `${g === "weekly" ? "Wk " : ""}${parseDay(key).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;

export function buildBuckets(rows: HoursRow[], from: string, to: string, g: Granularity): Bucket[] {
  if (!from || !to || from > to) return [];
  const sums = new Map<string, number>();
  rows.forEach((r) => { const k = keyFor(g, parseDay(r.dayKey)); sums.set(k, (sums.get(k) || 0) + r.duration); });
  const keys: string[] = [];
  const end = parseDay(to);
  for (let d = parseDay(from), i = 0; d <= end && i < 400; d.setDate(d.getDate() + 1), i++) {
    const k = keyFor(g, d);
    if (keys[keys.length - 1] !== k && !keys.includes(k)) keys.push(k);
  }
  return keys.map((key) => ({ key, label: labelFor(g, key), ms: sums.get(key) || 0 }));
}

export function toCsv(rows: HoursRow[]): string {
  // a leading = + - @ would be run as a formula in Excel, so neutralise it
  const cell = (v: string | number) => { let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
  const lines = [["Date", "Team Member", "Hours", "Start", "End", "Status"].map(cell).join(",")];
  rows.forEach((r) => lines.push([
    r.dayKey, r.user.full_name ?? "Unknown", (r.duration / 3600000).toFixed(2),
    r.startedAt ? fmtTime(r.startedAt) : "", r.endedAt ? fmtTime(r.endedAt) : "", r.status,
  ].map(cell).join(",")));
  return lines.join("\r\n");
}
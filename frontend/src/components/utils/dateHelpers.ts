export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export const toDateInput = (d?: string | Date | null) => {
  if (!d) return "";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "";
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

export const formatShort = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

export const formatLong = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export type DueTone = "red" | "amber" | "gray";
export function dueInfo(d?: string | Date | null, done = false): { label: string; tone: DueTone } | null {
  if (!d || done) return null;
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - startOfToday().getTime()) / 86400000);
  if (diff < 0) return { label: `${-diff}d overdue`, tone: "red" };
  if (diff === 0) return { label: "Due today", tone: "amber" };
  if (diff === 1) return { label: "Tomorrow", tone: "amber" };
  if (diff < 7) return { label: `In ${diff}d`, tone: "gray" };
  return { label: formatShort(d), tone: "gray" };
}
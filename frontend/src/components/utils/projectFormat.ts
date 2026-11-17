const HOUR = 1000 * 60 * 60;

export const msToHours = (ms = 0) => Math.round((ms / HOUR) * 10) / 10;

export const orDash = (v?: string | null) => (v && v.trim() ? v : "—");

export const formatDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

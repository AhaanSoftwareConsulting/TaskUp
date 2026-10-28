import { Fragment } from "react";
import { Avatar } from "../Task/CommentComposer";
import { fmtDay, fmtHours, fmtRange, fmtWeekday, type HoursRow } from "./hoursData";

const PILL: Record<HoursRow["status"], string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Running: "bg-blue-50 text-blue-700",
  Logged: "bg-gray-100 text-gray-600",
};

export const HoursTable = ({ rows }: { rows: HoursRow[] }) => {
  const groups = new Map<string, HoursRow[]>();
  rows.forEach((r) => groups.set(r.dayKey, [...(groups.get(r.dayKey) ?? []), r]));
  const days = [...groups.keys()].sort().reverse(); // newest day first
  const grand = rows.reduce((s, r) => s + r.duration, 0);

  if (rows.length === 0) return <p className="rounded-xl bg-gray-50 py-12 text-center text-sm italic text-gray-400">No time logged in this period.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500">
            {["Date", "Team Member", "Hours Logged", "Time Range", "Overall Status"].map((h) => <th key={h} className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const list = groups.get(day)!;
            return (
              <Fragment key={day}>
                {list.map((r) => (
                  <tr key={r.key} className="border-b border-gray-100">
                    <td className="px-4 py-4"><p className="font-medium text-gray-800">{fmtDay(day)}</p><p className="text-[11px] text-gray-400">({fmtWeekday(day)})</p></td>
                    <td className="px-4 py-4"><span className="flex items-center gap-2 text-gray-700"><Avatar name={r.user.full_name} size={28} />{r.user.full_name ?? "Unknown"}</span></td>
                    <td className="px-4 py-4 font-bold text-gray-900">{fmtHours(r.duration)}</td>
                    <td className="px-4 py-4 text-gray-500">{fmtRange(r)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PILL[r.status]}`}>
                        {r.status === "Running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />}{r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50/70">
                  <td colSpan={2} className="rounded-l-lg px-4 py-3 text-xs font-semibold text-gray-600">Total for {fmtDay(day)}</td>
                  <td colSpan={3} className="rounded-r-lg px-4 py-3 text-sm font-bold text-gray-900">{fmtHours(list.reduce((s, r) => s + r.duration, 0))}</td>
                </tr>
              </Fragment>
            );
          })}
          {days.length > 1 && (
            <tr><td colSpan={2} className="px-4 pt-4 text-xs font-bold uppercase text-gray-400">Grand total</td><td colSpan={3} className="px-4 pt-4 text-base font-black text-gray-900">{fmtHours(grand)}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
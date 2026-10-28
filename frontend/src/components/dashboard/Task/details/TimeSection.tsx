import { ClockIcon, TimerIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { Task } from "../../../types/board.Types";
import { Avatar } from "../CommentComposer";

const hrs = (ms: number) => (ms / 3600000).toFixed(1);

export const TimeSection = ({ task }: { task: Task }) => {
  const tm = task.timeManagement;
  const goalMs = (tm?.estimated_time || 0) * 3600000;
  const loggedMs = tm?.total_logged_time || 0;
  const pct = goalMs > 0 ? Math.min((loggedMs / goalMs) * 100, 100) : 0;
  const over = goalMs > 0 && loggedMs > goalMs ? loggedMs - goalMs : 0;
  const running = tm?.activeTimers ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400"><ClockIcon size={16} /> Time</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><p className="text-[10px] font-bold uppercase text-gray-400">Estimate</p><p className="text-xl font-black text-gray-800">{tm?.estimated_time || 0}<span className="ml-1 text-xs font-normal text-gray-400">h</span></p></div>
        <div><p className="text-[10px] font-bold uppercase text-gray-400">Logged</p><p className="text-xl font-black text-emerald-600">{hrs(loggedMs)}<span className="ml-1 text-xs font-normal text-gray-400">h</span></p></div>
        <div>
          <p className="text-[10px] font-bold uppercase text-gray-400">Overtime</p>
          {over > 0
            ? <p className="flex items-center gap-1 text-xl font-black text-rose-600"><WarningCircleIcon size={18} weight="fill" />+{hrs(over)}<span className="text-xs font-normal">h</span></p>
            : <p className="text-sm font-semibold text-gray-300">None</p>}
        </div>
      </div>
      {goalMs > 0 && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full transition-all duration-700 ${over > 0 ? "bg-rose-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-right text-[11px] font-semibold text-gray-400">{over > 0 ? "Estimate exceeded" : `${pct.toFixed(0)}% of estimate`}</p>
        </div>
      )}
      {running.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {running.map((r) => (
            <span key={r.user.id} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 py-0.5 pl-1 pr-3 text-xs font-medium text-emerald-700">
              <Avatar name={r.user.full_name} size={20} /><TimerIcon size={12} weight="fill" />{r.user.full_name} is tracking
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
import { Link } from "react-router-dom";
import { ArrowSquareOutIcon, ClockIcon, LockSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useAppSelector } from "../../redux/app/hook";
import { getColumnColor } from "../../utils/columnColors";
import { formatLong } from "../../utils/dateHelpers";
import { Avatar } from "./CommentComposer";

const hrs = (ms = 0) => (ms / 3600000).toFixed(1);

export const TaskTimePanel = ({ taskId, onClose }: { taskId: string | null; onClose: () => void }) => {
  const task = useAppSelector((s) => s.task.task.find((t) => t.id === taskId));
  const me = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);
  if (!task || !me) return null;

  const staff = me.role === "manager" || me.role === "ceo";
  const status = columns[task.board_id]?.find((c) => c.id === task.column_id)?.name ?? "";
  const color = getColumnColor(status);
  const rows = (task.timeManagement?.byUser ?? []).filter((e) => staff || e.user?.id === me.id);
  const total = rows.reduce((s, e) => s + e.duration, 0);
  const est = task.timeManagement?.estimated_time || 0;
  const logged = task.timeManagement?.total_logged_time || 0;
  const pct = est > 0 ? Math.min((logged / (est * 3600000)) * 100, 100) : 0;

  return (
    <aside className="hidden w-[35%] min-w-[320px] flex-col overflow-y-auto border-l border-gray-100 bg-gray-50/40 p-5 md:flex">
      <button onClick={onClose} className="mb-3 flex items-center gap-1 self-start text-xs text-gray-400 hover:text-black"><XIcon size={12} /> Close</button>
      <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Link to={`/${me.role}/dashboard/tasks/${task.id}`} className="group flex items-start gap-2">
          <h2 className="text-lg font-bold leading-snug text-gray-900 group-hover:text-blue-600">{task.title}</h2>
          <ArrowSquareOutIcon size={16} className="mt-1 shrink-0 text-gray-300 group-hover:text-blue-500" />
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase">
          <span className={`rounded-full px-2 py-0.5 ${color.bg} ${color.text}`}>{status || "No status"}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{task.priority}</span>
          {task.closed_at && <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-white"><LockSimpleIcon size={10} weight="bold" />Closed</span>}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-400">Project</dt><dd className="font-medium text-gray-700">{boards.find((b) => b.id === task.board_id)?.name}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-400">Due</dt><dd className="font-medium text-gray-700">{formatLong(task.due_date)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-400">Created by</dt><dd className="font-medium text-gray-700">{task.creator?.full_name ?? "—"}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-gray-400">Assignees</dt>
            <dd className="flex -space-x-2">{task.assignedTo.map((u) => <div key={u.id} title={u.full_name} className="rounded-full border-2 border-white"><Avatar name={u.full_name} size={24} /></div>)}</dd>
          </div>
        </dl>

        <div>
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
            <span>{hrs(logged)}h logged</span><span>{est ? `${est}h estimate` : "No estimate"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ClockIcon size={14} weight="bold" />{staff ? "Time by member" : "My time"}</h4>
          {rows.length === 0 ? <p className="text-sm italic text-gray-400">No time logged yet.</p> : (
            <div className="space-y-3">
              {rows.map((e, i) => (
                <div key={e.user?.id ?? i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-700"><Avatar name={e.user?.full_name} size={24} />{e.user?.full_name ?? "Unknown"}</span>
                  <span className="text-sm font-bold text-slate-700">{hrs(e.duration)} h</span>
                </div>
              ))}
              {rows.length > 1 && <div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-xs font-bold uppercase text-slate-400">Total</span><span className="text-sm font-black text-slate-800">{hrs(total)} h</span></div>}
            </div>
          )}
        </div>

       <div className="mt-auto grid gap-2">
  <Link to={`/${me.role}/dashboard/tasks/${task.id}/hours`} className="rounded-xl bg-black py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800">Working hours report</Link>
  <Link to={`/${me.role}/dashboard/tasks/${task.id}`} className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50">Open full task</Link>
</div>
      </div>
    </aside>
  );
};